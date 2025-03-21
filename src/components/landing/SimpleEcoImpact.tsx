import React, { useEffect } from 'react';

const SimpleEcoImpact = () => {
  useEffect(() => {
    console.log("SimpleEcoImpact component mounted");
  }, []);

  return (
    <div className="py-12 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 border-y-4 border-primary">
      {/* Debugging border */}
      <div className="w-full text-center bg-yellow-300 dark:bg-yellow-600 py-3 mb-8 text-black dark:text-white font-bold">
        IMPACT VISUALIZER SECTION
      </div>
      
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
          Our Collective Impact
        </h2>
        
        <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
          Together with our users, we're making a tangible difference in the fight against climate change.
          Every action contributes to these real-time results.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-400 rounded-xl p-6 shadow">
            <h3 className="text-lg font-medium text-white mb-1">
              Trees Planted
            </h3>
            <div className="text-3xl font-bold text-white mb-1">
              85.4k
            </div>
            <p className="text-sm text-white/80">
              across 35 countries
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl p-6 shadow">
            <h3 className="text-lg font-medium text-white mb-1">
              CO₂ Reduced
            </h3>
            <div className="text-3xl font-bold text-white mb-1">
              1.2M
            </div>
            <p className="text-sm text-white/80">
              tonnes of carbon offset
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-yellow-400 rounded-xl p-6 shadow">
            <h3 className="text-lg font-medium text-white mb-1">
              Projects Supported
            </h3>
            <div className="text-3xl font-bold text-white mb-1">
              342
            </div>
            <p className="text-sm text-white/80">
              sustainable initiatives
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-purple-400 rounded-xl p-6 shadow">
            <h3 className="text-lg font-medium text-white mb-1">
              Green Energy
            </h3>
            <div className="text-3xl font-bold text-white mb-1">
              78k
            </div>
            <p className="text-sm text-white/80">
              kWh renewable energy
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full shadow-md">
            Join Our Mission
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleEcoImpact; 