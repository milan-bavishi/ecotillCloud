import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  WifiIcon,
  Plus,
  Save,
  BarChart2,
  ListIcon,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DataTable from "./DataTable";
import StatsOverview from "./StatsOverview";

// Demo authentication token for testing purposes
// const DEMO_TOKEN = "demo-token-for-testing";

interface CarbonReading {
  _id: string;
  deviceName: string;
  readingValue: number;
  readingUnit: string;
  deviceLocation: string;
  readingDate: string;
  notes: string;
}

const CarbonTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState("add");
  const [isLoading, setIsLoading] = useState(false);
  const [readings, setReadings] = useState<CarbonReading[]>([]);
  const [stats, setStats] = useState<any>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    deviceName: "",
    readingValue: "",
    readingUnit: "g/CO2",
    deviceLocation: "",
    notes: "",
  });

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userDataString = localStorage.getItem("userData");
    if (!userDataString) return null;

    try {
      return JSON.parse(userDataString);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      deviceName: "",
      readingValue: "",
      readingUnit: "g/CO2",
      deviceLocation: "",
      notes: "",
    });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.deviceName ||
      !formData.readingValue ||
      !formData.deviceLocation
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get current user data
      const userData = getCurrentUser();

      if (!userData) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to add readings",
          variant: "destructive",
        });
        return;
      }

      // Get token from localStorage
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description:
            "No valid authentication token found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Make API call to save the data
      const response = await fetch(`/api/carbon-tracker`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          readingValue: parseFloat(formData.readingValue),
          _userData: userData, // Pass user data to identify the user
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save reading");
      }

      toast({
        title: "Success",
        description: "Carbon reading added successfully.",
      });

      // Reset form and switch to data tab
      resetForm();
      fetchReadings();
      fetchStats();
      setActiveTab("data");
    } catch (error) {
      console.error("Error saving reading:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? `Failed to save reading: ${error.message}`
            : "Failed to save reading",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all readings
  const fetchReadings = async () => {
    try {
      setIsLoading(true);

      // Get current user data
      const userData = getCurrentUser();

      if (!userData) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to view readings",
          variant: "destructive",
        });
        return;
      }

      // Get token from localStorage
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description:
            "No valid authentication token found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // First try the GET endpoint, as this is more RESTful
      const response = await fetch(
        `/api/carbon-tracker?user=${userData.email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch readings");
      }

      setReadings(data.data);
    } catch (error) {
      console.error("Error fetching readings:", error);
      toast({
        title: "Error Loading Data",
        description:
          error instanceof Error
            ? `Failed to load carbon readings: ${error.message}`
            : "Failed to load carbon readings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const userData = getCurrentUser();

      console.log("Fetching stats, user data:", userData); // Log user data

      if (!userData || !userData.email) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to view statistics",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Get token from localStorage
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      console.log("Auth token exists:", !!token); // Log if token exists

      if (!token) {
        toast({
          title: "Authentication Error",
          description:
            "No valid authentication token found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const statsUrl = `/api/carbon-tracker/stats?user=${userData.email}`;
      console.log("Fetching stats from:", statsUrl); // Log the URL

      const response = await fetch(statsUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Stats API response:", data); // Log the API response

      if (data.success) {
        console.log("Setting stats:", data.data); // Log the stats data
        setStats(data.data);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch statistics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error Loading Statistics",
        description:
          error instanceof Error
            ? `Failed to load statistics: ${error.message}`
            : "Failed to load statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a reading
  const handleDelete = async (id: string) => {
    try {
      // Get current user data
      const userData = getCurrentUser();

      if (!userData) {
        toast({
          title: "Authentication Error",
          description: "You need to be logged in to delete readings",
          variant: "destructive",
        });
        return;
      }

      // Get token from localStorage
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Authentication Error",
          description:
            "No valid authentication token found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/carbon-tracker/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          _userData: userData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete reading");
      }

      toast({
        title: "Success",
        description: "Carbon reading deleted successfully.",
      });

      // Refresh data
      fetchReadings();
      fetchStats();
    } catch (error) {
      console.error("Error deleting reading:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? `Failed to delete reading: ${error.message}`
            : "Failed to delete reading",
        variant: "destructive",
      });
    }
  };

  // Load data on initial render
  useEffect(() => {
    console.log("CarbonTracker component mounted");

    // Check if user is logged in
    const userData = getCurrentUser();
    if (!userData || !userData.email) {
      console.log("No user data found in localStorage");
      toast({
        title: "Authentication Required",
        description: "Please log in to use the Carbon Tracker feature",
        variant: "destructive",
      });
      return;
    }

    console.log("User authenticated:", userData.email);

    // Check if token exists
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      console.log("No auth token in localStorage");
      toast({
        title: "Authentication Error",
        description:
          "No valid authentication token found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    // Fetch data
    fetchReadings().catch((error) => {
      console.error("Error in fetchReadings:", error);
    });

    fetchStats().catch((error) => {
      console.error("Error in fetchStats:", error);
    });
  }, []);

  return (
    <div className="container p-6 mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <WifiIcon className="h-8 w-8 text-emerald-500" />
        <h1 className="text-3xl font-bold">Carbon Tracker</h1>
      </div>

      <p className="text-muted-foreground mb-8">
        Track carbon emissions from your devices and see your environmental
        impact.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="add" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Reading</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <ListIcon className="h-4 w-4" />
            <span>View Data</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Statistics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add Carbon Emission Reading</CardTitle>
              <CardDescription>
                Enter details about your carbon emission reading below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="deviceName">Device Name *</Label>
                    <Input
                      id="deviceName"
                      name="deviceName"
                      placeholder="Enter device name"
                      value={formData.deviceName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deviceLocation">Device Location *</Label>
                    <Input
                      id="deviceLocation"
                      name="deviceLocation"
                      placeholder="Home, Office, etc."
                      value={formData.deviceLocation}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="readingValue">Reading Value *</Label>
                    <Input
                      id="readingValue"
                      name="readingValue"
                      type="number"
                      step="0.01"
                      placeholder="Enter value"
                      value={formData.readingValue}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="readingUnit">Unit</Label>
                    <Select
                      value={formData.readingUnit}
                      onValueChange={(value) =>
                        handleSelectChange("readingUnit", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g/CO2">g/CO2</SelectItem>
                        <SelectItem value="kg/CO2">kg/CO2</SelectItem>
                        <SelectItem value="tons/CO2">tons/CO2</SelectItem>
                        <SelectItem value="ppm">ppm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any additional information"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Reading
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          {readings.length > 0 ? (
            <DataTable data={readings} onDelete={handleDelete} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-10">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No readings found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't added any carbon tracker readings yet.
                </p>
                <Button onClick={() => setActiveTab("add")}>
                  Add Your First Reading
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats">
          <StatsOverview stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CarbonTracker;
