import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Github, Star, Calendar, Code2, Brain, Rocket } from 'lucide-react';
import axios from 'axios';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Projects', icon: Code2 },
    { id: 'ai', name: 'AI & ML', icon: Brain },
    { id: 'web', name: 'Web Development', icon: Rocket },
  ];

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(project => {
        const techs = project.technologies.map(t => t.toLowerCase());
        if (filter === 'ai') {
          return techs.some(tech => 
            tech.includes('ai') || tech.includes('ml') || tech.includes('python') || 
            tech.includes('tensorflow') || tech.includes('pytorch') || tech.includes('openai')
          );
        }
        if (filter === 'web') {
          return techs.some(tech => 
            tech.includes('react') || tech.includes('javascript') || tech.includes('node') ||
            tech.includes('html') || tech.includes('css') || tech.includes('vue')
          );
        }
        return true;
      });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            My Projects
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            A showcase of AI applications, web development projects, and innovative 
            solutions that demonstrate my technical expertise and creative problem-solving.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  filter === category.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="loading-skeleton h-48 mb-4"></div>
                <div className="loading-skeleton h-6 mb-2"></div>
                <div className="loading-skeleton h-4 mb-4"></div>
                <div className="flex space-x-2">
                  <div className="loading-skeleton h-6 w-16"></div>
                  <div className="loading-skeleton h-6 w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Code2 className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
              No projects found
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No projects have been added yet.' 
                : `No ${categories.find(c => c.id === filter)?.name.toLowerCase()} projects found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <div 
                key={project.id}
                className="card card-hover group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Project Image */}
                {project.image_url ? (
                  <div className="aspect-video bg-gray-200 overflow-hidden">
                    <img 
                      src={project.image_url} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                    <Code2 className="w-16 h-16 text-white" />
                  </div>
                )}

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      {project.featured && (
                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-xs font-medium text-yellow-600 ml-1">Featured</span>
                        </div>
                      )}
                      <h3 className="font-display text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                        {project.title}
                      </h3>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm ml-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(project.created_at)}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span 
                        key={tech}
                        className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Link 
                      to={`/projects/${project.id}`}
                      className="btn-ghost text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    >
                      View Details
                    </Link>
                    
                    <div className="flex items-center space-x-2">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-all duration-200"
                          title="View Source Code"
                        >
                          <Github className="w-5 h-5" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 hover:text-primary-700 hover:bg-primary-200 transition-all duration-200"
                          title="View Live Demo"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Let's Build Something Amazing
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Have an idea for a project? I'd love to collaborate and bring your vision to life 
            using cutting-edge technology and innovative solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary">
              Start a Conversation
            </Link>
            <Link to="/blog" className="btn-secondary">
              Read About My Process
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Projects;