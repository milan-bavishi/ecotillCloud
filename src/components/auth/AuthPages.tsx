import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Sprout, Mail, Lock, User, ArrowRight, Check, Loader2 } from 'lucide-react';

// Simple Link component to replace react-router Link
const Link = ({ to, className, children }: { to: string; className?: string; children: React.ReactNode }) => (
  <a href={to} className={className}>
    {children}
  </a>
);

const AuthPages = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('login');
  
  // Form state for login
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Form state for signup
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState({
    login: {
      email: '',
      password: ''
    },
    signup: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: ''
    }
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle login logic here
      console.log('Login submitted:', loginForm);
    }, 1500);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle signup logic here
      console.log('Signup submitted:', signupForm);
    }, 1500);
  };

  // Update login form
  const updateLoginForm = (field: string, value: any) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };

  // Update signup form
  const updateSignupForm = (field: string, value: any) => {
    setSignupForm(prev => ({ ...prev, [field]: value }));
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
          <div className="inline-flex items-center justify-center mb-4">
            <Sprout className="h-8 w-8 text-primary" strokeWidth={2.5} />
            <span className="text-2xl font-bold ml-2">Eco સત્વા</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-2">
            {activeTab === 'login' ? 'Sign in to access your eco-friendly dashboard' : 'Join the sustainable movement today'}
          </p>
        </div>

        <Card className="border-border/50 shadow-lg bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10"
                      value={loginForm.email}
                      onChange={(e) => updateLoginForm('email', e.target.value)}
                      required
                    />
                  </div>
                  {formErrors.login.email && (
                    <p className="text-sm text-red-500">{formErrors.login.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="pl-10 pr-10"
                      value={loginForm.password}
                      onChange={(e) => updateLoginForm('password', e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formErrors.login.password && (
                    <p className="text-sm text-red-500">{formErrors.login.password}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    className="rounded border-border h-4 w-4 text-primary focus:ring-primary"
                    checked={loginForm.rememberMe}
                    onChange={(e) => updateLoginForm('rememberMe', e.target.checked)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">Remember me for 30 days</Label>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
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
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      className="pl-10"
                      value={signupForm.name}
                      onChange={(e) => updateSignupForm('name', e.target.value)}
                      required
                    />
                  </div>
                  {formErrors.signup.name && (
                    <p className="text-sm text-red-500">{formErrors.signup.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10"
                      value={signupForm.email}
                      onChange={(e) => updateSignupForm('email', e.target.value)}
                      required
                    />
                  </div>
                  {formErrors.signup.email && (
                    <p className="text-sm text-red-500">{formErrors.signup.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="signup-password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="pl-10 pr-10"
                      value={signupForm.password}
                      onChange={(e) => updateSignupForm('password', e.target.value)}
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formErrors.signup.password && (
                    <p className="text-sm text-red-500">{formErrors.signup.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="confirm-password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••" 
                      className="pl-10"
                      value={signupForm.confirmPassword}
                      onChange={(e) => updateSignupForm('confirmPassword', e.target.value)}
                      required
                    />
                  </div>
                  {formErrors.signup.confirmPassword && (
                    <p className="text-sm text-red-500">{formErrors.signup.confirmPassword}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    className="rounded border-border h-4 w-4 text-primary focus:ring-primary"
                    checked={signupForm.agreeToTerms}
                    onChange={(e) => updateSignupForm('agreeToTerms', e.target.checked)}
                    required
                  />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </Label>
                </div>
                {formErrors.signup.agreeToTerms && (
                  <p className="text-sm text-red-500">{formErrors.signup.agreeToTerms}</p>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
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
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col items-center justify-center pt-0 pb-6">
            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">
                {activeTab === 'login' ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button 
                type="button"
                onClick={() => setActiveTab(activeTab === 'login' ? 'signup' : 'login')} 
                className="text-primary hover:underline"
              >
                {activeTab === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
            
            <div className="mt-6 flex items-center justify-center">
              <Sprout className="h-5 w-5 text-primary mr-2" />
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

export default AuthPages; 