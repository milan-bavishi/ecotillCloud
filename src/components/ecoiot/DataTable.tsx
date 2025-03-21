import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash, Search, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CarbonReading {
  _id: string;
  deviceName: string;
  readingValue: number;
  readingUnit: string;
  deviceLocation: string;
  readingDate: string;
  notes: string;
}

interface DataTableProps {
  data: CarbonReading[];
  onDelete: (id: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, onDelete }) => {
  const [filter, setFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Filter data based on search
  const filteredData = data.filter((item) => {
    const searchTerm = filter.toLowerCase();
    return (
      item.deviceName.toLowerCase().includes(searchTerm) ||
      item.deviceLocation.toLowerCase().includes(searchTerm) ||
      item.notes?.toLowerCase().includes(searchTerm)
    );
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Handle delete confirmation
  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  // Confirm delete
  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carbon Tracker Readings</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search readings..."
            className="pl-8"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((reading) => (
                  <TableRow key={reading._id}>
                    <TableCell className="font-medium">
                      {reading.deviceName}
                    </TableCell>
                    <TableCell>{reading.deviceLocation}</TableCell>
                    <TableCell>
                      {reading.readingValue} {reading.readingUnit}
                    </TableCell>
                    <TableCell>{formatDate(reading.readingDate)}</TableCell>
                    <TableCell
                      className="max-w-xs truncate"
                      title={reading.notes}
                    >
                      {reading.notes}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(reading._id)}
                        title="Delete reading"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mb-2" />
                      <p>No matching records found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reading? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DataTable;
