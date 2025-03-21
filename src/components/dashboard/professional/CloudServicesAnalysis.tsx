import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Cloud,
  Server,
  Database,
  HardDrive,
  BarChart3,
  Download,
  Upload,
  Plus,
  Loader2,
  Cpu,
  Network,
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ScrollArea,
  ScrollBar
} from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Form schema
const usageFormSchema = z.object({
  provider: z.enum(['aws', 'azure', 'gcp']),
  region: z.string().min(1, 'Please select a region'),
  compute: z.object({
    instanceType: z.string().min(1, 'Instance type is required'),
    cpuUtilization: z.number().min(0).max(100),
    runningHours: z.number().min(0).max(744), // Max hours in a month
    instanceCount: z.number().min(1)
  }),
  storage: z.object({
    storageType: z.string().min(1, 'Storage type is required'),
    sizeGB: z.number().min(0),
    accessFrequency: z.number().min(0).max(100)
  }),
  network: z.object({
    dataTransferGB: z.number().min(0),
    cdnUsage: z.boolean()
  })
});

type UsageFormData = z.infer<typeof usageFormSchema>;

interface CloudMetrics {
  compute: number;
  storage: number;
  network: number;
  total: number;
  timestamp: string;
}

interface CloudProvider {
  aws: {
    regions: string[];
    instanceTypes: string[];
    storageTypes: string[];
  };
  azure: {
    regions: string[];
    instanceTypes: string[];
    storageTypes: string[];
  };
  gcp: {
    regions: string[];
    instanceTypes: string[];
    storageTypes: string[];
  };
}

const cloudProviders: CloudProvider = {
  aws: {
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    instanceTypes: ['t2.micro', 't2.small', 't2.medium', 't3.small', 't3.medium'],
    storageTypes: ['gp2', 'gp3', 'io1', 'st1', 'sc1']
  },
  azure: {
    regions: ['eastus', 'northeurope', 'southeastasia'],
    instanceTypes: ['B1s', 'B2s', 'D2s_v3', 'D4s_v3', 'E2s_v3'],
    storageTypes: ['Standard_LRS', 'Premium_LRS', 'StandardSSD_LRS']
  },
  gcp: {
    regions: ['us-east1', 'europe-west1', 'asia-southeast1'],
    instanceTypes: ['e2-micro', 'e2-small', 'e2-medium', 'n1-standard-1', 'n1-standard-2'],
    storageTypes: ['pd-standard', 'pd-balanced', 'pd-ssd']
  }
};

interface MetricCardProps {
  title: string;
  value: number;
  unit: string;
  trend?: number;
  icon?: React.ReactNode;
}

const MetricCard = ({ title, value, unit, trend, icon }: MetricCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value.toFixed(2)} {unit}</div>
      {trend !== undefined && (
        <p className={cn("text-xs", trend >= 0 ? "text-green-500" : "text-red-500")}>
          {trend >= 0 ? "+" : ""}{trend.toFixed(1)}% from previous period
        </p>
      )}
    </CardContent>
  </Card>
);

const CloudServicesAnalysis = () => {
  const [selectedProvider, setSelectedProvider] = useState<keyof CloudProvider>('aws');
  const [timeRange, setTimeRange] = useState('week');
  const [usageData, setUsageData] = useState<CloudMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const { toast } = useToast();
  // const { theme, setTheme } = useTheme();

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  };

  // Configure axios headers
  const getAxiosConfig = () => {
    const token = getAuthToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  const form = useForm<UsageFormData>({
    resolver: zodResolver(usageFormSchema),
    defaultValues: {
      provider: 'aws',
      region: '',
      compute: {
        instanceType: '',
        cpuUtilization: 0,
        runningHours: 0,
        instanceCount: 1
      },
      storage: {
        storageType: '',
        sizeGB: 0,
        accessFrequency: 0
      },
      network: {
        dataTransferGB: 0,
        cdnUsage: false
      }
    }
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in to access cloud usage data",
        variant: "destructive"
      });
      return;
    }
    fetchUsageData();
    fetchRecommendations();
  }, [selectedProvider, timeRange]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      console.log('Fetching data with params:', { provider: selectedProvider, timeframe: timeRange });
      
      const response = await axios.get('/api/cloud-usage/history', {
        ...getAxiosConfig(),
        params: {
          provider: selectedProvider,
          timeframe: timeRange,
          startDate: getStartDate(timeRange),
          endDate: new Date().toISOString()
        }
      });

      console.log('API Response:', response.data);

      if (response.data.success && response.data.data) {
        const formattedData = response.data.data.usage.map((item: any) => ({
          compute: Number(item.compute) || 0,
          storage: Number(item.storage) || 0,
          network: Number(item.network) || 0,
          total: Number(item.total) || 0,
          timestamp: item.timestamp
        }));
        
        console.log('Formatted data:', formattedData);
        setUsageData(formattedData);
      } else {
        console.warn('No data received from API');
        setUsageData([]);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          data: error.response?.data
        });
        
        if (error.response?.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to continue",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: error.response?.data?.message || "Failed to fetch usage data",
            variant: "destructive"
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate start date based on time range
  const getStartDate = (range: string) => {
    const now = new Date();
    switch (range) {
      case 'hourly':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case 'daily':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'weekly':
        return new Date(now.getTime() - 4 * 7 * 24 * 60 * 60 * 1000).toISOString();
      case 'monthly':
        return new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get('/api/cloud-usage/recommendations', getAxiosConfig());
      setRecommendations(response.data.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to continue",
          variant: "destructive"
        });
      }
    }
  };

  const onSubmit = async (data: UsageFormData) => {
    try {
      console.log('Submitting data:', data);
      
      // Get auth token
      const token = getAuthToken();
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please log in to submit usage data",
          variant: "destructive"
        });
        return;
      }

      // Format the data to match the backend schema
      const formattedData = {
        provider: data.provider,
        region: data.region,
        metrics: {
          compute: {
            instanceType: data.compute.instanceType,
            cpuUtilization: Number(data.compute.cpuUtilization),
            runningHours: Number(data.compute.runningHours),
            instanceCount: Number(data.compute.instanceCount)
          },
          storage: {
            storageType: data.storage.storageType,
            sizeGB: Number(data.storage.sizeGB),
            accessFrequency: Number(data.storage.accessFrequency)
          },
          network: {
            dataTransferGB: Number(data.network.dataTransferGB),
            cdnUsage: Boolean(data.network.cdnUsage)
          }
        }
      };

      // Validate numbers are within acceptable ranges
      if (formattedData.metrics.compute.cpuUtilization < 0 || formattedData.metrics.compute.cpuUtilization > 100) {
        throw new Error('CPU Utilization must be between 0 and 100');
      }
      if (formattedData.metrics.compute.runningHours < 0 || formattedData.metrics.compute.runningHours > 744) {
        throw new Error('Running hours must be between 0 and 744');
      }
      if (formattedData.metrics.compute.instanceCount < 1) {
        throw new Error('Instance count must be at least 1');
      }
      if (formattedData.metrics.storage.sizeGB < 0) {
        throw new Error('Storage size must be positive');
      }
      if (formattedData.metrics.storage.accessFrequency < 0 || formattedData.metrics.storage.accessFrequency > 100) {
        throw new Error('Access frequency must be between 0 and 100');
      }
      if (formattedData.metrics.network.dataTransferGB < 0) {
        throw new Error('Data transfer must be positive');
      }

      console.log('Formatted data:', formattedData);

      const response = await axios.post('/api/cloud-usage', formattedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Server response:', response.data);

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Cloud usage data recorded successfully",
        });
        setShowUsageForm(false);
        fetchUsageData();
        fetchRecommendations();
      } else {
        throw new Error(response.data.message || 'Failed to record usage data');
      }
    } catch (error) {
      console.error('Error submitting usage data:', error);
      
      let errorMessage = 'Failed to record usage data';
      
      if (axios.isAxiosError(error)) {
        console.error('Server error details:', error.response?.data);
        
        if (error.response?.status === 401) {
          errorMessage = "Please log in again to continue";
        } else if (error.response?.status === 400) {
          errorMessage = error.response.data.message || 'Invalid data submitted';
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later';
        } else {
          errorMessage = error.response?.data?.message || errorMessage;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleProviderChange = (value: keyof CloudProvider) => {
    setSelectedProvider(value);
    form.setValue('provider', value);
    form.setValue('region', '');
  };

  // Helper function to get the latest metrics safely
  const getLatestMetrics = () => {
    const defaultMetrics = {
      compute: 0,
      storage: 0,
      network: 0,
      total: 0,
      timestamp: new Date().toISOString()
    };

    if (!usageData) return defaultMetrics;
    if (!Array.isArray(usageData)) return defaultMetrics;
    if (usageData.length === 0) return defaultMetrics;

    const latestData = usageData[usageData.length - 1];
    if (!latestData) return defaultMetrics;

    return {
      compute: Number(latestData.compute) || 0,
      storage: Number(latestData.storage) || 0,
      network: Number(latestData.network) || 0,
      total: Number(latestData.total) || 0,
      timestamp: latestData.timestamp || new Date().toISOString()
    };
  };

  const latestEmissions = getLatestMetrics();
  const trends = {
    compute: 0,
    storage: 0,
    network: 0,
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.location.href = '/login';
  };

  const handleSwitchDashboard = () => {
    document.location.href = '/dashboard/basic';
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <h2 className="text-2xl font-bold">Cloud Services Analysis</h2>
          <div className="flex items-center gap-4">
           
            
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-muted-foreground">
              Monitor and optimize your cloud services carbon footprint
            </p>
          </div>
          <div className="flex space-x-4">
            <Select value={selectedProvider} onValueChange={handleProviderChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aws">Amazon Web Services</SelectItem>
                <SelectItem value="azure">Microsoft Azure</SelectItem>
                <SelectItem value="gcp">Google Cloud Platform</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Last 24 Hours</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={showUsageForm} onOpenChange={setShowUsageForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Usage Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Record Cloud Usage</DialogTitle>
                  <DialogDescription>
                    Enter your cloud service usage details to calculate carbon emissions
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[calc(100vh-250px)]">
                  <Form {...form}>
                    <form className="space-y-6">
                      <div className="space-y-4 px-4">
                        <FormField
                          control={form.control}
                          name="region"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Region</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Region" />
                                </SelectTrigger>
                                <SelectContent>
                                  {cloudProviders[selectedProvider].regions.map((region) => (
                                    <SelectItem key={region} value={region}>
                                      {region}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Server className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-lg font-medium">Compute Resources</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                            <FormField
                              control={form.control}
                              name="compute.instanceType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instance Type</FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Instance Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {cloudProviders[selectedProvider].instanceTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="compute.cpuUtilization"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CPU Utilization (%)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="compute.runningHours"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Running Hours</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormDescription>Hours per month (max 744)</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="compute.instanceCount"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instance Count</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Database className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-lg font-medium">Storage</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                            <FormField
                              control={form.control}
                              name="storage.storageType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Storage Type</FormLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Storage Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {cloudProviders[selectedProvider].storageTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                          {type}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="storage.sizeGB"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Size (GB)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="storage.accessFrequency"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Access Frequency (%)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormDescription>How often the data is accessed</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Upload className="h-5 w-5 text-emerald-500" />
                            <h3 className="text-lg font-medium">Network</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                            <FormField
                              control={form.control}
                              name="network.dataTransferGB"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data Transfer (GB)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(Number(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormDescription>Monthly data transfer</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="network.cdnUsage"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>CDN Usage</FormLabel>
                                  <div className="flex items-center space-x-2 h-10">
                                    <FormControl>
                                      <input
                                        type="checkbox"
                                        checked={field.value}
                                        onChange={(e) => field.onChange(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                      />
                                    </FormControl>
                                    <span className="text-sm text-muted-foreground">Using Content Delivery Network</span>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button 
                            type="submit" 
                            className="w-full" 
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={form.formState.isSubmitting}
                          >
                            {form.formState.isSubmitting && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Submit Usage Data
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                  <ScrollBar />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                title="Compute Carbon Emissions"
                value={latestEmissions?.compute || 0}
                unit="kg CO2e"
                trend={trends?.compute}
                icon={<Cpu className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricCard
                title="Storage Carbon Emissions"
                value={latestEmissions?.storage || 0}
                unit="kg CO2e"
                trend={trends?.storage}
                icon={<Database className="h-4 w-4 text-muted-foreground" />}
              />
              <MetricCard
                title="Network Carbon Emissions"
                value={latestEmissions?.network || 0}
                unit="kg CO2e"
                trend={trends?.network}
                icon={<Network className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Carbon Emissions Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={usageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="compute" stroke="#8884d8" name="Compute" />
                      <Line type="monotone" dataKey="storage" stroke="#82ca9d" name="Storage" />
                      <Line type="monotone" dataKey="network" stroke="#ffc658" name="Network" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Recommendations</CardTitle>
                  <CardDescription>
                    Suggestions to reduce your cloud carbon footprint
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        {rec.category === 'compute' && (
                          <Server className="h-5 w-5 text-emerald-500 mt-0.5" />
                        )}
                        {rec.category === 'storage' && (
                          <Database className="h-5 w-5 text-emerald-500 mt-0.5" />
                        )}
                        {rec.category === 'network' && (
                          <Upload className="h-5 w-5 text-emerald-500 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium">{rec.suggestion}</p>
                          <p className="text-sm text-muted-foreground">
                            Potential saving: {rec.potentialSaving.toFixed(2)} kg CO₂e
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Carbon Intensity by Region</CardTitle>
                  <CardDescription>
                    Compare emissions across different cloud regions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cloudProviders[selectedProvider].regions.map((region) => {
                      const intensity = {
                        'us-east-1': 320,
                        'eu-west-1': 190,
                        'ap-southeast-1': 385,
                        'eastus': 310,
                        'northeurope': 180,
                        'southeastasia': 380,
                        'us-east1': 330,
                        'europe-west1': 200,
                        'asia-southeast1': 390,
                      }[region] || 300;
                      
                      return (
                        <div key={region} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{region}</p>
                            <div className="w-full bg-secondary h-2 rounded-full">
                              <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${(intensity / 400) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-medium">{intensity}g CO₂e/kWh</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CloudServicesAnalysis; 