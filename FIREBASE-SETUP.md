# Firebase Authentication Setup Guide

This guide will help you properly set up Firebase Authentication for your EcoSattva application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the prompts
3. Give your project a name (e.g., "EcoSattva")
4. Choose whether to enable Google Analytics (recommended)
5. Create the project

## Step 2: Register a Web App

1. From your Firebase project dashboard, click the web icon `</>` to add a web app
2. Give your app a nickname (e.g., "EcoSattva Web")
3. Check "Also set up Firebase Hosting" if you plan to use it
4. Click "Register app"
5. Copy the Firebase configuration object that appears

## Step 3: Update Your Project Configuration

1. Open `src/config/firebase.ts`
2. Replace the `firebaseConfig` object with the one you copied from Firebase Console
3. Save the file

## Step 4: Enable Google Authentication

1. In the Firebase Console, go to "Authentication" from the left sidebar
2. Click "Get started"
3. Select the "Sign-in method" tab
4. Click on "Google" in the list of providers
5. Toggle the "Enable" switch to on
6. Add a support email (typically your email)
7. Click "Save"

## Step 5: Configure Google Authentication

1. Go to Google Cloud Platform
2. Make sure your Firebase project is selected
3. Go to APIs & Services > OAuth consent screen
4. Select "External" user type
5. Fill in the required information:
   - App name
   - User support email
   - Developer contact information
6. Click "Save and Continue"
7. Add the scopes "email" and "profile"
8. Click "Save and Continue"
9. Add test users if needed
10. Click "Save and Continue"

## Step 6: Configure Authorized Domains

1. In Firebase Authentication, go to the "Settings" tab
2. Scroll down to "Authorized domains"
3. Make sure your development domain is listed (e.g., localhost)
4. Add any other domains where your app will run

## Common Errors

### "auth/configuration-not-found"

This error typically occurs when:
1. Your Firebase configuration is incorrect
2. Google Auth isn't properly enabled in your Firebase project
3. Your app domain isn't in the authorized domains list

### Solutions:

1. Double-check your `firebaseConfig` values against the Firebase Console
2. Ensure Google Authentication is enabled in Firebase Console
3. Make sure localhost (or your domain) is in the authorized domains list
4. Try using an incognito/private window to avoid cookie issues
5. Check browser console for more specific error messages

## Testing Your Setup

After following these steps, you should be able to sign in with Google without encountering the "auth/configuration-not-found" error. 