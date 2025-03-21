import React from 'react';
import { BarChart3, PieChart, LineChart, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProfessionalInsights: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Carbon Insights</h1>
        <p className="text-muted-foreground">Analytics and trends for your carbon emissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monthly Trend</CardTitle>
            <CardDescription>Your emissions over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full flex flex-col items-center justify-center">
              <LineChart className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-4">Emission trend visualization will appear here</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <div className="flex items-center text-emerald-500 text-sm">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span>8.2% decrease</span>
            </div>
            <Button variant="ghost" size="sm">Details</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
            <CardDescription>Emissions by source</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full flex flex-col items-center justify-center">
              <PieChart className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-4">Category breakdown visualization will appear here</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <div className="text-sm text-muted-foreground">
              Largest: Transportation (42%)
            </div>
            <Button variant="ghost" size="sm">Details</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Performance</CardTitle>
            <CardDescription>Compared to similar professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full flex flex-col items-center justify-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground mt-4">Comparative performance will appear here</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <div className="flex items-center text-emerald-500 text-sm">
              <Zap className="h-4 w-4 mr-1" />
              <span>Better than 68% of peers</span>
            </div>
            <Button variant="ghost" size="sm">Details</Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emissions Analysis</CardTitle>
          <CardDescription>Detailed insights about your carbon footprint patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <TrendingDown className="h-5 w-5 mr-2 text-emerald-500" />
              Weekly Patterns
            </h3>
            <p className="text-muted-foreground mb-3">
              Your carbon emissions are typically 23% higher on Mondays and Tuesdays compared to the rest of the week. This is likely due to increased commuting and digital activity at the start of the work week.
            </p>
            <Button variant="outline" size="sm">View Pattern Details</Button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-amber-500" />
              Seasonal Impact
            </h3>
            <p className="text-muted-foreground mb-3">
              Your winter emissions are approximately 18% higher than your summer emissions, primarily due to increased heating energy consumption and changes in transportation habits during colder months.
            </p>
            <Button variant="outline" size="sm">View Seasonal Breakdown</Button>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-500" />
              Efficiency Opportunities
            </h3>
            <p className="text-muted-foreground mb-3">
              Based on your usage patterns, we've identified 3 key areas where small changes could reduce your carbon footprint by up to 15% with minimal lifestyle impact.
            </p>
            <Button variant="outline" size="sm">View Recommendations</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Year-over-Year Comparison</CardTitle>
            <CardDescription>How your emissions have changed</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Year-over-year emissions chart will appear here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projected Trend</CardTitle>
            <CardDescription>Estimated future emissions based on current habits</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">Emissions forecast chart will appear here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfessionalInsights; 