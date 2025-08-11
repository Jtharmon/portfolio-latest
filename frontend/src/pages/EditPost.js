import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Trash2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import toast from 'react-hot-toast';

function EditPost() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'AI & Machine Learning',
    tags: [],
    featured_image: '',
    published: false,
    blog_secret: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const categories = [
    'AI & Machine Learning',
    'Web Development',
    'Tutorial',
    'Case Study',
    'Technical Deep Dive',
    'Industry Insights',
    'Project Update'
  ];

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'blockquote', 'code-block',
    'list', 'bullet', 'link', 'image'
  ];

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/posts/${id}`);
      // Don't include blog_secret in loaded data for security
      setFormData({ ...response.data, blog_secret: '' });
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Post not found');
      navigate('/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, newTag]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      setUploading(true);
      const response = await axios.post(`${API_URL}/api/upload`, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData(prev => ({
        ...prev,
        featured_image: response.data.url
      }));
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in the title and content');
      return;
    }

    if (!formData.blog_secret.trim()) {
      toast.error('Please enter your blog secret key');
      return;
    }

    try {
      setSaving(true);
      await axios.put(`${API_URL}/api/posts/${id}`, formData);
      
      toast.success('Post updated successfully!');
      navigate(`/blog/${id}`);
    } catch (error) {
      console.error('Error updating post:', error);
      if (error.response?.status === 401) {
        toast.error('Invalid blog secret key');
      } else {
        toast.error('Failed to update post');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    if (!formData.blog_secret.trim()) {
      toast.error('Please enter your blog secret key to delete');
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/posts/${id}?blog_secret=${encodeURIComponent(formData.blog_secret)}`);
      toast.success('Post deleted successfully');
      navigate('/blog');
    } catch (error) {
      console.error('Error deleting post:', error);
      if (error.response?.status === 401) {
        toast.error('Invalid blog secret key');
      } else {
        toast.error('Failed to delete post');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link 
                to={`/blog/${id}`} 
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Post</span>
              </Link>
              <div>
                <h1 className="font-display text-2xl font-bold">
                  Edit Post
                </h1>
                <p className="text-primary-100">Update your content</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !formData.title.trim()}
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Update Post</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Title */}
            <div className="card p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
                Post Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                placeholder="Enter an engaging title..."
              />
            </div>

            {/* Excerpt */}
            <div className="card p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <label htmlFor="excerpt" className="block text-sm font-semibold text-gray-700 mb-3">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                rows={3}
                value={formData.excerpt}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 resize-none"
                placeholder="A brief summary of your post..."
              />
            </div>

            {/* Content Editor */}
            <div className="card p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Content
              </label>
              <div className="prose-editor rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-primary-500 transition-all duration-200">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ height: '400px', marginBottom: '50px' }}
                  placeholder="Start writing your post content here..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Category & Settings */}
            <div className="card p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Post Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="published" className="ml-2 text-sm font-medium text-gray-700">
                    Published
                  </label>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="card p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Featured Image</h3>
              
              {formData.featured_image ? (
                <div className="relative">
                  <img 
                    src={formData.featured_image} 
                    alt="Featured" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, featured_image: '' }))}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                  >
                    {uploading ? (
                      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    ) : (
                      <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    )}
                    <span className="text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload image'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="card p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Tags</h3>
              
              <div className="space-y-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleAddTag}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Type a tag and press Enter"
                />
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 w-4 h-4 text-primary-500 hover:text-primary-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPost;