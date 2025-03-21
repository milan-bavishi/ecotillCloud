import { motion } from 'framer-motion';
import { Activity, BarChart2, Globe, RefreshCcw, Zap, Database } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    icon: <Activity className="h-10 w-10 text-primary" />,
    title: "Real-time Carbon Tracking",
    description: "Monitor your carbon emissions in real-time with our advanced IoT sensors and AI analytics."
  },
  {
    icon: <BarChart2 className="h-10 w-10 text-primary" />,
    title: "Predictive Analytics",
    description: "Leverage machine learning to forecast emissions and identify opportunities for reduction."
  },
  {
    icon: <Globe className="h-10 w-10 text-primary" />,
    title: "Global Compliance",
    description: "Stay compliant with international carbon regulations and standards across all regions."
  },
  {
    icon: <RefreshCcw className="h-10 w-10 text-primary" />,
    title: "Carbon Offset Management",
    description: "Easily manage and track your carbon offset projects and investments in one place."
  },
  {
    icon: <Zap className="h-10 w-10 text-primary" />,
    title: "Energy Optimization",
    description: "Identify energy inefficiencies and receive AI-powered recommendations for optimization."
  },
  {
    icon: <Database className="h-10 w-10 text-primary" />,
    title: "Comprehensive Reporting",
    description: "Generate detailed carbon reports for stakeholders, regulators, and sustainability initiatives."
  }
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0], index: number }) => {
  const [ref, controls] = useScrollAnimation();
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.5, 
            delay: index * 0.1 
          }
        }
      }}
      className="bg-card hover:bg-card/90 p-6 rounded-xl shadow-sm border border-border hover:border-primary/20 transition-all duration-300"
    >
      <div className="mb-4">{feature.icon}</div>
      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  const [ref, controls] = useScrollAnimation();

  return (
    <section id="features" className="py-20 bg-background/50">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for <span className="text-primary">Sustainable</span> Businesses
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our platform provides comprehensive tools to monitor, analyze, and reduce your carbon footprint
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <a 
            href="#"
            className="text-primary font-medium hover:underline flex items-center justify-center"
          >
            View all features
            <svg className="ml-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection; 