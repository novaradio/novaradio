"""
YouTube API v3 Integration para DAMI
Sistema de monitoreo y análisis de YouTube para política en Misiones
"""

import os
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import uuid
import random

from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json
from collections import defaultdict

logger = logging.getLogger(__name__)

@dataclass
class YouTubeChannel:
    channel_id: str
    channel_title: str
    description: str
    subscriber_count: int
    view_count: int
    video_count: int
    thumbnail_url: str
    country: Optional[str]
    published_at: str
    last_updated: datetime

@dataclass
class YouTubeVideo:
    video_id: str
    title: str
    description: str
    channel_id: str
    channel_title: str
    published_at: str
    view_count: int
    like_count: int
    comment_count: int
    duration: str
    thumbnail_url: str
    tags: List[str]

@dataclass
class YouTubeSearchResult:
    query: str
    total_results: int
    channels: List[YouTubeChannel]
    videos: List[YouTubeVideo]
    search_timestamp: datetime

@dataclass
class YouTubeAnalytics:
    channel_id: str
    period_start: datetime
    period_end: datetime
    subscriber_growth: int
    view_growth: int
    video_count_growth: int
    engagement_rate: float
    growth_percentage: float
    trending_videos: List[YouTubeVideo]

class YouTubeAPIService:
    def __init__(self):
        # API key placeholder - usuario debe reemplazar con key real
        self.api_key = os.getenv('YOUTUBE_API_KEY', 'YOUR_YOUTUBE_API_KEY_HERE')
        self.service_name = "youtube"
        self.api_version = "v3"
        
        # Términos políticos relevantes para Misiones
        self.political_terms = [
            "Misiones", "política Misiones", "elecciones Misiones",
            "Frente Renovador", "Hugo Passalacqua", "Oscar Herrera Ahuad",
            "Posadas", "Puerto Iguazú", "Oberá", "Eldorado",
            "gobierno Misiones", "diputados Misiones", "intendentes Misiones",
            "Juan Domingo Perón", "peronismo Misiones"
        ]
        
        # Cache para evitar llamadas excesivas a la API
        self.cache = {}
        self.cache_duration = timedelta(hours=1)
        
    def _get_youtube_service(self):
        """Inicializa el servicio de YouTube API"""
        try:
            if self.api_key == 'YOUR_YOUTUBE_API_KEY_HERE':
                logger.warning("Using placeholder YouTube API key - replace with real key")
                return None
            
            return build(
                self.service_name,
                self.api_version,
                developerKey=self.api_key,
                cache_discovery=False
            )
        except Exception as e:
            logger.error(f"Error initializing YouTube service: {e}")
            return None
    
    def _is_cache_valid(self, cache_key: str) -> bool:
        """Verifica si el cache es válido"""
        if cache_key not in self.cache:
            return False
        
        cached_time = self.cache[cache_key].get('timestamp')
        if not cached_time:
            return False
        
        return datetime.now() - cached_time < self.cache_duration
    
    def _get_from_cache(self, cache_key: str):
        """Obtiene datos del cache"""
        if self._is_cache_valid(cache_key):
            return self.cache[cache_key]['data']
        return None
    
    def _save_to_cache(self, cache_key: str, data: Any):
        """Guarda datos en cache"""
        self.cache[cache_key] = {
            'timestamp': datetime.now(),
            'data': data
        }
    
    async def search_political_channels(self, 
                                      query: str = None, 
                                      max_results: int = 20,
                                      region_code: str = "AR") -> YouTubeSearchResult:
        """
        Busca canales relacionados con política en Misiones
        """
        try:
            # Si no hay query específico, usar términos políticos predefinidos
            if not query:
                query = random.choice(self.political_terms)
            
            cache_key = f"search_channels_{query}_{max_results}_{region_code}"
            cached_result = self._get_from_cache(cache_key)
            if cached_result:
                return cached_result
            
            youtube = self._get_youtube_service()
            if not youtube:
                # Modo simulación cuando no hay API key válida
                return await self._simulate_channel_search(query, max_results)
            
            # Búsqueda real con YouTube API
            search_request = youtube.search().list(
                part="snippet",
                q=f"{query} política Argentina",
                type="channel",
                maxResults=max_results,
                regionCode=region_code,
                relevanceLanguage="es"
            )
            
            search_response = search_request.execute()
            
            # Procesar resultados
            channels = []
            for item in search_response.get("items", []):
                channel_info = await self._get_channel_details(item["id"]["channelId"])
                if channel_info:
                    channels.append(channel_info)
            
            result = YouTubeSearchResult(
                query=query,
                total_results=search_response.get("pageInfo", {}).get("totalResults", 0),
                channels=channels,
                videos=[],
                search_timestamp=datetime.now()
            )
            
            self._save_to_cache(cache_key, result)
            return result
            
        except HttpError as e:
            logger.error(f"YouTube API error in search_political_channels: {e}")
            return await self._simulate_channel_search(query, max_results)
        except Exception as e:
            logger.error(f"Error in search_political_channels: {e}")
            return await self._simulate_channel_search(query, max_results)
    
    async def _get_channel_details(self, channel_id: str) -> Optional[YouTubeChannel]:
        """Obtiene detalles completos de un canal"""
        try:
            cache_key = f"channel_details_{channel_id}"
            cached_result = self._get_from_cache(cache_key)
            if cached_result:
                return cached_result
            
            youtube = self._get_youtube_service()
            if not youtube:
                return self._simulate_channel_details(channel_id)
            
            channel_request = youtube.channels().list(
                part="snippet,statistics",
                id=channel_id
            )
            
            channel_response = channel_request.execute()
            
            if not channel_response.get("items"):
                return None
            
            item = channel_response["items"][0]
            snippet = item["snippet"]
            stats = item.get("statistics", {})
            
            channel = YouTubeChannel(
                channel_id=channel_id,
                channel_title=snippet.get("title", ""),
                description=snippet.get("description", ""),
                subscriber_count=int(stats.get("subscriberCount", 0)),
                view_count=int(stats.get("viewCount", 0)),
                video_count=int(stats.get("videoCount", 0)),
                thumbnail_url=snippet.get("thumbnails", {}).get("default", {}).get("url", ""),
                country=snippet.get("country"),
                published_at=snippet.get("publishedAt", ""),
                last_updated=datetime.now()
            )
            
            self._save_to_cache(cache_key, channel)
            return channel
            
        except Exception as e:
            logger.error(f"Error getting channel details for {channel_id}: {e}")
            return self._simulate_channel_details(channel_id)
    
    async def search_political_videos(self, 
                                    query: str = None,
                                    max_results: int = 20,
                                    published_after: datetime = None) -> List[YouTubeVideo]:
        """
        Busca videos relacionados con política en Misiones
        """
        try:
            if not query:
                query = random.choice(self.political_terms)
            
            if not published_after:
                published_after = datetime.now() - timedelta(days=30)
            
            cache_key = f"search_videos_{query}_{max_results}_{published_after.date()}"
            cached_result = self._get_from_cache(cache_key)
            if cached_result:
                return cached_result
            
            youtube = self._get_youtube_service()
            if not youtube:
                return await self._simulate_video_search(query, max_results)
            
            # Búsqueda de videos
            search_request = youtube.search().list(
                part="snippet",
                q=f"{query} política Misiones Argentina",
                type="video",
                maxResults=max_results,
                publishedAfter=published_after.isoformat() + 'Z',
                regionCode="AR",
                relevanceLanguage="es",
                order="relevance"
            )
            
            search_response = search_request.execute()
            
            # Obtener estadísticas de videos
            video_ids = [item["id"]["videoId"] for item in search_response.get("items", [])]
            videos = await self._get_videos_details(video_ids)
            
            self._save_to_cache(cache_key, videos)
            return videos
            
        except HttpError as e:
            logger.error(f"YouTube API error in search_political_videos: {e}")
            return await self._simulate_video_search(query, max_results)
        except Exception as e:
            logger.error(f"Error in search_political_videos: {e}")
            return await self._simulate_video_search(query, max_results)
    
    async def _get_videos_details(self, video_ids: List[str]) -> List[YouTubeVideo]:
        """Obtiene detalles completos de videos"""
        videos = []
        
        try:
            if not video_ids:
                return videos
            
            youtube = self._get_youtube_service()
            if not youtube:
                return [self._simulate_video_details(vid) for vid in video_ids]
            
            # Procesar en chunks de 50 (límite de API)
            for i in range(0, len(video_ids), 50):
                chunk = video_ids[i:i + 50]
                
                videos_request = youtube.videos().list(
                    part="snippet,statistics,contentDetails",
                    id=",".join(chunk)
                )
                
                videos_response = videos_request.execute()
                
                for item in videos_response.get("items", []):
                    snippet = item["snippet"]
                    stats = item.get("statistics", {})
                    
                    video = YouTubeVideo(
                        video_id=item["id"],
                        title=snippet.get("title", ""),
                        description=snippet.get("description", ""),
                        channel_id=snippet.get("channelId", ""),
                        channel_title=snippet.get("channelTitle", ""),
                        published_at=snippet.get("publishedAt", ""),
                        view_count=int(stats.get("viewCount", 0)),
                        like_count=int(stats.get("likeCount", 0)),
                        comment_count=int(stats.get("commentCount", 0)),
                        duration=item.get("contentDetails", {}).get("duration", ""),
                        thumbnail_url=snippet.get("thumbnails", {}).get("default", {}).get("url", ""),
                        tags=snippet.get("tags", [])
                    )
                    
                    videos.append(video)
            
            return videos
            
        except Exception as e:
            logger.error(f"Error getting videos details: {e}")
            return [self._simulate_video_details(vid) for vid in video_ids]
    
    async def get_channel_analytics(self, 
                                  channel_id: str,
                                  days_back: int = 30) -> YouTubeAnalytics:
        """
        Obtiene analytics de un canal con comparación histórica
        """
        try:
            cache_key = f"analytics_{channel_id}_{days_back}"
            cached_result = self._get_from_cache(cache_key)
            if cached_result:
                return cached_result
            
            # Obtener datos actuales
            current_data = await self._get_channel_details(channel_id)
            if not current_data:
                return self._simulate_channel_analytics(channel_id, days_back)
            
            # Simular datos históricos (en implementación real, se guardaRían en BD)
            period_start = datetime.now() - timedelta(days=days_back)
            period_end = datetime.now()
            
            # Calcular crecimiento simulado
            subscriber_growth = random.randint(-500, 2000)
            view_growth = random.randint(1000, 50000)
            video_count_growth = random.randint(0, 10)
            
            # Calcular engagement rate
            if current_data.subscriber_count > 0:
                avg_views_per_video = current_data.view_count / max(current_data.video_count, 1)
                engagement_rate = (avg_views_per_video / current_data.subscriber_count) * 100
            else:
                engagement_rate = 0.0
            
            # Calcular porcentaje de crecimiento
            if current_data.subscriber_count > subscriber_growth:
                growth_percentage = (subscriber_growth / (current_data.subscriber_count - subscriber_growth)) * 100
            else:
                growth_percentage = 0.0
            
            # Obtener videos trending
            trending_videos = await self.search_political_videos(
                query=current_data.channel_title,
                max_results=5
            )
            
            analytics = YouTubeAnalytics(
                channel_id=channel_id,
                period_start=period_start,
                period_end=period_end,
                subscriber_growth=subscriber_growth,
                view_growth=view_growth,
                video_count_growth=video_count_growth,
                engagement_rate=round(engagement_rate, 2),
                growth_percentage=round(growth_percentage, 2),
                trending_videos=trending_videos
            )
            
            self._save_to_cache(cache_key, analytics)
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting channel analytics for {channel_id}: {e}")
            return self._simulate_channel_analytics(channel_id, days_back)
    
    async def get_political_trends(self) -> Dict[str, Any]:
        """
        Obtiene tendencias políticas en YouTube para Misiones
        """
        try:
            cache_key = "political_trends"
            cached_result = self._get_from_cache(cache_key)
            if cached_result:
                return cached_result
            
            trends = {
                "trending_topics": [],
                "top_channels": [],
                "viral_videos": [],
                "sentiment_analysis": {},
                "geographic_data": {},
                "timestamp": datetime.now()
            }
            
            # Buscar por cada término político
            for term in self.political_terms[:5]:  # Limitar para no exceder quota
                try:
                    videos = await self.search_political_videos(query=term, max_results=10)
                    channels = await self.search_political_channels(query=term, max_results=5)
                    
                    trends["trending_topics"].append({
                        "term": term,
                        "video_count": len(videos),
                        "total_views": sum([v.view_count for v in videos]),
                        "avg_engagement": sum([v.like_count + v.comment_count for v in videos]) / max(len(videos), 1)
                    })
                    
                    trends["top_channels"].extend(channels.channels)
                    trends["viral_videos"].extend(videos)
                    
                except Exception as e:
                    logger.error(f"Error processing term {term}: {e}")
                    continue
            
            # Procesar sentiment análisis básico
            positive_terms = ["logros", "éxito", "crecimiento", "desarrollo"]
            negative_terms = ["crisis", "problemas", "conflicto", "crítica"]
            
            sentiment_scores = []
            for video in trends["viral_videos"]:
                title_lower = video.title.lower()
                description_lower = video.description.lower()
                
                positive_count = sum([1 for term in positive_terms if term in title_lower or term in description_lower])
                negative_count = sum([1 for term in negative_terms if term in title_lower or term in description_lower])
                
                if positive_count > negative_count:
                    sentiment_scores.append(1)
                elif negative_count > positive_count:
                    sentiment_scores.append(-1)
                else:
                    sentiment_scores.append(0)
            
            avg_sentiment = sum(sentiment_scores) / max(len(sentiment_scores), 1)
            
            trends["sentiment_analysis"] = {
                "average_sentiment": round(avg_sentiment, 2),
                "positive_videos": len([s for s in sentiment_scores if s > 0]),
                "negative_videos": len([s for s in sentiment_scores if s < 0]),
                "neutral_videos": len([s for s in sentiment_scores if s == 0]),
                "sentiment_trend": "positivo" if avg_sentiment > 0.2 else "negativo" if avg_sentiment < -0.2 else "neutral"
            }
            
            # Datos geográficos simulados
            trends["geographic_data"] = {
                "Posadas": {"mentions": random.randint(50, 200), "sentiment": random.uniform(-0.5, 0.8)},
                "Puerto Iguazú": {"mentions": random.randint(20, 100), "sentiment": random.uniform(-0.3, 0.6)},
                "Oberá": {"mentions": random.randint(30, 150), "sentiment": random.uniform(-0.4, 0.7)},
                "Eldorado": {"mentions": random.randint(15, 80), "sentiment": random.uniform(-0.2, 0.5)},
                "Leandro N. Alem": {"mentions": random.randint(10, 60), "sentiment": random.uniform(-0.3, 0.4)}
            }
            
            # Eliminar duplicados y ordenar
            trends["top_channels"] = list({ch.channel_id: ch for ch in trends["top_channels"]}.values())
            trends["top_channels"] = sorted(trends["top_channels"], key=lambda x: x.subscriber_count, reverse=True)[:10]
            
            trends["viral_videos"] = sorted(trends["viral_videos"], key=lambda x: x.view_count, reverse=True)[:20]
            
            self._save_to_cache(cache_key, trends)
            return trends
            
        except Exception as e:
            logger.error(f"Error getting political trends: {e}")
            return self._simulate_political_trends()
    
    # Métodos de simulación para cuando no hay API key válida
    
    async def _simulate_channel_search(self, query: str, max_results: int) -> YouTubeSearchResult:
        """Simula búsqueda de canales"""
        channels = []
        
        # Canales simulados relevantes para política en Misiones
        simulated_channels = [
            {
                "id": f"UC{random.randint(1000000, 9999999)}", 
                "title": f"Canal Político {query}",
                "description": f"Canal dedicado a política y noticias de {query} en Misiones",
                "subscribers": random.randint(1000, 50000),
                "views": random.randint(100000, 1000000),
                "videos": random.randint(50, 500)
            },
            {
                "id": f"UC{random.randint(1000000, 9999999)}", 
                "title": "Noticias Misiones Hoy",
                "description": "Información política y social de la provincia de Misiones",
                "subscribers": random.randint(5000, 80000),
                "views": random.randint(500000, 2000000),
                "videos": random.randint(100, 800)
            },
            {
                "id": f"UC{random.randint(1000000, 9999999)}", 
                "title": "Frente Renovador TV",
                "description": "Canal oficial del Frente Renovador de Misiones",
                "subscribers": random.randint(10000, 120000),
                "views": random.randint(800000, 3000000),
                "videos": random.randint(200, 1000)
            }
        ]
        
        for i, sim_ch in enumerate(simulated_channels[:max_results]):
            channel = YouTubeChannel(
                channel_id=sim_ch["id"],
                channel_title=sim_ch["title"],
                description=sim_ch["description"],
                subscriber_count=sim_ch["subscribers"],
                view_count=sim_ch["views"],
                video_count=sim_ch["videos"],
                thumbnail_url="https://via.placeholder.com/88x88",
                country="AR",
                published_at=(datetime.now() - timedelta(days=random.randint(365, 2000))).isoformat(),
                last_updated=datetime.now()
            )
            channels.append(channel)
        
        return YouTubeSearchResult(
            query=query,
            total_results=random.randint(100, 1000),
            channels=channels,
            videos=[],
            search_timestamp=datetime.now()
        )
    
    def _simulate_channel_details(self, channel_id: str) -> YouTubeChannel:
        """Simula detalles de canal"""
        return YouTubeChannel(
            channel_id=channel_id,
            channel_title=f"Canal Político {random.randint(1, 100)}",
            description="Canal simulado de política en Misiones",
            subscriber_count=random.randint(1000, 100000),
            view_count=random.randint(100000, 5000000),
            video_count=random.randint(50, 1000),
            thumbnail_url="https://via.placeholder.com/88x88",
            country="AR",
            published_at=(datetime.now() - timedelta(days=random.randint(365, 2000))).isoformat(),
            last_updated=datetime.now()
        )
    
    async def _simulate_video_search(self, query: str, max_results: int) -> List[YouTubeVideo]:
        """Simula búsqueda de videos"""
        videos = []
        
        video_titles = [
            f"Última hora: {query} en Misiones",
            f"Análisis político sobre {query}",
            f"Debate: El futuro de {query}",
            f"Conferencia de prensa - {query}",
            f"Entrevista exclusiva sobre {query}",
            f"Opinión: {query} y su impacto",
            f"Breaking: Decisión sobre {query}",
            f"Especial: {query} en el congreso"
        ]
        
        for i in range(min(max_results, len(video_titles))):
            video = YouTubeVideo(
                video_id=f"vid_{random.randint(100000, 999999)}",
                title=video_titles[i],
                description=f"Video sobre {query} en el contexto político de Misiones",
                channel_id=f"UC{random.randint(1000000, 9999999)}",
                channel_title=f"Canal Noticias {random.randint(1, 50)}",
                published_at=(datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                view_count=random.randint(1000, 100000),
                like_count=random.randint(50, 5000),
                comment_count=random.randint(10, 1000),
                duration="PT" + str(random.randint(2, 60)) + "M",
                thumbnail_url="https://via.placeholder.com/120x90",
                tags=[query, "política", "Misiones", "Argentina"]
            )
            videos.append(video)
        
        return videos
    
    def _simulate_video_details(self, video_id: str) -> YouTubeVideo:
        """Simula detalles de video"""
        return YouTubeVideo(
            video_id=video_id,
            title=f"Video Político {random.randint(1, 1000)}",
            description="Video simulado sobre política en Misiones",
            channel_id=f"UC{random.randint(1000000, 9999999)}",
            channel_title="Canal Simulado",
            published_at=(datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
            view_count=random.randint(1000, 100000),
            like_count=random.randint(50, 5000),
            comment_count=random.randint(10, 1000),
            duration="PT" + str(random.randint(2, 60)) + "M",
            thumbnail_url="https://via.placeholder.com/120x90",
            tags=["política", "Misiones", "simulado"]
        )
    
    def _simulate_channel_analytics(self, channel_id: str, days_back: int) -> YouTubeAnalytics:
        """Simula analytics de canal"""
        return YouTubeAnalytics(
            channel_id=channel_id,
            period_start=datetime.now() - timedelta(days=days_back),
            period_end=datetime.now(),
            subscriber_growth=random.randint(-500, 2000),
            view_growth=random.randint(1000, 50000),
            video_count_growth=random.randint(0, 10),
            engagement_rate=round(random.uniform(1.0, 8.0), 2),
            growth_percentage=round(random.uniform(-5.0, 15.0), 2),
            trending_videos=[]
        )
    
    def _simulate_political_trends(self) -> Dict[str, Any]:
        """Simula tendencias políticas"""
        return {
            "trending_topics": [
                {
                    "term": "Misiones",
                    "video_count": random.randint(50, 200),
                    "total_views": random.randint(100000, 1000000),
                    "avg_engagement": random.randint(500, 5000)
                },
                {
                    "term": "Frente Renovador", 
                    "video_count": random.randint(30, 150),
                    "total_views": random.randint(80000, 800000),
                    "avg_engagement": random.randint(400, 4000)
                }
            ],
            "top_channels": [],
            "viral_videos": [],
            "sentiment_analysis": {
                "average_sentiment": round(random.uniform(-0.5, 0.8), 2),
                "positive_videos": random.randint(10, 50),
                "negative_videos": random.randint(5, 30),
                "neutral_videos": random.randint(15, 40),
                "sentiment_trend": random.choice(["positivo", "negativo", "neutral"])
            },
            "geographic_data": {
                "Posadas": {"mentions": random.randint(50, 200), "sentiment": random.uniform(-0.5, 0.8)},
                "Puerto Iguazú": {"mentions": random.randint(20, 100), "sentiment": random.uniform(-0.3, 0.6)},
                "Oberá": {"mentions": random.randint(30, 150), "sentiment": random.uniform(-0.4, 0.7)}
            },
            "timestamp": datetime.now()
        }

# Instancia global del servicio
youtube_service = YouTubeAPIService()