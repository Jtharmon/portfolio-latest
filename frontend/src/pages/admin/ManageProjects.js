import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  StarOff,
  Calendar,
  MoreVertical,
  ExternalLink,
  Github
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function ManageProjects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, featuredFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/projects?limit=100`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Featured filter
    if (featuredFilter !== 'all') {
      filtered = filtered.filter(project => 
        featuredFilter === 'featured' ? project.featured : !project.featured
      );
    }

    setFilteredProjects(filtered);
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/projects/${projectId}`);
      setProjects(projects.filter(project => project.id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleToggleFeatured = async (project) => {
    try {
      const updatedProject = { ...project, featured: !project.featured };
      await axios.put(`${API_URL}/api/projects/${project.id}`, updatedProject);
      
      setProjects(projects.map(p => p.id === project.id ? { ...p, featured: !p.featured } : p));
      toast.success(`Project ${updatedProject.featured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProjects.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedProjects.length} project(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(selectedProjects.map(projectId => 
        axios.delete(`${API_URL}/api/projects/${projectId}`)
      ));
      
      setProjects(projects.filter(project => !selectedProjects.includes(project.id)));
      setSelectedProjects([]);
      toast.success(`${selectedProjects.length} project(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting projects:', error);
      toast.error('Failed to delete some projects');
    }
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProjects.length === filteredProjects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(filteredProjects.map(project => project.id));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="loading-skeleton h-8 w-64 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="loading-skeleton h-24"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-display text-2xl font-bold text-gray-900">
                Manage AI Projects
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProjects.length} of {projects.length} projects
              </p>
            </div>
            <Link to="/admin/projects/create" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input"
              />
            </div>

            {/* Featured Filter */}
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Projects</option>
              <option value="featured">Featured Only</option>
              <option value="not-featured">Not Featured</option>
            </select>

            {/* Bulk Actions */}
            {selectedProjects.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedProjects.length})
              </button>
            )}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="card overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || featuredFilter !== 'all'
                  ? 'Try adjusting your search criteria.'
                  : 'Create your first AI project to get started.'}
              </p>
              <Link to="/admin/projects/create" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Link>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedProjects.length === filteredProjects.length && filteredProjects.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    Select All
                  </span>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {filteredProjects.map((project) => (
                  <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => handleSelectProject(project.id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                        />
                        
                        {/* Project Image */}
                        <div className="flex-shrink-0">
                          {project.image_url ? (
                            <img 
                              src={project.image_url} 
                              alt={project.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {project.title.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900 truncate">
                              {project.title}
                            </h3>
                            {project.featured && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {project.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(project.created_at)}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {project.demo_url && (
                                <a
                                  href={project.demo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center hover:bg-blue-200 transition-colors"
                                  title="Live Demo"
                                >
                                  <ExternalLink className="w-3 h-3 text-blue-600" />
                                </a>
                              )}
                              {project.github_url && (
                                <a
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors"
                                  title="GitHub Repository"
                                >
                                  <Github className="w-3 h-3 text-gray-600" />
                                </a>
                              )}
                            </div>
                          </div>
                          
                          {project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.slice(0, 4).map((tech) => (
                                <span 
                                  key={tech}
                                  className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded"
                                >
                                  {tech}
                                </span>
                              ))}
                              {project.technologies.length > 4 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  +{project.technologies.length - 4}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          to={`/projects/${project.id}`}
                          className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                          title="View Project"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Link>
                        
                        <Link
                          to={`/admin/projects/edit/${project.id}`}
                          className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors"
                          title="Edit Project"
                        >
                          <Edit className="w-4 h-4 text-primary-600" />
                        </Link>

                        <div className="relative">
                          <button
                            onClick={() => setShowDropdown(showDropdown === project.id ? null : project.id)}
                            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>

                          {showDropdown === project.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => {
                                  handleToggleFeatured(project);
                                  setShowDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {project.featured ? (
                                  <>
                                    <StarOff className="w-4 h-4 mr-3" />
                                    Remove from Featured
                                  </>
                                ) : (
                                  <>
                                    <Star className="w-4 h-4 mr-3" />
                                    Mark as Featured
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  handleDeleteProject(project.id);
                                  setShowDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-3" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageProjects;