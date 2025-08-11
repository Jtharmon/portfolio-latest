-- Portfolio Blog MySQL Database Schema
-- Run this script in your Hostinger MySQL database

CREATE DATABASE IF NOT EXISTS portfolio_blog;
USE portfolio_blog;

-- Blog posts table
CREATE TABLE blog_posts (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(500) NOT NULL,
    content LONGTEXT NOT NULL,
    excerpt TEXT,
    category VARCHAR(100) DEFAULT 'General',
    featured_image VARCHAR(500) DEFAULT NULL,
    published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Blog post tags table (many-to-many relationship)
CREATE TABLE blog_post_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_post_tag (post_id, tag)
);

-- AI projects table
CREATE TABLE ai_projects (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    content LONGTEXT DEFAULT NULL,
    demo_url VARCHAR(500) DEFAULT NULL,
    github_url VARCHAR(500) DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Project technologies table (many-to-many relationship)
CREATE TABLE project_technologies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    technology VARCHAR(100) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES ai_projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_tech (project_id, technology)
);

-- Configuration table for storing blog settings
CREATE TABLE blog_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(500) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default configuration
INSERT INTO blog_config (config_key, config_value) VALUES 
('blog_secret', 'Jtharmon'),
('blog_title', 'Jon Harmon - AI Engineer & Web Developer'),
('blog_description', 'Passionate about creating innovative AI solutions and modern web applications');

-- Create indexes for better performance
CREATE INDEX idx_posts_published ON blog_posts(published);
CREATE INDEX idx_posts_category ON blog_posts(category);
CREATE INDEX idx_posts_created ON blog_posts(created_at);
CREATE INDEX idx_projects_featured ON ai_projects(featured);
CREATE INDEX idx_projects_created ON ai_projects(created_at);

-- Insert sample data
INSERT INTO blog_posts (id, title, content, excerpt, category, published) VALUES 
(UUID(), 'Welcome to My AI Journey', 
'# Welcome to My AI Journey\n\nWelcome to my AI blog where I share insights, tutorials, and real-world experiences in artificial intelligence and web development. Let''s explore the fascinating world of AI together!\n\n## What You''ll Find Here\n\n- **AI Tutorials**: Step-by-step guides on machine learning concepts\n- **Project Showcases**: Real-world AI applications I''ve built\n- **Industry Insights**: Thoughts on the latest trends in AI and tech\n- **Code Examples**: Practical implementations you can use\n\nStay tuned for exciting content!', 
'Welcome to my AI blog where I share insights, tutorials, and real-world experiences in artificial intelligence and web development. Let''s explore...', 
'AI & Machine Learning', 
TRUE);

-- Add tags for the sample post
SET @post_id = (SELECT id FROM blog_posts WHERE title = 'Welcome to My AI Journey');
INSERT INTO blog_post_tags (post_id, tag) VALUES 
(@post_id, 'welcome'),
(@post_id, 'ai'),
(@post_id, 'introduction');