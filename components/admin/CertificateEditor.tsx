import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Plus, Eye, X } from 'lucide-react';
import { api } from '../../lib/api';

interface CertEditorProps {
    show: boolean;
    eventId: string;
    eventName: string;
    initialCoords: any;
    onClose: () => void;
    onUploadSuccess: () => void;
    participantCount: number;
}

export function CertificateEditor({ show, eventId, eventName, initialCoords, onClose, onUploadSuccess, participantCount }: CertEditorProps) {
    const [coords, setCoords] = useState(initialCoords || { x: 420, y: 300, size: 40, font: 'Helvetica-Bold', color: '#000000' });
    const [preview, setPreview] = useState<string | null>(null);
    const [templateUrl, setTemplateUrl] = useState<string | null>(null);
    const [showBg, setShowBg] = useState(true);
    const canvasRef = useRef<HTMLDivElement>(null);

    // Initial load of latest coords from server if any
    useEffect(() => {
        if (show) {
            setCoords(initialCoords || { x: 420, y: 300, size: 40, font: 'Helvetica-Bold', color: '#000000' });

            // Try to find the latest template URL
            const fetchEvent = async () => {
                try {
                    const all = await api.getAllEvents();
                    const current = all.find((e: any) => e._id === eventId);
                    if (current?.certificateTemplate) {
                        const baseUrl = (api as any).API_URL || 'http://localhost:5000';
                        setTemplateUrl(`${baseUrl}${current.certificateTemplate}`);
                    }
                } catch { }
            };
            fetchEvent();
        }
    }, [show, eventId, initialCoords]);

    if (!show) return null;

    const saveCoords = async (silent = false) => {
        try {
            const fd = new FormData();
            fd.append('coords', JSON.stringify({ name: coords }));
            await api.uploadCertificateTemplate(eventId, fd);
            if (!silent) alert('Design saved!');
        } catch (e: any) {
            if (!silent) alert(e.message);
        }
    };

    const handleRefreshPreview = async () => {
        try {
            // Save first
            const fd = new FormData();
            fd.append('coords', JSON.stringify({ name: coords }));
            await api.uploadCertificateTemplate(eventId, fd);

            const res = await api.previewCertificate(eventId);
            setPreview(res.pdf);
        } catch (e: any) { alert(e.message); }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 flex flex-col md:flex-row backdrop-blur-xl overflow-hidden"
            >
                {/* Left Sidebar - Controls */}
                <div className="w-full md:w-80 h-full bg-[#121212] border-r border-white/5 flex flex-col z-20 shadow-2xl overflow-y-auto">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-3 mb-1">
                            <Award className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-bold truncate">{eventName}</h3>
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-tighter">Visual E-Cert Editor</p>
                    </div>

                    <div className="p-6 space-y-8 flex-1">
                        {/* Step 1: Template */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">1. BACKGROUND TEMPLATE</label>
                            <div className="relative group">
                                <input type="file" accept=".pdf" onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const fd = new FormData();
                                        fd.append('template', file);
                                        fd.append('coords', JSON.stringify({ name: coords }));
                                        try {
                                            const res = await api.uploadCertificateTemplate(eventId, fd);
                                            alert('Template uploaded!');
                                            if (res.certificateTemplate) {
                                                const baseUrl = (api as any).API_URL || 'http://localhost:5000';
                                                setTemplateUrl(`${baseUrl}${res.certificateTemplate}?t=${Date.now()}`);
                                            }
                                            onUploadSuccess();
                                        } catch (err: any) { alert(err.message); }
                                    }
                                }} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                <div className="w-full py-4 px-4 border-2 border-dashed border-white/10 rounded-xl group-hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-center pointer-events-none">
                                    <Plus className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                                    <span className="text-xs text-gray-500 group-hover:text-primary">Click to upload PDF</span>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Font Selection */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">2. TEXT STYLING</label>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] text-gray-600 mb-1 font-bold">FONT FAMILY</p>
                                    <select
                                        value={coords.font}
                                        onChange={e => setCoords({ ...coords, font: e.target.value })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-[11px] text-white focus:border-primary/50 outline-none appearance-none cursor-pointer hover:bg-black/60 transition-colors"
                                        style={{ colorScheme: 'dark' }}
                                    >
                                        <option value="Helvetica-Bold" className="bg-[#1a1a1a]">Helvetica Bold</option>
                                        <option value="Helvetica" className="bg-[#1a1a1a]">Helvetica</option>
                                        <option value="Times-Bold" className="bg-[#1a1a1a]">Times Bold</option>
                                        <option value="Times-Roman" className="bg-[#1a1a1a]">Times Roman</option>
                                        <option value="Courier-Bold" className="bg-[#1a1a1a]">Courier Bold</option>
                                        <option value="Courier" className="bg-[#1a1a1a]">Courier</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-600 mb-1 font-bold">COLOR</p>
                                        <div className="flex border border-white/10 rounded-lg overflow-hidden h-10 bg-black/40 hover:border-primary/30 transition-colors">
                                            <div className="w-10 h-full relative border-r border-white/10">
                                                <input
                                                    type="color"
                                                    value={coords.color || '#000000'}
                                                    onChange={e => setCoords({ ...coords, color: e.target.value })}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div
                                                    className="absolute inset-2 rounded-sm border border-white/20"
                                                    style={{ backgroundColor: coords.color || '#000000' }}
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={coords.color || '#000000'}
                                                onChange={e => setCoords({ ...coords, color: e.target.value })}
                                                className="w-full bg-transparent border-0 text-[10px] text-center uppercase text-gray-400 focus:outline-none placeholder:text-gray-700 font-mono"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-600 mb-1 font-bold">SIZE: {coords.size}px</p>
                                        <input
                                            type="range" min="10" max="150" step="1"
                                            value={coords.size}
                                            onChange={e => setCoords({ ...coords, size: Number(e.target.value) })}
                                            className="w-full accent-primary h-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Registration Status */}
                        <div className="pt-4 space-y-4">
                            <button
                                onClick={async () => {
                                    if (!confirm(`Email certificates to all ${participantCount} participants?`)) return;
                                    try {
                                        const res = await api.generateCertificates(eventId);
                                        alert(res.message);
                                    } catch (e: any) { alert(e.message); }
                                }}
                                className="w-full py-4 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-bold shadow-xl shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                            >
                                Send to All ({participantCount})
                            </button>
                            <p className="text-[9px] text-center text-gray-600 uppercase tracking-widest leading-relaxed">Personalized certificates will be emailed <br /> with PDF attachments.</p>
                        </div>
                    </div>

                    <div className="p-6 bg-black/40 border-t border-white/5">
                        <button onClick={onClose} className="w-full py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-xs font-bold text-gray-400 flex items-center justify-center gap-2">
                            <X className="w-4 h-4" /> Close Editor
                        </button>
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="flex-1 h-full bg-[#0a0a0a] relative overflow-hidden flex flex-col">
                    {/* Workspace Toolbar */}
                    <div className="h-14 bg-black/40 backdrop-blur-lg border-b border-white/5 flex items-center justify-between px-6 z-10">
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Positioner Workspace</span>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex gap-4">
                                <span className="text-[10px] text-primary/80 font-mono">X: {coords.x}pt</span>
                                <span className="text-[10px] text-primary/80 font-mono">Y: {coords.y}pt</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={saveCoords}
                                className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-[10px] font-bold text-white uppercase"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={handleRefreshPreview}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all text-[10px] font-bold flex items-center gap-2 shadow-lg shadow-primary/20 uppercase"
                            >
                                <Eye className="w-3 h-3" /> {preview ? 'Update Preview' : 'Show Preview'}
                            </button>
                            <button
                                onClick={() => setShowBg(!showBg)}
                                className={`px-4 py-2 border ${showBg ? 'border-primary/50 text-primary' : 'border-white/10 text-gray-500'} rounded-lg transition-colors text-[10px] font-bold uppercase`}
                            >
                                {showBg ? 'Hide BG' : 'Show BG'}
                            </button>
                        </div>
                    </div>

                    {/* Workspace Middle - Scrollable if needed */}
                    <div className="flex-1 overflow-auto bg-grid-white/[0.02] flex items-center justify-center p-12 min-h-0">
                        <div className="relative">
                            <label className="absolute -top-6 left-0 text-[10px] text-gray-700 uppercase font-black tracking-widest">A4 LANDSCAPE (841.89pt x 595.28pt)</label>

                            <div
                                id="cert-canvas-container"
                                ref={canvasRef}
                                className="relative bg-white shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden scale-[0.9] lg:scale-100 transition-transform"
                                style={{ width: '842px', height: '595px', minWidth: '842px' }}
                            >
                                {/* PDF Background Template */}
                                {templateUrl && showBg && (
                                    <iframe
                                        src={`${templateUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                                        className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                                        title="Template Background"
                                    />
                                )}

                                {/* Subtle guide lines */}
                                <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 opacity-[0.03] pointer-events-none z-10">
                                    {[...Array(144)].map((_, i) => <div key={i} className="border border-black" />)}
                                </div>
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-primary/20 pointer-events-none z-10" />
                                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 border-l border-primary/20 pointer-events-none z-10" />

                                <motion.div
                                    drag
                                    dragMomentum={false}
                                    dragElastic={0}
                                    dragConstraints={canvasRef}
                                    onDrag={(_, info) => {
                                        const container = canvasRef.current;
                                        if (!container) return;
                                        const rect = container.getBoundingClientRect();
                                        const x = Math.round(info.point.x - rect.left);
                                        const y = Math.round(595.28 - (info.point.y - rect.top));

                                        setCoords((prev: any) => ({ ...prev, x, y }));
                                    }}
                                    className="absolute cursor-move select-none whitespace-nowrap p-4 border-2 border-dashed border-primary/0 hover:border-primary/50 hover:bg-primary/5 rounded-xl active:scale-95 transition-none"
                                    style={{
                                        left: `${coords.x}px`,
                                        top: `${595.28 - coords.y}px`,
                                        fontSize: `${coords.size}px`,
                                        color: coords.color || '#000000',
                                        fontFamily: coords.font?.includes('Times') ? 'serif' : coords.font?.includes('Courier') ? 'monospace' : 'sans-serif',
                                        fontWeight: coords.font?.includes('Bold') ? 'bold' : 'normal',
                                        transform: 'translate(-50%, -50%)',
                                        zIndex: 50
                                    }}
                                >
                                    <div className="relative group">
                                        STUDENT NAME
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-[8px] text-white font-black rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase whitespace-nowrap">Drag to position</div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Preview Container - Part of flow now */}
                    <AnimatePresence>
                        {preview && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: '40%', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="w-full bg-[#121212] border-t border-white/10 z-30 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col shrink-0"
                            >
                                <div className="flex-1 flex min-h-0 bg-[#080808]">
                                    <div className="w-64 p-6 border-r border-white/5 flex flex-col justify-center shrink-0 bg-[#0c0c0c]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Live PDF Engine</h4>
                                        </div>
                                        <p className="text-[9px] text-gray-500 mb-4 leading-relaxed">This is a pixel-perfect render of the final PDF. Ensure the name is exactly where you want it.</p>
                                        <button onClick={() => setPreview(null)} className="py-2 px-3 border border-white/10 text-gray-400 text-[9px] font-bold rounded hover:bg-white/5 transition-all uppercase">Close Preview</button>
                                    </div>
                                    <iframe src={`${preview}#toolbar=0&navpanes=0&scrollbar=0`} className="flex-1 w-full h-full border-0" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
