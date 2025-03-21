import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  ArrowRight, 
  BarChart3, 
  Leaf, 
  History, 
  Trophy,
  Navigation,
  Route,
  ArrowUpDown
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const SustainableTravelHome = () => {
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalDistance: 0,
    totalEmissions: 0,
    totalSaved: 0,
    routeOptimizationSavings: 0
  });
  const [routeOptimizationData, setRouteOptimizationData] = useState<any[]>([]);
  
  // Load travel history from localStorage
  useEffect(() => {
    const loadTravelHistory = () => {
      const history = JSON.parse(localStorage.getItem('travelHistory') || '[]');
      
      // Get the 3 most recent trips
      setRecentTrips(history.slice(0, 3));
      
      // Calculate stats
      const totalTrips = history.length;
      
      let totalDistance = 0;
      let totalEmissions = 0;
      let totalSaved = 0;
      let routeOptimizationSavings = 0;
      
      history.forEach((trip: any) => {
        totalDistance += trip.distance || 0;
        totalEmissions += trip.co2Emissions || 0;
        
        // Calculate how much CO2 was saved compared to car travel (if not using car)
        if (trip.transportMode !== 'car') {
          const carEmissions = trip.distance * 170; // 170g CO2 per km
          const actualEmissions = trip.co2Emissions;
          totalSaved += (carEmissions - actualEmissions);
        }
      });
      
      // Analyze routes for optimization opportunities
      const routeGroups: {[key: string]: any[]} = {};
      
      history.forEach((trip: any) => {
        const routeKey = `${trip.source}-${trip.destination}`;
        if (!routeGroups[routeKey]) {
          routeGroups[routeKey] = [];
        }
        routeGroups[routeKey].push(trip);
      });
      
      // Calculate optimization insights
      const optimizationData: any[] = [];
      
      Object.entries(routeGroups).forEach(([routeKey, trips]) => {
        if (trips.length > 1) {
          // Sort trips by emissions per km (lowest first)
          const sortedTrips = [...trips].sort((a, b) => 
            (a.co2Emissions / a.distance) - (b.co2Emissions / b.distance)
          );
          
          const mostEfficientTrip = sortedTrips[0];
          const emissionsPerKmBest = mostEfficientTrip.co2Emissions / mostEfficientTrip.distance;
          
          // Calculate total potential savings
          let currentTotalEmissions = 0;
          let optimizedTotalEmissions = 0;
          let totalDistance = 0;
          
          trips.forEach(trip => {
            currentTotalEmissions += trip.co2Emissions;
            optimizedTotalEmissions += trip.distance * emissionsPerKmBest;
            totalDistance += trip.distance;
          });
          
          const potentialSavings = currentTotalEmissions - optimizedTotalEmissions;
          routeOptimizationSavings += potentialSavings;
          
          if (potentialSavings > 0) {
            optimizationData.push({
              route: routeKey,
              sourceName: trips[0].source.split(',')[0],
              destinationName: trips[0].destination.split(',')[0],
              bestMode: mostEfficientTrip.transportMode,
              totalDistance,
              currentEmissions: currentTotalEmissions,
              optimizedEmissions: optimizedTotalEmissions,
              potentialSavings,
              savingsPercent: (potentialSavings / currentTotalEmissions) * 100,
              tripCount: trips.length
            });
          }
        }
      });
      
      // Sort by potential savings (highest first)
      optimizationData.sort((a, b) => b.potentialSavings - a.potentialSavings);
      setRouteOptimizationData(optimizationData.slice(0, 2)); // Show top 2 opportunities
      
      setStats({
        totalTrips,
        totalDistance: parseFloat(totalDistance.toFixed(1)),
        totalEmissions: parseFloat(totalEmissions.toFixed(1)),
        totalSaved: parseFloat(totalSaved.toFixed(1)),
        routeOptimizationSavings: parseFloat(routeOptimizationSavings.toFixed(1))
      });
    };
    
    loadTravelHistory();
  }, []);
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Get transport mode icon
  const getTransportIcon = (mode: string) => {
    switch (mode) {
      case 'car':
        return '🚗';
      case 'carpool':
        return '🚗👥';
      case 'bus':
        return '🚌';
      case 'train':
        return '🚆';
      case 'bicycle':
        return '🚲';
      case 'walking':
        return '🚶';
      default:
        return '🚗';
    }
  };
  
  // Get transport mode label
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
  
  // Get real-world CO2 equivalent
  const getCO2Equivalent = (grams: number) => {
    // 1 mature tree absorbs about 21 kg of CO2 per year (21,000g)
    // So daily it absorbs about 57.5g
    const treeDays = (grams / 57.5).toFixed(1);
    
    return `${treeDays} days of a tree absorbing CO2`;
  };
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Sustainable Travel Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track and reduce your travel carbon footprint
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/professional-dashboard/sustainable-travel">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-emerald-500" />
                  Calculate a Route
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Find eco-friendly routes between locations and calculate emissions
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="p-0 h-auto text-emerald-600 dark:text-emerald-400">
                  Start now <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
          
          <Link to="/professional-dashboard/travel-insights">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-emerald-500" />
                  View Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analyze your travel patterns and carbon footprint over time
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="p-0 h-auto text-emerald-600 dark:text-emerald-400">
                  Explore data <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
          
          <Link to="/professional-dashboard/travel-history">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <History className="h-5 w-5 mr-2 text-emerald-500" />
                  Travel History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View and manage your saved routes and travel history
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="p-0 h-auto text-emerald-600 dark:text-emerald-400">
                  See history <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </Link>
        </div>
      </div>
      
      {/* Travel Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Travel Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalTrips}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Distance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalDistance} <span className="text-lg">km</span></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total CO₂ Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalEmissions} <span className="text-lg">g</span></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">CO₂ Saved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.totalSaved} <span className="text-lg">g</span>
                </div>
                {stats.routeOptimizationSavings > 0 && (
                  <div className="text-xs ml-2 text-muted-foreground">+{stats.routeOptimizationSavings}g potential</div>
                )}
              </div>
              {stats.totalSaved > 0 && (
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Leaf className="h-3 w-3 mr-1 text-emerald-500" />
                  {getCO2Equivalent(stats.totalSaved)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Route Optimization Insights */}
      {routeOptimizationData.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Route Optimization Insights</h2>
            <Link to="/professional-dashboard/travel-insights">
              <Button variant="outline" size="sm">
                View More
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routeOptimizationData.map((item, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Route className="h-5 w-5 mr-2 text-emerald-500" />
                    {item.sourceName} → {item.destinationName}
                  </CardTitle>
                  <CardDescription>
                    Based on {item.tripCount} trips on this route
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm text-muted-foreground">Current Emissions</div>
                        <div className="font-medium">{item.currentEmissions.toFixed(0)} g</div>
                      </div>
                      <ArrowUpDown className="h-4 w-4 mx-2 text-muted-foreground" />
                      <div>
                        <div className="text-sm text-muted-foreground">Optimal Emissions</div>
                        <div className="font-medium">{item.optimizedEmissions.toFixed(0)} g</div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm text-muted-foreground">Potential Savings</div>
                        <div className="font-medium text-emerald-600">{item.savingsPercent.toFixed(0)}%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-sm font-medium flex items-center">
                        <Leaf className="h-4 w-4 mr-1 text-emerald-500" />
                        Recommendation
                      </div>
                      <div className="text-sm p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-md">
                        Use <span className="font-medium">{getTransportLabel(item.bestMode)}</span> for this route to save up to <span className="font-medium">{item.potentialSavings.toFixed(0)} g</span> of CO₂
                      </div>
                    </div>
                    
                    <Progress 
                      value={100 - item.savingsPercent} 
                      className="h-2 mt-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Recent Trips */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Trips</h2>
          <Link to="/professional-dashboard/travel-history">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>
        
        {recentTrips.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p>You haven't saved any trips yet.</p>
                <Link to="/professional-dashboard/sustainable-travel">
                  <Button variant="outline" className="mt-4">
                    Calculate Your First Trip
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {recentTrips.map((trip) => (
              <Card key={trip.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className="text-2xl mr-3">{getTransportIcon(trip.transportMode)}</div>
                        <div>
                          <div className="font-medium">{trip.source.split(',')[0]} → {trip.destination.split(',')[0]}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(trip.date)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Distance</div>
                        <div className="font-medium">{trip.distance.toFixed(1)} km</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">CO₂</div>
                        <div className="font-medium">{trip.co2Emissions.toFixed(0)} g</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Eco-Travel Tips */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Eco-Travel Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-full">
                  <Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Sustainable Travel Challenge</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Choose public transport or cycling for your next 5 trips to reduce your carbon footprint by up to 90%.
                  </p>
                  <div className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 py-1.5 px-3 rounded-full inline-block">
                    🌱 Potential impact: 500g CO₂ saved per 10km trip
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-full">
                  <Navigation className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Route Optimization Tip</h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    Compare multiple routes in the calculator before traveling. The most direct route isn't always the most eco-friendly.
                  </p>
                  <div className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 py-1.5 px-3 rounded-full inline-block">
                    🗺️ Smart route choices can save up to 15% CO₂ emissions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SustainableTravelHome; 