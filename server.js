require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Discord API configuration
const DISCORD_API = 'https://discord.com/api/v10';
const USER_TOKEN = process.env.DISCORD_USER_TOKEN;

// Helper function to make Discord API requests with user token
async function discordRequest(endpoint, options = {}) {
    if (!USER_TOKEN || USER_TOKEN === 'your_discord_token_here') {
        throw new Error('Discord user token not configured. See TOKEN-GUIDE.md');
    }

    const url = `${DISCORD_API}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': USER_TOKEN,
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Discord API error: ${response.status} - ${error}`);
    }

    return response.json();
}

// API Routes

// Get current user info
app.get('/api/user', async (req, res) => {
    try {
        const user = await discordRequest('/users/@me');
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all guilds (servers)
app.get('/api/guilds', async (req, res) => {
    try {
        const guilds = await discordRequest('/users/@me/guilds');
        res.json(guilds);
    } catch (error) {
        console.error('Get guilds error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get DM channels
app.get('/api/dms', async (req, res) => {
    try {
        const channels = await discordRequest('/users/@me/channels');
        res.json(channels);
    } catch (error) {
        console.error('Get DMs error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get channels for a specific guild
app.get('/api/channels/:guildId', async (req, res) => {
    try {
        const channels = await discordRequest(`/guilds/${req.params.guildId}/channels`);
        // Filter for text channels only
        const textChannels = channels.filter(c => c.type === 0 || c.type === 5);
        res.json(textChannels);
    } catch (error) {
        console.error('Get channels error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get messages for a channel (works for both guild channels and DMs)
app.get('/api/messages/:channelId', async (req, res) => {
    try {
        const limit = req.query.limit || 50;
        const before = req.query.before || '';
        const beforeParam = before ? `&before=${before}` : '';
        const messages = await discordRequest(`/channels/${req.params.channelId}/messages?limit=${limit}${beforeParam}`);
        res.json(messages.reverse());
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Send a message to a channel (works for both guild channels and DMs)
app.post('/api/messages/:channelId', async (req, res) => {
    try {
        const { content } = req.body;
        const message = await discordRequest(`/channels/${req.params.channelId}/messages`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        res.json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Trigger typing indicator in a channel
app.post('/api/typing/:channelId', async (req, res) => {
    try {
        await fetch(`${DISCORD_API}/channels/${req.params.channelId}/typing`, {
            method: 'POST',
            headers: {
                'Authorization': USER_TOKEN,
                'Content-Type': 'application/json'
            }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Typing indicator error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Close a DM channel
app.delete('/api/dms/:channelId', async (req, res) => {
    try {
        await fetch(`${DISCORD_API}/channels/${req.params.channelId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': USER_TOKEN,
                'Content-Type': 'application/json'
            }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Close DM error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create or get DM channel with a user
app.post('/api/dms/create', async (req, res) => {
    try {
        const { recipientId } = req.body;
        const channel = await discordRequest('/users/@me/channels', {
            method: 'POST',
            body: JSON.stringify({ recipient_id: recipientId })
        });
        res.json(channel);
    } catch (error) {
        console.error('Create DM error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get local network IP address
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip internal and non-ipv4 addresses
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

// Start server
app.listen(PORT, HOST, () => {
    const localIP = getLocalIP();

    console.log('\n==================================================');
    console.log('   Discord Proxy Server - Token Auth Mode');
    console.log('==================================================\n');

    console.log('Server is running on:\n');
    console.log(`  Local:   http://localhost:${PORT}`);
    console.log(`  Network: http://${localIP}:${PORT}`);
    console.log('\n--------------------------------------------------');

    if (!USER_TOKEN || USER_TOKEN === 'your_discord_token_here') {
        console.log('\n⚠️  WARNING: Discord token not configured!\n');
        console.log('Steps to configure:');
        console.log('1. Get your Discord token (see TOKEN-GUIDE.md)');
        console.log('2. Add it to .env file: DISCORD_USER_TOKEN=your_token');
        console.log('3. Restart the server\n');
    } else {
        console.log('\n✓ Token configured');
        console.log('\nAccess from other devices:');
        console.log(`  Use: http://${localIP}:${PORT}`);
        console.log('  (Make sure devices are on same network)\n');
    }

    console.log('==================================================\n');
});
