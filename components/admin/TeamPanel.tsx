import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';
import { Pen, Trash2, Github, Linkedin, Plus } from 'lucide-react';

export function TeamPanel() {
    const [members, setMembers] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', role: '', image: '', order: 0, isActive: true, socials: { linkedin: '', github: '' } });

    const load = async () => {
        try { setMembers(await api.getAllTeam()); } catch { }
    };
    useEffect(() => { load(); }, []);

    const saveMember = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.updateTeamMember(editId, form);
            } else {
                await api.addTeamMember(form);
            }
            setShowForm(false);
            setEditId(null);
            setForm({ name: '', role: '', image: '', order: 0, isActive: true, socials: { linkedin: '', github: '' } });
            load();
        } catch { }
    };

    const editMember = (m: any) => {
        setForm({ name: m.name, role: m.role, image: m.image || '', order: m.order || 0, isActive: m.isActive, socials: m.socials || { linkedin: '', github: '' } });
        setEditId(m._id);
        setShowForm(true);
    };

    const deleteMember = async (id: string) => {
        if (!confirm('Delete member?')) return;
        try { await api.deleteTeamMember(id); load(); } catch { }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Team Members ({members.length})</h2>
                <button onClick={() => { setShowForm(!showForm); setEditId(null); }} className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-sm rounded-lg">
                    <Plus className="w-4 h-4" /> Add Member
                </button>
            </div>

            {showForm && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={saveMember}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-6 space-y-3">
                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name *" required className={inputClass} />
                    <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Role *" required className={inputClass} />
                    <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="Image URL" className={inputClass} />
                    <div className="flex gap-2">
                        <input value={form.socials.linkedin} onChange={e => setForm({ ...form, socials: { ...form.socials, linkedin: e.target.value } })} placeholder="LinkedIn URL" className={inputClass} />
                        <input value={form.socials.github} onChange={e => setForm({ ...form, socials: { ...form.socials, github: e.target.value } })} placeholder="GitHub URL" className={inputClass} />
                    </div>
                    <div className="flex gap-2 items-center">
                        <input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) })} placeholder="Order" className={`${inputClass} w-24`} />
                        <label className="flex items-center gap-2 text-sm text-gray-400">
                            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-primary" /> Active
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 bg-primary text-white text-sm rounded-lg">{editId ? 'Update' : 'Add'}</button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-white/10 text-sm rounded-lg text-gray-400">Cancel</button>
                    </div>
                </motion.form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.sort((a, b) => a.order - b.order).map(m => (
                    <div key={m._id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <img src={m.image || 'https://via.placeholder.com/100'} alt={m.name} className="w-12 h-12 rounded-full object-cover bg-white/10" />
                        <div className="flex-1">
                            <h3 className="font-bold">{m.name}</h3>
                            <p className="text-xs text-primary">{m.role}</p>
                            <div className="flex gap-2 mt-1">
                                {m.socials?.linkedin && <a href={m.socials.linkedin} target="_blank" className="text-gray-400 hover:text-blue-400"><Linkedin className="w-3 h-3" /></a>}
                                {m.socials?.github && <a href={m.socials.github} target="_blank" className="text-gray-400 hover:text-white"><Github className="w-3 h-3" /></a>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => editMember(m)} className="text-gray-400 hover:text-white"><Pen className="w-4 h-4" /></button>
                            <button onClick={() => deleteMember(m._id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
