import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Cpu, Users, Zap, ChevronDown } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-screen pt-24 flex items-center justify-center overflow-hidden">
        {/* Hero radial glow behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="container mx-auto px-6 text-center z-10">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 inline-block"
          >
            <span className="px-5 py-2 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium text-primary uppercase tracking-[0.2em] backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
              Innovation Starts Here
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl lg:text-[10rem] font-display font-bold leading-[0.9] mb-8 tracking-tight"
          >
            IGNITE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-red-500">
              THE FUTURE
            </span>
          </motion.h1>

          {/* Subtitle line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-24 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-6"
          />

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            The premier Tech Society of <span className="text-white font-medium">BIT Mesra</span> — fostering innovation, coding excellence,
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
              className="group relative px-8 py-4 bg-primary text-white font-bold rounded-full transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)]"
            >
              Join the Club <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/events"
              className="px-8 py-4 border border-white/20 hover:border-primary/50 text-white font-medium rounded-full transition-all transform hover:scale-105 hover:bg-white/5 backdrop-blur-sm"
            >
              View Events
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-600"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-600">Scroll</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </motion.div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="py-20 border-y border-white/5 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { label: 'Members', value: '200+', icon: Users },
              { label: 'Active Members', value: '85+', icon: Zap },
              { label: 'Events Hosted', value: '50+', icon: Code },
            ].map((stat, index) => (
              <SectionWrapper key={index} delay={index * 0.1}>
                <div className="text-center group cursor-default">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-4xl md:text-5xl font-display font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {stat.value}
                  </h3>
                  <p className="text-gray-500 text-sm uppercase tracking-[0.2em]">
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[2px] bg-primary" />
              <span className="text-primary text-sm uppercase tracking-[0.2em] font-medium">Our Focus</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
              What We Do
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl">
              We provide a platform for students to explore, learn, and create.
              From workshops to hackathons, we cover it all.
            </p>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Code className="w-7 h-7" />,
                title: 'Development',
                desc: 'Workshops on Web, App, and AI development using cutting-edge stacks.',
                color: 'text-primary',
                borderColor: 'group-hover:border-primary/40',
                glowColor: 'group-hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]'
              },
              {
                icon: <Cpu className="w-7 h-7" />,
                title: 'Hardware',
                desc: 'Hands-on sessions with Arduino, Raspberry Pi, and IoT systems.',
                color: 'text-cyan-400',
                borderColor: 'group-hover:border-cyan-400/40',
                glowColor: 'group-hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]'
              },
              {
                icon: <Users className="w-7 h-7" />,
                title: 'Community',
                desc: 'Networking events, mentorship programs, and career guidance.',
                color: 'text-purple-400',
                borderColor: 'group-hover:border-purple-400/40',
                glowColor: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]'
              },
            ].map((item, index) => (
              <SectionWrapper key={index} delay={index * 0.15}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className={`group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 ${item.borderColor} ${item.glowColor} transition-all duration-500 h-full cursor-default`}
                >
                  {/* Corner accent */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl ${item.color === 'text-primary' ? 'from-primary/5' : item.color === 'text-cyan-400' ? 'from-cyan-400/5' : 'from-purple-400/5'} to-transparent rounded-tr-2xl`} />

                  <div className={`mb-6 p-3 rounded-xl bg-white/5 inline-block ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 font-display">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{item.desc}</p>
                </motion.div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(249,115,22,1) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <SectionWrapper>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-8">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Ignite</span>?
            </h2>
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join a community of passionate developers, designers, and innovators.
              Let's build something amazing together.
            </p>
            <Link
              to="/contact"
              className="inline-block px-10 py-5 bg-white text-black font-bold text-lg rounded-full hover:bg-gray-100 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:scale-105 transform"
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
