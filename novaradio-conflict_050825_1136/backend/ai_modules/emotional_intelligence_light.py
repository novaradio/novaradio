"""
DAMI - Sistema de Inteligencia Emocional y Psicológica (Versión Ligera)
========================================================================

Sistema simplificado de análisis emocional y psicológico sin dependencias pesadas.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
import numpy as np
from collections import Counter, defaultdict
from enum import Enum
import re

logger = logging.getLogger(__name__)

class EmotionType(Enum):
    """Tipos de emociones detectables"""
    ANGER = "anger"
    FEAR = "fear"
    JOY = "joy"
    SADNESS = "sadness"
    SURPRISE = "surprise"
    DISGUST = "disgust"
    NEUTRAL = "neutral"

class PsychologicalProfile(Enum):
    """Perfiles psicológicos básicos"""
    AUTHORITARIAN = "authoritarian"
    DEMOCRATIC = "democratic"
    POPULIST = "populist"
    PRAGMATIC = "pragmatic"
    CHARISMATIC = "charismatic"
    ANALYTICAL = "analytical"

class EmotionalStateLight:
    """Estado emocional simplificado"""
    
    def __init__(self, primary_emotion: EmotionType, intensity: float, 
                 confidence: float, context: str):
        self.primary_emotion = primary_emotion
        self.intensity = intensity  # 0-1
        self.confidence = confidence  # 0-1
        self.context = context
        self.valence = self._calculate_valence()
        self.arousal = intensity  # Simplificación: arousal = intensity
        self.timestamp = datetime.utcnow()
    
    def _calculate_valence(self) -> float:
        """Calcular valencia emocional (positiva/negativa)"""
        positive_emotions = [EmotionType.JOY, EmotionType.SURPRISE]
        negative_emotions = [EmotionType.ANGER, EmotionType.FEAR, EmotionType.SADNESS, EmotionType.DISGUST]
        
        if self.primary_emotion in positive_emotions:
            return 0.5 + (self.intensity * 0.5)  # 0.5-1.0
        elif self.primary_emotion in negative_emotions:
            return 0.5 - (self.intensity * 0.5)  # 0-0.5
        else:
            return 0.5  # Neutral

class SimpleTextEmotionAnalyzer:
    """Analizador simple de emociones en texto"""
    
    def __init__(self):
        # Diccionarios de palabras emocionales básicas
        self.emotion_keywords = {
            EmotionType.ANGER: [
                "enojado", "furioso", "indignado", "molesto", "irritado", 
                "odio", "rabia", "coraje", "ira", "fastidio"
            ],
            EmotionType.FEAR: [
                "miedo", "temor", "pánico", "terror", "asustado", 
                "preocupado", "nervioso", "ansiedad", "inquieto", "temeroso"
            ],
            EmotionType.JOY: [
                "feliz", "alegre", "contento", "gozo", "júbilo", 
                "satisfecho", "orgulloso", "eufórico", "radiante", "dichoso"
            ],
            EmotionType.SADNESS: [
                "triste", "deprimido", "melancólico", "desanimado", "abatido",
                "dolor", "pena", "lamento", "desesperanza", "desaliento"
            ],
            EmotionType.SURPRISE: [
                "sorprendido", "asombrado", "impactado", "inesperado", "shocking",
                "increíble", "impresionante", "wow", "guau", "vaya"
            ],
            EmotionType.DISGUST: [
                "asco", "repugnante", "repulsivo", "desagradable", "náusea",
                "repudio", "rechazo", "desprecio", "aversión", "detesto"
            ]
        }
        
        # Intensificadores y modificadores
        self.intensifiers = {
            "muy": 1.3,
            "súper": 1.4,
            "extremadamente": 1.5,
            "totalmente": 1.2,
            "completamente": 1.2,
            "un poco": 0.7,
            "algo": 0.8,
            "ligeramente": 0.6
        }
    
    async def analyze_text_emotion(self, text: str, context: str = "general") -> EmotionalStateLight:
        """Analizar emoción en texto"""
        text_lower = text.lower()
        
        # Contar palabras emocionales por categoría
        emotion_scores = defaultdict(float)
        
        for emotion_type, keywords in self.emotion_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    # Buscar intensificadores cerca de la palabra
                    base_score = 1.0
                    words = text_lower.split()
                    
                    if keyword in words:
                        keyword_index = words.index(keyword)
                        # Buscar intensificadores en las 2 palabras anteriores
                        for i in range(max(0, keyword_index-2), keyword_index):
                            if i < len(words) and words[i] in self.intensifiers:
                                base_score *= self.intensifiers[words[i]]
                    
                    emotion_scores[emotion_type] += base_score
        
        # Determinar emoción primaria
        if not emotion_scores:
            primary_emotion = EmotionType.NEUTRAL
            intensity = 0.5
            confidence = 0.3
        else:
            primary_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]
            raw_intensity = emotion_scores[primary_emotion]
            
            # Normalizar intensidad (0-1)
            intensity = min(1.0, raw_intensity / 3.0)  # Máximo esperado ~3
            
            # Calcular confianza basada en cantidad de indicadores
            total_indicators = sum(emotion_scores.values())
            confidence = min(0.9, 0.4 + (total_indicators / 10))
        
        return EmotionalStateLight(
            primary_emotion=primary_emotion,
            intensity=float(intensity),
            confidence=float(confidence),
            context=context
        )

class SimplePsychologicalProfiler:
    """Perfilador psicológico simplificado"""
    
    def __init__(self):
        # Indicadores psicológicos básicos basados en patrones de lenguaje
        self.psychological_indicators = {
            PsychologicalProfile.AUTHORITARIAN: [
                "orden", "control", "disciplina", "autoridad", "mandar", 
                "obedecer", "jerarquía", "comando", "poder", "dominio"
            ],
            PsychologicalProfile.DEMOCRATIC: [
                "consenso", "diálogo", "participación", "inclusión", "debate",
                "colaboración", "voto", "representación", "pluralidad", "tolerancia"
            ],
            PsychologicalProfile.POPULIST: [
                "pueblo", "gente común", "élites", "establishment", "corrupción",
                "nosotros vs ellos", "traición", "verdadero", "auténtico", "popular"
            ],
            PsychologicalProfile.PRAGMATIC: [
                "eficiente", "práctico", "resultados", "solución", "funcional",
                "realista", "objetivo", "datos", "evidencia", "método"
            ],
            PsychologicalProfile.CHARISMATIC: [
                "inspirar", "visión", "futuro", "esperanza", "cambio",
                "liderazgo", "carisma", "motivar", "influir", "transformar"
            ],
            PsychologicalProfile.ANALYTICAL: [
                "analizar", "estudiar", "investigar", "datos", "estadísticas",
                "lógico", "racional", "sistemático", "metodología", "objetivo"
            ]
        }
        
        # Rasgos de personalidad política específicos
        self.personality_traits = {
            "narcissism": ["yo", "mi", "mío", "logros", "éxito", "mejor", "superior"],
            "authoritarianism": ["autoridad", "orden", "control", "disciplina", "mandar"],
            "populism": ["pueblo", "gente", "élites", "establishment", "corruptos"],
            "neuroticism": ["estrés", "ansiedad", "preocupación", "nervioso", "tensión"],
            "extraversion": ["gente", "social", "público", "multitud", "comunicar"],
            "openness": ["nuevo", "innovar", "cambio", "creatividad", "experimento"],
            "conscientiousness": ["responsable", "organizado", "planificar", "cumplir"],
            "agreeableness": ["cooperar", "ayudar", "amable", "gentil", "comprensivo"]
        }
    
    async def create_psychological_profile(self, subject_id: str, 
                                         texts: List[str]) -> Dict[str, Any]:
        """Crear perfil psicológico basado en textos"""
        
        if not texts:
            return self._create_empty_profile(subject_id)
        
        combined_text = " ".join(texts).lower()
        
        # Analizar patrones psicológicos
        profile_scores = defaultdict(float)
        for profile_type, keywords in self.psychological_indicators.items():
            score = sum(combined_text.count(keyword) for keyword in keywords)
            profile_scores[profile_type] = score
        
        # Determinar perfil principal
        if profile_scores:
            primary_profile = max(profile_scores.items(), key=lambda x: x[1])[0]
        else:
            primary_profile = PsychologicalProfile.PRAGMATIC
        
        # Analizar rasgos de personalidad
        personality_traits = {}
        for trait, keywords in self.personality_traits.items():
            trait_score = sum(combined_text.count(keyword) for keyword in keywords)
            # Normalizar (0-1)
            personality_traits[trait] = min(1.0, trait_score / (len(combined_text.split()) / 50))
        
        # Análisis emocional de los textos
        analyzer = SimpleTextEmotionAnalyzer()
        emotional_states = []
        for text in texts[:10]:  # Limitar a 10 textos
            emotion = await analyzer.analyze_text_emotion(text, f"profile_{subject_id}")
            emotional_states.append(emotion)
        
        # Calcular patrones emocionales
        emotion_patterns = self._analyze_emotional_patterns(emotional_states)
        
        # Evaluar riesgos psicológicos
        risk_assessment = self._assess_psychological_risks(personality_traits, emotional_states)
        
        # Generar recomendaciones
        recommendations = self._generate_psychological_recommendations(
            personality_traits, risk_assessment
        )
        
        # Calcular confianza del análisis
        analysis_confidence = self._calculate_analysis_confidence(
            len(texts), emotional_states, personality_traits
        )
        
        return {
            "subject_id": subject_id,
            "primary_psychological_profile": primary_profile.value,
            "personality_traits": {k: float(v) for k, v in personality_traits.items()},
            "emotional_patterns": {
                "dominant_emotions": [es.__dict__ for es in emotion_patterns[:3]],
                "emotional_stability": float(np.std([es.valence for es in emotional_states])) if emotional_states else 0.5,
                "average_intensity": float(np.mean([es.intensity for es in emotional_states])) if emotional_states else 0.5
            },
            "risk_assessment": risk_assessment,
            "recommendations": recommendations,
            "analysis_confidence": float(analysis_confidence),
            "sample_size": len(texts),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _analyze_emotional_patterns(self, emotional_states: List[EmotionalStateLight]) -> List[EmotionalStateLight]:
        """Analizar patrones emocionales"""
        if not emotional_states:
            return []
        
        # Contar emociones
        emotion_counts = Counter([state.primary_emotion for state in emotional_states])
        
        # Crear resumen de patrones principales
        dominant_emotion = emotion_counts.most_common(1)[0][0]
        pattern_summary = EmotionalStateLight(
            primary_emotion=dominant_emotion,
            intensity=float(np.mean([state.intensity for state in emotional_states 
                                   if state.primary_emotion == dominant_emotion])),
            confidence=float(np.mean([state.confidence for state in emotional_states])),
            context="pattern_analysis"
        )
        
        return [pattern_summary] + emotional_states[-3:]  # Resumen + últimos 3 estados
    
    def _assess_psychological_risks(self, personality_traits: Dict[str, float], 
                                  emotional_states: List[EmotionalStateLight]) -> Dict[str, float]:
        """Evaluar riesgos psicológicos"""
        risks = {}
        
        # Riesgo de decisiones impulsivas
        impulsivity_risk = (
            personality_traits.get("neuroticism", 0) * 0.4 +
            personality_traits.get("extraversion", 0) * 0.3 +
            (1 - personality_traits.get("conscientiousness", 0.5)) * 0.3
        )
        risks["impulsive_decisions"] = float(min(1.0, impulsivity_risk))
        
        # Riesgo de autoritarismo
        authoritarianism_risk = (
            personality_traits.get("authoritarianism", 0) * 0.5 +
            personality_traits.get("narcissism", 0) * 0.3 +
            (1 - personality_traits.get("agreeableness", 0.5)) * 0.2
        )
        risks["authoritarian_tendency"] = float(min(1.0, authoritarianism_risk))
        
        # Riesgo de polarización
        polarization_risk = (
            personality_traits.get("populism", 0) * 0.6 +
            (1 - personality_traits.get("openness", 0.5)) * 0.4
        )
        risks["polarization_tendency"] = float(min(1.0, polarization_risk))
        
        # Riesgo de inestabilidad emocional
        if emotional_states:
            emotional_variance = np.var([state.valence for state in emotional_states])
            instability_risk = min(1.0, emotional_variance * 4)
        else:
            instability_risk = 0.5
        risks["emotional_instability"] = float(instability_risk)
        
        # Riesgo general
        risks["overall_risk"] = float(np.mean(list(risks.values())))
        
        return risks
    
    def _generate_psychological_recommendations(self, personality_traits: Dict[str, float],
                                             risk_assessment: Dict[str, float]) -> List[str]:
        """Generar recomendaciones psicológicas"""
        recommendations = []
        
        # Recomendaciones basadas en riesgos altos
        if risk_assessment.get("impulsive_decisions", 0) > 0.7:
            recommendations.append(
                "⚠️ Alto riesgo de decisiones impulsivas - Implementar procesos de revisión"
            )
        
        if risk_assessment.get("authoritarian_tendency", 0) > 0.7:
            recommendations.append(
                "🚨 Tendencia autoritaria detectada - Monitorear decisiones de poder"
            )
        
        if risk_assessment.get("polarization_tendency", 0) > 0.6:
            recommendations.append(
                "📊 Alto riesgo de polarización - Fomentar perspectivas alternativas"
            )
        
        if risk_assessment.get("emotional_instability", 0) > 0.6:
            recommendations.append(
                "💭 Inestabilidad emocional detectada - Monitorear factores de estrés"
            )
        
        # Recomendaciones basadas en personalidad
        if personality_traits.get("narcissism", 0) > 0.7:
            recommendations.append(
                "🪞 Rasgos narcisistas elevados - Considerar impacto en relaciones"
            )
        
        return recommendations[:5]  # Limitar a 5 recomendaciones principales
    
    def _calculate_analysis_confidence(self, text_count: int, 
                                     emotional_states: List[EmotionalStateLight],
                                     personality_traits: Dict[str, float]) -> float:
        """Calcular confianza en el análisis"""
        
        # Factor de cantidad de datos
        data_factor = min(1.0, text_count / 10)  # Máxima confianza con 10+ textos
        
        # Factor de consistencia emocional
        if emotional_states:
            emotion_consistency = 1 - np.std([state.confidence for state in emotional_states])
            consistency_factor = max(0.0, emotion_consistency)
        else:
            consistency_factor = 0.5
        
        # Factor de claridad de personalidad
        if personality_traits:
            personality_clarity = np.std(list(personality_traits.values()))
            clarity_factor = min(1.0, personality_clarity)
        else:
            clarity_factor = 0.3
        
        # Confianza combinada
        overall_confidence = (data_factor * 0.4 + consistency_factor * 0.3 + clarity_factor * 0.3)
        
        return max(0.1, min(0.95, overall_confidence))
    
    def _create_empty_profile(self, subject_id: str) -> Dict[str, Any]:
        """Crear perfil vacío cuando no hay datos suficientes"""
        return {
            "subject_id": subject_id,
            "primary_psychological_profile": PsychologicalProfile.PRAGMATIC.value,
            "personality_traits": {},
            "emotional_patterns": {
                "dominant_emotions": [],
                "emotional_stability": 0.5,
                "average_intensity": 0.5
            },
            "risk_assessment": {"overall_risk": 0.5},
            "recommendations": ["Datos insuficientes para análisis psicológico completo"],
            "analysis_confidence": 0.0,
            "sample_size": 0,
            "timestamp": datetime.utcnow().isoformat()
        }

class CollectiveEmotionalAnalyzerLight:
    """Analizador de emociones colectivas simplificado"""
    
    def __init__(self):
        self.text_analyzer = SimpleTextEmotionAnalyzer()
    
    async def analyze_collective_emotion(self, social_media_posts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analizar estado emocional colectivo"""
        
        if not social_media_posts:
            return {"error": "No social media data available"}
        
        # Analizar emociones individuales
        individual_emotions = []
        for post in social_media_posts[-50:]:  # Últimos 50 posts
            content = post.get("content", "")
            if content:
                emotion = await self.text_analyzer.analyze_text_emotion(content, "social_media")
                individual_emotions.append(emotion)
        
        if not individual_emotions:
            return {"error": "No valid content to analyze"}
        
        # Calcular métricas colectivas
        collective_valence = np.mean([e.valence for e in individual_emotions])
        collective_arousal = np.mean([e.arousal for e in individual_emotions])
        emotional_volatility = np.std([e.intensity for e in individual_emotions])
        
        # Distribución de emociones
        emotion_distribution = {}
        emotion_counts = Counter([e.primary_emotion for e in individual_emotions])
        total = len(individual_emotions)
        
        for emotion_type in EmotionType:
            count = emotion_counts.get(emotion_type, 0)
            emotion_distribution[emotion_type.value] = count / total
        
        # Identificar emociones dominantes
        dominant_emotions = []
        for emotion, count in emotion_counts.most_common(3):
            percentage = count / total
            avg_intensity = np.mean([e.intensity for e in individual_emotions if e.primary_emotion == emotion])
            
            dominant_emotions.append({
                "emotion": emotion.value,
                "percentage": float(percentage),
                "average_intensity": float(avg_intensity)
            })
        
        # Evaluación de riesgo social
        social_risk = self._assess_social_risk(emotion_distribution, collective_valence, emotional_volatility)
        
        return {
            "collective_metrics": {
                "collective_valence": float(collective_valence),
                "collective_arousal": float(collective_arousal),
                "emotional_volatility": float(emotional_volatility),
                "sample_size": len(individual_emotions)
            },
            "emotion_distribution": emotion_distribution,
            "dominant_emotions": dominant_emotions,
            "social_risk_assessment": social_risk,
            "recommendations": self._generate_collective_recommendations(emotion_distribution, social_risk),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def _assess_social_risk(self, emotion_distribution: Dict[str, float],
                          collective_valence: float, volatility: float) -> Dict[str, float]:
        """Evaluar riesgo social basado en emociones colectivas"""
        
        # Riesgo por emociones negativas dominantes
        negative_emotions = (emotion_distribution.get("anger", 0) + 
                           emotion_distribution.get("fear", 0) + 
                           emotion_distribution.get("sadness", 0))
        emotion_risk = min(1.0, negative_emotions * 1.5)
        
        # Riesgo por valencia negativa
        valence_risk = max(0, (0.5 - collective_valence) * 2)
        
        # Riesgo por alta volatilidad
        volatility_risk = min(1.0, volatility * 3)
        
        # Riesgo combinado
        overall_risk = (emotion_risk * 0.4 + valence_risk * 0.3 + volatility_risk * 0.3)
        
        return {
            "emotion_based_risk": float(emotion_risk),
            "valence_risk": float(valence_risk),
            "volatility_risk": float(volatility_risk),
            "overall_social_risk": float(overall_risk),
            "risk_level": "high" if overall_risk > 0.7 else "medium" if overall_risk > 0.4 else "low"
        }
    
    def _generate_collective_recommendations(self, emotion_distribution: Dict[str, float],
                                           social_risk: Dict[str, float]) -> List[str]:
        """Generar recomendaciones basadas en análisis emocional colectivo"""
        recommendations = []
        
        # Recomendaciones basadas en riesgo social
        if social_risk.get("overall_social_risk", 0) > 0.7:
            recommendations.append(
                "🚨 ALTO RIESGO SOCIAL: Implementar estrategias de comunicación calmantes"
            )
        
        # Recomendaciones basadas en emociones dominantes
        if emotion_distribution.get("anger", 0) > 0.4:
            recommendations.append(
                "😡 Alta presencia de ira colectiva - Abordar causas subyacentes"
            )
        
        if emotion_distribution.get("fear", 0) > 0.4:
            recommendations.append(
                "😰 Miedo colectivo detectado - Proporcionar información tranquilizadora"
            )
        
        if emotion_distribution.get("sadness", 0) > 0.3:
            recommendations.append(
                "😢 Tristeza colectiva significativa - Considerar mensajes de empatía"
            )
        
        return recommendations[:5]  # Limitar a 5 recomendaciones principales

class EmotionalIntelligenceSystemLight:
    """Sistema principal de inteligencia emocional simplificado"""
    
    def __init__(self):
        self.psychological_profiler = SimplePsychologicalProfiler()
        self.collective_analyzer = CollectiveEmotionalAnalyzerLight()
        self.analysis_cache = {}
    
    async def run_comprehensive_emotional_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Ejecutar análisis emocional y psicológico completo"""
        
        analysis_results = {
            "timestamp": datetime.utcnow().isoformat(),
            "analysis_type": "comprehensive_emotional_analysis"
        }
        
        # Análisis psicológico de actores políticos
        if "political_actors" in data:
            actor_profiles = {}
            for actor in data["political_actors"][:5]:  # Limitar a 5 actores principales
                actor_name = actor.get("name", "Unknown")
                
                # Simular textos del actor basados en su estado
                simulated_texts = self._generate_simulated_actor_texts(actor)
                
                profile = await self.psychological_profiler.create_psychological_profile(
                    actor_name, simulated_texts
                )
                actor_profiles[actor_name] = profile
            
            analysis_results["actor_psychological_profiles"] = actor_profiles
        
        # Análisis emocional colectivo
        if "social_media_posts" in data:
            collective_analysis = await self.collective_analyzer.analyze_collective_emotion(
                data["social_media_posts"]
            )
            analysis_results["collective_emotional_analysis"] = collective_analysis
        
        # Generar recomendaciones integradas
        integrated_recommendations = self._generate_integrated_recommendations(analysis_results)
        analysis_results["integrated_recommendations"] = integrated_recommendations
        
        return analysis_results
    
    def _generate_simulated_actor_texts(self, actor: Dict[str, Any]) -> List[str]:
        """Generar textos simulados para un actor político"""
        actor_status = actor.get("status", "verde")
        
        # Textos basados en el status del actor
        if actor_status == "roja":
            texts = [
                "La situación actual es inaceptable y requiere cambios inmediatos",
                "No podemos permitir que esto continúe, el pueblo merece mejor",
                "Es hora de tomar decisiones firmes y definitivas",
                "La responsabilidad es clara y las consecuencias serán severas"
            ]
        elif actor_status == "naranja":
            texts = [
                "Debemos evaluar cuidadosamente las opciones disponibles",
                "La situación requiere atención pero con medidas apropiadas",
                "Es importante considerar todas las perspectivas involucradas",
                "Trabajaremos para encontrar soluciones efectivas"
            ]
        else:
            texts = [
                "Continuamos trabajando en beneficio de todos los ciudadanos",
                "Los avances son positivos and esperamos seguir en esta dirección",
                "La colaboración y el diálogo son fundamentales para el progreso",
                "Mantenemos nuestro compromiso con la estabilidad y el desarrollo"
            ]
        
        return texts
    
    def _generate_integrated_recommendations(self, analysis_results: Dict[str, Any]) -> List[str]:
        """Generar recomendaciones integradas de todos los análisis"""
        recommendations = []
        
        # Recomendaciones de análisis colectivo
        collective_recs = analysis_results.get("collective_emotional_analysis", {}).get("recommendations", [])
        recommendations.extend(collective_recs)
        
        # Recomendaciones de perfiles de actores
        actor_profiles = analysis_results.get("actor_psychological_profiles", {})
        for actor_name, profile in actor_profiles.items():
            actor_recs = profile.get("recommendations", [])
            if actor_recs:
                recommendations.append(f"🎭 {actor_name}: {actor_recs[0]}")  # Una recomendación por actor
        
        # Eliminar duplicados y limitar
        unique_recommendations = list(dict.fromkeys(recommendations))
        return unique_recommendations[:8]  # Top 8 recomendaciones
    
    def get_system_status(self) -> Dict[str, Any]:
        """Obtener estado del sistema de inteligencia emocional"""
        return {
            "system_status": "operational",
            "cached_analyses": len(self.analysis_cache),
            "supported_emotions": len(EmotionType),
            "psychological_profiles": len(PsychologicalProfile),
            "analysis_method": "lightweight_heuristic",
            "last_analysis": datetime.utcnow().isoformat()
        }

# Instancia global del sistema de inteligencia emocional
emotional_intelligence_system = EmotionalIntelligenceSystemLight()