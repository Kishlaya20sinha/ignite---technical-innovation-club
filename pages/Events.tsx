import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogOut, Users, Calendar, MapPin, ChevronRight, X, Phone, User, GraduationCap, Hash, Trophy, Info, ChevronDown, ChevronUp, Share2 } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { api } from '../lib/api';

const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [regForm, setRegForm] = useState({ name: '', email: '', rollNo: '', phone: '', teamName: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regError, setRegError] = useState('');

  useEffect(() => {
    api.getAllEvents().then(data => {
      setEvents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError('');
    try {
      await api.registerForEvent({ ...regForm, eventId: selectedEvent._id });
      setRegSuccess(true);
      setTimeout(() => {
        setRegSuccess(false);
        setSelectedEvent(null);
        setRegForm({ name: '', email: '', rollNo: '', phone: '', teamName: '' });
      }, 2000);
    } catch (err: any) {
      setRegError(err.message || 'Registration failed');
    }
    setRegLoading(false);
  };

  const rootEvents = events.filter(e => !e.parentId);
  const getSubEvents = (parentId: string) => events.filter(e => e.parentId === parentId);

  const handleShare = async (event: any) => {
    const shareUrl = `${(import.meta as any).env.VITE_API_URL || 'https://ignite-technical-innovation-club.onrender.com'}/share/events/${event._id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: event.description,
          url: shareUrl
        });
      } catch (err) { console.error('Error sharing:', err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const EventCard = ({ event, isSub = false }: { event: any, isSub?: boolean, key?: any }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group relative overflow-hidden ${isSub ? 'bg-white/5 border border-white/5 rounded-xl' : 'bg-white/5 border border-white/5 rounded-3xl'}`}
    >
      {/* Image for Root Events */}
      {!isSub && (
        <div className="h-48 md:h-64 overflow-hidden relative">
          {event.image ? (
            <img src={event.image} alt={event.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <span className="text-4xl">✨</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-full mb-2 inline-block">
              {event.type === 'mega' ? 'Flagship Event' : 'Workshop'}
            </span>
            <h3 className="text-2xl font-display font-bold text-white">{event.name}</h3>
          </div>
        </div>
      )}

      <div className="p-6">
        {isSub && (
          <div className="mb-4">
            <h4 className="text-xl font-bold">{event.name}</h4>
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
          {event.date && <div className="flex items-center gap-1"><Calendar className="w-4 h-4 text-primary" /> {new Date(event.date).toLocaleDateString()}</div>}
          {event.venue && <div className="flex items-center gap-1"><MapPin className="w-4 h-4 text-primary" /> {event.venue}</div>}
          {event.isTeamEvent && <div className="flex items-center gap-1"><Users className="w-4 h-4 text-primary" /> Team (Max {event.maxTeamSize})</div>}
        </div>

        <p className="text-gray-400 mb-6 text-sm leading-relaxed">{event.description}</p>

        {event.type === 'mega' ? (
          <div className="space-y-4 mt-6 border-t border-white/10 pt-6">
            <div className="flex justify-between items-center">
              <h5 className="font-bold text-gray-300 uppercase text-xs tracking-wider">Sub Events</h5>
              <button onClick={() => handleShare(event)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getSubEvents(event._id).map(sub => <EventCard key={sub._id} event={sub} isSub={true} />)}
              {getSubEvents(event._id).length === 0 && <p className="text-gray-500 text-sm italic">Coming soon...</p>}
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setSelectedEvent(event)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-lg font-medium hover:bg-white/10 hover:border-primary/50 transition-all flex items-center justify-center gap-2 group/btn">
              Register Now <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => handleShare(event)} className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6">
        <SectionWrapper className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Events</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore our upcoming hackathons, workshops, and tech talks.
          </p>
        </SectionWrapper>

        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading events...</div>
        ) : (
          <div className="space-y-12 max-w-5xl mx-auto">
            {rootEvents.map(event => (
              <SectionWrapper key={event._id}>
                <EventCard event={event} />
              </SectionWrapper>
            ))}
            {rootEvents.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-gray-400">No upcoming events scheduled.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8 max-w-md w-full relative">
              <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>

              <h3 className="text-2xl font-bold mb-2">Register for {selectedEvent.name}</h3>
              <p className="text-gray-400 text-sm mb-6">Fill in your details to secure your spot.</p>

              {regSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChevronRight className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="text-xl font-bold text-green-500 mb-2">Registered!</h4>
                  <p className="text-gray-400">See you at the event.</p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <input value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} placeholder="Full Name *" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none" />
                  <input value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} placeholder="Email *" type="email" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none" />
                  <div className="grid grid-cols-2 gap-4">
                    <input value={regForm.rollNo} onChange={e => setRegForm({ ...regForm, rollNo: e.target.value })} placeholder="Roll No *" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none" />
                    <input value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} placeholder="Phone *" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none" />
                  </div>
                  {selectedEvent.isTeamEvent && (
                    <input value={regForm.teamName} onChange={e => setRegForm({ ...regForm, teamName: e.target.value })} placeholder="Team Name" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none" />
                  )}

                  {regError && <p className="text-red-400 text-sm">{regError}</p>}

                  <button type="submit" disabled={regLoading} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                    {regLoading ? 'Registering...' : 'Confirm Registration'}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
