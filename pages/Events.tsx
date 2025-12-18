import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { EVENTS } from '../data';

const Events: React.FC = () => {
  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6">
        <SectionWrapper className="mb-20">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Events</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Join us for workshops, hackathons, and tech talks. Learn, compete, and grow.
          </p>
        </SectionWrapper>

        <div className="space-y-12">
          {EVENTS.map((event, index) => (
            <SectionWrapper key={event.id} delay={index * 0.1}>
              <motion.div 
                className="group relative grid grid-cols-1 md:grid-cols-12 gap-8 bg-white/5 border border-white/5 rounded-3xl overflow-hidden hover:bg-white/[0.07] transition-all duration-300"
                whileHover={{ y: -5 }}
              >
                {/* Image */}
                <div className="md:col-span-4 h-64 md:h-auto overflow-hidden">
                  <img 
                    src={encodeURI(event.image)} 
                    alt={event.title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                </div>

                {/* Content */}
                <div className="md:col-span-8 p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                     <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
                      {event.category}
                    </span>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {event.date}
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-display font-bold mb-4 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-400 mb-8 max-w-2xl leading-relaxed">
                    {event.description}
                  </p>

                  <button className="flex items-center text-white font-medium group/btn w-max">
                    Register Now
                    <ArrowRight className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;
