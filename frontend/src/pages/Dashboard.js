import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Calendar, 
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  Package
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [projects, setProjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [overviewRes, projectsRes, bookingsRes] = await Promise.all([
        axios.get(`${API}/dashboard/overview`, { headers }),
        axios.get(`${API}/projects`, { headers }),
        axios.get(`${API}/bookings`, { headers })
      ]);

      setOverview(overviewRes.data);
      setProjects(projectsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2" data-testid="dashboard-title">
            Welcome back, <span className="text-[#D4AF37]">{user?.name || 'User'}</span>
          </h1>
          <p className="text-[#A3A3A3]">Manage your bookings, projects, and account settings</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`tab-${tab.id}`}
                className={`flex items-center space-x-2 px-4 py-2 rounded-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-[#D32F2F] text-white'
                    : 'text-[#A3A3A3] hover:text-white hover:bg-[#1A1A1A]'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20" data-testid="dashboard-loading">
            <p className="text-[#A3A3A3]">Loading dashboard...</p>
          </div>
        ) : (
          <div>
            {/* Overview Tab */}
            {activeTab === 'overview' && overview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { 
                      icon: FolderOpen, 
                      label: 'Total Projects', 
                      value: overview.total_projects,
                      color: '#D32F2F'
                    },
                    { 
                      icon: Package, 
                      label: 'Active Bookings', 
                      value: overview.active_bookings,
                      color: '#D4AF37'
                    },
                    { 
                      icon: CheckCircle, 
                      label: 'Completed', 
                      value: overview.completed_projects,
                      color: '#10B981'
                    },
                    { 
                      icon: Clock, 
                      label: 'Upcoming Events', 
                      value: overview.upcoming_events,
                      color: '#3B82F6'
                    }
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="bg-[#121212] border border-white/10 p-6 rounded-sm"
                      data-testid={`stat-card-${idx}`}
                    >
                      <stat.icon size={32} style={{ color: stat.color }} className="mb-3" />
                      <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                      <p className="text-sm text-[#A3A3A3]">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-[#121212] border border-white/10 p-6 rounded-sm">
                  <h2 className="font-heading text-2xl font-bold mb-4" data-testid="recent-activity-title">
                    Recent <span className="text-[#D32F2F]">Activity</span>
                  </h2>
                  {projects.length === 0 && bookings.length === 0 ? (
                    <p className="text-[#A3A3A3] text-center py-8" data-testid="no-activity">
                      No recent activity. Start by booking a package!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {projects.slice(0, 3).map((project, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-4 bg-[#1A1A1A] rounded-sm"
                          data-testid={`recent-project-${idx}`}
                        >
                          <div>
                            <p className="font-semibold text-white">{project.title}</p>
                            <p className="text-sm text-[#A3A3A3]">{project.package_type} Package</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            project.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                            project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-heading text-2xl font-bold mb-6" data-testid="projects-title">
                  Your <span className="text-[#D4AF37]">Projects</span>
                </h2>
                {projects.length === 0 ? (
                  <div className="bg-[#121212] border border-white/10 p-12 rounded-sm text-center" data-testid="no-projects">
                    <FolderOpen size={48} className="text-[#A3A3A3] mx-auto mb-4" />
                    <p className="text-[#A3A3A3] mb-4">No projects yet</p>
                    <p className="text-sm text-[#737373]">Your projects will appear here once you book a package</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {projects.map((project, idx) => (
                      <div 
                        key={idx}
                        className="bg-[#121212] border border-white/10 p-6 rounded-sm hover:border-[#D32F2F]/30 transition-all duration-300"
                        data-testid={`project-card-${idx}`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-heading text-xl font-bold mb-1">{project.title}</h3>
                            <p className="text-sm text-[#A3A3A3]">{project.event_type}</p>
                          </div>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            project.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                            project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <p className="text-[#A3A3A3]">
                            <span className="text-white">Package:</span> {project.package_type}
                          </p>
                          <p className="text-[#A3A3A3]">
                            <span className="text-white">Event Date:</span> {new Date(project.event_date).toLocaleDateString()}
                          </p>
                          <div className="flex space-x-4 mt-3 pt-3 border-t border-white/10">
                            <div>
                              <p className="text-xs text-[#A3A3A3]">Photos</p>
                              <p className="text-lg font-bold text-[#D32F2F]">{project.photos_count}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[#A3A3A3]">Videos</p>
                              <p className="text-lg font-bold text-[#D4AF37]">{project.videos_count}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-heading text-2xl font-bold mb-6" data-testid="bookings-title">
                  Your <span className="text-[#D32F2F]">Bookings</span>
                </h2>
                {bookings.length === 0 ? (
                  <div className="bg-[#121212] border border-white/10 p-12 rounded-sm text-center" data-testid="no-bookings">
                    <Calendar size={48} className="text-[#A3A3A3] mx-auto mb-4" />
                    <p className="text-[#A3A3A3] mb-4">No bookings yet</p>
                    <p className="text-sm text-[#737373]">Visit our Services page to book a package</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking, idx) => (
                      <div 
                        key={idx}
                        className="bg-[#121212] border border-white/10 p-6 rounded-sm"
                        data-testid={`booking-card-${idx}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div className="mb-4 md:mb-0">
                            <h3 className="font-heading text-xl font-bold mb-2">{booking.package_name}</h3>
                            <p className="text-2xl font-bold text-[#D32F2F] mb-2">₹{booking.package_price.toLocaleString()}</p>
                            <p className="text-sm text-[#A3A3A3]">
                              Event Date: {new Date(booking.event_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <span className={`text-xs px-3 py-1 rounded-full text-center ${
                              booking.status === 'Confirmed' ? 'bg-green-500/20 text-green-500' :
                              booking.status === 'Cancelled' ? 'bg-red-500/20 text-red-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              {booking.status}
                            </span>
                            <span className={`text-xs px-3 py-1 rounded-full text-center ${
                              booking.payment_status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                              booking.payment_status === 'Advance Paid' ? 'bg-blue-500/20 text-blue-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }`}>
                              Payment: {booking.payment_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-heading text-2xl font-bold mb-6" data-testid="settings-title">
                  Account <span className="text-[#D4AF37]">Settings</span>
                </h2>
                <div className="bg-[#121212] border border-white/10 p-6 rounded-sm">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#A3A3A3] mb-2">Name</label>
                      <p className="text-white font-medium">{user?.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#A3A3A3] mb-2">Email</label>
                      <p className="text-white font-medium">{user?.email}</p>
                    </div>
                    {user?.phone && (
                      <div>
                        <label className="block text-sm font-medium text-[#A3A3A3] mb-2">Phone</label>
                        <p className="text-white font-medium">{user.phone}</p>
                      </div>
                    )}
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-sm text-[#A3A3A3] mb-4">Account settings and profile updates coming soon.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
