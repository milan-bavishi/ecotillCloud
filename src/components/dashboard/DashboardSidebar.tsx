import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  Settings,
  Users,
  Award,
  TrendingUp,
  Lightbulb,
  Building2,
  User2,
  LogOut,
  Home,
  ChevronRight,
  ChevronLeft,
  Sprout,
  Moon,
  Sun,
  Map,
  Calculator,
  History,
  Bike,
  Cpu,
  WifiIcon,
  Cloud,
  Leaf,
  Footprints,
  Smartphone,
  Car,
  LineChart,
  Heart,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";

interface SidebarProps {
  type: "enterprise" | "professional" | "sustainable-travel";
}

const DashboardSidebar: React.FC<SidebarProps> = ({ type }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();

  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const userFullName = userData.fullName || "User";
  const userEmail = userData.email || "user@example.com";
  const userInitial = userFullName.charAt(0) || "U";

  // Define different menu items based on dashboard type
  const enterpriseMenuItems = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Dashboard",
      path: "/enterprise-dashboard",
    },
    {
      icon: <Building2 className="h-5 w-5" />,
      label: "Company Overview",
      path: "/enterprise-dashboard/company",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Departments",
      path: "/enterprise-dashboard/departments",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Emissions Trends",
      path: "/enterprise-dashboard/trends",
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      label: "ESG Reports",
      path: "/enterprise-dashboard/reports",
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      label: "Green Initiatives",
      path: "/enterprise-dashboard/initiatives",
    },
    {
      icon: <Award className="h-5 w-5" />,
      label: "Leaderboards",
      path: "/enterprise-dashboard/leaderboards",
    },
    {
      type: "section",
      label: "Cloud Services",
    },
    {
      icon: <Cloud className="h-5 w-5" />,
      label: "AWS Cloud Services",
      path: "/enterprise-dashboard/aws-cloud",
    },
    {
      icon: <Cpu className="h-5 w-5" />,
      label: "LLM Usage",
      path: "/enterprise-dashboard/llm-carbon",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/enterprise-dashboard/settings",
    },
  ];

  const professionalMenuItems = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Dashboard",
      path: "/professional-dashboard",
    },
    {
      icon: <User2 className="h-5 w-5" />,
      label: "My Footprint",
      path: "/professional-dashboard/footprint",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Insights",
      path: "/professional-dashboard/insights",
    },
    {
      type: "section",
      label: "cloud",
    },
    {
      icon: <Cloud className="h-5 w-5" />,
      label: "Cloud Services",
      path: "/professional-dashboard/cloud-services",
    },
    {
      icon: <Cpu className="h-5 w-5" />,
      label: "Computing Impact",
      path: "/professional-dashboard/computing-impact",
    },
    {
      type: "section",
      label: "EcoIoT",
    },
    {
      icon: <WifiIcon className="h-5 w-5" />,
      label: "Carbon Tracker",
      path: "/professional-dashboard/carbon-tracker",
    },
    {
      type: "section",
      label: "Sustainable Travel",
    },
    {
      icon: <Map className="h-5 w-5" />,
      label: "Route Calculator",
      path: "/professional-dashboard/sustainable-travel",
    },
    {
      icon: <History className="h-5 w-5" />,
      label: "Travel History",
      path: "/professional-dashboard/travel-history",
    },
    {
      icon: <Bike className="h-5 w-5" />,
      label: "Travel Insights",
      path: "/professional-dashboard/travel-insights",
    },
    {
      type: "section",
      label: "Personal Growth",
    },
    {
      icon: <Leaf className="h-5 w-5" />,
      label: "Green Initiatives",
      path: "/professional-dashboard/green-initiatives",
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      label: "Suggestions",
      path: "/professional-dashboard/suggestions",
    },
    {
      icon: <Award className="h-5 w-5" />,
      label: "Goals & Achievements",
      path: "/professional-dashboard/goals",
    },
    {
      icon: <ClipboardList className="h-5 w-5" />,
      label: "Reports",
      path: "/professional-dashboard/reports",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/professional-dashboard/settings",
    },
    {
      icon: <Footprints className="h-5 w-5" />,
      label: "Carbon Footprint",
      path: "/professional-dashboard/footprint",
    },
    {
      icon: <Server className="h-5 w-5" />,
      label: "Cloud Server",
      path: "/professional-dashboard/cloud-server",
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      label: "Digital Wellbeing",
      path: "/professional-dashboard/digital-wellbeing",
    },
    {
      icon: <Car className="h-5 w-5" />,
      label: "Sustainable Travel",
      path: "/professional-dashboard/sustainable-travel",
    },
    {
      icon: <LineChart className="h-5 w-5" />,
      label: "Carbon Tracker",
      path: "/professional-dashboard/carbon-tracker",
    },
  ];

  const sustainableTravelMenuItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Sustainable Travel Home",
      path: "/sustainable-travel-dashboard",
    },
    {
      icon: <Map className="h-5 w-5" />,
      label: "Route Calculator",
      path: "/sustainable-travel-dashboard/calculator",
    },
    {
      icon: <Bike className="h-5 w-5" />,
      label: "Travel Insights",
      path: "/sustainable-travel-dashboard/insights",
    },
    {
      icon: <History className="h-5 w-5" />,
      label: "Travel History",
      path: "/sustainable-travel-dashboard/history",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      path: "/sustainable-travel-dashboard/settings",
    },
  ];

  let menuItems = professionalMenuItems;

  if (type === "enterprise") {
    menuItems = enterpriseMenuItems;
  } else if (type === "sustainable-travel") {
    menuItems = sustainableTravelMenuItems;
  }

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("dashboardType");
    localStorage.removeItem("isAuthenticated");

    // Redirect to home
    navigate("/");
  };

  const switchDashboard = () => {
    navigate("/dashboard-selector");
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col border-r border-border/40 bg-card/90 backdrop-blur-sm transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[250px]"
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/40">
        {!collapsed && (
          <div className="flex items-center">
            <Sprout className="h-6 w-6 text-emerald-500" strokeWidth={2.5} />
            <span className="font-bold ml-2">Eco सत्वा</span>
          </div>
        )}
        {collapsed && (
          <Sprout
            className="h-6 w-6 text-emerald-500 mx-auto"
            strokeWidth={2.5}
          />
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground p-1 rounded-full"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User Profile Summary */}
      <div
        className={cn(
          "p-4 border-b border-border/40",
          collapsed ? "flex justify-center" : ""
        )}
      >
        {!collapsed ? (
          <div>
            <div className="font-medium truncate">{userFullName}</div>
            <div className="text-xs text-muted-foreground truncate">
              {userEmail}
            </div>
            <div className="text-xs mt-1 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 py-1 px-2 rounded-full inline-block">
              {type === "enterprise"
                ? "Enterprise"
                : type === "sustainable-travel"
                ? "Sustainable Travel"
                : "Professional"}
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-300 text-sm font-bold">
            {userInitial}
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {menuItems.map((item, index) => {
            if (item.type === "section") {
              return !collapsed ? (
                <div key={`section-${index}`} className="pt-4 pb-2 px-2">
                  <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                    {item.label}
                  </p>
                </div>
              ) : null;
            }

            // Skip items without path
            if (!item.path) return null;

            const isActive = location.pathname === item.path;

            return collapsed ? (
              <TooltipProvider key={item.path}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={item.path}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "w-full justify-center my-1",
                          isActive
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                      >
                        {item.icon}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <Link to={item.path} key={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-2 border-t border-border/40 space-y-2">
        {collapsed ? (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="w-full"
                  >
                    {isDarkMode ? (
                      <Sun className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={switchDashboard}
                    className="w-full"
                  >
                    <Home className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Switch Dashboard</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    <LogOut className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={toggleTheme}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 mr-2" />
              ) : (
                <Moon className="h-5 w-5 mr-2" />
              )}
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={switchDashboard}
            >
              <Home className="h-5 w-5 mr-2" />
              Switch Dashboard
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Logout
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardSidebar;
