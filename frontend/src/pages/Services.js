import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Services = () => {
  const [selectedPackage, setSelectedPackage] = useState(null);
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

  const packages = [
    {
      name: 'Traditional',
      price: 70000,
      duration: '3 Days Coverage',
      features: [
        '2 x 20 Sheets NT Glossy Album with bag (18" X 12")',
        '120 Edited Photos per album',
        'All Raw Photos',
        '2 x Full HD Traditional Video (1920x1080)',
        '2 Pendrives',
        '1 Photographer & 1 Videographer (each side)',
        '3 Days Coverage'
      ]
    },
    {
      name: 'Semi-Cinematic',
      price: 80000,
      duration: '4 Days Coverage',
      features: [
        '2 x 25 Sheets NT Glossy Album with Leather bag (18" X 12")',
        '150 Edited Photos per album',
        'All Raw Photos',
        '2 x Full HD Semi Cinematic Video (1920x1080)',
        '1 Teaser video',
        '2 Pendrives',
        '1 Photographer & 1 Videographer (each side)',
        '4 Days Coverage'
      ]
    },
    {
      name: 'Cinematic',
      price: 90000,
      duration: '4 Days Coverage',
      features: [
        '2 x 25 Sheets Exclusive Album (18" X 12")',
        '150 High End Edited Photos each side',
        'Leather Bag',
        '1 Framed Photo',
        'All Raw Copies',
        '1 Full HD Cinematic video (1920x1080)',
        'Cinematic Wedding Trailer',
        '3 Reels',
        '2 Pendrive 8 box',
        '1 Photographer, 1 Cinematographer & 1 Candid Photographer',
        '4 Days Coverage'
      ]
    },
    {
      name: 'Premium Cinematic',
      price: 120000,
      duration: '4 Days Coverage',
      highlight: true,
      features: [
        '30 Sheets Exclusive Album (18" X 12")',
        '200 High End Edited photos for each album',
        'Mini Replica Book',
        'Leather Bag',
        'Calendar',
        'Raw Copies With Color Adjustment Editing',
        '1 Full HD Edited Cinematic Full Video (1920x1080)',
        '1 Cinematic Wedding Trailer',
        '2 best Photographers & 1 best Cinematographer (each side)',
        '1 Pendrive & Box',
        'Drone on Wedding Day & Reception Day',
        '4 Days Coverage'
      ]
    }
  ];

  const addOns = [
    { name: 'Pre/Post Wedding Photography', price: 8000, description: '1-day shoot in Asansol' },
    { name: 'Pre/Post Wedding Cinematic Video', price: 10000, description: '1-day shoot in Asansol (excluding drone)' },
    { name: 'Additional 2-day Pre-Wedding Shoot', price: 10000, description: 'Extended pre-wedding coverage' },
    { name: 'Aiburo Bhat + Mehendi Photography', price: 6000, description: 'Per event (separate charges for bride & groom sides)' },
    { name: 'Dodhi Mongal Photography', price: 3000, description: 'Early morning event (separate charges for bride & groom sides)' },
    { name: 'Drone Usage', price: 5000, description: 'Single day coverage in Asansol' },
    { name: 'Additional Candid Photographer', price: 4000, description: 'Single day in Asansol' }
  ];

  const handleBookPackage = (pkg) => {
    setSelectedPackage(pkg);
    toast.success(`You selected ${pkg.name} package! Please login or register to complete booking.`);
  };

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
              {/* Package Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={serviceImages[idx]?.image_url || ''}
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
                {pkg.highlight && (
                  <div className="absolute top-4 right-4 bg-[#D4AF37] text-black px-4 py-1 text-xs font-bold uppercase tracking-widest">
                    Popular
                  </div>
                )}
              </div>

              {/* Package Content */}
              <div className="p-6">
                <h3 className="font-heading text-2xl font-bold mb-2" data-testid={`package-name-${idx}`}>{pkg.name}</h3>
                <p className="text-sm text-[#A3A3A3] mb-4">{pkg.duration}</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-[#D32F2F]">₹{(pkg.price / 1000).toFixed(0)}k</span>
                  <span className="text-sm text-[#A3A3A3] ml-2">Both Sides</span>
                </div>

                {/* Features */}
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
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-8 text-center" data-testid="addon-services-title">
            Add-On <span className="text-[#D32F2F]">Services</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOns.map((addon, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="bg-[#121212] border border-white/5 p-6 rounded-sm hover:border-[#D32F2F]/30 transition-all duration-300"
                data-testid={`addon-${idx}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading text-lg font-bold flex-1">{addon.name}</h3>
                  <Plus size={20} className="text-[#D4AF37] flex-shrink-0 ml-2" />
                </div>
                <p className="text-sm text-[#A3A3A3] mb-4">{addon.description}</p>
                <p className="text-2xl font-bold text-[#D32F2F]">₹{addon.price.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Terms & Payment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-[#121212] border border-white/5 p-8 rounded-sm"
        >
          <h2 className="font-heading text-2xl font-bold mb-6" data-testid="terms-title">
            Payment Terms & <span className="text-[#D4AF37]">General Details</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-[#A3A3A3]">
            <div>
              <h3 className="text-white font-semibold mb-3">Payment Schedule:</h3>
              <ul className="space-y-2">
                <li>• 15% due upon booking</li>
                <li>• 35% before the wedding day</li>
                <li>• 40% after the event</li>
                <li>• 10% on album delivery</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-3">Delivery Timeline:</h3>
              <ul className="space-y-2">
                <li>• Unedited photos: 7-10 days (online drive)</li>
                <li>• Photo selection: Within 30 days</li>
                <li>• Album delivery: 25-30 days after design approval</li>
                <li>• Minor video changes: Once at no additional cost</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
            <p className="text-sm text-[#A3A3A3]">
              <span className="text-white font-semibold">Note:</span> Client is responsible for crew expenses (food, lodging, travel). Video music must be provided by the client.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
