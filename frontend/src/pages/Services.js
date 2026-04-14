import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Tag, X, Phone, Mail, MessageCircle, CheckCircle, Heart, Baby, Camera } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Services = () => {
  const [activeCategory, setActiveCategory] = useState('wedding');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [serviceImages, setServiceImages] = useState([]);
  const [kidsImages, setKidsImages] = useState([]);
  const [preweddingImages, setPreweddingImages] = useState([]);

  useEffect(() => {
    fetchServiceImages();
  }, []);

  const fetchServiceImages = async () => {
    try {
      const response = await axios.get(`${API}/site-images`);
      const images = response.data.filter(img => img.section === 'services').sort((a, b) => a.order - b.order);
      setServiceImages(images);
      const kids = response.data.filter(img => img.section === 'kids').sort((a, b) => a.order - b.order);
      setKidsImages(kids);
      const prewedding = response.data.filter(img => img.section === 'prewedding').sort((a, b) => a.order - b.order);
      setPreweddingImages(prewedding);
    } catch (error) {
      console.error('Error fetching service images:', error);
    }
  };

  const toggleAddOn = (addon) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(item => item.name === addon.name);
      if (exists) {
        toast.info(`${addon.name} removed`);
        return prev.filter(item => item.name !== addon.name);
      } else {
        toast.success(`${addon.name} added - ₹${addon.price.toLocaleString()}`);
        return [...prev, addon];
      }
    });
  };

  const isAddOnSelected = (addonName) => {
    return selectedAddOns.some(item => item.name === addonName);
  };

  const calculateTotal = () => {
    const packagePrice = selectedPackage ? selectedPackage.price : 0;
    const addOnsTotal = selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
    return packagePrice + addOnsTotal;
  };

  const handleBookPackage = (pkg) => {
    setSelectedPackage(pkg);
    setShowContactModal(true);
  };

  const categories = [
    { id: 'wedding', label: 'Wedding', icon: Heart },
    { id: 'prewedding', label: 'Pre-Wedding', icon: Camera },
    { id: 'kids', label: 'Kids', icon: Baby }
  ];

  // Wedding Packages
  const weddingPackages = [
    {
      name: 'Traditional',
      originalPrice: 95000,
      price: 80000,
      discount: 16,
      duration: '3 Days Coverage',
      features: [
        '2 x 20 Sheets NT Glossy Album with bag (18" X 12")',
        '120 Edited Photos for each album',
        'All Raw Photos',
        '2 x Full HD Traditional Video (1920x1080)',
        '2 Pendrives',
        '1 Photographer & 1 Videographer (each side)',
        '3 Days Coverage'
      ],
      imageIndex: 0
    },
    {
      name: 'Semi-Cinematic',
      originalPrice: 105000,
      price: 90000,
      discount: 14,
      duration: '3 Days Coverage',
      features: [
        '1 Invitation (Photo)',
        '2 x 25 Sheets NT Glossy Album with Leather bag (18" X 12")',
        '150 Edited Photos for each album',
        'All Raw Photos',
        '2 x Full HD Semi Cinematic Video (1920x1080)',
        '1 Teaser video',
        '2 Pendrives',
        '1 Photographer & 1 Videographer (each side)',
        '3 Days Coverage'
      ],
      imageIndex: 1
    },
    {
      name: 'Cinematic',
      originalPrice: 115000,
      price: 100000,
      discount: 13,
      duration: '3 Days Coverage',
      features: [
        '1 Invitation Video',
        '2 x 25 Sheets Exclusive Album (18" X 12")',
        '150 High End Edited Photos each side',
        'Leather Bag',
        '1 Framed Photo',
        'All Raw Copies',
        '1 Full HD Cinematic video (1920x1080)',
        'Cinematic Wedding Trailer',
        '3 Reels',
        '2 Pendrive & box',
        '1 Photographer, 1 Cinematographer & 1 Candid Photographer',
        '3 Days Coverage'
      ],
      imageIndex: 2
    },
    {
      name: 'Premium Cinematic',
      originalPrice: 145000,
      price: 130000,
      discount: 10,
      duration: '4 Days Coverage',
      highlight: true,
      features: [
        '1 AI Invitation Video',
        '30 Sheets Exclusive Album (18" X 12")',
        '200 High End Edited photos for each album',
        'Mini Replica Book',
        'Leather Bag',
        'Calendar',
        'Raw Copies With Color Adjustment Editing',
        '1 Full HD Edited Cinematic Full Video (1920x1080)',
        '1 Cinematic Wedding Trailer',
        '2 best Photographers & 1 best Cinematographers (each side)',
        '1 Pendrive & Box',
        'Drone on Wedding Day & Reception Day',
        '4 Days Coverage'
      ],
      imageIndex: 3
    }
  ];

  // Pre-Wedding Packages
  const preWeddingPackages = [
    {
      name: '1 Day Pre-Wedding Shoot',
      originalPrice: 22000,
      price: 20000,
      discount: 9,
      duration: '1 Day',
      features: [
        '15 Edited Photos',
        '3-4 mins Cinematic Video',
        '1 Cinematic Coming Soon Reel',
        'Within 100kms coverage',
        'Professional photographer & videographer'
      ],
      note: 'Travelling, fooding, lodging separate'
    },
    {
      name: 'Premium Pre-Wedding Shoot',
      originalPrice: 37000,
      price: 35000,
      discount: 5,
      duration: '2 Days',
      highlight: true,
      features: [
        '2 Days Pre-wedding Shoot',
        '20-25 Fully Skin Retouched Photos',
        'All Raw Photos',
        '3-4 Mins Cinematic Video',
        '30-40 secs Teaser Video',
        '1 Reel',
        '1 Day Drone Coverage',
        'Any Location'
      ],
      note: 'Travelling, fooding, lodging separate'
    }
  ];

  // Kids Packages
  const kidsPackages = [
    {
      name: 'Traditional Package',
      originalPrice: 19000,
      price: 17000,
      discount: 11,
      duration: 'Event Day',
      features: [
        '1 12X18 Standard 20 Sheet Album (120 images)',
        '1 Traditional Video (40-50 minutes)',
        'All Raw Photos',
        'Professional coverage'
      ]
    },
    {
      name: 'Semi Cinematic Package',
      originalPrice: 22000,
      price: 20000,
      discount: 9,
      duration: 'Event Day',
      features: [
        '1 12X18 25 Sheet Album (150-160 images)',
        'Leather Bag & Calendar',
        '1 Semi Cinematic Video (20 minutes)',
        'All Raw Photos'
      ]
    },
    {
      name: 'Full Cinematic Package',
      originalPrice: 27000,
      price: 25000,
      discount: 7,
      duration: 'Event Day + Bonus',
      highlight: true,
      features: [
        '1 Combo Album of 25 Sheet NT Glossy (150-160 images)',
        'Mini Replica Book',
        'Leather Bag',
        '1 Full Cinematic Video (10-15 minutes)',
        '1 Trailer (2-3 minutes)',
        'Pendrive with All Raw Photos',
        '1 Complimentary 2hrs Baby Shoot (Separate Day)'
      ]
    },
    {
      name: 'Birthday Package',
      originalPrice: 20000,
      price: 18000,
      discount: 10,
      duration: 'Event Day',
      features: [
        '1 (9X12) Standard 15 Sheet Album (100 images)',
        '1 Cinematic Video (10-15 minutes)',
        'All Raw Photos',
        'Complete birthday coverage'
      ]
    }
  ];

  const getCurrentPackages = () => {
    switch(activeCategory) {
      case 'prewedding': return preWeddingPackages;
      case 'kids': return kidsPackages;
      default: return weddingPackages;
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Our <span className="text-[#D4AF37]">Services</span>
          </h1>
          <p className="text-lg text-[#A3A3A3] max-w-3xl mx-auto mb-8">
            Choose the perfect package for your special moments
          </p>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`btn-category flex items-center space-x-3 ${
                    activeCategory === cat.id
                      ? 'btn-category-active'
                      : 'btn-category-inactive'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-lg">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Packages Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          >
            {getCurrentPackages().map((pkg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`bg-[#121212] rounded-2xl overflow-hidden group relative ${
                  pkg.highlight 
                    ? 'border-2 border-[#D4AF37] shadow-2xl shadow-[#D4AF37]/20' 
                    : 'border border-white/10 hover:border-[#D32F2F]/50'
                }`}
              >
                {/* Image Section - Larger */}
                <div className="relative h-72 overflow-hidden">
                  {(() => {
                    const imgs = activeCategory === 'kids' ? kidsImages : activeCategory === 'prewedding' ? preweddingImages : serviceImages;
                    const img = imgs[pkg.imageIndex !== undefined ? pkg.imageIndex : idx];
                    return img ? (
                      <img
                        src={img.image_url}
                        alt={pkg.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : null;
                  })()}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {pkg.discount && (
                      <span className="bg-[#D32F2F] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                        {pkg.discount}% OFF
                      </span>
                    )}
                  </div>
                  
                  {pkg.highlight && (
                    <div className="absolute top-4 right-4 bg-[#D4AF37] text-black px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                      POPULAR
                    </div>
                  )}
                </div>

                {/* Content Section - Spacious */}
                <div className="p-8">
                  <h3 className="font-heading text-3xl font-bold mb-3">{pkg.name}</h3>
                  <p className="text-[#D4AF37] text-sm mb-4 font-medium">{pkg.duration}</p>
                  
                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-3 mb-2">
                      {pkg.originalPrice && (
                        <span className="text-xl text-[#A3A3A3] line-through">
                          ₹{(pkg.originalPrice / 1000).toFixed(0)}k
                        </span>
                      )}
                      <span className="text-4xl font-bold text-[#D32F2F]">
                        ₹{(pkg.price / 1000).toFixed(0)}k
                      </span>
                    </div>
                    {pkg.originalPrice && (
                      <p className="text-sm text-[#D4AF37]">
                        Save ₹{((pkg.originalPrice - pkg.price) / 1000).toFixed(0)}k
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {pkg.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start text-[#A3A3A3]">
                        <Check size={20} className="text-[#D4AF37] mr-3 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {pkg.note && (
                    <p className="text-xs text-[#A3A3A3] italic mb-6 bg-[#1A1A1A] p-3 rounded-lg">
                      * {pkg.note}
                    </p>
                  )}

                  <button
                    onClick={() => handleBookPackage(pkg)}
                    className={`w-full ${
                      pkg.highlight
                        ? 'btn-book-gold'
                        : 'btn-book-red'
                    }`}
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Add-On Services Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-center">
            Add-On <span className="text-[#D32F2F]">Services</span>
          </h2>
          <p className="text-center text-[#A3A3A3] mb-12 text-lg">Enhance your package with additional services</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Pre/Post Wedding Photography with Selected Edits', originalPrice: 12000, price: 10000, description: '1-day shoot in Asansol' },
              { name: 'Pre/Post Wedding Cinematography with Edit', originalPrice: 12000, price: 10000, description: '1-day shoot (excluding drone)' },
              { name: 'Additional 1 Day Prewedding Shoot', originalPrice: 12000, price: 10000, description: 'Extended coverage' },
              { name: 'Aiburo Bhat + Mehendi Photography + Videography', originalPrice: 12000, price: 10000, description: 'Complete coverage (separate charges for both sides)' },
              { name: 'Dodhi Mangal Photography', originalPrice: 6000, price: 4000, description: 'Early morning event (separate charges)' },
              { name: 'Drone Usage', originalPrice: 8000, price: 6000, description: 'Per day - Local' },
              { name: 'Additional Candid Photographer', originalPrice: 7000, price: 5000, description: 'Per day - Local' }
            ].map((addon, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="bg-[#121212] border border-white/10 p-6 rounded-2xl hover:border-[#D32F2F]/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading text-lg font-bold flex-1 text-white">{addon.name}</h3>
                  <Plus size={20} className="text-[#D4AF37] flex-shrink-0 ml-2" />
                </div>
                <p className="text-sm text-[#A3A3A3] mb-4">{addon.description}</p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#A3A3A3] line-through">₹{addon.originalPrice.toLocaleString()}</span>
                  <span className="text-2xl font-bold text-[#D32F2F]">₹{addon.price.toLocaleString()}</span>
                </div>
                <p className="text-xs text-[#D4AF37] mt-1">Save ₹{(addon.originalPrice - addon.price).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Terms & Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-[#121212] border border-white/10 p-8 md:p-12 rounded-2xl"
        >
          <h2 className="font-heading text-3xl font-bold mb-8 text-center">
            Payment Terms & <span className="text-[#D4AF37]">Delivery Timeline</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 text-sm text-[#A3A3A3] mb-12">
            <div>
              <h3 className="text-white font-semibold mb-6 text-xl flex items-center">
                <span className="bg-[#D32F2F] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                Payment Schedule
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                  <Check size={20} className="text-[#D4AF37] mr-3 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">15%</strong> due upon booking</span>
                </li>
                <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                  <Check size={20} className="text-[#D4AF37] mr-3 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">35%</strong> before the event day</span>
                </li>
                <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                  <Check size={20} className="text-[#D4AF37] mr-3 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">40%</strong> after the event</span>
                </li>
                <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                  <Check size={20} className="text-[#D4AF37] mr-3 flex-shrink-0 mt-0.5" />
                  <span>Remaining <strong className="text-white">10%</strong> on album delivery</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-6 text-xl flex items-center">
                <span className="bg-[#D32F2F] text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                Delivery Timeline
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                  <Check size={20} className="text-[#D4AF37] mr-3 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Album:</strong> Maximum 50 days after selection</span>
                </li>
                <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                  <Check size={20} className="text-[#D4AF37] mr-3 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Video:</strong> At least 90 days preparation time</span>
                </li>
                <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                  <Check size={20} className="text-[#D4AF37] mr-3 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Collection:</strong> Within 15 days of completion</span>
                </li>
                <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                  <Check size={20} className="text-[#D4AF37] mr-3 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Photo Selection:</strong> Within 7 days of receiving raw data</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <h3 className="text-white font-semibold mb-6 text-xl">Terms & Conditions:</h3>
            <ul className="space-y-4 text-sm text-[#A3A3A3]">
              <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                <span className="text-[#D32F2F] mr-3 flex-shrink-0 mt-1">•</span>
                <span>All raw photos will be provided on <strong className="text-white">Google Drive</strong> after the event. Client must select preferred ones within 7 days.</span>
              </li>
              <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                <span className="text-[#D32F2F] mr-3 flex-shrink-0 mt-1">•</span>
                <span>Client is responsible for covering expenses related to food, lodging, and travel for crew members.</span>
              </li>
              <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                <span className="text-[#D32F2F] mr-3 flex-shrink-0 mt-1">•</span>
                <span>Music used in the video must be provided by the client.</span>
              </li>
              <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                <span className="text-[#D32F2F] mr-3 flex-shrink-0 mt-1">•</span>
                <span>Clients and their family must cooperate with photographers for better results.</span>
              </li>
              <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                <span className="text-[#D32F2F] mr-3 flex-shrink-0 mt-1">•</span>
                <span>Minor changes in the video can be done once at no additional cost. Further changes will be subject to additional charges.</span>
              </li>
              <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                <span className="text-[#D4AF37] mr-3 flex-shrink-0 mt-1">•</span>
                <span className="text-[#D4AF37]">Photographers will not be liable for dissatisfying output if clients/family do not cooperate.</span>
              </li>
              <li className="flex items-start bg-[#1A1A1A] p-4 rounded-xl">
                <span className="text-[#D4AF37] mr-3 flex-shrink-0 mt-1">•</span>
                <span className="text-[#D4AF37]">The photographer shall not be responsible for any data loss after six (6) months.</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Contact Modal */}
        <AnimatePresence>
          {showContactModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
              onClick={() => setShowContactModal(false)}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-[#121212] border-2 border-[#D4AF37] rounded-2xl p-8 max-w-2xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="font-heading text-3xl font-bold">
                    Contact <span className="text-[#D4AF37]">Chitrakatha</span>
                  </h2>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="text-white hover:text-[#D32F2F] transition-colors"
                  >
                    <X size={28} />
                  </button>
                </div>

                {selectedPackage && (
                  <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-6 mb-6">
                    <p className="text-sm text-[#A3A3A3] mb-2">Selected Package</p>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-2xl text-white">{selectedPackage.name}</p>
                      <p className="text-3xl font-bold text-[#D32F2F]">₹{selectedPackage.price.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <a 
                    href="tel:+919800000000"
                    className="flex items-center space-x-4 bg-[#1A1A1A] border border-white/10 hover:border-[#D32F2F] rounded-xl p-4 transition-all duration-300 group"
                  >
                    <div className="bg-[#D32F2F] p-3 rounded-xl group-hover:bg-[#B71C1C] transition-colors">
                      <Phone size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#A3A3A3]">Call Us</p>
                      <p className="text-lg font-semibold text-white">+91 98000 00000</p>
                    </div>
                  </a>

                  <a 
                    href="https://wa.me/919800000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 bg-[#1A1A1A] border border-white/10 hover:border-[#25D366] rounded-xl p-4 transition-all duration-300 group"
                  >
                    <div className="bg-[#25D366] p-3 rounded-xl group-hover:bg-[#1FA855] transition-colors">
                      <MessageCircle size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#A3A3A3]">WhatsApp</p>
                      <p className="text-lg font-semibold text-white">Chat with us</p>
                    </div>
                  </a>

                  <a 
                    href="mailto:contact@chitrakatha.com"
                    className="flex items-center space-x-4 bg-[#1A1A1A] border border-white/10 hover:border-[#D4AF37] rounded-xl p-4 transition-all duration-300 group"
                  >
                    <div className="bg-[#D4AF37] p-3 rounded-xl group-hover:bg-[#C5A028] transition-colors">
                      <Mail size={24} className="text-black" />
                    </div>
                    <div>
                      <p className="text-sm text-[#A3A3A3]">Email</p>
                      <p className="text-lg font-semibold text-white">contact@chitrakatha.com</p>
                    </div>
                  </a>
                </div>

                <div className="bg-[#D32F2F]/10 border border-[#D32F2F]/30 rounded-xl p-4 text-center">
                  <p className="text-sm text-[#E5E5E5]">
                    Our team will get back to you within 24 hours
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Services;
