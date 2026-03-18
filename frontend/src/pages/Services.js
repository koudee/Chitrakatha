import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Tag, X, Phone, Mail, MessageCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Services = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [serviceImages, setServiceImages] = useState([]);

  useEffect(() => {
    fetchServiceImages();
  }, []);

  const fetchServiceImages = async () => {
    try {
      const response = await axios.get(`${API}/site-images`);
      const images = response.data.filter(img => img.section === 'services').sort((a, b) => a.order - b.order);
      setServiceImages(images);
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

  const packages = [
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
      ]
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
      ]
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
        '1 Photographer, 1 Cinematographer & 1 Candid Photographer (on the wedding & reception day)',
        '3 Days Coverage'
      ]
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
      ]
    }
  ];

  const addOns = [
    { 
      name: 'Pre/Post Wedding Photography with Selected Edits', 
      originalPrice: 12000,
      price: 10000, 
      description: '1-day shoot in Asansol' 
    },
    { 
      name: 'Pre/Post Wedding Cinematography with Edit', 
      originalPrice: 12000,
      price: 10000, 
      description: '1-day shoot in Asansol (excluding drone)' 
    },
    { 
      name: 'Additional 1 Day Prewedding Shoot', 
      originalPrice: 12000,
      price: 10000, 
      description: 'Extended pre-wedding coverage' 
    },
    { 
      name: 'Aiburo Bhat + Mehendi Photography + Videography', 
      originalPrice: 12000,
      price: 10000, 
      description: 'Complete coverage (separate charges for bride & groom sides)' 
    },
    { 
      name: 'Dodhi Mangal Photography', 
      originalPrice: 6000,
      price: 4000, 
      description: 'Early morning event (separate charges for bride & groom sides)' 
    },
    { 
      name: 'Drone Usage', 
      originalPrice: 8000,
      price: 6000, 
      description: 'Per day coverage - Local' 
    },
    { 
      name: 'Additional Candid Photographer', 
      originalPrice: 7000,
      price: 5000, 
      description: 'Per day - Local' 
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-4" data-testid="services-title">
            Our <span className="text-[#D4AF37]">Services</span>
          </h1>
          <p className="text-lg text-[#A3A3A3] max-w-3xl mx-auto">
            Choose the perfect package for your special day. Each package includes both bride and groom side coverage.
          </p>
          <div className="mt-4 inline-flex items-center space-x-2 bg-[#D32F2F]/10 border border-[#D32F2F]/30 rounded-sm px-6 py-3">
            <Tag className="text-[#D32F2F]" size={20} />
            <span className="text-[#D32F2F] font-semibold">Limited Time Offer - Save up to 16%!</span>
          </div>
        </motion.div>

        {/* Main Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {packages.map((pkg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`bg-[#121212] rounded-sm overflow-hidden group relative ${
                pkg.highlight 
                  ? 'border-2 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20' 
                  : 'border border-white/5 hover:border-[#D4AF37]/30'
              } transition-all duration-500`}
              data-testid={`package-${pkg.name.toLowerCase().replace(' ', '-')}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={serviceImages[idx]?.image_url || ''}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
                {pkg.highlight && (
                  <div className="absolute top-4 right-4 bg-[#D4AF37] text-black px-4 py-1 text-xs font-bold uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-[#D32F2F] text-white px-3 py-1 rounded-sm text-xs font-bold">
                  {pkg.discount}% OFF
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-heading text-2xl font-bold mb-2" data-testid={`package-name-${idx}`}>{pkg.name}</h3>
                <p className="text-sm text-[#A3A3A3] mb-4">{pkg.duration}</p>
                
                <div className="mb-4">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="text-lg text-[#A3A3A3] line-through">₹{(pkg.originalPrice / 1000).toFixed(0)}k</span>
                    <span className="text-3xl font-bold text-[#D32F2F]">₹{(pkg.price / 1000).toFixed(0)}k</span>
                  </div>
                  <p className="text-xs text-[#D4AF37]">Save ₹{((pkg.originalPrice - pkg.price) / 1000).toFixed(0)}k • Both Sides</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-start text-sm text-[#A3A3A3]">
                      <Check size={16} className="text-[#D4AF37] mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleBookPackage(pkg)}
                  data-testid={`book-package-${idx}`}
                  className={`w-full py-3 rounded-sm font-medium transition-all duration-300 ${
                    pkg.highlight
                      ? 'bg-[#D4AF37] text-black hover:bg-[#C5A028]'
                      : 'bg-[#D32F2F] text-white hover:bg-[#B71C1C]'
                  }`}
                >
                  Book Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add-On Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-center" data-testid="addon-services-title">
            Add-On <span className="text-[#D32F2F]">Services</span>
          </h2>
          <p className="text-center text-[#A3A3A3] mb-8">Click + to add services to your package</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOns.map((addon, idx) => {
              const isSelected = isAddOnSelected(addon.name);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                  className={`bg-[#121212] border p-6 rounded-sm transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20' 
                      : 'border-white/5 hover:border-[#D32F2F]/30'
                  }`}
                  onClick={() => toggleAddOn(addon)}
                  data-testid={`addon-${idx}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-heading text-lg font-bold flex-1">{addon.name}</h3>
                    <button
                      className={`flex-shrink-0 ml-2 transition-all duration-300 ${
                        isSelected 
                          ? 'text-[#D4AF37] rotate-45' 
                          : 'text-[#D4AF37] hover:scale-110'
                      }`}
                    >
                      {isSelected ? <CheckCircle size={24} fill="#D4AF37" /> : <Plus size={20} />}
                    </button>
                  </div>
                  <p className="text-sm text-[#A3A3A3] mb-4">{addon.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#A3A3A3] line-through">₹{addon.originalPrice.toLocaleString()}</span>
                    <span className="text-2xl font-bold text-[#D32F2F]">₹{addon.price.toLocaleString()}</span>
                  </div>
                  {addon.originalPrice > addon.price && (
                    <p className="text-xs text-[#D4AF37] mt-1">Save ₹{(addon.originalPrice - addon.price).toLocaleString()}</p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Selected Services Summary - Floating */}
        {(selectedPackage || selectedAddOns.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-8 right-8 bg-[#121212] border-2 border-[#D4AF37] rounded-sm p-6 shadow-2xl shadow-[#D4AF37]/30 max-w-md z-40"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl font-bold flex items-center space-x-2">
                <Tag className="text-[#D4AF37]" />
                <span>Your Selection</span>
              </h3>
              <button
                onClick={() => {
                  setSelectedPackage(null);
                  setSelectedAddOns([]);
                  toast.info('Selection cleared');
                }}
                className="text-[#A3A3A3] hover:text-[#D32F2F] transition-colors"
                title="Clear all selections"
              >
                <X size={24} />
              </button>
            </div>
            
            {selectedPackage && (
              <div className="mb-4 pb-4 border-b border-white/10">
                <p className="text-sm text-[#A3A3A3] mb-1">Package</p>
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-white flex-1">{selectedPackage.name}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-[#D32F2F] font-bold">₹{selectedPackage.price.toLocaleString()}</p>
                    <button
                      onClick={() => {
                        setSelectedPackage(null);
                        toast.info('Package removed');
                      }}
                      className="text-[#A3A3A3] hover:text-[#D32F2F] transition-colors"
                      title="Remove package"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {selectedAddOns.length > 0 && (
              <div className="mb-4 pb-4 border-b border-white/10">
                <p className="text-sm text-[#A3A3A3] mb-2">Add-ons ({selectedAddOns.length})</p>
                <div className="space-y-2">
                  {selectedAddOns.map((addon, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <p className="text-white flex-1 pr-2">{addon.name}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-[#D32F2F] font-semibold">₹{addon.price.toLocaleString()}</p>
                        <button
                          onClick={() => toggleAddOn(addon)}
                          className="text-[#A3A3A3] hover:text-[#D32F2F] transition-colors"
                          title="Remove add-on"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mb-4">
              <p className="text-lg font-bold text-white">Total</p>
              <p className="text-2xl font-bold text-[#D4AF37]">₹{calculateTotal().toLocaleString()}</p>
            </div>
            
            <button
              onClick={() => setShowContactModal(true)}
              className="w-full bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-6 py-3 font-medium transition-all duration-300"
            >
              Get Quote & Book
            </button>
          </motion.div>
        )}

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
                className="bg-[#121212] border border-[#D4AF37] rounded-sm p-8 max-w-2xl w-full"
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
                  <div className="bg-[#1A1A1A] border border-white/10 rounded-sm p-4 mb-6">
                    <p className="text-sm text-[#A3A3A3] mb-2">Selected Package</p>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-xl text-white">{selectedPackage.name}</p>
                      <p className="text-2xl font-bold text-[#D32F2F]">₹{selectedPackage.price.toLocaleString()}</p>
                    </div>
                    {selectedAddOns.length > 0 && (
                      <p className="text-xs text-[#D4AF37] mt-2">+ {selectedAddOns.length} Add-on service(s)</p>
                    )}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <a 
                    href="tel:+919800000000"
                    className="flex items-center space-x-4 bg-[#1A1A1A] border border-white/10 hover:border-[#D32F2F] rounded-sm p-4 transition-all duration-300 group"
                  >
                    <div className="bg-[#D32F2F] p-3 rounded-sm group-hover:bg-[#B71C1C] transition-colors">
                      <Phone size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#A3A3A3]">Call Us</p>
                      <p className="text-lg font-semibold text-white">+91 98000 00000</p>
                    </div>
                  </a>

                  <a 
                    href="https://wa.me/919800000000?text=Hi%2C%20I%20want%20to%20book%20a%20photography%20package"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 bg-[#1A1A1A] border border-white/10 hover:border-[#25D366] rounded-sm p-4 transition-all duration-300 group"
                  >
                    <div className="bg-[#25D366] p-3 rounded-sm group-hover:bg-[#1FA855] transition-colors">
                      <MessageCircle size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-[#A3A3A3]">WhatsApp</p>
                      <p className="text-lg font-semibold text-white">Chat with us</p>
                    </div>
                  </a>

                  <a 
                    href="mailto:contact@chitrakatha.com"
                    className="flex items-center space-x-4 bg-[#1A1A1A] border border-white/10 hover:border-[#D4AF37] rounded-sm p-4 transition-all duration-300 group"
                  >
                    <div className="bg-[#D4AF37] p-3 rounded-sm group-hover:bg-[#C5A028] transition-colors">
                      <Mail size={24} className="text-black" />
                    </div>
                    <div>
                      <p className="text-sm text-[#A3A3A3]">Email</p>
                      <p className="text-lg font-semibold text-white">contact@chitrakatha.com</p>
                    </div>
                  </a>
                </div>

                <div className="bg-[#D32F2F]/10 border border-[#D32F2F]/30 rounded-sm p-4 text-center">
                  <p className="text-sm text-[#E5E5E5]">
                    Our team will get back to you within 24 hours to discuss your requirements and finalize the booking.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terms & Payment - Rest of the code remains same */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-[#121212] border border-white/5 p-8 rounded-sm"
        >
          <h2 className="font-heading text-2xl font-bold mb-6" data-testid="terms-title">
            Payment Terms & <span className="text-[#D4AF37]">Delivery Timeline</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 text-sm text-[#A3A3A3] mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Payment Schedule:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check size={16} className="text-[#D4AF37] mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">15%</strong> due upon booking</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-[#D4AF37] mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">35%</strong> before the wedding day</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-[#D4AF37] mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">40%</strong> after the event</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-[#D4AF37] mr-2 flex-shrink-0 mt-0.5" />
                  <span>Remaining <strong className="text-white">10%</strong> on album delivery</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4 text-lg">Delivery Timeline:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check size={16} className="text-[#D4AF37] mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Album:</strong> Maximum 50 days after selection</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-[#D4AF37] mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Video:</strong> At least 90 days preparation time</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-[#D4AF37] mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Collection:</strong> Within 15 days of completion</span>
                </li>
                <li className="flex items-start">
                  <Check size={16} className="text-[#D4AF37] mr-2 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Photo Selection:</strong> Must be completed within 7 days of receiving raw data</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-white font-semibold mb-4 text-lg">Terms & Conditions:</h3>
            <ul className="space-y-3 text-sm text-[#A3A3A3]">
              <li className="flex items-start">
                <span className="text-[#D32F2F] mr-2 flex-shrink-0">•</span>
                <span>All raw photos will be provided on <strong className="text-white">Google Drive</strong> after the event. Client must select preferred ones within 7 days.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#D32F2F] mr-2 flex-shrink-0">•</span>
                <span>Client is responsible for covering expenses related to food, lodging, and travel for crew members.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#D32F2F] mr-2 flex-shrink-0">•</span>
                <span>Music used in the video must be provided by the client.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#D32F2F] mr-2 flex-shrink-0">•</span>
                <span>Clients and their family must cooperate with photographers for better results.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#D32F2F] mr-2 flex-shrink-0">•</span>
                <span>Minor changes in the video can be done once at no additional cost. Further changes will be subject to additional charges.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#D32F2F] mr-2 flex-shrink-0">•</span>
                <span className="text-[#D4AF37]">Photographers will not be liable for dissatisfying output if clients/family do not cooperate.</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#D32F2F] mr-2 flex-shrink-0">•</span>
                <span className="text-[#D4AF37]">The photographer shall not be held responsible for any data loss after six (6) months.</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
