from fastapi import FastAPI, APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
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
from ai_modules.centro_comando_backend import situacion_analyzer, monitoreo_tiempo_real
from ai_modules.centro_estadistico_backend import centro_estadistico
from ai_modules.informe_diario_backend import informe_diario
from ai_modules.analisis_competencia_backend import analisis_competencia
from ai_modules.encuestas_sociales_backend import encuestas_sociales

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
    """
    Genera respuestas inteligentes basadas en el mensaje del usuario y su rol
    """
    user_message_lower = user_message.lower()
    
    # Respuestas específicas por contenido del mensaje
    if any(keyword in user_message_lower for keyword in ["situación", "situacion", "estado", "actualidad", "actual"]):
        if user_role == UserRole.ADMINISTRATOR:
            return """🎯 **Situación Actual del Sistema DAMI**

**Estado General:** ✅ OPERATIVO
• Centro de Comando: Activo y monitoreando
• Redes Sociales: Twitter, Facebook, Instagram integradas
• Análisis IA: 4 módulos funcionando correctamente

**Métricas Clave:**
• Actores monitoreados: 50+ perfiles políticos
• Alertas activas: Nivel medio de actividad
• Cobertura territorial: 78 municipios de Misiones

**Recomendaciones:**
1. Revisar Dashboard General para métricas detalladas
2. Consultar Centro Estadístico para análisis de tendencias
3. Verificar alertas en el módulo de IA Táctica"""
            
        elif user_role == UserRole.ANALYST:
            return """📊 **Análisis de Situación Actual**

**Datos Procesados:**
• Últimas 24h: Actividad social media estable
• Sentiment general: Neutro-positivo (+0.2)
• Tendencias: Sin anomalías significativas

**Insights Clave:**
• Frente Renovador: Posición sólida en redes
• Competencia: Actividad normal sin campañas coordinadas
• Territorio: Misiones muestra estabilidad general

**Próximos Pasos:**
1. Generar informe diario completo
2. Analizar patrones de engagement
3. Monitorear competencia política"""
            
        else:  # OPERATOR
            return """⚡ **Estado Operativo Actual**

**Sistemas Activos:**
• Monitoreo tiempo real: ✅ Funcionando
• Alertas automáticas: ✅ Configuradas
• Canales de comunicación: ✅ Operativos

**Acciones Pendientes:**
• Verificar integridad de datos
• Confirmar conexiones API
• Validar flujos de información

**Protocolo Sugerido:**
1. Ejecutar verificación de sistemas
2. Confirmar respaldo de datos
3. Reportar cualquier anomalía"""
    
    elif any(keyword in user_message_lower for keyword in ["reporte", "informe", "resumen", "análisis", "analisis"]):
        if user_role == UserRole.ADMINISTRATOR:
            return """📋 **Generación de Reportes Ejecutivos**

**Reportes Disponibles:**
• **Informe Diario:** Resumen completo de actividad
• **Centro Estadístico:** Métricas y KPIs
• **Análisis Competencia:** Monitoreo de oposición
• **Mapa Territorial:** Actividad por municipio

**Recomendación:**
1. Navegar a "Informe Diario" para resumen ejecutivo
2. Usar "Centro Estadístico" para análisis detallado
3. Consultar "Análisis Competencia" para inteligencia

**Nota:** Todos los reportes se actualizan automáticamente cada hora."""
            
        elif user_role == UserRole.ANALYST:
            return """🔍 **Capacidades de Análisis Avanzado**

**Módulos Analíticos:**
• **Análisis Predictivo:** Proyecciones y tendencias
• **Inteligencia Emocional:** Sentiment analysis
• **Detección Deepfakes:** Verificación de contenido
• **Análisis Competencia:** Monitoreo oposición

**Herramientas Disponibles:**
1. Dashboard con métricas en tiempo real
2. Visualizaciones interactivas de datos
3. Exportación de reportes en PDF
4. Alertas automáticas por patrones

**Sugerencia:** Comienza con el Centro Estadístico para análisis base."""
            
        else:  # OPERATOR
            return """📊 **Procedimientos de Reporte**

**Reportes Operativos:**
• Estado de sistemas: Verificar funcionamiento
• Incidentes: Documentar anomalías
• Métricas básicas: Confirmar datos
• Alertas: Validar y procesar

**Flujo de Trabajo:**
1. Verificar datos en Dashboard
2. Confirmar alertas activas
3. Generar reporte de turno
4. Escalar incidentes críticos

**Recordatorio:** Siempre documentar acciones tomadas."""
    
    elif any(keyword in user_message_lower for keyword in ["alertas", "emergencia", "crítico", "critico", "riesgo"]):
        if user_role == UserRole.ADMINISTRATOR:
            return """🚨 **Protocolo de Alertas Críticas**

**Niveles de Alerta:**
• **CRÍTICO:** Requiere acción inmediata
• **ALTO:** Atención en próximas 2 horas
• **MEDIO:** Seguimiento rutinario
• **BAJO:** Monitoreo pasivo

**Protocolos Activados:**
1. Notificación automática a equipos
2. Escalamiento según procedimientos
3. Documentación de respuestas
4. Seguimiento post-incidente

**Acciones Disponibles:**
• Activar "Respuesta de Emergencia"
• Coordinar "Red de Apoyo"
• Lanzar "Campaña Positiva"
• Implementar "Contramedidas"

**Navegar a:** IA Táctica → Alertas Activas"""
            
        elif user_role == UserRole.ANALYST:
            return """⚠️ **Análisis de Riesgos y Alertas**

**Tipos de Alertas:**
• **Sociales:** Cambios en sentiment o engagement
• **Políticas:** Actividad de competencia
• **Territoriales:** Anomalías por región
• **Técnicas:** Problemas de sistema

**Herramientas de Análisis:**
1. Algoritmos de detección de anomalías
2. Análisis de patrones históricos
3. Correlación de eventos múltiples
4. Predicción de escalamiento

**Recomendación:** Usar módulos de IA para análisis profundo."""
            
        else:  # OPERATOR
            return """🔔 **Gestión de Alertas Operativas**

**Procedimiento de Respuesta:**
1. **Recibir:** Confirmar recepción de alerta
2. **Evaluar:** Determinar nivel de severidad
3. **Actuar:** Ejecutar protocolo correspondiente
4. **Reportar:** Documentar acciones tomadas

**Canales de Comunicación:**
• WhatsApp: Alertas inmediatas
• Email: Reportes detallados
• Dashboard: Monitoreo continuo
• Escalamiento: Supervisores

**Importante:** Nunca ignorar alertas críticas."""
    
    elif any(keyword in user_message_lower for keyword in ["ayuda", "help", "cómo", "como", "tutorial", "guía", "guia"]):
        if user_role == UserRole.ADMINISTRATOR:
            return """🎓 **Guía del Administrador DAMI**

**Módulos Principales:**
• **Dashboard:** Vista general del sistema
• **Centro Comando:** Análisis estratégico
• **Mapa Misiones:** Visualización territorial
• **IA Táctica:** Alertas inteligentes

**Funciones Administrativas:**
1. Gestión de usuarios y permisos
2. Configuración de alertas
3. Supervisión de módulos IA
4. Generación de reportes ejecutivos

**Navegación Rápida:**
• Usa el menú lateral para acceder a módulos
• Los iconos indican el estado de cada sistema
• Las notificaciones aparecen automáticamente
• DAMIBOT te asiste en tiempo real

**Tip:** Comienza siempre por el Dashboard para obtener el panorama general."""
            
        elif user_role == UserRole.ANALYST:
            return """📈 **Guía del Analista DAMI**

**Herramientas Analíticas:**
• **Centro Estadístico:** Métricas y KPIs
• **Informe Diario:** Análisis temporal
• **Análisis Competencia:** Inteligencia oposición
• **Módulos IA:** Análisis avanzado

**Metodología de Trabajo:**
1. Revisar métricas en Centro Estadístico
2. Analizar tendencias en Informe Diario
3. Monitorear competencia continuamente
4. Usar IA para insights profundos

**Capacidades Especiales:**
• Análisis de sentiment en tiempo real
• Detección de patrones anómalos
• Predicción de tendencias
• Correlación de eventos múltiples

**Recomendación:** Usa múltiples fuentes de datos para análisis completo."""
            
        else:  # OPERATOR
            return """🛠️ **Guía del Operador DAMI**

**Funciones Operativas:**
• **Monitoreo:** Vigilancia continua de sistemas
• **Alertas:** Gestión y respuesta inmediata
• **Reportes:** Documentación de actividades
• **Coordinación:** Enlace con otros niveles

**Procedimientos Básicos:**
1. Verificar estado de sistemas al inicio
2. Monitorear alertas constantemente
3. Responder según protocolos
4. Documentar todas las acciones

**Herramientas Disponibles:**
• Dashboard para monitoreo básico
• Sistema de alertas automatizado
• Canales de comunicación directa
• Protocolos de escalamiento

**Importante:** Siempre seguir procedimientos establecidos."""
    
    elif any(keyword in user_message_lower for keyword in ["redes", "social", "twitter", "facebook", "instagram"]):
        return """📱 **Integración de Redes Sociales**

**Plataformas Conectadas:**
• **Twitter API v2:** ✅ Activa - Monitoreo en tiempo real
• **Facebook Graph API:** ✅ Activa - Posts y engagement
• **Instagram Basic API:** ✅ Activa - Contenido público

**Métricas Monitoreadas:**
• Menciones del Frente Renovador
• Sentiment score automático
• Engagement rate por plataforma
• Detección de contenido crítico

**Funcionalidades:**
1. Recopilación automática de datos
2. Análisis de sentiment en tiempo real
3. Detección de campañas coordinadas
4. Alertas por actividad anómala

**Acceso:** Centro Estadístico → Redes Sociales"""
    
    elif any(keyword in user_message_lower for keyword in ["mapa", "misiones", "territorial", "municipio"]):
        return """🗺️ **Mapa Territorial de Misiones**

**Cobertura Completa:**
• 78 municipios monitoreados
• Indicadores de actividad tipo "semáforo"
• Centralización en coordenadas de Misiones
• Zoom optimizado para visualización

**Estados de Actividad:**
• 🟢 **Verde:** Actividad normal
• 🟡 **Amarillo:** Actividad moderada
• 🔴 **Rojo:** Actividad crítica

**Datos Integrados:**
• Actividad en redes sociales por región
• Sentiment territorial
• Engagement por municipio
• Alertas georreferenciadas

**Navegación:** Menú → Mapa de Misiones"""
    
    else:
        # Respuestas generales por rol
        role_responses = {
            UserRole.ADMINISTRATOR: [
                "Como administrador, tienes acceso completo a todas las funcionalidades DAMI. ¿En qué módulo necesitas asistencia?",
                "El sistema está operativo. Revisa el Dashboard para métricas actualizadas o consulta módulos específicos.",
                "¿Necesitas generar un reporte ejecutivo o consultar algún análisis específico?",
                "Puedo ayudarte con configuración de alertas, análisis de datos o gestión de usuarios."
            ],
            UserRole.ANALYST: [
                "Como analista, puedes acceder a herramientas avanzadas de análisis. ¿Qué tipo de análisis necesitas?",
                "Usa el Centro Estadístico para métricas detalladas o el Informe Diario para análisis temporal.",
                "¿Deseas analizar competencia política, sentiment de redes sociales o tendencias territoriales?",
                "Los módulos de IA pueden proporcionarte insights profundos sobre los datos."
            ],
            UserRole.OPERATOR: [
                "Como operador, tu función es clave para la ejecución. ¿Necesitas verificar el estado de algún sistema?",
                "Verifica alertas activas en el Dashboard y confirma que todos los canales estén funcionando.",
                "¿Requieres procedimientos específicos para alguna operación o protocolo de respuesta?",
                "Mantén monitoreo constante y reporta cualquier anomalía inmediatamente."
            ]
        }
        
        role_responses_list = role_responses.get(user_role, role_responses[UserRole.OPERATOR])
        return random.choice(role_responses_list)

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
    current_user: User = Depends(get_current_user)
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
            "user": current_user.username,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error en análisis de deepfake: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ai/deepfake-detection/stats")
async def get_deepfake_stats(current_user: User = Depends(get_current_user)):
    """Obtener estadísticas de verificación de contenido"""
    try:
        stats = await content_verification_service.get_verification_stats()
        return stats
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/autonomous-agent/start")
async def start_autonomous_agent(current_user: User = Depends(get_current_user)):
    """Iniciar el agente autónomo DAMI-GPT"""
    try:
        # Solo administradores pueden iniciar el agente autónomo
        if current_user.role != UserRole.ADMINISTRATOR:
            raise HTTPException(status_code=403, detail="Solo administradores pueden iniciar el agente autónomo")
        
        result = await dami_autonomous_agent.start_autonomous_monitoring()
        return result
        
    except Exception as e:
        logger.error(f"Error iniciando agente autónomo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/autonomous-agent/analyze")
async def analyze_situation_autonomous(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """Analizar situación con el agente autónomo"""
    try:
        situation_data = request.get("situation_data", {})
        
        # Agregar datos del sistema actual para análisis
        actors = await db.political_actors.find({}, {"_id": 0}).to_list(1000)
        zones = await db.zones.find({}, {"_id": 0}).to_list(1000)
        recent_posts = await db.feed.find({}).sort("timestamp", -1).limit(20).to_list(20)
        
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
async def get_autonomous_agent_status(current_user: User = Depends(get_current_user)):
    """Obtener estado del agente autónomo"""
    try:
        status = dami_autonomous_agent.get_agent_status()
        return status
    except Exception as e:
        logger.error(f"Error obteniendo estado del agente: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/autonomous-agent/stop")
async def stop_autonomous_agent(current_user: User = Depends(get_current_user)):
    """Detener el agente autónomo"""
    try:
        if current_user.role != UserRole.ADMINISTRATOR:
            raise HTTPException(status_code=403, detail="Solo administradores pueden detener el agente")
        
        result = await dami_autonomous_agent.stop_monitoring()
        return result
        
    except Exception as e:
        logger.error(f"Error deteniendo agente autónomo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/predictive-analysis")
async def run_predictive_analysis(current_user: User = Depends(get_current_user)):
    """Ejecutar análisis predictivo completo"""
    try:
        # Recopilar datos del sistema
        actors = await db.political_actors.find({}, {"_id": 0}).to_list(1000)
        zones = await db.zones.find({}, {"_id": 0}).to_list(1000)
        social_media = await db.feed.find({}).sort("timestamp", -1).limit(100).to_list(100)
        
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
async def get_predictive_analytics_status(current_user: User = Depends(get_current_user)):
    """Obtener estado del sistema de análisis predictivo"""
    try:
        status = advanced_predictive_analytics.get_analytics_status()
        return status
    except Exception as e:
        logger.error(f"Error obteniendo estado de análisis predictivo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/emotional-intelligence")
async def run_emotional_analysis(current_user: User = Depends(get_current_user)):
    """Ejecutar análisis emocional y psicológico completo"""
    try:
        # Recopilar datos para análisis emocional
        actors = await db.political_actors.find({}, {"_id": 0}).to_list(1000)
        social_posts = await db.feed.find({}).sort("timestamp", -1).limit(50).to_list(50)
        
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
async def get_emotional_intelligence_status(current_user: User = Depends(get_current_user)):
    """Obtener estado del sistema de inteligencia emocional"""
    try:
        status = emotional_intelligence_system.get_system_status()
        return status
    except Exception as e:
        logger.error(f"Error obteniendo estado de inteligencia emocional: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/ai/modules/overview")
async def get_ai_modules_overview(current_user: User = Depends(get_current_user)):
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

# ==============================================================================
# CENTRO ESTADÍSTICO ENDPOINTS
# ==============================================================================

@app.get("/api/centro-estadistico/resumen")
async def obtener_resumen_estadistico(current_user: dict = Depends(get_current_user)):
    """Obtiene resumen estadístico de actividad en redes sociales"""
    try:
        estadisticas = await centro_estadistico.obtener_estadisticas_completas()
        return {
            "success": True,
            "data": estadisticas["estadisticas_generales"],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error en resumen estadístico: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/api/centro-estadistico/completo")
async def obtener_estadisticas_completas(current_user: dict = Depends(get_current_user)):
    """Obtiene todas las estadísticas del centro estadístico"""
    try:
        estadisticas = await centro_estadistico.obtener_estadisticas_completas()
        return {
            "success": True,
            "data": estadisticas,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error en estadísticas completas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/api/centro-estadistico/redes-sociales")
async def obtener_estadisticas_redes(current_user: dict = Depends(get_current_user)):
    """Obtiene estadísticas específicas por red social"""
    try:
        estadisticas_redes = await centro_estadistico.generar_estadisticas_por_red()
        return {
            "success": True,
            "data": estadisticas_redes,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error en estadísticas por redes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/api/centro-estadistico/tendencias")
async def obtener_tendencias_temporales(current_user: dict = Depends(get_current_user)):
    """Obtiene tendencias temporales de los últimos 7 días"""
    try:
        tendencias = centro_estadistico.generar_tendencias_temporales()
        return {
            "success": True,
            "data": tendencias,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error en tendencias temporales: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/api/centro-estadistico/alertas")
async def obtener_alertas_estadisticas(current_user: dict = Depends(get_current_user)):
    """Obtiene alertas estadísticas activas"""
    try:
        alertas = centro_estadistico.generar_alertas_estadisticas()
        return {
            "success": True,
            "data": alertas,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error en alertas estadísticas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# ==============================================================================
# INFORME DIARIO ENDPOINTS
# ==============================================================================

@app.get("/api/informe-diario")
async def obtener_informe_diario(
    fecha: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Obtiene el informe diario completo"""
    try:
        if fecha and not _validar_fecha(fecha):
            raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
        
        informe = informe_diario.generar_informe_completo(fecha)
        return {
            "success": True,
            "data": informe,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en informe diario: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/api/informe-diario/resumen")
async def obtener_resumen_informe(
    fecha: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Obtiene resumen ejecutivo del informe diario"""
    try:
        if fecha and not _validar_fecha(fecha):
            raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
        
        informe = informe_diario.generar_informe_completo(fecha)
        return {
            "success": True,
            "data": {
                "encabezado": informe["encabezado"],
                "resumen_ejecutivo": informe["resumen_ejecutivo"],
                "metricas_kpi": informe["metricas_kpi"],
                "conclusion": informe["conclusion"]
            },
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en resumen de informe: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/api/informe-diario/recomendaciones")
async def obtener_recomendaciones_informe(
    fecha: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Obtiene recomendaciones estratégicas del informe"""
    try:
        if fecha and not _validar_fecha(fecha):
            raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
        
        informe = informe_diario.generar_informe_completo(fecha)
        return {
            "success": True,
            "data": {
                "recomendaciones_estrategicas": informe["recomendaciones_estrategicas"],
                "alertas_y_riesgos": informe["alertas_y_riesgos"],
                "plan_accion_24h": informe["plan_accion_24h"]
            },
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en recomendaciones: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@app.get("/api/informe-diario/pdf-data")
async def obtener_datos_pdf_informe(
    fecha: str = None,
    current_user: dict = Depends(get_current_user)
):
    """Obtiene datos optimizados para generar PDF del informe"""
    try:
        if fecha and not _validar_fecha(fecha):
            raise HTTPException(status_code=400, detail="Formato de fecha inválido. Use YYYY-MM-DD")
        
        datos_pdf = informe_diario.generar_informe_pdf_data(fecha)
        return {
            "success": True,
            "data": datos_pdf,
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en datos PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

# Helper function for date validation
def _validar_fecha(fecha: str) -> bool:
    """Valida formato de fecha YYYY-MM-DD"""
    try:
        datetime.strptime(fecha, "%Y-%m-%d")
        return True
    except ValueError:
        return False

# ==============================================================================
# CENTRO DE COMANDO - ENDPOINTS ESPECÍFICOS
# ==============================================================================

@api_router.get("/centro-comando/situacion-actual")
async def get_situacion_actual(current_user: User = Depends(get_current_user)):
    """Obtener situación actual específica del Frente Renovador"""
    try:
        situacion = await situacion_analyzer.evaluar_situacion_actual()
        return situacion
    except Exception as e:
        logger.error(f"Error obteniendo situación actual: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/centro-comando/monitoreo-tiempo-real")
async def get_monitoreo_tiempo_real(current_user: User = Depends(get_current_user)):
    """Obtener eventos de monitoreo en tiempo real"""
    try:
        eventos = await monitoreo_tiempo_real.obtener_eventos_tiempo_real()
        return {"eventos": eventos, "timestamp": datetime.utcnow().isoformat()}
    except Exception as e:
        logger.error(f"Error obteniendo monitoreo tiempo real: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/centro-comando/accion-rapida")
async def ejecutar_accion_rapida(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """Ejecutar acción rápida desde el centro de comando"""
    try:
        accion = request.get("accion")
        contexto = request.get("contexto", {})
        
        # Registrar la acción tomada
        resultado = {
            "accion_ejecutada": accion,
            "usuario": current_user.username,
            "timestamp": datetime.utcnow().isoformat(),
            "estado": "ejecutada",
            "mensaje": f"Acción '{accion}' ejecutada correctamente"
        }
        
        # Simular diferentes tipos de acciones
        if accion == "respuesta_emergencia":
            resultado["detalles"] = "Protocolo de crisis activado - Equipo de comunicaciones notificado"
        elif accion == "activar_red_apoyo":
            resultado["detalles"] = "Red de apoyo digital activada - 150+ usuarios movilizados"
        elif accion == "campana_positiva":
            resultado["detalles"] = "Campaña positiva lanzada - Contenido programado en todas las plataformas"
        elif accion == "contramedidas":
            resultado["detalles"] = "Contramedidas desplegadas - Monitoreo intensificado"
        
        return resultado
        
    except Exception as e:
        logger.error(f"Error ejecutando acción rápida: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# MAPA TERRITORIAL ENDPOINTS
# ==============================================================================

@app.get("/api/mapa-territorial/actividad")
async def obtener_actividad_territorial(current_user: dict = Depends(get_current_user)):
    """Obtiene datos de actividad territorial basados en las 3 APIs de redes sociales"""
    try:
        # Importar las integraciones de APIs
        from integrations.twitter_api_v2 import twitter_api
        from integrations.facebook_api import facebook_api  
        from integrations.instagram_api import instagram_api
        
        # Obtener datos de las 3 plataformas de manera concurrente
        twitter_data = await twitter_api.get_frente_renovador_metrics()
        facebook_data = await facebook_api.get_frente_renovador_metrics()
        instagram_data = await instagram_api.get_frente_renovador_metrics()
        
        # Extraer datos generales
        twitter_summary = twitter_data.get('summary', {})
        facebook_summary = facebook_data.get('summary', {})
        instagram_summary = instagram_data.get('summary', {})
        
        # Calcular métricas combinadas con pesos específicos
        total_menciones = (
            twitter_summary.get('total_tweets', 0) + 
            facebook_summary.get('total_posts', 0) + 
            instagram_summary.get('total_posts', 0)
        )
        
        # Sentiment ponderado: Instagram 40%, Facebook 35%, Twitter 25%
        sentiment_promedio = (
            (twitter_summary.get('sentiment_score', 0) * 0.25) +
            (facebook_summary.get('sentiment_score', 0) * 0.35) +
            (instagram_summary.get('sentiment_score', 0) * 0.4)
        )
        
        # Engagement ponderado con los mismos pesos
        engagement_promedio = (
            (twitter_summary.get('engagement_rate', 0) * 0.25) +
            (facebook_summary.get('engagement_rate', 0) * 0.35) +
            (instagram_summary.get('engagement_rate', 0) * 0.4)
        )
        
        # Preparar respuesta estructurada
        actividad_territorial = {
            "general": {
                "twitter": {
                    "total_tweets": twitter_summary.get('total_tweets', 0),
                    "positive_tweets": twitter_summary.get('positive_tweets', 0),
                    "negative_tweets": twitter_summary.get('negative_tweets', 0),
                    "sentiment_score": twitter_summary.get('sentiment_score', 0),
                    "engagement_rate": twitter_summary.get('engagement_rate', 0),
                    "timestamp": twitter_summary.get('timestamp', datetime.now().isoformat())
                },
                "facebook": {
                    "total_posts": facebook_summary.get('total_posts', 0),
                    "positive_posts": facebook_summary.get('positive_posts', 0),
                    "negative_posts": facebook_summary.get('negative_posts', 0),
                    "sentiment_score": facebook_summary.get('sentiment_score', 0),
                    "engagement_rate": facebook_summary.get('engagement_rate', 0),
                    "timestamp": facebook_summary.get('timestamp', datetime.now().isoformat())
                },
                "instagram": {
                    "total_posts": instagram_summary.get('total_posts', 0),
                    "positive_posts": instagram_summary.get('positive_posts', 0),
                    "negative_posts": instagram_summary.get('negative_posts', 0),
                    "sentiment_score": instagram_summary.get('sentiment_score', 0),
                    "engagement_rate": instagram_summary.get('engagement_rate', 0),
                    "timestamp": instagram_summary.get('timestamp', datetime.now().isoformat())
                },
                "combinado": {
                    "total_menciones": total_menciones,
                    "sentiment_promedio": round(sentiment_promedio, 3),
                    "engagement_promedio": round(engagement_promedio, 2),
                    "nivel_actividad": _determinar_nivel_actividad_territorial(sentiment_promedio, engagement_promedio),
                    "estado_general": _determinar_estado_territorial(sentiment_promedio, total_menciones),
                }
            },
            "municipios": [],  # Para futuras implementaciones específicas por municipio
            "metadata": {
                "integraciones_activas": ["Twitter API v2", "Facebook Graph API", "Instagram Basic API"],
                "algoritmo_ponderacion": "Instagram: 40%, Facebook: 35%, Twitter: 25%",
                "ultima_actualizacion": datetime.now().isoformat(),
                "datos_disponibles": {
                    "twitter": twitter_summary.get('total_tweets', 0) > 0,
                    "facebook": facebook_summary.get('total_posts', 0) > 0,
                    "instagram": instagram_summary.get('total_posts', 0) > 0
                },
                "calidad_datos": "alta" if total_menciones > 50 else "media" if total_menciones > 10 else "baja"
            }
        }
        
        logger.info(f"Actividad territorial generada: {total_menciones} menciones, sentiment: {sentiment_promedio:.3f}")
        
        return {
            "success": True,
            "data": actividad_territorial,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error en actividad territorial: {str(e)}")
        
        # Fallback con estructura mínima si falla completamente
        fallback_data = {
            "general": {
                "twitter": {"total_tweets": 0, "sentiment_score": 0, "engagement_rate": 0},
                "facebook": {"total_posts": 0, "sentiment_score": 0, "engagement_rate": 0},
                "instagram": {"total_posts": 0, "sentiment_score": 0, "engagement_rate": 0},
                "combinado": {
                    "total_menciones": 0,
                    "sentiment_promedio": 0,
                    "engagement_promedio": 0,
                    "nivel_actividad": "DESCONOCIDO",
                    "estado_general": "ERROR"
                }
            },
            "municipios": [],
            "metadata": {
                "error": str(e),
                "fallback_mode": True,
                "integraciones_activas": [],
                "ultima_actualizacion": datetime.now().isoformat(),
                "datos_disponibles": {"twitter": False, "facebook": False, "instagram": False}
            }
        }
        
        return {
            "success": False,
            "data": fallback_data,
            "error": "Error conectando con APIs de redes sociales - usando modo fallback",
            "timestamp": datetime.now().isoformat()
        }

def _determinar_nivel_actividad_territorial(sentiment: float, engagement: float) -> str:
    """Determina el nivel de actividad territorial basado en sentiment y engagement"""
    if sentiment < -0.4 or engagement > 20:
        return "CRÍTICO"
    elif sentiment < -0.2 or engagement > 12:
        return "ALTO"
    elif sentiment < 0.1 and engagement > 6:
        return "MEDIO"
    else:
        return "BAJO"

def _determinar_estado_territorial(sentiment: float, total_menciones: int) -> str:
    """Determina el estado territorial general"""
    if total_menciones == 0:
        return "SIN_DATOS"
    elif sentiment > 0.3:
        return "MUY_FAVORABLE"
    elif sentiment > 0.1:
        return "FAVORABLE"
    elif sentiment > -0.1:
        return "NEUTRAL"
    elif sentiment > -0.3:
        return "DESFAVORABLE"
    else:
        return "CRÍTICO"

# ==============================================================================
# ANÁLISIS DE COMPETENCIA ENDPOINTS
# ==============================================================================

@app.get("/api/analisis-competencia/completo")
async def obtener_analisis_competencia_completo(current_user: dict = Depends(get_current_user)):
    """Obtiene análisis completo de competencia política"""
    try:
        analisis_completo = await analisis_competencia.analizar_competencia_completa()
        
        logger.info(f"Análisis de competencia generado: {analisis_completo.get('resumen_ejecutivo', {}).get('partidos_monitoreados', 0)} partidos monitoreados")
        
        return {
            "success": True,
            "data": analisis_completo,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error en análisis completo de competencia: {str(e)}")
        return {
            "success": False,
            "data": analisis_competencia._generar_respuesta_fallback(),
            "error": "Error en análisis de competencia - usando datos fallback",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/analisis-competencia/resumen")
async def obtener_resumen_competencia(current_user: dict = Depends(get_current_user)):
    """Obtiene resumen ejecutivo del análisis de competencia"""
    try:
        analisis_completo = await analisis_competencia.analizar_competencia_completa()
        resumen = analisis_completo.get("resumen_ejecutivo", {})
        
        # Agregar datos clave del análisis comparativo
        comparativo = analisis_completo.get("analisis_comparativo", {})
        campañas = analisis_completo.get("campañas_coordinadas", [])
        
        resumen_extendido = {
            **resumen,
            "posicion_competitiva": comparativo.get("posicion_general", "DESCONOCIDA"),
            "principal_competidor": comparativo.get("principal_competidor", "Ninguno"),
            "campañas_activas": len(campañas),
            "recomendaciones_criticas": len([r for r in analisis_completo.get("recomendaciones_estrategicas", []) 
                                           if r.get("prioridad") == "CRÍTICA"])
        }
        
        return {
            "success": True,
            "data": resumen_extendido,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error en resumen de competencia: {str(e)}")
        return {
            "success": False,
            "data": {
                "partidos_monitoreados": 0,
                "nivel_amenaza_general": "ERROR",
                "error": str(e)
            },
            "error": "Error obteniendo resumen de competencia",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/analisis-competencia/campañas-coordinadas")
async def obtener_campañas_coordinadas(current_user: dict = Depends(get_current_user)):
    """Obtiene detección de campañas coordinadas"""
    try:
        analisis_completo = await analisis_competencia.analizar_competencia_completa()
        campañas = analisis_completo.get("campañas_coordinadas", [])
        
        return {
            "success": True,
            "data": {
                "campañas_detectadas": campañas,
                "total_campañas": len(campañas),
                "nivel_alerta": "CRÍTICO" if len(campañas) >= 2 else "ALTO" if len(campañas) == 1 else "BAJO",
                "recomendaciones_inmediatas": [
                    {
                        "accion": "Monitoreo intensificado de redes sociales",
                        "prioridad": "ALTA"
                    } for _ in campañas
                ]
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error en detección de campañas: {str(e)}")
        return {
            "success": False,
            "data": {"campañas_detectadas": [], "error": str(e)},
            "error": "Error detectando campañas coordinadas",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/analisis-competencia/influencia-territorial")
async def obtener_influencia_territorial(current_user: dict = Depends(get_current_user)):
    """Obtiene análisis de influencia territorial por municipio"""
    try:
        analisis_completo = await analisis_competencia.analizar_competencia_completa()
        influencia = analisis_completo.get("influencia_territorial", {})
        
        return {
            "success": True,
            "data": influencia,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error en influencia territorial: {str(e)}")
        return {
            "success": False,
            "data": {"error": str(e)},
            "error": "Error analizando influencia territorial",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/analisis-competencia/recomendaciones")
async def obtener_recomendaciones_estrategicas(current_user: dict = Depends(get_current_user)):
    """Obtiene recomendaciones estratégicas basadas en análisis de competencia"""
    try:
        analisis_completo = await analisis_competencia.analizar_competencia_completa()
        recomendaciones = analisis_completo.get("recomendaciones_estrategicas", [])
        
        # Organizar recomendaciones por prioridad
        criticas = [r for r in recomendaciones if r.get("prioridad") == "CRÍTICA"]
        altas = [r for r in recomendaciones if r.get("prioridad") == "ALTA"]
        medias = [r for r in recomendaciones if r.get("prioridad") == "MEDIA"]
        
        return {
            "success": True,
            "data": {
                "recomendaciones_por_prioridad": {
                    "criticas": criticas,
                    "altas": altas,
                    "medias": medias
                },
                "total_recomendaciones": len(recomendaciones),
                "accion_inmediata_requerida": len(criticas) > 0,
                "resumen_acciones": {
                    "comunicacion": len([r for r in recomendaciones if r.get("categoria") == "comunicacion"]),
                    "inteligencia": len([r for r in recomendaciones if r.get("categoria") == "inteligencia"]),
                    "territorial": len([r for r in recomendaciones if r.get("categoria") == "territorial"]),
                    "contra_inteligencia": len([r for r in recomendaciones if r.get("categoria") == "contra_inteligencia"])
                }
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error en recomendaciones estratégicas: {str(e)}")
        return {
            "success": False,
            "data": {"recomendaciones_por_prioridad": {"criticas": [], "altas": [], "medias": []}, "error": str(e)},
            "error": "Error obteniendo recomendaciones estratégicas",
            "timestamp": datetime.now().isoformat()
        }

# Include the router in the main app
app.include_router(api_router)

# ==============================================================================
# SERVICIO DE ARCHIVOS PARA DESCARGAS
# ==============================================================================

@app.get("/api/files/download-page")
@app.head("/api/files/download-page")
async def get_download_page():
    """Sirve la página de descargas para Raúl Castaño"""
    return FileResponse("/app/DESCARGAS_RAUL_CASTANO.html")

@app.get("/api/files/pdf")
@app.head("/api/files/pdf")
async def download_pdf():
    """Descarga el PDF de presentación"""
    return FileResponse(
        "/app/CENTRO_DAMI_PRESENTACION_RAUL_CASTANO.pdf",
        filename="Centro_DAMI_Presentacion_Raul_Castano.pdf",
        media_type="application/pdf"
    )

@app.get("/api/files/html")
@app.head("/api/files/html")
async def download_html():
    """Descarga la presentación HTML"""
    return FileResponse(
        "/app/CENTRO_DAMI_PRESENTACION_WEB.html",
        filename="Centro_DAMI_Presentacion_Web.html",
        media_type="text/html"
    )

@app.get("/api/files/whatsapp-message")
@app.head("/api/files/whatsapp-message")
async def download_whatsapp_message():
    """Descarga el mensaje completo de WhatsApp"""
    return FileResponse(
        "/app/MENSAJE_WHATSAPP_RAUL_CASTANO.txt",
        filename="Mensaje_WhatsApp_Raul_Castano.txt",
        media_type="text/plain"
    )

@app.get("/api/files/whatsapp-short")
@app.head("/api/files/whatsapp-short")
async def download_whatsapp_short():
    """Descarga el mensaje corto de WhatsApp"""
    return FileResponse(
        "/app/WHATSAPP_CORTO_RAUL.txt",
        filename="WhatsApp_Corto_Raul.txt",
        media_type="text/plain"
    )

@app.get("/api/files/demo-guide")
@app.head("/api/files/demo-guide")
async def download_demo_guide():
    """Descarga la guía de acceso demo"""
    return FileResponse(
        "/app/extracted_content/🔐 Guia_Acceso_Demo.md",
        filename="Guia_Acceso_Demo.md",
        media_type="text/plain"
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