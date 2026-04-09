# Cultural Heritage Centre — Android Studio Build Guide

**Version:** 2.0.0 — Gallery Concierge
**Package:** `com.twinfusion.culturalheritage`
**Min SDK:** 24 (Android 7.0)
**Target SDK:** 35 (Android 15)
**Framework:** React Native 0.83.2 + Expo SDK 55

---

## Prerequisites

1. **Android Studio** Ladybug (2024.2+) — https://developer.android.com/studio
2. **JDK 17** — bundled with Android Studio
3. **Node.js 18+** — https://nodejs.org
4. **Git** — https://git-scm.com
5. **Android SDK** — install via Android Studio > SDK Manager:
   - Android 15 (API 35)
   - Android 14 (API 34)
   - Build-Tools 35.0.0
   - NDK 27.x (for Hermes)
   - CMake 3.22+

### Environment Variables (Windows)

Add to System Environment Variables:
```
ANDROID_HOME = C:\Users\<YOU>\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr
```

Add to PATH:
```
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\emulator
```

### Environment Variables (macOS/Linux)

Add to `~/.zshrc` or `~/.bashrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH=$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH
```

---

## Step 1: Clone & Install

```bash
git clone https://github.com/twinfusion-ke/cultural-heritage-app.git
cd cultural-heritage-app
npm install
```

---

## Step 2: Generate Native Android Project

```bash
npx expo prebuild --platform android --clean
```

This creates the `android/` folder with:
```
android/
├── app/
│   ├── build.gradle              # App-level Gradle config
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/twinfusion/culturalheritage/
│   │       │   ├── MainActivity.kt
│   │       │   └── MainApplication.kt
│   │       ├── res/
│   │       │   ├── drawable/       # Splash screen
│   │       │   ├── mipmap-*/       # App icons (all densities)
│   │       │   ├── values/         # Styles, colors, strings
│   │       │   └── xml/            # Network security config
│   │       └── assets/             # JS bundle, fonts, images
│   └── proguard-rules.pro
├── build.gradle                   # Root Gradle config
├── gradle.properties              # JVM args, Hermes, Fabric
├── settings.gradle
└── gradle/
    └── wrapper/
        └── gradle-wrapper.properties
```

---

## Step 3: Open in Android Studio

1. Open Android Studio
2. **File > Open** → select `cultural-heritage-app/android/`
3. Wait for Gradle sync to complete (first time takes 5-10 minutes)
4. If prompted "SDK not found", click **Fix** and point to your SDK location

---

## Step 4: Connect Device or Emulator

### Physical Device (Recommended)
1. Enable **Developer Options** on your Android phone (Settings > About > tap Build Number 7 times)
2. Enable **USB Debugging** in Developer Options
3. Connect via USB
4. Accept the USB debugging prompt on your phone
5. Verify: `adb devices` should show your device

### Emulator
1. Android Studio > **Device Manager** (right sidebar)
2. Create Virtual Device > Pixel 7 > API 34
3. Download system image if needed
4. Start the emulator

---

## Step 5: Run the App

### From Android Studio
1. Select your device in the toolbar dropdown
2. Click **Run** (green play ▶ button) or press `Shift+F10`
3. Wait for build + install (first build takes 3-5 minutes)

### From Terminal
```bash
cd cultural-heritage-app
npx expo run:android
```

---

## Step 6: Build APK / AAB

### Debug APK (for testing)
```bash
cd android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for distribution)
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

### Release AAB (for Google Play Store)
```bash
cd android
./gradlew bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Signing Configuration

### Debug Signing (automatic)
Android Studio uses the debug keystore at:
```
~/.android/debug.keystore
```

### Release Signing

1. Generate a keystore:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore cultural-heritage.keystore -alias cultural-heritage -keyalg RSA -keysize 2048 -validity 10000
```

2. Add to `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('cultural-heritage.keystore')
            storePassword 'YOUR_STORE_PASSWORD'
            keyAlias 'cultural-heritage'
            keyPassword 'YOUR_KEY_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. Or use `gradle.properties` (keep out of git):
```properties
MYAPP_UPLOAD_STORE_FILE=cultural-heritage.keystore
MYAPP_UPLOAD_KEY_ALIAS=cultural-heritage
MYAPP_UPLOAD_STORE_PASSWORD=YOUR_STORE_PASSWORD
MYAPP_UPLOAD_KEY_PASSWORD=YOUR_KEY_PASSWORD
```

---

## Android Permissions

Already configured in `app.json` → generated into `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
```

---

## Native Modules Included

| Module | Purpose | Gradle Dependency |
|--------|---------|-------------------|
| expo-camera | QR code scanning | Auto-linked |
| expo-location | GPS tagging | Auto-linked |
| expo-av | Video/audio playback | Auto-linked |
| expo-sqlite | Offline database | Auto-linked |
| expo-image | Fast image loading + cache | Auto-linked |
| expo-font | Custom fonts | Auto-linked |
| expo-navigation-bar | Transparent nav bar | Auto-linked |
| expo-linking | Deep links + URL opening | Auto-linked |
| react-native-webview | WordPress HTML rendering | Auto-linked |
| react-native-safe-area-context | Edge-to-edge layout | Auto-linked |
| react-native-screens | Native screen management | Auto-linked |
| @react-native-async-storage | Persistent storage | Auto-linked |
| @react-native-community/netinfo | Network detection | Auto-linked |

All modules are auto-linked by Expo — no manual linking required.

---

## Project Configuration Files

### `android/app/build.gradle` (key sections)

```gradle
android {
    namespace "com.twinfusion.culturalheritage"
    compileSdk 35
    defaultConfig {
        applicationId "com.twinfusion.culturalheritage"
        minSdk 24
        targetSdk 35
        versionCode 4
        versionName "2.0.0"
    }
}
```

### `android/gradle.properties`

```properties
android.useAndroidX=true
android.enableJetifier=true
hermesEnabled=true
newArchEnabled=false
org.gradle.jvmargs=-Xmx4096m
```

---

## Debugging

### React Native Debugger
1. Run the app
2. Shake device or press `Ctrl+M` in emulator
3. Select **Debug JS Remotely** or **Open DevTools**

### Logcat (Android Studio)
1. View > Tool Windows > Logcat
2. Filter by: `ReactNative` or `com.twinfusion.culturalheritage`

### Metro Bundler Logs
```bash
npx expo start --android
# Metro logs appear in this terminal
```

### ADB Commands
```bash
# List connected devices
adb devices

# Install APK manually
adb install app-debug.apk

# View app logs
adb logcat *:E | grep -i "cultural\|react\|expo"

# Clear app data
adb shell pm clear com.twinfusion.culturalheritage

# Uninstall
adb uninstall com.twinfusion.culturalheritage
```

---

## Common Build Errors & Fixes

| Error | Fix |
|-------|-----|
| `SDK location not found` | Set `ANDROID_HOME` env variable or create `android/local.properties` with `sdk.dir=C:\\Users\\YOU\\AppData\\Local\\Android\\Sdk` |
| `Could not determine java version` | Set `JAVA_HOME` to Android Studio's bundled JDK |
| `Execution failed for task ':app:mergeDebugResources'` | Run `cd android && ./gradlew clean` then rebuild |
| `Unable to load script` | Start Metro: `npx expo start` in a separate terminal |
| `Duplicate class` | Run `cd android && ./gradlew clean` and rebuild |
| `Out of memory` | Increase in `gradle.properties`: `org.gradle.jvmargs=-Xmx4096m` |
| `minSdk mismatch` | Ensure `minSdk 24` in `app/build.gradle` |
| `CMake not found` | Install CMake via Android Studio > SDK Manager > SDK Tools |
| `NDK not found` | Install NDK via SDK Manager > SDK Tools > NDK (Side by side) |

---

## Hot Reload & Development Workflow

1. Start Metro in terminal: `npx expo start`
2. Run app from Android Studio (or `npx expo run:android`)
3. Edit any `.tsx` file → app reloads automatically
4. Press `R` in Metro terminal to force reload
5. Shake device → Dev Menu → Toggle Inspector

---

## Updating After Code Changes

### JS-only changes (screens, components, styles)
No rebuild needed — Metro hot-reloads automatically.

### Native module changes (new Expo plugin, app.json change)
```bash
npx expo prebuild --platform android --clean
```
Then rebuild from Android Studio.

### Dependencies update
```bash
npm install
npx expo prebuild --platform android --clean
# Rebuild from Android Studio
```

---

## Google Play Store Submission

1. Build AAB: `cd android && ./gradlew bundleRelease`
2. Go to https://play.google.com/console
3. Create app > Upload AAB
4. Fill in: description, screenshots, content rating, pricing
5. Submit for review

### Required Assets
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Screenshots: min 2, phone + tablet
- Short description: max 80 chars
- Full description: max 4000 chars
- Privacy policy URL

---

## API Connection

The app connects to:
```
https://twinfusion.co.ke/cultural-heritage/app-api/?action=<endpoint>
```

29 endpoints — see COMPLETE-BUILD-GUIDE.md for full list.

To change the API URL at runtime:
1. Open app > More tab
2. Tap version number 5 times (hidden admin)
3. Change the domain field
4. Tap Save

---

## File Reference

| File | Purpose |
|------|---------|
| `App.tsx` | Root component — ErrorBoundary, QueryClient, Navigation |
| `app.json` | Expo config — plugins, permissions, icons, splash |
| `eas.json` | EAS Build profiles |
| `src/navigation/TabNavigator.tsx` | 6 tabs + 15 stack screens |
| `src/api/appApi.ts` | Main API client |
| `src/stores/` | 6 Zustand stores (auth, cart, env, favorites, compare, ui) |
| `src/db/` | SQLite schema, cache, outbox |
| `src/theme/` | Colors, typography, spacing for 4 divisions |
| `api/index.php` | PHP backend (29 endpoints) |

---

*Cultural Heritage Centre — v2.0.0*
*Built March–April 2026*
