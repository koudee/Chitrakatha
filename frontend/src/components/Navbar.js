import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show/hide navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHidden(true); // Scrolling down
      } else {
        setHidden(false); // Scrolling up
      }
      
      // Add background when scrolled
      setScrolled(currentScrollY > 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const publicLinks = [
    { path: '/', label: 'Home' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/services', label: 'Services' },
    { path: '/about', label: 'About' },
  ];

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-black/95 backdrop-blur-lg border-b border-white/10 shadow-xl' 
          : 'bg-transparent'
      }`}
      data-testid="navbar"
    >
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group" data-testid="navbar-logo">
            <motion.img 
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              src="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/4h5cyr6c_chitrakotha.png"
              alt="Chitrakatha Logo"
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className="relative group px-6 py-3"
              >
                <span className={`text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-300 ${
                  isActive(link.path)
                    ? 'text-[#D32F2F]'
                    : 'text-white/90 group-hover:text-white'
                }`}>
                  {link.label}
                </span>
                {/* Elegant underline animation */}
                <motion.div
                  className="absolute bottom-2 left-6 right-6 h-[2px] bg-gradient-to-r from-[#D32F2F] to-[#D4AF37]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isActive(link.path) ? 1 : 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ originX: 0 }}
                />
              </Link>
            ))}
            
            {/* Dashboard button for authenticated users - more subtle */}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                data-testid="nav-link-dashboard"
                className={`ml-4 px-6 py-3 rounded-sm border transition-all duration-300 ${
                  isActive('/dashboard')
                    ? 'bg-[#D32F2F] border-[#D32F2F] text-white'
                    : 'border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]'
                }`}
              >
                <span className="text-sm font-medium uppercase tracking-widest">Dashboard</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-sm transition-colors"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden bg-black/95 backdrop-blur-lg rounded-b-lg"
            >
              <div className="py-6 space-y-2 px-4">
                {publicLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
                    className={`block px-4 py-3 rounded-sm text-sm uppercase tracking-widest transition-all duration-300 ${
                      isActive(link.path)
                        ? 'bg-[#D32F2F] text-white'
                        : 'text-white/90 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-nav-link-dashboard"
                    className={`block px-4 py-3 rounded-sm text-sm uppercase tracking-widest transition-all duration-300 ${
                      isActive('/dashboard')
                        ? 'bg-[#D32F2F] text-white'
                        : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
