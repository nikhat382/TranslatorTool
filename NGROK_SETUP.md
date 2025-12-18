# 🚀 Ngrok Quick Setup Guide

## Step 1: Download Ngrok (2 minutes)

1. **Visit:** https://ngrok.com/download
2. **Click:** "Download for Windows"
3. **Extract:** Unzip the downloaded file to a convenient location
   - Recommended: `C:\ngrok\` or your Desktop

---

## Step 2: Sign Up (Free - 1 minute)

1. **Visit:** https://dashboard.ngrok.com/signup
2. **Sign up** with email or GitHub (it's FREE)
3. **Copy your authtoken** from the dashboard

---

## Step 3: Setup Ngrok (1 minute)

Open Command Prompt or PowerShell and run:

```bash
# Navigate to where you extracted ngrok
cd C:\ngrok  # (or wherever you put it)

# Add your authtoken (get it from ngrok dashboard)
ngrok authtoken YOUR_AUTH_TOKEN_HERE
```

---

## Step 4: Start Tunnel (30 seconds)

```bash
# Make sure you're in the ngrok folder
ngrok http 5000
```

You'll see output like this:
```
ngrok

Session Status                online
Account                       your@email.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:5000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Your Public URL:** The URL shown in "Forwarding" (e.g., https://abc123.ngrok-free.app)

---

## Step 5: Share Your App! 🎉

**That's it!** Your app is now publicly accessible at the ngrok URL.

**Important Notes:**
- ✅ No password required (unlike LocalTunnel)
- ✅ Much more reliable (no 503/408 errors)
- ⚠️ Free tier shows small ngrok banner on first visit
- ⚠️ Keep the terminal window open while using

---

## Quick Reference Commands

```bash
# Basic tunnel
ngrok http 5000

# Tunnel with custom subdomain (paid feature)
ngrok http --subdomain=myapp 5000

# View requests in browser
# Open: http://localhost:4040 (while ngrok is running)
```

---

## Troubleshooting

**If ngrok command not found:**
- Make sure you're in the folder where ngrok.exe is located
- Or add ngrok to your PATH

**If authtoken error:**
- Copy the exact token from: https://dashboard.ngrok.com/get-started/your-authtoken
- Run the authtoken command again

**To stop ngrok:**
- Press `Ctrl+C` in the terminal

---

## Alternative: Run From Anywhere

To use ngrok from any folder:

1. **Move ngrok.exe to:** `C:\Windows\System32\`
2. **Or add to PATH:**
   - Right-click "This PC" → Properties
   - Advanced system settings → Environment Variables
   - Edit "Path" → Add ngrok folder location

Then you can run `ngrok http 5000` from any folder!

---

## Current Backend Status

✅ **Your backend is running:** http://localhost:5000
✅ **Ready for ngrok tunnel**

Once ngrok is running, your app will be at: `https://[random].ngrok-free.app`

---

## Need Help?

- Ngrok Docs: https://ngrok.com/docs
- Get Started: https://dashboard.ngrok.com/get-started/setup

**Your backend server is ready and waiting!** Just download ngrok and run the command above.
