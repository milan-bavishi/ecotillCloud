import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  BarChart3, 
  PieChart, 
  TrendingDown, 
  Leaf, 
  Calendar, 
  Map,
  RefreshCw,
  Navigation,
  Route
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

// Mock chart components - in a real application, you would use a charting library like Recharts
const BarChart = ({ data, xKey, yKey, title }: any) => (
  <div className="h-64 mt-4 border border-border rounded-md p-2">
    <div className="text-sm font-medium mb-2">{title}</div>
    <div className="flex h-52 items-end space-x-2">
      {data.map((item: any, index: number) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div 
            className="w-full bg-emerald-600 rounded-t-sm hover:bg-emerald-500 transition-all"
            style={{ height: `${(item[yKey] / Math.max(...data.map((d: any) => d[yKey]))) * 100}%` }}
          ></div>
          <div className="text-xs mt-1 w-full text-center truncate">{item[xKey]}</div>
        </div>
      ))}
    </div>
  </div>
);

const PieChartComponent = ({ data, nameKey, valueKey, title }: any) => {
  const total = data.reduce((sum: number, item: any) => sum + item[valueKey], 0);
  let startAngle = 0;
  
  return (
    <div className="h-64 mt-4">
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="relative h-52 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.map((item: any, index: number) => {
            const percentage = (item[valueKey] / total) * 100;
            const angle = (percentage / 100) * 360;
            const endAngle = startAngle + angle;
            
            // Calculate the SVG arc path
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const path = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
            
            const result = (
              <path
                key={index}
                d={path}
                fill={getColorForIndex(index)}
                stroke="white"
                strokeWidth="0.5"
              />
            );
            
            startAngle = endAngle;
            return result;
          })}
        </svg>
        
        <div className="absolute top-full mt-4 w-full flex flex-wrap justify-center gap-2">
          {data.map((item: any, index: number) => (
            <div key={index} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded-full mr-1"
                style={{ backgroundColor: getColorForIndex(index) }}
              ></div>
              <span>{item[nameKey]} ({((item[valueKey] / total) * 100).toFixed(0)}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to generate colors for the pie chart
const getColorForIndex = (index: number) => {
  const colors = [
    '#10b981', // emerald-500
    '#059669', // emerald-600
    '#047857', // emerald-700
    '#0d9488', // teal-600
    '#0891b2', // cyan-600
    '#0284c7', // sky-600
    '#2563eb', // blue-600
  ];
  
  return colors[index % colors.length];
};

const TravelInsights = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [transportData, setTransportData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [distanceRangeData, setDistanceRangeData] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedTab, setSelectedTab] = useState('emissions');
  const [loading, setLoading] = useState(false);
  const [statsData, setStatsData] = useState<any>(null);
  const [routeComparisonData, setRouteComparisonData] = useState<any[]>([]);
  const [routeOptimizationData, setRouteOptimizationData] = useState<any[]>([]);
  
  // Load travel history from the backend
  const loadTravelHistory = async () => {
    try {
      setLoading(true);
      
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        // If not authenticated, show error
        setLoading(false);
        return;
      }
      
      // Fetch travel history
      const historyResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/travel`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Fetch travel stats
      const statsResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/travel/stats`, {
        params: { timeRange: selectedTimeRange },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTrips(historyResponse.data.data);
      setStatsData(statsResponse.data.data);
      
      // Process the data for charts
      if (statsResponse.data.data) {
        setTransportData(statsResponse.data.data.transportModes);
        setMonthlyData(statsResponse.data.data.monthlyData);
        
        // Process distance ranges
        processDistanceRanges(historyResponse.data.data);
        
        // Generate route comparison data (optimal vs non-optimal routes)
        generateRouteComparisonData(historyResponse.data.data);
      }
      
    } catch (error) {
      console.error('Error loading travel history:', error);
      // Show a simple alert instead of toast
      alert("Failed to load travel data. Using local data as fallback.");
      
      // Fallback to localStorage
      const history = JSON.parse(localStorage.getItem('travelHistory') || '[]');
      setTrips(history);
      
      if (history.length > 0) {
        processDataForCharts(history, selectedTimeRange);
        generateRouteComparisonData(history);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Process distance range data
  const processDistanceRanges = (travelData: any[]) => {
    const distanceRanges = [
      { range: '0-5 km', min: 0, max: 5, trips: 0, emissions: 0 },
      { range: '5-10 km', min: 5, max: 10, trips: 0, emissions: 0 },
      { range: '10-20 km', min: 10, max: 20, trips: 0, emissions: 0 },
      { range: '20-50 km', min: 20, max: 50, trips: 0, emissions: 0 },
      { range: '50+ km', min: 50, max: Infinity, trips: 0, emissions: 0 }
    ];
    
    travelData.forEach((trip: any) => {
      const distance = trip.distance;
      
      for (const range of distanceRanges) {
        if (distance >= range.min && distance < range.max) {
          range.trips += 1;
          range.emissions += trip.co2Emissions;
          break;
        }
      }
    });
    
    setDistanceRangeData(distanceRanges);
  };
  
  // Generate route comparison data
  const generateRouteComparisonData = (travelData: any[]) => {
    // Group trips by similar routes (source-destination pairs)
    const routeGroups: {[key: string]: any[]} = {};
    
    travelData.forEach(trip => {
      const routeKey = `${trip.source}-${trip.destination}`;
      if (!routeGroups[routeKey]) {
        routeGroups[routeKey] = [];
      }
      routeGroups[routeKey].push(trip);
    });
    
    // For each route group with more than 1 trip, compare emissions
    const comparisonData: any[] = [];
    const optimizationData: any[] = [];
    
    Object.entries(routeGroups).forEach(([routeKey, trips]) => {
      if (trips.length > 1) {
        // Sort trips by emissions per km (lowest first)
        const sortedTrips = [...trips].sort((a, b) => 
          (a.co2Emissions / a.distance) - (b.co2Emissions / b.distance)
        );
        
        const mostEfficientTrip = sortedTrips[0];
        const leastEfficientTrip = sortedTrips[sortedTrips.length - 1];
        
        // Calculate the potential savings
        const emissionsPerKmBest = mostEfficientTrip.co2Emissions / mostEfficientTrip.distance;
        const emissionsPerKmWorst = leastEfficientTrip.co2Emissions / leastEfficientTrip.distance;
        const savingsPerKm = emissionsPerKmWorst - emissionsPerKmBest;
        const savingsPercent = (savingsPerKm / emissionsPerKmWorst) * 100;
        
        if (savingsPercent > 1) { // Only include significant differences
          comparisonData.push({
            route: routeKey.length > 20 ? `${routeKey.substring(0, 20)}...` : routeKey,
            bestMode: mostEfficientTrip.transportMode,
            worstMode: leastEfficientTrip.transportMode,
            bestEmissionsPerKm: emissionsPerKmBest,
            worstEmissionsPerKm: emissionsPerKmWorst,
            savingsPercent: savingsPercent,
            count: trips.length
          });
          
          // Calculate potential optimization
          const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);
          const currentEmissions = trips.reduce((sum, trip) => sum + trip.co2Emissions, 0);
          const optimizedEmissions = totalDistance * emissionsPerKmBest;
          const potentialSavings = currentEmissions - optimizedEmissions;
          
          optimizationData.push({
            route: routeKey.length > 20 ? `${routeKey.substring(0, 20)}...` : routeKey,
            totalDistance,
            currentEmissions,
            optimizedEmissions,
            potentialSavings,
            savingsPercent: (potentialSavings / currentEmissions) * 100
          });
        }
      }
    });
    
    // Sort by potential savings (highest first)
    comparisonData.sort((a, b) => b.savingsPercent - a.savingsPercent);
    optimizationData.sort((a, b) => b.potentialSavings - a.potentialSavings);
    
    setRouteComparisonData(comparisonData.slice(0, 5)); // Top 5 routes
    setRouteOptimizationData(optimizationData.slice(0, 5)); // Top 5 optimization opportunities
  };
  
  useEffect(() => {
    loadTravelHistory();
  }, [selectedTimeRange]);
  
  // Fallback processing function for local data
  const processDataForCharts = (trips: any[], timeRange: string) => {
    // Filter trips based on selected time range
    const now = new Date();
    const filteredTrips = trips.filter(trip => {
      const tripDate = new Date(trip.date);
      
      if (timeRange === 'week') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return tripDate >= weekAgo;
      }
      
      if (timeRange === 'month') {
        const monthAgo = new Date(now);
        monthAgo.setMonth(now.getMonth() - 1);
        return tripDate >= monthAgo;
      }
      
      if (timeRange === 'year') {
        const yearAgo = new Date(now);
        yearAgo.setFullYear(now.getFullYear() - 1);
        return tripDate >= yearAgo;
      }
      
      return true; // 'all' option
    });
    
    // Process by transport mode
    const transportModes: {[key: string]: any} = {};
    filteredTrips.forEach(trip => {
      const mode = getTransportLabel(trip.transportMode);
      if (!transportModes[mode]) {
        transportModes[mode] = {
          mode,
          trips: 0,
          distance: 0,
          emissions: 0
        };
      }
      
      transportModes[mode].trips += 1;
      transportModes[mode].distance += trip.distance;
      transportModes[mode].emissions += trip.co2Emissions;
    });
    
    setTransportData(Object.values(transportModes));
    
    // Process by month (for last 6 months)
    const months: {[key: string]: any} = {};
    const lastSixMonths = [];
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now);
      monthDate.setMonth(now.getMonth() - i);
      const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth() + 1}`;
      const monthName = monthDate.toLocaleString('default', { month: 'short' });
      
      months[monthKey] = {
        month: monthName,
        emissions: 0,
        distance: 0,
        trips: 0
      };
      
      lastSixMonths.unshift(monthKey);
    }
    
    filteredTrips.forEach(trip => {
      const tripDate = new Date(trip.date);
      const monthKey = `${tripDate.getFullYear()}-${tripDate.getMonth() + 1}`;
      
      if (months[monthKey]) {
        months[monthKey].emissions += trip.co2Emissions;
        months[monthKey].distance += trip.distance;
        months[monthKey].trips += 1;
      }
    });
    
    // Only include the last 6 months
    setMonthlyData(lastSixMonths.map(key => months[key]));
    
    // Process by distance range
    const distanceRanges = [
      { range: '0-5 km', min: 0, max: 5, trips: 0, emissions: 0 },
      { range: '5-10 km', min: 5, max: 10, trips: 0, emissions: 0 },
      { range: '10-20 km', min: 10, max: 20, trips: 0, emissions: 0 },
      { range: '20-50 km', min: 20, max: 50, trips: 0, emissions: 0 },
      { range: '50+ km', min: 50, max: Infinity, trips: 0, emissions: 0 }
    ];
    
    filteredTrips.forEach(trip => {
      const distance = trip.distance;
      
      for (const range of distanceRanges) {
        if (distance >= range.min && distance < range.max) {
          range.trips += 1;
          range.emissions += trip.co2Emissions;
          break;
        }
      }
    });
    
    setDistanceRangeData(distanceRanges);
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
  
  // Get data from stats or calculate
  const getTotalEmissions = () => {
    return statsData ? statsData.totalEmissions : trips.reduce((sum, trip) => sum + trip.co2Emissions, 0);
  };
  
  const getTotalDistance = () => {
    return statsData ? statsData.totalDistance : trips.reduce((sum, trip) => sum + trip.distance, 0);
  };
  
  const getAverageEmissionsPerKm = () => {
    return statsData 
      ? statsData.averageEmissionsPerKm 
      : (getTotalDistance() > 0 ? getTotalEmissions() / getTotalDistance() : 0);
  };
  
  const getMostEcoFriendlyMode = () => {
    if (transportData.length === 0) return 'N/A';
    
    let bestMode = transportData[0];
    let lowestEmissionsPerKm = bestMode.distance > 0 ? bestMode.emissions / bestMode.distance : Infinity;
    
    transportData.forEach(mode => {
      if (mode.distance > 0) {
        const emissionsPerKm = mode.emissions / mode.distance;
        if (emissionsPerKm < lowestEmissionsPerKm) {
          lowestEmissionsPerKm = emissionsPerKm;
          bestMode = mode;
        }
      }
    });
    
    return bestMode.mode ? getTransportLabel(bestMode.mode) : 'N/A';
  };
  
  const getEmissionsSaved = () => {
    return statsData ? statsData.emissionsSaved : calculateEmissionsSaved();
  };
  
  // Fallback calculation for emissions saved
  const calculateEmissionsSaved = () => {
    let saved = 0;
    trips.forEach(trip => {
      if (trip.transportMode !== 'car') {
        const carEmissions = trip.distance * 170;
        saved += (carEmissions - trip.co2Emissions);
      }
    });
    return saved;
  };
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Travel Insights</h1>
          <p className="text-muted-foreground mt-1">
            Visualize and analyze your travel patterns and carbon footprint
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadTravelHistory}
          disabled={loading}
        >
          {loading ? (
            <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...</>
          ) : (
            <><RefreshCw className="h-4 w-4 mr-2" /> Refresh</>
          )}
        </Button>
      </div>
      
      {trips.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p>No travel data available. Start by logging some trips!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Time range filter */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium mr-2">Time Range:</span>
            </div>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Emissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getTotalEmissions().toFixed(0)} <span className="text-base">g CO₂</span></div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Distance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getTotalDistance().toFixed(1)} <span className="text-base">km</span></div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Avg. Emissions per km</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getAverageEmissionsPerKm().toFixed(1)} <span className="text-base">g/km</span></div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">CO₂ Saved vs. Car</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-500">{getEmissionsSaved().toFixed(0)} <span className="text-base">g</span></div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-emerald-500" />
                Travel Analytics
              </CardTitle>
              <CardDescription>
                Visualize your travel patterns and environmental impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="emissions">Emissions</TabsTrigger>
                  <TabsTrigger value="transport-modes">Transport Modes</TabsTrigger>
                  <TabsTrigger value="distance">Distance Analysis</TabsTrigger>
                  <TabsTrigger value="routes">Route Optimization</TabsTrigger>
                </TabsList>
                
                <TabsContent value="emissions">
                  <h3 className="text-lg font-medium mb-2">CO₂ Emissions Over Time</h3>
                  <p className="text-sm text-muted-foreground">
                    Track how your carbon emissions have changed over the past 6 months
                  </p>
                  
                  <BarChart 
                    data={monthlyData} 
                    xKey="month" 
                    yKey="emissions" 
                    title="Monthly CO₂ Emissions (g)"
                  />
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-2">Emissions by Transport Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Compare the environmental impact of different transport types
                    </p>
                    
                    <PieChartComponent 
                      data={transportData} 
                      nameKey="mode" 
                      valueKey="emissions" 
                      title="CO₂ Emissions by Transport Mode (g)"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="transport-modes">
                  <h3 className="text-lg font-medium mb-2">Transport Usage Breakdown</h3>
                  <p className="text-sm text-muted-foreground">
                    See which transport modes you use most frequently
                  </p>
                  
                  <PieChartComponent 
                    data={transportData} 
                    nameKey="mode" 
                    valueKey="trips" 
                    title="Number of Trips by Transport Mode"
                  />
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-2">Most Eco-Friendly Transport Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      Your most environmentally friendly transportation choice
                    </p>
                    
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center">
                          <div className="bg-emerald-500/10 p-4 rounded-full mr-4">
                            <Leaf className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-xl font-bold">{getMostEcoFriendlyMode()}</div>
                            <div className="text-sm text-muted-foreground">
                              Your most eco-friendly transport choice
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="distance">
                  <h3 className="text-lg font-medium mb-2">Travel Distance Breakdown</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze your travel distances and their environmental impact
                  </p>
                  
                  <BarChart 
                    data={distanceRangeData} 
                    xKey="range" 
                    yKey="trips" 
                    title="Number of Trips by Distance Range"
                  />
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-2">Emissions by Distance Range</h3>
                    <p className="text-sm text-muted-foreground">
                      See how different trip lengths contribute to your carbon footprint
                    </p>
                    
                    <BarChart 
                      data={distanceRangeData} 
                      xKey="range" 
                      yKey="emissions" 
                      title="CO₂ Emissions by Distance Range (g)"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="routes">
                  <h3 className="text-lg font-medium mb-2">Route Optimization Opportunities</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover how choosing optimal routes can reduce your carbon footprint
                  </p>
                  
                  {routeOptimizationData.length > 0 ? (
                    <div className="mt-4 border rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-accent">
                          <tr>
                            <th className="text-left py-2 px-3 text-sm">Route</th>
                            <th className="text-right py-2 px-3 text-sm">Current CO₂</th>
                            <th className="text-right py-2 px-3 text-sm">Optimal CO₂</th>
                            <th className="text-right py-2 px-3 text-sm">Savings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {routeOptimizationData.map((item, index) => (
                            <tr key={index} className="border-t">
                              <td className="py-2 px-3 text-sm">{item.route}</td>
                              <td className="text-right py-2 px-3 text-sm">
                                {item.currentEmissions.toFixed(0)} g
                              </td>
                              <td className="text-right py-2 px-3 text-sm">
                                {item.optimizedEmissions.toFixed(0)} g
                              </td>
                              <td className="text-right py-2 px-3 text-sm font-medium text-emerald-600">
                                {item.savingsPercent.toFixed(0)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-accent/30 p-4 rounded-md mt-4 text-sm text-center">
                      Not enough route data to generate optimization insights.
                      <br />Save more trips with different transport modes for the same routes.
                    </div>
                  )}
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-2">Transport Mode Efficiency by Route</h3>
                    <p className="text-sm text-muted-foreground">
                      Compare the efficiency of different transport modes for similar routes
                    </p>
                    
                    {routeComparisonData.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {routeComparisonData.map((item, index) => (
                          <div key={index} className="bg-accent/30 p-4 rounded-md">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">
                                {item.route}
                              </span>
                              <span className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 py-0.5 px-2 rounded-full">
                                {item.count} trips
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                                <span>Best: {getTransportLabel(item.bestMode)}</span>
                                <span className="ml-auto">{item.bestEmissionsPerKm.toFixed(0)} g/km</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <span>Worst: {getTransportLabel(item.worstMode)}</span>
                                <span className="ml-auto">{item.worstEmissionsPerKm.toFixed(0)} g/km</span>
                              </div>
                              <div className="text-right text-xs text-emerald-600 font-medium">
                                Potential savings: {item.savingsPercent.toFixed(0)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-accent/30 p-4 rounded-md mt-4 text-sm text-center">
                        Not enough data to compare transport efficiency.
                        <br />Try using different transport modes for the same routes.
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-md border border-emerald-100 dark:border-emerald-900">
                    <div className="flex items-start">
                      <Navigation className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium mb-1">Route Selection Tip</h4>
                        <p className="text-sm text-muted-foreground">
                          Different routes between the same locations can vary significantly in emissions.
                          Use the Route Calculator to compare multiple paths and choose the most eco-friendly option
                          to reduce your carbon footprint by up to 15% for the same journey.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Sustainability Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingDown className="h-5 w-5 mr-2 text-emerald-500" />
                Emission Reduction Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-accent/30 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Switch Transport Modes</h3>
                  <p className="text-sm text-muted-foreground">
                    Consider using public transport, cycling, or walking for trips under 10km to reduce emissions by up to 90%.
                  </p>
                </div>
                
                <div className="bg-accent/30 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Carpool for Longer Trips</h3>
                  <p className="text-sm text-muted-foreground">
                    For longer journeys, carpooling can reduce your per-person emissions by 50% or more.
                  </p>
                </div>
                
                <div className="bg-accent/30 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Optimize Routes</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan multiple errands in a single trip to reduce total distance traveled and emissions.
                  </p>
                </div>
                
                <div className="bg-accent/30 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Try Electric Vehicles</h3>
                  <p className="text-sm text-muted-foreground">
                    If available, electric vehicles can reduce emissions by up to 70% compared to conventional cars.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default TravelInsights; 