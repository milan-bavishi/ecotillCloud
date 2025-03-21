import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, User2, ChevronRight, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardSelector = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');

  // Check authentication
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    
    // If not authenticated, redirect to login page
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-background to-secondary/5 flex flex-col items-center justify-center p-4"
    >
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <Sprout className="h-10 w-10 text-emerald-500" strokeWidth={2.5} />
          <span className="text-3xl font-bold ml-2">Eco सत्वा</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Choose Your Dashboard</h1>
        <p className="text-muted-foreground max-w-md">
          Select the dashboard that best fits your needs. You can change this anytime from your profile settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Enterprise Dashboard Option */}
        <Card className="border-border/60 hover:border-emerald-500/60 hover:shadow-md transition-all duration-300 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-6 w-6 text-emerald-500" />
              Enterprise Module
            </CardTitle>
            <CardDescription>
              For businesses, corporations, and organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <ChevronRight className="mr-2 h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Company-wide carbon footprint overview</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="mr-2 h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Departmental breakdown of emissions</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="mr-2 h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Regulatory compliance & ESG reporting</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="mr-2 h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>AI-based optimization suggestions</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="mr-2 h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Team leaderboards & gamification</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700" 
              onClick={() => {
                localStorage.setItem('dashboardType', 'enterprise');
                navigate('/enterprise-dashboard');
              }}
            >
              Select Enterprise Dashboard
            </Button>
          </CardFooter>
        </Card>

        {/* Professional Dashboard Option */}
        <Card className="border-border/60 hover:border-emerald-500/60 hover:shadow-md transition-all duration-300 bg-card/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User2 className="mr-2 h-6 w-6 text-emerald-500" />
              Professional Module
            </CardTitle>
            <CardDescription>
              For individuals, freelancers, and remote workers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <ChevronRight className="mr-2 h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Personal carbon footprint tracking</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="mr-2 h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Mode of transportation analysis</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="mr-2 h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Digital wellbeing & energy consumption</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="mr-2 h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Personalized AI lifestyle suggestions</span>
              </li>
              <li className="flex items-start">
                <ChevronRight className="mr-2 h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Sustainability goals & achievements</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => {
                localStorage.setItem('dashboardType', 'professional');
                navigate('/professional-dashboard');
              }}
            >
              Select Professional Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>

      {userData.fullName && (
        <p className="mt-6 text-muted-foreground">
          Logged in as <span className="font-medium">{userData.fullName}</span>
        </p>
      )}
    </motion.div>
  );
};

export default DashboardSelector; 