import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Smartphone,
  Upload,
  BarChart2,
  Clock,
  Edit2,
  Save,
  Activity,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Linkedin,
  Mail,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
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
} from "recharts";

interface AppUsage {
  name: string;
  usageTime: number; // in minutes
  icon: React.ReactNode;
  category: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c43",
];

const DigitalWellbeing: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [appUsage, setAppUsage] = useState<AppUsage[]>([
    {
      name: "Instagram",
      usageTime: 120,
      icon: <Instagram className="h-5 w-5" />,
      category: "Social Media",
    },
    {
      name: "Facebook",
      usageTime: 90,
      icon: <Facebook className="h-5 w-5" />,
      category: "Social Media",
    },
    {
      name: "YouTube",
      usageTime: 180,
      icon: <Youtube className="h-5 w-5" />,
      category: "Entertainment",
    },
    {
      name: "Twitter",
      usageTime: 60,
      icon: <Twitter className="h-5 w-5" />,
      category: "Social Media",
    },
    {
      name: "LinkedIn",
      usageTime: 45,
      icon: <Linkedin className="h-5 w-5" />,
      category: "Professional",
    },
    {
      name: "Gmail",
      usageTime: 75,
      icon: <Mail className="h-5 w-5" />,
      category: "Productivity",
    },
    {
      name: "WhatsApp",
      usageTime: 150,
      icon: <MessageSquare className="h-5 w-5" />,
      category: "Communication",
    },
  ]);
  const [editedData, setEditedData] = useState<AppUsage[]>([]);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description:
          "Your digital wellbeing data has been analyzed successfully",
      });
    }, 2000);
  };

  const handleEdit = () => {
    setEditedData([...appUsage]);
    setIsEditing(true);
  };

  const handleSave = () => {
    setAppUsage(editedData);
    setIsEditing(false);
    toast({
      title: "Success",
      description: "App usage data updated successfully",
    });
  };

  const handleDataChange = (
    index: number,
    field: keyof AppUsage,
    value: number
  ) => {
    const newData = [...editedData];
    newData[index] = { ...newData[index], [field]: value };
    setEditedData(newData);
  };

  const totalUsageTime = appUsage.reduce((sum, app) => sum + app.usageTime, 0);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Smartphone className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-3xl font-bold">Digital Wellbeing</h1>
        </div>
        <div className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
          <Clock className="h-5 w-5 mr-2" />
          <span>Total Usage: {totalUsageTime} minutes</span>
        </div>
      </div>

      {/* Image Upload Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Upload className="h-5 w-5 mr-2 text-blue-500" />
              Upload Screenshot
            </h2>
            <Button
              onClick={handleAnalyze}
              disabled={!selectedImage || isAnalyzing}
              className="flex items-center"
            >
              <Activity className="h-4 w-4 mr-2" />
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {selectedImage
                  ? "Image selected"
                  : "Click to upload your device usage screenshot"}
              </p>
            </label>
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Selected screenshot"
                className="mt-4 max-h-48 mx-auto rounded-lg"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* App Usage Analysis */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              App Usage Analysis
            </h2>
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex items-center"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Data
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="flex items-center bg-green-500 hover:bg-green-600"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">App</th>
                  <th className="text-left py-3">Category</th>
                  <th className="text-left py-3">Usage Time</th>
                </tr>
              </thead>
              <tbody>
                {(isEditing ? editedData : appUsage).map((app, index) => (
                  <tr key={app.name} className="border-b">
                    <td className="py-3 flex items-center">
                      {app.icon}
                      <span className="ml-2">{app.name}</span>
                    </td>
                    <td className="py-3">{app.category}</td>
                    <td className="py-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={app.usageTime}
                          onChange={(e) =>
                            handleDataChange(
                              index,
                              "usageTime",
                              Number(e.target.value)
                            )
                          }
                          className="w-24"
                        />
                      ) : (
                        `${app.usageTime} minutes`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
              App Usage by Time
            </h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="usageTime"
                    fill="#3b82f6"
                    name="Usage Time (minutes)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
              Usage Distribution
            </h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appUsage}
                    dataKey="usageTime"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label
                  >
                    {appUsage.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DigitalWellbeing;
