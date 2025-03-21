import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Server, BarChart2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const LLMCarbonPromo = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <span className="inline-block px-3 py-1 text-sm bg-emerald-500/10 text-emerald-500 rounded-full font-medium mb-4">
                New Feature
              </span>
              <h2 className="text-4xl font-bold tracking-tight mb-4">
                Track Your LLM Carbon Footprint
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Monitor, measure, and minimize the environmental impact of your AI models with our LLM Carbon Tracker.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-background/50 border border-border/50">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Server className="h-8 w-8 text-emerald-500 mb-2" />
                  <h3 className="font-medium">Monitor Usage</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track tokens, duration, and batch sizes across models
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background/50 border border-border/50">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <BarChart2 className="h-8 w-8 text-blue-500 mb-2" />
                  <h3 className="font-medium">Visualize Impact</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    See emissions data with intuitive charts
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-background/50 border border-border/50">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <Zap className="h-8 w-8 text-amber-500 mb-2" />
                  <h3 className="font-medium">Optimize Models</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Identify efficient models and reduce carbon
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="pt-4">
              <Link to="/llm-carbon-tracker">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Try LLM Carbon Tracker
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="#learn-more">
                <Button variant="link" className="ml-4">
                  Learn more
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative shadow-2xl rounded-xl overflow-hidden border border-border/50">
              <img 
                src="/images/llm-carbon-dashboard.png" 
                alt="LLM Carbon Tracker Dashboard" 
                className="w-full h-auto"
                onError={(e) => {
                  // Fallback for missing image
                  e.currentTarget.src = 'https://via.placeholder.com/800x500?text=LLM+Carbon+Tracker';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-6">
                <div className="text-white">
                  <p className="text-sm font-medium">Interactive Dashboard</p>
                  <p className="text-xs text-white/70">
                    No authentication required – See it in action instantly
                  </p>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg transform rotate-6">
              <span className="text-sm font-bold">Now Available</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LLMCarbonPromo; 