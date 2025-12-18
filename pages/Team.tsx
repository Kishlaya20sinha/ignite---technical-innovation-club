import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { TEAM_MEMBERS } from '../data';
import { TeamMember } from '../types';

const TeamCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="relative group w-full"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
      <div className="relative bg-dark-paper border border-white/5 rounded-2xl overflow-hidden h-full flex flex-col">
        <div className="aspect-square overflow-hidden relative">
           <img 
            src={member.image} 
            alt={member.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 space-x-4">
            {member.socials.github && (
              <a href={member.socials.github} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                <Github size={20} />
              </a>
            )}
            {member.socials.linkedin && (
              <a href={member.socials.linkedin} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                <Linkedin size={20} />
              </a>
            )}
             {member.socials.twitter && (
              <a href={member.socials.twitter} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors">
                <Twitter size={20} />
              </a>
            )}
          </div>
        </div>
        <div className="p-6 text-center">
          <h3 className="text-xl font-bold font-display mb-1">{member.name}</h3>
          <p className="text-primary text-sm font-medium">{member.role}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Team: React.FC = () => {
  const president = TEAM_MEMBERS.find(m => m.role === 'President');
  const vicePresident = TEAM_MEMBERS.find(m => m.role === 'Vice President');
  const coreMembers = TEAM_MEMBERS.filter(m => m.role !== 'President' && m.role !== 'Vice President');

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6">
        <SectionWrapper className="mb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Meet the Team</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The minds behind the magic. Dedicated student leaders driving innovation on campus.
          </p>
        </SectionWrapper>

        {/* Leads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {president && (
             <SectionWrapper delay={0.1}>
                <TeamCard member={president} />
             </SectionWrapper>
          )}
          {vicePresident && (
            <SectionWrapper delay={0.2}>
              <TeamCard member={vicePresident} />
            </SectionWrapper>
          )}
        </div>

        {/* Core Team */}
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold mb-10 text-center">Core Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreMembers.map((member, index) => (
              <SectionWrapper key={member.id} delay={index * 0.1}>
                <TeamCard member={member} />
              </SectionWrapper>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
