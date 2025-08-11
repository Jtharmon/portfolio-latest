import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X, Plus, ExternalLink, Github } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import toast from 'react-hot-toast';

function CreateProject() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    technologies: [],
    demo_url: '',
    github_url: '',
    image_url: '',
    featured: false,
    blog_secret: ''
  });
  const [techInput, setTechInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const popularTechnologies = [
    'Python', 'JavaScript', 'React', 'Node.js', 'TensorFlow', 'PyTorch',
    'OpenAI', 'FastAPI', 'MongoDB', 'PostgreSQL', 'Docker', 'AWS',
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision'
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

  const handleAddTechnology = (tech) => {
    if (tech && !formData.technologies.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech]
      }));
    }
    setTechInput('');
  };

  const handleAddTechFromInput = (e) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      handleAddTechnology(techInput.trim());
    }
  };

  const handleRemoveTechnology = (techToRemove) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(tech => tech !== techToRemove)
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
        image_url: response.data.url
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
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in the title and description');
      return;
    }

    if (!formData.blog_secret.trim()) {
      toast.error('Please enter your blog secret key');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/projects`, formData);
      
      toast.success('Project created successfully!');
      navigate(`/projects/${response.data.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      if (error.response?.status === 401) {
        toast.error('Invalid blog secret key');
      } else {
        toast.error('Failed to create project');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link 
                to="/projects" 
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Projects</span>
              </Link>
              <div>
                <h1 className="font-display text-2xl font-bold">
                  Create New AI Project
                </h1>
                <p className="text-purple-100">Showcase your latest innovation</p>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.title.trim()}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Create Project</span>
            </button>
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
                Project Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-4 text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                placeholder="Enter a compelling project title..."
              />
            </div>

            {/* Description */}
            <div className="card p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 resize-none"
                placeholder="A concise description of your project..."
              />
            </div>

            {/* Detailed Content */}
            <div className="card p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Detailed Content (Optional)
              </label>
              <div className="prose-editor rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-purple-500 transition-all duration-200">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  style={{ height: '300px', marginBottom: '50px' }}
                  placeholder="Add detailed project information, implementation details, challenges overcome..."
                />
              </div>
            </div>

            {/* Technologies */}
            <div className="card p-8 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Technologies Used
              </label>
              
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={handleAddTechFromInput}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Type a technology and press Enter"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTechnology(techInput)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Popular Technologies:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularTechnologies.map((tech) => (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => handleAddTechnology(tech)}
                        disabled={formData.technologies.includes(tech)}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          formData.technologies.includes(tech)
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-300'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.technologies.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-700 mb-2 font-medium">Selected Technologies:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => handleRemoveTechnology(tech)}
                            className="ml-2 w-4 h-4 text-purple-500 hover:text-purple-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Project Settings */}
            <div className="card p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Project Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="blog_secret" className="block text-sm font-medium text-gray-700 mb-2">
                    Blog Secret Key *
                  </label>
                  <input
                    type="password"
                    id="blog_secret"
                    name="blog_secret"
                    required
                    value={formData.blog_secret}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter your blog secret"
                  />
                  <p className="text-xs text-gray-500 mt-1">This protects your blog from unauthorized projects</p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                    Featured Project
                  </label>
                </div>
              </div>
            </div>

            {/* Project Image */}
            <div className="card p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Project Image</h3>
              
              {formData.image_url ? (
                <div className="relative">
                  <img 
                    src={formData.image_url} 
                    alt="Project" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
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
                      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-2"></div>
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

            {/* Project Links */}
            <div className="card p-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="font-semibold text-gray-900 mb-4">Project Links</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="demo_url" className="block text-sm font-medium text-gray-700 mb-2">
                    <ExternalLink className="w-4 h-4 inline mr-1" />
                    Demo URL
                  </label>
                  <input
                    type="url"
                    id="demo_url"
                    name="demo_url"
                    value={formData.demo_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://your-demo-site.com"
                  />
                </div>

                <div>
                  <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-2">
                    <Github className="w-4 h-4 inline mr-1" />
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    id="github_url"
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateProject;