import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      toast.success('Login successful!');
      onLogin(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      toast.success('Registration successful!');
      onLogin(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
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
          className="bg-[#121212] border border-white/10 rounded-sm p-8"
        >
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2 text-center" data-testid="login-title">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-[#A3A3A3] text-center mb-8">
            {isLogin ? 'Login to access your dashboard' : 'Register to book your package'}
          </p>

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} data-testid="login-form">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#E5E5E5] mb-2" htmlFor="login-email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="login-email"
                  data-testid="login-email-input"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-[#D32F2F] transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#E5E5E5] mb-2" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    data-testid="login-password-input"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-[#D32F2F] transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="toggle-password-visibility"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A3A3A3] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                data-testid="login-submit-button"
                disabled={loading}
                className="w-full bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-8 py-3 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} data-testid="register-form">
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#E5E5E5] mb-2" htmlFor="register-name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="register-name"
                  data-testid="register-name-input"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-[#D32F2F] transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#E5E5E5] mb-2" htmlFor="register-email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="register-email"
                  data-testid="register-email-input"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-[#D32F2F] transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-[#E5E5E5] mb-2" htmlFor="register-phone">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="register-phone"
                  data-testid="register-phone-input"
                  value={registerData.phone}
                  onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-[#D32F2F] transition-colors"
                  placeholder="+91 1234567890"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[#E5E5E5] mb-2" htmlFor="register-password">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="register-password"
                    data-testid="register-password-input"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-sm focus:outline-none focus:border-[#D32F2F] transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A3A3A3] hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                data-testid="register-submit-button"
                disabled={loading}
                className="w-full bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-8 py-3 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Toggle Between Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-[#A3A3A3]">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                data-testid="toggle-auth-mode"
                className="ml-2 text-[#D32F2F] hover:text-[#B71C1C] font-medium transition-colors"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
