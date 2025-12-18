import React from 'react';
import { Flame, Github, Linkedin, Twitter, Mail, PhoneCall, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';


const Footer: React.FC = () => {
  return (
    <footer className="bg-dark/50 border-t border-white/5 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
            
               <div className="relative w-13 h-16">
            {/* Logo Image - Ensure 'logo.png' is in your public folder */}
            <img 
              src="/image.png" 
              alt="IGNITE" 
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] group-hover:scale-110 transition-transform duration-300" 
            />
          </div>
              <span className="text-xl font-display font-bold">IGNITE</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Fostering innovation, collaboration, and technical excellence. We build the future, one line of code at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/team" className="hover:text-primary transition-colors">Our Team</Link></li>
              <li><Link to="/events" className="hover:text-primary transition-colors">Events</Link></li>
              <li><Link to="/gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link to="/alumni" className="hover:text-primary transition-colors">Alumni Network</Link></li>
              <li><Link to="/developers" className="hover:text-primary transition-colors">Developers</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>ignite@bitmesra.ac.in</span>
              </li>
              <li className="flex items-center space-x-2">
                <PhoneCall className="w-4 h-4" />
                <span>+91 9386881353</span>
              </li>
               <li className="flex items-center space-x-2">
                <PhoneCall className="w-4 h-4" />
                <span>+91 9508664027</span>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-display font-bold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/ignite_bitp" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.linkedin.com/company/ignite-club-bit-mesra/" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
              
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 text-center text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Ignite Technical Club. All rights reserved.</p>
          <Link to="/developers" className="text-xs text-gray-600 hover:text-primary transition-colors">
            Designed & Developed by Aditya & Kishlaya
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;