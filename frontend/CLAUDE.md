# Jobify - Premium React Native Expo App

A breathtaking Mint Green & Vibrant Lime Yellow Job Board App designed exactly matching your reference UI screenshot.

## 🛠️ Project Structure
```
APP-JOB/
├── App.js                     # Root entry with Auth-Gated Navigation & Floating Tabs
├── package.json               # Configured for Expo SDK 54.0.0 (compatible with your Expo Go version!)
├── babel.config.js            # Expo Babel configuration with Reanimated
├── src/
│   ├── theme/
│   │   └── colors.js          # Exact Mint Green, Lime Yellow, & Charcoal Black Theme
│   ├── context/
│   │   └── AuthContext.js     # Shared Auth state (JobSeeker / Employer roles) & Job list
│   └── screens/
│       ├── LoginScreen.js     # Sign In screen matching "Withdraw" inputs & CTAs
│       ├── SignupScreen.js    # Sign Up screen matching role selection & passcode layout
│       ├── JobsScreen.js      # Beautiful dual yellow-stacked "Receive" panel & Job feed
│       ├── PostJobScreen.js   # Locked/Authorized Job Publisher form matching design
│       └── ProfileScreen.js   # Breathtaking "Leandro Foster" Dotted Peak Chart clone
```

## 🚀 Running the App

1. **Stop the active server:** Press `Ctrl + C` in your active terminal to stop the old running Expo server.
2. **Start the upgraded SDK 54 packager:**

```bash
# Standard command (if on a single network connection)
npx expo start -c

# LAN Mode (Forces the correct Wi-Fi IP if you have multiple adapters)
# PowerShell (Windows):
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.100.251"; npx expo start --lan -c

# CMD (Windows):
set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.100.251 && npx expo start --lan -c
```

### 📱 Device Preview Options:
*   **Expo Go (Mobile):** Scan the QR code using the **Expo Go** app on your iOS or Android device. It will now sync perfectly because both your device and the project are aligned to **Expo SDK 54.0.0**!
*   **Web Sandbox:** Press `w` in terminal to run directly in your web browser.
*   **Emulators:** Press `a` for Android Emulator or `i` for iOS Simulator.

## 💡 Quick-Test Credentials

To fully test both candidate and employer workflows instantly:
*   **Employer Account:**
    *   **Email:** `leandro@gmail.com`
    *   **Password:** `123456`
    *   *Features unlocked:* Can post jobs, manage listing stats, view visual dotted peaks.
*   **Candidate Account:**
    *   **Email:** `sara@gmail.com`
    *   **Password:** `123456`
    *   *Features unlocked:* Accesses the search catalog, fits "Applied/Interviews" statistics score.

## ✨ Profile Image & Real-Time Syncing (New!)
*   **Permissions & Library Integration:** Uses `expo-image-picker` to select professional profile pictures from the gallery.
*   **Dynamic database sync:** Uploads/saves avatar image reference securely to Supabase `profiles.avatar_url` as clean Base64.
*   **Real-time sync:** Recruiter avatars immediately refresh and sync across all active job postings on the network feed and modal sheets.
*   **Polished Fallbacks:** Automatically falls back to high-fidelity initial-based circular illustrations if no avatar image is set.
