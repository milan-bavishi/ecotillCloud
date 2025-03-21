import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Calendar, 
  Info, 
  Trash2, 
  Search,
  Filter,
  Car,
  Bus,
  Train,
  Bike,
  PersonStanding,
  X,
  Leaf,
  ArrowUpDown,
  Navigation
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Helper function to get transport mode icon
const getTransportIcon = (mode: string) => {
  switch (mode) {
    case 'car':
      return <Car className="h-5 w-5" />;
    case 'carpool':
      return <Car className="h-5 w-5" />;
    case 'bus':
      return <Bus className="h-5 w-5" />;
    case 'train':
      return <Train className="h-5 w-5" />;
    case 'bicycle':
      return <Bike className="h-5 w-5" />;
    case 'walking':
      return <PersonStanding className="h-5 w-5" />;
    default:
      return <Car className="h-5 w-5" />;
  }
};

const getTransportLabel = (mode: string) => {
  switch (mode) {
    case 'car':
      return 'Car (solo)';
    case 'carpool':
      return 'Carpool';
    case 'bus':
      return 'Bus';
    case 'train':
      return 'Train';
    case 'bicycle':
      return 'Bicycle';
    case 'walking':
      return 'Walking';
    default:
      return mode;
  }
};

const TravelHistory = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<string[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showTripDetails, setShowTripDetails] = useState<string | null>(null);
  const [routeComparison, setRouteComparison] = useState<{[key: string]: any}>({});
  
  // Load travel history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('travelHistory') || '[]');
    setTrips(history);
    setFilteredTrips(history);
    
    // Process route comparison data
    analyzeRouteOptimization(history);
  }, []);
  
  // Analyze routes for optimization opportunities
  const analyzeRouteOptimization = (travelHistory: any[]) => {
    // Group trips by similar routes (source-destination pairs)
    const routeGroups: {[key: string]: any[]} = {};
    
    travelHistory.forEach(trip => {
      const routeKey = `${trip.source}-${trip.destination}`;
      if (!routeGroups[routeKey]) {
        routeGroups[routeKey] = [];
      }
      routeGroups[routeKey].push(trip);
    });
    
    // For each route with multiple trips, find the optimal one
    const comparisonData: {[key: string]: any} = {};
    
    Object.entries(routeGroups).forEach(([routeKey, trips]) => {
      if (trips.length > 1) {
        // Sort trips by emissions per km (lowest first)
        const sortedTrips = [...trips].sort((a, b) => 
          (a.co2Emissions / a.distance) - (b.co2Emissions / b.distance)
        );
        
        const mostEfficientTrip = sortedTrips[0];
        const emissionsPerKmBest = mostEfficientTrip.co2Emissions / mostEfficientTrip.distance;
        
        // For each trip in this route, calculate potential savings
        trips.forEach(trip => {
          const tripEmissionsPerKm = trip.co2Emissions / trip.distance;
          const optimalEmissions = trip.distance * emissionsPerKmBest;
          const savings = trip.co2Emissions - optimalEmissions;
          const savingsPercent = (savings / trip.co2Emissions) * 100;
          
          comparisonData[trip.id] = {
            isOptimal: trip.id === mostEfficientTrip.id,
            optimalMode: mostEfficientTrip.transportMode,
            optimalEmissions: optimalEmissions,
            currentEmissions: trip.co2Emissions,
            savings: savings,
            savingsPercent: savingsPercent,
            routeKey: routeKey,
            similarTrips: trips.length
          };
        });
      } else {
        // If only one trip for this route, mark it as optimal
        trips.forEach(trip => {
          comparisonData[trip.id] = {
            isOptimal: true,
            optimalMode: trip.transportMode,
            optimalEmissions: trip.co2Emissions,
            currentEmissions: trip.co2Emissions,
            savings: 0,
            savingsPercent: 0,
            routeKey: routeKey,
            similarTrips: 1
          };
        });
      }
    });
    
    setRouteComparison(comparisonData);
  };
  
  // Apply filters when search, mode filter, or sorting changes
  useEffect(() => {
    let result = [...trips];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        trip => 
          trip.source.toLowerCase().includes(query) || 
          trip.destination.toLowerCase().includes(query)
      );
    }
    
    // Apply mode filter
    if (modeFilter.length > 0) {
      result = result.filter(trip => modeFilter.includes(trip.transportMode));
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'distance') {
        return sortOrder === 'asc'
          ? a.distance - b.distance
          : b.distance - a.distance;
      }
      if (sortBy === 'emissions') {
        return sortOrder === 'asc'
          ? a.co2Emissions - b.co2Emissions
          : b.co2Emissions - a.co2Emissions;
      }
      return 0;
    });
    
    setFilteredTrips(result);
  }, [trips, searchQuery, modeFilter, sortBy, sortOrder]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Delete a trip
  const deleteTrip = (id: string) => {
    const updatedTrips = trips.filter(trip => trip.id !== id);
    setTrips(updatedTrips);
    localStorage.setItem('travelHistory', JSON.stringify(updatedTrips));
    setIsDeleteDialogOpen(false);
  };
  
  // Clear all trips
  const clearAllTrips = () => {
    setTrips([]);
    localStorage.setItem('travelHistory', JSON.stringify([]));
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // Handle mode filter toggle
  const toggleModeFilter = (mode: string) => {
    if (modeFilter.includes(mode)) {
      setModeFilter(modeFilter.filter(m => m !== mode));
    } else {
      setModeFilter([...modeFilter, mode]);
    }
  };
  
  // Render trip details dialog
  const renderTripDetails = (trip: any) => {
    const tripOptData = routeComparison[trip.id] || {
      isOptimal: true,
      savingsPercent: 0,
      savings: 0
    };
    
    return (
      <Dialog open={showTripDetails === trip.id} onOpenChange={(open) => {
        if (!open) setShowTripDetails(null);
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Trip Details</DialogTitle>
            <DialogDescription>
              View detailed information about this trip
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Date</h4>
                <p className="text-sm">{formatDate(trip.date)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Transport Mode</h4>
                <div className="flex items-center">
                  {getTransportIcon(trip.transportMode)}
                  <span className="ml-2 text-sm">{getTransportLabel(trip.transportMode)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Route</h4>
              <div className="text-sm space-y-1 bg-muted p-2 rounded-md">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{trip.source}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
                  <span>{trip.destination}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Distance</h4>
                <p className="text-2xl font-bold">{trip.distance.toFixed(1)} <span className="text-base font-normal">km</span></p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">CO₂ Emissions</h4>
                <p className="text-2xl font-bold">{trip.co2Emissions.toFixed(0)} <span className="text-base font-normal">g</span></p>
              </div>
            </div>
            
            {/* Route optimization section */}
            {tripOptData.similarTrips > 1 && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  <Navigation className="h-4 w-4 mr-2 text-emerald-500" />
                  Route Optimization Analysis
                </h4>
                
                {tripOptData.isOptimal ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-md text-sm">
                    <div className="flex items-center mb-2">
                      <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800">
                        Optimal Choice
                      </Badge>
                    </div>
                    <p>
                      This is the most eco-friendly transport choice you've used for this route.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-md text-sm">
                      <p>
                        You could save up to <span className="font-medium">{tripOptData.savings.toFixed(0)}g</span> ({tripOptData.savingsPercent.toFixed(0)}%) of CO₂ 
                        by using <span className="font-medium">{getTransportLabel(tripOptData.optimalMode)}</span> for this route.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Current: {trip.co2Emissions.toFixed(0)}g</span>
                        <span>Optimal: {tripOptData.optimalEmissions.toFixed(0)}g</span>
                      </div>
                      <div className="relative h-2">
                        <Progress 
                          value={100 - tripOptData.savingsPercent} 
                          className="h-2" 
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Based on {tripOptData.similarTrips} trips on this route
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Travel History</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your saved routes and emissions data
        </p>
      </div>
      
      {/* Filters and search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    Transport
                    {modeFilter.length > 0 && (
                      <span className="ml-1 bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {modeFilter.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuCheckboxItem
                    checked={modeFilter.includes('car')}
                    onCheckedChange={() => toggleModeFilter('car')}
                  >
                    <Car className="h-4 w-4 mr-2" /> Car
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={modeFilter.includes('carpool')}
                    onCheckedChange={() => toggleModeFilter('carpool')}
                  >
                    <Car className="h-4 w-4 mr-2" /> Carpool
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={modeFilter.includes('bus')}
                    onCheckedChange={() => toggleModeFilter('bus')}
                  >
                    <Bus className="h-4 w-4 mr-2" /> Bus
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={modeFilter.includes('train')}
                    onCheckedChange={() => toggleModeFilter('train')}
                  >
                    <Train className="h-4 w-4 mr-2" /> Train
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={modeFilter.includes('bicycle')}
                    onCheckedChange={() => toggleModeFilter('bicycle')}
                  >
                    <Bike className="h-4 w-4 mr-2" /> Bicycle
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={modeFilter.includes('walking')}
                    onCheckedChange={() => toggleModeFilter('walking')}
                  >
                    <PersonStanding className="h-4 w-4 mr-2" /> Walking
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                  <SelectItem value="emissions">Emissions</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              
              {(searchQuery || modeFilter.length > 0) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchQuery('');
                    setModeFilter([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Trip history table */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex justify-between items-center">
            <CardTitle>Your Trips</CardTitle>
            {trips.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive">
                    Clear All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Are you sure?</DialogTitle>
                    <DialogDescription>
                      This action will remove all your saved trips and cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {}}>Cancel</Button>
                    <Button variant="destructive" onClick={clearAllTrips}>
                      Yes, Clear All
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <CardDescription>
            {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTrips.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {trips.length === 0 ? (
                <p>You haven't saved any trips yet.</p>
              ) : (
                <p>No trips match your search criteria.</p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Transport</TableHead>
                    <TableHead className="text-right">Distance</TableHead>
                    <TableHead className="text-right">CO₂</TableHead>
                    <TableHead className="text-right">Route Opt.</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.map((trip) => {
                    const tripOptData = routeComparison[trip.id];
                    return (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium">
                          {formatDate(trip.date)}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[250px] truncate">
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-muted-foreground" />
                              <span className="truncate">{trip.source.split(',')[0]}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-emerald-500" />
                              <span className="truncate">{trip.destination.split(',')[0]}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {getTransportIcon(trip.transportMode)}
                            <span className="ml-2">{getTransportLabel(trip.transportMode)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{trip.distance.toFixed(1)} km</TableCell>
                        <TableCell className="text-right">{trip.co2Emissions.toFixed(0)} g</TableCell>
                        <TableCell className="text-right">
                          {tripOptData && tripOptData.similarTrips > 1 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  {tripOptData.isOptimal ? (
                                    <div className="inline-flex items-center bg-emerald-100/50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-xs">
                                      <Leaf className="h-3 w-3 mr-1" />
                                      Optimal
                                    </div>
                                  ) : (
                                    <div className="inline-flex items-center text-amber-600 dark:text-amber-400 text-xs">
                                      -{tripOptData.savingsPercent.toFixed(0)}%
                                    </div>
                                  )}
                                </TooltipTrigger>
                                <TooltipContent>
                                  {tripOptData.isOptimal 
                                    ? "This is the most efficient transport option for this route" 
                                    : `You could reduce CO₂ by ${tripOptData.savingsPercent.toFixed(0)}% using ${getTransportLabel(tripOptData.optimalMode)}`
                                  }
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowTripDetails(trip.id)}
                            >
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </Button>
                            
                            <Dialog open={isDeleteDialogOpen && selectedTrip?.id === trip.id} onOpenChange={(open) => {
                              if (!open) setIsDeleteDialogOpen(false);
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => {
                                    setSelectedTrip(trip);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Delete Trip</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this trip? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => deleteTrip(trip.id)}
                                  >
                                    Delete
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                          
                          {/* Render trip details dialog when selected */}
                          {showTripDetails === trip.id && renderTripDetails(trip)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelHistory; 