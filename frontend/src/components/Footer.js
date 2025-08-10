import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Twitter, Mail, Heart } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/jonharmon',
      icon: Github,
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/jonathan-harmon-1bab03150/',
      icon: Linkedin,
    },
    {
      name: 'Twitter',
      href: 'https://x.com/jtharmon10',
      icon: Twitter,
    },
    {
      name: 'Email',
      href: 'mailto:jon@harmonixwebsolutions.com',
      icon: Mail,
    },
  ];

  const footerLinks = [
    {
      title: 'Navigation',
      links: [
        { name: 'Home', href: '/' },
        { name: 'Blog', href: '/blog' },
        { name: 'Projects', href: '/projects' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    {
      title: 'Categories',
      links: [
        { name: 'AI & Machine Learning', href: '/blog?category=AI' },
        { name: 'Web Development', href: '/blog?category=Web%20Development' },
        { name: 'Tutorials', href: '/blog?category=Tutorial' },
        { name: 'Case Studies', href: '/blog?category=Case%20Study' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JH</span>
              </div>
              <span className="font-display font-bold text-xl">Jon Harmon</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              AI Engineer and Web Developer passionate about creating innovative solutions 
              that solve real-world problems. Exploring the intersection of artificial 
              intelligence and modern web technologies.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-all duration-200 group"
                  >
                    <Icon className="w-5 h-5 text-gray-300 group-hover:text-white" />
                    <span className="sr-only">{social.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © {currentYear} Jon Harmon. All rights reserved.
            </p>
            <div className="flex items-center space-x-1 text-gray-300 text-sm mt-4 md:mt-0">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>and lots of coffee</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;