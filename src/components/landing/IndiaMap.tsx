import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { BarChart, ArrowUpRight, Maximize2, Zap, Factory, Leaf, Wind, Droplets, Sun, Sprout } from 'lucide-react';

// Data for sectors with their carbon emissions
const sectorData = [
  { 
    id: "energy",
    name: "Energy Production", 
    emission: 45, 
    icon: <Zap size={24} className="text-yellow-500 dark:text-yellow-300 stroke-[2.5]" />,
    color: "from-yellow-500/80 to-yellow-400",
    industries: 1240,
    growth: 2.4,
    renewable: 32,
    description: "Includes power plants and electricity generation",
  },
  { 
    id: "manufacturing",
    name: "Manufacturing", 
    emission: 38, 
    icon: <Factory size={24} className="text-blue-500 dark:text-blue-300 stroke-[2.5]" />,
    color: "from-blue-500/80 to-blue-400",
    industries: 3250,
    growth: -1.8, 
    renewable: 22,
    description: "Includes factories and industrial production",
  },
  { 
    id: "agriculture",
    name: "Agriculture", 
    emission: 32, 
    icon: <Leaf size={24} className="text-green-500 dark:text-green-300 stroke-[2.5]" />,
    color: "from-green-500/80 to-green-400",
    industries: 4500,
    growth: 0.7,
    renewable: 45,
    description: "Includes farming, livestock, and crop production",
  },
  { 
    id: "transportation",
    name: "Transportation", 
    emission: 52, 
    icon: <Wind size={24} className="text-red-500 dark:text-red-300 stroke-[2.5]" />,
    color: "from-red-500/80 to-red-400",
    industries: 1800,
    growth: 3.2,
    renewable: 12,
    description: "Includes road vehicles, shipping, and aviation",
  },
  { 
    id: "residential",
    name: "Residential", 
    emission: 20, 
    icon: <Droplets size={24} className="text-indigo-500 dark:text-indigo-300 stroke-[2.5]" />,
    color: "from-indigo-500/80 to-indigo-400",
    industries: 2100,
    growth: -2.5,
    renewable: 28,
    description: "Includes homes, apartments, and housing",
  },
  { 
    id: "commercial",
    name: "Commercial", 
    emission: 28, 
    icon: <Sun size={24} className="text-orange-500 dark:text-orange-300 stroke-[2.5]" />,
    color: "from-orange-500/80 to-orange-400",
    industries: 1650,
    growth: 1.1,
    renewable: 18,
    description: "Includes offices, retail, and hospitality",
  },
];

const EmissionsVisualizer = () => {
  const [ref, controls] = useScrollAnimation();
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [visualMode, setVisualMode] = useState<'bubbles' | 'bars'>('bubbles');
  const [isAnimating, setIsAnimating] = useState(true);
  const visualizerRef = useRef<HTMLDivElement>(null);

  // Simulating data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const getGrowthIndicator = (growth: number) => {
    if (growth > 0) return <span className="text-red-500 flex items-center">+{growth}% <ArrowUpRight size={14} /></span>;
    if (growth < 0) return <span className="text-green-500 flex items-center">{growth}% <ArrowUpRight size={14} className="rotate-180" /></span>;
    return <span>{growth}%</span>;
  };

  const renderBubbleVisualization = () => {
    return (
      <div className="relative h-[400px] flex items-center justify-center overflow-hidden p-6">
        {sectorData.map((sector, index) => {
          // Calculate size based on emission
          const size = 60 + (sector.emission * 3);
          // Position on an imaginary circle
          const angle = (index / sectorData.length) * Math.PI * 2;
          const radius = 160; // Radius of the circle
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={sector.id}
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0,
                opacity: 0 
              }}
              animate={{ 
                x: isAnimating ? 0 : x, 
                y: isAnimating ? 0 : y, 
                scale: 1,
                opacity: 1 
              }}
              transition={{
                duration: 1.2,
                delay: index * 0.2,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.1,
                zIndex: 10,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
              }}
              onClick={() => setSelectedSector(selectedSector === sector.id ? null : sector.id)}
              className={`absolute cursor-pointer rounded-full flex flex-col items-center justify-center bg-gradient-to-br ${sector.color} shadow-lg ${selectedSector === sector.id ? 'ring-2 ring-white/50' : ''}`}
              style={{
                width: `${size}px`,
                height: `${size}px`,
              }}
            >
              {sector.icon}
              <span className="font-medium text-white text-xs mt-1">{sector.emission}%</span>
            </motion.div>
          );
        })}
        
        {/* Center element */}
        <motion.div 
          className="absolute bg-gradient-to-br from-primary/80 to-primary rounded-full flex items-center justify-center z-10 shadow-xl"
          style={{ width: '100px', height: '100px' }}
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sprout className="text-white" size={40} />
        </motion.div>
      </div>
    );
  };

  const renderBarVisualization = () => {
    return (
      <div className="p-6 space-y-4">
        {sectorData.map((sector) => (
          <motion.div 
            key={sector.id}
            initial={{ opacity: 0, width: 0 }}
            animate={{ 
              opacity: 1, 
              width: `${(sector.emission / 60) * 100}%` 
            }}
            transition={{ duration: 1, delay: 0.2 }}
            onClick={() => setSelectedSector(selectedSector === sector.id ? null : sector.id)}
            className={`cursor-pointer transition-all ${selectedSector === sector.id ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
          >
            <div className="flex items-center mb-1">
              <div className="mr-2">{sector.icon}</div>
              <div className="font-medium">{sector.name}</div>
            </div>
            <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${sector.color} rounded-full flex items-center pl-4`}
                style={{ width: `${(sector.emission / 60) * 100}%` }}
              >
                <span className="text-white text-sm font-medium">{sector.emission}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderLegend = () => {
    return (
      <div className="flex flex-wrap justify-center gap-4 p-4">
        {sectorData.map((sector) => (
          <div 
            key={sector.id}
            className={`flex items-center gap-2 px-3 py-2 rounded-full cursor-pointer transition-all ${selectedSector === sector.id ? 'bg-primary/10' : 'hover:bg-background/60'}`}
            onClick={() => setSelectedSector(selectedSector === sector.id ? null : sector.id)}
          >
            {sector.icon}
            <span className="text-sm font-medium">{sector.name}</span>
          </div>
        ))}
      </div>
    );
  };

  // Component to render sector details when selected
  const renderSectorDetails = () => {
    if (!selectedSector) return null;
    
    const sector = sectorData.find(s => s.id === selectedSector);
    if (!sector) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-card/95 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-border mt-6"
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full bg-gradient-to-br ${sector.color}`}>
            {sector.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">{sector.name}</h3>
            <p className="text-muted-foreground mb-4">{sector.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <div className="text-muted-foreground text-sm">Carbon Emissions</div>
                <div className="text-2xl font-bold">{sector.emission}%</div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">YoY Change</div>
                <div className="text-xl font-bold flex items-center">
                  {getGrowthIndicator(sector.growth)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-sm">Related Industries</div>
                <div className="text-2xl font-bold">{sector.industries.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Renewable Adoption</span>
                <span className="font-medium">{sector.renewable}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${sector.renewable}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section id="emissions-visual" className="py-20 bg-background relative">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Carbon Emission Breakdown
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Interactive visualization of carbon emissions by sector in India.
            Click on sectors to see detailed information.
          </p>
        </motion.div>

        <div 
          ref={visualizerRef}
          className="bg-gradient-to-br from-background/50 to-secondary/5 rounded-xl border border-border shadow-sm overflow-hidden"
        >
          <div className="flex justify-between items-center px-6 py-4 border-b border-border">
            <h3 className="font-semibold">Carbon Footprint by Sector</h3>
            <div className="flex border rounded-md overflow-hidden">
              <button 
                className={`px-4 py-2 text-sm font-medium ${visualMode === 'bubbles' ? 'bg-primary text-white' : 'bg-card text-foreground'}`}
                onClick={() => setVisualMode('bubbles')}
              >
                Bubbles
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${visualMode === 'bars' ? 'bg-primary text-white' : 'bg-card text-foreground'}`}
                onClick={() => setVisualMode('bars')}
              >
                Bars
              </button>
            </div>
          </div>
          
          {visualMode === 'bubbles' ? renderBubbleVisualization() : renderBarVisualization()}
          
          <div className="border-t border-border px-4 py-3">
            {renderLegend()}
          </div>
        </div>
        
        <AnimatePresence>
          {selectedSector && renderSectorDetails()}
        </AnimatePresence>

        {/* New Eco-Action Calculator Component */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 bg-gradient-to-br from-primary/5 to-secondary/10 rounded-xl border border-border overflow-hidden shadow-lg"
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-full mb-4">
                  <Sprout className="text-primary h-5 w-5" />
                  <span className="text-sm font-medium text-primary">Personal Impact Calculator</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Take Action Today</h3>
                <p className="text-muted-foreground mb-6">Discover personalized steps to reduce your carbon footprint and join the global sustainability movement.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-card/70 dark:bg-card/40 backdrop-blur-sm p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-yellow-500/20 dark:bg-yellow-500/30 p-2 rounded-full">
                        <Zap className="h-5 w-5 text-yellow-500 dark:text-yellow-300" />
                      </div>
                      <h4 className="font-semibold">Energy Savings</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Reduce home energy usage by up to 30% with simple changes.</p>
                  </div>
                  
                  <div className="bg-card/70 dark:bg-card/40 backdrop-blur-sm p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-green-500/20 dark:bg-green-500/30 p-2 rounded-full">
                        <Leaf className="h-5 w-5 text-green-500 dark:text-green-300" />
                      </div>
                      <h4 className="font-semibold">Plant-Based Diet</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Reduce your carbon footprint by 20% by eating plant-based twice weekly.</p>
                  </div>
                  
                  <div className="bg-card/70 dark:bg-card/40 backdrop-blur-sm p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-blue-500/20 dark:bg-blue-500/30 p-2 rounded-full">
                        <Wind className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                      </div>
                      <h4 className="font-semibold">Transportation</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Cut emissions by 25% with smart transportation choices.</p>
                  </div>
                  
                  <div className="bg-card/70 dark:bg-card/40 backdrop-blur-sm p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-purple-500/20 dark:bg-purple-500/30 p-2 rounded-full">
                        <Droplets className="h-5 w-5 text-purple-500 dark:text-purple-300" />
                      </div>
                      <h4 className="font-semibold">Water Conservation</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">Save up to 4,000 gallons of water annually with these tips.</p>
                  </div>
                </div>
              </div>
              
              <div className="w-full md:w-[400px] bg-card/80 dark:bg-card/60 backdrop-blur-md p-6 rounded-xl border border-border shadow-sm">
                <h4 className="font-semibold mb-4">Calculate Your Impact</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1.5 text-muted-foreground">Daily commute distance (km)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 bg-background rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      placeholder="e.g., 15" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5 text-muted-foreground">Monthly electricity usage (kWh)</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-2 bg-background rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/50" 
                      placeholder="e.g., 300" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1.5 text-muted-foreground">Diet type</label>
                    <select className="w-full px-3 py-2 bg-background rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option>Meat-heavy</option>
                      <option>Moderate meat</option>
                      <option>Pescatarian</option>
                      <option>Vegetarian</option>
                      <option>Vegan</option>
                    </select>
                  </div>
                  
                  <button className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-md transition-colors mt-2">
                    Calculate Footprint
                  </button>
                  
                  <div className="flex items-center justify-between border-t border-border pt-4 mt-4">
                    <span className="text-sm text-muted-foreground">Your estimated carbon footprint:</span>
                    <span className="font-semibold">4.2 tonnes CO<sub>2</sub>/year</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sprout className="text-primary h-6 w-6" />
              <span className="font-semibold">Join 50,000+ people making a difference</span>
          </div>
            <button className="px-5 py-2.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium">
              Get Personalized Plan
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EmissionsVisualizer;