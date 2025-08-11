# Deployment Instructions for Hostinger

## 📋 Prerequisites

- Hostinger hosting account with PHP and MySQL support
- Access to Hostinger control panel (hPanel)
- Your domain configured and pointing to Hostinger

## 🗄️ Step 1: Set Up MySQL Database

1. **Log in to hPanel** → Go to **Databases** → **MySQL Databases**

2. **Create a new database:**
   - Database name: `portfolio_blog` (or any name you prefer)
   - Username: Create a new user or use existing
   - Password: Set a secure password
   - **Write down these credentials!**

3. **Import the database schema:**
   - Go to **phpMyAdmin** in hPanel
   - Select your database
   - Go to **Import** tab
   - Upload the `database.sql` file
   - Click **Go** to execute

## ⚙️ Step 2: Configure Database Connection

1. **Edit `api/config.php`:**
   ```php
   define('DB_HOST', 'localhost');
   define('DB_NAME', 'your_database_name'); // Replace with your database name
   define('DB_USER', 'your_username');      // Replace with your database username
   define('DB_PASS', 'your_password');      // Replace with your database password
   ```

## 🚀 Step 3: Build and Upload Frontend

1. **On your local machine, build the React app:**
   ```bash
   # Navigate to your project folder
   cd /app/frontend
   
   # Update the environment variable
   # Edit .env file and change:
   REACT_APP_BACKEND_URL=https://your-domain.com/api
   
   # Build the production version
   npm run build
   ```

2. **Upload files to Hostinger:**
   - Upload everything from the `build/` folder to your domain's **public_html** folder
   - Upload the entire `api/` folder to **public_html/api/**
   - Upload `.htaccess` file to **public_html/**
   - Create an `uploads/` folder in **public_html/** with write permissions (755)

## 📁 Final File Structure on Hostinger

Your **public_html** folder should look like this:
```
public_html/
├── index.html              (from React build)
├── static/                 (from React build)
├── .htaccess              (URL routing)
├── api/
│   ├── config.php
│   ├── posts.php
│   ├── projects.php
│   ├── verify-secret.php
│   ├── upload.php
│   ├── categories.php
│   ├── tags.php
│   ├── health.php
│   └── .htaccess
└── uploads/               (for file uploads - create this folder)
```

## 🔧 Step 4: Set File Permissions

Set these permissions in hPanel File Manager:
- **api/** folder: 755
- **uploads/** folder: 755
- All PHP files: 644
- All .htaccess files: 644

## ✅ Step 5: Test Your Deployment

1. **Visit your domain** - should show your blog homepage
2. **Test API endpoints:**
   - `https://your-domain.com/api/health` - should return status
   - `https://your-domain.com/api/posts` - should return blog posts
3. **Test authentication:**
   - Click "Create" → "New Post"
   - Enter secret key: `Jtharmon`
   - Should redirect to create post page

## 🔐 Step 6: Customize Your Secret Key (Optional)

To change your secret key:
1. Go to phpMyAdmin
2. Select your database
3. Go to `blog_config` table
4. Edit the row where `config_key` = 'blog_secret'
5. Change `config_value` to your preferred secret key

## 🐛 Troubleshooting

### Database Connection Issues:
- Check database credentials in `api/config.php`
- Verify database exists and user has proper permissions
- Check error logs in hPanel

### API Not Working:
- Verify .htaccess files are uploaded
- Check file permissions
- Test direct PHP file access: `your-domain.com/api/health.php`

### Frontend Issues:
- Verify REACT_APP_BACKEND_URL points to your domain
- Check browser console for errors
- Ensure .htaccess is in public_html root

## 🎉 You're Done!

Your blog is now fully hosted on Hostinger with:
- ✅ Same modal authentication system
- ✅ Same secret key: `Jtharmon`
- ✅ Same features and functionality  
- ✅ MySQL database instead of MongoDB
- ✅ PHP backend instead of Python

Anyone can visit and read your blog, and you can create/edit content using your secret key!

## 💡 Pro Tips

- **Regular backups**: Use hPanel to backup your database regularly
- **Monitor logs**: Check error logs if something doesn't work
- **SSL Certificate**: Enable free SSL in hPanel for HTTPS
- **Domain setup**: Ensure your domain DNS points to Hostinger correctly

Need help? The functionality is identical to your current system - just hosted differently!