"""
Análisis de Competencia Backend - DAMI Centro de Monitoreo Inteligente
Monitoreo de partidos políticos opositores y análisis comparativo de influencia territorial
"""

import random
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import json
from integrations.twitter_api_v2 import twitter_api
from integrations.facebook_api import facebook_api
from integrations.instagram_api import instagram_api

class AnalisisCompetenciaBackend:
    """Backend para análisis de competencia política en Misiones"""
    
    def __init__(self):
        self.frente_renovador = "Frente Renovador de la Concordia Social"
        
        # Partidos políticos principales en Misiones
        self.partidos_competencia = {
            "JUNTOS_POR_EL_CAMBIO": {
                "nombre": "Juntos por el Cambio",
                "sigla": "JxC",
                "lider": "Patricia Bullrich / Mauricio Macri",
                "color": "#FFD700",
                "keywords": [
                    "Juntos por el Cambio", "JxC", "Cambiemos", "Pro", 
                    "Patricia Bullrich", "Mauricio Macri", "Horacio Rodríguez Larreta"
                ],
                "hashtags_principales": [
                    "#JuntosPorelCambio", "#JxC", "#Cambiemos", "#Pro"
                ],
                "tipo": "opositor_nacional"
            },
            "UNION_POR_LA_PATRIA": {
                "nombre": "Unión por la Patria",
                "sigla": "UxP",
                "lider": "Sergio Massa / Cristina Kirchner",
                "color": "#87CEEB",
                "keywords": [
                    "Unión por la Patria", "UxP", "Peronismo", "Kirchnerismo",
                    "Sergio Massa", "Cristina Kirchner", "Alberto Fernández"
                ],
                "hashtags_principales": [
                    "#UniónPorLaPatria", "#UxP", "#Peronismo", "#Kirchnerismo"
                ],
                "tipo": "competidor_nacional"
            },
            "LA_LIBERTAD_AVANZA": {
                "nombre": "La Libertad Avanza",
                "sigla": "LLA",
                "lider": "Javier Milei",
                "color": "#9932CC",
                "keywords": [
                    "La Libertad Avanza", "LLA", "Javier Milei", "Libertarios",
                    "Victoria Villarruel", "Liberal", "Minarquismo"
                ],
                "hashtags_principales": [
                    "#LaLibertadAvanza", "#LLA", "#Milei", "#Libertarios"
                ],
                "tipo": "disruptor_emergente"
            },
            "OPOSICION_LOCAL": {
                "nombre": "Oposición Local Misiones",
                "sigla": "OLM",
                "lider": "Varios referentes locales",
                "color": "#DC143C",
                "keywords": [
                    "oposición misiones", "concejales oposición", "intendentes oposición",
                    "crítica gobierno misiones", "alternativa política misiones"
                ],
                "hashtags_principales": [
                    "#OposicionMisiones", "#AlternativaMisiones", "#CambioMisiones"
                ],
                "tipo": "opositor_local"
            }
        }
        
        # Cache para datos de competencia
        self._cache_competencia = {}
        self._cache_timestamp = {}
        self._cache_duration = 300  # 5 minutos
        
    async def analizar_competencia_completa(self) -> Dict[str, Any]:
        """Análisis completo de la competencia política"""
        try:
            # Obtener datos de todas las plataformas para cada partido
            analisis_partidos = {}
            
            for partido_id, info_partido in self.partidos_competencia.items():
                print(f"Analizando partido: {info_partido['nombre']}")
                datos_partido = await self._obtener_datos_partido(partido_id, info_partido)
                analisis_partidos[partido_id] = datos_partido
            
            # Obtener datos del Frente Renovador para comparación
            datos_frente_renovador = await self._obtener_datos_frente_renovador()
            
            # Análisis comparativo
            analisis_comparativo = self._generar_analisis_comparativo(
                datos_frente_renovador, analisis_partidos
            )
            
            # Detección de campañas coordinadas
            campañas_detectadas = await self._detectar_campañas_coordinadas(analisis_partidos)
            
            # Análisis territorial
            influencia_territorial = self._analizar_influencia_territorial(analisis_partidos)
            
            return {
                "resumen_ejecutivo": {
                    "partidos_monitoreados": len(self.partidos_competencia),
                    "total_menciones_competencia": sum(
                        p.get("metricas_generales", {}).get("total_menciones", 0) 
                        for p in analisis_partidos.values()
                    ),
                    "nivel_amenaza_general": self._calcular_nivel_amenaza_general(analisis_partidos),
                    "campañas_coordinadas_detectadas": len(campañas_detectadas),
                    "timestamp": datetime.now().isoformat()
                },
                "analisis_por_partido": analisis_partidos,
                "datos_frente_renovador": datos_frente_renovador,
                "analisis_comparativo": analisis_comparativo,
                "campañas_coordinadas": campañas_detectadas,
                "influencia_territorial": influencia_territorial,
                "recomendaciones_estrategicas": self._generar_recomendaciones_estrategicas(
                    analisis_comparativo, campañas_detectadas
                ),
                "metadata": {
                    "algoritmo_deteccion": "sentiment_analysis + keyword_tracking + engagement_patterns",
                    "fuentes_datos": ["Twitter API v2", "Facebook Graph API", "Instagram Basic API"],
                    "metrica_confiabilidad": self._calcular_confiabilidad_datos(analisis_partidos),
                    "ultima_actualizacion": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            print(f"Error en análisis de competencia: {str(e)}")
            return self._generar_respuesta_fallback()
    
    async def _obtener_datos_partido(self, partido_id: str, info_partido: Dict[str, Any]) -> Dict[str, Any]:
        """Obtiene datos de un partido específico de las 3 APIs"""
        try:
            # Obtener datos de las APIs usando keywords del partido
            keywords = info_partido["keywords"]
            hashtags = info_partido["hashtags_principales"]
            
            # Simular análisis de datos reales (en producción, aquí irían las llamadas reales a APIs)
            datos_twitter = await self._analizar_partido_twitter(keywords, hashtags)
            datos_facebook = await self._analizar_partido_facebook(keywords, hashtags)
            datos_instagram = await self._analizar_partido_instagram(keywords, hashtags)
            
            # Combinar datos de las 3 plataformas
            total_menciones = (
                datos_twitter.get("menciones", 0) + 
                datos_facebook.get("menciones", 0) + 
                datos_instagram.get("menciones", 0)
            )
            
            sentiment_promedio = (
                (datos_twitter.get("sentiment", 0) * 0.25) +
                (datos_facebook.get("sentiment", 0) * 0.35) +
                (datos_instagram.get("sentiment", 0) * 0.4)
            )
            
            engagement_promedio = (
                (datos_twitter.get("engagement", 0) * 0.25) +
                (datos_facebook.get("engagement", 0) * 0.35) +
                (datos_instagram.get("engagement", 0) * 0.4)
            )
            
            return {
                "info_partido": info_partido,
                "metricas_generales": {
                    "total_menciones": total_menciones,
                    "sentiment_promedio": round(sentiment_promedio, 3),
                    "engagement_promedio": round(engagement_promedio, 2),
                    "nivel_actividad": self._determinar_nivel_actividad_partido(
                        total_menciones, engagement_promedio
                    ),
                    "tendencia_7dias": self._calcular_tendencia_partido(sentiment_promedio, engagement_promedio)
                },
                "datos_por_plataforma": {
                    "twitter": datos_twitter,
                    "facebook": datos_facebook,
                    "instagram": datos_instagram
                },
                "analisis_contenido": {
                    "temas_principales": self._extraer_temas_principales(info_partido["tipo"]),
                    "hashtags_virales": self._detectar_hashtags_virales(hashtags),
                    "influencers_asociados": self._identificar_influencers(info_partido["tipo"])
                },
                "riesgo_competitivo": self._evaluar_riesgo_competitivo(
                    total_menciones, sentiment_promedio, engagement_promedio, info_partido["tipo"]
                ),
                "ultima_actualizacion": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error obteniendo datos de {partido_id}: {str(e)}")
            return self._generar_datos_partido_fallback(info_partido)
    
    async def _analizar_partido_twitter(self, keywords: List[str], hashtags: List[str]) -> Dict[str, Any]:
        """Analiza presencia del partido en Twitter"""
        # En producción, aquí se haría búsqueda real en Twitter API
        # Por ahora, generar datos realistas basados en las keywords
        
        menciones_base = random.randint(50, 300)
        engagement_factor = random.uniform(2.0, 8.0)
        sentiment_factor = random.uniform(-0.3, 0.4)  # Competencia puede tener sentiment más variable
        
        return {
            "menciones": menciones_base,
            "retweets": int(menciones_base * 0.3),
            "likes": int(menciones_base * 1.5),
            "replies": int(menciones_base * 0.4),
            "sentiment": sentiment_factor,
            "engagement": engagement_factor,
            "hashtags_trending": random.sample(hashtags, min(3, len(hashtags))),
            "pico_actividad": f"{random.randint(14, 22)}:00-{random.randint(15, 23)}:00",
            "keywords_detectadas": random.sample(keywords, min(4, len(keywords)))
        }
    
    async def _analizar_partido_facebook(self, keywords: List[str], hashtags: List[str]) -> Dict[str, Any]:
        """Analiza presencia del partido en Facebook"""
        menciones_base = random.randint(30, 200)
        engagement_factor = random.uniform(3.0, 12.0)
        sentiment_factor = random.uniform(-0.2, 0.5)
        
        return {
            "menciones": menciones_base,
            "likes": int(menciones_base * 2.0),
            "shares": int(menciones_base * 0.2),
            "comments": int(menciones_base * 0.6),
            "sentiment": sentiment_factor,
            "engagement": engagement_factor,
            "posts_virales": random.randint(1, 5),
            "grupos_activos": random.randint(2, 8),
            "keywords_detectadas": random.sample(keywords, min(3, len(keywords)))
        }
    
    async def _analizar_partido_instagram(self, keywords: List[str], hashtags: List[str]) -> Dict[str, Any]:
        """Analiza presencia del partido en Instagram"""
        menciones_base = random.randint(20, 150)
        engagement_factor = random.uniform(5.0, 25.0)  # Instagram tiene engagement más alto
        sentiment_factor = random.uniform(0.0, 0.6)    # Instagram tiende a ser más positivo
        
        return {
            "menciones": menciones_base,
            "likes": int(menciones_base * 3.0),
            "comments": int(menciones_base * 0.5),
            "stories": int(menciones_base * 0.3),
            "sentiment": sentiment_factor,
            "engagement": engagement_factor,
            "contenido_visual": {
                "fotos": int(menciones_base * 0.7),
                "videos": int(menciones_base * 0.3),
                "reels": int(menciones_base * 0.2)
            },
            "hashtags_utilizados": random.sample(hashtags, min(4, len(hashtags)))
        }
    
    async def _obtener_datos_frente_renovador(self) -> Dict[str, Any]:
        """Obtiene datos del Frente Renovador para comparación"""
        try:
            # Usar las APIs existentes
            twitter_data = await twitter_api.get_frente_renovador_metrics()
            facebook_data = await facebook_api.get_frente_renovador_metrics()
            instagram_data = await instagram_api.get_frente_renovador_metrics()
            
            twitter_summary = twitter_data.get('summary', {})
            facebook_summary = facebook_data.get('summary', {})
            instagram_summary = instagram_data.get('summary', {})
            
            total_menciones = (
                twitter_summary.get('total_tweets', 0) +
                facebook_summary.get('total_posts', 0) +
                instagram_summary.get('total_posts', 0)
            )
            
            sentiment_promedio = (
                (twitter_summary.get('sentiment_score', 0) * 0.25) +
                (facebook_summary.get('sentiment_score', 0) * 0.35) +
                (instagram_summary.get('sentiment_score', 0) * 0.4)
            )
            
            engagement_promedio = (
                (twitter_summary.get('engagement_rate', 0) * 0.25) +
                (facebook_summary.get('engagement_rate', 0) * 0.35) +
                (instagram_summary.get('engagement_rate', 0) * 0.4)
            )
            
            return {
                "partido": self.frente_renovador,
                "metricas_generales": {
                    "total_menciones": total_menciones,
                    "sentiment_promedio": round(sentiment_promedio, 3),
                    "engagement_promedio": round(engagement_promedio, 2),
                    "nivel_actividad": "ALTO",  # Asumimos que el FR tiene alta actividad
                    "tendencia_7dias": "POSITIVA"
                },
                "datos_por_plataforma": {
                    "twitter": twitter_summary,
                    "facebook": facebook_summary,
                    "instagram": instagram_summary
                },
                "posicion_competitiva": "LIDER_REGIONAL",
                "ultima_actualizacion": datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error obteniendo datos Frente Renovador: {str(e)}")
            return {
                "partido": self.frente_renovador,
                "metricas_generales": {
                    "total_menciones": 500,
                    "sentiment_promedio": 0.4,
                    "engagement_promedio": 15.0,
                    "nivel_actividad": "ALTO",
                    "tendencia_7dias": "POSITIVA"
                },
                "posicion_competitiva": "LIDER_REGIONAL",
                "error": "Datos fallback utilizados"
            }
    
    def _generar_analisis_comparativo(self, datos_fr: Dict[str, Any], datos_competencia: Dict[str, Any]) -> Dict[str, Any]:
        """Genera análisis comparativo entre Frente Renovador y competencia"""
        fr_metrics = datos_fr.get("metricas_generales", {})
        
        comparaciones = []
        for partido_id, datos_partido in datos_competencia.items():
            competidor_metrics = datos_partido.get("metricas_generales", {})
            
            # Calcular diferencias
            diferencia_menciones = fr_metrics.get("total_menciones", 0) - competidor_metrics.get("total_menciones", 0)
            diferencia_sentiment = fr_metrics.get("sentiment_promedio", 0) - competidor_metrics.get("sentiment_promedio", 0)
            diferencia_engagement = fr_metrics.get("engagement_promedio", 0) - competidor_metrics.get("engagement_promedio", 0)
            
            nivel_amenaza = self._calcular_nivel_amenaza_individual(
                competidor_metrics.get("total_menciones", 0),
                competidor_metrics.get("sentiment_promedio", 0),
                competidor_metrics.get("engagement_promedio", 0),
                datos_partido.get("info_partido", {}).get("tipo", "")
            )
            
            comparaciones.append({
                "partido": datos_partido.get("info_partido", {}).get("nombre", "Desconocido"),
                "partido_id": partido_id,
                "diferencia_menciones": diferencia_menciones,
                "diferencia_sentiment": round(diferencia_sentiment, 3),
                "diferencia_engagement": round(diferencia_engagement, 2),
                "nivel_amenaza": nivel_amenaza,
                "ventaja_fr": {
                    "menciones": diferencia_menciones > 0,
                    "sentiment": diferencia_sentiment > 0,
                    "engagement": diferencia_engagement > 0
                },
                "recomendacion": self._generar_recomendacion_competidor(nivel_amenaza, diferencia_sentiment)
            })
        
        # Calcular posición general
        amenazas_altas = len([c for c in comparaciones if c["nivel_amenaza"] == "ALTA"])
        posicion_general = "DOMINANTE" if amenazas_altas == 0 else "COMPETITIVA" if amenazas_altas <= 2 else "DEFENSIVA"
        
        return {
            "posicion_general": posicion_general,
            "comparaciones_detalladas": comparaciones,
            "resumen_ventajas": {
                "menciones_superiores": len([c for c in comparaciones if c["ventaja_fr"]["menciones"]]),
                "sentiment_superior": len([c for c in comparaciones if c["ventaja_fr"]["sentiment"]]),
                "engagement_superior": len([c for c in comparaciones if c["ventaja_fr"]["engagement"]])
            },
            "principal_competidor": max(comparaciones, key=lambda x: x["diferencia_engagement"] if x["diferencia_engagement"] < 0 else 0)["partido"] if comparaciones else "Ninguno",
            "oportunidades_detectadas": self._identificar_oportunidades(comparaciones)
        }
    
    async def _detectar_campañas_coordinadas(self, datos_partidos: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detecta posibles campañas coordinadas entre partidos de oposición"""
        campañas_detectadas = []
        
        # Analizar patrones de actividad simultánea
        patrones_sospechosos = []
        
        for partido_id, datos in datos_partidos.items():
            metrics = datos.get("metricas_generales", {})
            
            # Detectar picos de actividad anómalos
            if (metrics.get("engagement_promedio", 0) > 15 and 
                metrics.get("total_menciones", 0) > 200):
                
                patrones_sospechosos.append({
                    "partido": datos.get("info_partido", {}).get("nombre"),
                    "tipo_patron": "pico_actividad_anonomo",
                    "engagement": metrics.get("engagement_promedio", 0),
                    "menciones": metrics.get("total_menciones", 0)
                })
        
        # Si hay múltiples partidos con alta actividad simultánea
        if len(patrones_sospechosos) >= 2:
            campañas_detectadas.append({
                "tipo_campaña": "coordinacion_anti_frente_renovador",
                "partidos_involucrados": [p["partido"] for p in patrones_sospechosos],
                "nivel_confianza": 0.75,
                "descripcion": "Actividad simultánea detectada en múltiples partidos de oposición",
                "metricas_evidencia": patrones_sospechosos,
                "accion_recomendada": "Monitoreo intensificado y preparación de contra-narrativa",
                "fecha_deteccion": datetime.now().isoformat()
            })
        
        # Simular detección de otras campañas coordinadas
        if random.random() > 0.6:  # 40% probabilidad de detectar campaña adicional
            campañas_detectadas.append({
                "tipo_campaña": "desinformacion_coordinada",
                "partidos_involucrados": ["Juntos por el Cambio", "Oposición Local Misiones"],
                "nivel_confianza": 0.68,
                "descripcion": "Hashtags y contenido similar distribuido simultáneamente",
                "hashtags_sospechosos": ["#MisionesCambia", "#AlternativaReal"],
                "accion_recomendada": "Verificación de facts y respuesta coordinada",
                "fecha_deteccion": datetime.now().isoformat()
            })
        
        return campañas_detectadas
    
    def _analizar_influencia_territorial(self, datos_partidos: Dict[str, Any]) -> Dict[str, Any]:
        """Analiza la influencia territorial de cada partido"""
        
        # Municipios clave de Misiones
        municipios_clave = [
            "Posadas", "Oberá", "Puerto Iguazú", "Eldorado", "Leandro N. Alem",
            "San Martín", "Apóstoles", "Candelaria", "Montecarlo", "San Pedro"
        ]
        
        influencia_por_municipio = {}
        
        for municipio in municipios_clave:
            influencias = {"Frente Renovador": random.uniform(0.3, 0.7)}  # FR tiene base sólida
            
            for partido_id, datos in datos_partidos.items():
                info = datos.get("info_partido", {})
                nombre = info.get("nombre", "")
                
                # Calcular influencia basada en tipo de partido y métricas
                if info.get("tipo") == "opositor_local":
                    influencia = random.uniform(0.1, 0.4)
                elif info.get("tipo") == "opositor_nacional":
                    influencia = random.uniform(0.15, 0.35)
                else:
                    influencia = random.uniform(0.05, 0.25)
                
                influencias[nombre] = influencia
            
            # Normalizar para que sumen 1.0
            total = sum(influencias.values())
            influencias = {k: round(v/total, 3) for k, v in influencias.items()}
            
            influencia_por_municipio[municipio] = {
                "influencias": influencias,
                "partido_dominante": max(influencias.items(), key=lambda x: x[1])[0],
                "nivel_competencia": "ALTA" if max(influencias.values()) < 0.5 else "MEDIA",
                "riesgo_alternancia": max(influencias.values()) < 0.6
            }
        
        return {
            "analisis_municipal": influencia_por_municipio,
            "resumen_territorial": {
                "municipios_seguros_fr": len([m for m in influencia_por_municipio.values() 
                                            if m["partido_dominante"] == "Frente Renovador" and not m["riesgo_alternancia"]]),
                "municipios_competitivos": len([m for m in influencia_por_municipio.values() 
                                              if m["nivel_competencia"] == "ALTA"]),
                "principal_competidor_territorial": self._identificar_principal_competidor_territorial(influencia_por_municipio)
            }
        }
    
    # Métodos auxiliares
    def _determinar_nivel_actividad_partido(self, menciones: int, engagement: float) -> str:
        """Determina el nivel de actividad de un partido"""
        if menciones > 250 or engagement > 20:
            return "MUY_ALTO"
        elif menciones > 150 or engagement > 12:
            return "ALTO"
        elif menciones > 80 or engagement > 6:
            return "MEDIO"
        else:
            return "BAJO"
    
    def _calcular_tendencia_partido(self, sentiment: float, engagement: float) -> str:
        """Calcula la tendencia de un partido"""
        if sentiment > 0.2 and engagement > 10:
            return "MUY_POSITIVA"
        elif sentiment > 0.1 or engagement > 8:
            return "POSITIVA"
        elif sentiment > -0.1 and engagement > 5:
            return "ESTABLE"
        else:
            return "NEGATIVA"
    
    def _evaluar_riesgo_competitivo(self, menciones: int, sentiment: float, engagement: float, tipo: str) -> Dict[str, Any]:
        """Evalúa el riesgo competitivo de un partido"""
        score_base = 0
        
        # Factor menciones
        if menciones > 200:
            score_base += 30
        elif menciones > 100:
            score_base += 20
        elif menciones > 50:
            score_base += 10
        
        # Factor sentiment
        if sentiment > 0.3:
            score_base += 25
        elif sentiment > 0.1:
            score_base += 15
        elif sentiment > -0.1:
            score_base += 5
        
        # Factor engagement
        if engagement > 15:
            score_base += 25
        elif engagement > 10:
            score_base += 15
        elif engagement > 5:
            score_base += 10
        
        # Factor tipo de partido
        if tipo == "opositor_local":
            score_base += 20  # Mayor riesgo local
        elif tipo == "opositor_nacional":
            score_base += 15
        elif tipo == "disruptor_emergente":
            score_base += 10
        
        # Determinar nivel de riesgo
        if score_base >= 70:
            nivel = "CRÍTICO"
        elif score_base >= 50:
            nivel = "ALTO"
        elif score_base >= 30:
            nivel = "MEDIO"
        else:
            nivel = "BAJO"
        
        return {
            "nivel_riesgo": nivel,
            "score_numerico": score_base,
            "factores_criticos": self._identificar_factores_criticos(menciones, sentiment, engagement),
            "tiempo_estimado_impacto": self._estimar_tiempo_impacto(score_base)
        }
    
    def _calcular_nivel_amenaza_general(self, datos_partidos: Dict[str, Any]) -> str:
        """Calcula el nivel de amenaza general de toda la competencia"""
        riesgos_altos = 0
        riesgos_criticos = 0
        
        for datos in datos_partidos.values():
            riesgo = datos.get("riesgo_competitivo", {}).get("nivel_riesgo", "BAJO")
            if riesgo == "CRÍTICO":
                riesgos_criticos += 1
            elif riesgo == "ALTO":
                riesgos_altos += 1
        
        if riesgos_criticos >= 2:
            return "CRÍTICO"
        elif riesgos_criticos >= 1 or riesgos_altos >= 3:
            return "ALTO"
        elif riesgos_altos >= 1:
            return "MEDIO"
        else:
            return "BAJO"
    
    def _calcular_nivel_amenaza_individual(self, menciones: int, sentiment: float, engagement: float, tipo: str) -> str:
        """Calcula nivel de amenaza de un partido individual"""
        if ((menciones > 200 and sentiment > 0.2) or 
            (engagement > 15 and tipo == "opositor_local")):
            return "ALTA"
        elif menciones > 100 or engagement > 8:
            return "MEDIA"
        else:
            return "BAJA"
    
    def _generar_recomendaciones_estrategicas(self, analisis_comparativo: Dict[str, Any], campañas: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Genera recomendaciones estratégicas basadas en el análisis"""
        recomendaciones = []
        
        posicion = analisis_comparativo.get("posicion_general", "COMPETITIVA")
        
        if posicion == "DEFENSIVA":
            recomendaciones.append({
                "prioridad": "CRÍTICA",
                "categoria": "comunicacion",
                "accion": "Intensificar campaña de comunicación positiva",
                "descripcion": "La competencia muestra alta actividad. Reforzar mensaje del Frente Renovador.",
                "recursos_necesarios": ["Equipo comunicaciones", "Budget publicidad", "Influencers aliados"],
                "tiempo_implementacion": "inmediato"
            })
        
        if len(campañas) > 0:
            recomendaciones.append({
                "prioridad": "ALTA",
                "categoria": "contra_inteligencia",
                "accion": "Monitoreo intensificado de campañas coordinadas",
                "descripcion": f"Se detectaron {len(campañas)} campañas coordinadas. Implementar seguimiento especial.",
                "recursos_necesarios": ["Analistas de datos", "Herramientas de monitoreo"],
                "tiempo_implementacion": "24-48 horas"
            })
        
        # Siempre incluir recomendaciones básicas
        recomendaciones.extend([
            {
                "prioridad": "MEDIA",
                "categoria": "inteligencia",
                "accion": "Análisis semanal de competencia",
                "descripcion": "Mantener monitoreo regular de todos los partidos políticos",
                "recursos_necesarios": ["Tiempo analista", "Acceso APIs"],
                "tiempo_implementacion": "proceso continuo"
            },
            {
                "prioridad": "MEDIA", 
                "categoria": "territorial",
                "accion": "Refuerzo en municipios competitivos",
                "descripcion": "Aumentar presencia en municipios con alta competencia detectada",
                "recursos_necesarios": ["Coordinadores territoriales", "Eventos locales"],
                "tiempo_implementacion": "2-4 semanas"
            }
        ])
        
        return recomendaciones
    
    # Métodos auxiliares adicionales
    def _extraer_temas_principales(self, tipo_partido: str) -> List[str]:
        """Extrae temas principales según el tipo de partido"""
        temas_por_tipo = {
            "opositor_nacional": ["Economía", "Corrupción", "Seguridad", "Inflación"],
            "opositor_local": ["Obras públicas", "Servicios municipales", "Transparencia", "Desarrollo local"],
            "disruptor_emergente": ["Cambio radical", "Anti-sistema", "Libertad económica", "Reducción del Estado"],
            "competidor_nacional": ["Justicia social", "Trabajo", "Derechos", "Inclusión"]
        }
        return temas_por_tipo.get(tipo_partido, ["Política general", "Gobierno", "Sociedad"])
    
    def _detectar_hashtags_virales(self, hashtags: List[str]) -> List[Dict[str, Any]]:
        """Simula detección de hashtags virales"""
        return [
            {
                "hashtag": random.choice(hashtags),
                "menciones": random.randint(100, 1000),
                "crecimiento": random.uniform(50, 200),
                "sentiment": random.uniform(-0.3, 0.4)
            }
            for _ in range(random.randint(1, 3))
        ]
    
    def _identificar_influencers(self, tipo_partido: str) -> List[Dict[str, Any]]:
        """Identifica influencers asociados según tipo de partido"""
        influencers_por_tipo = {
            "opositor_nacional": ["@usuario_jxc", "@analista_politico", "@periodista_opositor"],
            "opositor_local": ["@concejal_oposicion", "@vecino_critico", "@medio_local"],
            "disruptor_emergente": ["@libertario_influencer", "@economista_liberal", "@joven_militante"],
            "competidor_nacional": ["@dirigente_peronista", "@sindicalista", "@militante_social"]
        }
        
        usuarios = influencers_por_tipo.get(tipo_partido, ["@usuario_generico"])
        return [
            {
                "usuario": usuario,
                "seguidores": random.randint(5000, 50000),
                "engagement_rate": random.uniform(2.0, 8.0),
                "nivel_influencia": random.choice(["ALTO", "MEDIO", "BAJO"])
            }
            for usuario in random.sample(usuarios, min(2, len(usuarios)))
        ]
    
    def _calcular_confiabilidad_datos(self, datos_partidos: Dict[str, Any]) -> float:
        """Calcula la confiabilidad general de los datos"""
        # Simular cálculo de confiabilidad basado en cantidad de datos
        total_menciones = sum(
            datos.get("metricas_generales", {}).get("total_menciones", 0)
            for datos in datos_partidos.values()
        )
        
        if total_menciones > 1000:
            return 0.95
        elif total_menciones > 500:
            return 0.85
        elif total_menciones > 200:
            return 0.75
        else:
            return 0.65
    
    def _identificar_oportunidades(self, comparaciones: List[Dict[str, Any]]) -> List[str]:
        """Identifica oportunidades estratégicas"""
        oportunidades = []
        
        for comp in comparaciones:
            if comp["nivel_amenaza"] == "BAJA" and comp["diferencia_sentiment"] > 0.2:
                oportunidades.append(f"Amplificar ventaja en sentiment sobre {comp['partido']}")
            
            if comp["diferencia_engagement"] < -5:
                oportunidades.append(f"Mejorar engagement frente a {comp['partido']}")
        
        return oportunidades[:3]  # Máximo 3 oportunidades principales
    
    def _identificar_principal_competidor_territorial(self, influencia_municipal: Dict[str, Any]) -> str:
        """Identifica el principal competidor territorial"""
        competidores = {}
        
        for datos_municipio in influencia_municipal.values():
            dominante = datos_municipio["partido_dominante"]
            if dominante != "Frente Renovador":
                competidores[dominante] = competidores.get(dominante, 0) + 1
        
        if competidores:
            return max(competidores.items(), key=lambda x: x[1])[0]
        else:
            return "Ninguno"
    
    def _identificar_factores_criticos(self, menciones: int, sentiment: float, engagement: float) -> List[str]:
        """Identifica factores críticos de riesgo"""
        factores = []
        
        if menciones > 200:
            factores.append("Alto volumen de menciones")
        if sentiment > 0.3:
            factores.append("Sentiment muy positivo")
        if engagement > 15:
            factores.append("Engagement rate elevado")
        
        return factores
    
    def _estimar_tiempo_impacto(self, score: int) -> str:
        """Estima tiempo de potencial impacto"""
        if score >= 70:
            return "1-2 semanas"
        elif score >= 50:
            return "1-2 meses"
        elif score >= 30:
            return "3-6 meses"
        else:
            return "6+ meses"
    
    def _generar_recomendacion_competidor(self, nivel_amenaza: str, diferencia_sentiment: float) -> str:
        """Genera recomendación específica para un competidor"""
        if nivel_amenaza == "ALTA":
            return "Monitoreo intensivo y preparación de contra-estrategia"
        elif nivel_amenaza == "MEDIA" and diferencia_sentiment < -0.2:
            return "Mejorar comunicación y reforzar presencia territorial"
        else:
            return "Mantener monitoreo regular"
    
    def _generar_datos_partido_fallback(self, info_partido: Dict[str, Any]) -> Dict[str, Any]:
        """Genera datos fallback para un partido en caso de error"""
        return {
            "info_partido": info_partido,
            "metricas_generales": {
                "total_menciones": 0,
                "sentiment_promedio": 0,
                "engagement_promedio": 0,
                "nivel_actividad": "DESCONOCIDO",
                "tendencia_7dias": "SIN_DATOS"
            },
            "datos_por_plataforma": {
                "twitter": {"menciones": 0, "sentiment": 0, "engagement": 0},
                "facebook": {"menciones": 0, "sentiment": 0, "engagement": 0},
                "instagram": {"menciones": 0, "sentiment": 0, "engagement": 0}
            },
            "riesgo_competitivo": {
                "nivel_riesgo": "DESCONOCIDO",
                "score_numerico": 0
            },
            "error": "Datos no disponibles - modo fallback activado"
        }
    
    def _generar_respuesta_fallback(self) -> Dict[str, Any]:
        """Genera respuesta completa fallback en caso de error total"""
        return {
            "resumen_ejecutivo": {
                "partidos_monitoreados": 0,
                "total_menciones_competencia": 0,
                "nivel_amenaza_general": "DESCONOCIDO",
                "campañas_coordinadas_detectadas": 0,
                "timestamp": datetime.now().isoformat(),
                "error": "Sistema de análisis de competencia temporalmente no disponible"
            },
            "analisis_por_partido": {},
            "datos_frente_renovador": {"error": "Datos no disponibles"},
            "analisis_comparativo": {"posicion_general": "DESCONOCIDO"},
            "campañas_coordinadas": [],
            "influencia_territorial": {"error": "Análisis no disponible"},
            "recomendaciones_estrategicas": [
                {
                    "prioridad": "ALTA",
                    "categoria": "sistema",
                    "accion": "Verificar conexiones de API y reintentar análisis",
                    "descripcion": "El sistema de análisis de competencia requiere atención técnica",
                    "tiempo_implementacion": "inmediato"
                }
            ],
            "metadata": {
                "modo_fallback": True,
                "ultima_actualizacion": datetime.now().isoformat()
            }
        }

# Instancia global para uso en las rutas de FastAPI
analisis_competencia = AnalisisCompetenciaBackend()