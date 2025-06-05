# Fastlane Setup Guide

This guide will help you set up automated builds and distribution for both iOS and Android using Fastlane and Firebase App Distribution.

## Prerequisites

1. **Ruby** (2.5 or newer)
2. **Xcode** (for iOS builds)
3. **Android Studio** (for Android builds)
4. **Firebase Project** with App Distribution enabled
5. **Apple Developer Account** (for iOS)
6. **Google Play Console Account** (for Android keystore)

## Initial Setup

### 1. Install Dependencies

```bash
# Install Fastlane
gem install fastlane

# Install project dependencies
cd apps/mobile
bundle install

# Install Fastlane plugins
fastlane add_plugin firebase_app_distribution
```

### 2. Configure Environment Variables

Copy the template and fill in your values:
```bash
cp .env.template .env
```

Edit `.env` with your actual credentials and configuration.

## iOS Setup

### 1. App Store Connect API Key

1. Create an API key in App Store Connect
2. Download the `.p8` file
3. Place it in `./fastlane/AuthKey_YOUR_KEY_ID.p8`
4. Update the environment variables

### 2. Match Setup (Code Signing)

```bash
# Initialize Match (first time only)
fastlane match init

# Generate certificates and profiles
fastlane match development
```

### 3. Device Registration

1. Add device UDIDs to `./fastlane/devices.txt`
2. Run: `fastlane ios register_devices`

## Android Setup

### 1. Create Upload Keystore

```bash
keytool -genkey -v -keystore upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Place the keystore file in `./android/app/upload-keystore.jks`

### 2. Google Play Service Account

1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Place it in `./fastlane/google-play-service-account.json`

## Firebase App Distribution Setup

### 1. Get App IDs

1. Go to Firebase Console → Project Settings
2. Copy the App IDs for iOS and Android apps
3. Update the environment variables

### 2. Firebase CLI Token

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and get token
firebase login:ci
```

Copy the token to your environment variables.

## Usage

### Build and Deploy iOS

```bash
fastlane ios beta
```

### Build and Deploy Android

```bash
fastlane android beta
```

### Deploy Both Platforms

```bash
fastlane deploy_all
```

### Debug Commands

```bash
# Build Android debug APK
fastlane android debug

# Sync iOS certificates
fastlane ios sync_certs

# Register new iOS devices
fastlane ios register_devices
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase App Distribution

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.0'
          bundler-cache: true
          
      - name: Install dependencies
        run: |
          cd apps/mobile
          npm install
          bundle install
          
      - name: Deploy to Firebase App Distribution
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          TEAM_ID: ${{ secrets.TEAM_ID }}
          # ... add all other environment variables as secrets
        run: |
          cd apps/mobile
          fastlane deploy_all
```

## Troubleshooting

### Common Issues

1. **iOS Code Signing Errors**
   - Run `fastlane ios sync_certs`
   - Check that Match repository is accessible
   - Verify Apple Developer account permissions

2. **Android Build Errors**
   - Check keystore path and passwords
   - Verify Android SDK is properly installed
   - Ensure all environment variables are set

3. **Firebase Distribution Errors**
   - Verify Firebase CLI token is valid
   - Check App IDs are correct
   - Ensure Firebase App Distribution is enabled

### Reset Code Signing

If you encounter persistent iOS code signing issues:

```bash
# Nuke and regenerate certificates
fastlane match nuke development
fastlane match development
```

## Security Notes

1. **Never commit** `.env` files with real credentials
2. **Use CI secrets** for environment variables in CI/CD
3. **Rotate tokens** regularly
4. **Restrict API key** permissions to minimum required

## File Structure

```
fastlane/
├── Fastfile              # Main Fastlane configuration
├── Appfile               # App identifiers and credentials
├── Pluginfile            # Fastlane plugins
├── devices.txt           # iOS test devices
├── AuthKey_*.p8          # App Store Connect API key (don't commit)
└── google-play-service-account.json  # Google Play service account (don't commit)

.env                      # Environment variables (don't commit)
.env.template             # Environment template
Gemfile                   # Ruby dependencies
Gemfile.lock              # Ruby dependency lock file
```

## Next Steps

1. Complete the setup following this guide
2. Test the lanes locally first
3. Set up CI/CD integration
4. Configure team access to Firebase App Distribution
5. Set up notifications for build status (Slack, email, etc.)