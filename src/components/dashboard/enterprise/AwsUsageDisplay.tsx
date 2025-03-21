import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

interface AwsInstance {
  instanceId: string;
  instanceType: string;
  region: string;
  runningHours: number;
  cpuUtilization: number;
  memoryUtilization: number;
  storageUsed: number;
  co2Emissions: number;
  timestamp: string;
}

const AwsUsageDisplay = () => {
  const [instances, setInstances] = useState<AwsInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsageData = async () => {
    try {
      setIsLoading(true);
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to view AWS usage data",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch("http://localhost:5000/api/aws/usage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch AWS usage data");
      }

      const data = await response.json();
      setInstances(data);
    } catch (error) {
      console.error("Error fetching AWS usage data:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch AWS usage data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  const totalCO2Emissions = instances.reduce(
    (sum, instance) => sum + instance.co2Emissions,
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AWS Resource Usage</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsageData}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total CO2 Emissions</CardTitle>
          <CardDescription>
            Total carbon dioxide emissions from all AWS instances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {totalCO2Emissions.toFixed(2)} kg CO2
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instances.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No AWS instances found. Make sure you have running EC2 instances in
            your AWS account.
          </div>
        ) : (
          instances.map((instance) => (
            <Card key={instance.instanceId}>
              <CardHeader>
                <CardTitle>Instance {instance.instanceId}</CardTitle>
                <CardDescription>{instance.instanceType}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Region:</span>
                    <span className="font-medium">{instance.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Running Hours:</span>
                    <span className="font-medium">{instance.runningHours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPU Utilization:</span>
                    <span className="font-medium">
                      {instance.cpuUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memory Utilization:</span>
                    <span className="font-medium">
                      {instance.memoryUtilization.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Used:</span>
                    <span className="font-medium">
                      {instance.storageUsed} GB
                    </span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>CO2 Emissions:</span>
                    <span className="font-medium">
                      {instance.co2Emissions.toFixed(2)} kg
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AwsUsageDisplay;
