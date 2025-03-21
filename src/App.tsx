import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { Preloader } from './components/landing/Preloader';
import Navbar from './components/landing/Navbar';
import HeroSection from './components/landing/HeroSection';
import ValueProposition from './components/landing/ValueProposition';
import EmissionsVisualizer from './components/landing/IndiaMap';
import Footer from './components/landing/Footer';
import FeaturesSection from './components/landing/FeaturesSection';
import ModuleNavigation from './components/landing/ModuleNavigation';
import EcoPledgeCanvas from './components/landing/EcoPledgeCanvas';
import LoginPage from './components/auth/LoginPage';
import LLMCarbonPromo from '././components/landing/LLMCarbonPromo';
import SignupPage from './components/auth/SignupPage';
import VerifyOtpPage from './components/auth/VerifyOtpPage';
import ResetPasswordPage from './components/auth/ResetPasswordPage';
import ProfileCompletionPage from './components/auth/ProfileCompletionPage';
import DashboardSelector from './components/dashboard/DashboardSelector';
import EnterpriseDashboard from './components/dashboard/enterprise/EnterpriseDashboard';
import ProfessionalDashboard from './components/dashboard/professional/ProfessionalDashboard';
import { Toaster } from './components/ui/toaster';
import './App.css';

// Authentication guard component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const LLMTrackerRoute = () => {
  // We'll allow access to this route without authentication
  return <Navigate to="/enterprise-dashboard/llm-carbon" replace />;
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure minimum display time for preloader for visual effect
    const minDisplayTime = 2500; // 2.5 seconds minimum display time
    const startTime = Date.now();
    
    // Function to hide preloader after minimum time and when page is loaded
    const hidePreloader = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minDisplayTime - elapsedTime);
      
      // Ensure preloader shows for at least minDisplayTime
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    };
    
    // Hide preloader when all assets are loaded
    if (document.readyState === 'complete') {
      hidePreloader();
    } else {
      window.addEventListener('load', hidePreloader);
      // Fallback in case load event doesn't fire
      setTimeout(hidePreloader, 5000); // Maximum 5 seconds display time
      
      return () => {
        window.removeEventListener('load', hidePreloader);
      };
    }
  }, []);

  // Main app layout component
  const MainLayout = () => (
    <>
      <AnimatePresence mode="wait">
        {loading && <Preloader />}
      </AnimatePresence>
      <Navbar />
      <main>
        <HeroSection />
        <ValueProposition />
        <FeaturesSection />
        <LLMCarbonPromo />
        <EmissionsVisualizer />
        <ModuleNavigation />
        <EcoPledgeCanvas />
      </main>
      <Footer />
    </>
  );

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/complete-profile" element={<ProfileCompletionPage />} />
        <Route path="/llm-carbon-tracker" element={<LLMTrackerRoute />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Navigate to="/dashboard-selector" replace />} />
        <Route 
          path="/dashboard-selector" 
          element={
            <AuthGuard>
              <DashboardSelector />
            </AuthGuard>
          } 
        />
        <Route 
          path="/enterprise-dashboard/*" 
          element={
            <AuthGuard>
              <EnterpriseDashboard />
            </AuthGuard>
          } 
        />
        <Route 
          path="/professional-dashboard/*" 
          element={
            <AuthGuard>
              <ProfessionalDashboard />
            </AuthGuard>
          } 
        />
        
        {/* Redirect sustainable travel dashboard routes to professional dashboard */}

        <Route 
          path="/sustainable-travel-dashboard" 
          element={<Navigate to="/professional-dashboard/sustainable-travel" replace />} 
        />
        <Route 
          path="/sustainable-travel-dashboard/calculator" 
          element={<Navigate to="/professional-dashboard/sustainable-travel" replace />} 
        />
        <Route 
          path="/sustainable-travel-dashboard/insights" 
          element={<Navigate to="/professional-dashboard/travel-insights" replace />} 
        />
        <Route 
          path="/sustainable-travel-dashboard/history" 
          element={<Navigate to="/professional-dashboard/travel-history" replace />} 
        />
        <Route 
          path="/sustainable-travel-dashboard/*" 
          element={<Navigate to="/professional-dashboard/sustainable-travel" replace />} 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;