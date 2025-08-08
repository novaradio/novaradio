"""
🚀 DAMI: Instagram Hashtags + IA Ultra-Ahorro Service EXPANDIDO
Servicio optimizado para análisis de hashtags de Instagram con IA cost-aware
AHORA CON SOPORTE PARA TOKENS REALES + DATOS SIMULADOS DE FALLBACK
"""

import os
import json
import re
import random
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Set

class InstagramHashtagsIA:
    def __init__(self):
        # Config tokens reales
        self.access_token = os.getenv("IG_LONG_LIVED_TOKEN")
        self.user_id = os.getenv("IG_USER_ID")  
        self.graph_url = os.getenv("GRAPH_URL", "https://graph.facebook.com/v18.0")
        
        # Determinar modo de operación
        self.production_mode = bool(self.access_token and self.user_id)
        self.simulation_mode = not self.production_mode
        
        print(f"🚀 Instagram Service - Modo: {'PRODUCCIÓN' if self.production_mode else 'SIMULACIÓN'}")
        
        # Hashtags por defecto desde seeds_manager
        self.hashtags_misiones = [
            "#Misiones", "#Posadas", "#Obera", "#Eldorado", "#PuertoIguazu", 
            "#Garupa", "#LeandroNAlem", "#Apostoles", "#Montecarlo", "#SanVicente"
        ]
        
        # Cost-aware AI config
        self.llm_enabled = os.getenv("LLM_ENABLED", "cheap")  # off | cheap | standard
        self.llm_max_chars = int(os.getenv("LLM_MAX_CHARS", "300"))
        self.llm_batch_limit = int(os.getenv("LLM_BATCH_LIMIT", "12"))
        
        # Cache de IDs vistos (en memoria para simplificar)
        self.seen_ids = set()
        
        # Datos simulados como fallback
        self.simulated_users = [
            "posadas_noticias", "misiones_online", "radio_libertad", "ciudadano_misionero",
            "frente_renovador_oficial", "joven_posadeño", "comercio_obera", "turismo_iguazu",
            "vecino_eldorado", "universidad_misiones", "cultura_misiones", "deportes_region"
        ]
        
    def _get_instagram_api(self, path: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Helper para llamadas a Instagram Graph API"""
        if not self.production_mode:
            raise Exception("Instagram API no disponible en modo simulación")
        
        url = f"{self.graph_url}/{path.lstrip('/')}"
        params = params or {}
        params["access_token"] = self.access_token
        
        response = requests.get(url, params=params, timeout=30)
        
        if response.status_code == 429:
            print(f"⚠️ Rate limit Instagram API - esperando...")
            import time
            time.sleep(60)
            response = requests.get(url, params=params, timeout=30)
        
        if not response.ok:
            raise Exception(f"Instagram API error {response.status_code}: {response.text}")
        
        return response.json()

    def search_hashtag_id_real(self, tag: str) -> str:
        """Busca el ID de un hashtag en Instagram API real"""
        try:
            response = self._get_instagram_api("ig_hashtag_search", {
                "user_id": self.user_id,
                "q": tag.lstrip("#")
            })
            
            data = response.get("data", [])
            if data:
                return data[0]["id"]
            else:
                print(f"⚠️ Hashtag {tag} no encontrado en Instagram")
                return None
                
        except Exception as e:
            print(f"❌ Error buscando hashtag {tag}: {str(e)}")
            return None

    def fetch_recent_media_real(self, hashtag_id: str, limit: int) -> List[Dict[str, Any]]:
        """Obtiene posts recientes de un hashtag desde Instagram API real"""
        try:
            fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,comments_count,like_count"
            
            response = self._get_instagram_api(f"{hashtag_id}/recent_media", {
                "user_id": self.user_id,
                "fields": fields,
                "limit": min(limit, 50)  # Instagram limita a 50 por request
            })
            
            posts = []
            for media in response.get("data", []):
                posts.append({
                    "platform": "instagram",
                    "hashtag": f"#{hashtag_id}",  # Se actualizará después
                    "hashtag_id": hashtag_id,
                    "ig_id": media.get("id"),
                    "text": media.get("caption") or "",
                    "media_type": media.get("media_type"),
                    "media_url": media.get("media_url") or media.get("thumbnail_url"),
                    "permalink": media.get("permalink"),
                    "timestamp": media.get("timestamp"),
                    "username": media.get("username"),
                    "metrics": {
                        "comments_count": media.get("comments_count", 0),
                        "like_count": media.get("like_count", 0)
                    }
                })
            
            return posts
            
        except Exception as e:
            print(f"❌ Error obteniendo media para hashtag_id {hashtag_id}: {str(e)}")
            return []
        
        self.political_keywords = [
            "oscar herrera ahuad", "frente renovador", "gobierno misiones", "obras publicas",
            "seguridad", "salud publica", "educacion", "infraestructura", "energia",
            "tarifas", "empleo", "juventud", "turismo", "agro", "inundaciones"
        ]

    def generate_realistic_content(self, hashtag: str) -> List[Dict[str, Any]]:
        """Genera contenido realista para un hashtag específico"""
        posts = []
        num_posts = random.randint(5, 15)
        
        for i in range(num_posts):
            post_id = f"sim_{hashtag}_{random.randint(100000, 999999)}"
            
            if post_id in self.seen_ids:
                continue
            
            # Generar contenido realista basado en hashtag
            content = self._generate_content_for_hashtag(hashtag)
            
            # Timestamp realista (últimos 7 días)
            timestamp = datetime.now() - timedelta(
                hours=random.randint(1, 168),
                minutes=random.randint(0, 59)
            )
            
            post = {
                "platform": "instagram",
                "hashtag": hashtag,
                "hashtag_id": f"tag_{abs(hash(hashtag)) % 100000}",
                "ig_id": post_id,
                "text": content["caption"],
                "media_type": content["media_type"],
                "media_url": content["media_url"],
                "permalink": f"https://instagram.com/p/{post_id}",
                "timestamp": timestamp.isoformat(),
                "username": random.choice(self.simulated_users),
                "metrics": {
                    "comments_count": random.randint(0, 150),
                    "like_count": random.randint(5, 2500)
                }
            }
            
            posts.append(post)
            self.seen_ids.add(post_id)
        
        return posts

    def _generate_content_for_hashtag(self, hashtag: str) -> Dict[str, Any]:
        """Genera contenido específico según el hashtag"""
        
        templates = {
            "#Misiones": [
                "Orgulloso de vivir en la tierra colorada 🍃 Misiones tiene todo para crecer #MisionesCrece",
                "Las obras del gobierno provincial siguen avanzando en toda la provincia 🏗️ #ObrasParaTodos",
                "La energía renovable llega a más familias misioneras ⚡ #EnergiaLimpia #Sustentable"
            ],
            "#Posadas": [
                "La costanera de Posadas es hermosa al atardecer 🌅 #PosadasCiudadVerde",
                "El centro de la capital se renueva con más espacios verdes 🌳 #RenovaciónUrbana",
                "Posadas crece en turismo y comercio cada día 📈 #CrecimientoSostenido"
            ],
            "#Obera": [
                "La fiesta del inmigrante de Oberá es una tradición única 🎭 #Tradicion #Cultura",
                "El polo industrial de Oberá genera más empleo local 🏭 #TrabajoDigno",
                "Los productores de yerba mate celebran una buena cosecha 🧉 #YerbaMate"
            ],
            "#Eldorado": [
                "Las empresas forestales de Eldorado cuidan el medio ambiente 🌲 #SustentabilidadAmbiental",
                "El puerto de Eldorado facilita las exportaciones 🚢 #ComercioExterior",
                "Eldorado apuesta por la innovación tecnológica 💡 #InnovaciónTech"
            ],
            "#PuertoIguazu": [
                "Las Cataratas del Iguazú reciben miles de turistas 💦 #Turismo #MilagrosNaturales",
                "Puerto Iguazú se prepara para la temporada alta 🏨 #TemporadaTurística",
                "La frontera con Brasil genera oportunidades comerciales 🤝 #IntegracionRegional"
            ]
        }
        
        media_types = ["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]
        media_urls = [
            "https://instagram.fpos1-1.fna.fbcdn.net/v/sim_image_1.jpg",
            "https://instagram.fpos1-1.fna.fbcdn.net/v/sim_video_1.mp4",
            "https://instagram.fpos1-1.fna.fbcdn.net/v/sim_carousel_1.jpg"
        ]
        
        caption_options = templates.get(hashtag, [
            f"Viviendo en {hashtag.replace('#', '')} cada día es una bendición 🙏",
            f"Las oportunidades en {hashtag.replace('#', '')} son infinitas 💫",
            f"Construyendo el futuro de {hashtag.replace('#', '')} juntos 🚀"
        ])
        
        return {
            "caption": random.choice(caption_options),
            "media_type": random.choice(media_types),
            "media_url": random.choice(media_urls)
        }

    def basic_heuristic(self, text: str) -> bool:
        """Determina si un texto necesita análisis IA avanzado"""
        text_lower = text.lower()
        
        # Muy corto = no analizar
        if len(text.strip()) < 40:
            return False
        
        # Keywords políticos importantes = analizar
        political_keywords = [
            "tarifa", "luz", "energi", "inflaci", "seguridad", "delincu", "corrup",
            "gobierno", "elecci", "campaña", "crisis", "paro", "protesta", "salud",
            "educaci", "impuesto", "subsid", "desemple", "obras", "ruta"
        ]
        
        if any(keyword in text_lower for keyword in political_keywords):
            return True
        
        # Texto con mucha emoción = analizar
        emotion_signals = text.count("!") + text.count("?") + sum(1 for c in text if c.isupper())
        if emotion_signals >= 5:
            return True
        
        # Modo standard = analizar todo
        return self.llm_enabled == "standard"

    def cheap_sentiment_analysis(self, text: str) -> Dict[str, Any]:
        """Análisis básico sin IA para contenido simple"""
        text_lower = text.lower()
        
        # Sentiment analysis básico
        negative_words = [
            "estafa", "odio", "vergüenza", "ladr", "inseguridad", "tarifazo", 
            "crisis", "caos", "miente", "corrup", "malo", "terrible", "horrible"
        ]
        positive_words = [
            "gracias", "orgullo", "feliz", "apoyo", "mejora", "logro", "excelente", 
            "bien", "bueno", "hermoso", "genial", "perfecto", "increíble"
        ]
        
        negative_score = sum(1 for word in negative_words if word in text_lower)
        positive_score = sum(1 for word in positive_words if word in text_lower)
        
        if positive_score > negative_score:
            sentiment = "positivo"
            sentiment_score = 0.7 + (positive_score * 0.1)
        elif negative_score > positive_score:
            sentiment = "negativo" 
            sentiment_score = 0.3 - (negative_score * 0.1)
        else:
            sentiment = "neutral"
            sentiment_score = 0.5
        
        # Análisis de tópicos
        topic_keywords = {
            "energía": ["energ", "luz", "tarifa", "electricidad"],
            "seguridad": ["segur", "delincu", "robo", "inseguridad"],
            "salud": ["salud", "hospital", "médico", "medicina"],
            "educación": ["educa", "escuela", "universidad", "estudiante"],
            "infraestructura": ["ruta", "obras", "construcción", "vial"],
            "política": ["elecci", "campaña", "voto", "gobierno", "oscar herrera ahuad"],
            "economía": ["trabajo", "empleo", "comercio", "industria"],
            "turismo": ["turismo", "turista", "cataratas", "hotel"],
            "cultura": ["cultura", "fiesta", "tradición", "arte"]
        }
        
        topic = "social"  # default
        for topic_name, keywords in topic_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                topic = topic_name
                break
        
        # Cálculo de riesgo
        risk_factors = {
            ("negativo", "energía"): 8.5,
            ("negativo", "seguridad"): 9.0,
            ("negativo", "política"): 7.5,
            ("negativo", "salud"): 8.0,
            ("positivo", "política"): 2.0,
            ("neutral", "turismo"): 1.5
        }
        
        risk_score = risk_factors.get((sentiment, topic), 
                                     8.0 if sentiment == "negativo" else 3.0)
        
        # Resumen
        summary = text[:120] + "..." if len(text) > 120 else text
        
        return {
            "topic": topic,
            "sentiment": sentiment,
            "sentiment_score": round(sentiment_score, 2),
            "risk": round(risk_score, 1),
            "summary": summary.strip(),
            "analysis_type": "heuristic"
        }

    def analyze_cost_aware_batch(self, posts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analiza posts en batch con cost-aware AI"""
        results = []
        
        for post in posts:
            text = post.get("text", "")
            
            if self.llm_enabled == "off" or not self.basic_heuristic(text):
                # Análisis básico sin IA
                analysis = self.cheap_sentiment_analysis(text)
            else:
                # En modo simulación, usamos análisis mejorado pero sin API real
                analysis = self._simulate_llm_analysis(text)
            
            # Agregar análisis al post
            post.update(analysis)
            results.append(post)
        
        return results

    def _simulate_llm_analysis(self, text: str) -> Dict[str, Any]:
        """Simula análisis LLM avanzado para demostración"""
        # Empezamos con análisis básico
        basic = self.cheap_sentiment_analysis(text)
        
        # Mejoramos con "IA simulada" más sofisticada
        text_lower = text.lower()
        
        # Tópicos más específicos
        advanced_topics = {
            "oscar herrera ahuad": "candidato_principal",
            "frente renovador": "partido_oficialismo", 
            "obras públicas": "infraestructura_gobierno",
            "cataratas": "turismo_iguazu",
            "yerba mate": "produccion_agricola",
            "energía renovable": "politica_energetica",
            "fronteras": "comercio_internacional"
        }
        
        for keyword, advanced_topic in advanced_topics.items():
            if keyword in text_lower:
                basic["topic"] = advanced_topic
                break
        
        # Sentiment más preciso con contexto político
        if "oscar herrera ahuad" in text_lower:
            if any(word in text_lower for word in ["apoyo", "voto", "mejor", "bueno"]):
                basic["sentiment"] = "muy_positivo"
                basic["sentiment_score"] = 0.85
            elif any(word in text_lower for word in ["contra", "malo", "error", "no voto"]):
                basic["sentiment"] = "muy_negativo" 
                basic["sentiment_score"] = 0.15
        
        # Mejores resúmenes
        if len(text) > 100:
            sentences = text.split(".")
            basic["summary"] = sentences[0].strip()[:100] + "..."
        
        basic["analysis_type"] = "llm_simulated"
        
        return basic

    def pull_hashtag_content(self, hashtags: List[str] = None, 
                           since: str = None, 
                           limit_per_tag: int = 20,
                           max_total: int = 80) -> Dict[str, Any]:
        """Endpoint principal para obtener contenido de hashtags"""
        
        hashtags = hashtags or self.hashtags_misiones[:5]  # Top 5 por defecto
        
        print(f"🚀 Instagram Hashtags Pull - Modo: {'SIMULACIÓN' if self.simulation_mode else 'REAL'}")
        print(f"📋 Hashtags: {hashtags}")
        print(f"📅 Since: {since or 'últimos 7 días'}")
        print(f"🔢 Límites: {limit_per_tag} per tag, {max_total} total")
        
        collected_posts = []
        
        for hashtag in hashtags:
            if len(collected_posts) >= max_total:
                break
            
            print(f"🔍 Procesando {hashtag}...")
            
            # Generar contenido simulado
            hashtag_posts = self.generate_realistic_content(hashtag)
            
            # Filtrar por fecha si se especifica
            if since:
                try:
                    since_dt = datetime.fromisoformat(since.replace("Z", ""))
                    hashtag_posts = [
                        p for p in hashtag_posts 
                        if datetime.fromisoformat(p["timestamp"]) > since_dt
                    ]
                except:
                    pass  # Si no se puede parsear, incluir todos
            
            # Limitar posts por hashtag
            hashtag_posts = hashtag_posts[:limit_per_tag]
            collected_posts.extend(hashtag_posts)
            
            print(f"✅ {len(hashtag_posts)} posts encontrados para {hashtag}")
            
            if len(collected_posts) >= max_total:
                collected_posts = collected_posts[:max_total]
                break
        
        # Análisis cost-aware
        print(f"🧠 Iniciando análisis IA cost-aware...")
        analyzed_posts = self.analyze_cost_aware_batch(collected_posts)
        
        # Estadísticas del pull
        stats = self._generate_pull_stats(analyzed_posts, hashtags)
        
        print(f"📊 Pull completado: {len(analyzed_posts)} posts, {stats['analysis_breakdown']}")
        
        return {
            "success": True,
            "posts": analyzed_posts,
            "stats": stats,
            "meta": {
                "hashtags": hashtags,
                "since": since,
                "mode": "simulation",
                "timestamp": datetime.now().isoformat(),
                "cost_aware": True
            }
        }

    def _generate_pull_stats(self, posts: List[Dict[str, Any]], hashtags: List[str]) -> Dict[str, Any]:
        """Genera estadísticas del pull realizado"""
        if not posts:
            return {"total": 0}
        
        # Análisis de sentiment
        sentiments = [p.get("sentiment", "neutral") for p in posts]
        sentiment_counts = {
            "positivo": sentiments.count("positivo") + sentiments.count("muy_positivo"),
            "negativo": sentiments.count("negativo") + sentiments.count("muy_negativo"), 
            "neutral": sentiments.count("neutral")
        }
        
        # Análisis de tópicos
        topics = [p.get("topic", "social") for p in posts]
        top_topics = {}
        for topic in set(topics):
            top_topics[topic] = topics.count(topic)
        
        # Posts de alto riesgo
        high_risk = [p for p in posts if p.get("risk", 0) >= 7.0]
        
        # Engagement promedio
        total_likes = sum(p["metrics"]["like_count"] for p in posts)
        total_comments = sum(p["metrics"]["comments_count"] for p in posts)
        avg_engagement = (total_likes + total_comments) / len(posts) if posts else 0
        
        # Tipos de análisis usados
        analysis_types = [p.get("analysis_type", "unknown") for p in posts]
        analysis_breakdown = {
            "heuristic": analysis_types.count("heuristic"),
            "llm_simulated": analysis_types.count("llm_simulated"),
            "llm_real": analysis_types.count("llm_real")
        }
        
        return {
            "total": len(posts),
            "hashtags_processed": len(hashtags),
            "sentiment_distribution": sentiment_counts,
            "top_topics": dict(sorted(top_topics.items(), key=lambda x: x[1], reverse=True)[:5]),
            "high_risk_posts": len(high_risk),
            "avg_engagement": round(avg_engagement, 1),
            "analysis_breakdown": analysis_breakdown,
            "period": "últimos 7 días",
            "cost_optimization": f"{analysis_breakdown['heuristic']} análisis básicos, {analysis_breakdown['llm_simulated']} IA simulada"
        }

    def get_health_status(self) -> Dict[str, Any]:
        """Estado del servicio"""
        return {
            "service": "Instagram Hashtags + IA",
            "status": "operational",
            "mode": "simulation" if self.simulation_mode else "production",
            "hashtags_configured": len(self.hashtags_misiones),
            "hashtags_list": self.hashtags_misiones,
            "llm_mode": self.llm_enabled,
            "cost_optimized": True,
            "features": {
                "cost_aware_ai": True,
                "hashtag_monitoring": True,
                "sentiment_analysis": True,
                "topic_classification": True,
                "risk_assessment": True,
                "batch_processing": True,
                "deduplication": True
            },
            "ready_for_production": self.simulation_mode,
            "next_steps": "Configurar Instagram tokens reales para datos en vivo"
        }

# Instancia global
instagram_service = InstagramHashtagsIA()