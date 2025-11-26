# Quick Setup Guide

Follow these steps to get your Discord proxy running:

## 1. Create Discord Application (5 minutes)

1. Visit: https://discord.com/developers/applications
2. Click "New Application"
3. Name it anything (e.g., "Discord Proxy")
4. Click "Create"

## 2. Configure OAuth2

1. Click "OAuth2" in the left sidebar
2. Under "Redirects", click "Add Redirect"
3. Enter: `http://localhost:3000/callback`
4. Click "Save Changes"

## 3. Get Your Credentials

1. Stay in the "OAuth2" section
2. Copy your **Client ID**
3. Click "Reset Secret" to generate a new **Client Secret**
4. Copy the **Client Secret** (you won't see it again!)

## 4. Update .env File

Open the `.env` file and replace these two lines:

```
DISCORD_CLIENT_ID=paste_your_client_id_here
DISCORD_CLIENT_SECRET=paste_your_client_secret_here
```

## 5. Start the Server

In your terminal:

```bash
npm start
```

## 6. Open in Browser

Go to: http://localhost:3000

Click "Login with Discord" and you're done!

---

## Quick Commands

- **Start server**: `npm start`
- **Stop server**: Press `Ctrl+C` in the terminal

## Need Help?

See [README.md](README.md) for detailed documentation and troubleshooting.
