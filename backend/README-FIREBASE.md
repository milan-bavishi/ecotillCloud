# Firebase Authentication Setup

This guide explains how to set up Firebase Authentication for the EcoSattva application.

## Prerequisites

- Node.js and npm installed
- Firebase account

## Setup Steps

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the prompts to create a new Firebase project
3. Enable Google Analytics if desired

### 2. Set Up Authentication

1. In your Firebase project, navigate to "Authentication" from the left menu
2. Click the "Get started" button
3. In the "Sign-in method" tab, enable the "Google" provider
4. Configure any other providers you want to support (Email/Password, Facebook, etc.)

### 3. Create a Web Application

1. In your Firebase project, navigate to "Project settings" (gear icon in the top left)
2. Scroll down to "Your apps" section and click the web icon `</>`
3. Enter a nickname for your app (e.g., "EcoSattva Web")
4. (Optional) Check the "Also set up Firebase Hosting" checkbox
5. Click "Register app"
6. Note the Firebase SDK configuration shown on the screen, you'll need it for step 5

### 4. Generate a Service Account Key

1. In your Firebase project, navigate to "Project settings"
2. Go to the "Service accounts" tab
3. Click "Generate new private key" button
4. Save the JSON file securely

### 5. Configuration in the Application

1. Place the service account JSON file in the `backend` directory as `firebase-service-account.json`
   - **IMPORTANT**: Add this file to your `.gitignore` to prevent committing sensitive credentials
   
2. Update the Firebase configuration in `src/config/firebase.ts` with your web app's Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 6. Install Required Packages

Run the following commands to install required packages:

```bash
# For the backend
npm install firebase-admin

# For the frontend (already done)
npm install firebase
```

## Testing Firebase Authentication

1. Start your application
2. Try to sign in using the Google sign-in button
3. Check the browser console for any errors
4. Verify that the user is correctly created in your MongoDB database

## Troubleshooting

- If you see authentication errors, make sure your service account file is correctly placed and formatted
- If the Google sign-in popup doesn't appear, check if there are any popup blockers enabled
- If backend verification fails, check your server logs for more detailed error information

## Security Best Practices

- Never commit your service account key to version control
- Set appropriate security rules in your Firebase project
- Use environment variables for sensitive configuration in production
- Regularly audit your authentication methods and user database 