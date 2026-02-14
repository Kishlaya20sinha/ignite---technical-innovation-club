import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import SectionWrapper from '../components/SectionWrapper';
import { GALLERY_IMAGES } from '../data';
import { GalleryItem } from '../types';

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container mx-auto px-6">
        <SectionWrapper className="mb-20 text-center">
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">Gallery</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Capturing moments of innovation, teamwork, and success.
          </p>
        </SectionWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GALLERY_IMAGES.map((item, index) => (
            <SectionWrapper key={item.id} delay={index * 0.05}>
              <motion.div
                layoutId={`image-${item.id}`}
                onClick={() => setSelectedImage(item)}
                className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group"
                whileHover={{ scale: 1.02 }}
              >
                <img 
                  src={item.src} 
                  alt={item.alt} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-medium">{item.category}</span>
                </div>
              </motion.div>
            </SectionWrapper>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              layoutId={`image-${selectedImage.id}`}
              className="relative max-w-5xl w-full max-h-[90vh] rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-primary z-10 bg-black/20 p-2 rounded-full backdrop-blur-md"
              >
                <X size={24} />
              </button>
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="w-full h-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-xl font-bold text-white">{selectedImage.alt}</h3>
                <p className="text-gray-300">{selectedImage.category}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
