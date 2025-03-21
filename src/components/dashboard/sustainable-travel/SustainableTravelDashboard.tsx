import React, { useState, useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../DashboardSidebar';
import SustainableTravelHome from './SustainableTravelHome';
import RouteCalculator from './RouteCalculator';
import TravelInsights from './TravelInsights';
import TravelHistory from './TravelHistory';
import { Loader2 } from 'lucide-react';

const SustainableTravelDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const dashboardType = localStorage.getItem('dashboardType');
    
    // If not authenticated, redirect to login immediately
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    
    // If authenticated but no dashboard type is set, set it
    if (!dashboardType) {
      localStorage.setItem('dashboardType', 'sustainable-travel');
    }
    
    // Simulate loading
    setTimeout(() => {
      setAuthenticated(isAuthenticated);
      setLoading(false);
    }, 500);
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }
  
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <DashboardSidebar type="sustainable-travel" />
      
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<SustainableTravelHome />} />
          <Route path="/calculator" element={<RouteCalculator />} />
          <Route path="/insights" element={<TravelInsights />} />
          <Route path="/history" element={<TravelHistory />} />
          <Route path="/settings" element={<div className="p-6">Settings Page</div>} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default SustainableTravelDashboard; 