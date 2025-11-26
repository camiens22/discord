// Global state
let currentUser = null;
let currentChannel = null;
let messagePollingInterval = null;
let allDMs = [];
let allGuilds = [];
let unreadCounts = {}; // Track unread message counts per channel
let lastSeenMessages = {}; // Track last seen message ID per channel
let dmLastMessageTime = {}; // Track last message time for sorting
let dmSortDirty = false; // Flag to avoid re-sorting DM list unnecessarily

// Check token and load data on page load
window.addEventListener('DOMContentLoaded', async () => {
    try {
        // Add timeout for slow server wake-up (Render free tier)
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const response = await fetch('/api/user', { signal: controller.signal });
        clearTimeout(timeout);

        if (response.ok) {
            currentUser = await response.json();
            loadUserInfo();
            loadDMs();
            loadGuilds();
            setupSearchListeners();
            // Start background polling for notifications
            setInterval(pollAllChannelsForNotifications, 10000); // Every 10 seconds
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to authenticate. Check your Discord token in .env file');
        }
    } catch (error) {
        console.error('Init error:', error);
        if (error.name === 'AbortError') {
            showError('Server is waking up... Please wait 30 seconds and refresh the page.');
        } else {
            showError('Failed to connect to server. Make sure the server is running.');
        }
    }
});

// Setup search listeners
function setupSearchListeners() {
    const dmSearch = document.getElementById('dm-search');
    const serverSearch = document.getElementById('server-search');

    if (dmSearch) {
        dmSearch.addEventListener('input', (e) => filterDMs(e.target.value));
    }

    if (serverSearch) {
        serverSearch.addEventListener('input', (e) => filterServers(e.target.value));
    }
}

// Close a DM
async function closeDM(channelId, event) {
    event.stopPropagation(); // Prevent selecting the DM when clicking X

    try {
        await fetch(`/api/dms/${channelId}`, {
            method: 'DELETE'
        });

        // Remove from allDMs array
        allDMs = allDMs.filter(dm => dm.id !== channelId);

        // Clear from tracking objects
        delete unreadCounts[channelId];
        delete lastSeenMessages[channelId];
        delete dmLastMessageTime[channelId];

        // Refresh DM list
        filterDMs(document.getElementById('dm-search').value || '');

        // If this was the current channel, clear it
        if (currentChannel && currentChannel.id === channelId) {
            currentChannel = null;
            if (messagePollingInterval) {
                clearInterval(messagePollingInterval);
            }
            document.getElementById('messages').innerHTML = '<div class="no-channel">Select a DM or channel to start chatting</div>';
            document.getElementById('channel-name').textContent = 'Select a DM or channel';
            document.getElementById('message-box').disabled = true;
            document.getElementById('send-btn').disabled = true;
            document.getElementById('attach-btn').disabled = true;
        }
    } catch (error) {
        console.error('Failed to close DM:', error);
        alert('Failed to close DM');
    }
}

// Filter DMs based on search
function filterDMs(searchTerm) {
    const term = searchTerm.toLowerCase();
    const dmsContainer = document.getElementById('dms');
    dmsContainer.innerHTML = '';

    const filtered = allDMs.filter(dm => {
        let displayName = 'Unknown';
        if (dm.type === 1 && dm.recipients && dm.recipients[0]) {
            displayName = dm.recipients[0].global_name || dm.recipients[0].username;
        } else if (dm.name) {
            displayName = dm.name;
        }
        return displayName.toLowerCase().includes(term);
    });

    // Sort by most recent message time
    filtered.sort((a, b) => {
        const timeA = dmLastMessageTime[a.id] || 0;
        const timeB = dmLastMessageTime[b.id] || 0;
        return timeB - timeA; // Most recent first
    });

    if (filtered.length === 0) {
        dmsContainer.innerHTML = '<div class="no-items">No matching DMs</div>';
        return;
    }

    filtered.forEach(dm => {
        const dmDiv = document.createElement('div');
        dmDiv.className = 'dm-item';
        dmDiv.dataset.channelId = dm.id;

        let displayName = 'Unknown';
        if (dm.type === 1 && dm.recipients && dm.recipients[0]) {
            // Use global_name (display name) if available, otherwise username
            displayName = dm.recipients[0].global_name || dm.recipients[0].username;
        } else if (dm.name) {
            displayName = dm.name;
        }

        dmDiv.innerHTML = `
            <span class="item-name">${displayName}</span>
            <span class="dm-actions">
                <span class="notification-badge hidden" data-channel="${dm.id}">0</span>
                <button class="close-dm-btn" onclick="closeDM('${dm.id}', event)" title="Close DM">×</button>
            </span>
        `;
        dmDiv.onclick = () => selectDM(dm, displayName);
        dmsContainer.appendChild(dmDiv);
    });

    dmSortDirty = false; // Mark as clean after sorting
}

// Filter servers based on search
function filterServers(searchTerm) {
    const term = searchTerm.toLowerCase();
    const serversContainer = document.getElementById('servers');
    serversContainer.innerHTML = '';

    const filtered = allGuilds.filter(guild =>
        guild.name.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
        serversContainer.innerHTML = '<div class="no-items">No matching servers</div>';
        return;
    }

    filtered.forEach(guild => {
        const serverDiv = document.createElement('div');
        serverDiv.className = 'server-item';
        serverDiv.textContent = guild.name;
        serverDiv.onclick = () => selectGuild(guild);
        serversContainer.appendChild(serverDiv);
    });
}

// Show error screen
function showError(message) {
    document.getElementById('chat-screen').classList.add('hidden');
    document.getElementById('error-screen').classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
}

// Load user info
function loadUserInfo() {
    if (!currentUser) return;

    const avatarUrl = currentUser.avatar
        ? `https://cdn.discordapp.com/avatars/${currentUser.id}/${currentUser.avatar}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    document.getElementById('user-avatar').src = avatarUrl;
    document.getElementById('user-name').textContent = currentUser.username;
}

// Load DMs
async function loadDMs() {
    try {
        const response = await fetch('/api/dms');
        const dms = await response.json();
        allDMs = dms;

        const dmsContainer = document.getElementById('dms');
        dmsContainer.innerHTML = '';
        dmsContainer.classList.remove('loading');

        if (dms.length === 0) {
            dmsContainer.innerHTML = '<div class="no-items">No DMs</div>';
            return;
        }

        filterDMs(''); // Show all initially
    } catch (error) {
        console.error('Failed to load DMs:', error);
        document.getElementById('dms').innerHTML = '<div class="error">Failed to load DMs</div>';
    }
}

// Load guilds (servers)
async function loadGuilds() {
    try {
        const response = await fetch('/api/guilds');
        const guilds = await response.json();
        allGuilds = guilds;

        const serversContainer = document.getElementById('servers');
        serversContainer.innerHTML = '';
        serversContainer.classList.remove('loading');

        if (guilds.length === 0) {
            serversContainer.innerHTML = '<div class="no-items">No servers</div>';
            return;
        }

        filterServers(''); // Show all initially
    } catch (error) {
        console.error('Failed to load guilds:', error);
        document.getElementById('servers').innerHTML = '<div class="error">Failed to load servers</div>';
    }
}

// Update notification badge for a channel
function updateNotificationBadge(channelId, count) {
    const badge = document.querySelector(`.notification-badge[data-channel="${channelId}"]`);
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Clear notifications for a channel
function clearNotifications(channelId) {
    unreadCounts[channelId] = 0;
    updateNotificationBadge(channelId, 0);
}

// Select a DM
function selectDM(dm, displayName) {
    currentChannel = {
        id: dm.id,
        name: displayName,
        type: 'dm'
    };

    // Clear notifications for this channel
    clearNotifications(dm.id);

    // Update UI
    document.querySelectorAll('.dm-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.dm-item').classList.add('active');

    // Clear server/channel selection
    document.querySelectorAll('.server-item, .channel-item').forEach(item => {
        item.classList.remove('active');
    });

    // Update header (DMs don't have # prefix)
    const channelNameEl = document.getElementById('channel-name');
    channelNameEl.textContent = displayName;
    channelNameEl.classList.add('dm-header');

    document.getElementById('message-box').disabled = false;
    document.getElementById('send-btn').disabled = false;
    document.getElementById('attach-btn').disabled = false;

    // Load messages immediately
    isFirstLoad = true;
    loadMessages();

    // Start polling for new messages - reduced to 1.5 seconds
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
    messagePollingInterval = setInterval(loadMessages, 3000);
}

// Select a guild and load its channels
async function selectGuild(guild) {
    // Clear DM selection
    document.querySelectorAll('.dm-item').forEach(item => {
        item.classList.remove('active');
    });

    // Update UI
    document.querySelectorAll('.server-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');

    // Show channel list
    document.querySelector('.channel-list').classList.remove('hidden');

    // Load channels
    try {
        const response = await fetch(`/api/channels/${guild.id}`);
        const channels = await response.json();

        const channelsContainer = document.getElementById('channels');
        channelsContainer.innerHTML = '';

        if (channels.length === 0) {
            channelsContainer.innerHTML = '<div class="no-items">No text channels</div>';
            return;
        }

        channels.forEach(channel => {
            const channelDiv = document.createElement('div');
            channelDiv.className = 'channel-item';
            channelDiv.dataset.channelId = channel.id;
            channelDiv.innerHTML = `
                <span class="item-name">${channel.name}</span>
                <span class="notification-badge hidden" data-channel="${channel.id}">0</span>
            `;
            channelDiv.onclick = () => selectChannel(channel);
            channelsContainer.appendChild(channelDiv);
        });
    } catch (error) {
        console.error('Failed to load channels:', error);
    }
}

// Select a channel and load messages
function selectChannel(channel) {
    currentChannel = {
        id: channel.id,
        name: channel.name,
        type: 'channel'
    };

    // Clear notifications for this channel
    clearNotifications(channel.id);

    // Update UI
    document.querySelectorAll('.channel-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.channel-item').classList.add('active');

    const channelNameEl = document.getElementById('channel-name');
    channelNameEl.textContent = channel.name;
    channelNameEl.classList.remove('dm-header');

    document.getElementById('message-box').disabled = false;
    document.getElementById('send-btn').disabled = false;
    document.getElementById('attach-btn').disabled = false;

    // Load messages immediately
    isFirstLoad = true;
    loadMessages();

    // Start polling for new messages - reduced to 1.5 seconds
    if (messagePollingInterval) {
        clearInterval(messagePollingInterval);
    }
    messagePollingInterval = setInterval(loadMessages, 3000);
}

// Load messages for current channel
let lastMessageId = null;
let isFirstLoad = true;

async function loadMessages() {
    if (!currentChannel) return;

    try {
        const response = await fetch(`/api/messages/${currentChannel.id}`);
        const messages = await response.json();

        const messagesContainer = document.getElementById('messages');

        // Check if we have new messages
        if (messages.length > 0 && messages[messages.length - 1].id !== lastMessageId) {
            const previousLastId = lastMessageId;

            messagesContainer.innerHTML = '';

            messages.forEach((message, index) => {
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const shouldGroup = shouldGroupWithPrevious(message, prevMessage);
                appendMessage(message, shouldGroup);
            });

            lastMessageId = messages[messages.length - 1].id;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            // Update last message time for sorting (only for DMs)
            if (currentChannel.type === 'dm' && messages.length > 0) {
                const latestMessage = messages[messages.length - 1];
                dmLastMessageTime[currentChannel.id] = new Date(latestMessage.timestamp).getTime();
                // Re-sort DM list
                filterDMs(document.getElementById('dm-search').value || '');
            }

            // Show notification for new messages (not on first load)
            if (!isFirstLoad && previousLastId) {
                const newMessages = messages.filter(m => m.id > previousLastId && m.author.id !== currentUser?.id);
                if (newMessages.length > 0) {
                    showNotification(newMessages[newMessages.length - 1]);
                }
            }

            isFirstLoad = false;
        }
    } catch (error) {
        console.error('Failed to load messages:', error);
    }
}

// Check if message should be grouped with previous message
function shouldGroupWithPrevious(currentMsg, prevMsg) {
    if (!prevMsg) return false;

    // Same author
    if (currentMsg.author.id !== prevMsg.author.id) return false;

    // Within 15 minutes (900000 ms)
    const currentTime = new Date(currentMsg.timestamp).getTime();
    const prevTime = new Date(prevMsg.timestamp).getTime();
    const timeDiff = currentTime - prevTime;

    if (timeDiff > 900000) return false; // 15 minutes

    return true;
}

// Parse and render Discord message content with images and emojis
function parseMessageContent(content, message) {
    let html = escapeHtml(content);

    // Handle user mentions <@userid> or <@!userid>
    html = html.replace(/&lt;@!?(\d+)&gt;/g, (match, userId) => {
        // Try to find the user in message mentions
        let username = 'Unknown User';
        if (message.mentions && message.mentions.length > 0) {
            const mentionedUser = message.mentions.find(u => u.id === userId);
            if (mentionedUser) {
                username = mentionedUser.username;
            }
        }

        // Check if it's mentioning the current user
        const isSelf = currentUser && userId === currentUser.id;
        const mentionClass = isSelf ? 'mention mention-self' : 'mention';

        return `<span class="${mentionClass}">@${username}</span>`;
    });

    // Handle custom Discord emojis <:name:id> or <a:name:id> (animated)
    html = html.replace(/&lt;(a?):(\w+):(\d+)&gt;/g, (match, animated, name, id) => {
        const ext = animated ? 'gif' : 'png';
        return `<img class="emoji" src="https://cdn.discordapp.com/emojis/${id}.${ext}" alt=":${name}:" title=":${name}:">`;
    });

    // Handle URLs and make them clickable
    html = html.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: #00b0f4;">$1</a>');

    return html;
}

// Append a message to the chat
function appendMessage(message, isGrouped = false) {
    const messagesContainer = document.getElementById('messages');

    const messageDiv = document.createElement('div');
    messageDiv.className = isGrouped ? 'message message-grouped' : 'message';

    const avatarUrl = message.author.avatar
        ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    // Parse message content for emojis and formatting
    const contentHtml = parseMessageContent(message.content, message);

    // Build reply reference if exists
    let replyHtml = '';
    if (message.referenced_message) {
        const refMsg = message.referenced_message;
        // Use global_name (display name) or username for reply author
        const refAuthor = refMsg.author.global_name || refMsg.author.username;
        const refContent = refMsg.content.substring(0, 50) + (refMsg.content.length > 50 ? '...' : '');
        replyHtml = `
            <div class="message-reply">
                <span class="reply-author">↩ ${escapeHtml(refAuthor)}</span>
                <span class="reply-content">${escapeHtml(refContent)}</span>
            </div>
        `;
    }

    // Use global_name (display name) or username for message author
    const displayName = message.author.global_name || message.author.username;

    // Grouped messages don't show avatar/header
    if (isGrouped) {
        messageDiv.innerHTML = `
            <div class="message-avatar-placeholder"></div>
            <div class="message-body">
                ${replyHtml}
                <div class="message-content">${contentHtml}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <img src="${avatarUrl}" class="message-avatar" alt="Avatar">
            <div class="message-body">
                <div class="message-header">
                    <span class="message-author">${escapeHtml(displayName)}</span>
                    <span class="message-timestamp">${timestamp}</span>
                </div>
                ${replyHtml}
                <div class="message-content">${contentHtml}</div>
            </div>
        `;
    }

    // Add images/attachments (including GIFs)
    if (message.attachments && message.attachments.length > 0) {
        const messageBody = messageDiv.querySelector('.message-body');
        message.attachments.forEach(attachment => {
            // Handle images and GIFs
            if (attachment.content_type && (attachment.content_type.startsWith('image/') || attachment.content_type === 'image/gif')) {
                const img = document.createElement('img');
                img.src = attachment.url;
                img.className = 'message-image';
                img.alt = attachment.filename;
                img.onclick = () => window.open(attachment.url, '_blank');
                messageBody.appendChild(img);
            }
            // Handle video files
            else if (attachment.content_type && attachment.content_type.startsWith('video/')) {
                const video = document.createElement('video');
                video.src = attachment.url;
                video.className = 'message-image';
                video.controls = true;
                video.style.maxWidth = '400px';
                messageBody.appendChild(video);
            }
            else {
                // Non-image attachment, show as link
                const link = document.createElement('a');
                link.href = attachment.url;
                link.target = '_blank';
                link.textContent = `📎 ${attachment.filename}`;
                link.style.color = '#00b0f4';
                link.style.display = 'block';
                link.style.marginTop = '4px';
                messageBody.appendChild(link);
            }
        });
    }

    // Handle embeds (images from links, including GIF embeds)
    if (message.embeds && message.embeds.length > 0) {
        const messageBody = messageDiv.querySelector('.message-body');
        message.embeds.forEach(embed => {
            if (embed.image && embed.image.url) {
                const img = document.createElement('img');
                img.src = embed.image.url;
                img.className = 'message-image';
                img.alt = 'Embedded image';
                img.onclick = () => window.open(embed.image.url, '_blank');
                messageBody.appendChild(img);
            }
            if (embed.thumbnail && embed.thumbnail.url) {
                const img = document.createElement('img');
                img.src = embed.thumbnail.url;
                img.className = 'message-image';
                img.style.maxWidth = '80px';
                img.style.maxHeight = '80px';
                img.alt = 'Thumbnail';
                img.onclick = () => window.open(embed.thumbnail.url, '_blank');
                messageBody.appendChild(img);
            }
            // Handle GIF embeds from Tenor/GIPHY
            if (embed.video && embed.video.url) {
                const video = document.createElement('video');
                video.src = embed.video.url;
                video.className = 'message-image';
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                messageBody.appendChild(video);
            }
        });
    }

    messagesContainer.appendChild(messageDiv);
}

// Send a message
async function sendMessage() {
    if (!currentChannel) return;

    const messageBox = document.getElementById('message-box');
    const content = messageBox.value.trim();

    if (!content) return;

    try {
        const response = await fetch(`/api/messages/${currentChannel.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            messageBox.value = '';
            // Message will appear on next poll
            setTimeout(loadMessages, 500);
        } else {
            alert('Failed to send message');
        }
    } catch (error) {
        console.error('Failed to send message:', error);
        alert('Failed to send message');
    }
}

// Typing indicator management
let typingTimeout = null;
let isTyping = false;

function triggerTypingIndicator() {
    if (!currentChannel) return;

    // Send typing indicator to Discord
    fetch(`/api/typing/${currentChannel.id}`, {
        method: 'POST'
    }).catch(err => console.error('Typing indicator error:', err));

    isTyping = true;

    // Clear previous timeout
    if (typingTimeout) {
        clearTimeout(typingTimeout);
    }

    // Reset typing status after 10 seconds (Discord's default)
    typingTimeout = setTimeout(() => {
        isTyping = false;
    }, 10000);
}

// Handle Enter key and typing in message box
document.addEventListener('DOMContentLoaded', () => {
    const messageBox = document.getElementById('message-box');
    if (messageBox) {
        messageBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        // Trigger typing indicator when user types
        messageBox.addEventListener('input', (e) => {
            if (e.target.value.trim() !== '' && !isTyping) {
                triggerTypingIndicator();
            }
        });
    }
});

// Poll all channels for new messages in background
async function pollAllChannelsForNotifications() {
    // Poll DMs
    for (const dm of allDMs) {
        if (currentChannel && currentChannel.id === dm.id) continue; // Skip current channel

        try {
            const response = await fetch(`/api/messages/${dm.id}?limit=1`);
            const messages = await response.json();

            if (messages.length > 0) {
                const latestMessage = messages[messages.length - 1];

                // Update last message time for sorting
                dmLastMessageTime[dm.id] = new Date(latestMessage.timestamp).getTime();

                // Check if this is a new message
                if (!lastSeenMessages[dm.id]) {
                    lastSeenMessages[dm.id] = latestMessage.id;
                } else if (latestMessage.id > lastSeenMessages[dm.id] && latestMessage.author.id !== currentUser?.id) {
                    // New message from someone else
                    unreadCounts[dm.id] = (unreadCounts[dm.id] || 0) + 1;
                    updateNotificationBadge(dm.id, unreadCounts[dm.id]);
                    lastSeenMessages[dm.id] = latestMessage.id;

                    // Re-sort DM list to bring this DM to top
                    filterDMs(document.getElementById('dm-search').value || '');
                }
            }
        } catch (err) {
            // Silently fail for background polling
        }
    }
}

// Show notification for new message
function showNotification(message) {
    const notificationEl = document.getElementById('notification');

    const avatarUrl = message.author.avatar
        ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const content = message.content.substring(0, 100) + (message.content.length > 100 ? '...' : '');

    // Use global_name (display name) or username
    const displayName = message.author.global_name || message.author.username;

    notificationEl.innerHTML = `
        <div class="notification-header">
            <img src="${avatarUrl}" class="notification-avatar" alt="Avatar">
            <div>
                <div class="notification-author">${escapeHtml(displayName)}</div>
                <div class="notification-channel">#${currentChannel.name}</div>
            </div>
        </div>
        <div class="notification-content">${escapeHtml(content)}</div>
    `;

    notificationEl.classList.remove('hidden');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        notificationEl.classList.add('hidden');
    }, 5000);
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
