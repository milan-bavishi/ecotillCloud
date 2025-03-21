import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sprout, ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen relative overflow-hidden bg-gradient-to-b from-background to-secondary/20"
    >
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center">
        <motion.div variants={itemVariants} className="text-emerald-500 mb-6">
          <Sprout size={48} strokeWidth={2.5} />
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold text-foreground mb-6">
          Precision Carbon Management
          <br />
          <span className="text-emerald-500/80">for Sustainable Enterprises</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-12">
          Transform your business with AI-powered carbon tracking and reduction strategies. 
          Make sustainability a competitive advantage.
        </motion.p>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-16"
        >
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6"
          >
            Try Sattva AI <ArrowRight className="ml-2" />
          </Button>
        </motion.div>

        {/* Impact Stats - New Section */}
        <motion.div 
          variants={itemVariants}
          className="w-full mt-8 pt-8 border-t border-border/40"
        >
          <h2 className="text-2xl font-bold mb-8">Our Global Impact</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-primary">85.4k</div>
              <div className="text-sm text-muted-foreground">Trees Planted</div>
            </div>
            
            <div className="bg-blue-500/10 dark:bg-blue-500/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-500">1.2M</div>
              <div className="text-sm text-muted-foreground">CO₂ Reduced (tonnes)</div>
            </div>
            
            <div className="bg-amber-500/10 dark:bg-amber-500/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-amber-500">342</div>
              <div className="text-sm text-muted-foreground">Projects Supported</div>
            </div>
            
            <div className="bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg p-4">
              <div className="text-3xl font-bold text-indigo-500">78k</div>
              <div className="text-sm text-muted-foreground">Green Energy (kWh)</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </motion.section>
  );
};

export default HeroSection;