import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, ArrowRight, Trophy, Users, Target, Award } from "lucide-react";
import ReportWaste from "./ReportWaste";
import CollectWaste from "./CollectWaste";
import { useToast } from "@/components/ui/use-toast";

interface WasteStats {
  totalReports: number;
  totalCollections: number;
  totalPoints: number;
}

const ProfessionalGreenInitiatives: React.FC = () => {
  const [activeView, setActiveView] = useState<"main" | "report" | "collect">(
    "main"
  );
  const [stats, setStats] = useState<WasteStats>({
    totalReports: 0,
    totalCollections: 0,
    totalPoints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (activeView === "main") {
      fetchWasteStats();
    }
  }, [activeView]);

  const fetchWasteStats = async () => {
    try {
      const response = await fetch("/api/waste/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch waste statistics");
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch waste statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setActiveView("main");
  };

  const renderContent = () => {
    switch (activeView) {
      case "report":
        return <ReportWaste onBack={handleBack} onSuccess={fetchWasteStats} />;
      case "collect":
        return <CollectWaste onBack={handleBack} onSuccess={fetchWasteStats} />;
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Leaf className="h-8 w-8 text-emerald-500 mr-3" />
                <h1 className="text-3xl font-bold">Green Initiatives</h1>
              </div>
            </div>

            {/* Main Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Report Waste Card */}
              <Card
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => setActiveView("report")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-emerald-100 p-3 rounded-full mr-4">
                        <Target className="h-6 w-6 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Report Waste</h3>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Report waste in your area and help create a cleaner
                    environment.
                  </p>
                  <div className="flex items-center text-emerald-600">
                    <Trophy className="h-4 w-4 mr-1" />
                    <span className="text-sm">Earn points for reporting</span>
                  </div>
                </CardContent>
              </Card>

              {/* Collect Waste Card */}
              <Card
                className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => setActiveView("collect")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-emerald-100 p-3 rounded-full mr-4">
                        <Users className="h-6 w-6 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-semibold">Collect Waste</h3>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    Help collect reported waste and earn rewards for your
                    efforts.
                  </p>
                  <div className="flex items-center text-emerald-600">
                    <Award className="h-4 w-4 mr-1" />
                    <span className="text-sm">Earn rewards for collection</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Impact Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Total Reports</h3>
                    <Target className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">
                    {isLoading ? "..." : stats.totalReports}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Waste reports submitted
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Collections</h3>
                    <Users className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">
                    {isLoading ? "..." : stats.totalCollections}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Waste collections completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Points Earned</h3>
                    <Trophy className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">
                    {isLoading ? "..." : stats.totalPoints}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Total reward points
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return <div className="container mx-auto p-6">{renderContent()}</div>;
};

export default ProfessionalGreenInitiatives;
