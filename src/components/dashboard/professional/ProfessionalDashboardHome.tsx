import React from 'react';
import { 
  BarChart, 
  TrendingUp, 
  Car, 
  Lightbulb, 
  AlertTriangle, 
  Award,
  User2,
  Coffee,
  Laptop,
  Plane,
  Clock
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
const personalEmissions = getRandomChartData(12, 0.3, 1.2);
const monthLabels = getMonthNames(true);
const emissionSources = {
  'Commuting': getRandomChartData(1, 0.1, 0.5)[0],
  'Digital Usage': getRandomChartData(1, 0.05, 0.2)[0],
  'Office Energy': getRandomChartData(1, 0.15, 0.4)[0],
  'Business Travel': getRandomChartData(1, 0.05, 0.3)[0],
  'Food & Beverages': getRandomChartData(1, 0.02, 0.1)[0],
};

const personalGoals = [
  { id: 1, title: 'Reduce Commute Emissions', current: 28, target: 40 },
  { id: 2, title: 'Lower Digital Carbon Footprint', current: 15, target: 30 },
  { id: 3, title: 'Offset Travel Emissions', current: 45, target: 50 },
];

const industryComparison = [
  { industry: 'Your Footprint', value: 0.7 },
  { industry: 'Industry Average', value: 1.2 },
  { industry: 'Top Performers', value: 0.5 },
];

// Component for metric cards
interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: number;
  description: string;
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend, 
  description, 
  color = "text-emerald-500" 
}) => (
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
        <span className="text-muted-foreground ml-1">vs last month</span>
      </p>
    </CardContent>
    <CardFooter className="pb-2">
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardFooter>
  </Card>
);

// Bar chart component
interface BarChartCardProps {
  title: string;
  data: number[];
  labels: string[];
  description: string;
}

const BarChartCard: React.FC<BarChartCardProps> = ({ title, data, labels, description }) => (
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
              className="bg-emerald-500/80 hover:bg-emerald-500 rounded-t-sm w-8 transition-all"
              style={{ height: `${(value / Math.max(...data)) * 180}px` }}
            ></div>
            <span className="text-xs mt-2 text-muted-foreground">{labels[index]}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Emissions source breakdown component
interface EmissionsSourcesProps {
  sources: Record<string, number>;
}

const EmissionsSourcesCard: React.FC<EmissionsSourcesProps> = ({ sources }) => (
  <Card className="border-border/60">
    <CardHeader>
      <CardTitle className="text-lg font-medium">Emissions by Source</CardTitle>
      <CardDescription>Your carbon footprint breakdown</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {Object.entries(sources).map(([name, value]) => (
        <div key={name} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{name}</span>
            <span className="text-sm text-muted-foreground">{formatCO2e(value)}</span>
          </div>
          <Progress 
            value={(value / Object.values(sources).reduce((a, b) => a + b, 0)) * 100} 
            className="h-2 bg-secondary" 
          />
        </div>
      ))}
    </CardContent>
  </Card>
);

// Personal goals component
interface GoalsCardProps {
  goals: Array<{id: number, title: string, current: number, target: number}>;
}

const GoalsCard: React.FC<GoalsCardProps> = ({ goals }) => (
  <Card className="border-border/60">
    <CardHeader>
      <CardTitle className="text-lg font-medium">Sustainability Goals</CardTitle>
      <CardDescription>Progress toward your personal targets</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {goals.map((goal) => (
        <div key={goal.id} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{goal.title}</span>
            <span className="text-sm text-emerald-500">{goal.current}% / {goal.target}%</span>
          </div>
          <Progress 
            value={(goal.current / goal.target) * 100} 
            className="h-2 bg-secondary" 
          />
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm" className="w-full">Set New Goal</Button>
    </CardFooter>
  </Card>
);

// Industry comparison component
interface ComparisonCardProps {
  data: Array<{industry: string, value: number}>;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ data }) => (
  <Card className="border-border/60">
    <CardHeader>
      <CardTitle className="text-lg font-medium">Industry Comparison</CardTitle>
      <CardDescription>How your footprint compares to others</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{item.industry}</span>
            <span className="text-sm text-muted-foreground">{formatCO2e(item.value)}</span>
          </div>
          <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                index === 0 ? 'bg-emerald-500' :
                index === 1 ? 'bg-amber-500' : 'bg-green-300'
              }`}
              style={{ width: `${(item.value / Math.max(...data.map(d => d.value))) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </CardContent>
    <CardFooter>
      <p className="text-xs text-muted-foreground w-full text-center">
        You're using 42% less carbon than average in your industry
      </p>
    </CardFooter>
  </Card>
);

// AI suggestions component
const AiSuggestionsCard: React.FC = () => (
  <Card className="border-border/60">
    <CardHeader>
      <CardTitle className="text-lg font-medium flex items-center">
        <Lightbulb className="mr-2 h-5 w-5 text-emerald-500" />
        Personalized Tips
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="border rounded-lg p-3 bg-muted/30 flex">
        <Car className="h-5 w-5 mr-3 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-sm">Try carpooling twice a week to reduce your commute emissions by up to 40%.</p>
      </div>
      <div className="border rounded-lg p-3 bg-muted/30 flex">
        <Laptop className="h-5 w-5 mr-3 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-sm">Turn off your computer at night instead of sleep mode to save 40kg of CO₂e annually.</p>
      </div>
      <div className="border rounded-lg p-3 bg-muted/30 flex">
        <Coffee className="h-5 w-5 mr-3 text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-sm">Bringing a reusable cup for your daily coffee could save 23kg of CO₂e per year.</p>
      </div>
    </CardContent>
    <CardFooter>
      <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">Get More Tips</Button>
    </CardFooter>
  </Card>
);

const ProfessionalDashboardHome: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Personal Dashboard</h1>
          <p className="text-muted-foreground">Track and optimize your individual carbon footprint</p>
        </div>
        <div className="flex space-x-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Lightbulb className="h-4 w-4 mr-2" />
            Get Personalized Tips
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transportation">Transportation</TabsTrigger>
          <TabsTrigger value="digital">Digital Usage</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {/* Top metrics row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Monthly Carbon Footprint" 
              value={formatCO2e(0.72)}
              icon={<User2 className="h-4 w-4 text-emerald-500" />}
              trend={-5.3}
              description="Your total emissions this month"
            />
            
            <MetricCard 
              title="Transportation Impact" 
              value={formatCO2e(0.31)}
              icon={<Car className="h-4 w-4 text-emerald-500" />}
              trend={-12.1}
              description="Emissions from commuting and travel"
            />
            
            <MetricCard 
              title="Digital Carbon" 
              value={formatCO2e(0.18)}
              icon={<Laptop className="h-4 w-4 text-emerald-500" />}
              trend={3.2}
              description="From device usage and cloud services"
              color="text-amber-500"
            />
            
            <MetricCard 
              title="Working Hours" 
              value="168 hrs"
              icon={<Clock className="h-4 w-4 text-emerald-500" />}
              trend={0}
              description="Total work hours this month"
            />
          </div>
          
          {/* Charts and data row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BarChartCard 
              title="Monthly Footprint"
              data={personalEmissions}
              labels={monthLabels}
              description="Your personal emissions trend over time"
            />
            <EmissionsSourcesCard sources={emissionSources} />
          </div>
          
          {/* Third row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GoalsCard goals={personalGoals} />
            <ComparisonCard data={industryComparison} />
            <AiSuggestionsCard />
          </div>
        </TabsContent>
        
        <TabsContent value="transportation">
          <p>Detailed transportation emissions will be displayed here.</p>
        </TabsContent>
        
        <TabsContent value="digital">
          <p>Digital usage and energy consumption will be displayed here.</p>
        </TabsContent>
        
        <TabsContent value="goals">
          <p>Sustainability goals and achievements will be displayed here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfessionalDashboardHome; 