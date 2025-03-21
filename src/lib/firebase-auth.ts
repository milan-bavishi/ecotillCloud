import { 
  signInWithPopup, 
  signOut, 
  UserCredential,
  User 
} from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';

// Types
export interface FirebaseUserInfo {
  id: string;
  email: string | null;
  fullName: string | null;
  photoUrl: string | null;
  isVerified: boolean;
  isNewUser?: boolean;
}

/**
 * Convert Firebase user to our application's user format
 */
const formatFirebaseUser = (user: User): FirebaseUserInfo => {
  return {
    id: user.uid,
    email: user.email,
    fullName: user.displayName,
    photoUrl: user.photoURL,
    isVerified: user.emailVerified
  };
};

/**
 * Check if Firebase is properly configured
 */
const isFirebaseConfigured = (): boolean => {
  try {
    // Check if Firebase Auth is properly initialized
    return auth != null && googleProvider != null;
  } catch (error) {
    console.error('Firebase configuration check error:', error);
    return false;
  }
};

/**
 * Sign in with Google popup
 */
export const signInWithGoogle = async (): Promise<{ success: boolean; user?: FirebaseUserInfo; message?: string; isNewUser?: boolean }> => {
  try {
    // Check if Firebase is properly configured
    if (!isFirebaseConfigured()) {
      console.error('Firebase is not properly configured');
      return {
        success: false,
        message: 'Firebase authentication is not properly configured. Please use email login instead.'
      };
    }

    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Use an alternative approach to determine if user is new
    const isNewUser = false; // Default to false since we can't reliably detect
    
    // Format user data
    const formattedUser = formatFirebaseUser(user);
    formattedUser.isNewUser = isNewUser;
    
    // Save user data to local storage
    localStorage.setItem('authToken', await user.getIdToken());
    localStorage.setItem('userData', JSON.stringify(formattedUser));
    localStorage.setItem('isProfileComplete', isNewUser ? 'false' : 'true');
    
    console.log('Google sign-in successful:', formattedUser);
    
    return {
      success: true,
      user: formattedUser,
      isNewUser
    };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    return {
      success: false,
      message: error.message || 'Failed to sign in with Google'
    };
  }
};

/**
 * Sign out user
 */
export const signOutUser = async (): Promise<boolean> => {
  try {
    await signOut(auth);
    
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userData');
    
    return true;
  } catch (error) {
    console.error('Sign out error:', error);
    return false;
  }
};

/**
 * Get current Firebase auth user
 */
export const getCurrentFirebaseUser = (): FirebaseUserInfo | null => {
  const user = auth.currentUser;
  if (!user) return null;
  
  return formatFirebaseUser(user);
};

/**
 * Check if user is authenticated with Firebase
 */
export const isFirebaseAuthenticated = (): boolean => {
  return auth.currentUser !== null;
};

/**
 * Complete user profile with additional data
 */
export const completeUserProfile = async (profileData: {
  occupation: string;
  industry: string;
}): Promise<{ success: boolean; message?: string }> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }
    
    const token = await user.getIdToken();
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Send the data to your backend API
    const response = await fetch('/api/users/complete-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        fullName: user.displayName,
        photoUrl: user.photoURL,
        ...profileData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Failed to update profile'
      };
    }
    
    // Update local storage
    localStorage.setItem('isProfileComplete', 'true');
    userData.occupation = profileData.occupation;
    userData.industry = profileData.industry;
    localStorage.setItem('userData', JSON.stringify(userData));
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Profile completion error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to complete profile'
    };
  }
}; 