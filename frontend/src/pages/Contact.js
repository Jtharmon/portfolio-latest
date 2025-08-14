import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Github, Linkedin, Twitter } from 'lucide-react';
import toast from 'react-hot-toast';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message sent successfully! I\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'jon@harmonixwebsolutions.com',
      href: 'mailto:jon@harmonixwebsolutions.com'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+1 (555) 123-4567',
      href: 'tel:+15551234567'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'United States',
      href: '#'
    }
  ];

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/jonharmon',
      icon: Github,
      color: 'hover:text-gray-900'
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/jonathan-harmon-1bab03150/',
      icon: Linkedin,
      color: 'hover:text-blue-600'
    },
    {
      name: 'Twitter',
      href: 'https://x.com/jtharmon10',
      icon: Twitter,
      color: 'hover:text-blue-400'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get In <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Touch</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Have a project in mind? Want to collaborate on something amazing? 
            I'd love to hear from you and discuss how we can work together.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">
                Send me a message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Tell me about your project or idea..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex justify-center items-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-8">
                Let's connect
              </h2>

              <div className="space-y-8">
                {/* Contact Details */}
                <div className="space-y-6">
                  {contactInfo.map((contact) => {
                    const Icon = contact.icon;
                    return (
                      <div key={contact.title} className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {contact.title}
                          </h3>
                          {contact.href !== '#' ? (
                            <a 
                              href={contact.href}
                              className="text-gray-600 hover:text-primary-600 transition-colors"
                            >
                              {contact.value}
                            </a>
                          ) : (
                            <span className="text-gray-600">{contact.value}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Follow me</h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((social) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 transition-all duration-200 ${social.color} hover:scale-110`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="sr-only">{social.name}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Availability */}
                <div className="bg-gradient-to-br from-primary-50 to-accent-50 p-6 rounded-xl border border-primary-100">
                  <h3 className="font-semibold text-gray-900 mb-2">Current Availability</h3>
                  <p className="text-gray-600 mb-4">
                    I'm currently available for new projects and collaborations. 
                    Whether you need an AI solution, web application, or technical consultation, 
                    I'd love to discuss your needs.
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-medium">Available for work</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to start your project?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            From initial concept to final deployment, I'll work with you every step 
            of the way to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:jon@harmonixwebsolutions.com" 
              className="btn-primary"
            >
              Start a Conversation
            </a>
            <a 
              href="/added-docs/PortfolioProfile.pdf" 
              download="Jon_Harmon_Resume.pdf"
              className="btn-secondary"
            >
              Download Resume
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;