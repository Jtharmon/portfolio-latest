import React from 'react';
import { Download, MapPin, Calendar, Code2, Brain, Rocket, Award } from 'lucide-react';

function About() {
  const skills = [
    {
      category: 'AI & Machine Learning',
      icon: Brain,
      technologies: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'OpenAI API', 'Hugging Face']
    },
    {
      category: 'Web Development',
      icon: Code2,
      technologies: ['React', 'Node.js', 'FastAPI', 'MongoDB', 'PostgreSQL', 'Tailwind CSS']
    },
    {
      category: 'Tools & Platforms',
      icon: Rocket,
      technologies: ['Docker', 'AWS', 'Git', 'Linux', 'Jupyter', 'VS Code']
    }
  ];

  const achievements = [
    {
      title: 'AI Project Portfolio',
      description: 'Built 10+ AI applications ranging from NLP to computer vision',
      icon: Award
    },
    {
      title: 'Web Development Expertise',
      description: 'Created responsive, modern web applications for various clients',
      icon: Code2
    },
    {
      title: 'Continuous Learning',
      description: 'Always exploring cutting-edge technologies and methodologies',
      icon: Brain
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                About <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Me</span>
              </h1>
              <div className="flex items-center space-x-4 text-gray-600 mb-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>United States</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Available for Projects</span>
                </div>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                I'm Jon Harmon, an AI Engineer and Web Developer with a passion for creating 
                innovative solutions that bridge the gap between cutting-edge artificial intelligence 
                and practical web applications. My journey in technology is driven by curiosity and 
                a desire to solve real-world problems through code.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                With expertise in modern web development frameworks and deep learning technologies, 
                I focus on building scalable, intelligent applications that make a meaningful impact. 
                Whether it's developing machine learning models or crafting responsive user interfaces, 
                I approach each project with attention to detail and a commitment to excellence.
              </p>
              <a 
                href="/added-docs/PortfolioProfile.pdf" 
                download="Jon_Harmon_Resume.pdf"
                className="btn-primary inline-flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Resume
              </a>
            </div>
            
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full absolute -inset-4 blur-2xl opacity-20 animate-pulse"></div>
                <img 
                  src="/img/bio-pic3.jpeg" 
                  alt="Jon Harmon" 
                  className="relative w-80 h-80 object-cover rounded-full shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Technical Skills
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A comprehensive toolkit for building modern, intelligent applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <div 
                  key={skill.category}
                  className="card card-hover p-8 text-center"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-gray-900 mb-6">
                    {skill.category}
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {skill.technologies.map((tech) => (
                      <span 
                        key={tech}
                        className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Achievements & Experience
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Highlights from my journey in technology and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div 
                  key={achievement.title}
                  className="text-center"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-gray-900 mb-4">
                    {achievement.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {achievement.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Personal Philosophy Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">
            My Philosophy
          </h2>
          <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-8 italic">
            "Technology should enhance human capabilities, not replace human creativity. 
            Every line of code I write is driven by the goal of solving real problems 
            and creating meaningful experiences."
          </blockquote>
          <p className="text-lg text-primary-100 leading-relaxed">
            I believe in the power of continuous learning, collaborative innovation, 
            and building technology that makes a positive impact on people's lives. 
            Whether working on AI models or web applications, I strive to create solutions 
            that are not only technically excellent but also ethically responsible and user-centered.
          </p>
        </div>
      </section>
    </div>
  );
}

export default About;