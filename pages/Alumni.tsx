import React from 'react';
import SectionWrapper from '../components/SectionWrapper';
import { ALUMNI_MEMBERS } from '../data';
import { Briefcase } from 'lucide-react';

const Alumni: React.FC = () => {
  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6">
        <SectionWrapper className="mb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Alumni Network</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our legacy continues through our alumni who are making waves in top tech companies worldwide.
          </p>
        </SectionWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {ALUMNI_MEMBERS.map((alum, index) => (
            <SectionWrapper key={alum.id} delay={index * 0.1}>
              <div className="flex items-center p-6 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                <img 
                  src={alum.image} 
                  alt={alum.name} 
                  className="w-24 h-24 rounded-full object-cover mr-6 border-2 border-primary/50"
                />
                <div>
                  <h3 className="text-2xl font-bold font-display mb-1">{alum.name}</h3>
                  <div className="flex items-center text-primary mb-2">
                    <Briefcase className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{alum.role} at {alum.company}</span>
                  </div>
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs text-gray-400">
                    Batch of {alum.batch}
                  </span>
                </div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alumni;
