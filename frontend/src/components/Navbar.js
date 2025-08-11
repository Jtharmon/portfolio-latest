import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, BookOpen, Briefcase, Home, Mail, Plus, Edit, LogOut } from 'lucide-react';
import { useBlogAuth } from '../context/BlogAuthContext';
import SecretKeyModal from './SecretKeyModal';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useBlogAuth();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Blog', href: '/blog', icon: BookOpen },
    { name: 'Projects', href: '/projects', icon: Briefcase },
    { name: 'About', href: '/about', icon: User },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  const createItems = [
    { name: 'New Post', action: 'create-post', icon: BookOpen },
    { name: 'New Project', action: 'create-project', icon: Briefcase },
  ];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleCreateAction = (action) => {
    if (isAuthenticated) {
      navigate(`/${action}`);
    } else {
      setPendingAction(action);
      setIsSecretModalOpen(true);
    }
    setIsCreateMenuOpen(false);
    setIsMenuOpen(false);
  };

  const handleSecretSuccess = (secretKey) => {
    console.log('handleSecretSuccess called with pending action:', pendingAction);
    if (pendingAction) {
      console.log('Navigating to pending action:', `/${pendingAction}`);
      navigate(`/${pendingAction}`);
      setPendingAction(null);
    } else {
      console.log('No pending action found');
    }
  };

  const handleLogout = () => {
    logout();
    setIsCreateMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JH</span>
                </div>
                <span className="font-display font-bold text-xl text-gray-900">Jon Harmon</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActivePath(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Create Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isAuthenticated 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create</span>
                  {isAuthenticated && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isCreateMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {createItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.name}
                          onClick={() => handleCreateAction(item.action)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.name}
                          {!isAuthenticated && (
                            <span className="ml-auto text-xs text-gray-500">🔒</span>
                          )}
                        </button>
                      );
                    })}
                    
                    {isAuthenticated && (
                      <>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          End Session
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActivePath(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-200 mt-4 pt-4">
                <p className="px-3 py-2 text-sm font-medium text-gray-500 flex items-center">
                  Create Content 
                  {isAuthenticated ? (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Authorized</span>
                  ) : (
                    <span className="ml-2 text-xs text-gray-400">🔒</span>
                  )}
                </p>
                {createItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleCreateAction(item.action)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 w-full text-left"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
                
                {isAuthenticated && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 w-full text-left mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>End Session</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Secret Key Modal */}
      <SecretKeyModal
        isOpen={isSecretModalOpen}
        onClose={() => {
          setIsSecretModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={handleSecretSuccess}
        title="Verify Access"
      />
    </>
  );
}

export default Navbar;