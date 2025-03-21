import React, { useState, useEffect } from "react";
import AwsCredentialsForm from "../enterprise/AwsCredentialsForm";
import AwsUsageDisplay from "../enterprise/AwsUsageDisplay";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CloudServices = () => {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cloud Services</CardTitle>
          <CardDescription>
            Monitor and manage your cloud service usage and emissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="aws" className="w-full">
            <TabsList>
              <TabsTrigger value="aws">AWS</TabsTrigger>
              <TabsTrigger value="azure">Azure</TabsTrigger>
              <TabsTrigger value="gcp">Google Cloud</TabsTrigger>
            </TabsList>
            <TabsContent value="aws">
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
            </TabsContent>
            <TabsContent value="azure">
              <div className="text-center py-8 text-muted-foreground">
                Azure cloud services integration coming soon.
              </div>
            </TabsContent>
            <TabsContent value="gcp">
              <div className="text-center py-8 text-muted-foreground">
                Google Cloud services integration coming soon.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloudServices;
