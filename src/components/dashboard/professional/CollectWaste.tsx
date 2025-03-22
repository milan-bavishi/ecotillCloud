import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  MapPin,
  FileType,
  Scale,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

interface CollectionTask {
  _id: string;
  location: string;
  wasteType: string;
  amount: number;
  unit: string;
  imageUrl: string;
  rewardPoints: number;
  createdAt: string;
  status: string;
}

interface CollectWasteProps {
  onBack: () => void;
}

const CollectWaste: React.FC<CollectWasteProps> = ({ onBack }) => {
  const [tasks, setTasks] = useState<CollectionTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCollectionTasks();
  }, []);

  const fetchCollectionTasks = async () => {
    try {
      const response = await fetch("/api/waste/collection-tasks");
      if (!response.ok) {
        throw new Error("Failed to fetch collection tasks");
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch collection tasks",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      const response = await fetch(
        `/api/waste/collection-tasks/${taskId}/accept`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to accept task");
      }

      toast({
        title: "Success",
        description: "Task accepted successfully",
      });

      // Refresh tasks
      fetchCollectionTasks();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept task",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Back Button and Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground mr-4"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Collect Waste</h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search by area..."
          className="pl-12 py-6 bg-white"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              No collection tasks available at the moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tasks.map((task) => (
            <Card key={task._id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <img
                        src={task.imageUrl}
                        alt={`Waste at ${task.location}`}
                        className="w-24 h-24 object-cover rounded-lg mr-4"
                      />
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {task.wasteType.charAt(0).toUpperCase() +
                            task.wasteType.slice(1)}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {task.location}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Scale className="h-4 w-4 mr-1" />
                          {task.amount} {task.unit}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center text-emerald-600">
                        <Trophy className="h-5 w-5 mr-1" />
                        <span className="font-medium">
                          {task.rewardPoints} points
                        </span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">
                          {formatDate(task.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="ml-4 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleAcceptTask(task._id)}
                    disabled={task.status !== "verified"}
                  >
                    {task.status === "verified"
                      ? "Accept Task"
                      : "Task Accepted"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectWaste;
