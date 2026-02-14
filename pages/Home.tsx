import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Cpu, Users } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen pt-24 flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-6 text-center z-10">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-6 inline-block"
          >
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-primary uppercase tracking-wider">
              Innovation Starts Here
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-9xl font-display font-bold leading-tight mb-8"
          >
            IGNITE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              THE FUTURE
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12"
          >
            The premier Tech Society Of BIT Mesra fostering innovation, coding excellence,
            and leadership for the next generation of tech giants.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              to="/"
              className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Join the Club <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/events"
              className="px-8 py-4 border border-white/20 hover:border-white text-white font-medium rounded-full transition-all transform hover:scale-105"
            >
              View Events
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500"
        >
          <div className="w-6 h-10 border-2 border-gray-500 rounded-full flex justify-center p-1">
            <div className="w-1 h-2 bg-gray-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { label: 'Members', value: '200+' },
              { label: 'Active Members', value: '85+' },
              { label: 'Events Hosted', value: '50+' },
            ].map((stat, index) => (
              <SectionWrapper key={index} delay={index * 0.1}>
                <div className="text-center">
                  <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-gray-400 text-sm uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHAT WE DO ================= */}
      <section className="py-32">
        <div className="container mx-auto px-6">

          <SectionWrapper className="mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              What We Do
            </h2>
            <div className="w-20 h-1 bg-primary mb-8" />
            <p className="text-xl text-gray-400 max-w-2xl">
              We provide a platform for students to explore, learn, and create.
              From workshops to hackathons, we cover it all.
            </p>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Code className="w-8 h-8 text-primary" />,
                title: 'Development',
                desc: 'Workshops on Web, App, and AI development using cutting-edge stacks.',
              },
              {
                icon: <Cpu className="w-8 h-8 text-blue-500" />,
                title: 'Hardware',
                desc: 'Hands-on sessions with Arduino, Raspberry Pi, and IoT systems.',
              },
              {
                icon: <Users className="w-8 h-8 text-purple-500" />,
                title: 'Community',
                desc: 'Networking events, mentorship programs, and career guidance.',
              },
            ].map((item, index) => (
              <SectionWrapper key={index} delay={index * 0.2}>
                <div className="group p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-white/10 transition-all duration-300 h-full">
                  <div className="mb-6 p-4 bg-black/20 rounded-xl inline-block group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <SectionWrapper>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">
              Ready to Ignite?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join a community of passionate developers, designers, and innovators.
              Let's build something amazing together.
            </p>
            <Link
              to="/contact"
              className="inline-block px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-200 transition-colors"
            >
              Get In Touch
            </Link>
          </SectionWrapper>
        </div>
      </section>
    </div>
  );
};

export default Home;
