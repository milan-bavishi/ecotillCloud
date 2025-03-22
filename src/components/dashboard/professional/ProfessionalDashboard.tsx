import React, { useState, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import DashboardSidebar from "../DashboardSidebar";
import ProfessionalDashboardHome from "./ProfessionalDashboardHome";
import ProfessionalFootprint from "./ProfessionalFootprint";
import ProfessionalInsights from "./ProfessionalInsights";
import RouteCalculator from "../sustainable-travel/RouteCalculator";
import TravelHistory from "../sustainable-travel/TravelHistory";
import TravelInsights from "../sustainable-travel/TravelInsights";
import CarbonTracker from "@/components/ecoiot/CarbonTracker";
import { Loader2 } from "lucide-react";
import CloudServices from "./CloudServices";
import ProfessionalGreenInitiatives from "./ProfessionalGreenInitiatives";

const ProfessionalDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const dashboardType = localStorage.getItem("dashboardType");

    // If not authenticated, redirect to login immediately
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    // If authenticated but no dashboard type is set, set it
    if (!dashboardType) {
      localStorage.setItem("dashboardType", "professional");
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
      <DashboardSidebar type="professional" />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ProfessionalDashboardHome />} />
          <Route path="/footprint" element={<ProfessionalFootprint />} />
          <Route path="/insights" element={<ProfessionalInsights />} />
          <Route path="/cloud-services" element={<CloudServices />} />
          <Route
            path="/green-initiatives"
            element={<ProfessionalGreenInitiatives />}
          />
          <Route
            path="/computing-impact"
            element={<div className="p-6">Computing Impact Analysis</div>}
          />
          <Route path="/carbon-tracker" element={<CarbonTracker />} />
          <Route path="/sustainable-travel" element={<RouteCalculator />} />
          <Route path="/travel-history" element={<TravelHistory />} />
          <Route path="/travel-insights" element={<TravelInsights />} />
          <Route
            path="/suggestions"
            element={<div className="p-6">Sustainability Suggestions Page</div>}
          />
          <Route
            path="/goals"
            element={<div className="p-6">Sustainability Goals Page</div>}
          />
          <Route
            path="/reports"
            element={<div className="p-6">Reports Page</div>}
          />
          <Route
            path="/settings"
            element={<div className="p-6">Settings Page</div>}
          />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
