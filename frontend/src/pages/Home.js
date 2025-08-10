import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Brain, Rocket, ChevronDown } from 'lucide-react';
import axios from 'axios';

function Home() {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        const [postsResponse, projectsResponse] = await Promise.all([
          axios.get(`${API_URL}/api/posts?limit=3&published_only=true`),
          axios.get(`${API_URL}/api/projects?limit=3&featured_only=true`)
        ]);
        
        setFeaturedPosts(postsResponse.data);
        setFeaturedProjects(projectsResponse.data);
      } catch (error) {
        console.error('Error fetching featured content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedContent();
  }, [API_URL]);

  const features = [
    {
      icon: Brain,
      title: 'AI & Machine Learning',
      description: 'Building intelligent systems that learn and adapt, from neural networks to practical AI applications.',
    },
    {
      icon: Code2,
      title: 'Modern Web Development',
      description: 'Creating responsive, performant web applications using cutting-edge technologies and best practices.',
    },
    {
      icon: Rocket,
      title: 'Innovation & Research',
      description: 'Exploring emerging technologies and pushing the boundaries of what\'s possible in tech.',
    },
  ];

  const scrollToContent = () => {
    document.getElementById('featured-content').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Jon Harmon
              </span>
            </h1>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-light text-gray-300 mb-8">
              AI Engineer & Web Developer
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              Passionate about creating innovative AI solutions and modern web applications 
              that solve real-world problems. Welcome to my digital laboratory where 
              artificial intelligence meets exceptional user experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/projects" 
                className="btn-primary text-lg px-8 py-4 group"
              >
                Explore My Work
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/about" 
                className="btn-secondary text-lg px-8 py-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                About Me
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <button 
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 hover:text-white transition-colors animate-bounce"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white" id="featured-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What I Do
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Combining technical expertise with creative problem-solving to build 
              the future of digital experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={feature.title}
                  className="card card-hover p-8 text-center group"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Projects
              </h2>
              <p className="text-lg text-gray-600">
                Recent AI and web development projects that showcase my skills and passion.
              </p>
            </div>
            <Link 
              to="/projects" 
              className="btn-ghost hidden md:flex items-center"
            >
              View All Projects
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="loading-skeleton h-48 mb-4"></div>
                  <div className="loading-skeleton h-6 mb-2"></div>
                  <div className="loading-skeleton h-4 mb-4"></div>
                  <div className="loading-skeleton h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <Link 
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="card card-hover group"
                >
                  {project.image_url && (
                    <div className="aspect-video bg-gray-200 overflow-hidden">
                      <img 
                        src={project.image_url} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.slice(0, 3).map((tech) => (
                        <span 
                          key={tech}
                          className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link to="/projects" className="btn-primary">
              View All Projects
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Blog Posts Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Latest from the Blog
              </h2>
              <p className="text-lg text-gray-600">
                Insights, tutorials, and thoughts on AI, web development, and technology.
              </p>
            </div>
            <Link 
              to="/blog" 
              className="btn-ghost hidden md:flex items-center"
            >
              View All Posts
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-6">
                  <div className="loading-skeleton h-6 mb-2"></div>
                  <div className="loading-skeleton h-4 mb-4"></div>
                  <div className="loading-skeleton h-4 mb-2"></div>
                  <div className="loading-skeleton h-4 w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Link 
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="card card-hover group"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="px-3 py-1 bg-accent-50 text-accent-700 text-sm font-medium rounded-full">
                        {post.category}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.slice(0, 2).map((tag) => (
                        <span 
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12 md:hidden">
            <Link to="/blog" className="btn-primary">
              View All Posts
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Let's Build Something Amazing Together
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Have an exciting project or idea? I'd love to hear about it and discuss 
            how we can bring it to life with cutting-edge technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/contact" 
              className="btn-secondary bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4"
            >
              Get In Touch
            </Link>
            <Link 
              to="/about" 
              className="btn-ghost border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4"
            >
              Learn More About Me
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;