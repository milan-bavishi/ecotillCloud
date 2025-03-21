import { motion } from 'framer-motion';
import { LineChart, BarChart3, Trophy } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    icon: LineChart,
    title: "Real-time Tracking",
    description: "Monitor your carbon footprint with precision using our advanced AI algorithms and real-time data analysis."
  },
  {
    icon: BarChart3,
    title: "Actionable Insights",
    description: "Get detailed reports and recommendations to optimize your sustainability efforts and reduce emissions."
  },
  {
    icon: Trophy,
    title: "Proven Results",
    description: "Join leading enterprises achieving up to 40% reduction in carbon emissions within the first year."
  }
];

const ValueProposition = () => {
  const [ref, controls] = useScrollAnimation();

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
        duration: 0.8
      }
    }
  };

  return (
    <section className="py-20 bg-secondary/20">
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="max-w-6xl mx-auto px-4"
      >
        <motion.h2 
          variants={itemVariants}
          className="text-3xl md:text-4xl font-bold text-center mb-16"
        >
          Why Choose Sattva AI?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-lg"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default ValueProposition;