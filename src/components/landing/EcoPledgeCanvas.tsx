import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowRight, Leaf, TreePine, Globe, X, Heart, Send } from 'lucide-react';

type PledgeType = {
  id: number;
  text: string;
  position: { x: number; y: number };
  color: string;
  rotation: number;
};

// Sample pledges to start with
const initialPledges: PledgeType[] = [
  { id: 1, text: "I pledge to reduce single-use plastics in my daily life", position: { x: 25, y: 35 }, color: "#10b981", rotation: -3 },
  { id: 2, text: "I will plant 5 trees this year in my community", position: { x: 65, y: 20 }, color: "#047857", rotation: 2 },
  { id: 3, text: "I commit to using public transport more often", position: { x: 40, y: 70 }, color: "#059669", rotation: -2 },
  { id: 4, text: "I will reduce my energy consumption by 15%", position: { x: 75, y: 50 }, color: "#34d399", rotation: 4 },
  { id: 5, text: "I'll buy locally-produced food to reduce carbon footprint", position: { x: 20, y: 60 }, color: "#6ee7b7", rotation: -1 }
];

const EcoPledgeCanvas = () => {
  const [pledges, setPledges] = useState<PledgeType[]>(initialPledges);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPledge, setNewPledge] = useState('');
  const [hoveredPledge, setHoveredPledge] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // These colors are chosen for their natural, earthy, eco-friendly feel
  const pledgeColors = [
    "#047857", // emerald-800
    "#059669", // emerald-700
    "#10b981", // emerald-600
    "#34d399", // emerald-400
    "#6ee7b7", // emerald-300
  ];
  
  // Add a new pledge to the canvas
  const addPledge = () => {
    if (!newPledge.trim() || !containerRef.current) return;
    
    // Create random position within the container
    const containerWidth = containerRef.current.offsetWidth;
    const containerHeight = containerRef.current.offsetHeight;
    
    const newPledgeObj: PledgeType = {
      id: Date.now(),
      text: newPledge,
      position: {
        x: 10 + Math.random() * (containerWidth - 300) / containerWidth * 100, // Keep away from edges
        y: 10 + Math.random() * (containerHeight - 100) / containerHeight * 100,
      },
      color: pledgeColors[Math.floor(Math.random() * pledgeColors.length)],
      rotation: Math.random() * 6 - 3, // Random rotation between -3 and 3 degrees
    };
    
    setPledges([...pledges, newPledgeObj]);
    setNewPledge('');
    setIsDialogOpen(false);
    
    // Show confetti effect after adding pledge
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-emerald-50/40 to-background dark:from-emerald-950/10 dark:to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-emerald-100/20 dark:bg-emerald-900/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-emerald-100/10 dark:bg-emerald-900/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center mb-4">
            <TreePine className="h-8 w-8 text-emerald-500 mr-2" />
            <h2 className="text-3xl md:text-4xl font-bold">The <span className="text-emerald-500">Pledge Forest</span></h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Add your eco-pledge to our growing community forest. Each pledge is a commitment to a more sustainable future.
          </p>
        </motion.div>
        
        {/* Pledge Canvas */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative bg-emerald-50/50 dark:bg-emerald-950/10 rounded-xl border border-emerald-100 dark:border-emerald-800/30 h-[500px] mb-8 overflow-hidden"
        >
          {/* Background elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-[10%] bottom-[10%] text-emerald-200 dark:text-emerald-900 opacity-20">
              <TreePine size={100} />
            </div>
            <div className="absolute right-[20%] top-[15%] text-emerald-200 dark:text-emerald-900 opacity-20">
              <Leaf size={80} />
            </div>
            <div className="absolute left-[30%] top-[40%] text-emerald-200 dark:text-emerald-900 opacity-20">
              <Globe size={60} />
            </div>
          </div>
          
          {/* Confetti effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: 50 }).map((_, i) => {
                const size = Math.random() * 8 + 5;
                const startX = Math.random() * 100;
                const startY = -10;
                const endX = startX + (Math.random() * 40 - 20);
                const endY = 110;
                const delay = Math.random() * 0.8;
                const duration = Math.random() * 2 + 1;
                const color = [
                  "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5",
                  "#047857", "#065f46", "#064e3b"
                ][Math.floor(Math.random() * 8)];
                
                return (
                  <motion.div
                    key={i}
                    initial={{ 
                      x: `${startX}%`, 
                      y: `${startY}%`, 
                      opacity: 1,
                      scale: 1,
                      rotate: 0
                    }}
                    animate={{ 
                      x: `${endX}%`, 
                      y: `${endY}%`,
                      opacity: 0,
                      scale: 0.5,
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      duration: duration, 
                      delay: delay,
                      ease: "easeOut"
                    }}
                    style={{ 
                      position: 'absolute',
                      width: size,
                      height: size,
                      backgroundColor: color,
                      borderRadius: Math.random() > 0.5 ? '50%' : '0%',
                    }}
                  />
                );
              })}
            </div>
          )}
          
          {/* Pledges */}
          {pledges.map((pledge) => (
            <motion.div
              key={pledge.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              whileHover={{ scale: 1.03, zIndex: 10 }}
              className="absolute p-4 max-w-[250px] rounded-lg shadow-md cursor-pointer"
              style={{
                left: `${pledge.position.x}%`,
                top: `${pledge.position.y}%`,
                backgroundColor: `${pledge.color}20`, // Using 20 for slight transparency
                borderLeft: `4px solid ${pledge.color}`,
                transform: `rotate(${pledge.rotation}deg)`,
                zIndex: hoveredPledge === pledge.id ? 10 : 1
              }}
              onClick={() => setHoveredPledge(hoveredPledge === pledge.id ? null : pledge.id)}
              onMouseEnter={() => setHoveredPledge(pledge.id)}
              onMouseLeave={() => setHoveredPledge(null)}
            >
              <div className="flex items-start">
                <Heart 
                  className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" 
                  style={{ color: pledge.color }} 
                />
                <p className="text-sm font-medium">{pledge.text}</p>
              </div>
              
              {hoveredPledge === pledge.id && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center justify-end text-xs"
                >
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    className="text-emerald-700 dark:text-emerald-300 flex items-center"
                  >
                    <Heart className="w-3 h-3 mr-1" fill="currentColor" /> Support
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          ))}
          
          {/* Add pledge button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDialogOpen(true)}
            className="absolute bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 shadow-lg"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-300 dark:border-emerald-700"
            />
            <Send className="h-6 w-6" />
          </motion.button>
        </motion.div>
        
        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button 
            onClick={() => setIsDialogOpen(true)}
            size="lg" 
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Add Your Pledge <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm text-muted-foreground">
            Join {(pledges.length + 412).toLocaleString()} people who have already pledged for a greener future
          </p>
        </motion.div>
      </div>
      
      {/* Add pledge dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Leaf className="h-5 w-5 text-emerald-500 mr-2" />
              Add Your Eco-Pledge
            </DialogTitle>
            <DialogDescription>
              Share your commitment to sustainability with our community
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="I pledge to..."
              value={newPledge}
              onChange={(e) => setNewPledge(e.target.value)}
              className="min-h-[120px]"
              maxLength={100}
            />
            <p className="text-xs text-right mt-1 text-muted-foreground">
              {newPledge.length}/100 characters
            </p>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={addPledge}>
              Add Pledge
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EcoPledgeCanvas; 