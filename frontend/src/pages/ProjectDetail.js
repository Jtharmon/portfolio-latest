import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github, Calendar, Star, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import axios from 'axios';
import toast from 'react-hot-toast';

function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    if (project) {
      fetchRelatedProjects();
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Project not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/projects?limit=3`);
      // Filter out current project and get related ones
      const filtered = response.data.filter(p => p.id !== project.id);
      setRelatedProjects(filtered.slice(0, 3));
    } catch (error) {
      console.error('Error fetching related projects:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    if (!inline && language) {
      return (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          className="rounded-lg"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      );
    }

    return (
      <code className="bg-gray-100 text-pink-600 px-1 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="loading-skeleton h-8 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="loading-skeleton h-96"></div>
            <div className="space-y-4">
              <div className="loading-skeleton h-8"></div>
              <div className="loading-skeleton h-6 w-1/3"></div>
              <div className="loading-skeleton h-4"></div>
              <div className="loading-skeleton h-4"></div>
              <div className="loading-skeleton h-4 w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
          <Link to="/projects" className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to="/projects" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Project Image */}
            <div className="order-2 lg:order-1">
              {project.image_url ? (
                <img 
                  src={project.image_url} 
                  alt={project.title}
                  className="w-full h-auto rounded-xl shadow-lg"
                />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold">{project.title.charAt(0)}</span>
                    </div>
                    <p className="text-lg font-medium">{project.title}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Project Info */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="flex items-center space-x-4">
                {project.featured && (
                  <div className="flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    <span className="text-sm font-medium">Featured</span>
                  </div>
                )}
                <div className="flex items-center text-gray-500">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(project.created_at)}
                </div>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900">
                {project.title}
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                {project.description}
              </p>

              {/* Technologies */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Technologies Used</h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span 
                      key={tech}
                      className="px-3 py-1 bg-primary-50 text-primary-700 font-medium rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4">
                {project.demo_url && (
                  <a
                    href={project.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    View Live Demo
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    View Source Code
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Content */}
      {project.content && (
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code: CodeBlock,
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mt-12 mb-6 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {children}
                    </p>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 font-medium underline decoration-primary-200 hover:decoration-primary-300 transition-colors"
                    >
                      {children}
                      <ExternalLink className="w-4 h-4 inline ml-1" />
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary-200 pl-6 py-2 my-6 bg-primary-50 italic text-gray-700">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 my-6 text-gray-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 my-6 text-gray-700">
                      {children}
                    </ol>
                  ),
                }}
              >
                {project.content}
              </ReactMarkdown>
            </div>
          </div>
        </section>
      )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-12 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">
              Other Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProjects.map((relatedProject) => (
                <Link
                  key={relatedProject.id}
                  to={`/projects/${relatedProject.id}`}
                  className="card card-hover group"
                >
                  {relatedProject.image_url ? (
                    <div className="aspect-video bg-gray-200 overflow-hidden">
                      <img 
                        src={relatedProject.image_url} 
                        alt={relatedProject.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {relatedProject.title.charAt(0)}
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="font-display text-lg font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {relatedProject.title}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {relatedProject.description}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {relatedProject.technologies.slice(0, 2).map((tech) => (
                        <span 
                          key={tech}
                          className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                      {relatedProject.technologies.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{relatedProject.technologies.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold mb-4">
            Interested in working together?
          </h2>
          <p className="text-primary-100 mb-8">
            I'm always excited to collaborate on innovative projects that push the boundaries of technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-secondary bg-white text-primary-600 hover:bg-gray-50">
              Get In Touch
            </Link>
            <Link to="/projects" className="btn-ghost border-white/20 text-white hover:bg-white/10">
              View All Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProjectDetail;