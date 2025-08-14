#!/bin/bash
# Build script for frontend deployment

echo "🚀 Building React frontend for Hostinger deployment..."

# Navigate to frontend directory
cd ../frontend

# Update environment variable for your domain
echo "⚙️ Please update the domain in .env file:"
echo "Current: $(grep REACT_APP_BACKEND_URL .env)"
echo "Replace 'your-domain.com' with your actual Hostinger domain"
echo ""

read -p "Enter your Hostinger domain (e.g., yourblog.com): " domain

if [ ! -z "$domain" ]; then
    # Update .env file with user's domain
    sed -i "s|REACT_APP_BACKEND_URL=.*|REACT_APP_BACKEND_URL=https://$domain/api|" .env
    echo "✅ Updated .env file with domain: $domain"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the production version
echo "🔨 Building production version..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Files ready for upload are in: frontend/build/"
    echo ""
    echo "📋 Next steps:"
    echo "1. Upload all contents of 'frontend/build/' to your Hostinger public_html folder"
    echo "2. Upload 'hostinger_deployment/api/' folder to public_html/api/"
    echo "3. Upload 'hostinger_deployment/.htaccess' to public_html/"
    echo "4. Follow the DEPLOYMENT_INSTRUCTIONS.md for database setup"
else
    echo "❌ Build failed! Please check the errors above."
fi