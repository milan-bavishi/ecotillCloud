import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, ArrowLeft, MapPin, FileType, Scale } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportWasteProps {
  onBack: () => void;
}

const ReportWaste: React.FC<ReportWasteProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    location: "",
    wasteType: "",
    amount: "",
    unit: "kg",
  });
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedImage(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please upload an image of the waste",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const formDataToSend = new FormData();
    formDataToSend.append("image", selectedImage);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("wasteType", formData.wasteType);
    formDataToSend.append("amount", formData.amount);
    formDataToSend.append("unit", formData.unit);

    try {
      const response = await fetch("/api/waste/report", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to report waste");
      }

      toast({
        title: "Success",
        description: "Waste report submitted successfully",
      });

      // Reset form
      setSelectedImage(null);
      setFormData({
        location: "",
        wasteType: "",
        amount: "",
        unit: "kg",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit waste report",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-3xl">
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
        <h1 className="text-3xl font-bold">Report Waste</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Upload Image Section */}
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-emerald-500" />
                Upload Waste Image
              </h2>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
                  ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200"
                  }
                  ${selectedImage ? "bg-emerald-50" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="waste-image"
                  className="hidden"
                  accept="image/png,image/jpeg,image/gif"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="waste-image"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  {selectedImage ? (
                    <>
                      <div className="text-emerald-600 mb-2">
                        ✓ File selected:
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedImage.name}
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-emerald-500 mb-4" />
                      <span className="text-emerald-600 font-medium hover:text-emerald-700">
                        Upload a file
                      </span>
                      <span className="text-gray-500 text-sm mt-1">
                        or drag and drop
                      </span>
                      <span className="text-gray-400 text-sm mt-2">
                        PNG, JPG, GIF up to 10MB
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
                  Location
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter waste location"
                  className="w-full bg-gray-50 py-5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center">
                  <FileType className="h-4 w-4 mr-2 text-emerald-500" />
                  Waste Type
                </label>
                <Select
                  value={formData.wasteType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, wasteType: value }))
                  }
                >
                  <SelectTrigger className="w-full bg-gray-50 py-5">
                    <SelectValue placeholder="Select waste type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plastic">Plastic</SelectItem>
                    <SelectItem value="mixed waste">Mixed Waste</SelectItem>
                    <SelectItem value="e-waste">E-Waste</SelectItem>
                    <SelectItem value="organic">Organic</SelectItem>
                    <SelectItem value="paper">Paper</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="glass">Glass</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <Scale className="h-4 w-4 mr-2 text-emerald-500" />
                    Amount
                  </label>
                  <Input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount"
                    className="w-full bg-gray-50 py-5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    Unit
                  </label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, unit: value }))
                    }
                  >
                    <SelectTrigger className="w-full bg-gray-50 py-5">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="liters">Liters</SelectItem>
                      <SelectItem value="pieces">Pieces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-medium"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ReportWaste;
