# Network Access Guide

This guide explains how to access your Discord proxy from other devices on your network.

## Quick Setup

### Step 1: Start the Server

```bash
cd discord-proxy
npm start
```

The server will display its network IP address, for example:
```
Local:   http://localhost:3000
Network: http://192.168.1.100:3000
```

### Step 2: Access from Other Devices

On your other device (phone, tablet, another computer):
1. Make sure it's connected to the **same WiFi network**
2. Open a web browser
3. Go to the **Network** address shown (e.g., `http://192.168.1.100:3000`)

## Finding Your Server's IP Address

### On Windows:
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet).
Example: `192.168.1.100`

### On Mac/Linux:
```bash
ifconfig
```
or
```bash
ip addr show
```

Look for `inet` address (not 127.0.0.1). Example: `192.168.1.100`

## Firewall Configuration

### Windows Firewall

If you can't connect from other devices, you may need to allow the app through the firewall:

1. Open **Windows Defender Firewall**
2. Click **"Allow an app through firewall"**
3. Click **"Change settings"**
4. Click **"Allow another app..."**
5. Browse to `C:\Program Files\nodejs\node.exe`
6. Make sure both **Private** and **Public** are checked
7. Click **OK**

**Or use this command in PowerShell (Run as Administrator):**
```powershell
New-NetFirewallRule -DisplayName "Discord Proxy" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### Mac Firewall

1. Open **System Preferences** → **Security & Privacy**
2. Click the **Firewall** tab
3. Click **"Firewall Options"**
4. Add Node.js to allowed applications

### Linux Firewall (ufw)

```bash
sudo ufw allow 3000/tcp
```

## Connection Scenarios

### Scenario 1: Same Computer
- **URL**: `http://localhost:3000`
- **Use**: Testing, when Discord works but you want the custom interface

### Scenario 2: Same Network (Home/School WiFi)
- **URL**: `http://192.168.x.x:3000` (your server's local IP)
- **Use**: Access from phone/tablet while on same WiFi
- **Requirement**: Both devices on same network

### Scenario 3: Different Network (Remote Access)
- **URL**: `http://your-public-ip:3000` or use dynamic DNS
- **Use**: Access from anywhere
- **Requirements**:
  - Port forwarding on your router
  - Knowing your public IP
  - Security considerations (see below)

## Port Forwarding (Advanced)

⚠️ **Warning**: Only do this if you understand the security implications!

To access from outside your home network:

1. **Find Your Router's IP**
   - Usually `192.168.1.1` or `192.168.0.1`
   - Open in browser, log in

2. **Set Up Port Forwarding**
   - Forward external port `3000` to internal IP `192.168.x.x:3000`
   - Protocol: TCP

3. **Find Your Public IP**
   - Visit: https://whatismyip.com
   - Use this IP to connect from outside

4. **Use Dynamic DNS** (Optional)
   - Services: No-IP, DuckDNS, Dynu
   - Creates a domain name that always points to your home IP

## Using a VPN

If Discord is blocked but your device with the proxy has VPN access:

1. **Install VPN** on the computer running the proxy server
2. **Connect VPN** on that computer only
3. **Start the proxy server**
4. **Access from other device** using local network IP (no VPN needed on that device)

Flow:
```
Your Phone → (Local Network) → Proxy Server → (VPN) → Discord
```

This way:
- Server connects to Discord through VPN
- Your phone connects to server through local network
- Your phone never needs to access discord.com directly

## Security Best Practices

### For Local Network Use:
- ✅ Use on trusted home/private networks only
- ✅ Keep firewall enabled, only allow port 3000
- ⚠️ Be careful on public WiFi (anyone can access)

### For Remote Access:
- ❌ **NOT RECOMMENDED** without additional security
- If you must:
  - Use HTTPS (requires SSL certificate)
  - Add password authentication
  - Use a VPN instead of port forwarding
  - Consider using a cloud server (AWS, DigitalOcean)

## Troubleshooting

### Can't Connect from Other Device

1. **Check same network**: Both devices on same WiFi?
2. **Check IP**: Is the IP address correct?
3. **Check firewall**: Is port 3000 allowed?
4. **Check server**: Is the server still running?
5. **Try localhost**: Does `http://localhost:3000` work on the server computer?

### "Connection Refused" Error

- Server is not running
- Wrong IP address
- Firewall blocking the connection
- Wrong port number

### "This site can't be reached" Error

- Device not on same network
- IP address changed (servers may get new IPs)
- Router blocking communication between devices

### Works on Server, Not on Other Devices

- Firewall issue (most common)
- Server bound to localhost instead of 0.0.0.0
  - Check `.env` file: `HOST=0.0.0.0` should be set

## Checking Server Status

On the server computer:
```bash
# Check if server is running
netstat -an | findstr :3000    # Windows
netstat -an | grep :3000       # Mac/Linux

# Check if listening on all interfaces
# Should show 0.0.0.0:3000 or *:3000
```

## Alternative: Using ngrok (Easy Remote Access)

If you want quick remote access without port forwarding:

1. **Install ngrok**: https://ngrok.com
2. **Run ngrok**:
   ```bash
   ngrok http 3000
   ```
3. **Use the URL** provided (e.g., `https://abc123.ngrok.io`)
4. **Access from anywhere** using that URL

Note: Free ngrok URLs change each time you restart.

## Performance Tips

- **Network speed**: Faster WiFi = better experience
- **Distance**: Closer to router = more stable
- **Interference**: Fewer devices = better performance
- **Server resources**: Close other apps on server computer

## Summary

**Local Access (Easy)**:
- Same device: `http://localhost:3000`
- Same network: `http://192.168.x.x:3000`
- No configuration needed (except maybe firewall)

**Remote Access (Advanced)**:
- Port forwarding + Public IP
- ngrok for temporary access
- VPN for secure access
- Or use a cloud server

For most use cases, **local network access** is sufficient and secure!
