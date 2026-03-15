# Phase 5: Android Deployment

**Date:** March 15, 2026

---

## 1. EAS Build Configuration

### eas.json Profiles

| Profile | Build Type | Distribution | Use Case |
|---------|-----------|-------------|----------|
| `development` | APK (debug) | Internal | Dev testing with Expo Go |
| `preview` | APK (release) | Internal | Share with testers, install directly |
| `production` | AAB (app-bundle) | Play Store | Google Play Store submission |

### Build Commands

```bash
# Preview APK (shareable, installable on any Android)
eas build --platform android --profile preview

# Production AAB (for Google Play Store)
eas build --platform android --profile production

# iOS (future — requires Apple Developer account)
eas build --platform ios --profile production
```

## 2. App Configuration

### app.json Key Settings

```json
{
  "name": "Cultural Heritage",
  "slug": "cultural-heritage-app",
  "version": "1.0.0",
  "android": {
    "package": "com.twinfusion.culturalheritage",
    "versionCode": 1,
    "permissions": ["INTERNET", "ACCESS_NETWORK_STATE", "ACCESS_FINE_LOCATION"]
  },
  "ios": {
    "bundleIdentifier": "com.twinfusion.culturalheritage"
  }
}
```

## 3. CI/CD Pipeline

### GitHub Actions Workflows

#### build-android.yml
- **Trigger:** Push to `master` branch
- **Action:** Builds Android APK via EAS
- **Requires:** `EXPO_TOKEN` secret in GitHub repo settings

#### deploy-wp.yml (for WordPress repo)
- **Trigger:** Push to `main` branch (themes/mu-plugins changes)
- **Action:** Deploys via SSH/SCP to cPanel
- **Requires:** `CPANEL_HOST`, `CPANEL_USER`, `CPANEL_PASSWORD`, `CPANEL_PORT` secrets

### Setting Up CI/CD

1. Create Expo account at https://expo.dev
2. Generate access token: Account Settings > Access Tokens
3. Add as `EXPO_TOKEN` secret in GitHub repo Settings > Secrets
4. Push to master → auto-builds Android APK
5. Download APK from https://expo.dev builds page

## 4. First Build Steps

```bash
# 1. Login to Expo
npx eas login

# 2. Link project to Expo account
npx eas init

# 3. Build preview APK (no Play Store needed)
npx eas build --platform android --profile preview

# 4. Download APK from the URL provided
# 5. Install on Android phone (enable "Unknown sources")
```

## 5. Google Play Store Submission (When Ready)

```bash
# 1. Build production AAB
eas build --platform android --profile production

# 2. Submit to Play Store
eas submit --platform android --profile production

# Requires google-services.json with service account key
```

## 6. Reuse Guide

For a new project:
1. Change `package` in app.json to your app's bundle ID
2. Update `name`, `slug`, `version`
3. Replace icon and splash assets
4. Set up new Expo account or use existing
5. Add `EXPO_TOKEN` to your GitHub repo
