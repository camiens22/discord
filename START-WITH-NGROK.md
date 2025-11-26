# Starting Discord Proxy with ngrok

ngrok creates a public HTTPS URL for your Discord proxy, perfect for Chromebooks!

## Quick Start

### Terminal 1: Start the Discord Proxy
```bash
cd discord-proxy
npm start
```
Keep this running!

### Terminal 2: Start ngrok
```bash
ngrok http 8080
```

You'll see:
```
Forwarding   https://abcd-1234.ngrok-free.app -> http://localhost:8080
```

**Use that HTTPS URL on your Chromebook!**

## One-Time Setup (Optional but Recommended)

To avoid the ngrok warning page:

1. Go to https://ngrok.com/
2. Sign up (free)
3. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
4. Run:
   ```bash
   ngrok config add-authtoken YOUR_TOKEN_HERE
   ```

## Tips

- ✅ The URL works from ANY device, anywhere
- ✅ No need to be on same WiFi network
- ⚠️ Free tier: URL changes every time you restart ngrok
- ⚠️ Free tier: Shows ngrok warning page (click "Visit Site")
- 💡 Keep both terminals open while using

## Stopping

- Press `Ctrl+C` in the ngrok terminal
- Press `Ctrl+C` in the server terminal

## If URL Changes

When you restart ngrok, you'll get a new URL. Just use the new one!
