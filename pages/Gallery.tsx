import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Image as ImageIcon, Download } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { api, API_URL } from '../lib/api';

const CATEGORIES = ['All', 'Inauguration', 'Hackathon', 'Workshop', 'Gaming', 'General'];

const Gallery: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGallery().then(data => {
      setItems(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filteredItems = filter === 'All'
    ? items
    : items.filter(item => item.category === filter);

  // Helper to resolve full image URL
  const resolveUrl = (path: string | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${cleanPath}`;
  };

  // Resolve the cover image — uploaded file takes priority, then coverUrl
  const getCover = (item: any) => resolveUrl(item.image || item.coverUrl);

  const handleCardClick = (item: any) => {
    if (item.link) {
      window.open(item.link, '_blank', 'noopener,noreferrer');
    } else {
      setSelectedImage(item);
    }
  };

  const getInternalImages = (item: any) => {
    const list: string[] = [];
    if (item.image) list.push(resolveUrl(item.image));
    if (item.images && Array.isArray(item.images)) {
      item.images.forEach((img: string) => {
        if (img) list.push(resolveUrl(img));
      });
    }
    return [...new Set(list)]; // Unique images
  };

  const downloadImage = async (url: string, title: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title.replace(/\s+/g, '_')}_${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen container mx-auto px-6 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen text-white">
      <div className="container mx-auto px-6">
        <SectionWrapper className="mb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Gallery</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Capturing the spirit of innovation and community at IGNITE.
          </p>
        </SectionWrapper>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${filter === cat
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                onClick={() => handleCardClick(item)}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-white/5 border border-white/5 shadow-2xl"
              >
                {getCover(item) ? (
                  <img
                    src={getCover(item)}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <ImageIcon className="w-10 h-10 text-gray-700" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-left">
                  <p className="text-[10px] text-primary font-bold mb-1 uppercase tracking-widest">{item.category}</p>
                  <h3 className="text-lg font-bold leading-tight line-clamp-2">{item.title}</h3>
                  {(item.link || (item.images && item.images.length > 0)) && (
                    <div className="flex items-center gap-1 mt-2">
                      <ImageIcon className={`w-3 h-3 ${item.link ? 'text-green-400' : 'text-primary'}`} />
                      <span className={`text-xs font-medium ${item.link ? 'text-green-400' : 'text-primary'}`}>
                        {item.link ? 'External Album' : `${(item.images?.length || 0) + (item.image ? 1 : 0)} Photos`}
                      </span>
                    </div>
                  )}
                </div>

                {item.link && (
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <ExternalLink className="w-2.5 h-2.5 text-green-400" />
                    <span className="text-[10px] text-green-400 font-medium">Google Photos</span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
            <p className="text-gray-500 italic text-lg text-center">No photos found in this category.</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/98 backdrop-blur-xl p-4 md:p-10 overflow-y-auto"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-7xl mx-auto w-full min-h-full flex flex-col">
              <div className="flex justify-between items-center mb-10 py-4 border-b border-white/10 sticky top-0 bg-black/40 backdrop-blur-md z-10 px-4 rounded-b-2xl">
                <div className="text-left">
                  <span className="text-primary font-bold text-xs uppercase tracking-widest mb-1 block">{selectedImage.category}</span>
                  <h3 className="text-2xl md:text-3xl font-display font-bold">{selectedImage.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-3 bg-white/5 hover:bg-red-500/20 text-white hover:text-red-500 rounded-full border border-white/10 transition-all hover:scale-110"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {getInternalImages(selectedImage).map((img, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 border border-white/5 group relative shadow-xl"
                  >
                    <img
                      src={img}
                      alt={`${selectedImage.title} - ${idx}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as any).src = 'https://placehold.co/600x400?text=Image+Not+Found';
                      }}
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(img, selectedImage.title, idx);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-bold rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95"
                      >
                        <Download size={18} />
                        Download Photo
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
