# 🛠️ Expo Connection Troubleshooting Guide

If your **Expo Go** mobile app shows **"Could not connect to the server"** when scanning the QR code, it means your phone cannot reach your computer's local development server. 

> [!IMPORTANT]
> **🚀 QUICK COMMAND FOR YOUR PC (`192.168.100.7`):**
> If ngrok/tunnel fails on your network, open PowerShell in the `frontend` folder and run this exact command to connect instantly over Wi-Fi:
> ```powershell
> $env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.100.7"; npx expo start
> ```

Since all of JobLink's backend operations are fully mocked and run locally inside the application state (`AuthContext.js`), there is no external API server crash. The issue is purely network/connection-based.

Here are the **4 most effective ways** to fix this on Windows:

---

## 🚀 Fix 1: Use an Expo Tunnel (Absolute Easiest & 100% Guaranteed)
If your phone is on cellular/mobile data (4G/5G), connected to a different Wi-Fi network, or if your router blocks local peer-to-peer connections (common in cafes/dorms), you can use Expo's built-in **Tunnel** connection. This creates a secure, public URL routing to your machine, bypassing all local network and firewall issues.

### How to configure & use the Tunnel:

Since modern `ngrok` services require authenticating to prevent abuse, setting up a free authtoken is the most reliable way to resolve **"ngrok tunnel took too long to connect"** errors.

1. **Get your Free Authtoken:**
   * Go to **[ngrok.com](https://ngrok.com)** and sign up for a free account.
   * Go to your **ngrok Dashboard** and click **"Your Authtoken"** on the left menu.
   * Copy the authtoken key.

2. **Add the Authtoken to your computer:**
   * Open your terminal in the `frontend` directory and run:
     ```bash
     npx ngrok config add-authtoken YOUR_COPIED_AUTHTOKEN
     ```
     *(Replace `YOUR_COPIED_AUTHTOKEN` with the actual key you copied).*

3. **Start the packager with the tunnel flag:**
   ```bash
   npx expo start --tunnel
   ```

4. **Scan the new QR code:** This will generate a URL starting with `exp://*.ngrok-free.app` which will load instantly on your phone regardless of your Wi-Fi network or cellular data status!

---

## 🔒 Fix 2: Configure Windows Defender Firewall
By default, Windows Defender Firewall blocks incoming connections to new Node.js server ports on public or even private networks.

### How to allow Node.js through the Firewall:
1. Open the Windows Start Menu, type **"Allow an app through Windows Firewall"**, and open the Control Panel utility.
2. Click the **"Change settings"** button at the top right (requires Admin rights).
3. Scroll down the list and locate **"Node.js JavaScript Runtime"** (you might see multiple instances).
4. Ensure **both** the **Private** and **Public** checkboxes are fully checked for all Node.js rows.
5. Click **OK** to save the settings, then stop (`Ctrl + C`) and restart (`npx expo start`) your dev server.

---

## 🌐 Fix 3: Change your Network Profile to "Private"
If your current Wi-Fi network profile on Windows is set to **Public**, Windows automatically blocks almost all incoming ports, preventing your phone from connecting.

### How to change your Wi-Fi profile:
1. Click the Wi-Fi icon in your Windows system tray (bottom-right of your taskbar).
2. Click **Properties** underneath your connected Wi-Fi network name.
3. Under **Network profile type**, change the selection from **Public** to **Private**.
4. Restart your Expo server with `npx expo start` and scan the QR code.

---

## 🧭 Fix 4: Force the Correct IP Hostname (For VPNs, WSL, or VirtualBox)
If you have VirtualBox, VMware, WSL (Windows Subsystem for Linux), or a VPN active, Expo will often bind to the virtual adapter's IP address (like `192.168.56.1` or `172.x.x.x`) instead of your computer's real Wi-Fi network IP.

### How to force the correct IP:
1. Open PowerShell or Command Prompt on your computer.
2. Find your actual Wi-Fi IP address by running:
   ```cmd
   ipconfig
   ```
   Look for the **Wireless LAN adapter Wi-Fi** section and note down your **IPv4 Address** (typically starts with `192.168.1.X` or `10.0.0.X`).
3. Set the environment variable in your terminal and start Expo:
   * **In PowerShell:**
     ```powershell
     $env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.XX"  # Replace with your actual Wi-Fi IP
     npx expo start
     ```
   * **In Command Prompt (cmd):**
     ```cmd
     set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.XX  # Replace with your actual Wi-Fi IP
     npx expo start
     ```
