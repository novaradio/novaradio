"""
DAMI - Análisis Predictivo Avanzado (Versión Ligera)
=====================================================

Sistema de análisis predictivo simplificado sin dependencias pesadas.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import numpy as np
from collections import defaultdict, deque
from enum import Enum

logger = logging.getLogger(__name__)

class PredictionType(Enum):
    """Tipos de predicciones disponibles"""
    ACTOR_BEHAVIOR = "actor_behavior"
    SOCIAL_TRENDS = "social_trends" 
    TERRITORIAL_CHANGES = "territorial_changes"
    CRISIS_PROBABILITY = "crisis_probability"
    SENTIMENT_EVOLUTION = "sentiment_evolution"

class PredictionLight:
    """Clase para almacenar predicciones ligeras"""
    
    def __init__(self, prediction_id: str, prediction_type: PredictionType,
                 target: str, probability: float, timeframe: str, 
                 confidence: float, details: Dict[str, Any]):
        self.prediction_id = prediction_id
        self.prediction_type = prediction_type
        self.target = target
        self.probability = probability
        self.timeframe = timeframe
        self.confidence = confidence
        self.details = details
        self.timestamp = datetime.utcnow()
        self.status = "active"

class SimpleTimeSeriesAnalyzer:
    """Analizador simple de series temporales"""
    
    def __init__(self, max_history: int = 100):
        self.data_history = deque(maxlen=max_history)
        self.patterns = defaultdict(list)
    
    def add_data_point(self, timestamp: datetime, value: float, category: str = "default"):
        """Agregar punto de datos"""
        data_point = {
            "timestamp": timestamp,
            "value": value,
            "category": category
        }
        self.data_history.append(data_point)
        self.patterns[category].append(value)
    
    def detect_trend(self, category: str = "default", window_size: int = 10) -> Dict[str, Any]:
        """Detectar tendencia en los datos"""
        if category not in self.patterns or len(self.patterns[category]) < window_size:
            return {"trend": "insufficient_data", "confidence": 0.0}
        
        recent_values = list(self.patterns[category])[-window_size:]
        
        # Calcular tendencia simple usando regresión lineal básica
        x = np.arange(len(recent_values))
        y = np.array(recent_values)
        
        # Pendiente simple
        if len(x) > 1:
            slope = (y[-1] - y[0]) / (len(y) - 1)
            
            if slope > 0.1:
                trend = "increasing"
                strength = min(1.0, abs(slope))
            elif slope < -0.1:
                trend = "decreasing" 
                strength = min(1.0, abs(slope))
            else:
                trend = "stable"
                strength = 1.0 - abs(slope)
        else:
            trend = "stable"
            strength = 0.5
        
        # Calcular volatilidad
        volatility = np.std(recent_values) if len(recent_values) > 1 else 0.0
        
        return {
            "trend": trend,
            "strength": float(strength),
            "volatility": float(volatility),
            "confidence": float(max(0.3, min(0.9, strength * (1 - volatility/10)))),
            "data_points": len(recent_values)
        }
    
    def forecast_next_values(self, category: str = "default", 
                           forecast_periods: int = 5) -> List[float]:
        """Pronóstico simple de valores futuros"""
        if category not in self.patterns or len(self.patterns[category]) < 3:
            return [0.5] * forecast_periods  # Valores neutros por defecto
        
        recent_values = list(self.patterns[category])[-10:]  # Últimos 10 valores
        
        # Pronóstico simple basado en tendencia lineal
        trend_analysis = self.detect_trend(category)
        last_value = recent_values[-1]
        trend_slope = 0.1 if trend_analysis["trend"] == "increasing" else \
                     -0.1 if trend_analysis["trend"] == "decreasing" else 0.0
        
        forecasted = []
        for i in range(1, forecast_periods + 1):
            # Valor base + tendencia + ruido aleatorio pequeño
            forecast_value = last_value + (trend_slope * i) + np.random.normal(0, 0.05)
            forecast_value = max(0.0, min(1.0, forecast_value))  # Mantener en rango [0,1]
            forecasted.append(float(forecast_value))
        
        return forecasted

class ActorBehaviorPredictor:
    """Predictor de comportamiento de actores"""
    
    def __init__(self):
        self.actor_history = defaultdict(list)
        self.behavior_patterns = {
            "verde": {"escalation_prob": 0.1, "volatility": 0.2},
            "amarilla": {"escalation_prob": 0.3, "volatility": 0.4},
            "naranja": {"escalation_prob": 0.6, "volatility": 0.7},
            "roja": {"escalation_prob": 0.8, "volatility": 0.9}
        }
    
    async def predict_actor_behavior(self, actor_data: Dict[str, Any]) -> PredictionLight:
        """Predecir comportamiento futuro de un actor"""
        
        actor_name = actor_data.get("name", "Unknown")
        current_status = actor_data.get("status", "verde")
        influence_score = actor_data.get("influence_score", 50)
        
        # Agregar a historial
        self.actor_history[actor_name].append({
            "timestamp": datetime.utcnow(),
            "status": current_status,
            "influence": influence_score
        })
        
        # Calcular probabilidad de escalamiento
        base_prob = self.behavior_patterns[current_status]["escalation_prob"]
        influence_modifier = min(0.3, influence_score / 100 * 0.3)  # Mayor influencia = mayor riesgo
        
        # Ajustar por historial si existe
        if len(self.actor_history[actor_name]) > 1:
            recent_statuses = [entry["status"] for entry in self.actor_history[actor_name][-5:]]
            status_changes = len(set(recent_statuses))
            volatility_modifier = status_changes * 0.1  # Más cambios = más volátil
        else:
            volatility_modifier = 0.0
        
        escalation_probability = min(0.95, base_prob + influence_modifier + volatility_modifier)
        
        # Determinar timeframe basado en status actual
        if current_status == "roja":
            timeframe = "12-24 horas"
            confidence = 0.85
        elif current_status == "naranja":
            timeframe = "24-48 horas"
            confidence = 0.75
        else:
            timeframe = "3-7 días"
            confidence = 0.65
        
        prediction_id = f"actor_pred_{actor_name}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        return PredictionLight(
            prediction_id=prediction_id,
            prediction_type=PredictionType.ACTOR_BEHAVIOR,
            target=actor_name,
            probability=float(escalation_probability),
            timeframe=timeframe,
            confidence=confidence,
            details={
                "current_status": current_status,
                "influence_score": influence_score,
                "base_probability": base_prob,
                "modifiers": {
                    "influence": influence_modifier,
                    "volatility": volatility_modifier
                },
                "predicted_actions": self._generate_predicted_actions(current_status, escalation_probability)
            }
        )
    
    def _generate_predicted_actions(self, current_status: str, escalation_prob: float) -> List[str]:
        """Generar acciones predichas basadas en estado y probabilidad"""
        actions = []
        
        if escalation_prob > 0.7:
            actions.extend([
                "Declaraciones públicas controvertidas",
                "Movilización de seguidores",
                "Confrontación directa con opositores"
            ])
        elif escalation_prob > 0.4:
            actions.extend([
                "Incremento en actividad en redes sociales",
                "Reuniones con aliados estratégicos",
                "Declaraciones críticas moderadas"
            ])
        else:
            actions.extend([
                "Mantenimiento de posición actual",
                "Actividad rutinaria",
                "Declaraciones de bajo impacto"
            ])
        
        return actions[:3]  # Máximo 3 acciones predichas

class SocialTrendPredictor:
    """Predictor de tendencias sociales"""
    
    def __init__(self):
        self.social_data = SimpleTimeSeriesAnalyzer(max_history=200)
        self.trend_keywords = {
            "political": ["gobierno", "presidente", "política", "elecciones"],
            "social": ["sociedad", "gente", "pueblo", "ciudadanos"],
            "economic": ["economía", "trabajo", "dinero", "crisis"],
            "security": ["seguridad", "violencia", "crimen", "paz"]
        }
    
    async def predict_social_trends(self, social_media_data: List[Dict[str, Any]]) -> PredictionLight:
        """Predecir tendencias sociales basadas en datos de redes sociales"""
        
        # Analizar sentiment y temas en los datos sociales
        sentiment_scores = []
        topic_counts = defaultdict(int)
        
        for post in social_media_data[-50:]:  # Últimos 50 posts
            content = post.get("content", "").lower()
            
            # Análisis de sentiment básico
            positive_words = ["bueno", "excelente", "genial", "feliz", "positivo"]
            negative_words = ["malo", "terrible", "odio", "triste", "negativo"]
            
            pos_count = sum(1 for word in positive_words if word in content)
            neg_count = sum(1 for word in negative_words if word in content)
            
            if pos_count > neg_count:
                sentiment = 0.7
            elif neg_count > pos_count:
                sentiment = 0.3
            else:
                sentiment = 0.5
            
            sentiment_scores.append(sentiment)
            
            # Categorización por tema
            for category, keywords in self.trend_keywords.items():
                if any(keyword in content for keyword in keywords):
                    topic_counts[category] += 1
        
        # Calcular métricas agregadas
        avg_sentiment = np.mean(sentiment_scores) if sentiment_scores else 0.5
        sentiment_volatility = np.std(sentiment_scores) if len(sentiment_scores) > 1 else 0.0
        dominant_topic = max(topic_counts.items(), key=lambda x: x[1]) if topic_counts else ("general", 0)
        
        # Agregar datos a serie temporal
        self.social_data.add_data_point(
            datetime.utcnow(), 
            avg_sentiment, 
            "sentiment"
        )
        
        # Detectar tendencia
        trend_analysis = self.social_data.detect_trend("sentiment")
        
        # Predecir evolución del sentiment
        future_sentiments = self.social_data.forecast_next_values("sentiment", 7)
        
        # Calcular probabilidad de cambio significativo
        trend_change_prob = min(0.9, sentiment_volatility * 2 + (0.3 if trend_analysis["strength"] > 0.6 else 0.0))
        
        prediction_id = f"social_trend_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        return PredictionLight(
            prediction_id=prediction_id,
            prediction_type=PredictionType.SOCIAL_TRENDS,
            target="sentiment_social",
            probability=float(trend_change_prob),
            timeframe="5-7 días",
            confidence=0.7,
            details={
                "current_sentiment": float(avg_sentiment),
                "sentiment_volatility": float(sentiment_volatility),
                "trend_analysis": trend_analysis,
                "dominant_topic": dominant_topic[0],
                "topic_distribution": dict(topic_counts),
                "future_sentiment_forecast": [float(x) for x in future_sentiments],
                "sample_size": len(sentiment_scores)
            }
        )

class CrisisProbabilityPredictor:
    """Predictor de probabilidad de crisis"""
    
    def __init__(self):
        self.crisis_indicators = {
            "high_risk_actors": 0.3,
            "social_unrest": 0.25,
            "territorial_tension": 0.2,
            "misinformation_spread": 0.15,
            "economic_indicators": 0.1
        }
    
    async def predict_crisis_probability(self, system_data: Dict[str, Any]) -> PredictionLight:
        """Predecir probabilidad de crisis sistémica"""
        
        # Evaluar indicadores de crisis
        crisis_score = 0.0
        indicator_details = {}
        
        # Analizar actores de alto riesgo
        actors = system_data.get("actors", [])
        high_risk_actors = len([a for a in actors if a.get("status") in ["naranja", "roja"]])
        actor_risk = min(1.0, high_risk_actors / max(len(actors), 1) * 2)
        crisis_score += actor_risk * self.crisis_indicators["high_risk_actors"]
        indicator_details["high_risk_actors"] = {"count": high_risk_actors, "risk_score": float(actor_risk)}
        
        # Analizar agitación social
        social_posts = system_data.get("social_media", [])
        if social_posts:
            negative_sentiment_posts = 0
            for post in social_posts[-20:]:  # Últimos 20 posts
                content = post.get("content", "").lower()
                if any(word in content for word in ["protesta", "manifestación", "indignado", "crisis"]):
                    negative_sentiment_posts += 1
            
            social_unrest_score = negative_sentiment_posts / min(len(social_posts), 20)
            crisis_score += social_unrest_score * self.crisis_indicators["social_unrest"]
            indicator_details["social_unrest"] = {"negative_posts": negative_sentiment_posts, "unrest_score": float(social_unrest_score)}
        
        # Analizar tensión territorial
        zones = system_data.get("zones", [])
        high_activity_zones = len([z for z in zones if z.get("activity_level", 0) > 70])
        territorial_tension = min(1.0, high_activity_zones / max(len(zones), 1) * 1.5)
        crisis_score += territorial_tension * self.crisis_indicators["territorial_tension"]
        indicator_details["territorial_tension"] = {"high_activity_zones": high_activity_zones, "tension_score": float(territorial_tension)}
        
        # Simular otros indicadores
        misinformation_score = np.random.uniform(0.1, 0.6)
        economic_score = np.random.uniform(0.2, 0.8)
        
        crisis_score += misinformation_score * self.crisis_indicators["misinformation_spread"]
        crisis_score += economic_score * self.crisis_indicators["economic_indicators"]
        
        indicator_details["misinformation_spread"] = {"score": float(misinformation_score)}
        indicator_details["economic_indicators"] = {"score": float(economic_score)}
        
        # Normalizar puntuación final
        crisis_probability = min(0.95, crisis_score)
        
        # Determinar timeframe y confianza basado en probabilidad
        if crisis_probability > 0.7:
            timeframe = "24-72 horas"
            confidence = 0.8
        elif crisis_probability > 0.4:
            timeframe = "3-7 días"
            confidence = 0.7
        else:
            timeframe = "1-2 semanas"
            confidence = 0.6
        
        prediction_id = f"crisis_prob_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        return PredictionLight(
            prediction_id=prediction_id,
            prediction_type=PredictionType.CRISIS_PROBABILITY,
            target="system_stability",
            probability=float(crisis_probability),
            timeframe=timeframe,
            confidence=confidence,
            details={
                "overall_crisis_score": float(crisis_score),
                "indicator_breakdown": indicator_details,
                "risk_level": "high" if crisis_probability > 0.6 else "medium" if crisis_probability > 0.3 else "low",
                "contributing_factors": self._identify_top_factors(indicator_details),
                "mitigation_recommendations": self._generate_mitigation_recommendations(crisis_probability, indicator_details)
            }
        )
    
    def _identify_top_factors(self, indicators: Dict[str, Any]) -> List[str]:
        """Identificar principales factores contribuyentes"""
        factors = []
        
        if indicators.get("high_risk_actors", {}).get("risk_score", 0) > 0.5:
            factors.append("Múltiples actores en estado de alto riesgo")
        
        if indicators.get("social_unrest", {}).get("unrest_score", 0) > 0.3:
            factors.append("Incremento en agitación social")
        
        if indicators.get("territorial_tension", {}).get("tension_score", 0) > 0.4:
            factors.append("Alta tensión en zonas territoriales")
        
        return factors[:3]  # Top 3 factores
    
    def _generate_mitigation_recommendations(self, crisis_prob: float, 
                                           indicators: Dict[str, Any]) -> List[str]:
        """Generar recomendaciones de mitigación"""
        recommendations = []
        
        if crisis_prob > 0.6:
            recommendations.extend([
                "🚨 Activar protocolos de respuesta de crisis",
                "📞 Contactar autoridades competentes",
                "📢 Preparar comunicaciones de crisis"
            ])
        
        if indicators.get("high_risk_actors", {}).get("risk_score", 0) > 0.4:
            recommendations.append("🎯 Intensificar monitoreo de actores críticos")
        
        if indicators.get("social_unrest", {}).get("unrest_score", 0) > 0.3:
            recommendations.append("📱 Implementar monitoreo social ampliado")
        
        return recommendations[:5]  # Máximo 5 recomendaciones

class AdvancedPredictiveAnalytics:
    """Sistema principal de análisis predictivo"""
    
    def __init__(self):
        self.actor_predictor = ActorBehaviorPredictor()
        self.social_predictor = SocialTrendPredictor()
        self.crisis_predictor = CrisisProbabilityPredictor()
        self.prediction_history = deque(maxlen=1000)
        self.active_predictions = {}
    
    async def run_comprehensive_prediction(self, system_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ejecutar análisis predictivo completo"""
        
        predictions = {}
        
        try:
            # Predicción de comportamiento de actores principales
            actors = system_data.get("actors", [])
            actor_predictions = []
            
            for actor in actors[:5]:  # Top 5 actores más relevantes
                prediction = await self.actor_predictor.predict_actor_behavior(actor)
                actor_predictions.append({
                    "prediction_id": prediction.prediction_id,
                    "actor": prediction.target,
                    "escalation_probability": prediction.probability,
                    "timeframe": prediction.timeframe,
                    "confidence": prediction.confidence,
                    "details": prediction.details
                })
            
            predictions["actor_behavior"] = actor_predictions
            
            # Predicción de tendencias sociales
            social_media_data = system_data.get("social_media", [])
            if social_media_data:
                social_prediction = await self.social_predictor.predict_social_trends(social_media_data)
                predictions["social_trends"] = {
                    "prediction_id": social_prediction.prediction_id,
                    "trend_change_probability": social_prediction.probability,
                    "timeframe": social_prediction.timeframe,
                    "confidence": social_prediction.confidence,
                    "details": social_prediction.details
                }
            
            # Predicción de crisis sistémica
            crisis_prediction = await self.crisis_predictor.predict_crisis_probability(system_data)
            predictions["crisis_probability"] = {
                "prediction_id": crisis_prediction.prediction_id,
                "crisis_probability": crisis_prediction.probability,
                "timeframe": crisis_prediction.timeframe,
                "confidence": crisis_prediction.confidence,
                "details": crisis_prediction.details
            }
            
            # Almacenar predicciones
            for category, prediction_data in predictions.items():
                if isinstance(prediction_data, list):
                    for pred in prediction_data:
                        self.prediction_history.append({
                            "category": category,
                            "prediction": pred,
                            "timestamp": datetime.utcnow()
                        })
                        self.active_predictions[pred["prediction_id"]] = pred
                else:
                    self.prediction_history.append({
                        "category": category,
                        "prediction": prediction_data,
                        "timestamp": datetime.utcnow()
                    })
                    self.active_predictions[prediction_data["prediction_id"]] = prediction_data
            
            # Generar resumen ejecutivo
            executive_summary = self._generate_executive_summary(predictions)
            
            return {
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "predictions": predictions,
                "executive_summary": executive_summary,
                "total_predictions": len(self.active_predictions),
                "analysis_confidence": self._calculate_overall_confidence(predictions),
                "next_analysis_recommended": (datetime.utcnow() + timedelta(hours=6)).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error en análisis predictivo: {e}")
            return {"error": str(e), "timestamp": datetime.utcnow().isoformat()}
    
    def _generate_executive_summary(self, predictions: Dict[str, Any]) -> Dict[str, Any]:
        """Generar resumen ejecutivo de predicciones"""
        summary = {
            "overall_risk_level": "low",
            "key_insights": [],
            "immediate_actions": [],
            "monitoring_priorities": []
        }
        
        # Evaluar riesgo general
        max_risk = 0.0
        
        # Riesgo de actores
        actor_predictions = predictions.get("actor_behavior", [])
        if actor_predictions:
            max_actor_risk = max(pred["escalation_probability"] for pred in actor_predictions)
            max_risk = max(max_risk, max_actor_risk)
            
            if max_actor_risk > 0.7:
                summary["key_insights"].append(f"Alto riesgo de escalamiento en actores políticos")
                summary["immediate_actions"].append("Incrementar vigilancia de actores críticos")
        
        # Riesgo de crisis
        crisis_data = predictions.get("crisis_probability", {})
        if crisis_data:
            crisis_prob = crisis_data.get("crisis_probability", 0)
            max_risk = max(max_risk, crisis_prob)
            
            if crisis_prob > 0.6:
                summary["key_insights"].append("Probabilidad elevada de crisis sistémica")
                summary["immediate_actions"].append("Activar protocolos de respuesta")
        
        # Determinar nivel de riesgo general
        if max_risk > 0.7:
            summary["overall_risk_level"] = "high"
        elif max_risk > 0.4:
            summary["overall_risk_level"] = "medium"
        
        # Agregar prioridades de monitoreo
        if actor_predictions:
            high_risk_actors = [pred["actor"] for pred in actor_predictions if pred["escalation_probability"] > 0.5]
            if high_risk_actors:
                summary["monitoring_priorities"].extend([f"Actor: {actor}" for actor in high_risk_actors[:3]])
        
        return summary
    
    def _calculate_overall_confidence(self, predictions: Dict[str, Any]) -> float:
        """Calcular confianza general del análisis"""
        confidences = []
        
        # Confianza de predicciones de actores
        actor_predictions = predictions.get("actor_behavior", [])
        for pred in actor_predictions:
            confidences.append(pred.get("confidence", 0.5))
        
        # Confianza de tendencias sociales
        social_prediction = predictions.get("social_trends", {})
        if social_prediction:
            confidences.append(social_prediction.get("confidence", 0.5))
        
        # Confianza de crisis
        crisis_prediction = predictions.get("crisis_probability", {})
        if crisis_prediction:
            confidences.append(crisis_prediction.get("confidence", 0.5))
        
        return float(np.mean(confidences)) if confidences else 0.5
    
    def get_analytics_status(self) -> Dict[str, Any]:
        """Obtener estado del sistema de análisis predictivo"""
        return {
            "system_status": "operational",
            "active_predictions": len(self.active_predictions),
            "prediction_history_size": len(self.prediction_history),
            "supported_prediction_types": [pt.value for pt in PredictionType],
            "last_analysis": datetime.utcnow().isoformat(),
            "average_confidence": self._calculate_overall_confidence(
                {"actor_behavior": [], "social_trends": {}, "crisis_probability": {}}
            )
        }

# Instancia global del sistema de análisis predictivo
advanced_predictive_analytics = AdvancedPredictiveAnalytics()