import React, { useState, useEffect } from "react";
import AwsCredentialsForm from "./AwsCredentialsForm";
import AwsUsageDisplay from "./AwsUsageDisplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const AwsDashboard = () => {
  const [hasCredentials, setHasCredentials] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkCredentials();
  }, []);

  const checkCredentials = async () => {
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to check AWS credentials",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/aws/credentials",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setHasCredentials(true);
      }
    } catch (error) {
      console.error("Error checking AWS credentials:", error);
      toast({
        title: "Error",
        description: "Failed to check AWS credentials status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>AWS Cloud Services</CardTitle>
          <CardDescription>
            Monitor your AWS resource usage and track CO2 emissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasCredentials ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                To start tracking your AWS resource usage and CO2 emissions,
                please enter your AWS credentials below.
              </p>
              <AwsCredentialsForm />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-green-600">
                ✓ AWS credentials configured successfully
              </p>
              <AwsUsageDisplay />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AwsDashboard;
