"""
DAMI - IA Emocional y Psicológica
=================================

Sistema avanzado de análisis emocional y psicológico para comprensión
profunda del comportamiento político y social.
"""

import numpy as np
import cv2
from typing import Dict, List, Optional, Any, Tuple
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import json
import asyncio
import re
from collections import defaultdict, Counter

# NLP and emotion analysis
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize

# Psychological analysis
import scipy.stats as stats
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

class EmotionType(Enum):
    """Tipos de emociones detectables"""
    ANGER = "anger"
    FEAR = "fear"
    JOY = "joy"
    SADNESS = "sadness"
    SURPRISE = "surprise"
    DISGUST = "disgust"
    CONTEMPT = "contempt"
    NEUTRAL = "neutral"

class PsychologicalProfile(Enum):
    """Perfiles psicológicos políticos"""
    AUTHORITARIAN = "authoritarian"
    POPULIST = "populist"
    CHARISMATIC = "charismatic"
    TECHNOCRATIC = "technocratic"
    IDEOLOGICAL = "ideological"
    PRAGMATIC = "pragmatic"
    NARCISSISTIC = "narcissistic"
    EMPATHETIC = "empathetic"

class CognitiveBias(Enum):
    """Sesgos cognitivos detectables"""
    CONFIRMATION_BIAS = "confirmation_bias"
    AVAILABILITY_HEURISTIC = "availability_heuristic"
    ANCHORING_BIAS = "anchoring_bias"
    GROUPTHINK = "groupthink"
    LOSS_AVERSION = "loss_aversion"
    OVERCONFIDENCE = "overconfidence"
    DUNNING_KRUGER = "dunning_kruger"

@dataclass
class EmotionalState:
    """Estado emocional detectado"""
    primary_emotion: EmotionType
    secondary_emotions: List[Tuple[EmotionType, float]]
    intensity: float
    valence: float  # -1 (negativo) a +1 (positivo)
    arousal: float  # 0 (calmado) a 1 (excitado)
    confidence: float
    context: str
    timestamp: datetime

@dataclass
class PsychologicalAnalysis:
    """Análisis psicológico completo"""
    subject_id: str
    personality_traits: Dict[str, float]
    psychological_profile: PsychologicalProfile
    cognitive_biases: List[Tuple[CognitiveBias, float]]
    emotional_patterns: List[EmotionalState]
    stress_indicators: Dict[str, float]
    decision_making_style: Dict[str, float]
    social_dynamics: Dict[str, Any]
    risk_assessment: Dict[str, float]
    recommendations: List[str]
    confidence: float
    timestamp: datetime

class TextEmotionAnalyzer:
    """Analizador de emociones en texto"""
    
    def __init__(self):
        self.vader_analyzer = SentimentIntensityAnalyzer()
        
        # Diccionarios emocionales en español
        self.emotion_lexicon = {
            EmotionType.ANGER: [
                'enojado', 'furioso', 'iracundo', 'molesto', 'irritado', 'enfadado',
                'indignado', 'colérico', 'airado', 'rabia', 'ira', 'furia'
            ],
            EmotionType.FEAR: [
                'miedo', 'temor', 'terror', 'pánico', 'ansiedad', 'nervioso',
                'preocupado', 'angustiado', 'asustado', 'temeroso', 'inquieto'
            ],
            EmotionType.JOY: [
                'feliz', 'alegre', 'contento', 'gozoso', 'jubiloso', 'eufórico',
                'satisfecho', 'optimista', 'esperanzado', 'entusiasmado'
            ],
            EmotionType.SADNESS: [
                'triste', 'melancólico', 'deprimido', 'desanimado', 'pesimista',
                'abatido', 'desalentado', 'doliente', 'afligido', 'lamentable'
            ],
            EmotionType.SURPRISE: [
                'sorprendido', 'asombrado', 'impactado', 'impresionado', 'pasmado',
                'atónito', 'estupefacto', 'maravillado', 'inesperado'
            ],
            EmotionType.DISGUST: [
                'asco', 'repugnancia', 'repulsión', 'aversión', 'desprecio',
                'desagrado', 'fastidio', 'náusea', 'disgusto'
            ]
        }
        
        # Palabras indicadoras de intensidad
        self.intensity_modifiers = {
            'muy': 1.5, 'extremadamente': 2.0, 'increíblemente': 1.8,
            'bastante': 1.3, 'algo': 0.7, 'poco': 0.5, 'ligeramente': 0.6
        }
        
    async def analyze_text_emotion(self, text: str, context: str = "") -> EmotionalState:
        """Analizar emociones en texto"""
        
        # Análisis de sentimiento base con VADER
        vader_scores = self.vader_analyzer.polarity_scores(text)
        
        # Análisis con TextBlob
        blob = TextBlob(text)
        textblob_sentiment = blob.sentiment
        
        # Detección de emociones específicas
        emotion_scores = await self._detect_specific_emotions(text)
        
        # Determinar emoción primaria
        if emotion_scores:
            primary_emotion = max(emotion_scores.items(), key=lambda x: x[1])[0]
            primary_intensity = emotion_scores[primary_emotion]
        else:
            # Mapear sentimiento a emoción básica
            if vader_scores['compound'] > 0.1:
                primary_emotion = EmotionType.JOY
                primary_intensity = vader_scores['pos']
            elif vader_scores['compound'] < -0.1:
                if vader_scores['neg'] > 0.6:
                    primary_emotion = EmotionType.ANGER
                else:
                    primary_emotion = EmotionType.SADNESS
                primary_intensity = vader_scores['neg']
            else:
                primary_emotion = EmotionType.NEUTRAL
                primary_intensity = vader_scores['neu']
        
        # Emociones secundarias
        secondary_emotions = [
            (emotion, score) for emotion, score in emotion_scores.items()
            if emotion != primary_emotion and score > 0.3
        ]
        secondary_emotions.sort(key=lambda x: x[1], reverse=True)
        
        # Calcular valencia y arousal
        valence = vader_scores['compound']
        arousal = abs(vader_scores['compound']) + (textblob_sentiment.subjectivity * 0.5)
        
        # Ajustar intensidad con modificadores
        adjusted_intensity = await self._adjust_intensity_with_modifiers(text, primary_intensity)
        
        return EmotionalState(
            primary_emotion=primary_emotion,
            secondary_emotions=secondary_emotions[:3],  # Top 3 secundarias
            intensity=float(adjusted_intensity),
            valence=float(valence),
            arousal=float(min(1.0, arousal)),
            confidence=0.8 if emotion_scores else 0.6,
            context=context,
            timestamp=datetime.utcnow()
        )
    
    async def _detect_specific_emotions(self, text: str) -> Dict[EmotionType, float]:
        """Detectar emociones específicas en el texto"""
        text_lower = text.lower()
        emotion_scores = {}
        
        for emotion, keywords in self.emotion_lexicon.items():
            score = 0.0
            word_count = 0
            
            for keyword in keywords:
                if keyword in text_lower:
                    # Contar ocurrencias
                    occurrences = text_lower.count(keyword)
                    score += occurrences * 0.1
                    word_count += occurrences
            
            if word_count > 0:
                # Normalizar por longitud del texto
                normalized_score = min(1.0, score / (len(text.split()) / 100 + 1))
                emotion_scores[emotion] = normalized_score
        
        return emotion_scores
    
    async def _adjust_intensity_with_modifiers(self, text: str, base_intensity: float) -> float:
        """Ajustar intensidad con modificadores de lenguaje"""
        text_lower = text.lower()
        modifier_factor = 1.0
        
        for modifier, factor in self.intensity_modifiers.items():
            if modifier in text_lower:
                modifier_factor *= factor
                break  # Usar solo el primer modificador encontrado
        
        # Detectar signos de exclamación y mayúsculas
        exclamation_count = text.count('!')
        caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
        
        if exclamation_count > 0:
            modifier_factor *= (1 + exclamation_count * 0.2)
        
        if caps_ratio > 0.3:  # Más del 30% en mayúsculas
            modifier_factor *= 1.4
        
        return min(1.0, base_intensity * modifier_factor)

class PsychologicalProfiler:
    """Perfilador psicológico de actores políticos"""
    
    def __init__(self):
        self.text_analyzer = TextEmotionAnalyzer()
        
        # Indicadores de personalidad (Big Five + Características políticas)
        self.personality_indicators = {
            'openness': ['innovador', 'creativo', 'cambio', 'nuevo', 'diferente', 'progreso'],
            'conscientiousness': ['responsable', 'disciplina', 'orden', 'cumplir', 'deber', 'compromiso'],
            'extraversion': ['líder', 'público', 'social', 'energía', 'carismático', 'multitud'],
            'agreeableness': ['colaborar', 'consenso', 'diálogo', 'unidad', 'cooperación', 'paz'],
            'neuroticism': ['crisis', 'problema', 'amenaza', 'peligro', 'riesgo', 'preocupación'],
            'authoritarianism': ['autoridad', 'orden', 'control', 'disciplina', 'obediencia', 'poder'],
            'populism': ['pueblo', 'elite', 'nosotros', 'ellos', 'corrupción', 'verdadero'],
            'narcissism': ['mejor', 'único', 'superior', 'especial', 'extraordinario', 'grandioso']
        }
        
        # Indicadores de sesgos cognitivos
        self.bias_indicators = {
            CognitiveBias.CONFIRMATION_BIAS: [
                'obviamente', 'claramente', 'sin duda', 'es evidente', 'todos saben'
            ],
            CognitiveBias.AVAILABILITY_HEURISTIC: [
                'siempre pasa', 'nunca he visto', 'todo el mundo', 'nadie puede'
            ],
            CognitiveBias.OVERCONFIDENCE: [
                'garantizo', 'seguro al 100%', 'imposible que', 'sin duda alguna'
            ],
            CognitiveBias.GROUPTHINK: [
                'todos estamos de acuerdo', 'consenso unánime', 'nadie se opone'
            ]
        }
        
    async def create_psychological_profile(self, subject_id: str, 
                                         texts: List[str], 
                                         behavioral_data: Dict[str, Any] = None) -> PsychologicalAnalysis:
        """Crear perfil psicológico completo"""
        
        if not texts:
            return self._create_empty_profile(subject_id)
        
        # Análisis emocional de todos los textos
        emotional_states = []
        for i, text in enumerate(texts[:20]):  # Limitar a 20 textos más recientes
            emotion_state = await self.text_analyzer.analyze_text_emotion(
                text, f"text_{i}"
            )
            emotional_states.append(emotion_state)
        
        # Análisis de personalidad
        personality_traits = await self._analyze_personality_traits(texts)
        
        # Determinación del perfil psicológico
        psychological_profile = self._determine_psychological_profile(personality_traits)
        
        # Detección de sesgos cognitivos
        cognitive_biases = await self._detect_cognitive_biases(texts)
        
        # Análisis de patrones emocionales
        emotional_patterns = self._analyze_emotional_patterns(emotional_states)
        
        # Indicadores de estrés
        stress_indicators = await self._analyze_stress_indicators(texts, emotional_states)
        
        # Estilo de toma de decisiones
        decision_making_style = await self._analyze_decision_making_style(texts)
        
        # Dinámicas sociales
        social_dynamics = await self._analyze_social_dynamics(texts)
        
        # Evaluación de riesgo
        risk_assessment = self._assess_psychological_risks(
            personality_traits, cognitive_biases, emotional_patterns
        )
        
        # Generar recomendaciones
        recommendations = self._generate_psychological_recommendations(
            personality_traits, cognitive_biases, risk_assessment
        )
        
        # Calcular confianza general
        confidence = self._calculate_analysis_confidence(
            len(texts), emotional_states, personality_traits
        )
        
        return PsychologicalAnalysis(
            subject_id=subject_id,
            personality_traits=personality_traits,
            psychological_profile=psychological_profile,
            cognitive_biases=cognitive_biases,
            emotional_patterns=emotional_patterns,
            stress_indicators=stress_indicators,
            decision_making_style=decision_making_style,
            social_dynamics=social_dynamics,
            risk_assessment=risk_assessment,
            recommendations=recommendations,
            confidence=confidence,
            timestamp=datetime.utcnow()
        )
    
    async def _analyze_personality_traits(self, texts: List[str]) -> Dict[str, float]:
        """Analizar rasgos de personalidad basados en texto"""
        combined_text = ' '.join(texts).lower()
        traits = {}
        
        for trait, indicators in self.personality_indicators.items():
            score = 0.0
            total_words = len(combined_text.split())
            
            for indicator in indicators:
                count = combined_text.count(indicator)
                score += count
            
            # Normalizar por cantidad de texto
            normalized_score = min(1.0, score / (total_words / 100 + 1))
            traits[trait] = float(normalized_score)
        
        return traits
    
    def _determine_psychological_profile(self, personality_traits: Dict[str, float]) -> PsychologicalProfile:
        """Determinar perfil psicológico principal"""
        
        # Lógica de determinación basada en combinaciones de rasgos
        if personality_traits.get('authoritarianism', 0) > 0.6:
            return PsychologicalProfile.AUTHORITARIAN
        elif personality_traits.get('populism', 0) > 0.5:
            return PsychologicalProfile.POPULIST
        elif personality_traits.get('narcissism', 0) > 0.7:
            return PsychologicalProfile.NARCISSISTIC
        elif personality_traits.get('extraversion', 0) > 0.7 and personality_traits.get('agreeableness', 0) > 0.6:
            return PsychologicalProfile.CHARISMATIC
        elif personality_traits.get('conscientiousness', 0) > 0.7 and personality_traits.get('openness', 0) > 0.6:
            return PsychologicalProfile.TECHNOCRATIC
        elif personality_traits.get('openness', 0) > 0.8:
            return PsychologicalProfile.IDEOLOGICAL
        elif personality_traits.get('agreeableness', 0) > 0.8:
            return PsychologicalProfile.EMPATHETIC
        else:
            return PsychologicalProfile.PRAGMATIC
    
    async def _detect_cognitive_biases(self, texts: List[str]) -> List[Tuple[CognitiveBias, float]]:
        """Detectar sesgos cognitivos en el discurso"""
        combined_text = ' '.join(texts).lower()
        detected_biases = []
        
        for bias, indicators in self.bias_indicators.items():
            score = 0.0
            
            for indicator in indicators:
                if indicator in combined_text:
                    score += combined_text.count(indicator) * 0.2
            
            if score > 0.1:
                detected_biases.append((bias, min(1.0, score)))
        
        # Ordenar por intensidad
        detected_biases.sort(key=lambda x: x[1], reverse=True)
        
        return detected_biases
    
    def _analyze_emotional_patterns(self, emotional_states: List[EmotionalState]) -> List[EmotionalState]:
        """Analizar patrones emocionales"""
        if not emotional_states:
            return []
        
        # Calcular estadísticas emocionales
        emotion_counts = Counter([state.primary_emotion for state in emotional_states])
        intensity_avg = np.mean([state.intensity for state in emotional_states])
        valence_avg = np.mean([state.valence for state in emotional_states])
        arousal_avg = np.mean([state.arousal for state in emotional_states])
        
        # Identificar patrones principales
        dominant_emotion = emotion_counts.most_common(1)[0][0]
        emotion_stability = 1 - (len(set(emotion_counts.keys())) / len(emotional_states))
        
        # Crear resumen de patrones
        pattern_summary = EmotionalState(
            primary_emotion=dominant_emotion,
            secondary_emotions=[(e, c/len(emotional_states)) for e, c in emotion_counts.most_common()[1:4]],
            intensity=float(intensity_avg),
            valence=float(valence_avg),
            arousal=float(arousal_avg),
            confidence=float(emotion_stability),
            context="pattern_analysis",
            timestamp=datetime.utcnow()
        )
        
        return [pattern_summary] + emotional_states[-5:]  # Resumen + últimos 5 estados
    
    async def _analyze_stress_indicators(self, texts: List[str], 
                                       emotional_states: List[EmotionalState]) -> Dict[str, float]:
        """Analizar indicadores de estrés"""
        stress_keywords = [
            'presión', 'estrés', 'agobiado', 'abrumado', 'cansado', 'agotado',
            'difícil', 'complicado', 'problema', 'crisis', 'urgente', 'inmediato'
        ]
        
        combined_text = ' '.join(texts).lower()
        
        # Indicador léxico de estrés
        lexical_stress = sum(combined_text.count(keyword) for keyword in stress_keywords)
        lexical_stress_normalized = min(1.0, lexical_stress / (len(combined_text.split()) / 100 + 1))
        
        # Indicador emocional de estrés
        if emotional_states:
            negative_emotions = sum(1 for state in emotional_states 
                                  if state.primary_emotion in [EmotionType.ANGER, EmotionType.FEAR, EmotionType.SADNESS])
            emotional_stress = negative_emotions / len(emotional_states)
            
            high_arousal_states = sum(1 for state in emotional_states if state.arousal > 0.7)
            arousal_stress = high_arousal_states / len(emotional_states)
        else:
            emotional_stress = 0.0
            arousal_stress = 0.0
        
        # Indicador de urgencia en el lenguaje
        urgency_words = ['ya', 'ahora', 'inmediatamente', 'urgente', 'rápido', 'pronto']
        urgency_stress = sum(combined_text.count(word) for word in urgency_words)
        urgency_stress_normalized = min(1.0, urgency_stress / (len(combined_text.split()) / 50 + 1))
        
        return {
            'lexical_stress': float(lexical_stress_normalized),
            'emotional_stress': float(emotional_stress),
            'arousal_stress': float(arousal_stress),
            'urgency_stress': float(urgency_stress_normalized),
            'overall_stress': float(np.mean([lexical_stress_normalized, emotional_stress, arousal_stress, urgency_stress_normalized]))
        }
    
    async def _analyze_decision_making_style(self, texts: List[str]) -> Dict[str, float]:
        """Analizar estilo de toma de decisiones"""
        combined_text = ' '.join(texts).lower()
        
        # Indicadores de diferentes estilos
        analytical_indicators = ['analizar', 'evaluar', 'considerar', 'estudiar', 'examinar', 'datos', 'evidencia']
        intuitive_indicators = ['siento', 'intuición', 'presentimiento', 'corazón', 'instinto']
        decisive_indicators = ['decidir', 'determinar', 'concluir', 'resolver', 'definitivo']
        collaborative_indicators = ['consultar', 'consenso', 'equipo', 'juntos', 'opinión', 'diálogo']
        
        styles = {
            'analytical': sum(combined_text.count(word) for word in analytical_indicators),
            'intuitive': sum(combined_text.count(word) for word in intuitive_indicators),
            'decisive': sum(combined_text.count(word) for word in decisive_indicators),
            'collaborative': sum(combined_text.count(word) for word in collaborative_indicators)
        }
        
        # Normalizar puntuaciones
        total_words = len(combined_text.split())
        for style in styles:
            styles[style] = min(1.0, styles[style] / (total_words / 100 + 1))
        
        # Agregar indicadores adicionales
        styles['confidence_level'] = self._calculate_confidence_level(combined_text)
        styles['risk_tolerance'] = self._calculate_risk_tolerance(combined_text)
        
        return {k: float(v) for k, v in styles.items()}
    
    def _calculate_confidence_level(self, text: str) -> float:
        """Calcular nivel de confianza en el discurso"""
        confidence_words = ['seguro', 'confiado', 'certeza', 'garantizo', 'definitivamente']
        uncertainty_words = ['quizás', 'tal vez', 'posiblemente', 'probablemente', 'puede ser']
        
        confidence_count = sum(text.count(word) for word in confidence_words)
        uncertainty_count = sum(text.count(word) for word in uncertainty_words)
        
        # Ratio de confianza vs incertidumbre
        total = confidence_count + uncertainty_count
        if total == 0:
            return 0.5  # Neutral
        
        return confidence_count / total
    
    def _calculate_risk_tolerance(self, text: str) -> float:
        """Calcular tolerancia al riesgo"""
        risk_averse_words = ['seguridad', 'precaución', 'cuidado', 'prudente', 'conservador']
        risk_seeking_words = ['aventura', 'audaz', 'arriesgar', 'oportunidad', 'innovar']
        
        risk_averse_count = sum(text.count(word) for word in risk_averse_words)
        risk_seeking_count = sum(text.count(word) for word in risk_seeking_words)
        
        total = risk_averse_count + risk_seeking_count
        if total == 0:
            return 0.5  # Neutral
        
        return risk_seeking_count / total
    
    async def _analyze_social_dynamics(self, texts: List[str]) -> Dict[str, Any]:
        """Analizar dinámicas sociales en el discurso"""
        combined_text = ' '.join(texts).lower()
        
        # Análisis de referencias a grupos
        in_group_words = ['nosotros', 'nuestro', 'equipo', 'familia', 'comunidad', 'unidos']
        out_group_words = ['ellos', 'otros', 'enemigos', 'opositores', 'adversarios']
        
        in_group_count = sum(combined_text.count(word) for word in in_group_words)
        out_group_count = sum(combined_text.count(word) for word in out_group_words)
        
        # Análisis de liderazgo
        leadership_words = ['liderar', 'dirigir', 'guiar', 'comandar', 'responsabilidad']
        leadership_score = sum(combined_text.count(word) for word in leadership_words)
        
        # Análisis de cooperación vs competición
        cooperation_words = ['colaborar', 'trabajar juntos', 'cooperar', 'alianza', 'partnership']
        competition_words = ['competir', 'ganar', 'vencer', 'derrotar', 'superar']
        
        cooperation_count = sum(combined_text.count(word) for word in cooperation_words)
        competition_count = sum(combined_text.count(word) for word in competition_words)
        
        total_words = len(combined_text.split())
        
        return {
            'in_group_orientation': min(1.0, in_group_count / (total_words / 100 + 1)),
            'out_group_hostility': min(1.0, out_group_count / (total_words / 100 + 1)),
            'leadership_tendency': min(1.0, leadership_score / (total_words / 100 + 1)),
            'cooperation_vs_competition': (cooperation_count - competition_count) / max(cooperation_count + competition_count, 1),
            'social_polarization': abs(in_group_count - out_group_count) / max(in_group_count + out_group_count, 1)
        }
    
    def _assess_psychological_risks(self, personality_traits: Dict[str, float], 
                                  cognitive_biases: List[Tuple[CognitiveBias, float]],
                                  emotional_patterns: List[EmotionalState]) -> Dict[str, float]:
        """Evaluar riesgos psicológicos"""
        risks = {}
        
        # Riesgo de toma de decisiones impulsivas
        impulsivity_risk = (
            personality_traits.get('neuroticism', 0) * 0.4 +
            personality_traits.get('extraversion', 0) * 0.3 +
            (1 - personality_traits.get('conscientiousness', 0)) * 0.3
        )
        risks['impulsive_decisions'] = float(impulsivity_risk)
        
        # Riesgo de autoritarismo
        authoritarianism_risk = (
            personality_traits.get('authoritarianism', 0) * 0.5 +
            personality_traits.get('narcissism', 0) * 0.3 +
            (1 - personality_traits.get('agreeableness', 0)) * 0.2
        )
        risks['authoritarian_tendency'] = float(authoritarianism_risk)
        
        # Riesgo de polarización
        polarization_risk = (
            personality_traits.get('populism', 0) * 0.4 +
            sum(score for _, score in cognitive_biases[:3]) / 3 * 0.6  # Top 3 biases
        )
        risks['polarization_tendency'] = float(polarization_risk)
        
        # Riesgo de inestabilidad emocional
        if emotional_patterns:
            emotional_variance = np.var([state.valence for state in emotional_patterns])
            instability_risk = min(1.0, emotional_variance * 2)
        else:
            instability_risk = 0.5
        risks['emotional_instability'] = float(instability_risk)
        
        # Riesgo general
        risks['overall_risk'] = float(np.mean(list(risks.values())))
        
        return risks
    
    def _generate_psychological_recommendations(self, personality_traits: Dict[str, float],
                                             cognitive_biases: List[Tuple[CognitiveBias, float]],
                                             risk_assessment: Dict[str, float]) -> List[str]:
        """Generar recomendaciones psicológicas"""
        recommendations = []
        
        # Recomendaciones basadas en riesgos altos
        if risk_assessment.get('impulsive_decisions', 0) > 0.7:
            recommendations.append(
                "⚠️ Alto riesgo de decisiones impulsivas - Implementar procesos de revisión antes de decisiones importantes"
            )
        
        if risk_assessment.get('authoritarian_tendency', 0) > 0.7:
            recommendations.append(
                "🚨 Tendencia autoritaria detectada - Monitorear cuidadosamente decisiones relacionadas con poder y control"
            )
        
        if risk_assessment.get('polarization_tendency', 0) > 0.6:
            recommendations.append(
                "📊 Alto riesgo de polarización - Fomentar diálogo y considerar perspectivas alternativas"
            )
        
        if risk_assessment.get('emotional_instability', 0) > 0.6:
            recommendations.append(
                "💭 Inestabilidad emocional detectada - Monitorear estado emocional y considerar factores de estrés"
            )
        
        # Recomendaciones basadas en sesgos cognitivos
        for bias, score in cognitive_biases[:2]:  # Top 2 biases
            if score > 0.5:
                if bias == CognitiveBias.CONFIRMATION_BIAS:
                    recommendations.append(
                        "🔍 Sesgo de confirmación detectado - Buscar activamente información contradictoria"
                    )
                elif bias == CognitiveBias.OVERCONFIDENCE:
                    recommendations.append(
                        "⚖️ Exceso de confianza detectado - Solicitar segundas opiniones en decisiones críticas"
                    )
        
        # Recomendaciones basadas en personalidad
        if personality_traits.get('narcissism', 0) > 0.7:
            recommendations.append(
                "🪞 Rasgos narcisistas elevados - Considerar impacto en relaciones interpersonales y toma de decisiones"
            )
        
        if personality_traits.get('neuroticism', 0) > 0.7:
            recommendations.append(
                "😰 Alto nivel de neuroticismo - Implementar estrategias de manejo del estrés"
            )
        
        return recommendations[:5]  # Limitar a 5 recomendaciones principales
    
    def _calculate_analysis_confidence(self, text_count: int, 
                                     emotional_states: List[EmotionalState],
                                     personality_traits: Dict[str, float]) -> float:
        """Calcular confianza en el análisis"""
        
        # Factor de cantidad de datos
        data_factor = min(1.0, text_count / 10)  # Máxima confianza con 10+ textos
        
        # Factor de consistencia emocional
        if emotional_states:
            emotion_consistency = np.std([state.confidence for state in emotional_states])
            consistency_factor = 1 - min(1.0, emotion_consistency)
        else:
            consistency_factor = 0.5
        
        # Factor de claridad de personalidad
        personality_clarity = np.std(list(personality_traits.values()))
        clarity_factor = min(1.0, personality_clarity)
        
        # Confianza combinada
        overall_confidence = (data_factor * 0.4 + consistency_factor * 0.3 + clarity_factor * 0.3)
        
        return float(overall_confidence)
    
    def _create_empty_profile(self, subject_id: str) -> PsychologicalAnalysis:
        """Crear perfil vacío cuando no hay datos suficientes"""
        return PsychologicalAnalysis(
            subject_id=subject_id,
            personality_traits={},
            psychological_profile=PsychologicalProfile.PRAGMATIC,
            cognitive_biases=[],
            emotional_patterns=[],
            stress_indicators={},
            decision_making_style={},
            social_dynamics={},
            risk_assessment={'overall_risk': 0.5},
            recommendations=["Datos insuficientes para análisis psicológico completo"],
            confidence=0.0,
            timestamp=datetime.utcnow()
        )

class CollectiveEmotionalAnalyzer:
    """Analizador de emociones colectivas y clima social"""
    
    def __init__(self):
        self.text_analyzer = TextEmotionAnalyzer()
        
    async def analyze_collective_emotion(self, social_media_posts: List[Dict[str, Any]],
                                       territorial_data: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Analizar estado emocional colectivo"""
        
        if not social_media_posts:
            return {"error": "No social media data available"}
        
        # Analizar emociones individuales
        individual_emotions = []
        for post in social_media_posts[:100]:  # Limitar a 100 posts más recientes
            content = post.get('content', '')
            if content:
                emotion = await self.text_analyzer.analyze_text_emotion(content, 'social_media')
                individual_emotions.append(emotion)
        
        if not individual_emotions:
            return {"error": "No valid content to analyze"}
        
        # Análisis agregado de emociones
        emotion_distribution = self._calculate_emotion_distribution(individual_emotions)
        
        # Calcular métricas colectivas
        collective_valence = np.mean([e.valence for e in individual_emotions])
        collective_arousal = np.mean([e.arousal for e in individual_emotions])
        emotional_volatility = np.std([e.intensity for e in individual_emotions])
        
        # Detectar emociones dominantes
        dominant_emotions = self._identify_dominant_emotions(individual_emotions)
        
        # Análisis temporal si hay timestamps
        temporal_analysis = await self._analyze_temporal_emotion_patterns(social_media_posts)
        
        # Análisis territorial si hay datos geográficos
        territorial_analysis = {}
        if territorial_data:
            territorial_analysis = await self._analyze_territorial_emotions(
                individual_emotions, territorial_data
            )
        
        # Evaluación de riesgo social
        social_risk = self._assess_social_risk(
            emotion_distribution, collective_valence, emotional_volatility
        )
        
        # Detección de contagio emocional
        emotional_contagion = self._detect_emotional_contagion(individual_emotions)
        
        return {
            'collective_metrics': {
                'collective_valence': float(collective_valence),
                'collective_arousal': float(collective_arousal),
                'emotional_volatility': float(emotional_volatility),
                'sample_size': len(individual_emotions)
            },
            'emotion_distribution': emotion_distribution,
            'dominant_emotions': dominant_emotions,
            'temporal_analysis': temporal_analysis,
            'territorial_analysis': territorial_analysis,
            'social_risk_assessment': social_risk,
            'emotional_contagion': emotional_contagion,
            'recommendations': self._generate_collective_recommendations(
                emotion_distribution, social_risk
            ),
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def _calculate_emotion_distribution(self, emotions: List[EmotionalState]) -> Dict[str, float]:
        """Calcular distribución de emociones en la población"""
        emotion_counts = Counter([e.primary_emotion for e in emotions])
        total = len(emotions)
        
        distribution = {}
        for emotion_type in EmotionType:
            count = emotion_counts.get(emotion_type, 0)
            distribution[emotion_type.value] = count / total
        
        return distribution
    
    def _identify_dominant_emotions(self, emotions: List[EmotionalState]) -> List[Dict[str, Any]]:
        """Identificar emociones dominantes en el colectivo"""
        emotion_counts = Counter([e.primary_emotion for e in emotions])
        total = len(emotions)
        
        dominant = []
        for emotion, count in emotion_counts.most_common(3):
            percentage = count / total
            avg_intensity = np.mean([e.intensity for e in emotions if e.primary_emotion == emotion])
            
            dominant.append({
                'emotion': emotion.value,
                'percentage': float(percentage),
                'average_intensity': float(avg_intensity),
                'description': self._get_emotion_description(emotion, percentage, avg_intensity)
            })
        
        return dominant
    
    def _get_emotion_description(self, emotion: EmotionType, percentage: float, intensity: float) -> str:
        """Generar descripción de la emoción dominante"""
        intensity_desc = "alta" if intensity > 0.7 else "moderada" if intensity > 0.4 else "baja"
        percentage_desc = "mayoría" if percentage > 0.5 else "significativa" if percentage > 0.3 else "minoría"
        
        emotion_names = {
            EmotionType.ANGER: "ira",
            EmotionType.FEAR: "miedo",
            EmotionType.JOY: "alegría",
            EmotionType.SADNESS: "tristeza",
            EmotionType.SURPRISE: "sorpresa",
            EmotionType.DISGUST: "disgusto",
            EmotionType.NEUTRAL: "neutralidad"
        }
        
        emotion_name = emotion_names.get(emotion, emotion.value)
        return f"{percentage_desc} muestra {emotion_name} con intensidad {intensity_desc}"
    
    async def _analyze_temporal_emotion_patterns(self, posts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analizar patrones temporales de emociones"""
        # Simular análisis temporal (en producción usar timestamps reales)
        time_periods = ['mañana', 'tarde', 'noche']
        temporal_emotions = {}
        
        for period in time_periods:
            # Simular distribución emocional por período
            temporal_emotions[period] = {
                'dominant_emotion': np.random.choice(['anger', 'fear', 'joy', 'sadness']),
                'intensity': np.random.uniform(0.3, 0.9),
                'post_count': np.random.randint(10, 50)
            }
        
        return {
            'temporal_patterns': temporal_emotions,
            'peak_activity_period': max(temporal_emotions.items(), key=lambda x: x[1]['post_count'])[0],
            'emotional_stability_over_time': np.random.uniform(0.4, 0.8)
        }
    
    async def _analyze_territorial_emotions(self, emotions: List[EmotionalState],
                                          territorial_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analizar emociones por territorio"""
        territorial_emotions = {}
        
        for zone in territorial_data:
            zone_name = zone.get('name', 'Unknown')
            activity_level = zone.get('activity_level', 0)
            
            # Simular correlación entre actividad territorial y emociones
            if activity_level > 70:
                dominant_emotion = 'anger'
                intensity = 0.8
            elif activity_level > 40:
                dominant_emotion = 'fear'
                intensity = 0.6
            else:
                dominant_emotion = 'neutral'
                intensity = 0.4
            
            territorial_emotions[zone_name] = {
                'dominant_emotion': dominant_emotion,
                'intensity': intensity,
                'activity_correlation': activity_level / 100
            }
        
        return {
            'territorial_emotions': territorial_emotions,
            'high_tension_zones': [name for name, data in territorial_emotions.items() 
                                 if data['intensity'] > 0.7],
            'emotional_geographical_clustering': len(territorial_emotions) > 0
        }
    
    def _assess_social_risk(self, emotion_distribution: Dict[str, float],
                          collective_valence: float, volatility: float) -> Dict[str, float]:
        """Evaluar riesgo social basado en emociones colectivas"""
        
        # Riesgo por emociones negativas dominantes
        negative_emotions = emotion_distribution.get('anger', 0) + emotion_distribution.get('fear', 0)
        emotion_risk = min(1.0, negative_emotions * 1.5)
        
        # Riesgo por valencia negativa
        valence_risk = max(0, -collective_valence)
        
        # Riesgo por alta volatilidad
        volatility_risk = min(1.0, volatility * 2)
        
        # Riesgo combinado
        overall_risk = (emotion_risk * 0.4 + valence_risk * 0.3 + volatility_risk * 0.3)
        
        return {
            'emotion_based_risk': float(emotion_risk),
            'valence_risk': float(valence_risk),
            'volatility_risk': float(volatility_risk),
            'overall_social_risk': float(overall_risk),
            'risk_level': 'high' if overall_risk > 0.7 else 'medium' if overall_risk > 0.4 else 'low'
        }
    
    def _detect_emotional_contagion(self, emotions: List[EmotionalState]) -> Dict[str, Any]:
        """Detectar contagio emocional en el colectivo"""
        
        # Calcular clustering emocional
        emotion_sequence = [e.primary_emotion for e in emotions]
        
        # Detectar secuencias de emociones similares
        contagion_clusters = []
        current_cluster = [emotion_sequence[0]] if emotion_sequence else []
        
        for i in range(1, len(emotion_sequence)):
            if emotion_sequence[i] == emotion_sequence[i-1]:
                current_cluster.append(emotion_sequence[i])
            else:
                if len(current_cluster) >= 3:  # Cluster significativo
                    contagion_clusters.append({
                        'emotion': current_cluster[0].value,
                        'cluster_size': len(current_cluster)
                    })
                current_cluster = [emotion_sequence[i]]
        
        # Agregar último cluster si es significativo
        if len(current_cluster) >= 3:
            contagion_clusters.append({
                'emotion': current_cluster[0].value,
                'cluster_size': len(current_cluster)
            })
        
        # Calcular índice de contagio
        total_clustered = sum(cluster['cluster_size'] for cluster in contagion_clusters)
        contagion_index = total_clustered / len(emotions) if emotions else 0
        
        return {
            'contagion_detected': contagion_index > 0.3,
            'contagion_index': float(contagion_index),
            'emotion_clusters': contagion_clusters,
            'strongest_contagion': max(contagion_clusters, key=lambda x: x['cluster_size']) if contagion_clusters else None
        }
    
    def _generate_collective_recommendations(self, emotion_distribution: Dict[str, float],
                                           social_risk: Dict[str, float]) -> List[str]:
        """Generar recomendaciones basadas en análisis emocional colectivo"""
        recommendations = []
        
        # Recomendaciones basadas en riesgo social
        if social_risk.get('overall_social_risk', 0) > 0.7:
            recommendations.append(
                "🚨 ALTO RIESGO SOCIAL: Implementar estrategias de comunicación calmantes inmediatamente"
            )
            recommendations.append(
                "📢 Activar canales de comunicación oficial para contrarrestar emociones negativas"
            )
        
        # Recomendaciones basadas en emociones dominantes
        if emotion_distribution.get('anger', 0) > 0.4:
            recommendations.append(
                "😡 Alta presencia de ira colectiva - Abordar causas subyacentes y ofrecer soluciones"
            )
        
        if emotion_distribution.get('fear', 0) > 0.4:
            recommendations.append(
                "😰 Miedo colectivo detectado - Proporcionar información tranquilizadora y medidas de seguridad"
            )
        
        if emotion_distribution.get('sadness', 0) > 0.3:
            recommendations.append(
                "😢 Tristeza colectiva significativa - Considerar mensajes de empatía y apoyo"
            )
        
        # Recomendaciones preventivas
        if social_risk.get('volatility_risk', 0) > 0.6:
            recommendations.append(
                "📊 Alta volatilidad emocional - Monitorear cambios súbitos en el sentimiento público"
            )
        
        return recommendations[:5]  # Limitar a 5 recomendaciones principales

class EmotionalIntelligenceSystem:
    """Sistema principal de inteligencia emocional y psicológica"""
    
    def __init__(self):
        self.psychological_profiler = PsychologicalProfiler()
        self.collective_analyzer = CollectiveEmotionalAnalyzer()
        self.analysis_cache = {}
        
    async def run_comprehensive_emotional_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Ejecutar análisis emocional y psicológico completo"""
        
        analysis_results = {
            'timestamp': datetime.utcnow().isoformat(),
            'analysis_type': 'comprehensive_emotional_analysis'
        }
        
        # Análisis psicológico de actores políticos
        if 'political_actors' in data:
            actor_profiles = {}
            for actor in data['political_actors'][:5]:  # Limitar a 5 actores principales
                actor_name = actor.get('name', 'Unknown')
                
                # Simular textos del actor (en producción obtener de discursos/declaraciones)
                simulated_texts = self._generate_simulated_actor_texts(actor)
                
                profile = await self.psychological_profiler.create_psychological_profile(
                    actor_name, simulated_texts
                )
                actor_profiles[actor_name] = profile.__dict__
            
            analysis_results['actor_psychological_profiles'] = actor_profiles
        
        # Análisis emocional colectivo
        if 'social_media_posts' in data:
            collective_analysis = await self.collective_analyzer.analyze_collective_emotion(
                data['social_media_posts'],
                data.get('territorial_zones', [])
            )
            analysis_results['collective_emotional_analysis'] = collective_analysis
        
        # Análisis de correlaciones emocionales-territoriales
        if 'territorial_zones' in data and 'social_media_posts' in data:
            territorial_correlations = await self._analyze_emotional_territorial_correlations(
                data['territorial_zones'], data.get('social_media_posts', [])
            )
            analysis_results['emotional_territorial_correlations'] = territorial_correlations
        
        # Predicciones basadas en patrones emocionales
        emotional_predictions = await self._generate_emotional_predictions(analysis_results)
        analysis_results['emotional_predictions'] = emotional_predictions
        
        # Recomendaciones integradas
        integrated_recommendations = self._generate_integrated_recommendations(analysis_results)
        analysis_results['integrated_recommendations'] = integrated_recommendations
        
        return analysis_results
    
    def _generate_simulated_actor_texts(self, actor: Dict[str, Any]) -> List[str]:
        """Generar textos simulados para un actor político"""
        actor_status = actor.get('status', 'verde')
        
        # Textos basados en el status del actor
        if actor_status == 'roja':
            texts = [
                "La situación actual es inaceptable y requiere cambios inmediatos",
                "No podemos permitir que esto continúe, el pueblo merece mejor",
                "Es hora de tomar decisiones firmes y definitivas",
                "La responsabilidad es clara y las consecuencias serán severas"
            ]
        elif actor_status == 'naranja':
            texts = [
                "Debemos evaluar cuidadosamente las opciones disponibles",
                "La situación requiere atención pero con medidas apropiadas",
                "Es importante considerar todas las perspectivas involucradas",
                "Trabajaremos para encontrar soluciones efectivas"
            ]
        else:
            texts = [
                "Continuamos trabajando en beneficio de todos los ciudadanos",
                "Los avances son positivos y esperamos seguir en esta dirección",
                "La colaboración y el diálogo son fundamentales para el progreso",
                "Mantenemos nuestro compromiso con la estabilidad y el desarrollo"
            ]
        
        return texts
    
    async def _analyze_emotional_territorial_correlations(self, territorial_zones: List[Dict[str, Any]],
                                                         social_posts: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analizar correlaciones entre emociones y territorios"""
        
        correlations = {}
        
        for zone in territorial_zones:
            zone_name = zone.get('name', 'Unknown')
            activity_level = zone.get('activity_level', 0)
            
            # Simular correlación emocional-territorial
            if activity_level > 70:
                emotional_profile = {
                    'dominant_emotion': 'anger',
                    'intensity': 0.8,
                    'stability': 0.3,
                    'risk_level': 'high'
                }
            elif activity_level > 40:
                emotional_profile = {
                    'dominant_emotion': 'fear',
                    'intensity': 0.6,
                    'stability': 0.5,
                    'risk_level': 'medium'
                }
            else:
                emotional_profile = {
                    'dominant_emotion': 'neutral',
                    'intensity': 0.4,
                    'stability': 0.8,
                    'risk_level': 'low'
                }
            
            correlations[zone_name] = emotional_profile
        
        return {
            'zone_correlations': correlations,
            'high_risk_zones': [name for name, profile in correlations.items() 
                              if profile['risk_level'] == 'high'],
            'emotional_geographical_patterns': True
        }
    
    async def _generate_emotional_predictions(self, analysis_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generar predicciones basadas en patrones emocionales"""
        
        predictions = {}
        
        # Predicción de escalamiento emocional
        collective_analysis = analysis_results.get('collective_emotional_analysis', {})
        social_risk = collective_analysis.get('social_risk_assessment', {})
        
        if social_risk.get('overall_social_risk', 0) > 0.6:
            predictions['escalation_probability'] = {
                'probability': min(1.0, social_risk['overall_social_risk'] * 1.2),
                'timeframe': '24-48 hours',
                'confidence': 0.75,
                'description': 'Alto riesgo de escalamiento emocional colectivo'
            }
        
        # Predicción de contagio emocional
        contagion_data = collective_analysis.get('emotional_contagion', {})
        if contagion_data.get('contagion_detected', False):
            predictions['contagion_spread'] = {
                'probability': contagion_data.get('contagion_index', 0),
                'affected_emotion': contagion_data.get('strongest_contagion', {}).get('emotion', 'unknown'),
                'timeframe': '12-24 hours',
                'confidence': 0.8
            }
        
        # Predicción de estabilización
        territorial_correlations = analysis_results.get('emotional_territorial_correlations', {})
        high_risk_zones = territorial_correlations.get('high_risk_zones', [])
        
        if len(high_risk_zones) < 2:
            predictions['stabilization_likelihood'] = {
                'probability': 0.7,
                'timeframe': '3-7 days',
                'confidence': 0.65,
                'description': 'Probabilidad moderada-alta de estabilización emocional'
            }
        
        return predictions
    
    def _generate_integrated_recommendations(self, analysis_results: Dict[str, Any]) -> List[str]:
        """Generar recomendaciones integradas de todos los análisis"""
        recommendations = []
        
        # Recomendaciones de análisis colectivo
        collective_recs = analysis_results.get('collective_emotional_analysis', {}).get('recommendations', [])
        recommendations.extend(collective_recs)
        
        # Recomendaciones de perfiles de actores
        actor_profiles = analysis_results.get('actor_psychological_profiles', {})
        for actor_name, profile in actor_profiles.items():
            actor_recs = profile.get('recommendations', [])
            if actor_recs:
                recommendations.append(f"🎭 {actor_name}: {actor_recs[0]}")  # Una recomendación por actor
        
        # Recomendaciones de predicciones emocionales
        predictions = analysis_results.get('emotional_predictions', {})
        if 'escalation_probability' in predictions:
            if predictions['escalation_probability']['probability'] > 0.7:
                recommendations.append(
                    "⚡ PREDICCIÓN: Alto riesgo de escalamiento emocional - Preparar estrategias de desescalamiento"
                )
        
        # Eliminar duplicados y limitar
        unique_recommendations = list(dict.fromkeys(recommendations))
        return unique_recommendations[:8]  # Top 8 recomendaciones
    
    def get_system_status(self) -> Dict[str, Any]:
        """Obtener estado del sistema de inteligencia emocional"""
        return {
            'system_status': 'operational',
            'cached_analyses': len(self.analysis_cache),
            'supported_emotions': len(EmotionType),
            'psychological_profiles': len(PsychologicalProfile),
            'cognitive_biases_detectable': len(CognitiveBias),
            'last_analysis': datetime.utcnow().isoformat()
        }


# Instancia global del sistema de inteligencia emocional
emotional_intelligence_system = EmotionalIntelligenceSystem()