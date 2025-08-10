import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Calendar, Tag, ChevronRight } from 'lucide-react';
import axios from 'axios';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  
  const selectedCategory = searchParams.get('category') || '';
  const selectedTag = searchParams.get('tag') || '';

  useEffect(() => {
    fetchPosts();
    fetchCategories();
    fetchTags();
  }, [selectedCategory, selectedTag]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/posts?published_only=true`;
      
      if (selectedCategory) {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      
      const response = await axios.get(url);
      let filteredPosts = response.data;
      
      // Filter by tag if selected
      if (selectedTag) {
        filteredPosts = filteredPosts.filter(post => 
          post.tags.includes(selectedTag)
        );
      }
      
      // Filter by search term
      if (searchTerm) {
        filteredPosts = filteredPosts.filter(post =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      setPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
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

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tags`);
      setTags(response.data.tags || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleCategoryFilter = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category) {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleTagFilter = (tag) => {
    const params = new URLSearchParams(searchParams);
    if (tag) {
      params.set('tag', tag);
    } else {
      params.delete('tag');
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSearchTerm('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-accent-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Blog & Insights
          </h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Exploring AI, web development, and the future of technology through 
            practical tutorials, case studies, and industry insights.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-8">
              {/* Search */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Search</h3>
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
                <button
                  onClick={fetchPosts}
                  className="btn-primary w-full mt-4"
                >
                  Search
                </button>
              </div>

              {/* Categories */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryFilter('')}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory 
                        ? 'bg-primary-50 text-primary-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryFilter(category)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagFilter(tag)}
                      className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                        selectedTag === tag
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedTag || searchTerm) && (
                <div className="card p-6">
                  <button
                    onClick={clearFilters}
                    className="btn-secondary w-full"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Active Filters */}
            {(selectedCategory || selectedTag) && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-blue-800">Active filters:</span>
                    {selectedCategory && (
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full">
                        Category: {selectedCategory}
                      </span>
                    )}
                    {selectedTag && (
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full">
                        Tag: {selectedTag}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Posts Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card p-6">
                    <div className="loading-skeleton h-6 mb-4"></div>
                    <div className="loading-skeleton h-4 mb-2"></div>
                    <div className="loading-skeleton h-4 mb-4 w-2/3"></div>
                    <div className="flex space-x-2">
                      <div className="loading-skeleton h-6 w-16"></div>
                      <div className="loading-skeleton h-6 w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">
                  No posts found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory || selectedTag
                    ? 'Try adjusting your search criteria or clearing the filters.'
                    : 'No blog posts have been published yet.'}
                </p>
                {(searchTerm || selectedCategory || selectedTag) && (
                  <button onClick={clearFilters} className="btn-primary">
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.map((post) => (
                  <Link 
                    key={post.id}
                    to={`/blog/${post.id}`}
                    className="card card-hover group"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-accent-50 text-accent-700 text-sm font-medium rounded-full">
                          {post.category}
                        </span>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(post.created_at)}
                        </div>
                      </div>
                      
                      <h3 className="font-display text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span 
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                              +{post.tags.length - 2} more
                            </span>
                          )}
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Blog;