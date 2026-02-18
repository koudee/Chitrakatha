from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
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
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DashboardOverview(BaseModel):
    total_projects: int
    active_bookings: int
    completed_projects: int
    upcoming_events: int

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()