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
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

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

interface AwsNetworkUsage {
  distributionId: string;
  dataTransferGB: number;
  co2Emissions: number;
  timestamp: string;
}

interface AwsS3Usage {
  bucketName: string;
  sizeGB: number;
  requests: number;
  co2Emissions: number;
  timestamp: string;
}

const AwsUsageDisplay = () => {
  const [instances, setInstances] = useState<AwsInstance[]>([]);
  const [networkUsage, setNetworkUsage] = useState<AwsNetworkUsage[]>([]);
  const [s3Usage, setS3Usage] = useState<AwsS3Usage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsageData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching AWS usage data...");

      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Fetch all data in parallel
      const [instancesRes, networkRes, s3Res] = await Promise.all([
        fetch("http://localhost:5000/api/aws/usage", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/aws/network-usage", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/aws/s3-usage", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!instancesRes.ok || !networkRes.ok || !s3Res.ok) {
        throw new Error("Failed to fetch AWS usage data");
      }

      const [instancesData, networkData, s3Data] = await Promise.all([
        instancesRes.json(),
        networkRes.json(),
        s3Res.json(),
      ]);

      setInstances(instancesData);
      setNetworkUsage(networkData);
      setS3Usage(s3Data);
    } catch (error) {
      console.error("Error fetching AWS usage data:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to fetch AWS usage data"
      );
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch AWS usage data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  // Calculate total CO2 emissions
  const totalCO2Emissions =
    instances.reduce((sum, instance) => sum + instance.co2Emissions, 0) +
    networkUsage.reduce((sum, network) => sum + network.co2Emissions, 0) +
    s3Usage.reduce((sum, s3) => sum + s3.co2Emissions, 0);

  // Prepare data for emissions by service chart
  const emissionsByService = [
    {
      name: "EC2 Instances",
      emissions: instances.reduce(
        (sum, instance) => sum + instance.co2Emissions,
        0
      ),
    },
    {
      name: "Network Transfer",
      emissions: networkUsage.reduce(
        (sum, network) => sum + network.co2Emissions,
        0
      ),
    },
    {
      name: "S3 Storage",
      emissions: s3Usage.reduce((sum, s3) => sum + s3.co2Emissions, 0),
    },
  ];

  // Prepare data for emissions over time chart
  const emissionsOverTime = instances.map((instance) => ({
    timestamp: new Date(instance.timestamp).toLocaleDateString(),
    emissions: instance.co2Emissions,
  }));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-red-500">{error}</p>
        <Button onClick={fetchUsageData}>Try Again</Button>
      </div>
    );
  }

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
            Total carbon dioxide emissions from all AWS services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            {totalCO2Emissions.toFixed(2)} kg CO2
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Service</CardTitle>
            <CardDescription>
              CO2 emissions breakdown by AWS service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emissionsByService}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="emissions"
                    fill="#4CAF50"
                    name="CO2 Emissions (kg)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Emissions Over Time</CardTitle>
            <CardDescription>
              CO2 emissions trend for EC2 instances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={emissionsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="emissions"
                    stroke="#4CAF50"
                    name="CO2 Emissions (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instances.length === 0 &&
        networkUsage.length === 0 &&
        s3Usage.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No AWS resources found. Make sure you have running resources in your
            AWS account.
          </div>
        ) : (
          <>
            {instances.map((instance) => (
              <Card key={instance.instanceId}>
                <CardHeader>
                  <CardTitle>EC2 Instance {instance.instanceId}</CardTitle>
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
                      <span className="font-medium">
                        {instance.runningHours}
                      </span>
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
            ))}

            {networkUsage.map((network) => (
              <Card key={network.distributionId}>
                <CardHeader>
                  <CardTitle>Network Transfer</CardTitle>
                  <CardDescription>
                    CloudFront Distribution {network.distributionId}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Data Transfer:</span>
                      <span className="font-medium">
                        {network.dataTransferGB.toFixed(2)} GB
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>CO2 Emissions:</span>
                      <span className="font-medium">
                        {network.co2Emissions.toFixed(2)} kg
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {s3Usage.map((s3) => (
              <Card key={s3.bucketName}>
                <CardHeader>
                  <CardTitle>S3 Bucket</CardTitle>
                  <CardDescription>{s3.bucketName}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="font-medium">
                        {s3.sizeGB.toFixed(2)} GB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Requests:</span>
                      <span className="font-medium">
                        {s3.requests.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>CO2 Emissions:</span>
                      <span className="font-medium">
                        {s3.co2Emissions.toFixed(2)} kg
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AwsUsageDisplay;
