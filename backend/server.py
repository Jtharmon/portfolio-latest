from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from typing import Optional, List
import os
import uuid
from pydantic import BaseModel, Field

# Environment variables
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
BLOG_SECRET = os.environ.get('BLOG_SECRET', 'my-blog-secret-2024')

# Initialize FastAPI app
app = FastAPI(title="Simple Portfolio Blog API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient(MONGO_URL)
db = client.portfolio_blog

# Create uploads directory
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Pydantic Models
class BlogPost(BaseModel):
    title: str
    content: str
    excerpt: str
    tags: List[str] = []
    category: str
    featured_image: Optional[str] = None
    published: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    blog_secret: str  # Secret key for authorization

class AIProject(BaseModel):
    title: str
    description: str
    content: str
    technologies: List[str] = []
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    image_url: Optional[str] = None
    featured: bool = False
    created_at: Optional[datetime] = None
    blog_secret: str  # Secret key for authorization

class BlogPostResponse(BaseModel):
    id: str
    title: str
    content: str
    excerpt: str
    tags: List[str]
    category: str
    featured_image: Optional[str]
    published: bool
    created_at: datetime
    updated_at: datetime

class AIProjectResponse(BaseModel):
    id: str
    title: str
    description: str
    content: str
    technologies: List[str]
    demo_url: Optional[str]
    github_url: Optional[str]
    image_url: Optional[str]
    featured: bool
    created_at: datetime

# Utility functions
def verify_blog_secret(provided_secret: str) -> bool:
    """Verify if the provided secret matches the blog secret"""
    return provided_secret == BLOG_SECRET

def check_blog_authorization(blog_secret: str):
    """Check if the blog secret is valid, raise HTTPException if not"""
    if not verify_blog_secret(blog_secret):
        raise HTTPException(
            status_code=401, 
            detail="Invalid blog secret. You are not authorized to perform this action."
        )

# Blog Post Routes
@app.get("/api/posts", response_model=List[BlogPostResponse])
async def get_blog_posts(skip: int = 0, limit: int = 10, category: Optional[str] = None, published_only: bool = True):
    query = {}
    if published_only:
        query["published"] = True
    if category:
        query["category"] = category
    
    posts = list(db.blog_posts.find(query).sort("created_at", -1).skip(skip).limit(limit))
    return [
        BlogPostResponse(
            id=str(post["_id"]),
            title=post["title"],
            content=post["content"],
            excerpt=post["excerpt"],
            tags=post.get("tags", []),
            category=post["category"],
            featured_image=post.get("featured_image"),
            published=post["published"],
            created_at=post["created_at"],
            updated_at=post["updated_at"]
        ) for post in posts
    ]

@app.get("/api/posts/{post_id}", response_model=BlogPostResponse)
async def get_blog_post(post_id: str):
    try:
        post = db.blog_posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return BlogPostResponse(
            id=str(post["_id"]),
            title=post["title"],
            content=post["content"],
            excerpt=post["excerpt"],
            tags=post.get("tags", []),
            category=post["category"],
            featured_image=post.get("featured_image"),
            published=post["published"],
            created_at=post["created_at"],
            updated_at=post["updated_at"]
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Post not found")

@app.post("/api/posts", response_model=BlogPostResponse)
async def create_blog_post(post: BlogPost):
    # Check authorization
    check_blog_authorization(post.blog_secret)
    
    post_doc = post.dict()
    # Remove blog_secret from stored data
    del post_doc["blog_secret"]
    post_doc["created_at"] = datetime.utcnow()
    post_doc["updated_at"] = datetime.utcnow()
    
    result = db.blog_posts.insert_one(post_doc)
    
    # Retrieve the created post
    created_post = db.blog_posts.find_one({"_id": result.inserted_id})
    return BlogPostResponse(
        id=str(created_post["_id"]),
        title=created_post["title"],
        content=created_post["content"],
        excerpt=created_post["excerpt"],
        tags=created_post.get("tags", []),
        category=created_post["category"],
        featured_image=created_post.get("featured_image"),
        published=created_post["published"],
        created_at=created_post["created_at"],
        updated_at=created_post["updated_at"]
    )

@app.put("/api/posts/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(post_id: str, post: BlogPost):
    # Check authorization
    check_blog_authorization(post.blog_secret)
    
    try:
        post_doc = post.dict()
        # Remove blog_secret from stored data
        del post_doc["blog_secret"]
        post_doc["updated_at"] = datetime.utcnow()
        
        result = db.blog_posts.update_one(
            {"_id": ObjectId(post_id)}, 
            {"$set": post_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Post not found")
        
        updated_post = db.blog_posts.find_one({"_id": ObjectId(post_id)})
        return BlogPostResponse(
            id=str(updated_post["_id"]),
            title=updated_post["title"],
            content=updated_post["content"],
            excerpt=updated_post["excerpt"],
            tags=updated_post.get("tags", []),
            category=updated_post["category"],
            featured_image=updated_post.get("featured_image"),
            published=updated_post["published"],
            created_at=updated_post["created_at"],
            updated_at=updated_post["updated_at"]
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Post not found")

@app.delete("/api/posts/{post_id}")
async def delete_blog_post(post_id: str, blog_secret: str):
    # Check authorization
    check_blog_authorization(blog_secret)
    
    try:
        result = db.blog_posts.delete_one({"_id": ObjectId(post_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Post not found")
        return {"message": "Post deleted successfully"}
    except Exception:
        raise HTTPException(status_code=404, detail="Post not found")

# AI Projects Routes
@app.get("/api/projects", response_model=List[AIProjectResponse])
async def get_ai_projects(skip: int = 0, limit: int = 10, featured_only: bool = False):
    query = {}
    if featured_only:
        query["featured"] = True
    
    projects = list(db.ai_projects.find(query).sort("created_at", -1).skip(skip).limit(limit))
    return [
        AIProjectResponse(
            id=str(project["_id"]),
            title=project["title"],
            description=project["description"],
            content=project["content"],
            technologies=project.get("technologies", []),
            demo_url=project.get("demo_url"),
            github_url=project.get("github_url"),
            image_url=project.get("image_url"),
            featured=project.get("featured", False),
            created_at=project["created_at"]
        ) for project in projects
    ]

@app.get("/api/projects/{project_id}", response_model=AIProjectResponse)
async def get_ai_project(project_id: str):
    try:
        project = db.ai_projects.find_one({"_id": ObjectId(project_id)})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return AIProjectResponse(
            id=str(project["_id"]),
            title=project["title"],
            description=project["description"],
            content=project["content"],
            technologies=project.get("technologies", []),
            demo_url=project.get("demo_url"),
            github_url=project.get("github_url"),
            image_url=project.get("image_url"),
            featured=project.get("featured", False),
            created_at=project["created_at"]
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Project not found")

@app.post("/api/projects", response_model=AIProjectResponse)
async def create_ai_project(project: AIProject):
    # Check authorization
    check_blog_authorization(project.blog_secret)
    
    project_doc = project.dict()
    # Remove blog_secret from stored data
    del project_doc["blog_secret"]
    project_doc["created_at"] = datetime.utcnow()
    
    result = db.ai_projects.insert_one(project_doc)
    
    created_project = db.ai_projects.find_one({"_id": result.inserted_id})
    return AIProjectResponse(
        id=str(created_project["_id"]),
        title=created_project["title"],
        description=created_project["description"],
        content=created_project["content"],
        technologies=created_project.get("technologies", []),
        demo_url=created_project.get("demo_url"),
        github_url=created_project.get("github_url"),
        image_url=created_project.get("image_url"),
        featured=created_project.get("featured", False),
        created_at=created_project["created_at"]
    )

@app.put("/api/projects/{project_id}", response_model=AIProjectResponse)
async def update_ai_project(project_id: str, project: AIProject):
    # Check authorization
    check_blog_authorization(project.blog_secret)
    
    try:
        project_doc = project.dict()
        # Remove blog_secret from stored data
        del project_doc["blog_secret"]
        
        result = db.ai_projects.update_one(
            {"_id": ObjectId(project_id)}, 
            {"$set": project_doc}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        updated_project = db.ai_projects.find_one({"_id": ObjectId(project_id)})
        return AIProjectResponse(
            id=str(updated_project["_id"]),
            title=updated_project["title"],
            description=updated_project["description"],
            content=updated_project["content"],
            technologies=updated_project.get("technologies", []),
            demo_url=updated_project.get("demo_url"),
            github_url=updated_project.get("github_url"),
            image_url=updated_project.get("image_url"),
            featured=updated_project.get("featured", False),
            created_at=updated_project["created_at"]
        )
    except Exception:
        raise HTTPException(status_code=404, detail="Project not found")

@app.delete("/api/projects/{project_id}")
async def delete_ai_project(project_id: str, blog_secret: str):
    # Check authorization
    check_blog_authorization(blog_secret)
    
    try:
        result = db.ai_projects.delete_one({"_id": ObjectId(project_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": "Project deleted successfully"}
    except Exception:
        raise HTTPException(status_code=404, detail="Project not found")

# Verification route
@app.post("/api/verify-secret")
async def verify_secret(secret_data: dict):
    """Verify if the provided secret is correct"""
    provided_secret = secret_data.get("blog_secret", "")
    return {"valid": verify_blog_secret(provided_secret)}

# File upload route (protected)
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), blog_secret: str = ""):
    # Check authorization
    check_blog_authorization(blog_secret)
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/{unique_filename}"
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    return {"filename": unique_filename, "url": f"/uploads/{unique_filename}"}

# Categories route
@app.get("/api/categories")
async def get_categories():
    categories = db.blog_posts.distinct("category")
    return {"categories": categories}

# Tags route  
@app.get("/api/tags")
async def get_tags():
    posts = db.blog_posts.find({}, {"tags": 1})
    all_tags = []
    for post in posts:
        all_tags.extend(post.get("tags", []))
    unique_tags = list(set(all_tags))
    return {"tags": unique_tags}

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)