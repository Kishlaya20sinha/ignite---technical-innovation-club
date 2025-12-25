import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { TEAM_MEMBERS } from '../data';
import { TeamMember } from '../types';

const TeamCard: React.FC<{ member: TeamMember }> = ({ member }) => {
  return (
    <motion.div whileHover={{ y: -10 }} className="relative group w-full">
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-0 group-hover:opacity-40 transition-opacity duration-500" />

      <div className="relative bg-dark-paper border border-white/5 rounded-2xl overflow-hidden h-full flex flex-col">
        <div className="aspect-square overflow-hidden relative h-64 md:h-auto">
          <img
            src={member.image || '/placeholder.svg'}
            alt={member.name}
            onError={(e: any) => { e.currentTarget.src = '/placeholder.svg'; }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {member.socials.linkedin && member.socials.linkedin !== '#' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <a
                href={member.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          )}
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
  const vicePresidents = TEAM_MEMBERS.filter(m => m.role === 'Vice President');
  const secretary = TEAM_MEMBERS.find(m => m.role === 'Secretary');
  const treasurer = TEAM_MEMBERS.find(m => m.role === 'Treasurer');

  const coreTeam = TEAM_MEMBERS.filter(
    m =>
      !['President', 'Vice President', 'Secretary', 'Treasurer', 'Member'].includes(
        m.role
      )
  );

  const members = TEAM_MEMBERS.filter(m => m.role === 'Member');

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6">

        <SectionWrapper className="mb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            Meet the Team
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            The minds behind the magic. Dedicated student leaders driving innovation.
          </p>
        </SectionWrapper>

        {/* Leadership */}
        <div className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
            {president && (
              <SectionWrapper delay={0.1}>
                <TeamCard member={president} />
              </SectionWrapper>
            )}

            {vicePresidents.map((vp, index) => (
              <SectionWrapper key={vp.id} delay={0.2 + index * 0.1}>
                <TeamCard member={vp} />
              </SectionWrapper>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {secretary && (
              <div className="md:col-span-2 flex justify-center">
                <SectionWrapper delay={0.4}>
                  <div className="w-full md:max-w-sm">
                    <TeamCard member={secretary} />
                  </div>
                </SectionWrapper>
              </div>
            )}

            {treasurer && (
              <div className="md:col-span-2 flex justify-center">
                <SectionWrapper delay={0.5}>
                  <div className="w-full md:max-w-sm">
                    <TeamCard member={treasurer} />
                  </div>
                </SectionWrapper>
              </div>
            )}
          </div>
        </div>

        {/* Core Team */}
        <div className="mb-20">
          <h2 className="text-3xl font-display font-bold mb-10 text-center">
            Core Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreTeam.map((member, index) => (
              <SectionWrapper key={member.id} delay={index * 0.08}>
                <TeamCard member={member} />
              </SectionWrapper>
            ))}
          </div>
        </div>

        {/* Members */}
        <div>
          <h2 className="text-3xl font-display font-bold mb-10 text-center">
            Members
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {members.map((member, index) => (
              <SectionWrapper key={member.id} delay={index * 0.05}>
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
