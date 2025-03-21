import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sprout, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { verifyOtp, resendOtp, OtpVerificationData } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

const VerifyOtpPage = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  const [formData, setFormData] = useState<OtpVerificationData>({
    email: '',
    otp: ''
  });
  
  const [errors, setErrors] = useState({
    email: '',
    otp: ''
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
    
    // Get the email from localStorage if it exists
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) {
      setFormData(prev => ({ ...prev, email: pendingEmail }));
    }
    
    // Start countdown for resend button
    startResendCountdown();
  }, []);
  
  const startResendCountdown = () => {
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  };
  
  const handleChange = (field: keyof OtpVerificationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Format OTP with spaces for better readability
    if (field === 'otp') {
      const digits = value.replace(/\D/g, '').substring(0, 6);
      setFormData(prev => ({ ...prev, otp: digits }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    // OTP validation
    if (!formData.otp) {
      newErrors.otp = 'Verification code is required';
      valid = false;
    } else if (formData.otp.length !== 6 || !/^\d+$/.test(formData.otp)) {
      newErrors.otp = 'Verification code must be 6 digits';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        const response = await verifyOtp(formData);
        
        if (response.success) {
          toast({
            title: "Verification successful",
            description: "Your account has been verified. Redirecting to dashboard...",
            variant: "success"
          });
          
          // Clear the pending verification email
          localStorage.removeItem('pendingVerificationEmail');
          
          // If response includes user data, update userData in localStorage
          if (response.user) {
            localStorage.setItem('userData', JSON.stringify(response.user));
          }
          
          // Navigate to dashboard after successful verification
          setTimeout(() => {
            localStorage.setItem('isAuthenticated', 'true');
          
            // Check if the user has a preferred dashboard type from before
            const dashboardType = localStorage.getItem('dashboardType');
            if (dashboardType === 'enterprise') {
              window.location.href = '/enterprise-dashboard';
            } else if (dashboardType === 'professional') {
              window.location.href = '/professional-dashboard';
            } else {
              window.location.href = '/dashboard-selector';
            }
          }, 1500);
        } else {
          toast({
            title: "Verification failed",
            description: response.message || "Invalid verification code. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Verification failed",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive"
        });
        console.error("OTP verification error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleResendOtp = async () => {
    if (!formData.email) {
      setErrors(prev => ({ ...prev, email: 'Email is required to resend code' }));
      return;
    }
    
    setIsResendingOtp(true);
    
    try {
      const response = await resendOtp(formData.email);
      
      if (response.success) {
        toast({
          title: "Code resent",
          description: "A new verification code has been sent to your email.",
          variant: "default"
        });
        
        startResendCountdown();
      } else {
        toast({
          title: "Failed to resend code",
          description: response.message || "Could not resend verification code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Failed to resend code",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
      console.error("Resend OTP error:", error);
    } finally {
      setIsResendingOtp(false);
    }
  };

  // Format OTP for display with spaces
  const formatOtp = (otp: string) => {
    return otp;
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Verify your email</h1>
          <p className="text-muted-foreground mt-2">
            Enter the verification code we sent to your email
          </p>
        </div>

        <Card className="border-border/50 shadow-lg bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 px-6 pt-6 pb-0">
            <h2 className="text-xl font-semibold">Enter verification code</h2>
            <p className="text-sm text-muted-foreground">Check your email for the 6-digit code</p>
          </CardHeader>
          
          <CardContent className="px-6 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Email Address" 
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={!!localStorage.getItem('pendingVerificationEmail')}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div>
                <Input 
                  id="otp" 
                  type="text"
                  placeholder="6-digit verification code" 
                  className="text-center text-lg tracking-widest"
                  value={formatOtp(formData.otp)}
                  onChange={(e) => handleChange('otp', e.target.value)}
                  maxLength={6}
                />
                {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
              </div>
              
              <div className="pt-2">
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying
                    </>
                  ) : (
                    <>
                      Verify Email
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center justify-center pt-0 pb-6 px-6">
            <div className="mt-4 text-center text-sm w-full">
              <span className="text-muted-foreground">
                Didn't receive the code?
              </span>
              {countdown > 0 ? (
                <span className="ml-1 text-muted-foreground">
                  Resend in {countdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResendingOtp}
                  className="ml-1 text-emerald-500 hover:underline focus:outline-none disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                >
                  {isResendingOtp ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Resend Code'
                  )}
                </button>
              )}
            </div>
            
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Remember your password?
              </span>
              <a href="/login" className="ml-1 text-emerald-500 hover:underline">
                Back to login
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </motion.div>
  );
};

export default VerifyOtpPage; 