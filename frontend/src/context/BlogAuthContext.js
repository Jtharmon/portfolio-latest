import React, { createContext, useContext, useState } from 'react';

const BlogAuthContext = createContext();

export function useBlogAuth() {
  return useContext(BlogAuthContext);
}

export function BlogAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretKey, setSecretKey] = useState('');

  const authenticate = (key) => {
    setSecretKey(key);
    setIsAuthenticated(true);
    
    // Optional: Set a timeout to clear authentication after some time (e.g., 1 hour)
    setTimeout(() => {
      logout();
    }, 60 * 60 * 1000); // 1 hour
  };

  const logout = () => {
    setSecretKey('');
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    secretKey,
    authenticate,
    logout
  };

  return (
    <BlogAuthContext.Provider value={value}>
      {children}
    </BlogAuthContext.Provider>
  );
}