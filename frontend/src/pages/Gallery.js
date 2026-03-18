import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Gallery = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await axios.get(`${API}/gallery`);
      if (response.data.length === 0) {
        // Seed with sample data if empty
        setGalleryItems(sampleGalleryData);
      } else {
        // Sort by order field
        const sortedItems = response.data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setGalleryItems(sortedItems);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      // Use sample data as fallback
      setGalleryItems(sampleGalleryData);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = filter === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category.toLowerCase() === filter);

  const categories = ['all', 'wedding', 'pre-wedding', 'portrait', 'kids'];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4" data-testid="gallery-title">
            Our <span className="text-[#D4AF37]">Gallery</span>
          </h1>
          <p className="text-lg text-[#A3A3A3] max-w-2xl mx-auto">
            A collection of moments frozen in time
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              data-testid={`filter-${cat}`}
              className={`px-6 py-2 rounded-sm text-sm uppercase tracking-widest transition-all duration-300 ${
                filter === cat
                  ? 'bg-[#D32F2F] text-white'
                  : 'border border-white/20 text-white hover:border-[#D32F2F]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid - Masonry Layout */}
        {loading ? (
          <div className="text-center py-20" data-testid="gallery-loading">
            <p className="text-[#A3A3A3]">Loading gallery...</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="break-inside-avoid relative group overflow-hidden cursor-pointer"
                onClick={() => setSelectedItem(item)}
                data-testid={`gallery-item-${idx}`}
              >
                <img
                  src={item.thumbnail_url || item.media_url}
                  alt={item.title}
                  className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  {item.media_type === 'video' && (
                    <Play size={48} className="text-white" />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-[#D4AF37] text-xs uppercase">{item.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedItem(null)}
              data-testid="lightbox-modal"
            >
              <button
                onClick={() => setSelectedItem(null)}
                data-testid="close-lightbox"
                className="absolute top-4 right-4 text-white hover:text-[#D32F2F] transition-colors"
              >
                <X size={32} />
              </button>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedItem.media_type === 'video' ? (
                  <video
                    src={selectedItem.media_url}
                    controls
                    autoPlay
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                ) : (
                  <img
                    src={selectedItem.media_url}
                    alt={selectedItem.title}
                    className="w-full h-auto max-h-[80vh] object-contain"
                  />
                )}
                <div className="mt-4 text-center">
                  <h3 className="text-2xl font-heading font-bold text-white mb-2">{selectedItem.title}</h3>
                  <p className="text-[#D4AF37] uppercase text-sm tracking-widest">{selectedItem.category}</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Sample gallery data
const sampleGalleryData = [
  {
    id: '1',
    title: 'Traditional Wedding Ceremony',
    category: 'Wedding',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1724138009317-04f47b288945?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY291cGxlJTIwcG9ydHJhaXQlMjBlbW90aW9ufGVufDB8fHx8MTc3MTQwNzE4MXww&ixlib=rb-4.1.0&q=85'
  },
  {
    id: '2',
    title: 'Romantic Couple Portrait',
    category: 'Pre-Wedding',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1769050348903-397040b5a3d9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY291cGxlJTIwcG9ydHJhaXQlMjBlbW90aW9ufGVufDB8fHx8MTc3MTQwNzE4MXww&ixlib=rb-4.1.0&q=85'
  },
  {
    id: '3',
    title: 'Candid Moment',
    category: 'Wedding',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1733038378254-8d825056c249?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB3ZWRkaW5nJTIwY291cGxlJTIwcG9ydHJhaXQlMjBlbW90aW9ufGVufDB8fHx8MTc3MTQwNzE4MXww&ixlib=rb-4.1.0&q=85'
  },
  {
    id: '4',
    title: 'Cinematic Wedding Film',
    category: 'Wedding',
    media_type: 'photo',
    media_url: 'https://images.pexels.com/photos/31832634/pexels-photo-31832634.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
  },
  {
    id: '5',
    title: 'Premium Photography',
    category: 'Wedding',
    media_type: 'photo',
    media_url: 'https://images.pexels.com/photos/31832655/pexels-photo-31832655.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
  },
  {
    id: '6',
    title: 'Professional Equipment',
    category: 'Event',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1693993367105-d2c37d9b60ce?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxjaW5lbWF0aWMlMjB2aWRlb2dyYXBoZXIlMjBjYW1lcmElMjBsZW5zJTIwZXF1aXBtZW50fGVufDB8fHx8MTc3MTQwNzE4Mnww&ixlib=rb-4.1.0&q=85'
  },
  {
    id: '7',
    title: 'Behind The Scenes',
    category: 'Event',
    media_type: 'photo',
    media_url: 'https://images.pexels.com/photos/3062547/pexels-photo-3062547.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
  },
  {
    id: '8',
    title: 'Cinema Camera Setup',
    category: 'Event',
    media_type: 'photo',
    media_url: 'https://images.unsplash.com/photo-1611937542148-f39639998c03?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwyfHxjaW5lbWF0aWMlMjB2aWRlb2dyYXBoZXIlMjBjYW1lcmElMjBsZW5zJTIwZXF1aXBtZW50fGVufDB8fHx8MTc3MTQwNzE4Mnww&ixlib=rb-4.1.0&q=85'
  }
];

export default Gallery;
