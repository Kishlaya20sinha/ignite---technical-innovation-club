import React, { useState, useEffect } from 'react';
import { api, API_URL } from '../../lib/api';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Image as ImageIcon, Upload, Link, ExternalLink, X } from 'lucide-react';

export function GalleryPanel() {
    const [items, setItems] = useState<any[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: '',
        category: 'General',
        coverUrl: '',
        link: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [preview, setPreview] = useState<string>('');
    // 'upload' | 'url' — which cover method is chosen
    const [coverMode, setCoverMode] = useState<'upload' | 'url'>('upload');

    const load = async () => {
        try { setItems(await api.getGallery()); } catch { }
    };
    useEffect(() => { load(); }, []);

    // Resolve image paths
    const resolveUrl = (path: string | undefined) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        if (path.startsWith('blob:')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${API_URL}${cleanPath}`;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setGalleryFiles(Array.from(e.target.files));
        }
    };

    const handleCoverUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setForm(f => ({ ...f, coverUrl: val }));
        setPreview(val);
    };

    const resetForm = () => {
        setForm({ title: '', category: 'General', coverUrl: '', link: '' });
        setImageFile(null);
        setGalleryFiles([]);
        setPreview('');
        setCoverMode('upload');
        setEditingId(null);
    };

    const handleEdit = (item: any) => {
        setEditingId(item._id);
        setForm({
            title: item.title,
            category: item.category,
            coverUrl: item.coverUrl || '',
            link: item.link || '',
        });
        setCoverMode(item.image ? 'upload' : 'url');
        setPreview(resolveUrl(item.image || item.coverUrl));
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingId && coverMode === 'upload' && !imageFile) return alert('Please select a cover image.');
        if (coverMode === 'url' && !form.coverUrl) return alert('Please enter a cover image URL.');

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('category', form.category);
            formData.append('order', '0');
            if (form.link) formData.append('link', form.link);

            if (coverMode === 'upload' && imageFile) {
                formData.append('image', imageFile);
            } else if (coverMode === 'url') {
                formData.append('coverUrl', form.coverUrl);
            }

            // Append multiple gallery images
            galleryFiles.forEach(file => {
                formData.append('images', file);
            });

            if (editingId) {
                await api.updateGalleryItem(editingId, formData);
            } else {
                await api.addGalleryItem(formData);
            }

            setShowForm(false);
            resetForm();
            load();
        } catch (err: any) { alert(err.message); }
        setLoading(false);
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Delete image?')) return;
        try { await api.deleteGalleryItem(id); load(); } catch { }
    };

    const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 transition-all text-sm";

    const coverSrc = (item: any) => resolveUrl(item.image || item.coverUrl);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Gallery Items ({items.length})</h2>
                <button onClick={() => { if (showForm) resetForm(); setShowForm(!showForm); }} className="flex items-center gap-1 px-4 py-2 bg-primary text-white text-sm rounded-lg">
                    {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {showForm ? 'Close' : 'Add Item'}
                </button>
            </div>

            {showForm && (
                <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit}
                    className="p-5 bg-white/[0.02] border border-white/5 rounded-xl mb-6 space-y-4">

                    <h3 className="text-sm font-bold text-primary mb-2">{editingId ? 'Edit Gallery Item' : 'Add New Item'}</h3>

                    {/* Basic fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Event / Album Title *" required className={inputClass} />
                        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                            className={inputClass + ' bg-[#0f0f0f]'}>
                            <option value="General" className="bg-[#0f0f0f]">General</option>
                            <option value="Inauguration" className="bg-[#0f0f0f]">Inauguration</option>
                            <option value="Hackathon" className="bg-[#0f0f0f]">Hackathon</option>
                            <option value="Workshop" className="bg-[#0f0f0f]">Workshop</option>
                            <option value="Gaming" className="bg-[#0f0f0f]">Gaming</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Cover Image */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs text-gray-400 font-medium">Cover Image *</span>
                                <div className="flex rounded-lg overflow-hidden border border-white/10">
                                    <button type="button" onClick={() => { setCoverMode('upload'); setPreview(''); setForm(f => ({ ...f, coverUrl: '' })); }}
                                        className={`px-3 py-1 text-xs flex items-center gap-1 transition-all ${coverMode === 'upload' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
                                        <Upload className="w-3 h-3" /> Upload
                                    </button>
                                    <button type="button" onClick={() => { setCoverMode('url'); setImageFile(null); setPreview(''); }}
                                        className={`px-3 py-1 text-xs flex items-center gap-1 transition-all ${coverMode === 'url' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}>
                                        <Link className="w-3 h-3" /> Paste URL
                                    </button>
                                </div>
                            </div>

                            {coverMode === 'upload' ? (
                                <div className="relative border border-white/10 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden bg-white/5">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover opacity-50" />
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                                            <p className="text-xs text-gray-500">Click to upload cover</p>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            ) : (
                                <input type="url" value={form.coverUrl} onChange={handleCoverUrlChange} placeholder="Cover Image URL (https://...)" className={inputClass} />
                            )}
                        </div>

                        {/* Gallery Multi-Upload */}
                        <div className="space-y-3">
                            <span className="text-xs text-gray-400 font-medium">Gallery Photos (Internal Album)</span>
                            <div className="relative border border-white/10 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-white/5">
                                {galleryFiles.length > 0 ? (
                                    <div className="text-center">
                                        <ImageIcon className="w-6 h-6 text-primary mx-auto mb-1" />
                                        <p className="text-sm text-primary font-bold">{galleryFiles.length} Photos Selected</p>
                                        <p className="text-[10px] text-gray-500">Click to change selection</p>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Plus className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                                        <p className="text-xs text-gray-500">{editingId ? 'Add more photos to album' : 'Add multiple gallery photos'}</p>
                                    </div>
                                )}
                                <input type="file" multiple accept="image/*" onChange={handleGalleryFilesChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>
                    </div>

                    {/* Google Photos Album Link (Alternate) */}
                    <div>
                        <label className="text-xs text-gray-400 flex items-center gap-1 mb-1">
                            <ExternalLink className="w-3 h-3" /> External Album Link (e.g. Google Photos)
                        </label>
                        <input
                            type="url"
                            value={form.link}
                            onChange={e => setForm({ ...form, link: e.target.value })}
                            placeholder="https://photos.google.com/album/..."
                            className={inputClass}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" disabled={loading} className="px-6 py-3 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 flex-1">
                            {loading ? 'Saving...' : (editingId ? 'Update Item' : 'Save Item')}
                        </button>
                        <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="px-6 py-3 border border-white/10 text-sm rounded-lg text-gray-400">Cancel</button>
                    </div>
                </motion.form>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(item => (
                    <div key={item._id} className="group relative bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden aspect-square">
                        {coverSrc(item) ? (
                            <img src={coverSrc(item)} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white/5">
                                <ImageIcon className="w-8 h-8 text-gray-700" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                            <p className="text-xs font-bold leading-tight line-clamp-2">{item.title}</p>
                            <div className="flex items-center justify-between mt-1">
                                <p className="text-[10px] text-primary">{item.category}</p>
                                {item.link && (
                                    <span className="text-[10px] text-[#25D366] flex items-center gap-0.5">
                                        <ExternalLink className="w-2.5 h-2.5" /> Album
                                    </span>
                                )}
                            </div>

                            <div className="absolute top-2 right-2 flex gap-1">
                                <button onClick={() => handleEdit(item)} className="p-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary transition-colors">
                                    <Edit2 className="w-3 h-3" />
                                </button>
                                <button onClick={() => deleteItem(item._id)} className="p-1.5 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 transition-colors">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500 border border-white/5 border-dashed rounded-xl">
                        <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm italic">Gallery is empty. Add some photos!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
