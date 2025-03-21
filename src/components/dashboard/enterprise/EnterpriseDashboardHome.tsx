import React from 'react';
import { 
  BarChart, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  AlertTriangle, 
  Award,
  Building2
} from 'lucide-react';
import { getRandomChartData, formatCO2e, getMonthNames } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Dummy data for charts and cards
const companyEmissions = getRandomChartData(12, 100, 250);
const monthLabels = getMonthNames(true);
const departmentEmissions = {
  'IT': getRandomChartData(1, 50, 150)[0],
  'Marketing': getRandomChartData(1, 30, 80)[0],
  'Operations': getRandomChartData(1, 100, 250)[0],
  'Finance': getRandomChartData(1, 20, 60)[0],
  'HR': getRandomChartData(1, 10, 30)[0],
  'R&D': getRandomChartData(1, 40, 120)[0],
};

const initiatives = [
  { id: 1, title: 'Remote Work Policy', reduction: 34.5, target: 50 },
  { id: 2, title: 'Renewable Energy Transition', reduction: 67.8, target: 100 },
  { id: 3, title: 'Paper Reduction', reduction: 12.3, target: 25 },
];

const topPerformers = [
  { id: 1, name: 'Engineering Team', reduction: 18.5 },
  { id: 2, name: 'Design Team', reduction: 15.2 },
  { id: 3, name: 'Product Team', reduction: 12.8 },
];

const EnterpriseMetricCard = ({ title, value, icon, trend, description, color = "text-emerald-500" }) => (
  <Card className="border-border/60">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-full ${color === "text-emerald-500" ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs flex items-center ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
        {trend >= 0 ? '+' : ''}{trend}% 
        <TrendingUp className={`ml-1 h-3 w-3 ${trend >= 0 ? 'rotate-0' : 'rotate-180'}`} />
        <span className="text-muted-foreground ml-1">vs prev. month</span>
      </p>
    </CardContent>
    <CardFooter className="pb-2">
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardFooter>
  </Card>
);

const BarChartCard = ({ title, data, labels, description }) => (
  <Card className="border-border/60 col-span-2">
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">Time Range</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Last 30 days</DropdownMenuItem>
            <DropdownMenuItem>Last 90 days</DropdownMenuItem>
            <DropdownMenuItem>Last 12 months</DropdownMenuItem>
            <DropdownMenuItem>All time</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent className="px-2">
      <div className="h-[200px] flex items-end justify-between px-2">
        {data.map((value, index) => (
          <div key={index} className="flex flex-col items-center">
            <div 
              className="bg-emerald-500/80 hover:bg-emerald-500 rounded-t-sm w-12 transition-all"
              style={{ height: `${(value / Math.max(...data)) * 180}px` }}
            ></div>
            <span className="text-xs mt-2 text-muted-foreground">{labels[index]}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const DepartmentEmissionsCard = ({ departments }) => (
  <Card className="border-border/60">
    <CardHeader>
      <CardTitle className="text-lg font-medium">Emissions by Department</CardTitle>
      <CardDescription>CO₂e contribution by business unit</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {Object.entries(departments).map(([name, value]) => (
        <div key={name} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{name}</span>
            <span className="text-sm text-muted-foreground">{formatCO2e(value)}</span>
          </div>
          <Progress 
            value={(value / Object.values(departments).reduce((a, b) => a + b, 0)) * 100} 
            className="h-2 bg-secondary" 
          />
        </div>
      ))}
    </CardContent>
  </Card>
);

const InitiativesCard = ({ initiatives }) => (
  <Card className="border-border/60">
    <CardHeader>
      <CardTitle className="text-lg font-medium">Green Initiatives</CardTitle>
      <CardDescription>Progress toward emission reduction targets</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {initiatives.map((initiative) => (
        <div key={initiative.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{initiative.title}</span>
            <span className="text-sm text-emerald-500">{initiative.reduction} / {initiative.target} tons</span>
          </div>
          <Progress 
            value={(initiative.reduction / initiative.target) * 100} 
            className="h-2 bg-secondary" 
          />
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" className="w-full">View All Initiatives</Button>
    </CardFooter>
  </Card>
);

const LeaderboardCard = ({ performers }) => (
  <Card className="border-border/60">
    <CardHeader>
      <CardTitle className="text-lg font-medium">Top Performing Teams</CardTitle>
      <CardDescription>Most emission reductions this month</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {performers.map((performer, index) => (
        <div key={performer.id} className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 
              ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                index === 1 ? 'bg-slate-300/20 text-slate-500' :
                  index === 2 ? 'bg-amber-700/20 text-amber-700' : 'bg-muted'}`}
            >
              {index + 1}
            </div>
            <span className="text-sm font-medium">{performer.name}</span>
          </div>
          <span className="text-sm text-emerald-500">-{performer.reduction} tons</span>
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" className="w-full">View Full Leaderboard</Button>
    </CardFooter>
  </Card>
);

const AiSuggestionsCard = () => (
  <Card className="border-border/60">
    <CardHeader>
      <CardTitle className="text-lg font-medium flex items-center">
        <Lightbulb className="mr-2 h-5 w-5 text-emerald-500" />
        AI Optimization Suggestions
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="border rounded-lg p-3 bg-muted/30">
        <p className="text-sm">Consider implementing a 4-day workweek for the Marketing department to reduce commute emissions by an estimated 20%.</p>
      </div>
      <div className="border rounded-lg p-3 bg-muted/30">
        <p className="text-sm">Your Operations department could save 35 tons of CO₂e by optimizing delivery routes with our AI route planner.</p>
      </div>
      <div className="border rounded-lg p-3 bg-muted/30">
        <p className="text-sm">Switching to LED lighting in your main office could reduce energy consumption by 15% annually.</p>
      </div>
    </CardContent>
    <CardFooter>
      <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">Get More Insights</Button>
    </CardFooter>
  </Card>
);

const EnterpriseDashboardHome = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Enterprise Dashboard</h1>
          <p className="text-muted-foreground">Overview of your organization's carbon emissions and initiatives</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
            View Alerts
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Lightbulb className="h-4 w-4 mr-2" />
            Run AI Analysis
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="emissions">Emissions</TabsTrigger>
          <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Top metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <EnterpriseMetricCard 
              title="Total Company Emissions" 
              value={formatCO2e(1254.8)}
              icon={<Building2 className="h-4 w-4 text-emerald-500" />}
              trend={-7.2}
              description="Total emissions across all departments"
            />
            
            <EnterpriseMetricCard 
              title="Per Employee Average" 
              value={formatCO2e(3.6)}
              icon={<Users className="h-4 w-4 text-emerald-500" />}
              trend={-4.5}
              description="Average emissions per employee"
            />
            
            <EnterpriseMetricCard 
              title="Active Initiatives" 
              value="12"
              icon={<Lightbulb className="h-4 w-4 text-emerald-500" />}
              trend={25}
              description="Current emission reduction projects"
            />
            
            <EnterpriseMetricCard 
              title="Compliance Rating" 
              value="92%"
              icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
              trend={2.1}
              description="ESG compliance score"
              color="text-amber-500"
            />
          </div>
          
          {/* Charts and data row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BarChartCard 
              title="Monthly Emissions"
              data={companyEmissions}
              labels={monthLabels}
              description="Emissions trend over the past year"
            />
            <DepartmentEmissionsCard departments={departmentEmissions} />
          </div>
          
          {/* Third row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InitiativesCard initiatives={initiatives} />
            <LeaderboardCard performers={topPerformers} />
            <AiSuggestionsCard />
          </div>
        </TabsContent>
        
        <TabsContent value="emissions">
          <p>Detailed emissions analytics will be displayed here.</p>
        </TabsContent>
        
        <TabsContent value="initiatives">
          <p>Green initiative tracking will be displayed here.</p>
        </TabsContent>
        
        <TabsContent value="reports">
          <p>Compliance and ESG reports will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseDashboardHome; 