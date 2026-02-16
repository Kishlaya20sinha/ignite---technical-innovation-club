import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from "@vercel/analytics/react";

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Cursor from './components/Cursor';
import AnimatedBackground from './components/AnimatedBackground';

// Pages
import Home from './pages/Home';
import Team from './pages/Team';
import Alumni from './pages/Alumni';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Developers from './pages/Developers';
import Recruit from './pages/Recruit';
import Inginiux from './pages/Inginiux';
import Exam from './pages/Exam';
import Admin from './pages/Admin';
import MegaEvent from './pages/MegaEvent';

// Scroll to top component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/team" element={<Team />} />
        <Route path="/alumni" element={<Alumni />} />
        <Route path="/events" element={<Events />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/recruit" element={<Recruit />} />
        <Route path="/inginiux" element={<Inginiux />} />
        <Route path="/exam" element={<Exam />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/:slug" element={<MegaEvent />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-dark text-white min-h-screen selection:bg-primary selection:text-white">
        <Cursor />
        <AnimatedBackground />
        <Navbar />
        <ScrollToTop />
        <main>
          <AnimatedRoutes />
        </main>
        <Footer />
        <Analytics />
      </div>
    </Router>
  );
};

export default App;