from fastapi import FastAPI, APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import os
import logging
import uuid
import qrcode
import io
import base64
import json
import asyncio
import random
from enum import Enum
import schedule
import threading
import time

# Importar módulos avanzados de IA (versiones ligeras)
from ai_modules.deepfake_detection_light import content_verification_service
from ai_modules.autonomous_agent_light import dami_autonomous_agent
from ai_modules.predictive_analysis_light import advanced_predictive_analytics
from ai_modules.emotional_intelligence_light import emotional_intelligence_system

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = "dami_secret_key_2025_intelligence_platform"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app
app = FastAPI(title="DAMI Intelligence Platform", version="1.0.0")
api_router = APIRouter(prefix="/api")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enums
class UserRole(str, Enum):
    ADMINISTRATOR = "administrator"
    ANALYST = "analyst"
    OPERATOR = "operator"

class AlertLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ActorStatus(str, Enum):
    VERDE = "verde"
    AMARILLA = "amarilla"
    NARANJA = "naranja"
    ROJA = "roja"

# Pydantic Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    hashed_password: str
    role: UserRole
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    is_active: bool = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class PoliticalActor(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    status: ActorStatus
    activity_description: str
    social_media_handle: Optional[str] = None
    last_update: datetime = Field(default_factory=datetime.utcnow)
    keywords: List[str] = []
    influence_score: int = 0

class TerritorialZone(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    status: ActorStatus
    activity_level: int
    description: str
    coordinates: Optional[Dict[str, float]] = None
    last_update: datetime = Field(default_factory=datetime.utcnow)

class SocialMediaPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author: str
    content: str
    platform: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    alert_level: AlertLevel
    keywords_triggered: List[str] = []
    sentiment_score: float = 0.0

class AIRecommendation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str
    description: str
    priority: AlertLevel
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    context: Dict[str, Any] = {}
    actions_suggested: List[str] = []
    is_executed: bool = False

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_message: str
    bot_response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: str

class Alert(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    level: AlertLevel
    source: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    keywords: List[str] = []
    is_read: bool = False
    assigned_to: Optional[str] = None

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# Initialize default data
INITIAL_USERS = {
    "luis": {"password": "claveDAMI2025", "role": UserRole.ADMINISTRATOR},
    "rovira": {"password": "confidencial123", "role": UserRole.ADMINISTRATOR},
    "castano": {"password": "tactico456", "role": UserRole.ANALYST},
    "torres": {"password": "vision789", "role": UserRole.ANALYST},
    "victoria": {"password": "coordinacion321", "role": UserRole.OPERATOR}
}

INITIAL_ACTORS = [
    {
        "name": "Carlos Rovira",
        "status": ActorStatus.ROJA,
        "activity_description": "Actividad Crítica",
        "social_media_handle": "@CarlosRovira",
        "keywords": ["rovira", "crítica", "ataque"],
        "influence_score": 95
    },
    {
        "name": "Diego Harfield",
        "status": ActorStatus.NARANJA,
        "activity_description": "Ataque discursivo",
        "social_media_handle": "@DiegoHarfield",
        "keywords": ["harfield", "ataque", "discurso"],
        "influence_score": 75
    },
    {
        "name": "Hugo Passalacqua",
        "status": ActorStatus.VERDE,
        "activity_description": "Discurso neutro",
        "social_media_handle": "@HugoPassalacqua",
        "keywords": ["passalacqua", "neutro", "gobierno"],
        "influence_score": 60
    }
]

INITIAL_ZONES = [
    {
        "name": "Zona Sur",
        "status": ActorStatus.ROJA,
        "activity_level": 90,
        "description": "Alta tensión política"
    },
    {
        "name": "Puerto Rico",
        "status": ActorStatus.AMARILLA,
        "activity_level": 60,
        "description": "Actividad moderada"
    },
    {
        "name": "Eldorado",
        "status": ActorStatus.VERDE,
        "activity_level": 30,
        "description": "Zona estable"
    },
    {
        "name": "San Vicente",
        "status": ActorStatus.NARANJA,
        "activity_level": 75,
        "description": "Tensión creciente"
    }
]

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

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
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"username": username})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

def generate_qr_code(data: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

# AI Simulation Functions
def generate_ai_recommendation(context: Dict[str, Any]) -> AIRecommendation:
    recommendations = [
        "Responder con refuerzo emocional en zona sur",
        "Emitir spot radial breve de 30 seg con voz emocional",
        "Publicar desmentida visual en redes sociales",
        "Activar red de influencers afines",
        "Coordinar respuesta mediática inmediata",
        "Preparar conferencia de prensa de emergencia"
    ]
    
    return AIRecommendation(
        type="tactical_response",
        description=random.choice(recommendations),
        priority=random.choice(list(AlertLevel)),
        context=context,
        actions_suggested=[
            "Monitorear reacciones en tiempo real",
            "Ajustar mensaje según feedback",
            "Preparar plan de contingencia"
        ]
    )

def simulate_social_media_post() -> SocialMediaPost:
    posts = [
        {"author": "Sr. X", "content": "Esto es una maniobra de desgaste del oficialismo", "platform": "Twitter"},
        {"author": "Analista Z", "content": "La situación política se intensifica en el sur", "platform": "Facebook"},
        {"author": "Periodista Y", "content": "Nuevas declaraciones causan controversia", "platform": "Instagram"},
        {"author": "Ciudadano A", "content": "¿Cuándo van a solucionar los problemas reales?", "platform": "Twitter"}
    ]
    
    post_data = random.choice(posts)
    keywords = ["política", "gobierno", "oposición", "maniobra", "controversia"]
    
    return SocialMediaPost(
        author=post_data["author"],
        content=post_data["content"],
        platform=post_data["platform"],
        alert_level=random.choice(list(AlertLevel)),
        keywords_triggered=random.sample(keywords, random.randint(1, 3)),
        sentiment_score=random.uniform(-1.0, 1.0)
    )

# DAMI Bot responses
def generate_bot_response(user_message: str, user_role: UserRole) -> str:
    responses = {
        UserRole.ADMINISTRATOR: [
            "Como administrador, recomiendo evaluar la situación estratégicamente antes de actuar.",
            "Los datos indican una tendencia que requiere tu atención inmediata.",
            "¿Deseas que active el protocolo de respuesta rápida?",
            "Sugiero convocar una reunión de emergencia con el equipo analítico."
        ],
        UserRole.ANALYST: [
            "Basado en los patrones de datos, sugiero profundizar en este análisis.",
            "Los indicadores muestran correlaciones interesantes que deberías investigar.",
            "¿Necesitas que genere un reporte detallado sobre esta situación?",
            "Te recomiendo monitorear las siguientes variables clave."
        ],
        UserRole.OPERATOR: [
            "Como operador, tu función es crucial para implementar las estrategias.",
            "¿Necesitas instrucciones específicas para esta operación?",
            "Verifica que todos los canales de comunicación estén activos.",
            "Confirma la ejecución de las acciones antes de proceder."
        ]
    }
    
    role_responses = responses.get(user_role, responses[UserRole.OPERATOR])
    return random.choice(role_responses)

# Background tasks for real-time simulation
async def simulate_real_time_data():
    while True:
        try:
            # Generate new social media post
            new_post = simulate_social_media_post()
            await db.social_media_posts.insert_one(new_post.dict())
            
            # Generate AI recommendation
            recommendation = generate_ai_recommendation({"source": "background_monitoring"})
            await db.ai_recommendations.insert_one(recommendation.dict())
            
            # Broadcast updates via WebSocket
            await manager.broadcast(json.dumps({
                "type": "new_post",
                "data": {
                    **new_post.dict(),
                    "timestamp": new_post.timestamp.isoformat()
                },
                "timestamp": datetime.utcnow().isoformat()
            }, default=str))
            
            await asyncio.sleep(30)  # Generate new data every 30 seconds
        except Exception as e:
            print(f"Background task error: {e}")
            await asyncio.sleep(60)

# Startup event
@app.on_event("startup")
async def startup_event():
    # Initialize users
    for username, data in INITIAL_USERS.items():
        existing_user = await db.users.find_one({"username": username})
        if not existing_user:
            user = User(
                username=username,
                hashed_password=get_password_hash(data["password"]),
                role=data["role"]
            )
            await db.users.insert_one(user.dict())
    
    # Initialize political actors
    for actor_data in INITIAL_ACTORS:
        existing_actor = await db.political_actors.find_one({"name": actor_data["name"]})
        if not existing_actor:
            actor = PoliticalActor(**actor_data)
            await db.political_actors.insert_one(actor.dict())
    
    # Initialize zones
    for zone_data in INITIAL_ZONES:
        existing_zone = await db.territorial_zones.find_one({"name": zone_data["name"]})
        if not existing_zone:
            zone = TerritorialZone(**zone_data)
            await db.territorial_zones.insert_one(zone.dict())
    
    # Start background tasks
    asyncio.create_task(simulate_real_time_data())

# Authentication endpoints
@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"username": user_data.username})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    # Update last login
    await db.users.update_one(
        {"username": user_data.username},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user["role"],
        "username": user["username"]
    }

@api_router.post("/auth/qr-generate")
async def generate_qr(current_user: User = Depends(get_current_user)):
    qr_data = f"https://damicentro.ai/login?user={current_user.username}&role={current_user.role}"
    qr_image = generate_qr_code(qr_data)
    return {"qr_code": qr_image, "data": qr_data}

# Political actors endpoints
@api_router.get("/actors", response_model=List[PoliticalActor])
async def get_political_actors(current_user: User = Depends(get_current_user)):
    actors = await db.political_actors.find().to_list(1000)
    return [PoliticalActor(**actor) for actor in actors]

@api_router.post("/actors", response_model=PoliticalActor)
async def create_political_actor(
    actor: PoliticalActor,
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.ADMINISTRATOR, UserRole.ANALYST]:
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    
    actor_dict = actor.dict()
    await db.political_actors.insert_one(actor_dict)
    return actor

# Territorial zones endpoints
@api_router.get("/zones", response_model=List[TerritorialZone])
async def get_territorial_zones(current_user: User = Depends(get_current_user)):
    zones = await db.territorial_zones.find().to_list(1000)
    return [TerritorialZone(**zone) for zone in zones]

# Social media feed endpoints
@api_router.get("/feed", response_model=List[SocialMediaPost])
async def get_social_media_feed(
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    posts = await db.social_media_posts.find().sort("timestamp", -1).limit(limit).to_list(limit)
    return [SocialMediaPost(**post) for post in posts]

# AI recommendations endpoints
@api_router.get("/recommendations", response_model=List[AIRecommendation])
async def get_ai_recommendations(
    limit: int = 20,
    current_user: User = Depends(get_current_user)
):
    recommendations = await db.ai_recommendations.find().sort("timestamp", -1).limit(limit).to_list(limit)
    return [AIRecommendation(**rec) for rec in recommendations]

# Alerts endpoints
@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    alerts = await db.alerts.find().sort("timestamp", -1).limit(limit).to_list(limit)
    return [Alert(**alert) for alert in alerts]

# Chat endpoints
@api_router.post("/chat")
async def chat_with_dami_bot(
    message: dict,
    current_user: User = Depends(get_current_user)
):
    user_message = message.get("message", "")
    session_id = message.get("session_id", str(uuid.uuid4()))
    
    bot_response = generate_bot_response(user_message, current_user.role)
    
    chat_message = ChatMessage(
        session_id=session_id,
        user_message=user_message,
        bot_response=bot_response,
        user_id=current_user.id
    )
    
    await db.chat_messages.insert_one(chat_message.dict())
    
    return {
        "response": bot_response,
        "session_id": session_id,
        "timestamp": datetime.utcnow()
    }

# Dashboard summary endpoint
@api_router.get("/dashboard/summary")
async def get_dashboard_summary(current_user: User = Depends(get_current_user)):
    actors_count = await db.political_actors.count_documents({})
    zones_count = await db.territorial_zones.count_documents({})
    recent_posts = await db.social_media_posts.count_documents({
        "timestamp": {"$gte": datetime.utcnow() - timedelta(hours=24)}
    })
    active_alerts = await db.alerts.count_documents({"is_read": False})
    
    return {
        "actors_monitored": actors_count,
        "territorial_zones": zones_count,
        "recent_social_activity": recent_posts,
        "active_alerts": active_alerts,
        "last_update": datetime.utcnow()
    }

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket messages if needed
            await manager.send_personal_message(f"Message received: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ============================================================================
# MÓDULOS AVANZADOS DE IA - ENDPOINTS
# ============================================================================

@api_router.post("/ai/deepfake-detection")
async def analyze_deepfake_content(
    request: dict,
    current_user: dict = Depends(get_current_user)
):
    """Analizar contenido para detectar deepfakes y desinformación"""
    try:
        content_type = request.get("content_type")  # "text" o "image"
        content_data = request.get("content_data")
        source_url = request.get("source_url")
        
        if not content_type or not content_data:
            raise HTTPException(status_code=400, detail="Faltan parámetros requeridos")
        
        result = await content_verification_service.verify_content(
            content_type, content_data, source_url
        )
        
        return {
            "analysis_result": result,
            "user": current_user["username"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error en análisis de deepfake: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ai/deepfake-detection/stats")
async def get_deepfake_stats(current_user: dict = Depends(get_current_user)):
    """Obtener estadísticas de verificación de contenido"""
    try:
        stats = await content_verification_service.get_verification_stats()
        return stats
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/autonomous-agent/start")
async def start_autonomous_agent(current_user: dict = Depends(get_current_user)):
    """Iniciar el agente autónomo DAMI-GPT"""
    try:
        # Solo administradores pueden iniciar el agente autónomo
        if current_user["role"] != "Administrator":
            raise HTTPException(status_code=403, detail="Solo administradores pueden iniciar el agente autónomo")
        
        result = await dami_autonomous_agent.start_autonomous_monitoring()
        return result
        
    except Exception as e:
        logger.error(f"Error iniciando agente autónomo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/autonomous-agent/analyze")
async def analyze_situation_autonomous(
    request: dict,
    current_user: dict = Depends(get_current_user)
):
    """Analizar situación con el agente autónomo"""
    try:
        situation_data = request.get("situation_data", {})
        
        # Agregar datos del sistema actual para análisis
        actors = list(db.actors.find({}, {"_id": 0}))
        zones = list(db.zones.find({}, {"_id": 0}))
        recent_posts = list(db.feed.find({}).sort("timestamp", -1).limit(20))
        
        situation_data.update({
            "actors": actors,
            "zones": zones,
            "social_posts": recent_posts,
            "timestamp": datetime.utcnow().isoformat()
        })
        
        result = await dami_autonomous_agent.analyze_situation(situation_data)
        return result
        
    except Exception as e:
        logger.error(f"Error en análisis autónomo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ai/autonomous-agent/status")
async def get_autonomous_agent_status(current_user: dict = Depends(get_current_user)):
    """Obtener estado del agente autónomo"""
    try:
        status = dami_autonomous_agent.get_agent_status()
        return status
    except Exception as e:
        logger.error(f"Error obteniendo estado del agente: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/autonomous-agent/stop")
async def stop_autonomous_agent(current_user: dict = Depends(get_current_user)):
    """Detener el agente autónomo"""
    try:
        if current_user["role"] != "Administrator":
            raise HTTPException(status_code=403, detail="Solo administradores pueden detener el agente")
        
        result = await dami_autonomous_agent.stop_monitoring()
        return result
        
    except Exception as e:
        logger.error(f"Error deteniendo agente autónomo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/predictive-analysis")
async def run_predictive_analysis(current_user: dict = Depends(get_current_user)):
    """Ejecutar análisis predictivo completo"""
    try:
        # Recopilar datos del sistema
        actors = list(db.actors.find({}, {"_id": 0}))
        zones = list(db.zones.find({}, {"_id": 0}))
        social_media = list(db.feed.find({}).sort("timestamp", -1).limit(100))
        
        system_data = {
            "actors": actors,
            "zones": zones,
            "social_media": social_media,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        result = await advanced_predictive_analytics.run_comprehensive_prediction(system_data)
        return result
        
    except Exception as e:
        logger.error(f"Error en análisis predictivo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ai/predictive-analysis/status")
async def get_predictive_analytics_status(current_user: dict = Depends(get_current_user)):
    """Obtener estado del sistema de análisis predictivo"""
    try:
        status = advanced_predictive_analytics.get_analytics_status()
        return status
    except Exception as e:
        logger.error(f"Error obteniendo estado de análisis predictivo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/emotional-intelligence")
async def run_emotional_analysis(current_user: dict = Depends(get_current_user)):
    """Ejecutar análisis emocional y psicológico completo"""
    try:
        # Recopilar datos para análisis emocional
        actors = list(db.actors.find({}, {"_id": 0}))
        social_posts = list(db.feed.find({}).sort("timestamp", -1).limit(50))
        
        analysis_data = {
            "political_actors": actors,
            "social_media_posts": social_posts,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        result = await emotional_intelligence_system.run_comprehensive_emotional_analysis(analysis_data)
        return result
        
    except Exception as e:
        logger.error(f"Error en análisis emocional: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ai/emotional-intelligence/status")
async def get_emotional_intelligence_status(current_user: dict = Depends(get_current_user)):
    """Obtener estado del sistema de inteligencia emocional"""
    try:
        status = emotional_intelligence_system.get_system_status()
        return status
    except Exception as e:
        logger.error(f"Error obteniendo estado de inteligencia emocional: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ai/modules/overview")
async def get_ai_modules_overview(current_user: dict = Depends(get_current_user)):
    """Obtener resumen de todos los módulos IA"""
    try:
        # Obtener estado de todos los módulos
        deepfake_stats = await content_verification_service.get_verification_stats()
        agent_status = dami_autonomous_agent.get_agent_status()
        predictive_status = advanced_predictive_analytics.get_analytics_status()
        emotional_status = emotional_intelligence_system.get_system_status()
        
        return {
            "ai_modules_status": "operational",
            "modules": {
                "deepfake_detection": {
                    "name": "Detección de Deepfakes",
                    "status": "active",
                    "verifications": deepfake_stats.get("total_verifications", 0),
                    "accuracy": deepfake_stats.get("accuracy_rate", 0.89)
                },
                "autonomous_agent": {
                    "name": "Agente Autónomo DAMI-GPT",
                    "status": agent_status.get("agent_state", "idle"),
                    "decisions_made": agent_status.get("decisions_made", 0),
                    "monitoring": agent_status.get("active_monitoring", False)
                },
                "predictive_analysis": {
                    "name": "Análisis Predictivo",
                    "status": predictive_status.get("system_status", "operational"),
                    "active_predictions": predictive_status.get("active_predictions", 0),
                    "prediction_types": len(predictive_status.get("supported_prediction_types", []))
                },
                "emotional_intelligence": {
                    "name": "Inteligencia Emocional",
                    "status": emotional_status.get("system_status", "operational"),
                    "supported_emotions": emotional_status.get("supported_emotions", 0),
                    "analysis_method": emotional_status.get("analysis_method", "heuristic")
                }
            },
            "total_modules": 4,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo resumen de módulos IA: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()