import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sprout, Building2, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/useToast';
import { completeUserProfile } from '@/lib/firebase-auth';

// Same industry list used in SignupPage
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

const ProfileCompletionPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    occupation: '',
    industry: ''
  });
  
  const [errors, setErrors] = useState({
    occupation: '',
    industry: ''
  });

  useEffect(() => {
    // Check if user is authenticated and profile needs completion
    const isProfileComplete = localStorage.getItem('isProfileComplete');
    const storedUserData = localStorage.getItem('userData');
    
    if (isProfileComplete === 'true') {
      // User already has a complete profile, redirect to dashboard
      localStorage.setItem('isAuthenticated', 'true');
      
      // Check if the user has a preferred dashboard type from before
      const dashboardType = localStorage.getItem('dashboardType');
      if (dashboardType === 'enterprise') {
        navigate('/enterprise-dashboard');
      } else if (dashboardType === 'professional') {
        navigate('/professional-dashboard');
      } else {
        navigate('/dashboard-selector');
      }
      return;
    }
    
    if (!storedUserData) {
      // No user data, redirect to login
      navigate('/login');
      return;
    }
    
    try {
      const parsedUserData = JSON.parse(storedUserData);
      setUserData(parsedUserData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);
  
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
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
        const response = await completeUserProfile(formData);
        
        if (response.success) {
          toast({
            title: "Profile completed",
            description: "Your profile has been successfully updated.",
            variant: "success"
          });
          
          // Update user data in localStorage with the new profile information
          const updatedUserData = {
            ...userData,
            occupation: formData.occupation,
            industry: formData.industry
          };
          localStorage.setItem('userData', JSON.stringify(updatedUserData));
          
          // Navigate to dashboard
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('isProfileComplete', 'true');
          
          // Check if the user has a preferred dashboard type from before
          const dashboardType = localStorage.getItem('dashboardType');
          if (dashboardType === 'enterprise') {
            navigate('/enterprise-dashboard');
          } else if (dashboardType === 'professional') {
            navigate('/professional-dashboard');
          } else {
            navigate('/dashboard-selector');
          }
        } else {
          toast({
            title: "Profile update failed",
            description: response.message || "Could not update profile. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Profile update failed",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive"
        });
        console.error("Profile completion error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!userData) {
    return <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>;
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Just a few more details to personalize your experience
          </p>
        </div>

        <Card className="border-border/50 shadow-lg bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 px-6 pt-6">
            <div className="flex items-center gap-4">
              {userData.photoUrl && (
                <img 
                  src={userData.photoUrl} 
                  alt={userData.fullName || 'User'} 
                  className="w-16 h-16 rounded-full border-2 border-primary/20"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold">Welcome, {userData.fullName}</h2>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="px-6 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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
              
              <Button 
                type="submit" 
                className="w-full mt-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  <>
                    Complete Profile
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ProfileCompletionPage; 