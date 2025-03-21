const admin = require("firebase-admin");

// Try to get firebase credentials from environment
let firebaseCredentials;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // If credentials are provided as a JSON string
    firebaseCredentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
} catch (error) {
  console.error("Error parsing Firebase credentials:", error);
}

// Initialize the admin SDK
if (!admin.apps.length) {
  // Check if we have credentials
  if (firebaseCredentials) {
    // Initialize with credentials
    admin.initializeApp({
      credential: admin.credential.cert(firebaseCredentials),
    });
  } else {
    // Initialize with application default credentials (ADC)
    // This will work if running on Firebase hosting or with local credentials
    admin.initializeApp();
  }
}

module.exports = admin;
