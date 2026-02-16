import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { api } from '../lib/api';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const location = useLocation();

  if (location.pathname === '/exam') return null; // Hide Navbar on exam page

  useEffect(() => {
    // Fetch events to check for featured mega events
    api.getAllEvents().then(events => {
      const featured = events.filter(e => e.type === 'mega' && e.isFeatured);
      setFeaturedEvents(featured);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Custom route mapping for special events (if they have hardcoded pages)
  const customRoutes: Record<string, string> = {
    'inginiux': '/inginiux',
  };

  const getEventPath = (eventName: string) => {
    const lowerName = eventName.toLowerCase();

    // Check for hardcoded custom routes first
    for (const key in customRoutes) {
      if (lowerName.includes(key)) {
        return customRoutes[key];
      }
    }

    // Otherwise, generate a slug
    // e.g. "Xordium 5.0" -> "/xordium-5.0"
    return `/${lowerName.replace(/\s+/g, '-')}`;
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Team', path: '/team' },
    { label: 'Alumni', path: '/alumni' },
    { label: 'Events', path: '/events' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'Recruit', path: '/recruit' },
    // Dynamically featured events
    ...featuredEvents.map(e => ({
      label: e.name,
      path: getEventPath(e.name),
      featured: true
    })),
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "circOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'bg-black/60 backdrop-blur-xl py-3 border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
        : 'bg-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <motion.div
            className="relative w-13 h-16"
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="/image.png"
              alt="IGNITE"
              className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] group-hover:drop-shadow-[0_0_25px_rgba(249,115,22,0.8)] transition-all duration-300"
            />
          </motion.div>
          <span className="text-2xl font-display font-bold tracking-tight bg-clip-text">
            IGNITE
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-full ${item.featured
                ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                : location.pathname === item.path
                  ? 'text-primary'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              {item.label}
              {!item.featured && location.pathname === item.path && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-full -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none p-2 rounded-lg hover:bg-white/5 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed inset-0 top-16 bg-black/95 backdrop-blur-xl z-40 overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`text-3xl font-display font-bold transition-colors ${item.featured
                      ? 'text-primary' // Featured items are always primary in mobile
                      : location.pathname === item.path
                        ? 'text-primary'
                        : 'text-gray-300 hover:text-white'
                      }`}
                    onClick={() => setIsOpen(false)} // Close menu on item click
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;