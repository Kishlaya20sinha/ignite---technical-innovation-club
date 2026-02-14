import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';

const Contact: React.FC = () => {
  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Info Side */}
          <SectionWrapper>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8">Get in Touch</h1>
            <p className="text-xl text-gray-400 mb-12">
              Have questions? Want to collaborate? We'd love to hear from you.
            </p>

            <div className="space-y-8">
              <div className="flex items-start space-x-6">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Email Us</h3>
                  <p className="text-gray-400">ignite@bitmesra.ac.in</p>
                </div>
              </div>

             

              <div className="flex items-start space-x-6">
                 <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">Call Us</h3>
                  <p className="text-gray-400">+91 9386881353</p>
                  <p className="text-gray-400">+91 9508664027</p>
                </div>
              </div>
            </div>
          </SectionWrapper>

          {/* Form Side */}
          <SectionWrapper delay={0.2}>
            <form className="bg-white/5 p-8 md:p-10 rounded-3xl border border-white/10" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" placeholder="Aditya" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input type="email" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" placeholder="aditya@example.com" />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" placeholder="Collaboration Proposal" />
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                <textarea rows={4} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors resize-none" placeholder="Tell us about your project..." />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
              >
                Send Message <Send size={18} />
              </motion.button>
            </form>
          </SectionWrapper>

        </div>
      </div>
    </div>
  );
};

export default Contact;
