"""
Módulo de Encuestas Sociales Predictivas para DAMI
Maneja recolección, análisis y visualización de datos de humor social
"""

import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import random
import logging

logger = logging.getLogger(__name__)

class EncuestasSocialesBackend:
    def __init__(self):
        self.municipios_misiones = [
            # Zona Norte
            {"nombre": "Iguazú", "coords": [-25.6000, -54.5667], "region": "Norte"},
            {"nombre": "Puerto Libertad", "coords": [-25.8833, -54.6000], "region": "Norte"},
            {"nombre": "Wanda", "coords": [-25.9667, -54.5833], "region": "Norte"},
            {"nombre": "Puerto Esperanza", "coords": [-25.9167, -54.7167], "region": "Norte"},
            {"nombre": "Colonia Delicia", "coords": [-25.7500, -54.7833], "region": "Norte"},
            {"nombre": "Puerto Piray", "coords": [-25.9000, -54.8167], "region": "Norte"},
            {"nombre": "Comandante Andresito", "coords": [-25.7333, -53.9667], "region": "Norte"},
            {"nombre": "San Antonio", "coords": [-25.6500, -54.7500], "region": "Norte"},
            {"nombre": "Puerto Iguazú", "coords": [-25.5985, -54.5758], "region": "Norte"},
            {"nombre": "Montecarlo", "coords": [-26.5667, -54.7667], "region": "Norte"},
            {"nombre": "Eldorado", "coords": [-26.4000, -54.6333], "region": "Norte"},
            {"nombre": "Santiago de Liniers", "coords": [-26.5167, -54.7500], "region": "Norte"},
            {"nombre": "Colonia Aurora", "coords": [-26.4167, -54.5833], "region": "Norte"},
            {"nombre": "San Pedro", "coords": [-26.6167, -54.1167], "region": "Norte"},
            {"nombre": "Bernardo de Irigoyen", "coords": [-26.2500, -53.6333], "region": "Norte"},
            {"nombre": "San Vicente", "coords": [-26.6167, -54.1333], "region": "Norte"},
            
            # Zona Centro
            {"nombre": "Posadas", "coords": [-27.3676, -55.8961], "region": "Centro"},
            {"nombre": "Garupá", "coords": [-27.4833, -55.8333], "region": "Centro"},
            {"nombre": "Candelaria", "coords": [-27.4667, -55.7500], "region": "Centro"},
            {"nombre": "Profundidad", "coords": [-27.5833, -55.6333], "region": "Centro"},
            {"nombre": "Santa Ana", "coords": [-27.3833, -55.5833], "region": "Centro"},
            {"nombre": "San Ignacio", "coords": [-27.2667, -55.5333], "region": "Centro"},
            {"nombre": "Loreto", "coords": [-27.3167, -55.5167], "region": "Centro"},
            {"nombre": "Puerto Rico", "coords": [-26.8000, -55.0167], "region": "Centro"},
            {"nombre": "Garuhapé", "coords": [-26.8667, -55.2667], "region": "Centro"},
            {"nombre": "Ruiz de Montoya", "coords": [-26.9333, -55.0833], "region": "Centro"},
            {"nombre": "Capioví", "coords": [-26.9167, -55.0500], "region": "Centro"},
            {"nombre": "Caraguatay", "coords": [-27.0500, -55.2000], "region": "Centro"},
            {"nombre": "El Soberbio", "coords": [-27.2833, -54.2000], "region": "Centro"},
            {"nombre": "Corpus", "coords": [-27.0833, -55.4833], "region": "Centro"},
            {"nombre": "Colonia Polana", "coords": [-27.1833, -55.3167], "region": "Centro"},
            {"nombre": "Aristóbulo del Valle", "coords": [-27.0833, -54.9167], "region": "Centro"},
            {"nombre": "Dos de Mayo", "coords": [-26.9000, -54.7333], "region": "Centro"},
            {"nombre": "Colonia Victoria", "coords": [-26.8167, -54.6333], "region": "Centro"},
            {"nombre": "9 de Julio", "coords": [-26.8333, -54.9000], "region": "Centro"},
            {"nombre": "Olegario V. Andrade", "coords": [-26.7333, -54.8167], "region": "Centro"},
            {"nombre": "25 de Mayo", "coords": [-26.9833, -54.7167], "region": "Centro"},
            {"nombre": "Florentino Ameghino", "coords": [-26.8667, -54.8667], "region": "Centro"},
            {"nombre": "Colonia Alberdi", "coords": [-26.7833, -54.7500], "region": "Centro"},
            {"nombre": "Campo Viera", "coords": [-27.0167, -54.8833], "region": "Centro"},
            {"nombre": "Gobernador Roca", "coords": [-27.1667, -54.7500], "region": "Centro"},
            {"nombre": "Hipólito Yrigoyen", "coords": [-26.9667, -54.8333], "region": "Centro"},
            {"nombre": "Jardín América", "coords": [-26.9833, -55.2333], "region": "Centro"},
            {"nombre": "Liebig", "coords": [-27.3333, -55.2333], "region": "Centro"},
            {"nombre": "Mártires", "coords": [-27.1167, -55.0833], "region": "Centro"},
            {"nombre": "Mojón Grande", "coords": [-27.3167, -55.3000], "region": "Centro"},
            {"nombre": "Panambí", "coords": [-27.2333, -55.2167], "region": "Centro"},
            {"nombre": "Cerro Corá", "coords": [-27.4167, -54.9833], "region": "Centro"},
            {"nombre": "Itacaruaré", "coords": [-26.8333, -54.9500], "region": "Centro"},
            {"nombre": "Leoni", "coords": [-27.1333, -55.1333], "region": "Centro"},
            {"nombre": "Gobernador López", "coords": [-27.1500, -55.0167], "region": "Centro"},
            {"nombre": "Guaraní", "coords": [-26.9167, -54.2167], "region": "Centro"},
            {"nombre": "Colonia Alicia", "coords": [-26.7167, -54.5833], "region": "Centro"},
            {"nombre": "Dos Arroyos", "coords": [-26.6833, -54.7167], "region": "Centro"},
            
            # Zona Sur
            {"nombre": "Oberá", "coords": [-27.4833, -55.1167], "region": "Sur"},
            {"nombre": "San Martín", "coords": [-26.5500, -54.9167], "region": "Sur"},
            {"nombre": "Leandro N. Alem", "coords": [-27.6000, -55.3167], "region": "Sur"},
            {"nombre": "Cerro Azul", "coords": [-27.6500, -55.5000], "region": "Sur"},
            {"nombre": "Apóstoles", "coords": [-27.9167, -55.7500], "region": "Sur"},
            {"nombre": "Azara", "coords": [-28.1167, -55.7167], "region": "Sur"},
            {"nombre": "Tres Capones", "coords": [-27.8167, -55.5333], "region": "Sur"},
            {"nombre": "San José", "coords": [-27.7833, -55.6000], "region": "Sur"},
            {"nombre": "Concepción de la Sierra", "coords": [-27.9833, -55.6167], "region": "Sur"},
            {"nombre": "Santa María", "coords": [-28.0167, -55.4833], "region": "Sur"},
            {"nombre": "Bonpland", "coords": [-27.8333, -56.0000], "region": "Sur"},
            {"nombre": "Libertador General San Martín", "coords": [-26.5500, -54.9167], "region": "Sur"},
            {"nombre": "General Alvear", "coords": [-27.6167, -55.0167], "region": "Sur"},
            {"nombre": "San Javier", "coords": [-27.8667, -55.1333], "region": "Sur"},
            {"nombre": "Alba Posse", "coords": [-27.5833, -54.7167], "region": "Sur"}
        ]
        
        self.emociones_disponibles = [
            "alegria", "bronca", "apatia", "esperanza", "miedo", 
            "tranquilidad", "preocupacion", "optimismo", "descontento"
        ]
        
        self.preguntas_encuesta = {
            "humor_social": "¿Cuál es tu estado de ánimo predominante respecto a la situación actual?",
            "situacion_politica": "¿Cómo evalúas la situación política actual?",
            "situacion_economica": "¿Cómo evalúas la situación económica actual?",
            "intencion_voto": "Si las elecciones fueran hoy, ¿a quién votarías?",
            "adhesion_frente_renovador": "¿Cuál es tu nivel de adhesión al Frente Renovador?"
        }

    async def obtener_datos_encuestas(self, fecha: str = None) -> Dict:
        """
        Obtiene datos de encuestas para una fecha específica
        """
        if not fecha:
            fecha = datetime.now().strftime('%Y-%m-%d')
        
        try:
            # En producción, esto consultaría la base de datos real
            # Por ahora, generamos datos de ejemplo realistas
            datos_municipios = self._generar_datos_ejemplo(fecha)
            resumen_general = self._calcular_resumen_general(datos_municipios)
            
            return {
                "fecha": fecha,
                "municipios": datos_municipios,
                "resumen": resumen_general,
                "alertas": self._generar_alertas_criticas(datos_municipios),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo datos de encuestas: {e}")
            return self._generar_respuesta_fallback(fecha)

    def _generar_datos_ejemplo(self, fecha: str) -> List[Dict]:
        """
        Genera datos de ejemplo realistas para cada municipio
        """
        datos = []
        
        for municipio in self.municipios_misiones:
            # Generar datos basados en patrones realistas
            respuestas = random.randint(20, 150)
            
            # Distribución de humor social
            humor_social = self._generar_humor_social()
            
            # Situación política y económica
            situacion_politica = self._generar_evaluacion_situacion("politica")
            situacion_economica = self._generar_evaluacion_situacion("economica")
            
            # Intención de voto
            intencion_voto = self._generar_intencion_voto()
            
            # Adhesión al Frente Renovador
            adhesion_fr = self._generar_adhesion_fr()
            
            # Determinar alertas
            alertas = self._determinar_alertas_municipio(humor_social, situacion_politica, adhesion_fr)
            
            # Calcular tendencia
            tendencia = self._calcular_tendencia(humor_social, adhesion_fr)
            
            datos.append({
                "nombre": municipio["nombre"],
                "coords": municipio["coords"],
                "region": municipio["region"],
                "respuestas": respuestas,
                "humor_social": humor_social,
                "situacion_politica": situacion_politica,
                "situacion_economica": situacion_economica,
                "intencion_voto": intencion_voto,
                "adhesion_fr": adhesion_fr,
                "alertas": alertas,
                "tendencia": tendencia,
                "ultima_actualizacion": datetime.now().isoformat()
            })
        
        return datos

    def _generar_humor_social(self) -> Dict:
        """
        Genera distribución de humor social
        """
        emociones = {
            "alegria": random.randint(5, 30),
            "bronca": random.randint(10, 35),
            "apatia": random.randint(5, 25),
            "esperanza": random.randint(10, 40),
            "miedo": random.randint(5, 25),
            "tranquilidad": random.randint(5, 20),
            "preocupacion": random.randint(15, 35),
            "optimismo": random.randint(10, 30),
            "descontento": random.randint(5, 30)
        }
        
        # Determinar emoción predominante
        predominante = max(emociones.items(), key=lambda x: x[1])[0]
        
        return {
            **emociones,
            "predominante": predominante,
            "indice_general": self._calcular_indice_humor(emociones)
        }

    def _generar_evaluacion_situacion(self, tipo: str) -> Dict:
        """
        Genera evaluación de situación política o económica
        """
        if tipo == "politica":
            return {
                "muy_buena": random.randint(5, 15),
                "buena": random.randint(15, 30),
                "regular": random.randint(25, 40),
                "mala": random.randint(15, 25),
                "muy_mala": random.randint(5, 15)
            }
        else:  # economica
            return {
                "muy_buena": random.randint(2, 10),
                "buena": random.randint(10, 25),
                "regular": random.randint(25, 40),
                "mala": random.randint(20, 35),
                "muy_mala": random.randint(10, 25)
            }

    def _generar_intencion_voto(self) -> Dict:
        """
        Genera intención de voto
        """
        return {
            "frente_renovador": random.randint(25, 55),
            "cambiemos": random.randint(10, 25),
            "peronismo": random.randint(10, 30),
            "otros_partidos": random.randint(5, 15),
            "no_decide": random.randint(10, 20),
            "no_contesta": random.randint(5, 15)
        }

    def _generar_adhesion_fr(self) -> Dict:
        """
        Genera niveles de adhesión al Frente Renovador
        """
        return {
            "muy_alta": random.randint(10, 25),
            "alta": random.randint(15, 30),
            "media": random.randint(20, 35),
            "baja": random.randint(10, 20),
            "muy_baja": random.randint(5, 15)
        }

    def _calcular_indice_humor(self, emociones: Dict) -> float:
        """
        Calcula índice general de humor social (0-10)
        """
        positivas = emociones.get("alegria", 0) + emociones.get("esperanza", 0) + emociones.get("optimismo", 0)
        negativas = emociones.get("bronca", 0) + emociones.get("miedo", 0) + emociones.get("descontento", 0)
        neutrales = emociones.get("apatia", 0) + emociones.get("tranquilidad", 0)
        
        total = positivas + negativas + neutrales
        if total == 0:
            return 5.0
        
        indice = (positivas * 2 + neutrales) / total * 5
        return round(indice, 1)

    def _determinar_alertas_municipio(self, humor: Dict, situacion: Dict, adhesion: Dict) -> List[str]:
        """
        Determina alertas para un municipio específico
        """
        alertas = []
        
        # Alerta por humor social muy negativo
        if humor["indice_general"] < 3.0:
            alertas.append("humor_social_critico")
        
        # Alerta por baja adhesión al FR
        adhesion_total = adhesion["muy_alta"] + adhesion["alta"]
        if adhesion_total < 30:
            alertas.append("adhesion_baja")
        
        # Alerta por alta evaluación negativa de situación política
        situacion_mala = situacion["mala"] + situacion["muy_mala"]
        if situacion_mala > 50:
            alertas.append("desaprobacion_alta")
        
        # Alerta por predominio de emociones negativas
        if humor["predominante"] in ["bronca", "miedo", "descontento"]:
            alertas.append("emociones_negativas")
        
        return alertas

    def _calcular_tendencia(self, humor: Dict, adhesion: Dict) -> str:
        """
        Calcula tendencia general del municipio
        """
        indice_humor = humor["indice_general"]
        adhesion_total = adhesion["muy_alta"] + adhesion["alta"]
        
        if indice_humor > 6.0 and adhesion_total > 45:
            return "muy_positiva"
        elif indice_humor > 4.5 and adhesion_total > 35:
            return "positiva"
        elif indice_humor > 3.5 and adhesion_total > 25:
            return "estable"
        elif indice_humor > 2.5 or adhesion_total > 20:
            return "negativa"
        else:
            return "muy_negativa"

    def _calcular_resumen_general(self, datos_municipios: List[Dict]) -> Dict:
        """
        Calcula resumen general de todas las encuestas
        """
        total_respuestas = sum(m["respuestas"] for m in datos_municipios)
        
        # Promedios de adhesión
        adhesion_promedio = sum(
            m["adhesion_fr"]["muy_alta"] + m["adhesion_fr"]["alta"] 
            for m in datos_municipios
        ) / len(datos_municipios)
        
        # Municipios críticos
        municipios_criticos = len([m for m in datos_municipios if len(m["alertas"]) > 0])
        
        # Índice de humor general
        humor_promedio = sum(m["humor_social"]["indice_general"] for m in datos_municipios) / len(datos_municipios)
        
        # Tendencia general
        tendencias = [m["tendencia"] for m in datos_municipios]
        tendencia_general = max(set(tendencias), key=tendencias.count)
        
        return {
            "total_respuestas": total_respuestas,
            "adhesion_fr_general": round(adhesion_promedio, 1),
            "municipios_criticos": municipios_criticos,
            "humor_social_promedio": round(humor_promedio, 1),
            "tendencia_general": tendencia_general,
            "municipios_totales": len(datos_municipios),
            "cobertura_territorial": f"{len(datos_municipios)}/78"
        }

    def _generar_alertas_criticas(self, datos_municipios: List[Dict]) -> List[Dict]:
        """
        Genera alertas críticas del sistema
        """
        alertas = []
        
        # Municipios con múltiples alertas
        municipios_problema = [m for m in datos_municipios if len(m["alertas"]) >= 2]
        
        if len(municipios_problema) > 5:
            alertas.append({
                "tipo": "multiple_municipios_criticos",
                "severidad": "alta",
                "mensaje": f"{len(municipios_problema)} municipios requieren atención inmediata",
                "municipios": [m["nombre"] for m in municipios_problema[:5]],
                "accion_recomendada": "Implementar plan de contingencia territorial"
            })
        
        # Tendencia general negativa
        tendencias_negativas = len([m for m in datos_municipios if m["tendencia"] in ["negativa", "muy_negativa"]])
        
        if tendencias_negativas > len(datos_municipios) * 0.3:
            alertas.append({
                "tipo": "tendencia_general_negativa",
                "severidad": "media",
                "mensaje": f"{tendencias_negativas} municipios muestran tendencia negativa",
                "porcentaje": round(tendencias_negativas / len(datos_municipios) * 100, 1),
                "accion_recomendada": "Reforzar comunicación política y presencia territorial"
            })
        
        return alertas

    def _generar_respuesta_fallback(self, fecha: str) -> Dict:
        """
        Genera respuesta de fallback en caso de error
        """
        return {
            "fecha": fecha,
            "municipios": [],
            "resumen": {
                "total_respuestas": 0,
                "adhesion_fr_general": 0,
                "municipios_criticos": 0,
                "humor_social_promedio": 0,
                "tendencia_general": "sin_datos",
                "municipios_totales": 78,
                "cobertura_territorial": "0/78"
            },
            "alertas": [{
                "tipo": "error_sistema",
                "severidad": "alta",
                "mensaje": "Error obteniendo datos de encuestas",
                "accion_recomendada": "Contactar soporte técnico"
            }],
            "error": True,
            "timestamp": datetime.now().isoformat()
        }

    async def generar_alerta_damibot(self, datos_encuestas: Dict) -> Dict:
        """
        Genera alertas para DAMIBOT basadas en datos de encuestas
        """
        alertas_criticas = datos_encuestas.get("alertas", [])
        resumen = datos_encuestas.get("resumen", {})
        
        if not alertas_criticas:
            return None
        
        # Priorizar alerta más crítica
        alerta_principal = max(alertas_criticas, key=lambda x: 
            {"alta": 3, "media": 2, "baja": 1}.get(x["severidad"], 0))
        
        mensaje_damibot = f"""
        🚨 ALERTA ENCUESTAS SOCIALES
        
        {alerta_principal['mensaje']}
        
        📊 Resumen actual:
        • Total respuestas: {resumen.get('total_respuestas', 0)}
        • Adhesión FR: {resumen.get('adhesion_fr_general', 0)}%
        • Municipios críticos: {resumen.get('municipios_criticos', 0)}
        
        💡 Acción recomendada:
        {alerta_principal['accion_recomendada']}
        """
        
        return {
            "tipo": "ENCUESTAS_ALERT",
            "severidad": alerta_principal["severidad"],
            "mensaje": mensaje_damibot.strip(),
            "timestamp": datetime.now().isoformat(),
            "datos_adicionales": {
                "municipios_afectados": alerta_principal.get("municipios", []),
                "porcentaje_impacto": alerta_principal.get("porcentaje", 0)
            }
        }

# Instancia global
encuestas_sociales = EncuestasSocialesBackend()