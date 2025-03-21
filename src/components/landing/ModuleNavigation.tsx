import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Building2, User, ArrowRight, Check, BarChart3, Factory, Globe, ShieldCheck, Leaf, Zap, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

// Features for each module
const enterpriseFeatures = [
  { icon: <Factory size={18} />, text: "Industrial emission monitoring" },
  { icon: <BarChart3 size={18} />, text: "Advanced analytics & forecasting" },
  { icon: <Globe size={18} />, text: "Regulatory compliance tools" },
  { icon: <ShieldCheck size={18} />, text: "Carbon credit management" }
];

const professionalFeatures = [
  { icon: <Briefcase size={18} />, text: "Professional carbon assessment" },
  { icon: <Zap size={18} />, text: "Business efficiency optimization" },
  { icon: <Leaf size={18} />, text: "Sustainability certification" },
  { icon: <Globe size={18} />, text: "Professional reporting tools" }
];

const ModuleNavigation = () => {
  const [ref, controls] = useScrollAnimation();
  const navigate = useNavigate();
  
  const handleEnterpriseClick = () => {
    // Set dashboard type preference
    localStorage.setItem('dashboardType', 'enterprise');
    
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate('/enterprise-dashboard');
    } else {
      navigate('/login');
    }
  };
  
  const handleProfessionalClick = () => {
    // Set dashboard type preference
    localStorage.setItem('dashboardType', 'professional');
    
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated) {
      navigate('/professional-dashboard');
    } else {
      navigate('/login');
    }
  };
  
  return (
    <section id="modules" className="py-20 bg-secondary/10">
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
            Choose Your <span className="text-primary">Eco Sattva</span> Solution
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Free solutions for businesses and professionals committed to a sustainable future
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Enterprise Module */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="h-32 bg-gradient-to-r from-primary/80 to-primary p-8 flex items-end">
              <Building2 className="h-12 w-12 text-white mr-4" />
              <h3 className="text-white text-2xl font-bold">Enterprise</h3>
            </div>
            <div className="p-8">
              <p className="text-muted-foreground mb-6">
                Comprehensive carbon management platform for large corporations and industrial operations. Monitor, analyze, and reduce your organization's environmental impact at scale.
              </p>
              
              <div className="space-y-4 mb-8">
                {enterpriseFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                      {feature.icon}
                    </div>
                    <p>{feature.text}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <div className="bg-primary/10 text-primary font-medium rounded-lg p-3 text-center mb-6">
                  100% Free for All Businesses
                </div>
                
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-white group-hover:shadow-md transition-all"
                  onClick={handleEnterpriseClick}
                >
                  Enterprise Dashboard <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
          
          {/* Professional Module */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="h-32 bg-gradient-to-r from-secondary/80 to-secondary p-8 flex items-end">
              <Briefcase className="h-12 w-12 text-white mr-4" />
              <h3 className="text-white text-2xl font-bold">Professional</h3>
            </div>
            <div className="p-8">
              <p className="text-muted-foreground mb-6">
                Tailored for small to medium businesses, consultants, and sustainability professionals. Optimize your carbon management with our specialized tools.
              </p>
              
              <div className="space-y-4 mb-8">
                {professionalFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-secondary/10 flex items-center justify-center mr-3 mt-0.5">
                      {feature.icon}
                    </div>
                    <p>{feature.text}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <div className="bg-secondary/10 text-secondary font-medium rounded-lg p-3 text-center mb-6">
                  Free For All Professionals
                </div>
                
                <Button 
                  className="w-full bg-secondary hover:bg-secondary/90 text-white group-hover:shadow-md transition-all"
                  onClick={handleProfessionalClick}
                >
                  Professional Dashboard <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 p-6 bg-card/50 rounded-xl border border-border text-center"
        >
          <h3 className="text-xl font-semibold mb-4">Not sure which solution is right for you?</h3>
          <p className="text-muted-foreground mb-6">
            Our sustainability experts can help you find the perfect fit for your needs. All our services are completely free.
          </p>
          <Button variant="outline" className="bg-background hover:bg-background/80">
            Schedule a Consultation
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ModuleNavigation; 