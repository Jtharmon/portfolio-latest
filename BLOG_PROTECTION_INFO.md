# Blog Protection Setup

## Your Blog Secret Key

Your blog is now protected with a secret key. Only you can create, edit, and delete blog posts and projects.

**Current Secret Key:** `my-blog-secret-2024`

## How to Use

### Creating New Content:
1. Click "Create" → "New Post" or "New Project"
2. Enter your secret key: `my-blog-secret-2024`
3. Fill in your content
4. Click "Publish Post" or "Create Project"

### Editing Existing Content:
1. Click "Edit" on any blog post or project
2. Enter your secret key: `my-blog-secret-2024`
3. Update your content
4. Click "Update"

### Changing Your Secret Key:
To change your secret key, update the `BLOG_SECRET` value in `/app/backend/.env`:

```
BLOG_SECRET=your-new-secret-key-here
```

Then restart the backend service:
```bash
sudo supervisorctl restart backend
```

## Security Features

- ✅ Only you can create new blog posts
- ✅ Only you can edit existing posts
- ✅ Only you can delete posts
- ✅ Only you can upload images
- ✅ Secret key is not stored in the database
- ✅ All API endpoints are protected
- ✅ Anyone can still read your blog posts

## Important Notes

1. Keep your secret key private
2. Don't share it with anyone
3. The secret key is required for ALL content management operations
4. Visitors can still read all your published content
5. The secret key is entered as a password field (hidden)

Your blog is now protected while remaining easy to use!