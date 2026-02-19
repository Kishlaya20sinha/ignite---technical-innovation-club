import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { motion } from 'framer-motion';
import { Plus, Trash2, Image as ImageIcon, Upload } from 'lucide-react';

export function GalleryPanel() {
    const [items, setItems] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ title: '', category: 'General', order: 0 });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');

    const load = async () => {
        try { setItems(await api.getGallery()); } catch { }
    };
    useEffect(() => { load(); }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) return alert("Please select an image");

        setLoading(true);
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('category', form.category);
        formData.append('order', form.order.toString());
        formData.append('image', imageFile);

        try {
            await api.addGalleryItem(formData);
            setShowForm(false);
            setForm({ title: '', category: 'General', order: 0 });
            setImageFile(null);
            setPreview('');
            load();
        } catch (err: any) { alert(err.message); }
        setLoading(false);
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Delete image?')) return;
        try { await api.deleteGalleryItem(id); load(); } catch { }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Gallery Items ({items.length})</h2>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-sm rounded-lg">
                    <Plus className="w-4 h-4" /> Add Image
                </button>
            </div>

            {showForm && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit}
                    className="p-4 bg-white/[0.02] border border-white/5 rounded-xl mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Image Title *" required className={inputClass} />
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass}>
                                <option value="General">General</option>
                                <option value="Inauguration">Inauguration</option>
                                <option value="Hackathon">Hackathon</option>
                                <option value="Workshop">Workshop</option>
                                <option value="Cultural">Cultural</option>
                            </select>
                            <input type="number" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) })} placeholder="Display Order" className={inputClass} />
                        </div>

                        <div className="relative group cursor-pointer border-2 border-dashed border-white/10 rounded-xl overflow-hidden aspect-video flex flex-col items-center justify-center hover:border-primary/50 transition-colors">
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-4">
                                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500">Click to upload image</p>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                            {loading ? 'Uploading...' : 'Save Image'}
                        </button>
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 border border-white/10 text-sm rounded-lg text-gray-400">Cancel</button>
                    </div>
                </motion.form>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(item => (
                    <div key={item._id} className="group relative bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden aspect-square">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                            <p className="text-xs font-bold leading-tight">{item.title}</p>
                            <p className="text-[10px] text-primary mt-0.5">{item.category}</p>
                            <button onClick={() => deleteItem(item._id)} className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 transition-colors">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500 border border-white/5 border-dashed rounded-xl">
                        <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm italic">Gallery is empty. Upload some photos!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
