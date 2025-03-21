import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import VerifyOtpPage from './VerifyOtpPage';
import ResetPasswordPage from './ResetPasswordPage';

/**
 * A simple routing component for authentication pages
 * This helps us avoid the need for a full router library
 */
const AuthRoutes = () => {
  const [currentPath, setCurrentPath] = useState('');
  
  useEffect(() => {
    // Get the current path on mount
    setCurrentPath(window.location.pathname);
    
    // Listen for path changes
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handleLocationChange);
    
    // Make sure dark mode is correctly applied based on user's selection from home page
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const storedTheme = localStorage.getItem('theme');
      
      if (storedTheme === 'dark' && !isDark) {
        document.documentElement.classList.add('dark');
      } else if (storedTheme === 'light' && isDark) {
        document.documentElement.classList.remove('dark');
      }
    };
    
    // Run on mount
    checkTheme();
    
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);
  
  // Render the appropriate component based on the path
  const renderAuthComponent = () => {
    switch (currentPath) {
      case '/signup':
        return <SignupPage />;
      case '/verify-otp':
        return <VerifyOtpPage />;
      case '/reset-password':
        return <ResetPasswordPage />;
      case '/login':
      default:
        return <LoginPage />;
    }
  };

  return renderAuthComponent();
};

export default AuthRoutes; 