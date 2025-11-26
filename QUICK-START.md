# Quick Start Guide

Get up and running in 5 minutes!

## Step 1: Get Your Discord Token (2 min)

1. Open Discord in your browser: **discord.com**
2. Press **F12** to open Developer Tools
3. Click the **"Console"** tab
4. Paste this command and press Enter:

```javascript
(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
```

5. **Copy the token** that appears (it's a long string)

## Step 2: Configure the Token (1 min)

1. Open the `.env` file in the `discord-proxy` folder
2. Find this line:
   ```
   DISCORD_USER_TOKEN=your_discord_token_here
   ```
3. Replace `your_discord_token_here` with your actual token
4. Save the file

## Step 3: Start the Server (1 min)

Open terminal/command prompt and run:

```bash
cd discord-proxy
npm start
```

You'll see:
```
Server is running on:
  Local:   http://localhost:3000
  Network: http://192.168.1.xxx:3000
```

## Step 4: Access from Your Device (1 min)

### Same Computer:
- Open browser → `http://localhost:3000`

### Other Device (phone, tablet, etc.):
1. Make sure it's on the **same WiFi network**
2. Open browser → Use the **Network** address from Step 3
   - Example: `http://192.168.1.228:3000`

## You're Done! 🎉

You should now see:
- Your Discord username at the top
- List of DMs on the left
- List of servers below that
- Click any DM or channel to start chatting

## Using with VPN

If Discord is blocked:

1. **Connect VPN** on the computer running the server
2. **Start the server** (Step 3)
3. **Access from your other device** (Step 4)

The proxy server connects through VPN, your device connects to the proxy!

## Troubleshooting

### "Discord token not configured"
- Check you pasted the token correctly in `.env`
- No spaces or quotes around it
- Save the file and restart

### Can't access from other device
- Both devices on same WiFi?
- Try the IP address shown in terminal
- Check firewall (see README.md)

### Token doesn't work
- Get a fresh token (Step 1)
- Make sure you copied the entire token

## Next Steps

- Read [TOKEN-GUIDE.md](TOKEN-GUIDE.md) for detailed token instructions
- Read [NETWORK-ACCESS-GUIDE.md](NETWORK-ACCESS-GUIDE.md) for network setup
- Read [README.md](README.md) for full documentation

## Tips

- Keep the server terminal open while using
- If messages stop updating, refresh the browser
- Press `Ctrl+C` in terminal to stop the server
- Server shows your network IP every time it starts
