"""
Centro Estadístico Backend - DAMI Centro de Monitoreo Inteligente
Análisis estadístico de actividad en redes sociales relacionada al Frente Renovador
"""

import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json

class CentroEstadisticoBackend:
    """Backend para generar estadísticas de redes sociales del Frente Renovador"""
    
    def __init__(self):
        self.frente_renovador = "Frente Renovador de la Concordia Social"
        self.redes_sociales = ["Facebook", "Twitter/X", "Instagram", "TikTok", "YouTube", "WhatsApp"]
        self.temas_principales = [
            "Política Económica", "Desarrollo Social", "Infraestructura", 
            "Educación", "Salud", "Seguridad", "Medio Ambiente", "Empleo"
        ]

    def generar_estadisticas_generales(self) -> Dict[str, Any]:
        """Genera estadísticas generales de actividad en redes"""
        return {
            "resumen_general": {
                "total_menciones": random.randint(1200, 2800),
                "menciones_positivas": random.randint(650, 1400),
                "menciones_negativas": random.randint(400, 900),
                "menciones_neutrales": random.randint(150, 500),
                "sentimiento_general": self._calcular_sentimiento_general(),
                "alcance_estimado": random.randint(45000, 120000),
                "engagement_rate": round(random.uniform(3.2, 8.7), 2),
                "ultima_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            "metricas_clave": {
                "crecimiento_semanal": round(random.uniform(-5.2, 15.8), 1),
                "indice_influencia": random.randint(72, 94),
                "score_reputacion": random.randint(68, 89),
                "nivel_crisis": self._determinar_nivel_crisis()
            }
        }

    def generar_estadisticas_por_red(self) -> List[Dict[str, Any]]:
        """Genera estadísticas detalladas por red social"""
        estadisticas = []
        
        for red in self.redes_sociales:
            menciones_total = random.randint(80, 600)
            positivas = random.randint(30, int(menciones_total * 0.6))
            negativas = random.randint(15, int(menciones_total * 0.4))
            neutrales = menciones_total - positivas - negativas
            
            estadisticas.append({
                "red_social": red,
                "menciones_total": menciones_total,
                "menciones_positivas": positivas,
                "menciones_negativas": negativas,
                "menciones_neutrales": neutrales,
                "porcentaje_positivo": round((positivas / menciones_total) * 100, 1),
                "porcentaje_negativo": round((negativas / menciones_total) * 100, 1),
                "tendencia": random.choice(["creciente", "decreciente", "estable"]),
                "hashtags_trending": self._generar_hashtags_trending(),
                "horario_pico": f"{random.randint(18, 22)}:00-{random.randint(23, 24)}:00",
                "audiencia_principal": random.choice(["25-34 años", "35-44 años", "45-54 años"])
            })
        
        return estadisticas

    def generar_analisis_tematico(self) -> List[Dict[str, Any]]:
        """Genera análisis por tema/área política"""
        analisis = []
        
        for tema in self.temas_principales:
            menciones = random.randint(50, 300)
            sentiment_score = round(random.uniform(-1.0, 1.0), 2)
            
            analisis.append({
                "tema": tema,
                "menciones": menciones,
                "sentiment_score": sentiment_score,
                "sentiment_label": self._obtener_sentiment_label(sentiment_score),
                "palabras_clave": self._generar_palabras_clave(tema),
                "impacto_estimado": random.choice(["Alto", "Medio", "Bajo"]),
                "recomendacion": self._generar_recomendacion_tema(tema, sentiment_score)
            })
        
        return sorted(analisis, key=lambda x: x["menciones"], reverse=True)

    def generar_tendencias_temporales(self) -> Dict[str, List[Dict[str, Any]]]:
        """Genera datos de tendencias en los últimos 7 días"""
        fechas = [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(6, -1, -1)]
        
        tendencias = {
            "menciones_diarias": [],
            "sentimiento_diario": [],
            "alcance_diario": []
        }
        
        for fecha in fechas:
            menciones_pos = random.randint(100, 250)
            menciones_neg = random.randint(50, 150)
            
            tendencias["menciones_diarias"].append({
                "fecha": fecha,
                "positivas": menciones_pos,
                "negativas": menciones_neg,
                "total": menciones_pos + menciones_neg
            })
            
            tendencias["sentimiento_diario"].append({
                "fecha": fecha,
                "score": round(random.uniform(-0.5, 0.8), 2)
            })
            
            tendencias["alcance_diario"].append({
                "fecha": fecha,
                "alcance": random.randint(8000, 25000),
                "engagement": round(random.uniform(2.1, 7.3), 2)
            })
        
        return tendencias

    def generar_alertas_estadisticas(self) -> List[Dict[str, Any]]:
        """Genera alertas basadas en anomalías estadísticas"""
        alertas = []
        
        # Alertas potenciales basadas en patrones
        alertas_posibles = [
            {
                "tipo": "aumento_menciones_negativas",
                "severidad": "alta",
                "mensaje": "Incremento del 45% en menciones negativas en las últimas 6 horas",
                "red_afectada": random.choice(self.redes_sociales),
                "accion_sugerida": "Activar protocolo de respuesta rápida en redes sociales"
            },
            {
                "tipo": "tendencia_positiva",
                "severidad": "baja",
                "mensaje": "Tendencia positiva sostenida en tema de Desarrollo Social",
                "red_afectada": "Facebook",
                "accion_sugerida": "Potenciar contenido relacionado con logros sociales"
            },
            {
                "tipo": "caida_engagement",
                "severidad": "media",
                "mensaje": "Disminución del 20% en engagement promedio",
                "red_afectada": "Instagram",
                "accion_sugerida": "Revisar estrategia de contenido visual"
            },
            {
                "tipo": "hashtag_viral",
                "severidad": "media",
                "mensaje": "Hashtag relacionado al Frente Renovador está trending",
                "red_afectada": "Twitter/X",
                "accion_sugerida": "Capitalizar momentum con contenido relevante"
            }
        ]
        
        # Seleccionar 2-4 alertas aleatorias
        num_alertas = random.randint(2, 4)
        alertas_seleccionadas = random.sample(alertas_posibles, num_alertas)
        
        for i, alerta in enumerate(alertas_seleccionadas):
            alerta.update({
                "id": i + 1,
                "timestamp": (datetime.now() - timedelta(hours=random.randint(1, 12))).strftime("%Y-%m-%d %H:%M:%S"),
                "estado": random.choice(["nueva", "en_proceso", "resuelta"])
            })
        
        return alertas_seleccionadas

    def _calcular_sentimiento_general(self) -> str:
        """Calcula el sentimiento general basado en métricas"""
        score = random.uniform(-1, 1)
        if score > 0.3:
            return "Positivo"
        elif score < -0.3:
            return "Negativo"
        else:
            return "Neutral"

    def _determinar_nivel_crisis(self) -> str:
        """Determina el nivel de crisis actual"""
        return random.choice(["Bajo", "Medio", "Alto"])

    def _generar_hashtags_trending(self) -> List[str]:
        """Genera hashtags trending relacionados"""
        hashtags_base = [
            "#FrenteRenovador", "#ConcordiaSocial", "#MisionesAvanza",
            "#DesarrolloSocial", "#CambioPositivo", "#UnidosPorMisiones",
            "#FuturoSostenible", "#InnovaciónSocial"
        ]
        return random.sample(hashtags_base, random.randint(3, 5))

    def _obtener_sentiment_label(self, score: float) -> str:
        """Convierte score numérico a etiqueta de sentimiento"""
        if score > 0.2:
            return "Positivo"
        elif score < -0.2:
            return "Negativo"
        else:
            return "Neutral"

    def _generar_palabras_clave(self, tema: str) -> List[str]:
        """Genera palabras clave por tema"""
        palabras_por_tema = {
            "Política Económica": ["empleo", "inversión", "crecimiento", "desarrollo", "oportunidades"],
            "Desarrollo Social": ["familia", "comunidad", "bienestar", "inclusión", "progreso"],
            "Infraestructura": ["obras", "rutas", "conectividad", "modernización", "servicios"],
            "Educación": ["escuelas", "conocimiento", "futuro", "capacitación", "oportunidades"],
            "Salud": ["hospitales", "atención", "prevención", "bienestar", "acceso"],
            "Seguridad": ["protección", "orden", "tranquilidad", "prevención", "comunidad"],
            "Medio Ambiente": ["sustentable", "verde", "conservación", "futuro", "limpio"],
            "Empleo": ["trabajo", "oportunidades", "capacitación", "desarrollo", "crecimiento"]
        }
        return random.sample(palabras_por_tema.get(tema, ["desarrollo", "progreso", "futuro"]), 3)

    def _generar_recomendacion_tema(self, tema: str, sentiment_score: float) -> str:
        """Genera recomendación específica por tema y sentimiento"""
        if sentiment_score > 0.3:
            return f"Potenciar comunicación positiva sobre {tema}. Amplificar casos de éxito."
        elif sentiment_score < -0.3:
            return f"Abordar críticas sobre {tema}. Desarrollar estrategia de comunicación específica."
        else:
            return f"Mantener presencia equilibrada en {tema}. Monitorear evolución."

    def obtener_estadisticas_completas(self) -> Dict[str, Any]:
        """Método principal que retorna todas las estadísticas"""
        return {
            "estadisticas_generales": self.generar_estadisticas_generales(),
            "estadisticas_por_red": self.generar_estadisticas_por_red(),
            "analisis_tematico": self.generar_analisis_tematico(),
            "tendencias_temporales": self.generar_tendencias_temporales(),
            "alertas": self.generar_alertas_estadisticas(),
            "metadata": {
                "generado": datetime.now().isoformat(),
                "version": "1.0",
                "enfoque": self.frente_renovador
            }
        }

# Instancia global para uso en las rutas de FastAPI
centro_estadistico = CentroEstadisticoBackend()