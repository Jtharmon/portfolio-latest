import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Filter,
  MoreVertical
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, statusFilter, categoryFilter]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/posts?published_only=false&limit=100`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => 
        statusFilter === 'published' ? post.published : !post.published
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(post => post.category === categoryFilter);
    }

    setFilteredPosts(filtered);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/posts/${postId}`);
      setPosts(posts.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      const updatedPost = { ...post, published: !post.published };
      await axios.put(`${API_URL}/api/posts/${post.id}`, updatedPost);
      
      setPosts(posts.map(p => p.id === post.id ? { ...p, published: !p.published } : p));
      toast.success(`Post ${updatedPost.published ? 'published' : 'unpublished'} successfully`);
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedPosts.length} post(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(selectedPosts.map(postId => 
        axios.delete(`${API_URL}/api/posts/${postId}`)
      ));
      
      setPosts(posts.filter(post => !selectedPosts.includes(post.id)));
      setSelectedPosts([]);
      toast.success(`${selectedPosts.length} post(s) deleted successfully`);
    } catch (error) {
      console.error('Error deleting posts:', error);
      toast.error('Failed to delete some posts');
    }
  };

  const handleSelectPost = (postId) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(post => post.id));
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
              <div key={i} className="loading-skeleton h-16"></div>
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
                Manage Posts
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredPosts.length} of {posts.length} posts
              </p>
            </div>
            <Link to="/admin/posts/create" className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 form-input"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Bulk Actions */}
            {selectedPosts.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedPosts.length})
              </button>
            )}
          </div>
        </div>

        {/* Posts Table */}
        <div className="card overflow-hidden">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
                No posts found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search criteria.'
                  : 'Create your first blog post to get started.'}
              </p>
              <Link to="/admin/posts/create" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Link>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedPosts.length === filteredPosts.length && filteredPosts.length > 0}
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
                {filteredPosts.map((post) => (
                  <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedPosts.includes(post.id)}
                          onChange={() => handleSelectPost(post.id)}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              post.published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {post.category}
                            </span>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(post.created_at)}
                            </div>
                          </div>
                          
                          {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {post.tags.slice(0, 3).map((tag) => (
                                <span 
                                  key={tag}
                                  className="px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {post.tags.length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  +{post.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Link
                          to={`/blog/${post.id}`}
                          className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
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

                        <div className="relative">
                          <button
                            onClick={() => setShowDropdown(showDropdown === post.id ? null : post.id)}
                            className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>

                          {showDropdown === post.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                              <button
                                onClick={() => {
                                  handleTogglePublish(post);
                                  setShowDropdown(null);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                {post.published ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-3" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4 mr-3" />
                                    Publish
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  handleDeletePost(post.id);
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

export default ManagePosts;