import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleX, Loader2 } from "lucide-react";

// Import chart library
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface StatsProps {
  stats: {
    totalEmissions: number;
    emissionsByDevice: Array<{ _id: string; total: number }>;
    recentTrend: Array<{
      _id: { year: number; month: number; day: number };
      total: number;
      date: string;
    }>;
  } | null;
}

const StatsOverview: React.FC<StatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-10">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
          <h3 className="text-lg font-medium">Loading statistics...</h3>
        </CardContent>
      </Card>
    );
  }

  // If no emissions data
  if (
    stats.totalEmissions === 0 &&
    (!stats.emissionsByDevice || stats.emissionsByDevice.length === 0)
  ) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-10">
          <CircleX className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            No emission data available
          </h3>
          <p className="text-muted-foreground text-center mb-4">
            Add some carbon tracker readings to see statistics.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Format trend data for chart
  const trendData = stats.recentTrend.map((day) => {
    const date = new Date(day.date);
    return {
      name: `${date.getMonth() + 1}/${date.getDate()}`,
      value: day.total,
    };
  });

  // Format device data for chart
  const deviceData = stats.emissionsByDevice.map((device) => ({
    name: device._id,
    value: device.total,
  }));

  // Colors for pie chart
  const COLORS = [
    "#4ade80",
    "#22c55e",
    "#16a34a",
    "#15803d",
    "#166534",
    "#14532d",
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Emissions
            </CardTitle>
            <CardDescription>Overall carbon emissions tracked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalEmissions.toFixed(2)}
              <span className="text-sm text-muted-foreground ml-1">g/CO2</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Devices Tracked
            </CardTitle>
            <CardDescription>Number of emission sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.emissionsByDevice.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
            <CardDescription>Average daily emissions (30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.recentTrend.length > 0
                ? (
                    stats.recentTrend.reduce((sum, day) => sum + day.total, 0) /
                    stats.recentTrend.length
                  ).toFixed(2)
                : "0.00"}
              <span className="text-sm text-muted-foreground ml-1">g/CO2</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trend">
        <TabsList>
          <TabsTrigger value="trend">Emission Trends</TabsTrigger>
          <TabsTrigger value="devices">Emissions by Device</TabsTrigger>
        </TabsList>

        <TabsContent value="trend">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Emission Trends</CardTitle>
              <CardDescription>
                Daily carbon emissions over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} g/CO2`, "Emissions"]}
                      labelFormatter={(label) => `Day: ${label}`}
                    />
                    <Bar
                      dataKey="value"
                      fill="#4ade80"
                      name="Carbon Emissions"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Emissions by Device</CardTitle>
              <CardDescription>
                Distribution of carbon emissions by device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {deviceData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} g/CO2`, "Emissions"]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsOverview;
