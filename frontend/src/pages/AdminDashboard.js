import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  ShieldCheck, 
  Image as ImageIcon, 
  Trash2, 
  Plus,
  Upload,
  Home,
  Briefcase,
  Info
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryItems, setGalleryItems] = useState([]);
  const [siteImages, setSiteImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newImage, setNewImage] = useState({
    title: '',
    category: 'Wedding',
    media_url: '',
    media_type: 'photo'
  });
  const [newSiteImage, setNewSiteImage] = useState({
    section: 'hero',
    image_url: '',
    alt_text: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [galleryRes, siteImagesRes] = await Promise.all([
        axios.get(`${API}/admin/gallery`, { headers }),
        axios.get(`${API}/admin/site-images`, { headers })
      ]);

      setGalleryItems(galleryRes.data);
      setSiteImages(siteImagesRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGalleryImage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.post(`${API}/admin/gallery`, newImage, { headers });
      toast.success('Gallery image added successfully');
      setNewImage({ title: '', category: 'Wedding', media_url: '', media_type: 'photo' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add gallery image');
    }
  };

  const handleDeleteGalleryImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.delete(`${API}/admin/gallery/${id}`, { headers });
      toast.success('Gallery image deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const handleAddSiteImage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.post(`${API}/admin/site-images`, newSiteImage, { headers });
      toast.success('Site image added successfully');
      setNewSiteImage({ section: 'hero', image_url: '', alt_text: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to add site image');
    }
  };

  const handleDeleteSiteImage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this site image?')) return;

    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.delete(`${API}/admin/site-images/${id}`, { headers });
      toast.success('Site image deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete site image');
    }
  };

  const tabs = [
    { id: 'gallery', label: 'Gallery Management', icon: ImageIcon },
    { id: 'site-images', label: 'Site Images', icon: Home }
  ];

  const getSectionIcon = (section) => {
    switch(section) {
      case 'hero': return <Home size={16} />;
      case 'services': return <Briefcase size={16} />;
      case 'about': return <Info size={16} />;
      default: return <ImageIcon size={16} />;
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <ShieldCheck size={32} className="text-[#D32F2F]" />
              <h1 className="font-heading text-3xl md:text-4xl font-bold" data-testid="admin-dashboard-title">
                Admin <span className="text-[#D32F2F]">Dashboard</span>
              </h1>
            </div>
            <p className="text-[#A3A3A3]">Manage gallery and site images</p>
          </div>
          <button
            onClick={onLogout}
            data-testid="admin-logout-button"
            className="bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-6 py-2 font-medium transition-all duration-300"
          >
            Logout
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-testid={`admin-tab-${tab.id}`}
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

        {loading ? (
          <div className="text-center py-20" data-testid="admin-loading">
            <p className="text-[#A3A3A3]">Loading...</p>
          </div>
        ) : (
          <div>
            {/* Gallery Management Tab */}
            {activeTab === 'gallery' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Add New Image Form */}
                <div className="bg-[#121212] border border-white/10 p-6 rounded-sm mb-8">
                  <h2 className="font-heading text-2xl font-bold mb-4 flex items-center space-x-2">
                    <Plus size={24} className="text-[#D32F2F]" />
                    <span>Add New Gallery Image</span>
                  </h2>
                  <form onSubmit={handleAddGalleryImage} className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Title</label>
                      <input
                        type="text"
                        value={newImage.title}
                        onChange={(e) => setNewImage({...newImage, title: e.target.value})}
                        className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-sm"
                        required
                        data-testid="gallery-title-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Category</label>
                      <select
                        value={newImage.category}
                        onChange={(e) => setNewImage({...newImage, category: e.target.value})}
                        className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-sm"
                        data-testid="gallery-category-select"
                      >
                        <option>Wedding</option>
                        <option>Pre-Wedding</option>
                        <option>Portrait</option>
                        <option>Event</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Image URL</label>
                      <input
                        type="url"
                        value={newImage.media_url}
                        onChange={(e) => setNewImage({...newImage, media_url: e.target.value})}
                        className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-sm"
                        placeholder="https://..."
                        required
                        data-testid="gallery-url-input"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        data-testid="add-gallery-image-button"
                        className="bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-6 py-2 font-medium transition-all duration-300 flex items-center space-x-2"
                      >
                        <Upload size={18} />
                        <span>Add Image</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Gallery Items Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  {galleryItems.map((item, idx) => (
                    <div 
                      key={item.id}
                      className="bg-[#121212] border border-white/10 rounded-sm overflow-hidden group"
                      data-testid={`gallery-item-${idx}`}
                    >
                      <div className="relative h-48">
                        <img
                          src={item.media_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={() => handleDeleteGalleryImage(item.id)}
                            data-testid={`delete-gallery-${idx}`}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-sm transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-[#D4AF37]">{item.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Site Images Tab */}
            {activeTab === 'site-images' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Add Site Image Form */}
                <div className="bg-[#121212] border border-white/10 p-6 rounded-sm mb-8">
                  <h2 className="font-heading text-2xl font-bold mb-4 flex items-center space-x-2">
                    <Plus size={24} className="text-[#D32F2F]" />
                    <span>Add Site Image</span>
                  </h2>
                  <form onSubmit={handleAddSiteImage} className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Section</label>
                      <select
                        value={newSiteImage.section}
                        onChange={(e) => setNewSiteImage({...newSiteImage, section: e.target.value})}
                        className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-sm"
                        data-testid="site-section-select"
                      >
                        <option value="hero">Hero</option>
                        <option value="featured">Featured</option>
                        <option value="services">Services</option>
                        <option value="about">About</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Alt Text</label>
                      <input
                        type="text"
                        value={newSiteImage.alt_text}
                        onChange={(e) => setNewSiteImage({...newSiteImage, alt_text: e.target.value})}
                        className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-sm"
                        placeholder="Image description"
                        data-testid="site-alt-input"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Image URL</label>
                      <input
                        type="url"
                        value={newSiteImage.image_url}
                        onChange={(e) => setNewSiteImage({...newSiteImage, image_url: e.target.value})}
                        className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-sm"
                        placeholder="https://..."
                        required
                        data-testid="site-url-input"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="submit"
                        data-testid="add-site-image-button"
                        className="bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-6 py-2 font-medium transition-all duration-300 flex items-center space-x-2"
                      >
                        <Upload size={18} />
                        <span>Add Site Image</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Site Images by Section */}
                {['hero', 'featured', 'services', 'about'].map((section) => (
                  <div key={section} className="mb-8">
                    <h3 className="font-heading text-xl font-bold mb-4 flex items-center space-x-2 capitalize">
                      {getSectionIcon(section)}
                      <span>{section} Images</span>
                    </h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      {siteImages
                        .filter(img => img.section === section)
                        .sort((a, b) => a.order - b.order)
                        .map((img, idx) => (
                        <div 
                          key={img.id}
                          className="bg-[#121212] border border-white/10 rounded-sm overflow-hidden"
                          data-testid={`site-image-${section}-${idx}`}
                        >
                          <div className="relative h-32">
                            <img
                              src={img.image_url}
                              alt={img.alt_text}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => handleDeleteSiteImage(img.id)}
                              data-testid={`delete-site-${section}-${idx}`}
                              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="p-2">
                            <p className="text-xs text-[#A3A3A3] truncate">{img.alt_text || 'No description'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
