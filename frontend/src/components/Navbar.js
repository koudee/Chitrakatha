import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ isAuthenticated, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const publicLinks = [
    { path: '/', label: 'Home' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/services', label: 'Services' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/50 border-b border-white/5">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3" data-testid="navbar-logo">
            <img 
              src="https://customer-assets.emergentagent.com/job_084c5691-4eb2-4ffe-b321-0ad44c35e91c/artifacts/tkvjrxz5_WhatsApp%20Image%202026-02-18%20at%202.55.27%20PM.jpeg"
              alt="Chitrakatha Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-link-${link.label.toLowerCase()}`}
                className={`text-sm uppercase tracking-widest transition-colors duration-300 ${
                  isActive(link.path)
                    ? 'text-[#D32F2F]'
                    : 'text-white hover:text-[#D32F2F]'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  data-testid="nav-link-dashboard"
                  className={`text-sm uppercase tracking-widest transition-colors duration-300 ${
                    isActive('/dashboard')
                      ? 'text-[#D32F2F]'
                      : 'text-white hover:text-[#D32F2F]'
                  }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={onLogout}
                  data-testid="logout-button"
                  className="flex items-center space-x-2 text-sm uppercase tracking-widest text-white hover:text-[#D32F2F] transition-colors duration-300"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                data-testid="nav-link-login"
                className="bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-6 py-2 font-medium transition-all duration-300 text-sm uppercase tracking-widest"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-toggle"
            className="md:hidden text-white p-2"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-4">
                {publicLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-link-${link.label.toLowerCase()}`}
                    className={`block text-sm uppercase tracking-widest transition-colors duration-300 ${
                      isActive(link.path)
                        ? 'text-[#D32F2F]'
                        : 'text-white hover:text-[#D32F2F]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-nav-link-dashboard"
                      className={`block text-sm uppercase tracking-widest transition-colors duration-300 ${
                        isActive('/dashboard')
                          ? 'text-[#D32F2F]'
                          : 'text-white hover:text-[#D32F2F]'
                      }`}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        onLogout();
                        setMobileMenuOpen(false);
                      }}
                      data-testid="mobile-logout-button"
                      className="flex items-center space-x-2 text-sm uppercase tracking-widest text-white hover:text-[#D32F2F] transition-colors duration-300"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-nav-link-login"
                    className="inline-block bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-6 py-2 font-medium transition-all duration-300 text-sm uppercase tracking-widest"
                  >
                    Login
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
