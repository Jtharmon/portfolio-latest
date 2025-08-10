import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Briefcase, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  TrendingUp,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    totalProjects: 0,
    featuredProjects: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [postsResponse, projectsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/posts?published_only=false&limit=50`),
        axios.get(`${API_URL}/api/projects?limit=50`)
      ]);

      const allPosts = postsResponse.data;
      const allProjects = projectsResponse.data;

      setStats({
        totalPosts: allPosts.length,
        publishedPosts: allPosts.filter(post => post.published).length,
        totalProjects: allProjects.length,
        featuredProjects: allProjects.filter(project => project.featured).length
      });

      setRecentPosts(allPosts.slice(0, 5));
      setRecentProjects(allProjects.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Create New Post',
      description: 'Write a new blog post',
      href: '/admin/posts/create',
      icon: FileText,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Create New Project',
      description: 'Add a new AI project',
      href: '/admin/projects/create',
      icon: Briefcase,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Manage Posts',
      description: 'Edit and organize posts',
      href: '/admin/posts',
      icon: Edit,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Manage Projects',
      description: 'Edit and organize projects',
      href: '/admin/projects',
      icon: Briefcase,
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const statCards = [
    {
      title: 'Total Posts',
      value: stats.totalPosts,
      subtitle: `${stats.publishedPosts} published`,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Published Posts',
      value: stats.publishedPosts,
      subtitle: `${stats.totalPosts - stats.publishedPosts} drafts`,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      subtitle: `${stats.featuredProjects} featured`,
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Featured Projects',
      value: stats.featuredProjects,
      subtitle: 'Highlighted projects',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="loading-skeleton h-8 w-64 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="loading-skeleton h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="loading-skeleton h-96"></div>
            <div className="loading-skeleton h-96"></div>
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
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your portfolio content and projects
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/" className="btn-ghost">
                <Eye className="w-4 h-4 mr-2" />
                View Site
              </Link>
              <Link to="/admin/posts/create" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="card p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor} mr-4`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className={`${action.color} text-white p-6 rounded-lg transition-all duration-200 hover:scale-105 group`}
                >
                  <div className="flex items-center mb-3">
                    <Icon className="w-6 h-6 mr-3" />
                    <h3 className="font-semibold">{action.title}</h3>
                  </div>
                  <p className="text-sm opacity-90">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Posts */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Recent Posts
              </h2>
              <Link to="/admin/posts" className="btn-ghost text-sm">
                View All
              </Link>
            </div>

            {recentPosts.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No posts yet</p>
                <Link to="/admin/posts/create" className="btn-primary mt-3">
                  Create First Post
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {post.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          post.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/blog/${post.id}`}
                        className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
                        title="View Post"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </Link>
                      <Link
                        to={`/admin/posts/edit/${post.id}`}
                        className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition-colors"
                        title="Edit Post"
                      >
                        <Edit className="w-4 h-4 text-primary-600" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Projects */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-lg font-semibold text-gray-900">
                Recent Projects
              </h2>
              <Link to="/admin/projects" className="btn-ghost text-sm">
                View All
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No projects yet</p>
                <Link to="/admin/projects/create" className="btn-primary mt-3">
                  Create First Project
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {project.title}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        {project.featured && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatDate(project.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/projects/${project.id}`}
                        className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;