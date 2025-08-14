import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import { BlogAuthProvider } from './context/BlogAuthContext';

function App() {
  return (
    <BlogAuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Content Management Routes (Protected by Modal) */}
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/edit-post/:id" element={<EditPost />} />
              <Route path="/create-project" element={<CreateProject />} />
              <Route path="/edit-project/:id" element={<EditProject />} />
            </Routes>
          </main>
          <Footer />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
              },
            }}
          />
        </div>
      </Router>
    </BlogAuthProvider>
  );
}

export default App;