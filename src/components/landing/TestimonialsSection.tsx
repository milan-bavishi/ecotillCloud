import { useState } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ArrowLeft, ArrowRight, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    position: "Sustainability Director, TechStar Industries",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "This platform has revolutionized how we monitor our carbon emissions. The real-time data and analytics have helped us reduce our carbon footprint by 35% in just six months.",
    rating: 5
  },
  {
    id: 2,
    name: "Priya Patel",
    position: "CEO, GreenWave Solutions",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "The predictive analytics capabilities are impressive. We can now forecast our emissions and take proactive steps before issues arise. A game-changer for our sustainability initiatives.",
    rating: 5
  },
  {
    id: 3,
    name: "Vikram Mehta",
    position: "Operations Manager, Sunrise Manufacturing",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    content: "The compliance features save us countless hours of manual work. Staying up-to-date with regulations across different states has never been easier.",
    rating: 4
  },
  {
    id: 4,
    name: "Anika Reddy",
    position: "Sustainability Consultant, EcoAdvise",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    content: "I recommend this platform to all my clients. The detailed reporting and visualization tools make communication with stakeholders clear and effective.",
    rating: 5
  },
  {
    id: 5,
    name: "Sanjay Gupta",
    position: "CFO, Heritage Industries",
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
    content: "Not only has this platform helped us reduce emissions, but it's also led to significant cost savings through energy optimization. The ROI has been exceptional.",
    rating: 5
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [ref, controls] = useScrollAnimation();

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="py-20 bg-secondary/10">
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
            What Our Clients Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trusted by leading companies across India to manage their carbon footprint
          </p>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row gap-6 p-8 bg-card rounded-2xl shadow-md border border-border"
            >
              <div className="md:w-1/3 flex flex-col items-center md:items-start">
                <img 
                  src={testimonials[activeIndex].avatar} 
                  alt={testimonials[activeIndex].name}
                  className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-primary/20"
                />
                <h3 className="text-xl font-semibold">{testimonials[activeIndex].name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{testimonials[activeIndex].position}</p>
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonials[activeIndex].rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <div className="md:w-2/3 flex flex-col justify-center">
                <div className="text-xl italic leading-relaxed mb-6">
                  "{testimonials[activeIndex].content}"
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-muted-foreground text-sm">
                    {activeIndex + 1} of {testimonials.length}
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={prevTestimonial}
                      className="p-2 rounded-full bg-background hover:bg-background/80 border border-border"
                      aria-label="Previous testimonial"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={nextTestimonial}
                      className="p-2 rounded-full bg-primary text-white hover:bg-primary/90"
                      aria-label="Next testimonial"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 opacity-80">
          <img src="https://via.placeholder.com/120x40?text=Company+1" alt="Client Logo" className="h-8 grayscale hover:grayscale-0 transition-all" />
          <img src="https://via.placeholder.com/120x40?text=Company+2" alt="Client Logo" className="h-8 grayscale hover:grayscale-0 transition-all" />
          <img src="https://via.placeholder.com/120x40?text=Company+3" alt="Client Logo" className="h-8 grayscale hover:grayscale-0 transition-all" />
          <img src="https://via.placeholder.com/120x40?text=Company+4" alt="Client Logo" className="h-8 grayscale hover:grayscale-0 transition-all" />
          <img src="https://via.placeholder.com/120x40?text=Company+5" alt="Client Logo" className="h-8 grayscale hover:grayscale-0 transition-all" />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection; 