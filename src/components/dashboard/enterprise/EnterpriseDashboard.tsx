import React, { useState, useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import DashboardSidebar from "../DashboardSidebar";
import EnterpriseDashboardHome from "./EnterpriseDashboardHome";
import { Loader2 } from "lucide-react";
import LLMUsage from "./LLMUsage";
import AwsDashboard from "./AwsDashboard";

const EnterpriseDashboard = () => {
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
      localStorage.setItem("dashboardType", "enterprise");
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
      <DashboardSidebar type="enterprise" />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<EnterpriseDashboardHome />} />
          <Route
            path="/company"
            element={<div className="p-6">Company Profile Page</div>}
          />
          <Route
            path="/departments"
            element={<div className="p-6">Departments Page</div>}
          />
          <Route
            path="/trends"
            element={<div className="p-6">Emission Trends Page</div>}
          />
          <Route
            path="/reports"
            element={<div className="p-6">Reports Page</div>}
          />
          <Route
            path="/initiatives"
            element={<div className="p-6">Sustainability Initiatives Page</div>}
          />
          <Route
            path="/leaderboards"
            element={<div className="p-6">Leaderboards Page</div>}
          />
          <Route path="/llm-carbon" element={<LLMUsage />} />
          <Route path="/aws-cloud" element={<AwsDashboard />} />
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

export default EnterpriseDashboard;
