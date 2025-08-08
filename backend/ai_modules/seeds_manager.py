"""
🌱 DAMI Seeds Manager - Configuración Inteligente de Fuentes
Sistema para gestionar cuentas, hashtags, y fuentes de datos para monitoreo político
Soporte CSV para 78 municipios de Misiones + partidos + medios
"""

import os
import csv
import io
import json
import requests
from datetime import datetime
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class SeedSource:
    """Representa una fuente de datos (cuenta, hashtag, RSS, etc.)"""
    src: str  # fb, ig, yt, x, rss
    handle: str  # @cuenta, #hashtag, url, query
    alliance: Optional[str] = None  # frente_renovador_neo, lla_pro, pays_el_instrumento, etc.
    municipality: Optional[str] = None  # Posadas, Oberá, Eldorado, etc.
    actor: Optional[str] = None  # Gobierno, Municipalidad, Partido, Medio, etc.
    type: Optional[str] = None  # oficial, partido, medio, hashtag, query
    active: bool = True
    created_at: Optional[str] = None
    last_resolved: Optional[str] = None
    resolved_id: Optional[str] = None  # Para FB page_id, YT channel_id, etc.

class SeedsManager:
    def __init__(self):
        self.seeds_data: List[SeedSource] = []
        self.resolved_cache = {
            "fb_page_ids": {},  # handle -> {page_id, meta}
            "yt_channel_ids": {}  # handle -> {channel_id, meta}
        }
        
        # Config APIs
        self.fb_token = os.getenv("FB_TOKEN")
        self.ig_token = os.getenv("IG_LONG_LIVED_TOKEN") 
        self.ig_user_id = os.getenv("IG_USER_ID")
        self.youtube_key = os.getenv("YOUTUBE_API_KEY")
        self.x_bearer = os.getenv("X_BEARER_TOKEN")
        
        # Seeds por defecto para Misiones
        self.default_seeds = self._generate_default_seeds()
        
    def _generate_default_seeds(self) -> List[SeedSource]:
        """Genera seeds por defecto para Misiones"""
        seeds = []
        
        # HASHTAGS PRINCIPALES MISIONES
        hashtags_misiones = [
            "#Misiones", "#Posadas", "#Obera", "#Eldorado", "#PuertoIguazu",
            "#Garupa", "#LeandroNAlem", "#Apostoles", "#Montecarlo", "#SanVicente",
            "#SanPedro", "#Candelaria", "#SantaMaria", "#Concepcion", "#Ituzaingo"
        ]
        
        for hashtag in hashtags_misiones:
            seeds.append(SeedSource(
                src="ig",
                handle=hashtag,
                municipality=hashtag.replace("#", "") if hashtag != "#Misiones" else None,
                type="hashtag"
            ))
        
        # GOBIERNO Y PARTIDOS PRINCIPALES
        political_accounts = [
            # Gobierno Provincial
            SeedSource("fb", "@GobiernoDeMisiones", "frente_renovador_neo", None, "Gobierno Provincial", "oficial"),
            SeedSource("yt", "@GobiernoDeMisiones", "frente_renovador_neo", None, "Gobierno Provincial", "oficial"),
            
            # Municipalidad Posadas
            SeedSource("fb", "@muniposadas", "frente_renovador_neo", "Posadas", "Municipalidad", "oficial"),
            
            # Partidos Principales
            SeedSource("fb", "@ProMisiones", "lla_pro", None, "PRO Misiones", "partido"),
            SeedSource("fb", "@ucrmisionesweb", "ucr", None, "UCR Misiones", "partido"),
            SeedSource("fb", "@PartidoAgrarioySocial", "pays_el_instrumento", None, "PAyS", "partido"),
            SeedSource("fb", "@PO.Misiones", "partido_obrero", None, "Partido Obrero", "partido"),
            
            # Medios Principales
            SeedSource("fb", "@misionesonline", None, None, "Misiones Online", "medio"),
            SeedSource("fb", "@Territoriod", None, None, "El Territorio", "medio"),
            SeedSource("fb", "@tv12misiones", None, None, "Canal 12", "medio"),
            SeedSource("yt", "@misionesonline", None, None, "Misiones Online", "medio"),
            SeedSource("yt", "@ElTerritorioOficial", None, None, "El Territorio", "medio"),
            
            # RSS Feeds
            SeedSource("rss", "https://misionesonline.net/feed", None, None, "Misiones Online", "medio"),
            SeedSource("rss", "https://www.elterritorio.com.ar/rss", None, None, "El Territorio", "medio"),
            
            # Búsquedas YouTube
            SeedSource("yt_query", "Misiones política", None, None, "Política Provincial", "query"),
            SeedSource("yt_query", "Oscar Herrera Ahuad", "frente_renovador_neo", None, "Candidato Principal", "query"),
            SeedSource("yt_query", "Elecciones Misiones 2025", None, None, "Electoral", "query"),
            
            # Búsquedas X/Twitter (si hay token)
            SeedSource("x", "Misiones OR Posadas", None, None, "Términos Generales", "query"),
            SeedSource("x", "Oscar Herrera Ahuad OR Frente Renovador", "frente_renovador_neo", None, "Oficialismo", "query"),
            SeedSource("x", "La Libertad Avanza Misiones OR PRO Misiones", "lla_pro", None, "Oposición Principal", "query"),
        ]
        
        seeds.extend(political_accounts)
        
        return seeds

    def load_from_csv_text(self, csv_text: str) -> Dict[str, Any]:
        """Carga seeds desde texto CSV"""
        if not csv_text.strip():
            return {"error": "CSV vacío", "loaded": 0}
        
        try:
            # Limpiar CSV (remover comentarios #)
            lines = []
            for line in csv_text.splitlines():
                line = line.strip()
                if line and not line.startswith('#'):
                    lines.append(line)
            
            if not lines:
                return {"error": "No hay líneas válidas en CSV", "loaded": 0}
            
            csv_clean = '\n'.join(lines)
            reader = csv.DictReader(io.StringIO(csv_clean))
            
            loaded_seeds = []
            errors = []
            
            for row_num, row in enumerate(reader, 1):
                try:
                    src = row.get('src', '').strip().lower()
                    handle = row.get('handle', '').strip()
                    
                    if not src or not handle:
                        errors.append(f"Fila {row_num}: src o handle vacío")
                        continue
                    
                    seed = SeedSource(
                        src=src,
                        handle=handle,
                        alliance=row.get('alliance', '').strip() or None,
                        municipality=row.get('municipality', '').strip() or None,
                        actor=row.get('actor', '').strip() or None,
                        type=row.get('type', '').strip() or None,
                        created_at=datetime.now().isoformat()
                    )
                    
                    loaded_seeds.append(seed)
                    
                except Exception as e:
                    errors.append(f"Fila {row_num}: {str(e)}")
            
            # Actualizar seeds data
            self.seeds_data = loaded_seeds
            
            return {
                "success": True,
                "loaded": len(loaded_seeds),
                "errors": errors[:10],  # Máximo 10 errores
                "total_errors": len(errors)
            }
            
        except Exception as e:
            return {"error": f"Error parseando CSV: {str(e)}", "loaded": 0}

    def load_default_seeds(self) -> Dict[str, Any]:
        """Carga seeds por defecto para Misiones"""
        self.seeds_data = self.default_seeds.copy()
        
        return {
            "success": True,
            "loaded": len(self.seeds_data),
            "message": "Seeds por defecto de Misiones cargados",
            "breakdown": {
                "hashtags": len([s for s in self.seeds_data if s.src == "ig"]),
                "facebook": len([s for s in self.seeds_data if s.src == "fb"]),
                "youtube": len([s for s in self.seeds_data if s.src in ["yt", "yt_query"]]),
                "rss": len([s for s in self.seeds_data if s.src == "rss"]),
                "twitter": len([s for s in self.seeds_data if s.src == "x"])
            }
        }

    def get_seeds_by_source(self, source: str, active_only: bool = True) -> List[SeedSource]:
        """Obtiene seeds filtradas por fuente"""
        seeds = [s for s in self.seeds_data if s.src == source]
        if active_only:
            seeds = [s for s in seeds if s.active]
        return seeds

    def resolve_facebook_ids(self) -> Dict[str, Any]:
        """Resuelve handles de Facebook a Page IDs"""
        if not self.fb_token:
            return {"error": "Facebook token no configurado", "resolved": 0}
        
        fb_seeds = self.get_seeds_by_source("fb")
        resolved = {}
        errors = []
        
        for seed in fb_seeds:
            try:
                handle_clean = seed.handle.lstrip('@')
                
                # Intentar obtener page info
                url = f"https://graph.facebook.com/v18.0/{handle_clean}"
                params = {
                    "fields": "id,name,category,fan_count",
                    "access_token": self.fb_token
                }
                
                response = requests.get(url, params=params, timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    page_id = data.get("id")
                    
                    if page_id:
                        resolved[page_id] = {
                            "handle": seed.handle,
                            "alliance": seed.alliance,
                            "municipality": seed.municipality,
                            "actor": seed.actor,
                            "name": data.get("name"),
                            "category": data.get("category"),
                            "fans": data.get("fan_count")
                        }
                        
                        # Actualizar seed con ID resuelto
                        seed.resolved_id = page_id
                        seed.last_resolved = datetime.now().isoformat()
                        
                else:
                    errors.append(f"{seed.handle}: HTTP {response.status_code}")
                    
            except Exception as e:
                errors.append(f"{seed.handle}: {str(e)}")
        
        self.resolved_cache["fb_page_ids"] = resolved
        
        return {
            "success": True,
            "resolved": len(resolved),
            "errors": errors[:5],  # Máximo 5 errores
            "total_errors": len(errors),
            "pages": resolved
        }

    def resolve_youtube_channels(self) -> Dict[str, Any]:
        """Resuelve handles/URLs de YouTube a Channel IDs"""
        if not self.youtube_key:
            return {"error": "YouTube API key no configurado", "resolved": 0}
        
        yt_seeds = self.get_seeds_by_source("yt")
        resolved = {}
        errors = []
        
        for seed in yt_seeds:
            try:
                handle = seed.handle.strip()
                channel_id = None
                
                # Caso 1: URL completa del canal
                if handle.startswith("http"):
                    import re
                    match = re.search(r'/channel/([A-Za-z0-9_-]+)', handle)
                    if match:
                        channel_id = match.group(1)
                
                # Caso 2: Handle (@username)
                elif handle.startswith("@"):
                    url = "https://www.googleapis.com/youtube/v3/channels"
                    params = {
                        "part": "id,snippet,statistics",
                        "forHandle": handle.replace('@', ''),
                        "key": self.youtube_key
                    }
                    
                    response = requests.get(url, params=params, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        items = data.get("items", [])
                        if items:
                            channel_id = items[0]["id"]
                
                # Caso 3: Búsqueda por nombre
                else:
                    url = "https://www.googleapis.com/youtube/v3/search"
                    params = {
                        "part": "snippet",
                        "q": handle,
                        "type": "channel",
                        "maxResults": 1,
                        "key": self.youtube_key
                    }
                    
                    response = requests.get(url, params=params, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        items = data.get("items", [])
                        if items:
                            channel_id = items[0]["id"]["channelId"]
                
                if channel_id:
                    # Obtener info completa del canal
                    url = "https://www.googleapis.com/youtube/v3/channels"
                    params = {
                        "part": "snippet,statistics",
                        "id": channel_id,
                        "key": self.youtube_key
                    }
                    
                    response = requests.get(url, params=params, timeout=10)
                    if response.status_code == 200:
                        data = response.json()
                        items = data.get("items", [])
                        if items:
                            info = items[0]
                            
                            resolved[channel_id] = {
                                "handle": seed.handle,
                                "alliance": seed.alliance,
                                "municipality": seed.municipality,
                                "actor": seed.actor,
                                "title": info["snippet"].get("title"),
                                "description": info["snippet"].get("description", "")[:200],
                                "subscribers": info["statistics"].get("subscriberCount", "0"),
                                "videos": info["statistics"].get("videoCount", "0")
                            }
                            
                            # Actualizar seed
                            seed.resolved_id = channel_id
                            seed.last_resolved = datetime.now().isoformat()
                
                if not channel_id:
                    errors.append(f"{seed.handle}: No se pudo resolver")
                    
            except Exception as e:
                errors.append(f"{seed.handle}: {str(e)}")
        
        self.resolved_cache["yt_channel_ids"] = resolved
        
        return {
            "success": True,
            "resolved": len(resolved),
            "errors": errors[:5],
            "total_errors": len(errors),
            "channels": resolved
        }

    def bootstrap_all(self) -> Dict[str, Any]:
        """Resuelve todos los IDs (Facebook + YouTube)"""
        fb_result = self.resolve_facebook_ids()
        yt_result = self.resolve_youtube_channels()
        
        return {
            "success": True,
            "facebook": {
                "resolved": fb_result.get("resolved", 0),
                "errors": fb_result.get("total_errors", 0)
            },
            "youtube": {
                "resolved": yt_result.get("resolved", 0),
                "errors": yt_result.get("total_errors", 0)
            },
            "total_resolved": fb_result.get("resolved", 0) + yt_result.get("resolved", 0)
        }

    def get_status(self) -> Dict[str, Any]:
        """Estado completo del sistema seeds"""
        by_source = {}
        by_alliance = {}
        by_municipality = {}
        
        for seed in self.seeds_data:
            # Por fuente
            by_source[seed.src] = by_source.get(seed.src, 0) + 1
            
            # Por alianza
            if seed.alliance:
                by_alliance[seed.alliance] = by_alliance.get(seed.alliance, 0) + 1
            
            # Por municipio
            if seed.municipality:
                by_municipality[seed.municipality] = by_municipality.get(seed.municipality, 0) + 1
        
        return {
            "total_seeds": len(self.seeds_data),
            "active_seeds": len([s for s in self.seeds_data if s.active]),
            "by_source": by_source,
            "by_alliance": by_alliance,
            "by_municipality": by_municipality,
            "resolved_cache": {
                "facebook_pages": len(self.resolved_cache["fb_page_ids"]),
                "youtube_channels": len(self.resolved_cache["yt_channel_ids"])
            },
            "api_status": {
                "facebook": "✅" if self.fb_token else "❌",
                "instagram": "✅" if self.ig_token and self.ig_user_id else "❌",
                "youtube": "✅" if self.youtube_key else "❌",
                "twitter": "✅" if self.x_bearer else "❌"
            }
        }

    def export_to_csv(self) -> str:
        """Exporta seeds actuales a formato CSV"""
        if not self.seeds_data:
            return "src,handle,alliance,municipality,actor,type\n# No hay seeds configurados"
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(["src", "handle", "alliance", "municipality", "actor", "type"])
        
        # Datos
        for seed in self.seeds_data:
            writer.writerow([
                seed.src,
                seed.handle,
                seed.alliance or "",
                seed.municipality or "",
                seed.actor or "",
                seed.type or ""
            ])
        
        return output.getvalue()

# Instancia global
seeds_manager = SeedsManager()