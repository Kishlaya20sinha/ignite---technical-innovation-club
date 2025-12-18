import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Terminal, Code2 } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';

const developers = [
  {
    name: "Aditya Agarwal",
    role: "Full Stack Developer",
    image: "/Photograph/917aa01f-9ef0-4275-8303-2acc78f6fb6a - Aditya Agarwal.jpeg",
    socials: { linkedin: "https://www.linkedin.com/in/aditya2227?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    skills: ["React", "Node.js", "DSA"],
  },
  {
    name: "Kishlaya Sinha",
    role: "Frontend Engineer",
    image: "/Photograph/Kishlaya Sinha - KISHLAYA SINHA.jpg",
    socials: { linkedin: "https://www.linkedin.com/in/kishlaya-sinha-9134a0211?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    skills: ["UI/UX", "AI/ML", "React"],
  },
];

const Developers: React.FC = () => {
  return (
    <div className="pt-32 pb-20 min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-6 relative z-10">
        <SectionWrapper className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-6">
            <Terminal size={16} />
            <span>Behind the Code</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
            The Developers
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Crafting digital experiences with precision and passion.
          </p>
        </SectionWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {developers.map((dev, index) => (
            <SectionWrapper key={dev.name} delay={index * 0.2}>
              <motion.div
                whileHover={{ y: -8 }}
                className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden hover:bg-white/[0.07] transition-all duration-300 shadow-2xl shadow-black/50"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col items-center text-center">
                  
                  {/* ✅ IMAGE: STABLE, NORMALIZED */}
                  <div className="w-32 h-32 mb-6 rounded-full p-[2px] bg-gradient-to-br from-primary to-purple-600">
                    <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
                      <img
                        src={encodeURI(dev.image)}
                        alt={dev.name}
                        draggable={false}
                        className="
                          w-full h-full
                          object-cover object-center
                          will-change-auto
                          select-none
                          filter
                          contrast-[0.96]
                          saturate-[0.96]
                          brightness-[0.98]
                        "
                      />
                    </div>
                  </div>

                  <h3 className="text-3xl font-display font-bold mb-2">
                    {dev.name}
                  </h3>

                  <div className="flex items-center gap-2 text-primary font-medium mb-6">
                    <Code2 size={16} />
                    {dev.role}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {dev.skills.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-xs bg-white/5 rounded-full border border-white/5 text-gray-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <a
                    href={dev.socials.linkedin}
                    className="p-3 bg-white/5 rounded-full hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    <Linkedin size={20} />
                  </a>
                </div>
              </motion.div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Developers;
