import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sprout, Mail, ArrowRight, Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { requestPasswordReset, updatePassword, PasswordResetData, PasswordUpdateData } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [requestData, setRequestData] = useState<PasswordResetData>({
    email: ''
  });
  
  const [resetData, setResetData] = useState<PasswordUpdateData>({
    email: '',
    token: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check for dark mode on component mount
  useEffect(() => {
    const checkTheme = () => {
      const storedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDarkMode(false);
      }
    };
    
    checkTheme();
    
    // Check URL parameters for reset token
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    
    if (token && email) {
      setStep('reset');
      setResetData(prev => ({ 
        ...prev, 
        token,
        email
      }));
    }
  }, []);
  
  const handleRequestChange = (field: keyof PasswordResetData, value: string) => {
    setRequestData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  
  const handleResetChange = (field: keyof PasswordUpdateData, value: string) => {
    setResetData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateRequestForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    // Email validation
    if (!requestData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(requestData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  const validateResetForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    // Password validation
    if (!resetData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (resetData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }
    
    // Confirm password validation
    if (!resetData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      valid = false;
    } else if (resetData.confirmPassword !== resetData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateRequestForm()) {
      setIsLoading(true);
      
      try {
        const response = await requestPasswordReset(requestData);
        
        if (response.success) {
          toast({
            title: "Reset link sent",
            description: "Check your email for password reset instructions.",
            variant: "success"
          });
          
          // Navigate back to login page after sending reset link
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          toast({
            title: "Request failed",
            description: response.message || "Could not send reset link. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Request failed",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive"
        });
        console.error("Password reset request error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateResetForm()) {
      setIsLoading(true);
      
      try {
        const response = await updatePassword(resetData);
        
        if (response.success) {
          toast({
            title: "Password updated",
            description: "Your password has been successfully updated. You can now log in.",
            variant: "success"
          });
          
          // Navigate to login page after successful password reset
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          toast({
            title: "Update failed",
            description: response.message || "Could not update password. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Update failed",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive"
        });
        console.error("Password update error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // If token is invalid and we're on reset step, show an error
  useEffect(() => {
    if (step === 'reset' && (!resetData.token || !resetData.email)) {
      toast({
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired. Please request a new one.",
        variant: "destructive"
      });
      setStep('request');
    }
  }, [step, resetData.token, resetData.email, toast]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/5 p-4"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center justify-center mb-4">
            <Sprout className="h-8 w-8 text-emerald-500" strokeWidth={2.5} />
            <span className="text-2xl font-bold ml-2">Eco सत्वा</span>
          </a>
          <h1 className="text-3xl font-bold tracking-tight">
            {step === 'request' ? 'Reset your password' : 'Create new password'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {step === 'request' 
              ? 'Enter your email to receive a password reset link' 
              : 'Choose a strong, secure password for your account'}
          </p>
        </div>

        <Card className="border-border/50 shadow-lg bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 px-6 pt-6 pb-0">
            <h2 className="text-xl font-semibold">
              {step === 'request' ? 'Request password reset' : 'Set new password'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {step === 'request' 
                ? 'We\'ll send instructions to your email' 
                : 'Password must be at least 8 characters long'}
            </p>
          </CardHeader>
          
          <CardContent className="px-6 pt-4">
            {step === 'request' ? (
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Email Address" 
                      className="pl-10"
                      value={requestData.email}
                      onChange={(e) => handleRequestChange('email', e.target.value)}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending reset link
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                {!resetData.email && (
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="Email Address" 
                        className="pl-10"
                        value={resetData.email}
                        onChange={(e) => handleResetChange('email', e.target.value)}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                )}
                
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="New Password" 
                      className="pl-10 pr-10"
                      value={resetData.password}
                      onChange={(e) => handleResetChange('password', e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-transparent z-10"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>
                
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm New Password" 
                      className="pl-10 pr-10"
                      value={resetData.confirmPassword}
                      onChange={(e) => handleResetChange('confirmPassword', e.target.value)}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-transparent z-10"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating password
                      </>
                    ) : (
                      <>
                        Update password
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col items-center justify-center pt-0 pb-6 px-6">
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                {step === 'request' ? 'Remember your password?' : 'Changed your mind?'}
              </span>
              <a href="/login" className="ml-1 text-emerald-500 hover:underline">
                Back to login
              </a>
            </div>
            
            <div className="mt-6 flex items-center justify-center">
              <Sprout className="h-5 w-5 text-emerald-500 mr-2" />
              <p className="text-xs text-muted-foreground">
                Eco-friendly authentication powered by green servers
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
};

export default ResetPasswordPage; 