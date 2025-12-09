# Firebase Auth Setup Guide

This guide will help you set up Firebase Authentication for the Studibudi app.

## Prerequisites

1. A Firebase project (create one at [Firebase Console](https://console.firebase.google.com/))
2. Firebase project ID: `student-budi` (or update the config)

## Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. If you don't have a web app, click "Add app" and select the web icon (</>)
7. Copy the configuration values

## Step 2: Configure Environment Variables

Create a `.env.local` file in the root of your project:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=student-budi
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id-here
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id-here

# API Configuration
# Local development (Firebase Emulator)
NEXT_PUBLIC_API_URL=http://localhost:5001/student-budi/us-central1/api

# Production
# NEXT_PUBLIC_API_URL=https://us-central1-student-budi.cloudfunctions.net/api
```

## Step 3: Enable Authentication Methods

### Email/Password Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Email/Password**
3. Enable the first toggle (Email/Password)
4. Click **Save**

### Google Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google**
3. Enable Google sign-in
4. Enter your project's support email
5. Click **Save**

### Apple Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Apple**
3. Enable Apple sign-in
4. Enter your Apple Services ID and other required information
5. Click **Save**

**Note:** Apple authentication requires additional setup:
- Apple Developer account
- Configure Sign in with Apple in Apple Developer Console
- Set up OAuth redirect URLs

## Step 4: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your development domain (e.g., `localhost`)
3. Add your production domain when ready

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/signup` and try creating an account
3. Navigate to `/login` and try signing in
4. Test Google OAuth (if enabled)
5. Test Apple OAuth (if enabled)

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure all environment variables are set correctly
- Restart your development server after adding environment variables

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to the authorized domains list in Firebase Console
- For local development, `localhost` should be automatically included

### OAuth Popup Blocked
- Check browser popup settings
- The app will show an error message if popup is blocked
- Consider using redirect flow for production

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- For local development, ensure Firebase Emulator is running
- Check that the backend API is accessible

## File Structure

```
lib/
  firebase/
    config.ts      # Firebase initialization
    auth.ts        # Auth helper functions
```

## Implementation Details

### Email/Password Flow
1. User enters email/password
2. Firebase Auth authenticates the user
3. Get ID token from Firebase
4. Send ID token to backend API
5. Backend validates and returns user data + custom token
6. Store token and user in app state

### OAuth Flow (Google/Apple)
1. User clicks OAuth button
2. Firebase Auth opens popup/redirect
3. User authenticates with provider
4. Get ID token from Firebase
5. Send ID token to backend API
6. Backend creates/updates user and returns user data + custom token
7. Store token and user in app state

## Next Steps

- [x] Set up Firebase project ✅
- [x] Configure environment variables ✅ (`.env.local` created)
- [ ] **Enable authentication methods** ⚠️ **ACTION REQUIRED**
  - [ ] Enable Email/Password in Firebase Console
  - [ ] Enable Google in Firebase Console
  - [ ] Enable Apple in Firebase Console (optional)
- [ ] Test email/password authentication
- [ ] Test Google OAuth
- [ ] Test Apple OAuth (if applicable)
- [ ] Configure production domains

## Current Status

**Code Implementation:** ✅ **100% Complete**
- All Firebase Auth code is implemented
- Environment variables are configured
- All auth flows are integrated

**Firebase Console Setup:** ⚠️ **Pending**
- Authentication methods need to be enabled in Firebase Console
- See `FIREBASE_SETUP_STATUS.md` for detailed status

**Quick Action:** Go to [Firebase Console](https://console.firebase.google.com/) → Authentication → Sign-in method → Enable Email/Password and Google

