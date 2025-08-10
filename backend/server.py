from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
from typing import Optional, List
import os
import uuid
import json
from pydantic import BaseModel, Field
import hashlib
import jwt
from passlib.context import CryptContext

# Environment variables
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here')
ALGORITHM = "HS256"

# Initialize FastAPI app
app = FastAPI(title="Portfolio Blog API", version="1.0.0")

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

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

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
    published: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

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

class User(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

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
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

# Initialize default admin user
@app.on_event("startup")
async def create_admin_user():
    admin_exists = db.users.find_one({"username": "admin"})
    if not admin_exists:
        admin_user = {
            "username": "admin",
            "email": "admin@portfolio.com",
            "password": hash_password("admin123"),
            "created_at": datetime.utcnow()
        }
        db.users.insert_one(admin_user)
        print("Default admin user created: admin/admin123")

# API Routes

# Authentication Routes
@app.post("/api/auth/login")
async def login(user_login: UserLogin):
    user = db.users.find_one({"username": user_login.username})
    if not user or not verify_password(user_login.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token_expires = timedelta(days=30)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/register")
async def register(user: User):
    existing_user = db.users.find_one({"$or": [{"username": user.username}, {"email": user.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already registered")
    
    user_doc = {
        "username": user.username,
        "email": user.email,
        "password": hash_password(user.password),
        "created_at": datetime.utcnow()
    }
    result = db.users.insert_one(user_doc)
    return {"message": "User registered successfully", "user_id": str(result.inserted_id)}

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
async def create_blog_post(post: BlogPost, current_user: str = Depends(get_current_user)):
    post_doc = post.dict()
    post_doc["created_at"] = datetime.utcnow()
    post_doc["updated_at"] = datetime.utcnow()
    post_doc["author"] = current_user
    
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
async def update_blog_post(post_id: str, post: BlogPost, current_user: str = Depends(get_current_user)):
    try:
        post_doc = post.dict()
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
async def delete_blog_post(post_id: str, current_user: str = Depends(get_current_user)):
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
async def create_ai_project(project: AIProject, current_user: str = Depends(get_current_user)):
    project_doc = project.dict()
    project_doc["created_at"] = datetime.utcnow()
    project_doc["author"] = current_user
    
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
async def update_ai_project(project_id: str, project: AIProject, current_user: str = Depends(get_current_user)):
    try:
        project_doc = project.dict()
        
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
async def delete_ai_project(project_id: str, current_user: str = Depends(get_current_user)):
    try:
        result = db.ai_projects.delete_one({"_id": ObjectId(project_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": "Project deleted successfully"}
    except Exception:
        raise HTTPException(status_code=404, detail="Project not found")

# File upload route
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), current_user: str = Depends(get_current_user)):
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