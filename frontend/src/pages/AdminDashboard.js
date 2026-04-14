import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
  Info,
  X,
  GripVertical,
  Eye
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('gallery');
  const [galleryItems, setGalleryItems] = useState([]);
  const [siteImages, setSiteImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  
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

      setGalleryItems(galleryRes.data.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setSiteImages(siteImagesRes.data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, isGallery = true) => {
    setUploadingFile(true);
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/admin/upload-image`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000
      });

      const imageUrl = response.data.image_url;
      
      if (isGallery) {
        setNewImage({ ...newImage, media_url: imageUrl });
      } else {
        setNewSiteImage({ ...newSiteImage, image_url: imageUrl });
      }
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleBatchUpload = async (files, category) => {
    if (!files || files.length === 0) return;
    
    setBatchUploading(true);
    setBatchProgress({ current: 0, total: files.length });
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      setBatchProgress({ current: i + 1, total: files.length });
      try {
        const formData = new FormData();
        formData.append('file', files[i]);

        const uploadRes = await axios.post(`${API}/admin/upload-image`, formData, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
          timeout: 120000
        });

        const fileName = files[i].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        await axios.post(`${API}/admin/gallery`, {
          title: fileName,
          category: category,
          media_url: uploadRes.data.image_url,
          media_type: 'photo',
          order: galleryItems.length + i
        }, { headers });

        successCount++;
      } catch (error) {
        console.error(`Failed to upload ${files[i].name}:`, error);
        toast.error(`Failed: ${files[i].name}`);
      }
    }

    setBatchUploading(false);
    setBatchProgress({ current: 0, total: 0 });
    
    if (successCount > 0) {
      toast.success(`${successCount} of ${files.length} images uploaded to ${category}`);
      fetchData();
    }
  };

  const handleBatchUrlUpload = async (urlsText, category) => {
    const urls = urlsText.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    if (urls.length === 0) {
      toast.error('Please enter at least one URL');
      return;
    }

    setBatchUploading(true);
    setBatchProgress({ current: 0, total: urls.length });
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };
    let successCount = 0;

    for (let i = 0; i < urls.length; i++) {
      setBatchProgress({ current: i + 1, total: urls.length });
      try {
        const urlParts = urls[i].split('/');
        const fileName = decodeURIComponent(urlParts[urlParts.length - 1]).replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        
        await axios.post(`${API}/admin/gallery`, {
          title: fileName || `Image ${i + 1}`,
          category: category,
          media_url: urls[i],
          media_type: 'photo',
          order: galleryItems.length + i
        }, { headers });

        successCount++;
      } catch (error) {
        console.error(`Failed to add URL ${i + 1}:`, error);
        toast.error(`Failed URL ${i + 1}`);
      }
    }

    setBatchUploading(false);
    setBatchProgress({ current: 0, total: 0 });

    if (successCount > 0) {
      toast.success(`${successCount} of ${urls.length} images added to ${category}`);
      fetchData();
    }
  };

  const handleAddGalleryImage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.post(`${API}/admin/gallery`, {
        ...newImage,
        order: galleryItems.length
      }, { headers });
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

  const handleGalleryDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(galleryItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    setGalleryItems(updatedItems);

    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.put(`${API}/admin/gallery/reorder`, {
        items: updatedItems.map(item => ({ id: item.id, order: item.order }))
      }, { headers });
      toast.success('Gallery reordered');
    } catch (error) {
      toast.error('Failed to save order');
      fetchData();
    }
  };

  const handleAddSiteImage = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const sectionImages = siteImages.filter(img => img.section === newSiteImage.section);
      await axios.post(`${API}/admin/site-images`, {
        ...newSiteImage,
        order: sectionImages.length
      }, { headers });
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

  const handleSiteImagesDragEnd = async (result, section) => {
    if (!result.destination) return;

    const sectionImages = siteImages.filter(img => img.section === section);
    const items = Array.from(sectionImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    const newSiteImages = [
      ...siteImages.filter(img => img.section !== section),
      ...updatedItems
    ].sort((a, b) => (a.order || 0) - (b.order || 0));

    setSiteImages(newSiteImages);

    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      await axios.put(`${API}/admin/site-images/reorder`, {
        items: updatedItems.map(item => ({ id: item.id, order: item.order }))
      }, { headers });
      toast.success('Images reordered');
    } catch (error) {
      toast.error('Failed to save order');
      fetchData();
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
            <p className="text-[#A3A3A3]">Manage gallery and site images with drag & drop, file upload, and preview</p>
          </div>
          <button
            onClick={onLogout}
            data-testid="admin-logout-button"
            className="bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-6 py-2 font-medium transition-all duration-300"
          >
            Logout
          </button>
        </motion.div>

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
            {activeTab === 'gallery' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-[#121212] border border-white/10 p-6 rounded-sm mb-8">
                  <h2 className="font-heading text-2xl font-bold mb-4 flex items-center space-x-2">
                    <Plus size={24} className="text-[#D32F2F]" />
                    <span>Add New Gallery Image</span>
                  </h2>
                  <form onSubmit={handleAddGalleryImage} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
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
                          <option>Kids</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-[#E5E5E5] mb-2">
                        Upload Image File
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleFileUpload(e.target.files[0], true);
                              }
                            }}
                            className="hidden"
                          />
                          <div className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-sm cursor-pointer hover:bg-[#2A2A2A] transition-colors flex items-center justify-center space-x-2">
                            <Upload size={18} />
                            <span>{uploadingFile ? 'Uploading...' : 'Choose Image'}</span>
                          </div>
                        </label>
                        {newImage.media_url && (
                          <button
                            type="button"
                            onClick={() => setPreviewImage(newImage.media_url)}
                            className="bg-[#D4AF37] text-black hover:bg-[#C5A028] rounded-sm px-4 py-2 transition-colors flex items-center space-x-2"
                          >
                            <Eye size={18} />
                            <span>Preview</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Or Enter Image URL</label>
                      <input
                        type="url"
                        value={newImage.media_url}
                        onChange={(e) => setNewImage({...newImage, media_url: e.target.value})}
                        className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-2 rounded-sm"
                        placeholder="https://..."
                        data-testid="gallery-url-input"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={!newImage.media_url || uploadingFile}
                      data-testid="add-gallery-image-button"
                      className="bg-[#D32F2F] text-white hover:bg-[#B71C1C] rounded-sm px-6 py-2 font-medium transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload size={18} />
                      <span>Add Image</span>
                    </button>
                  </form>
                </div>

                {/* Batch Upload Section */}
                <div className="bg-[#121212] border border-[#D4AF37]/20 p-6 rounded-xl mb-8">
                  <h2 className="font-heading text-2xl font-bold mb-2 flex items-center space-x-2">
                    <Upload size={24} className="text-[#D4AF37]" />
                    <span>Batch Upload Multiple Images</span>
                  </h2>
                  <p className="text-sm text-[#A3A3A3] mb-4">Upload images of any size (auto-compressed) or paste image URLs — one per line</p>
                  
                  <div className="grid md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Category</label>
                      <select
                        id="batch-category"
                        defaultValue="Wedding"
                        className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-lg"
                        data-testid="batch-category-select"
                      >
                        <option>Wedding</option>
                        <option>Pre-Wedding</option>
                        <option>Portrait</option>
                        <option>Kids</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Upload Files</label>
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              const category = document.getElementById('batch-category').value;
                              handleBatchUpload(Array.from(e.target.files), category);
                              e.target.value = '';
                            }
                          }}
                          className="hidden"
                          data-testid="batch-upload-input"
                          disabled={batchUploading}
                        />
                        <div className={`w-full btn-outline-gold text-center py-3 cursor-pointer flex items-center justify-center space-x-2 ${batchUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          <Upload size={18} />
                          <span>{batchUploading ? `Uploading ${batchProgress.current}/${batchProgress.total}...` : 'Choose Files'}</span>
                        </div>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#E5E5E5] mb-2">Or Add by URLs</label>
                      <button
                        type="button"
                        onClick={() => {
                          const urls = document.getElementById('batch-urls').value;
                          const category = document.getElementById('batch-category').value;
                          handleBatchUrlUpload(urls, category);
                          document.getElementById('batch-urls').value = '';
                        }}
                        disabled={batchUploading}
                        className="w-full btn-primary-red py-3 flex items-center justify-center space-x-2 disabled:opacity-50"
                        data-testid="batch-url-upload-btn"
                      >
                        <Plus size={18} />
                        <span>Add URLs to Gallery</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <textarea
                      id="batch-urls"
                      rows={3}
                      placeholder="Paste image URLs here — one per line&#10;https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                      className="w-full bg-[#1A1A1A] border border-white/10 text-white px-4 py-3 rounded-lg text-sm placeholder-[#666] resize-none"
                      data-testid="batch-urls-input"
                    />
                  </div>

                  {batchUploading && (
                    <div className="mt-4">
                      <div className="w-full bg-[#1A1A1A] rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#D32F2F] to-[#D4AF37] transition-all duration-300 rounded-full"
                          style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm text-[#D4AF37] mt-2">{batchProgress.current} of {batchProgress.total} images processed</p>
                    </div>
                  )}
                </div>

                <div className="mb-4 flex items-center space-x-2 text-[#D4AF37]">
                  <GripVertical size={20} />
                  <p className="text-sm font-medium">Drag images to reorder</p>
                </div>

                <DragDropContext onDragEnd={handleGalleryDragEnd}>
                  <Droppable droppableId="gallery">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid md:grid-cols-3 gap-6"
                      >
                        {galleryItems.map((item, idx) => (
                          <Draggable key={item.id} draggableId={item.id} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-[#121212] border border-white/10 rounded-sm overflow-hidden transition-all ${
                                  snapshot.isDragging ? 'shadow-2xl shadow-[#D32F2F]/50 scale-105 rotate-2' : ''
                                }`}
                                data-testid={`gallery-item-${idx}`}
                              >
                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                  <div className="relative h-48">
                                    <img
                                      src={item.media_url}
                                      alt={item.title}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded-sm flex items-center space-x-1">
                                      <GripVertical size={14} className="text-[#D4AF37]" />
                                      <span className="text-xs text-white font-bold">#{idx + 1}</span>
                                    </div>
                                    <div className="absolute top-2 right-2 flex space-x-2">
                                      <button
                                        onClick={() => setPreviewImage(item.media_url)}
                                        className="bg-[#D4AF37] hover:bg-[#C5A028] text-black p-2 rounded-sm transition-colors"
                                      >
                                        <Eye size={16} />
                                      </button>
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
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </motion.div>
            )}

            {activeTab === 'site-images' && (
              <p className="text-center text-[#A3A3A3] py-10">Site images management - similar interface as gallery</p>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
            data-testid="preview-modal"
          >
            <button
              onClick={() => setPreviewImage(null)}
              data-testid="close-preview"
              className="absolute top-4 right-4 text-white hover:text-[#D32F2F] transition-colors"
            >
              <X size={32} />
            </button>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto max-h-[80vh] object-contain rounded-sm"
              />
              <div className="mt-4 text-center">
                <p className="text-[#D4AF37] text-sm">Click outside to close preview</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
