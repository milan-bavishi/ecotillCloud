import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sprout, Mail, Lock, User, Building2, Briefcase, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { signup, SignupData } from '@/lib/api';
import { signInWithGoogle } from '@/lib/firebase-auth';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';

const industries = [
  "Agriculture & Forestry",
  "Energy & Utilities",
  "Manufacturing",
  "Transportation & Logistics",
  "Construction & Real Estate",
  "Information Technology",
  "Healthcare & Pharmaceuticals",
  "Education",
  "Retail & Consumer Goods",
  "Financial Services",
  "Other"
];

const SignupPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    fullName: '',
    occupation: '',
    industry: ''
  });
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    fullName: '',
    occupation: '',
    industry: ''
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
  
  const handleChange = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
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
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }
    
    // Full name validation
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
      valid = false;
    }
    
    // Occupation validation
    if (!formData.occupation) {
      newErrors.occupation = 'Occupation is required';
      valid = false;
    }
    
    // Industry validation
    if (!formData.industry) {
      newErrors.industry = 'Please select your industry';
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
        const response = await signup(formData);
        
        if (response.success) {
          // Store email for OTP verification
          localStorage.setItem('pendingVerificationEmail', formData.email);
          
          // Save user data to localStorage for later use
          localStorage.setItem('userData', JSON.stringify({
            email: formData.email,
            fullName: formData.fullName,
            occupation: formData.occupation,
            industry: formData.industry
          }));
          
          toast({
            title: "Signup successful",
            description: "Please check your email for verification code.",
            variant: "success"
          });
          
          // Navigate to OTP verification
          navigate('/verify-otp');
        } else {
          toast({
            title: "Signup failed",
            description: response.message || "Could not create account. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Signup failed",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive"
        });
        console.error("Signup error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        // Check if user needs to complete profile
        if (result.isNewUser) {
          toast({
            title: "Almost there!",
            description: "Please complete your profile to continue.",
            variant: "default"
          });
          
          // Save partial user data to localStorage
          if (result.user) {
            localStorage.setItem('userData', JSON.stringify(result.user));
          }
          
          // Navigate to profile completion page
          navigate('/complete-profile');
        } else {
          toast({
            title: "Signup successful",
            description: "Welcome to Eco सत्वा!",
            variant: "success"
          });
          
          // Save user data to localStorage if not already saved
          if (result.user && !localStorage.getItem('userData')) {
            localStorage.setItem('userData', JSON.stringify(result.user));
          }
          
          // Navigate to dashboard after successful signup
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
          title: "Signup failed",
          description: result.message || "Could not sign up with Google. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      console.error("Google signup error:", error);
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
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground mt-2">
            Join the sustainable movement and track your eco-friendly practices
          </p>
        </div>

        <Card className="border-border/50 shadow-lg bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 px-6 pt-6 pb-0">
            <h2 className="text-xl font-semibold">Sign Up</h2>
            <p className="text-sm text-muted-foreground">Enter your information to create an account</p>
          </CardHeader>
          
          <CardContent className="px-6 pt-4">
            <div className="mb-4">
              <Button 
                onClick={handleGoogleSignup}
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
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="fullName" 
                    placeholder="Full Name" 
                    className="pl-10"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                  />
                </div>
                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
              </div>
              
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
                    placeholder="Password (min. 8 characters)" 
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
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              
              <div>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="occupation" 
                    placeholder="Your Occupation" 
                    className="pl-10"
                    value={formData.occupation}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                  />
                </div>
                {errors.occupation && <p className="text-sm text-red-500">{errors.occupation}</p>}
              </div>
              
              <div>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select 
                    value={formData.industry} 
                    onValueChange={(value) => handleChange('industry', value)}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.industry && <p className="text-sm text-red-500">{errors.industry}</p>}
              </div>
              
              <div className="pt-2">
                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account
                    </>
                  ) : (
                    <>
                      Create account
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
                Already have an account?{" "}
              </span>
              <a 
                href="/login" 
                className="text-emerald-500 hover:underline"
              >
                Sign in
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

export default SignupPage; 