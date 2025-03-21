import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Particle class for simulation
class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
  growth: number;
  
  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = Math.random() * 5 + 1;
    this.speedX = Math.random() * 3 - 1.5;
    this.speedY = Math.random() * 3 - 1.5;
    this.color = this.getRandomColor();
    this.opacity = 0.1 + Math.random() * 0.4;
    this.growth = Math.random() * 0.02 - 0.01;
  }
  
  getRandomColor(): string {
    const colors = [
      'rgba(16, 185, 129, alpha)', // emerald green
      'rgba(59, 130, 246, alpha)', // blue
      'rgba(16, 185, 129, alpha)', // emerald again (higher probability)
      'rgba(245, 158, 11, alpha)', // amber
    ];
    return colors[Math.floor(Math.random() * colors.length)].replace('alpha', this.opacity.toString());
  }
  
  update(width: number, height: number): void {
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Bounce off edges
    if (this.x < 0 || this.x > width) this.speedX *= -1;
    if (this.y < 0 || this.y > height) this.speedY *= -1;
    
    // Random size change for organic feel
    this.size += this.growth;
    if (this.size < 1 || this.size > 7) this.growth *= -1;
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

interface EcoStats {
  treesPlanted: number;
  co2Reduced: number;
  projectsSupported: number;
  greenEnergy: number;
}

const EcoImpactVisualizer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [stats, setStats] = useState<EcoStats>({
    treesPlanted: 0,
    co2Reduced: 0,
    projectsSupported: 0,
    greenEnergy: 0
  });
  
  console.log("EcoImpactVisualizer rendering");
  
  const targetStats: EcoStats = {
    treesPlanted: 85432,
    co2Reduced: 1234567,
    projectsSupported: 342,
    greenEnergy: 78000
  };
  
  // Initialize canvas and particles
  useEffect(() => {
    console.log("Canvas initialization effect");
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get canvas context");
      return;
    }
    
    // Set canvas size to match its display size
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (canvas.width !== width || canvas.height !== height) {
        const { devicePixelRatio = 1 } = window;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        ctx.scale(devicePixelRatio, devicePixelRatio);
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create particles
    const { width, height } = canvas.getBoundingClientRect();
    particlesRef.current = Array.from({ length: 80 }, () => new Particle(width, height));
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect();
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Update and draw particles
      particlesRef.current.forEach(particle => {
        particle.update(width, height);
        particle.draw(ctx);
      });
      
      // Connect nearby particles with lines
      connectParticles(ctx, width, height);
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  // Connect particles that are close to each other
  const connectParticles = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const maxDistance = width * 0.08; // 8% of screen width as max connection distance
    
    for (let i = 0; i < particlesRef.current.length; i++) {
      for (let j = i + 1; j < particlesRef.current.length; j++) {
        const dx = particlesRef.current[i].x - particlesRef.current[j].x;
        const dy = particlesRef.current[i].y - particlesRef.current[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          // Opacity based on distance (closer = more opaque)
          const opacity = 1 - (distance / maxDistance);
          ctx.strokeStyle = `rgba(16, 185, 129, ${opacity * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
          ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
          ctx.stroke();
        }
      }
    }
  };
  
  // Gradually increase stats for animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => ({
        treesPlanted: Math.min(prevStats.treesPlanted + 317, targetStats.treesPlanted),
        co2Reduced: Math.min(prevStats.co2Reduced + 4567, targetStats.co2Reduced),
        projectsSupported: Math.min(prevStats.projectsSupported + 1, targetStats.projectsSupported),
        greenEnergy: Math.min(prevStats.greenEnergy + 280, targetStats.greenEnergy)
      }));
    }, 100);
    
    // Clear interval when all stats reach target
    if (stats.treesPlanted === targetStats.treesPlanted &&
        stats.co2Reduced === targetStats.co2Reduced &&
        stats.projectsSupported === targetStats.projectsSupported &&
        stats.greenEnergy === targetStats.greenEnergy) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [stats, targetStats]);
  
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };
  
  // Data for impact cards
  const impactData = [
    {
      title: 'Trees Planted',
      value: formatNumber(stats.treesPlanted),
      subtext: 'across 35 countries',
      color: 'from-green-500 to-emerald-400'
    },
    {
      title: 'CO₂ Reduced',
      value: formatNumber(stats.co2Reduced),
      subtext: 'tonnes of carbon offset',
      color: 'from-blue-500 to-cyan-400'
    },
    {
      title: 'Projects Supported',
      value: stats.projectsSupported.toString(),
      subtext: 'sustainable initiatives',
      color: 'from-amber-500 to-yellow-400'
    },
    {
      title: 'Green Energy',
      value: formatNumber(stats.greenEnergy),
      subtext: 'kWh renewable energy',
      color: 'from-indigo-500 to-purple-400'
    }
  ];
  
  return (
    <div className="relative py-20 overflow-hidden bg-background border-y-4 border-primary">
      <div className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-center mb-6"
        >
          Our Collective Impact
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground max-w-2xl mx-auto mb-12"
        >
          Together with our users, we're making a tangible difference in the fight against climate change.
          Every action contributes to these real-time results.
        </motion.p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {impactData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
              viewport={{ once: true }}
              className={`
                relative overflow-hidden rounded-xl p-6 
                bg-gradient-to-br ${item.color}
                transform transition-all duration-300
                ${highlightedIndex === index ? 'scale-105 shadow-lg' : 'shadow'}
              `}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseLeave={() => setHighlightedIndex(null)}
            >
              <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 opacity-20 rounded-full bg-white blur-2xl" />
              
              <h3 className="text-lg font-medium text-white mb-1">
                {item.title}
              </h3>
              
              <div className="text-3xl font-bold text-white mb-1">
                {item.value}
              </div>
              
              <p className="text-sm text-white/80">
                {item.subtext}
              </p>
              
              {/* Pulsing circle animation */}
              <div className="absolute bottom-2 right-2">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-4 h-4 rounded-full bg-white/30"
                />
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <button 
            className="group relative overflow-hidden rounded-full bg-primary px-6 py-3 text-primary-foreground shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <span className="relative z-10">Join Our Mission</span>
            <div className="absolute inset-0 z-0 bg-gradient-to-r from-primary/80 via-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default EcoImpactVisualizer; 