# Firebase Setup Instructions

To complete the Firebase setup for push notifications, you need to:

## 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Add iOS and Android apps to your project

## 2. iOS Setup

### Download GoogleService-Info.plist
1. In Firebase Console, go to Project Settings
2. Select your iOS app
3. Download `GoogleService-Info.plist`
4. Place it in `/apps/mobile/ios/notify/` directory

### Update iOS Configuration
The iOS configuration should already be handled by React Native Firebase, but ensure:
- Your Bundle ID matches the one in Firebase Console
- Push Notifications capability is enabled in Xcode

## 3. Android Setup

### Download google-services.json
1. In Firebase Console, go to Project Settings
2. Select your Android app
3. Download `google-services.json`
4. Place it in `/apps/mobile/android/app/` directory

### Update Android Configuration
The Android configuration should already be handled by React Native Firebase.

## 4. Environment Variables (Optional)

If you want to use Firebase Admin SDK on your backend for sending push notifications:

```env
# Backend .env file
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="your-private-key"
```

## 5. Test Push Notifications

After setup, you can test by:
1. Running the app on a real device (simulators don't support push notifications)
2. Getting the FCM token from the console
3. Using Firebase Console to send a test message

## Important Notes

- **Never commit** `GoogleService-Info.plist` or `google-services.json` to version control
- Add these files to your `.gitignore`
- For production, consider using environment-specific Firebase projects
- iOS requires additional setup in Apple Developer Console for push notifications

## Next Steps

1. Add the configuration files as described above
2. Run `npx expo prebuild --clean` to regenerate native projects
3. For iOS: `cd ios && pod install`
4. Build and run on real devices to test notifications