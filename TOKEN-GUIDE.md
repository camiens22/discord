# How to Get Your Discord Token

⚠️ **WARNING**: Your Discord token is like your password. Never share it with anyone! Using your token violates Discord's Terms of Service and could result in account termination. Use at your own risk.

## Method 1: Browser Developer Tools (Recommended)

### For Desktop Discord (Electron App):

1. **Open Discord** on your computer (desktop app)
2. Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac) to open Developer Tools
3. Click on the **"Network"** tab at the top
4. Press `Ctrl+R` or `Cmd+R` to reload Discord
5. In the filter box, type: **api**
6. Click on any request that shows up
7. Click on the **"Headers"** tab
8. Scroll down to find **"authorization"** under "Request Headers"
9. Copy the long string of letters and numbers (that's your token!)

### For Web Browser (discord.com):

1. **Open Discord** in your web browser (discord.com/app)
2. **Log in** to your account
3. Press `F12` to open Developer Tools
4. Click on the **"Console"** tab
5. Paste this code and press Enter:

```javascript
(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()
```

6. Your token will appear - it will look something like: `MTa1MzE2NzU4MjI1NjY4MDk2MA.GpP7gR.YourTokenHereWithLotsOfCharacters`
7. **Copy the entire token** (triple-click to select all)

## Method 2: Using Application Tab (Alternative)

1. Open Discord in browser or desktop app
2. Press `F12` to open Developer Tools
3. Go to the **"Application"** tab (or "Storage" in Firefox)
4. Expand **"Local Storage"** in the left sidebar
5. Click on **"https://discord.com"**
6. Find the key named **"token"** in the list
7. Copy the value (remove the quotes if present)

## Adding Token to Your Proxy

1. Open the `.env` file in the discord-proxy folder
2. Find the line: `DISCORD_USER_TOKEN=your_discord_token_here`
3. Replace `your_discord_token_here` with your actual token
4. Save the file
5. Restart the server

Example:
```
DISCORD_USER_TOKEN=MTa1MzE2NzU4MjI1NjY4MDk2MA.GpP7gR.YourActualTokenHere
```

## Security Tips

- ✅ Only use this on your personal devices
- ✅ Keep your token private
- ✅ Don't commit `.env` file to git (it's already in .gitignore)
- ❌ Never share your token with anyone
- ❌ Don't use this on public/shared computers
- ❌ Don't paste your token in public Discord servers

## Troubleshooting

### "Invalid Token" Error
- Make sure you copied the entire token
- Try getting the token again - it may have changed
- Check for extra spaces or quotes

### Token Stops Working
- Discord may have invalidated it
- You changed your password (this resets tokens)
- Get a new token using the steps above

### Account Security
- If you suspect your token was compromised, **change your Discord password immediately**
- Enable 2FA (Two-Factor Authentication) on your Discord account
- Review your authorized apps at discord.com/settings

## Legal & Safety Notice

This tool uses your Discord token to access Discord's API. This is:
- ⚠️ Against Discord's Terms of Service
- ⚠️ Could result in account suspension/ban
- ⚠️ Use at your own risk
- ✅ For educational/personal use only
- ✅ Not for automation or bots

If Discord is blocked in your environment (school, work, etc.), check if using this tool violates your organization's policies.
