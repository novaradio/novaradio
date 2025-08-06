"""
DAMI - Centro de Comando Backend
Sistema específico para monitoreo del Frente Renovador de la Concordia Social
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import numpy as np
from collections import defaultdict
import random

logger = logging.getLogger(__name__)

class SituacionAnalyzer:
    """Analizador específico de situación para el Frente Renovador"""
    
    def __init__(self):
        # Actores clave del Frente Renovador
        self.actores_frente = [
            "Líder Principal", "Coordinador General", "Secretaria de Comunicaciones",
            "Referente Territorial", "Candidato Municipal"
        ]
        
        # Temas sensibles que afectan al Frente
        self.temas_sensibles = [
            "presupuesto municipal", "obras públicas", "empleo local", 
            "seguridad ciudadana", "servicios básicos", "transparencia"
        ]
        
        # Indicadores de ataques coordinados
        self.patrones_ataque = [
            "FrenteCorrupto", "NoMásPromesas", "FalsoRenovador",
            "SinResultados", "CambioVerdadero"
        ]
        
        # Fuentes de monitoreo
        self.fuentes_riesgo = [
            "Grupos opositores", "Medios adversos", "Redes sociales", 
            "Blogs políticos", "Influencers opositores"
        ]
    
    async def evaluar_situacion_actual(self) -> Dict[str, Any]:
        """Evaluar la situación actual específica del Frente"""
        
        # Simular datos realistas basados en patrones reales
        ataques_detectados = self._detectar_ataques_activos()
        desinformacion = self._analizar_desinformacion()
        sentiment_publico = self._calcular_sentiment_publico()
        amenazas_territoriales = self._evaluar_amenazas_territoriales()
        
        # Calcular nivel de amenaza general
        nivel_amenaza = self._calcular_nivel_amenaza(
            ataques_detectados, desinformacion, sentiment_publico
        )
        
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "nivel_amenaza": nivel_amenaza,
            "ataques_activos": len(ataques_detectados),
            "desinformacion_detectada": len(desinformacion),
            "sentiment_publico": sentiment_publico,
            "ataques_detalle": ataques_detectados,
            "desinformacion_detalle": desinformacion,
            "amenazas_territoriales": amenazas_territoriales,
            "recomendaciones_urgentes": self._generar_recomendaciones_urgentes(
                ataques_detectados, desinformacion
            )
        }
    
    def _detectar_ataques_activos(self) -> List[Dict[str, Any]]:
        """Detectar ataques coordinados activos contra el Frente"""
        ataques = []
        
        # Simular detección de ataques basados en patrones reales
        if random.random() > 0.3:  # 70% probabilidad de ataque activo
            ataques.append({
                "tipo": "CRÍTICO",
                "problema": "Campaña coordinada de desinformación detectada",
                "detalles": f"{random.randint(8, 15)} cuentas falsas difundiendo información falsa sobre {random.choice(self.temas_sensibles)}",
                "ubicacion": "Redes sociales - Twitter y Facebook",
                "tiempo": f"Hace {random.randint(10, 30)} minutos",
                "accion": "RESPONDER INMEDIATAMENTE con comunicado oficial",
                "responsable": "Equipo de Comunicaciones",
                "impacto": f"ALTO - {random.randint(1500, 3000)} interacciones detectadas",
                "hashtags_maliciosos": random.sample(self.patrones_ataque, 2),
                "origen_probable": random.choice(self.fuentes_riesgo)
            })
        
        if random.random() > 0.4:  # 60% probabilidad
            ataques.append({
                "tipo": "URGENTE",
                "problema": "Ataque coordinado en redes contra liderazgo",
                "detalles": f"Hashtag #{random.choice(self.patrones_ataque)} trending artificialmente",
                "ubicacion": "Twitter - Tendencias manipuladas",
                "tiempo": f"Hace {random.randint(30, 90)} minutos",
                "accion": "Activar red de apoyo digital y contra-narrativa",
                "responsable": "Coordinación Digital",
                "impacto": f"MEDIO - {random.randint(5000, 12000)} menciones",
                "actor_objetivo": random.choice(self.actores_frente),
                "bots_detectados": random.randint(15, 45)
            })
        
        if random.random() > 0.6:  # 40% probabilidad
            ataques.append({
                "tipo": "ATENCIÓN", 
                "problema": "Movimiento opositor planificando evento",
                "detalles": "Organización de marcha para el viernes en plaza central",
                "ubicacion": "Grupos de WhatsApp monitoreados",
                "tiempo": f"Hace {random.randint(1, 4)} horas",
                "accion": "Preparar evento de respuesta y logística",
                "responsable": "Coordinación Territorial",
                "impacto": f"BAJO - Evento local estimado {random.randint(200, 800)} personas",
                "fecha_evento": (datetime.now() + timedelta(days=random.randint(1, 5))).strftime("%d/%m/%Y"),
                "grupos_organizadores": random.randint(3, 8)
            })
        
        return ataques
    
    def _analizar_desinformacion(self) -> List[Dict[str, Any]]:
        """Analizar desinformación específica contra el Frente"""
        desinformacion = []
        
        noticias_falsas = [
            "Malversación de fondos municipales comprobada",
            "Líder del Frente involucrado en actos de corrupción",
            "Promesas incumplidas documentadas por auditoria",
            "Vínculos con empresas fantasma revelados",
            "Nepotismo en contrataciones públicas denunciado"
        ]
        
        for i in range(random.randint(1, 3)):
            desinformacion.append({
                "titulo": random.choice(noticias_falsas),
                "fuente": random.choice(["Blog opositor", "Cuenta falsa", "Medio adverso"]),
                "alcance": random.randint(800, 5000),
                "verificacion": "FALSO - Sin evidencia verificable",
                "tiempo_deteccion": f"Hace {random.randint(20, 180)} minutos",
                "plataformas": random.sample(["Facebook", "Twitter", "WhatsApp", "Instagram"], 2),
                "nivel_credibilidad": random.uniform(0.1, 0.3),
                "accion_recomendada": "Desmentir con datos oficiales"
            })
        
        return desinformacion
    
    def _calcular_sentiment_publico(self) -> float:
        """Calcular sentiment público hacia el Frente"""
        # Simular fluctuaciones realistas del sentiment
        base_sentiment = 0.65  # 65% base de apoyo
        fluctuacion = random.uniform(-0.15, 0.15)  # ±15% de fluctuación
        # Simplificar sentiment para porcentaje claro - Solo 2 decimales max
        return round(max(0.3, min(0.85, base_sentiment + fluctuacion)), 2)
    
    def _evaluar_amenazas_territoriales(self) -> List[Dict[str, Any]]:
        """Evaluar amenazas en territorios específicos"""
        territorios = ["Centro", "Zona Norte", "Zona Sur", "Zona Oeste", "Zona Este"]
        amenazas = []
        
        for territorio in random.sample(territorios, random.randint(1, 3)):
            amenazas.append({
                "territorio": territorio,
                "nivel_riesgo": random.choice(["BAJO", "MEDIO", "ALTO"]),
                "actividad_opositora": random.randint(20, 90),
                "sentiment_local": random.uniform(0.4, 0.8),
                "problemas_detectados": random.sample([
                    "Falta de servicios básicos", "Inseguridad ciudadana", 
                    "Desempleo alto", "Infraestructura deficiente"
                ], random.randint(1, 2)),
                "acciones_recomendadas": [
                    "Visita territorial urgente",
                    "Reunión con referentes locales",  
                    "Comunicación específica para la zona"
                ]
            })
        
        return amenazas
    
    def _calcular_nivel_amenaza(self, ataques: List, desinformacion: List, 
                               sentiment: float) -> str:
        """Calcular nivel general de amenaza"""
        puntuacion = 0
        
        # Puntuar por ataques activos
        puntuacion += len([a for a in ataques if a["tipo"] == "CRÍTICO"]) * 3
        puntuacion += len([a for a in ataques if a["tipo"] == "URGENTE"]) * 2
        puntuacion += len([a for a in ataques if a["tipo"] == "ATENCIÓN"]) * 1
        
        # Puntuar por desinformación
        puntuacion += len(desinformacion) * 1.5
        
        # Puntuar por sentiment bajo
        if sentiment < 0.5:
            puntuacion += 2
        elif sentiment < 0.6:
            puntuacion += 1
        
        # Determinar nivel
        if puntuacion >= 8:
            return "CRÍTICO"
        elif puntuacion >= 5:
            return "ALTO"
        elif puntuacion >= 2:
            return "MODERADO"
        else:
            return "BAJO"
    
    def _generar_recomendaciones_urgentes(self, ataques: List, 
                                        desinformacion: List) -> List[str]:
        """Generar recomendaciones específicas y urgentes"""
        recomendaciones = []
        
        if any(a["tipo"] == "CRÍTICO" for a in ataques):
            recomendaciones.extend([
                "🚨 ACCIÓN INMEDIATA: Activar protocolo de crisis comunicacional",
                "📞 Contactar medios afines para respuesta coordinada",
                "📱 Desplegar red de apoyo digital en todas las plataformas"
            ])
        
        if len(desinformacion) > 1:
            recomendaciones.extend([
                "🛡️ VERIFICACIÓN: Publicar fact-checking con evidencia oficial",
                "📊 DATOS: Mostrar resultados concretos de gestión",
                "🎯 TARGETING: Campaña específica para contrarrestar narrativa falsa"
            ])
        
        if any(a["tipo"] == "URGENTE" for a in ataques):
            recomendaciones.extend([
                "⚡ RESPUESTA RÁPIDA: Comunicado oficial en próximas 2 horas",
                "👥 MOVILIZACIÓN: Activar referentes territoriales",
                "📢 AMPLIFICACIÓN: Coordinar con militancia digital"
            ])
        
        return recomendaciones[:6]  # Máximo 6 recomendaciones

class MonitoreoTiempoReal:
    """Sistema de monitoreo en tiempo real específico"""
    
    def __init__(self):
        self.eventos_recientes = []
        self.fuentes_monitoreo = [
            "Medios tradicionales", "Redes sociales", "Facebook oficial",
            "Twitter oficial", "Blog político", "Grupos WhatsApp"
        ]
    
    async def obtener_eventos_tiempo_real(self) -> List[Dict[str, Any]]:
        """Obtener eventos que están pasando ahora mismo"""
        eventos = []
        
        eventos_posibles = [
            {
                "evento": "Mención positiva en medio local",
                "detalle": "Nota favorable sobre gestión en Canal 7",
                "sentimiento": "positivo",
                "fuente": "Medios tradicionales"
            },
            {
                "evento": "Actividad sospechosa detectada", 
                "detalle": f"{random.randint(20, 50)} cuentas nuevas mencionando misma frase",
                "sentimiento": "negativo",
                "fuente": "Redes sociales"
            },
            {
                "evento": "Apoyo ciudadano registrado",
                "detalle": "Comentarios positivos en publicación oficial",
                "sentimiento": "positivo", 
                "fuente": "Facebook oficial"
            },
            {
                "evento": "Crítica en blog opositor",
                "detalle": "Artículo crítico sobre última decisión municipal",
                "sentimiento": "negativo",
                "fuente": "Blog político"
            },
            {
                "evento": "Tendencia favorable detectada",
                "detalle": "Hashtag de apoyo ganando tracción orgánicamente",
                "sentimiento": "positivo",
                "fuente": "Twitter oficial"
            },
            {
                "evento": "Rumor desmentido exitosamente",
                "detalle": "Información falsa clarificada por fuentes oficiales",
                "sentimiento": "positivo",
                "fuente": "Medios tradicionales"
            }
        ]
        
        # Seleccionar 4-6 eventos recientes
        for i in range(random.randint(4, 6)):
            evento = random.choice(eventos_posibles).copy()
            # Agregar timestamp realista
            minutos_atras = random.randint(1, 120)
            tiempo_evento = datetime.now() - timedelta(minutes=minutos_atras)
            evento["tiempo"] = tiempo_evento.strftime("%H:%M")
            evento["timestamp"] = tiempo_evento.isoformat()
            
            eventos.append(evento)
        
        # Ordenar por tiempo (más reciente primero)
        eventos.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return eventos

# Instancias globales
situacion_analyzer = SituacionAnalyzer()
monitoreo_tiempo_real = MonitoreoTiempoReal()