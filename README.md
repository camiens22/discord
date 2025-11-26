# Discord Text Chat Proxy - Token Auth Edition

A lightweight web-based proxy for Discord with **user token authentication** and **DM support**. Access Discord's text channels and direct messages from any device on your network when Discord is blocked or unavailable.

## ⚡ Key Features

- ✅ **User Token Authentication** - No OAuth2 login required
- ✅ **Direct Messages (DMs)** - Full support for DMs and group chats
- ✅ **Server Channels** - Access all text channels in your servers
- ✅ **Network Access** - Connect from any device on your network
- ✅ **Real-time Updates** - Messages refresh every 3 seconds
- ✅ **Clean Interface** - Discord-inspired UI
- ✅ **VPN Compatible** - Run server with VPN, access from other devices

## 🎯 Use Case

Perfect for scenarios where:
- Discord website/app is blocked (school, work, etc.)
- You have a computer with VPN access
- You want to access Discord from devices that can't use VPN
- You need a lightweight text-only Discord client

## 📦 Quick Start

### 1. Install Dependencies

```bash
cd discord-proxy
npm install
```

### 2. Get Your Discord Token

Follow the instructions in [TOKEN-GUIDE.md](TOKEN-GUIDE.md) to get your Discord token.

**Quick method**:
1. Open Discord in browser (discord.com)
2. Press `F12` → "Console" tab
3. Paste this and press Enter:
```javascript
(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
```
4. Copy the token

### 3. Configure Token

Edit `.env` file:
```env
DISCORD_USER_TOKEN=paste_your_token_here
HOST=0.0.0.0
PORT=3000
```

### 4. Start Server

```bash
npm start
```

### 5. Access the Proxy

- **From same computer**: http://localhost:3000
- **From other devices**: http://192.168.x.x:3000 (IP shown in terminal)

## 📱 Accessing from Other Devices

The server automatically binds to `0.0.0.0`, making it accessible from any device on your network.

**Quick steps**:
1. Start the server
2. Note the "Network" IP address shown (e.g., `http://192.168.1.100:3000`)
3. On your other device (phone, tablet), open browser
4. Go to that IP address
5. Start chatting!

See [NETWORK-ACCESS-GUIDE.md](NETWORK-ACCESS-GUIDE.md) for detailed instructions and troubleshooting.

## 🔒 VPN Setup (Bypass Discord Blocks)

If Discord is blocked in your network:

1. **Install VPN** on the computer running the proxy
2. **Connect VPN** on that computer
3. **Start the proxy server**
4. **Access from other devices** using local network IP

Flow:
```
Your Device → (Local WiFi) → Proxy Server → (VPN) → Discord
```

Your device never needs to connect to discord.com directly!

## 📖 Documentation

- **[TOKEN-GUIDE.md](TOKEN-GUIDE.md)** - How to get your Discord token
- **[NETWORK-ACCESS-GUIDE.md](NETWORK-ACCESS-GUIDE.md)** - Accessing from other devices
- **[SETUP-GUIDE.md](SETUP-GUIDE.md)** - Quick setup instructions

## ⚙️ Features

### What Works
- ✅ Direct Messages (1-on-1 and group DMs)
- ✅ All server text channels
- ✅ Reading message history
- ✅ Sending text messages
- ✅ Real-time message updates (3-second polling)
- ✅ Network access (access from any device)

### What Doesn't Work
- ❌ Voice channels
- ❌ Video calls
- ❌ Screen sharing
- ❌ File uploads
- ❌ Rich embeds (shown as plain text)
- ❌ Reactions
- ❌ Images (shown as links to Discord CDN)

## 🔧 Configuration

### Environment Variables (.env)

```env
# Your Discord token (REQUIRED)
DISCORD_USER_TOKEN=your_token_here

# Server host (0.0.0.0 = all network interfaces)
HOST=0.0.0.0

# Server port
PORT=3000

# Environment
NODE_ENV=development
```

### Firewall Configuration

**Windows**:
```powershell
New-NetFirewallRule -DisplayName "Discord Proxy" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

**Linux**:
```bash
sudo ufw allow 3000/tcp
```

## 🛠️ Troubleshooting

### "Discord token not configured"
- Check `.env` file exists
- Make sure token is correctly pasted
- No spaces or quotes around the token

### Can't access from other devices
- Check firewall settings
- Verify both devices are on same network
- Check the IP address is correct
- See [NETWORK-ACCESS-GUIDE.md](NETWORK-ACCESS-GUIDE.md)

### Token doesn't work
- Token may have expired - get a new one
- Make sure you copied the entire token
- Try logging out and back into Discord

### Messages not loading
- Check your internet connection
- Verify VPN is connected (if using one)
- Check browser console for errors (F12)

## ⚠️ Important Warnings

### Security
- 🔒 Your Discord token is like your password - keep it secret
- 🔒 Never share your `.env` file
- 🔒 Only use on trusted networks
- 🔒 Consider using HTTPS in production

### Terms of Service
- ⚠️ Using user tokens violates Discord's ToS
- ⚠️ Your account could be suspended or banned
- ⚠️ Use at your own risk
- ⚠️ For educational/personal use only

### Network Policies
- ⚠️ Check if bypassing network restrictions violates policies
- ⚠️ Some organizations prohibit circumventing network blocks
- ⚠️ Use responsibly and within applicable rules

## 🚀 Deployment Options

### Local Network (Recommended)
- Run on your computer
- Access from devices on same WiFi
- Most secure option

### Cloud Server (Advanced)
- Deploy to VPS (DigitalOcean, AWS, etc.)
- Access from anywhere
- Requires HTTPS and authentication
- Not covered in this guide

### ngrok (Quick Remote Access)
```bash
# Install ngrok
npm install -g ngrok

# Start server
npm start

# In another terminal
ngrok http 3000
```
Access using the ngrok URL from anywhere.

## 📊 Technical Details

- **Backend**: Node.js + Express 4.x
- **Frontend**: Vanilla JavaScript (no framework)
- **Authentication**: Discord User Token
- **API**: Discord REST API v10
- **Updates**: HTTP Polling (3-second interval)
- **Network**: Binds to 0.0.0.0 for network access

## 🤝 Usage Tips

1. **Start server on computer with internet/VPN access**
2. **Access from blocked device using local network IP**
3. **Keep server running while using the proxy**
4. **Refresh browser if messages stop updating**
5. **Check server console for errors**

## 📝 Project Structure

```
discord-proxy/
├── server.js              # Express server with Discord API
├── .env                   # Configuration (token, host, port)
├── package.json           # Dependencies
├── README.md              # This file
├── TOKEN-GUIDE.md         # How to get Discord token
├── NETWORK-ACCESS-GUIDE.md # Network setup guide
├── SETUP-GUIDE.md         # Quick setup
└── public/
    ├── index.html         # Main interface
    ├── style.css          # Discord-inspired styling
    └── app.js             # Frontend logic
```

## 🆘 Getting Help

If you encounter issues:
1. Check the relevant guide (TOKEN-GUIDE.md, NETWORK-ACCESS-GUIDE.md)
2. Review troubleshooting section above
3. Check server console for error messages
4. Verify all configuration is correct

## 📜 License

ISC

## ⚖️ Disclaimer

This tool is for educational purposes only. The authors are not responsible for any misuse or violations of Discord's Terms of Service or network policies. Use at your own risk and ensure you comply with all applicable rules and regulations.
