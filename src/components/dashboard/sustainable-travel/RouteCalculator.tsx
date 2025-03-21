import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  MapPin, 
  Car, 
  Bus, 
  Train, 
  Bike, 
  PersonStanding,
  RefreshCw,
  Leaf,
  BarChart4
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import debounce from 'lodash/debounce';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Helper functions for CO2 emissions calculation
const calculateCO2EmissionsPerKm = (transportMode: string) => {
  // CO2 emissions in grams per passenger kilometer
  switch (transportMode) {
    case 'car':
      return 170; // Average car with single occupant
    case 'carpool':
      return 85;  // Car with two occupants
    case 'bus':
      return 68;  // City bus average
    case 'train':
      return 35;  // Electric train
    case 'bicycle':
      return 0;   // Zero emissions
    case 'walking':
      return 0;   // Zero emissions
    default:
      return 170; // Default to car
  }
};

// Helper to translate distance to real-world CO2 equivalents
const translateCO2ToRealWorldEquivalent = (co2Grams: number) => {
  // 1 mature tree absorbs about 21 kg of CO2 per year (21,000g)
  // So daily it absorbs about 57.5g
  const treeDays = (co2Grams / 57.5).toFixed(1);
  
  // Average smartphone charging produces about 7g of CO2
  const phoneCharges = Math.round(co2Grams / 7);
  
  return {
    treeDays,
    phoneCharges
  };
};

// Custom Leaflet icon to replace the default
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Component to handle map updates
const MapUpdater = ({ sourceCoords, destinationCoords, routeCoordinates }: any) => {
  const map = useMap();
  
  useEffect(() => {
    if (sourceCoords && destinationCoords) {
      const bounds = L.latLngBounds([sourceCoords, destinationCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, sourceCoords, destinationCoords, routeCoordinates]);
  
  return null;
};

const RouteCalculator = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [transportMode, setTransportMode] = useState('car');
  const [distance, setDistance] = useState<number | null>(null);
  const [co2Emissions, setCo2Emissions] = useState<number | null>(null);
  const [co2Equivalent, setCo2Equivalent] = useState<any>(null);
  const [sourceCoords, setSourceCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sourceOptions, setSourceOptions] = useState<any[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('map');
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [routeAlternatives, setRouteAlternatives] = useState<any[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  
  // References to cancel ongoing API requests
  const sourceRequestRef = useRef<AbortController | null>(null);
  const destRequestRef = useRef<AbortController | null>(null);
  const routeRequestRef = useRef<AbortController | null>(null);
  
  // Default map center (India)
  const defaultCenter: [number, number] = [20.5937, 78.9629];
  const defaultZoom = 5;
  
  // Handle location search
  const searchLocations = async (query: string, setOptions: React.Dispatch<React.SetStateAction<any[]>>, requestRef: React.MutableRefObject<AbortController | null>) => {
    if (!query || query.trim() === '') {
      setOptions([]);
      return;
    }
    
    // Cancel previous request if any
    if (requestRef.current) {
      requestRef.current.abort();
    }
    
    const controller = new AbortController();
    requestRef.current = controller;
    
    try {
      // Using Nominatim OpenStreetMap API for geocoding
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: { 'Accept-Language': 'en-US,en;q=0.9' }
      });
      
      const data = await response.json();
      
      const locations = data.map((item: any) => ({
        name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }));
      
      setOptions(locations);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error searching locations:', error);
      }
    }
  };
  
  // Debounced search functions
  const debouncedSearchSource = debounce(
    (query: string) => searchLocations(query, setSourceOptions, sourceRequestRef),
    500
  );
  
  const debouncedSearchDestination = debounce(
    (query: string) => searchLocations(query, setDestinationOptions, destRequestRef),
    500
  );
  
  // Handle selection of a location from suggestions
  const handleSelectLocation = (location: any, type: 'source' | 'destination') => {
    if (type === 'source') {
      setSource(location.name);
      setSourceCoords([location.lat, location.lon]);
      setSourceOptions([]);
    } else {
      setDestination(location.name);
      setDestinationCoords([location.lat, location.lon]);
      setDestinationOptions([]);
    }
  };
  
  // Calculate route between two points
  const calculateRoute = async () => {
    if (!sourceCoords || !destinationCoords) {
      // Show error message to user
      return;
    }
    
    setLoading(true);
    
    // Cancel previous request if any
    if (routeRequestRef.current) {
      routeRequestRef.current.abort();
    }
    
    const controller = new AbortController();
    routeRequestRef.current = controller;
    
    try {
      // First, calculate the straight-line distance (Haversine formula)
      const straightLineDistance = calculateHaversineDistance(
        sourceCoords[0], sourceCoords[1], 
        destinationCoords[0], destinationCoords[1]
      );
      
      // Using OSRM for routing with alternatives
      const url = `https://router.project-osrm.org/route/v1/driving/${sourceCoords[1]},${sourceCoords[0]};${destinationCoords[1]},${destinationCoords[0]}?overview=full&geometries=geojson&alternatives=true`;
      
      const response = await fetch(url, { signal: controller.signal });
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        // Process multiple routes if available
        const routesData = data.routes.map((route: any, index: number) => {
          // Extract coordinates from the route
          const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
          
          // Calculate distance in kilometers
          let distanceInKm = (route.distance / 1000);
          
          // Fallback to straight-line distance if OSRM returns a very small value
          if (distanceInKm < 0.1 && straightLineDistance > 0.1) {
            distanceInKm = straightLineDistance;
          }

          // Calculate duration in minutes
          const durationInMins = Math.round(route.duration / 60);
          
          // Calculate CO2 emissions for this route with the current transport mode
          const co2PerKm = calculateCO2EmissionsPerKm(transportMode);
          const totalCO2 = distanceInKm * co2PerKm;
          
          // Route name/label
          const routeLabel = index === 0 ? "Fastest Route" : 
                            index === 1 ? "Shorter Distance" : 
                            `Alternative ${index}`;
          
          // Route color
          const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
          const routeColor = colors[index % colors.length];
          
          return {
            coordinates,
            distance: distanceInKm,
            duration: durationInMins,
            co2Emissions: totalCO2,
            co2Equivalent: translateCO2ToRealWorldEquivalent(totalCO2),
            label: routeLabel,
            color: routeColor,
            index
          };
        });
        
        // Sort routes by CO2 emissions (lowest first)
        const sortedRoutes = [...routesData].sort((a, b) => a.co2Emissions - b.co2Emissions);
        
        // Identify the most eco-friendly route
        sortedRoutes.forEach((route, index) => {
          route.isEcoFriendly = index === 0;
        });
        
        // Set route alternatives
        setRouteAlternatives(routesData);
        
        // Set the main route to the first one by default
        setSelectedRouteIndex(0);
        setRouteCoordinates(routesData[0].coordinates);
        setDistance(routesData[0].distance);
        setCo2Emissions(routesData[0].co2Emissions);
        setCo2Equivalent(routesData[0].co2Equivalent);
        
        // Generate alternative transport options for the selected route
        generateTransportAlternatives(routesData[0].distance);
      } else {
        // Handle case when no routes are found
        alert("No routes found between these locations. Try different points.");
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error calculating route:', error);
        alert("Error calculating route. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to generate transport alternatives for a given distance
  const generateTransportAlternatives = (distanceInKm: number) => {
    const transportModes = ['car', 'carpool', 'bus', 'train', 'bicycle', 'walking'];
    
    const co2PerKm = calculateCO2EmissionsPerKm(transportMode);
    const totalCO2 = distanceInKm * co2PerKm;
    
    const alternativeOptions = transportModes
      .filter(mode => mode !== transportMode)
      .map(mode => {
        const emissionsPerKm = calculateCO2EmissionsPerKm(mode);
        const emissions = distanceInKm * emissionsPerKm;
        const savings = totalCO2 - emissions;
        const percentReduction = (savings / totalCO2) * 100;
        
        return {
          mode,
          distance: distanceInKm,
          emissions,
          savings: savings > 0 ? savings : 0,
          percentReduction: percentReduction > 0 ? percentReduction : 0,
          equivalent: translateCO2ToRealWorldEquivalent(emissions)
        };
      })
      .sort((a, b) => a.emissions - b.emissions);
    
    setAlternatives(alternativeOptions);
  };
  
  // Handle route selection change
  const handleRouteChange = (index: number) => {
    if (routeAlternatives[index]) {
      setSelectedRouteIndex(index);
      setRouteCoordinates(routeAlternatives[index].coordinates);
      setDistance(routeAlternatives[index].distance);
      setCo2Emissions(routeAlternatives[index].co2Emissions);
      setCo2Equivalent(routeAlternatives[index].co2Equivalent);
      generateTransportAlternatives(routeAlternatives[index].distance);
    }
  };
  
  // Calculate Haversine distance between two points
  const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  };
  
  // Get transport mode icon
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
  
  // Function to save trip to history
  const saveTrip = async () => {
    if (!distance || !co2Emissions) return;
    
    // Create trip data object
    const tripData = {
      source,
      destination,
      transportMode,
      distance,
      co2Emissions,
      sourceCoords,
      destinationCoords
    };
    
    try {
      // First try to save to API
      const token = localStorage.getItem('authToken');
      
      if (token) {
        await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/api/travel`, tripData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        alert('Trip saved successfully!');
        return;
      }
    } catch (error) {
      console.error('Error saving trip to API:', error);
      // If API save fails, fall back to localStorage
    }
    
    // Fallback: Save to localStorage
    // Get existing trips from localStorage
    const existingTrips = JSON.parse(localStorage.getItem('travelHistory') || '[]');
    
    // Add new trip to the start of the array with local id
    const localTripData = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...tripData
    };
    
    const updatedTrips = [localTripData, ...existingTrips];
    
    // Save back to localStorage
    localStorage.setItem('travelHistory', JSON.stringify(updatedTrips));
    
    // Show success message
    alert('Trip saved to local history!');
  };
  
  return (
    <div className="p-6">
      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-emerald-500" />
              Sustainable Travel Route Calculator
            </CardTitle>
            <CardDescription>
              Calculate the carbon footprint of your journey and discover more sustainable alternatives
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Main content with map as background and inputs overlay */}
            <div className="relative">
              {/* Map container */}
              <div className="w-full h-[75vh] rounded-md overflow-hidden border">
                <MapContainer
                  center={sourceCoords || defaultCenter}
                  zoom={defaultZoom}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {sourceCoords && (
                    <Marker position={sourceCoords} icon={customIcon}>
                      <Popup>Source: {source}</Popup>
                    </Marker>
                  )}
                  
                  {destinationCoords && (
                    <Marker position={destinationCoords} icon={customIcon}>
                      <Popup>Destination: {destination}</Popup>
                    </Marker>
                  )}
                  
                  {/* Display all route alternatives */}
                  {routeAlternatives.map((route, index) => (
                    <Polyline
                      key={index}
                      positions={route.coordinates}
                      color={index === selectedRouteIndex ? route.color : '#999999'}
                      weight={index === selectedRouteIndex ? 5 : 3}
                      opacity={index === selectedRouteIndex ? 0.8 : 0.5}
                      dashArray={index === selectedRouteIndex ? '' : '5, 5'}
                    >
                      <Popup>
                        <div className="text-sm">
                          <div className="font-medium">{route.label}</div>
                          <div>Distance: {route.distance.toFixed(1)} km</div>
                          <div>Duration: ~{route.duration} mins</div>
                          <div>CO₂: {route.co2Emissions.toFixed(0)} g</div>
                        </div>
                      </Popup>
                    </Polyline>
                  ))}
                  
                  <MapUpdater 
                    sourceCoords={sourceCoords} 
                    destinationCoords={destinationCoords} 
                    routeCoordinates={routeCoordinates}
                  />
                </MapContainer>
              </div>
              
              {/* Input overlay */}
              <div className="absolute top-4 left-4 md:w-[350px] z-[1000] p-4 bg-transparent backdrop-blur-sm rounded-md border shadow-lg">
                <div className="space-y-4">
                  {/* Source Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source</label>
                    <div className="relative">
                      <Input
                        placeholder="Enter starting point"
                        value={source}
                        onChange={(e) => {
                          setSource(e.target.value);
                          debouncedSearchSource(e.target.value);
                        }}
                        className="pl-9 bg-transparent"
                      />
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      
                      {/* Source location suggestions */}
                      {sourceOptions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-md max-h-60 overflow-auto">
                          {sourceOptions.map((location, index) => (
                            <div
                              key={index}
                              className="p-2 hover:bg-accent cursor-pointer text-sm"
                              onClick={() => handleSelectLocation(location, 'source')}
                            >
                              {location.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Destination Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Destination</label>
                    <div className="relative">
                      <Input
                        placeholder="Enter destination"
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          debouncedSearchDestination(e.target.value);
                        }}
                        className="pl-9 bg-transparent"
                      />
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      
                      {/* Destination location suggestions */}
                      {destinationOptions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-md max-h-60 overflow-auto">
                          {destinationOptions.map((location, index) => (
                            <div
                              key={index}
                              className="p-2 hover:bg-accent cursor-pointer text-sm"
                              onClick={() => handleSelectLocation(location, 'destination')}
                            >
                              {location.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Transport Mode Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Transport Mode</label>
                    <Select value={transportMode} onValueChange={setTransportMode}>
                      <SelectTrigger className="bg-transparent">
                        <div className="flex items-center">
                          {getTransportIcon(transportMode)}
                          <span className="ml-2">{getTransportLabel(transportMode)}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">
                          <div className="flex items-center">
                            <Car className="h-4 w-4 mr-2" /> Car (solo)
                          </div>
                        </SelectItem>
                        <SelectItem value="carpool">
                          <div className="flex items-center">
                            <Car className="h-4 w-4 mr-2" /> Carpool
                          </div>
                        </SelectItem>
                        <SelectItem value="bus">
                          <div className="flex items-center">
                            <Bus className="h-4 w-4 mr-2" /> Bus
                          </div>
                        </SelectItem>
                        <SelectItem value="train">
                          <div className="flex items-center">
                            <Train className="h-4 w-4 mr-2" /> Train
                          </div>
                        </SelectItem>
                        <SelectItem value="bicycle">
                          <div className="flex items-center">
                            <Bike className="h-4 w-4 mr-2" /> Bicycle
                          </div>
                        </SelectItem>
                        <SelectItem value="walking">
                          <div className="flex items-center">
                            <PersonStanding className="h-4 w-4 mr-2" /> Walking
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Calculate Button */}
                  <Button 
                    onClick={calculateRoute} 
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={!sourceCoords || !destinationCoords || loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      'Calculate Route & Emissions'
                    )}
                  </Button>
                  
                  {/* Route alternatives selector - shown when multiple routes are available */}
                  {routeAlternatives.length > 1 && (
                    <div className="mt-4">
                      <label className="text-sm font-medium mb-2 block">Route Options:</label>
                      <div className="space-y-2">
                        {routeAlternatives.map((route, index) => (
                          <div 
                            key={index}
                            className={`p-2 border rounded-md cursor-pointer flex items-center justify-between text-sm ${
                              selectedRouteIndex === index 
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500' 
                                : 'hover:bg-accent'
                            }`}
                            onClick={() => handleRouteChange(index)}
                          >
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: route.color }}
                              ></div>
                              <span>{route.label}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span>{route.distance.toFixed(1)} km</span>
                              <span className="text-xs text-muted-foreground">{route.co2Emissions.toFixed(0)}g CO₂</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Trip results summary - visible when calculation is completed */}
                  {distance && (
                    <div className="mt-4 p-3 bg-emerald-500/10 rounded-md">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{distance.toFixed(1)} km</span>
                        <span className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 py-0.5 px-2 rounded-full text-xs">
                          {getTransportLabel(transportMode)}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="block">CO₂: {co2Emissions?.toFixed(0)} g</span>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-auto p-0 text-emerald-600 dark:text-emerald-400"
                          onClick={() => setShowResultsPanel(!showResultsPanel)}
                        >
                          {showResultsPanel ? 'Hide details' : 'Show detailed results'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6"
                          onClick={saveTrip}
                        >
                          Save Trip
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Results panel */}
              {showResultsPanel && distance && (
                <div className="absolute top-4 right-4 md:w-[400px] z-[1000] p-4 bg-transparent backdrop-blur-sm rounded-md border shadow-lg max-h-[75vh] overflow-auto">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Your Journey Results</h3>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowResultsPanel(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    </div>
                    
                    {/* Route comparison table if multiple routes */}
                    {routeAlternatives.length > 1 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Route Comparison</h4>
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left py-2 px-3">Route</th>
                                <th className="text-right py-2 px-3">Distance</th>
                                <th className="text-right py-2 px-3">CO₂</th>
                              </tr>
                            </thead>
                            <tbody>
                              {routeAlternatives.map((route, index) => (
                                <tr 
                                  key={index} 
                                  className={`border-t ${
                                    selectedRouteIndex === index 
                                      ? 'bg-emerald-50 dark:bg-emerald-950/30' 
                                      : ''
                                  }`}
                                  onClick={() => handleRouteChange(index)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <td className="py-2 px-3 flex items-center">
                                    <div 
                                      className="w-2 h-2 rounded-full mr-2" 
                                      style={{ backgroundColor: route.color }}
                                    ></div>
                                    {route.label}
                                  </td>
                                  <td className="text-right py-2 px-3">{route.distance.toFixed(1)} km</td>
                                  <td className="text-right py-2 px-3">{route.co2Emissions.toFixed(0)} g</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="text-xs text-muted-foreground italic">
                          Click on a route to select it on the map
                        </div>
                      </div>
                    )}
                    
                    {/* Current journey emissions */}
                    <div className="space-y-2">
                      <div className="font-semibold flex items-center">
                        {getTransportIcon(transportMode)}
                        <span className="ml-2">{getTransportLabel(transportMode)}</span>
                      </div>
                      
                      <div className="bg-accent/50 p-3 rounded-md">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Distance:</span>
                          <span className="font-medium">{distance.toFixed(1)} km</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm">CO₂ Emissions:</span>
                          <span className="font-medium">{co2Emissions?.toFixed(0)} g</span>
                        </div>
                        
                        {co2Equivalent && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Leaf className="h-3 w-3 mr-1 text-emerald-500" />
                              Equivalent to what a tree absorbs in {co2Equivalent.treeDays} days
                            </div>
                            <div className="flex items-center mt-1">
                              <Leaf className="h-3 w-3 mr-1 text-emerald-500" />
                              Or charging your smartphone {co2Equivalent.phoneCharges} times
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Alternatives */}
                    <div className="space-y-3">
                      <h3 className="font-semibold">More Sustainable Alternatives</h3>
                      
                      {alternatives.map((alt, index) => (
                        <div key={index} className="bg-accent/30 p-3 rounded-md">
                          <div className="flex justify-between mb-1">
                            <span className="flex items-center">
                              {getTransportIcon(alt.mode)}
                              <span className="ml-2 text-sm font-medium">{getTransportLabel(alt.mode)}</span>
                            </span>
                            <span className="text-xs bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 py-0.5 px-2 rounded-full">
                              {alt.emissions === 0 ? 'Zero Emissions' : `Save ${alt.percentReduction.toFixed(0)}%`}
                            </span>
                          </div>
                          
                          <div className="mt-2">
                            <div className="text-xs flex justify-between mb-1">
                              <span>CO₂ Emissions: {alt.emissions.toFixed(0)} g</span>
                              {alt.savings > 0 && (
                                <span className="text-emerald-500">
                                  -{alt.savings.toFixed(0)} g
                                </span>
                              )}
                            </div>
                            
                            <Progress 
                              value={100 - alt.percentReduction} 
                              className="h-2" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RouteCalculator; 