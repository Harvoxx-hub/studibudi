# Vercel Deployment Guide

## Required Environment Variables

For Firebase Authentication to work in production, you need to add the following environment variables in your Vercel project settings:

### Firebase Configuration Variables

1. **NEXT_PUBLIC_FIREBASE_API_KEY**
   - Get this from Firebase Console → Project Settings → Your apps → Web app config
   - Format: `AIzaSy...`

2. **NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**
   - Format: `your-project-id.firebaseapp.com`
   - Example: `student-budi.firebaseapp.com`

3. **NEXT_PUBLIC_FIREBASE_PROJECT_ID**
   - Your Firebase project ID
   - Example: `student-budi`

4. **NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
   - Format: `your-project-id.appspot.com`
   - Example: `student-budi.appspot.com`

5. **NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
   - Get this from Firebase Console → Project Settings → Your apps → Web app config
   - Format: `123456789012`

6. **NEXT_PUBLIC_FIREBASE_APP_ID**
   - Get this from Firebase Console → Project Settings → Your apps → Web app config
   - Format: `1:123456789012:web:abcdef123456`

### API Configuration

7. **NEXT_PUBLIC_API_URL**
   - Production backend API URL
   - Format: `https://us-central1-{project-id}.cloudfunctions.net/api`
   - Example: `https://us-central1-student-budi.cloudfunctions.net/api`

## How to Add Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: The variable name (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - **Value**: The actual value from your Firebase Console
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for changes to take effect

## Getting Firebase Configuration Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`student-budi`)
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select **Project settings**
5. Scroll down to **Your apps** section
6. Click on your web app (or create one if it doesn't exist)
7. Copy the configuration values from the `firebaseConfig` object

Example Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",                    // → NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "student-budi.firebaseapp.com", // → NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  projectId: "student-budi",              // → NEXT_PUBLIC_FIREBASE_PROJECT_ID
  storageBucket: "student-budi.appspot.com", // → NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789012",      // → NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789012:web:abcdef123456" // → NEXT_PUBLIC_FIREBASE_APP_ID
};
```

## Firebase Authorized Domains

Make sure your Vercel domain is added to Firebase authorized domains:

1. Go to Firebase Console → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Add your Vercel domain (e.g., `your-app.vercel.app`)
4. Add your custom domain if you have one

## After Adding Environment Variables

1. **Redeploy** your application in Vercel
2. The build will use the new environment variables
3. Test Google sign-in on your production site

## Troubleshooting

### "Firebase Auth is not configured"
- ✅ Check that all 6 Firebase environment variables are set in Vercel
- ✅ Make sure variable names start with `NEXT_PUBLIC_` (required for client-side access)
- ✅ Redeploy after adding environment variables

### "Unauthorized domain"
- ✅ Add your Vercel domain to Firebase authorized domains
- ✅ Check that `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` matches your Firebase project

### Google Sign-in not working
- ✅ Enable Google sign-in in Firebase Console → Authentication → Sign-in method
- ✅ Check that authorized domains include your Vercel URL
- ✅ Verify all environment variables are set correctly

## Quick Checklist

- [ ] All 6 Firebase environment variables added to Vercel
- [ ] `NEXT_PUBLIC_API_URL` set to production backend URL
- [ ] Vercel domain added to Firebase authorized domains
- [ ] Google sign-in enabled in Firebase Console
- [ ] Application redeployed after adding variables

