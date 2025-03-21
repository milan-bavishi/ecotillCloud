import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sprout, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { login, LoginData } from '@/lib/api';
import { signInWithGoogle } from '@/lib/firebase-auth';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: ''
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
  }, []);
  
  const handleChange = (field: keyof LoginData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (typeof value === 'string' && errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
        const response = await login(formData);
        
        if (response.success) {
          toast({
            title: "Login successful",
            description: "Welcome back to Eco सत्वा!",
            variant: "success",
          });
          
          // Save user data to localStorage
          if (response.user) {
            localStorage.setItem('userData', JSON.stringify(response.user));
          } else {
            // If no user data is returned, create a basic user object with email
            localStorage.setItem('userData', JSON.stringify({
              email: formData.email,
              fullName: "Test User" // Fallback name for testing
            }));
          }
          
          // Navigate to dashboard after successful login
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
        } else {
          // Check if user needs to verify OTP
          if (response.needsVerification) {
            toast({
              title: "Account not verified",
              description: "Please check your email for the verification code.",
              variant: "default",
            });
            
            // Store email in localStorage for verification
            localStorage.setItem('pendingVerificationEmail', formData.email);
            
            // Navigate to OTP verification page
            navigate('/verify-otp');
          } else {
            toast({
              title: "Login failed",
              description: response.message || "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        toast({
          title: "Login failed",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
        console.error("Login error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        // Check if user is new and needs to complete profile
        if (result.isNewUser) {
          toast({
            title: "Almost there!",
            description: "Please complete your profile to continue.",
            variant: "default"
          });
          
          // Navigate to profile completion page
          navigate('/complete-profile');
        } else {
          toast({
            title: "Login successful",
            description: "Welcome to Eco सत्वा!",
            variant: "success"
          });
          
          // Save user data to localStorage if not already saved by the signInWithGoogle function
          if (result.user && !localStorage.getItem('userData')) {
            localStorage.setItem('userData', JSON.stringify(result.user));
          }
          
          // Navigate to dashboard after successful login
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
        }
      } else {
        toast({
          title: "Login failed",
          description: result.message || "Could not sign in with Google. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      console.error("Google login error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access your eco-friendly dashboard
          </p>
        </div>

        <Card className="border-border/50 shadow-lg bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 px-6 pt-6 pb-0">
            <h2 className="text-xl font-semibold">Sign In</h2>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
          </CardHeader>
          
          <CardContent className="px-6 pt-4">
            <div className="mb-4">
              <Button 
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                variant="outline" 
                className="w-full flex items-center justify-center"
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                Continue with Google
              </Button>
            </div>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>
            
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
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Password" 
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
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
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remember"
                      className="rounded border-border h-4 w-4 text-emerald-500 focus:ring-emerald-500"
                      checked={formData.rememberMe}
                      onChange={(e) => handleChange('rememberMe', e.target.checked)}
                    />
                    <span className="text-sm font-normal">Remember me for 30 days</span>
                  </div>
                  <a href="/reset-password" className="text-sm text-emerald-500 hover:underline">
                    Forgot password?
                  </a>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <div className="pt-2">
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center justify-center pt-0 pb-6 px-6">
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <a 
                href="/signup" 
                className="text-emerald-500 hover:underline"
              >
                Sign up
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

export default LoginPage; 