import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';

export const Preloader = () => {
  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const dotVariants = {
    initial: { 
      y: 0,
      opacity: 0 
    },
    animate: {
      y: [0, -10, 0],
      opacity: 1,
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const textVariants = {
    initial: { 
      opacity: 0,
      y: 10
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.5
      }
    }
  };

  const backgroundVariants = {
    initial: { 
      opacity: 0 
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const iconVariants = {
    initial: { 
      scale: 0.8,
      opacity: 0.5
    },
    animate: {
      scale: [0.8, 1.1, 0.9, 1],
      opacity: [0.5, 1, 0.8, 1],
      rotate: [0, 10, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={backgroundVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed inset-0 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm flex flex-col items-center justify-center z-50"
    >
      <motion.div
        className="relative mb-8"
        variants={iconVariants}
        initial="initial"
        animate="animate"
      >
        <Sprout size={64} className="text-emerald-500" strokeWidth={2.5} />
        <motion.div 
          className="absolute -inset-4 rounded-full bg-emerald-500/10"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2] 
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      <motion.div
        variants={textVariants}
        initial="initial"
        animate="animate"
        className="text-2xl font-bold text-foreground mb-6"
      >
        Eco सत्वा
      </motion.div>

      <motion.div 
        className="flex space-x-2"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={dotVariants} className="w-2 h-2 rounded-full bg-emerald-500"/>
        <motion.div variants={dotVariants} className="w-2 h-2 rounded-full bg-emerald-500"/>
        <motion.div variants={dotVariants} className="w-2 h-2 rounded-full bg-emerald-500"/>
      </motion.div>
    </motion.div>
  );
};