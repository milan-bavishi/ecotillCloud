// Authentication API utility functions
export const API_BASE_URL = '/api';

// Types for authentication
export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  occupation: string;
  industry: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface OtpVerificationData {
  email: string;
  otp: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordUpdateData {
  email: string;
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  needsVerification?: boolean;
  userId?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    occupation: string;
    industry: string;
    createdAt: string;
  };
}

/**
 * Register a new user
 */
export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    // Call the real backend API
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    // Check if response is ok before parsing JSON
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Server error occurred';
      
      try {
        // Try to parse error as JSON
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch (e) {
        // If parsing fails, use the raw text if available
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      console.error(`Signup failed with status ${response.status}: ${errorMessage}`);
      return {
        success: false,
        message: errorMessage
      };
    }
    
    // For successful responses, check if there's content before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        message: 'Server returned invalid response format'
      };
    }
    
    const responseText = await response.text();
    if (!responseText) {
      return {
        success: false,
        message: 'Server returned empty response'
      };
    }
    
    const result = JSON.parse(responseText);
    
    // Save info to verify OTP later
    if (result.success) {
      // Store email for OTP verification
      localStorage.setItem('pendingVerificationEmail', data.email);
      
      // Store token for the session
      if (result.token) {
        sessionStorage.setItem('tempAuthToken', result.token);
      }
    }
    
    return result;
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Log in a user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    // Call the real backend API
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    // Save auth token on successful login
    if (result.success && result.token) {
      const storageType = data.rememberMe ? localStorage : sessionStorage;
      storageType.setItem('authToken', result.token);
      
      // Save user data
      if (result.user) {
        storageType.setItem('userData', JSON.stringify(result.user));
      }
    }
    
    return result;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Verify OTP code
 */
export const verifyOtp = async (data: OtpVerificationData): Promise<AuthResponse> => {
  try {
    // Check if email matches the pending verification email
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    
    if (!pendingEmail || pendingEmail !== data.email) {
      return {
        success: false,
        message: 'Invalid verification attempt. Please try signing up again.'
      };
    }
    
    // Call the real backend API
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Clear temporary verification data
      localStorage.removeItem('pendingVerificationEmail');
      
      // Get the temp token and convert it to a permanent one
      const tempToken = sessionStorage.getItem('tempAuthToken');
      if (tempToken) {
        sessionStorage.removeItem('tempAuthToken');
        localStorage.setItem('authToken', tempToken);
      }
    }
    
    return result;
  } catch (error) {
    console.error('OTP verification error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (data: PasswordResetData): Promise<AuthResponse> => {
  try {
    // Call the real backend API
    const response = await fetch(`${API_BASE_URL}/auth/reset-password-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return await response.json();
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Update password after reset
 */
export const updatePassword = async (data: PasswordUpdateData): Promise<AuthResponse> => {
  try {
    // Call the real backend API
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return await response.json();
  } catch (error) {
    console.error('Password update error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
};

/**
 * Logout the user
 */
export const logout = (): void => {
  // Clear all auth data
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('userData');
  
  // Redirect to home page
  window.location.href = '/';
};

/**
 * Check if the user is logged in
 */
export const isAuthenticated = (): boolean => {
  return !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
};

/**
 * Get authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

/**
 * Get current user data
 */
export const getCurrentUser = () => {
  const userDataString = localStorage.getItem('userData') || sessionStorage.getItem('userData');
  
  if (!userDataString) return null;
  
  try {
    return JSON.parse(userDataString);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Resend OTP verification code
 */
export const resendOtp = async (email: string): Promise<AuthResponse> => {
  try {
    // Call the real backend API
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Resend OTP error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}; 