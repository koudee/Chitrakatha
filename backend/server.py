from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# ============ MODELS ============

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    is_admin: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    token: str
    user: User

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    event_type: str  # Wedding, Pre-Wedding, Event, etc.
    event_date: str
    package_type: str  # Traditional, Semi-Cinematic, Cinematic, Premium
    status: str = "Pending"  # Pending, In Progress, Completed, Delivered
    photos_count: int = 0
    videos_count: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ProjectCreate(BaseModel):
    title: str
    event_type: str
    event_date: str
    package_type: str

class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    package_name: str
    package_price: float
    event_date: str
    status: str = "Pending"  # Pending, Confirmed, Cancelled
    payment_status: str = "Pending"  # Pending, Advance Paid, Completed
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class BookingCreate(BaseModel):
    package_name: str
    package_price: float
    event_date: str

class GalleryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    category: str  # Wedding, Pre-Wedding, Portrait, Event
    media_type: str  # photo, video
    media_url: str
    thumbnail_url: Optional[str] = None
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DashboardOverview(BaseModel):
    total_projects: int
    active_bookings: int
    completed_projects: int
    upcoming_events: int

class SiteImage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    section: str  # hero, services, about, featured
    image_url: str
    alt_text: Optional[str] = None
    order: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SiteImageCreate(BaseModel):
    section: str
    image_url: str
    alt_text: Optional[str] = None
    order: int = 0

class ImageUploadResponse(BaseModel):
    image_url: str
    message: str

class ReorderRequest(BaseModel):
    items: List[dict]  # List of {id: str, order: int}

# ============ AUTH UTILITIES ============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
        # Check if user is admin
        user_doc = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user_doc or not user_doc.get('is_admin', False):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
        
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

# ============ AUTH ROUTES ============

@api_router.post("/auth/register", response_model=LoginResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_pw = hash_password(user_data.password)
    
    # Create user
    user_obj = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone
    )
    user_dict = user_obj.model_dump()
    user_dict['password'] = hashed_pw
    
    await db.users.insert_one(user_dict)
    
    # Generate token
    token = create_jwt_token(user_obj.id)
    
    return LoginResponse(token=token, user=user_obj)

@api_router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(login_data.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create user object (without password)
    user_doc.pop('password', None)
    user_obj = User(**user_doc)
    
    # Generate token
    token = create_jwt_token(user_obj.id)
    
    return LoginResponse(token=token, user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(user_id: str = Depends(get_current_user)):
    user_doc = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user_doc)

# ============ ADMIN ROUTES ============

@api_router.post("/admin/login", response_model=LoginResponse)
async def admin_login(login_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": login_data.email}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(login_data.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if admin
    if not user_doc.get('is_admin', False):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Create user object (without password)
    user_doc.pop('password', None)
    user_obj = User(**user_doc)
    
    # Generate token
    token = create_jwt_token(user_obj.id)
    
    return LoginResponse(token=token, user=user_obj)

@api_router.get("/admin/gallery", response_model=List[GalleryItem])
async def admin_get_gallery(user_id: str = Depends(get_admin_user)):
    items = await db.gallery.find({}, {"_id": 0}).to_list(1000)
    return [GalleryItem(**item) for item in items]

@api_router.delete("/admin/gallery/{item_id}")
async def admin_delete_gallery_item(item_id: str, user_id: str = Depends(get_admin_user)):
    result = await db.gallery.delete_one({"id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return {"message": "Gallery item deleted successfully"}

@api_router.post("/admin/gallery", response_model=GalleryItem)
async def admin_create_gallery_item(item: GalleryItem, user_id: str = Depends(get_admin_user)):
    item_dict = item.model_dump()
    await db.gallery.insert_one(item_dict)
    return item

@api_router.get("/admin/site-images", response_model=List[SiteImage])
async def admin_get_site_images(user_id: str = Depends(get_admin_user)):
    images = await db.site_images.find({}, {"_id": 0}).to_list(1000)
    return [SiteImage(**img) for img in images]

@api_router.post("/admin/site-images", response_model=SiteImage)
async def admin_create_site_image(image: SiteImageCreate, user_id: str = Depends(get_admin_user)):
    image_obj = SiteImage(**image.model_dump())
    image_dict = image_obj.model_dump()
    await db.site_images.insert_one(image_dict)
    return image_obj

@api_router.delete("/admin/site-images/{image_id}")
async def admin_delete_site_image(image_id: str, user_id: str = Depends(get_admin_user)):
    result = await db.site_images.delete_one({"id": image_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Site image not found")
    return {"message": "Site image deleted successfully"}

@api_router.put("/admin/site-images/bulk")
async def admin_update_site_images_bulk(images: List[SiteImageCreate], user_id: str = Depends(get_admin_user)):
    # Delete all existing site images
    await db.site_images.delete_many({})
    
    # Insert new images
    created_images = []
    for img_data in images:
        img_obj = SiteImage(**img_data.model_dump())
        img_dict = img_obj.model_dump()
        await db.site_images.insert_one(img_dict)
        created_images.append(img_obj)
    
    return {"message": f"Updated {len(created_images)} site images", "images": created_images}

@api_router.post("/admin/upload-image", response_model=ImageUploadResponse)
async def admin_upload_image(file: UploadFile = File(...), user_id: str = Depends(get_admin_user)):
    """Upload image and return base64 data URL"""
    try:
        # Read file content
        contents = await file.read()
        
        # Convert to base64
        base64_encoded = base64.b64encode(contents).decode('utf-8')
        
        # Determine mime type
        mime_type = file.content_type or 'image/jpeg'
        
        # Create data URL
        data_url = f"data:{mime_type};base64,{base64_encoded}"
        
        return ImageUploadResponse(
            image_url=data_url,
            message="Image uploaded successfully"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")

@api_router.put("/admin/gallery/reorder")
async def admin_reorder_gallery(request: ReorderRequest, user_id: str = Depends(get_admin_user)):
    """Reorder gallery items"""
    try:
        for item in request.items:
            await db.gallery.update_one(
                {"id": item["id"]},
                {"$set": {"order": item["order"]}}
            )
        return {"message": "Gallery reordered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reorder: {str(e)}")

@api_router.put("/admin/site-images/reorder")
async def admin_reorder_site_images(request: ReorderRequest, user_id: str = Depends(get_admin_user)):
    """Reorder site images"""
    try:
        for item in request.items:
            await db.site_images.update_one(
                {"id": item["id"]},
                {"$set": {"order": item["order"]}}
            )
        return {"message": "Site images reordered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reorder: {str(e)}")

@api_router.get("/site-images")
async def get_site_images():
    images = await db.site_images.find({}, {"_id": 0}).to_list(1000)
    return [SiteImage(**img) for img in images]

# ============ DASHBOARD ROUTES ============

@api_router.get("/dashboard/overview", response_model=DashboardOverview)
async def get_dashboard_overview(user_id: str = Depends(get_current_user)):
    projects = await db.projects.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    bookings = await db.bookings.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    total_projects = len(projects)
    active_bookings = len([b for b in bookings if b['status'] == 'Confirmed'])
    completed_projects = len([p for p in projects if p['status'] == 'Completed'])
    
    # Upcoming events (within next 30 days)
    now = datetime.now(timezone.utc)
    future_cutoff = now + timedelta(days=30)
    upcoming = 0
    for project in projects:
        try:
            event_date = datetime.fromisoformat(project['event_date'])
            if now <= event_date <= future_cutoff:
                upcoming += 1
        except:
            pass
    
    return DashboardOverview(
        total_projects=total_projects,
        active_bookings=active_bookings,
        completed_projects=completed_projects,
        upcoming_events=upcoming
    )

# ============ PROJECT ROUTES ============

@api_router.get("/projects", response_model=List[Project])
async def get_projects(user_id: str = Depends(get_current_user)):
    projects = await db.projects.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return [Project(**p) for p in projects]

@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate, user_id: str = Depends(get_current_user)):
    project_obj = Project(
        user_id=user_id,
        title=project_data.title,
        event_type=project_data.event_type,
        event_date=project_data.event_date,
        package_type=project_data.package_type
    )
    project_dict = project_obj.model_dump()
    await db.projects.insert_one(project_dict)
    return project_obj

# ============ BOOKING ROUTES ============

@api_router.get("/bookings", response_model=List[Booking])
async def get_bookings(user_id: str = Depends(get_current_user)):
    bookings = await db.bookings.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    return [Booking(**b) for b in bookings]

@api_router.post("/bookings", response_model=Booking)
async def create_booking(booking_data: BookingCreate, user_id: str = Depends(get_current_user)):
    booking_obj = Booking(
        user_id=user_id,
        package_name=booking_data.package_name,
        package_price=booking_data.package_price,
        event_date=booking_data.event_date
    )
    booking_dict = booking_obj.model_dump()
    await db.bookings.insert_one(booking_dict)
    return booking_obj

# ============ GALLERY ROUTES ============

@api_router.get("/gallery", response_model=List[GalleryItem])
async def get_gallery_items():
    items = await db.gallery.find({}, {"_id": 0}).to_list(1000)
    return [GalleryItem(**item) for item in items]

@api_router.post("/gallery", response_model=GalleryItem)
async def create_gallery_item(item: GalleryItem):
    item_dict = item.model_dump()
    await db.gallery.insert_one(item_dict)
    return item

# ============ ROOT ROUTE ============

@api_router.get("/")
async def root():
    return {"message": "Chitrakatha API", "status": "active"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Create default admin user and seed initial images"""
    # Create admin user if not exists
    admin_email = "admin@chitrakatha.com"
    existing_admin = await db.users.find_one({"email": admin_email}, {"_id": 0})
    
    if not existing_admin:
        admin_user = User(
            name="Admin",
            email=admin_email,
            is_admin=True
        )
        admin_dict = admin_user.model_dump()
        admin_dict['password'] = hash_password("admin123")  # Default password
        await db.users.insert_one(admin_dict)
        logger.info(f"Admin user created: {admin_email} / admin123")
    
    # Seed initial site images if none exist
    existing_images = await db.site_images.count_documents({})
    if existing_images == 0:
        initial_images = [
            # Hero images
            SiteImage(
                section="hero",
                image_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/3c6lzonb_WhatsApp%20Image%202026-02-18%20at%206.22.33%20PM%20%281%29.jpeg",
                alt_text="Elegant Bridal Portrait",
                order=0
            ),
            SiteImage(
                section="hero",
                image_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/u1naa4w7_WhatsApp%20Image%202026-02-20%20at%2012.04.55%20AM%20%282%29.jpeg",
                alt_text="Romantic Couple at Archway",
                order=1
            ),
            # Featured work
            SiteImage(
                section="featured",
                image_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/520ttye7_WhatsApp%20Image%202026-02-20%20at%2012.04.55%20AM%20%281%29.jpeg",
                alt_text="Pre-wedding couple portrait",
                order=0
            ),
            SiteImage(
                section="featured",
                image_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/zf1vnqdd_WhatsApp%20Image%202026-02-20%20at%2012.04.57%20AM.jpeg",
                alt_text="Joyful wedding celebration",
                order=1
            ),
            SiteImage(
                section="featured",
                image_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/7jad38aw_WhatsApp%20Image%202026-02-18%20at%206.22.33%20PM.jpeg",
                alt_text="Artistic bridal portrait",
                order=2
            ),
            # Service images
            SiteImage(
                section="services",
                image_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/nd8u6n4a_WhatsApp%20Image%202026-02-18%20at%206.22.32%20PM.jpeg",
                alt_text="Traditional package",
                order=0
            ),
            SiteImage(
                section="services",
                image_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/3c6lzonb_WhatsApp%20Image%202026-02-18%20at%206.22.33%20PM%20%281%29.jpeg",
                alt_text="Semi-Cinematic package",
                order=1
            ),
            SiteImage(
                section="services",
                image_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/520ttye7_WhatsApp%20Image%202026-02-20%20at%2012.04.55%20AM%20%281%29.jpeg",
                alt_text="Cinematic package",
                order=2
            ),
            SiteImage(
                section="services",
                image_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/u1naa4w7_WhatsApp%20Image%202026-02-20%20at%2012.04.55%20AM%20%282%29.jpeg",
                alt_text="Premium package",
                order=3
            ),
            # About page
            SiteImage(
                section="about",
                image_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/zf1vnqdd_WhatsApp%20Image%202026-02-20%20at%2012.04.57%20AM.jpeg",
                alt_text="Our team capturing moments",
                order=0
            )
        ]
        
        for img in initial_images:
            await db.site_images.insert_one(img.model_dump())
        
        logger.info(f"Seeded {len(initial_images)} initial site images")
    
    # Seed initial gallery items
    existing_gallery = await db.gallery.count_documents({})
    if existing_gallery == 0:
        gallery_items = [
            # First set of images
            GalleryItem(
                title="Beautiful Bride Portrait",
                category="Wedding",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/nd8u6n4a_WhatsApp%20Image%202026-02-18%20at%206.22.32%20PM.jpeg",
                order=0
            ),
            GalleryItem(
                title="Romantic Pre-Wedding Shoot",
                category="Pre-Wedding",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/2y1wmxgm_WhatsApp%20Image%202026-02-20%20at%2012.04.55%20AM%20%282%29.jpeg",
                order=1
            ),
            GalleryItem(
                title="Couple Portrait Session",
                category="Pre-Wedding",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/rev1u9a6_WhatsApp%20Image%202026-02-20%20at%2012.04.55%20AM.jpeg",
                order=2
            ),
            GalleryItem(
                title="Haldi Ceremony Celebration",
                category="Wedding",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/iuyyqp11_WhatsApp%20Image%202026-02-20%20at%2012.04.56%20AM%20%281%29.jpeg",
                order=3
            ),
            GalleryItem(
                title="Wedding Day Group Photo",
                category="Wedding",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/7kr5tkeu_WhatsApp%20Image%202026-02-20%20at%2012.04.56%20AM.jpeg",
                order=4
            ),
            # New set of images
            GalleryItem(
                title="Elegant Bridal Portrait",
                category="Wedding",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/3c6lzonb_WhatsApp%20Image%202026-02-18%20at%206.22.33%20PM%20%281%29.jpeg",
                order=5
            ),
            GalleryItem(
                title="Artistic Bride Close-up",
                category="Portrait",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/7jad38aw_WhatsApp%20Image%202026-02-18%20at%206.22.33%20PM.jpeg",
                order=6
            ),
            GalleryItem(
                title="Pre-Wedding Couple in Black",
                category="Pre-Wedding",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/520ttye7_WhatsApp%20Image%202026-02-20%20at%2012.04.55%20AM%20%281%29.jpeg",
                order=7
            ),
            GalleryItem(
                title="Romantic Archway Moment",
                category="Pre-Wedding",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/u1naa4w7_WhatsApp%20Image%202026-02-20%20at%2012.04.55%20AM%20%282%29.jpeg",
                order=8
            ),
            GalleryItem(
                title="Joyful Wedding Celebration",
                category="Wedding",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/zf1vnqdd_WhatsApp%20Image%202026-02-20%20at%2012.04.57%20AM.jpeg",
                order=9
            ),
            # Hero slideshow images added to gallery
            GalleryItem(
                title="Radiant Bride in Red",
                category="Wedding",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/c7tws8fd_DRP_0150.jpg.jpeg",
                order=10
            ),
            GalleryItem(
                title="Bridal Elegance",
                category="Portrait",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/1jyxdn7l_DRP_0213.jpg.jpeg",
                order=11
            ),
            GalleryItem(
                title="Traditional Bengali Bride",
                category="Wedding",
                media_type="photo",
                media_url="https://customer-assets.emergentagent.com/job_multi-page-site-4/artifacts/dzf4ww5n_DRP_0484.jpg.jpeg",
                order=12
            )
        ]
        
        for item in gallery_items:
            await db.gallery.insert_one(item.model_dump())
        
        logger.info(f"Seeded {len(gallery_items)} initial gallery items")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()