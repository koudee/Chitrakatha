import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = ({ onAdminLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, loginData);
      toast.success('Admin login successful!');
      onAdminLogin(response.data.token, response.data.user);
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 md:px-8 flex items-center justify-center">
      <div className="container mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-[#121212] border-2 border-[#D32F2F] rounded-sm p-8"
        >
          <div className="flex items-center justify-center mb-6">
            <ShieldAlert size={48} className="text-[#D32F2F]" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 text-center" data-testid="admin-login-title">
            Admin Access
          </h1>
          <p className="text-[#A3A3A3] text-center mb-8">
            Login with administrator credentials
          </p>

          <form onSubmit={handleAdminLogin} data-testid="admin-login-form">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#E5E5E5] mb-2" htmlFor="admin-email">
                Admin Email
              </label>
              <input
                type="email"
                id="admin-email"
                data-testid="admin-email-input"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-[#D32F2F] transition-colors"
                placeholder="admin@chitrakatha.com"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#E5E5E5] mb-2" htmlFor="admin-password">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password"
                  data-testid="admin-password-input"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-[#D32F2F] transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="toggle-admin-password"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A3A3A3] hover:text-white"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              data-testid="admin-login-button"
              disabled={loading}
              className="w-full bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-8 py-3 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Admin Login'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-[#D32F2F]/10 border border-[#D32F2F]/30 rounded-sm">
            <p className="text-xs text-[#A3A3A3] text-center">
              <span className="text-[#D32F2F] font-semibold">Default credentials:</span><br />
              Email: admin@chitrakatha.com<br />
              Password: admin123
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
