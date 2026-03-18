import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredImages, setFeaturedImages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hero slideshow images
  const heroSlides = [
    'https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/c7tws8fd_DRP_0150.jpg.jpeg',
    'https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/1jyxdn7l_DRP_0213.jpg.jpeg',
    'https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/dzf4ww5n_DRP_0484.jpg.jpeg'
  ];

  useEffect(() => {
    fetchSiteImages();
  }, []);

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const fetchSiteImages = async () => {
    try {
      const response = await axios.get(`${API}/site-images`);
      const images = response.data;
      
      // Get featured images
      const featured = images.filter(img => img.section === 'featured').sort((a, b) => a.order - b.order).slice(0, 3);
      setFeaturedImages(featured);
    } catch (error) {
      console.error('Error fetching site images:', error);
    } finally {
      setLoading(false);
    }
  };

  const featuredTitles = ['Wedding Ceremonies', 'Candid Moments', 'Cinematic Films'];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Slideshow */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Slideshow Background */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('${heroSlides[currentSlide]}')`
              }}
            />
          </AnimatePresence>
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/60 to-transparent" />
        
        {/* Slide Indicators */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-500 ${
                currentSlide === idx
                  ? 'w-12 h-2 bg-[#D32F2F]'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              } rounded-full`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
        
        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-10 text-center px-4 max-w-5xl"
        >
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight" data-testid="hero-title">
            <span className="font-accent text-6xl sm:text-7xl lg:text-8xl text-[#D4AF37] block mb-4">Chitrakatha</span>
            Preserving Moments That Matter Most
          </h1>
          <p className="text-lg md:text-xl text-[#A3A3A3] mb-10 leading-relaxed max-w-3xl mx-auto" data-testid="hero-subtitle">
            Through real moments and raw emotion, we capture the essence of your special day with cinematic storytelling
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/services"
              data-testid="cta-view-packages"
              className="bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-8 py-3 font-medium transition-all duration-300 flex items-center space-x-2 group"
            >
              <span>View Our Packages</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link
              to="/gallery"
              data-testid="cta-explore-gallery"
              className="border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-sm px-8 py-3 font-medium transition-all duration-300 flex items-center space-x-2"
            >
              <Play size={20} />
              <span>Explore Gallery</span>
            </Link>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-[#D32F2F] rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Work Preview */}
      <section className="py-20 md:py-32 px-4 md:px-8 bg-[#121212]">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4" data-testid="featured-heading">
              Cinematic <span className="text-[#D32F2F]">Storytelling</span>
            </h2>
            <p className="text-lg text-[#A3A3A3] max-w-2xl mx-auto">
              Every frame tells a story. Every moment becomes eternal.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredImages.length > 0 ? (
              featuredImages.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  className="relative group overflow-hidden cursor-pointer h-96"
                  data-testid={`featured-item-${idx}`}
                >
                  <img
                    src={item.image_url}
                    alt={item.alt_text || featuredTitles[idx]}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-heading text-2xl font-bold text-white">{item.alt_text || featuredTitles[idx]}</h3>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20">
                <p className="text-[#A3A3A3]">Loading featured work...</p>
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/gallery"
              data-testid="view-full-gallery-button"
              className="inline-flex items-center space-x-2 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black rounded-sm px-8 py-3 font-medium transition-all duration-300"
            >
              <span>View Full Gallery</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Packages Preview */}
      <section className="py-20 md:py-32 px-4 md:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-4" data-testid="packages-heading">
              Our <span className="text-[#D4AF37]">Packages</span>
            </h2>
            <p className="text-lg text-[#A3A3A3] max-w-2xl mx-auto">
              Choose the perfect package for your special day
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Traditional', price: '₹70,000' },
              { name: 'Semi-Cinematic', price: '₹80,000' },
              { name: 'Cinematic', price: '₹90,000' },
              { name: 'Premium', price: '₹1,20,000', highlight: true }
            ].map((pkg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`bg-[#121212] p-6 rounded-sm transition-all duration-500 hover:transform hover:scale-105 ${
                  pkg.highlight ? 'border-2 border-[#D4AF37]' : 'border border-white/5 hover:border-[#D4AF37]/30'
                }`}
                data-testid={`package-preview-${pkg.name.toLowerCase().replace(' ', '-')}`}
              >
                <h3 className="font-heading text-2xl font-bold mb-2">{pkg.name}</h3>
                <p className="text-3xl font-bold text-[#D32F2F] mb-4">{pkg.price}</p>
                <p className="text-sm text-[#A3A3A3] mb-4">Starting from</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/services"
              data-testid="view-all-packages-button"
              className="inline-flex items-center space-x-2 bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-8 py-3 font-medium transition-all duration-300"
            >
              <span>View All Packages</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
