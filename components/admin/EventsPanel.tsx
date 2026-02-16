import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';
import { Plus, FileText, ChevronUp, ChevronDown, Eye, Trash2 } from 'lucide-react';

export function EventsPanel() {
    const [events, setEvents] = useState<any[]>([]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [showRegs, setShowRegs] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '', description: '', date: '', venue: '', type: 'standalone',
        parentId: '', isTeamEvent: false, maxTeamSize: 1, image: '',
        registrationsOpen: true, status: 'upcoming', isFeatured: false
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [expandedMegaId, setExpandedMegaId] = useState<string | null>(null);

    const load = async () => {
        try {
            const allEvents = await api.getAllEvents();
            setEvents(allEvents);
            setRegistrations(await api.getRegistrations());
        } catch { }
    };
    useEffect(() => { load(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('description', form.description);
            formData.append('date', form.date);
            formData.append('venue', form.venue);
            formData.append('type', form.type);
            formData.append('isTeamEvent', String(form.isTeamEvent));
            formData.append('maxTeamSize', String(form.maxTeamSize));
            formData.append('registrationsOpen', String(form.registrationsOpen));
            formData.append('status', form.status);
            formData.append('isFeatured', String(form.isFeatured));

            if (form.parentId) formData.append('parentId', form.parentId);

            if (form.type === 'sub' && !form.parentId) { alert('Select parent event'); return; }

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const token = localStorage.getItem('ignite_admin_token');
            const url = `${(import.meta as any).env?.VITE_API_URL || 'https://ignite-technical-innovation-club.onrender.com'}/api/events${editId ? `/${editId}` : ''}`;

            await fetch(url, {
                method: editId ? 'PUT' : 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            setShowForm(false);
            resetForm();
            load();
        } catch (err) { console.error(err); }
    };

    const resetForm = () => {
        setForm({ name: '', description: '', date: '', venue: '', type: 'standalone', parentId: '', isTeamEvent: false, maxTeamSize: 1, image: '', registrationsOpen: true, status: 'upcoming', isFeatured: false });
        setImageFile(null);
        setEditId(null);
    };

    const handleEdit = (e: any) => {
        setForm({
            name: e.name, description: e.description, date: e.date ? e.date.split('T')[0] : '',
            venue: e.venue, type: e.parentId ? 'sub' : e.type,
            parentId: e.parentId || '', isTeamEvent: e.isTeamEvent, maxTeamSize: e.maxTeamSize,
            image: e.image || '', registrationsOpen: e.registrationsOpen, status: e.status,
            isFeatured: e.isFeatured || false
        });
        setEditId(e._id);
        setShowForm(true);
    };

    const deleteEvent = async (id: string) => {
        if (!confirm('Delete event and ALL sub-events/registrations?')) return;
        try { await api.deleteEvent(id); load(); } catch { }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm";

    // Group events
    const rootEvents = events.filter(e => !e.parentId);
    const getSubEvents = (parentId: string) => events.filter(e => e.parentId === parentId);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">{events.length} Events ({rootEvents.length} Root)</h2>
                <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors">
                    <Plus className="w-4 h-4" /> Add Event
                </button>
            </div>

            {showForm && (
                <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} onSubmit={handleSubmit}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-6 space-y-3">

                    <div className="flex gap-4 mb-2 flex-wrap">
                        {/* Type Radios */}
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="eventType" checked={form.type === 'standalone'} onChange={() => setForm({ ...form, type: 'standalone', parentId: '' })} className="accent-primary" />
                            <span className="text-sm">Single</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="eventType" checked={form.type === 'mega'} onChange={() => setForm({ ...form, type: 'mega', parentId: '' })} className="accent-primary" />
                            <span className="text-sm">Mega</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="eventType" checked={form.type === 'sub'} onChange={() => setForm({ ...form, type: 'sub', parentId: rootEvents.find(e => e.type === 'mega')?._id || '' })} className="accent-primary" />
                            <span className="text-sm">Sub</span>
                        </label>
                    </div>

                    {form.type === 'sub' && (
                        <select value={form.parentId} onChange={e => (setForm as any)({ ...form, parentId: e.target.value })} className={`${inputClass} bg-gray-900 text-white`} required>
                            <option value="" className="bg-gray-900 text-white">Select Parent Mega Event</option>
                            {rootEvents.filter(e => e.type === 'mega').map(e => (
                                <option key={e._id} value={e._id} className="bg-gray-900 text-white">{e.name}</option>
                            ))}
                        </select>
                    )}

                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Event Name *" required className={inputClass} />
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className={inputClass} />

                    <div className="flex gap-2 items-center">
                        <input type="file" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
                        {form.image && !imageFile && <span className="text-xs text-green-400">Current: {form.image.split('/').pop()}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input type="date" value={form.date} onChange={e => {
                            const date = e.target.value;
                            const today = new Date().toISOString().split('T')[0];
                            let status = 'ended';
                            if (date > today) status = 'upcoming';
                            else if (date === today) status = 'live';
                            setForm({ ...form, date, status });
                        }} className={inputClass} />
                        <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Venue" className={inputClass} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center gap-2 px-4 bg-white/5 rounded-xl text-sm text-gray-400 cursor-pointer">
                            <input type="checkbox" checked={form.registrationsOpen} onChange={e => setForm({ ...form, registrationsOpen: e.target.checked })} className="accent-primary" />
                            <span>Regs Open</span>
                        </label>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                            <input type="checkbox" checked={form.isTeamEvent} onChange={e => setForm({ ...form, isTeamEvent: e.target.checked })} className="accent-primary" /> Team Event
                        </label>
                        {form.isTeamEvent && (
                            <input type="number" value={form.maxTeamSize} onChange={e => setForm({ ...form, maxTeamSize: parseInt(e.target.value) })} min={2} max={10}
                                className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white" placeholder="Max size" />
                        )}

                        {form.type === 'mega' && (
                            <label className="flex items-center gap-2 text-sm text-yellow-400">
                                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} className="accent-yellow-400" />
                                Featured in Navbar
                            </label>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-primary text-white text-sm rounded-lg">{editId ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-4 py-2 border border-white/10 text-sm rounded-lg text-gray-400">Cancel</button>
                    </div>
                </motion.form>
            )}

            <div className="space-y-3">
                {rootEvents.map(event => {
                    const eventRegs = registrations.filter(r => r.eventId?._id === event._id || r.eventId === event._id);
                    const subEvents = getSubEvents(event._id);

                    return (
                        <div key={event._id} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                            {/* Main Event Card */}
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            {event.type === 'mega' && <span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Mega</span>}
                                            {event.isFeatured && <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Featured</span>}
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${event.status === 'live' ? 'bg-green-500/20 text-green-400' : event.status === 'ended' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{event.status}</span>
                                            {!event.registrationsOpen && <span className="text-[10px] px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full font-bold">Closed</span>}
                                            <h3 className="font-bold">{event.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                                        <div className="flex gap-3 mt-2 text-xs text-gray-400">
                                            {event.date && <span>{new Date(event.date).toLocaleDateString()}</span>}
                                            {event.venue && <span>{event.venue}</span>}
                                            {event.isTeamEvent && <span>Team (max {event.maxTeamSize})</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEdit(event)} className="p-1.5 text-gray-400 hover:text-white"><FileText className="w-4 h-4" /></button>
                                        {event.type === 'mega' && (
                                            <button onClick={() => setExpandedMegaId(expandedMegaId === event._id ? null : event._id)}
                                                className="text-xs px-2 py-1 bg-white/5 rounded-lg text-gray-400">
                                                {expandedMegaId === event._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        )}
                                        <button onClick={() => setShowRegs(showRegs === event._id ? null : event._id)}
                                            className="text-xs px-3 py-1.5 border border-white/10 rounded-lg text-gray-400 hover:text-white flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> {eventRegs.length}
                                        </button>
                                        <button onClick={() => deleteEvent(event._id)} className="text-red-400 hover:text-red-300 p-1.5"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                {showRegs === event._id && eventRegs.length > 0 && (
                                    <div className="mt-4 border-t border-white/5 pt-4">
                                        <table className="w-full text-sm">
                                            <thead><tr className="text-gray-500 text-left text-xs">
                                                <th className="pb-2">Name</th><th className="pb-2">Roll No</th><th className="pb-2">Team</th>
                                            </tr></thead>
                                            <tbody>
                                                {eventRegs.map((r: any) => (
                                                    <tr key={r._id} className="border-t border-white/5 text-gray-300">
                                                        <td className="py-2">{r.name}</td><td className="py-2">{r.rollNo}</td>
                                                        <td className="py-2">{r.teamName || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Sub Events */}
                            {event.type === 'mega' && expandedMegaId === event._id && (
                                <div className="bg-gray-900/20 border-t border-white/5 p-4 space-y-2 pl-8">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Sub Events</h4>
                                    {subEvents.map(sub => {
                                        const subRegs = registrations.filter(r => r.eventId?._id === sub._id || r.eventId === sub._id);
                                        return (
                                            <div key={sub._id} className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-sm">{sub.name}</p>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase ${sub.status === 'live' ? 'bg-green-500/20 text-green-400' : 'text-gray-500'}`}>{sub.status}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">{new Date(sub.date).toLocaleDateString()} • {sub.venue}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(sub)} className="p-1 text-gray-400 hover:text-white"><FileText className="w-3 h-3" /></button>
                                                    <button onClick={() => setShowRegs(showRegs === sub._id ? null : sub._id)}
                                                        className="text-xs px-2 py-1 bg-white/5 rounded text-gray-400">
                                                        {subRegs.length} Regs
                                                    </button>
                                                    <button onClick={() => deleteEvent(sub._id)} className="text-red-400 p-1"><Trash2 className="w-3 h-3" /></button>
                                                </div>
                                                {showRegs === sub._id && subRegs.length > 0 && (
                                                    <div className="hidden"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {subEvents.length === 0 && <p className="text-xs text-gray-500 italic">No sub-events added yet.</p>}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
