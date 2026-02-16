import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { api } from '../lib/api';

interface EventType {
    _id: string;
    name: string;
    description: string;
    date: string;
    venue: string;
    isTeamEvent: boolean;
    maxTeamSize: number;
}

const Inginiux: React.FC = () => {
    const [events, setEvents] = useState<EventType[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', rollNo: '', branch: '', teamName: '' });

    useEffect(() => {
        api.getEvents().then(setEvents).catch(() => { });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;
        setLoading(true);
        setError('');
        try {
            await api.registerForEvent({ ...form, eventId: selectedEvent._id });
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message);
        }
        setLoading(false);
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all";

    if (submitted) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md mx-auto p-8">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h2 className="text-3xl font-display font-bold mb-4">Registered!</h2>
                    <p className="text-gray-400">You've been registered for <span className="text-primary font-semibold">{selectedEvent?.name}</span>. See you there!</p>
                    <button onClick={() => { setSubmitted(false); setSelectedEvent(null); setForm({ name: '', email: '', phone: '', rollNo: '', branch: '', teamName: '' }); }} className="mt-6 px-6 py-2 border border-white/20 rounded-full text-sm hover:bg-white/5 transition-colors">
                        Register for another event
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-6">
                {/* Header */}
                <SectionWrapper>
                    <div className="text-center mb-16">
                        <span className="px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm font-medium text-primary uppercase tracking-[0.2em] inline-block mb-6">
                            <Sparkles className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" /> Flagship Event
                        </span>
                        <h1 className="text-5xl md:text-7xl font-display font-bold mb-4">
                            INGINIUX <span className="text-primary">2.0</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-xl mx-auto">
                            The biggest tech fest by IGNITE. Compete, innovate, and showcase your skills.
                        </p>
                    </div>
                </SectionWrapper>

                {!selectedEvent ? (
                    /* Event Cards */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {events.length === 0 && (
                            <div className="col-span-2 text-center py-20 text-gray-500">
                                <p className="text-lg">Events will be announced soon!</p>
                                <p className="text-sm mt-2">Check back later for registration.</p>
                            </div>
                        )}
                        {events.map((event, i) => (
                            <SectionWrapper key={event._id} delay={i * 0.1}>
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    onClick={() => setSelectedEvent(event)}
                                    className="group cursor-pointer p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.08)] transition-all duration-300"
                                >
                                    <h3 className="text-xl font-bold font-display mb-2 group-hover:text-primary transition-colors">{event.name}</h3>
                                    <p className="text-gray-500 text-sm mb-4">{event.description}</p>
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                                        {event.date && (
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()}</span>
                                        )}
                                        {event.venue && (
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue}</span>
                                        )}
                                        {event.isTeamEvent && (
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Team (max {event.maxTeamSize})</span>
                                        )}
                                    </div>
                                </motion.div>
                            </SectionWrapper>
                        ))}
                    </div>
                ) : (
                    /* Registration Form */
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
                        <button onClick={() => setSelectedEvent(null)} className="text-sm text-gray-400 hover:text-white mb-6 flex items-center gap-1">← Back to events</button>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <h3 className="text-xl font-bold mb-1">{selectedEvent.name}</h3>
                            <p className="text-gray-500 text-sm mb-6">Fill in your details to register</p>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name *" required className={inputClass} />
                                <input name="email" value={form.email} onChange={handleChange} placeholder="Email *" type="email" required className={inputClass} />
                                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone *" required className={inputClass} />
                                <input name="rollNo" value={form.rollNo} onChange={handleChange} placeholder="Roll Number *" required className={inputClass} />
                                <select name="branch" value={form.branch} onChange={handleChange} className={inputClass}>
                                    <option value="">Select Branch</option>
                                    <option>Computer Science</option>
                                    <option>Information Technology</option>
                                    <option>Electronics</option>
                                    <option>Electrical</option>
                                    <option>Mechanical</option>
                                    <option>Civil</option>
                                    <option>Other</option>
                                </select>
                                {selectedEvent.isTeamEvent && (
                                    <input name="teamName" value={form.teamName} onChange={handleChange} placeholder="Team Name" className={inputClass} />
                                )}
                                {error && (
                                    <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-xl text-sm">
                                        <AlertCircle className="w-4 h-4" /> {error}
                                    </div>
                                )}
                                <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50">
                                    {loading ? 'Registering...' : 'Register Now'}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Inginiux;
