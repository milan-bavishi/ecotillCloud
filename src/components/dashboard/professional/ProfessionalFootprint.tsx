import React from 'react';
import { UserCircle, Car, Laptop, Home, ShoppingBag } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const ProfessionalFootprint: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Carbon Footprint</h1>
        <p className="text-muted-foreground">Detailed breakdown of your carbon emissions</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="digital">Digital</TabsTrigger>
          <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Emissions</CardTitle>
                <CardDescription>Your carbon footprint</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.2 CO₂e</div>
                <p className="text-sm text-muted-foreground">Annually in metric tons</p>
                
                <div className="mt-4 space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2 text-blue-500" />
                        <span className="text-sm">Transport</span>
                      </div>
                      <span className="text-sm">0.5 CO₂e</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Laptop className="h-4 w-4 mr-2 text-amber-500" />
                        <span className="text-sm">Digital Usage</span>
                      </div>
                      <span className="text-sm">0.2 CO₂e</span>
                    </div>
                    <Progress value={17} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-2 text-emerald-500" />
                        <span className="text-sm">Home Energy</span>
                      </div>
                      <span className="text-sm">0.3 CO₂e</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <ShoppingBag className="h-4 w-4 mr-2 text-purple-500" />
                        <span className="text-sm">Consumption</span>
                      </div>
                      <span className="text-sm">0.2 CO₂e</span>
                    </div>
                    <Progress value={16} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>How your footprint affects the planet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-60 rounded-lg border bg-muted/30 p-4 flex items-center justify-center">
                  <p className="text-muted-foreground text-center">Detailed footprint impact visualization will appear here</p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold">24</div>
                    <p className="text-xs text-muted-foreground">Trees needed yearly</p>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold">4,380</div>
                    <p className="text-xs text-muted-foreground">kWh energy consumption</p>
                  </div>
                  
                  <div className="bg-muted/30 p-3 rounded-lg text-center">
                    <div className="text-lg font-bold">-22%</div>
                    <p className="text-xs text-muted-foreground">Below avg. footprint</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Reduction Opportunities</CardTitle>
              <CardDescription>Ways to reduce your carbon footprint</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Car className="h-5 w-5 mr-2 text-blue-500" />
                    <h3 className="font-medium">Transportation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Potential savings of 0.2 CO₂e by changing commute habits</p>
                  <Button variant="outline" size="sm" className="w-full">View Suggestions</Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Laptop className="h-5 w-5 mr-2 text-amber-500" />
                    <h3 className="font-medium">Digital Usage</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Potential savings of 0.05 CO₂e by optimizing digital habits</p>
                  <Button variant="outline" size="sm" className="w-full">View Suggestions</Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Home className="h-5 w-5 mr-2 text-emerald-500" />
                    <h3 className="font-medium">Home Energy</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Potential savings of 0.15 CO₂e by improving home energy efficiency</p>
                  <Button variant="outline" size="sm" className="w-full">View Suggestions</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transport">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-4">Transportation Emissions</h3>
              <p>Detailed analysis of your transportation-related carbon emissions will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="digital">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-4">Digital Carbon Footprint</h3>
              <p>Detailed analysis of your digital carbon footprint will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lifestyle">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-medium mb-4">Lifestyle Emissions</h3>
              <p>Detailed analysis of your lifestyle-related carbon emissions will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalFootprint; 