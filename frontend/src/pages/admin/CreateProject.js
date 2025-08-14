import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload, X, Plus, ExternalLink, Github } from 'lucide-react';
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
    featured: false
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
    'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision',
    'LangChain', 'Streamlit', 'Jupyter', 'Pandas', 'NumPy', 'Scikit-learn'
  ];

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'script', 'blockquote', 'code-block',
    'list', 'bullet', 'indent', 'align', 'link', 'image', 'video'
  ];

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

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/projects`, formData);
      
      toast.success('Project created successfully!');
      navigate('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link 
                to="/admin/projects" 
                className="btn-ghost"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Link>
              <h1 className="font-display text-xl font-bold text-gray-900">
                Create New AI Project
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.title.trim()}
                className="btn-primary"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Create Project
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="card p-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="form-input text-lg font-semibold"
                placeholder="Enter a compelling project title..."
              />
            </div>

            {/* Description */}
            <div className="card p-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="A concise description of your project (used in project listings)..."
              />
            </div>

            {/* Detailed Content */}
            <div className="card p-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Detailed Content
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Add detailed information about your project including features, implementation details, challenges, and outcomes.
              </p>
              <div className="prose-editor">
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  formats={quillFormats}
                  style={{ height: '400px', marginBottom: '50px' }}
                  placeholder="Detailed project content with features, implementation, challenges, and outcomes..."
                />
              </div>
            </div>

            {/* Technologies */}
            <div className="card p-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Technologies Used
              </label>
              
              <div className="space-y-4">
                {/* Add Technology Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={handleAddTechFromInput}
                    className="form-input flex-1"
                    placeholder="Type a technology and press Enter"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTechnology(techInput)}
                    className="btn-secondary"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Popular Technologies */}
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
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {tech}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Technologies */}
                {formData.technologies.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-700 mb-2 font-medium">Selected Technologies:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => handleRemoveTechnology(tech)}
                            className="ml-2 w-4 h-4 text-primary-500 hover:text-primary-700"
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
          <div className="space-y-6">
            {/* Project Settings */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Project Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700">
                    Featured Project
                  </label>
                </div>
              </div>
            </div>

            {/* Project Image */}
            <div className="card p-6">
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

            {/* Project Links */}
            <div className="card p-6">
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
                    className="form-input"
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
                    className="form-input"
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">💡 Tips for Great Projects</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Include screenshots or demos</li>
                <li>• Explain the problem you solved</li>
                <li>• Highlight technical challenges</li>
                <li>• Share lessons learned</li>
                <li>• Add links to live demos</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProject;