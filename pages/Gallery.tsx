import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { api } from '../lib/api';

const CATEGORIES = ['All', 'Inauguration', 'Hackathon', 'Workshop', 'Cultural', 'General'];

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

        {/* Filters */}
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
                onClick={() => setSelectedImage(item)}
                className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-white/5 border border-white/5 shadow-2xl"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end text-left">
                  <p className="text-[10px] text-primary font-bold mb-1 uppercase tracking-widest">{item.category}</p>
                  <h3 className="text-lg font-bold leading-tight line-clamp-2">{item.title}</h3>
                </div>
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
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl w-full max-h-[90vh] bg-dark-paper border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-6 right-6 text-white hover:text-primary z-10 bg-black/40 p-2.5 rounded-full backdrop-blur-lg border border-white/10 transition-all hover:scale-110"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                <div className="md:w-2/3 bg-black flex items-center justify-center">
                  <img
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="md:w-1/3 p-8 flex flex-col justify-center bg-dark-paper">
                  <span className="text-primary font-bold text-xs uppercase tracking-widest mb-2 block">{selectedImage.category}</span>
                  <h3 className="text-3xl font-display font-bold mb-4">{selectedImage.title}</h3>
                  {selectedImage.date && (
                    <p className="text-gray-400 text-sm mb-6">
                      {new Date(selectedImage.date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                  <div className="h-1 w-12 bg-primary rounded-full" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
