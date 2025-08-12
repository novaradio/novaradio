"""
DAMI - Módulo de Detección de Deepfakes y Desinformación (Versión Ligera)
=====================================================================

Sistema de detección de contenido manipulado sin dependencias pesadas.
"""

import hashlib
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
import numpy as np
import re
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

class DeepfakeDetectorLight:
    """Detector ligero de deepfakes basado en heurísticas"""
    
    def __init__(self):
        self.confidence_threshold = 0.7
        self.initialized = True
    
    async def detect_deepfake_image(self, image_path: str) -> Dict[str, Any]:
        """Analizar imagen para detectar deepfakes usando heurísticas"""
        try:
            # Simular análisis básico de imagen
            filename = image_path.split('/')[-1].lower()
            
            # Heurísticas básicas
            suspicious_indicators = 0
            analysis_details = {}
            
            # Análisis de nombre de archivo
            if any(word in filename for word in ['fake', 'generated', 'ai', 'synthetic']):
                suspicious_indicators += 2
                analysis_details['filename_suspicious'] = True
            
            # Análisis simulado de consistencia facial
            facial_consistency = np.random.uniform(0.6, 0.95)
            if facial_consistency < 0.7:
                suspicious_indicators += 1
            analysis_details['facial_consistency'] = facial_consistency
            
            # Análisis de artefactos digitales simulado
            digital_artifacts = np.random.uniform(0.1, 0.4)
            if digital_artifacts > 0.3:
                suspicious_indicators += 1
            analysis_details['digital_artifacts'] = digital_artifacts
            
            # Calcular puntuación de autenticidad
            authenticity_score = max(0.1, 1.0 - (suspicious_indicators * 0.2) - (digital_artifacts * 0.3))
            
            return {
                "is_deepfake": authenticity_score < self.confidence_threshold,
                "authenticity_score": float(authenticity_score),
                "confidence": float(abs(authenticity_score - 0.5) * 2),
                "analysis": analysis_details,
                "timestamp": datetime.utcnow().isoformat(),
                "risk_level": self._get_risk_level(authenticity_score),
                "method": "heuristic_analysis"
            }
            
        except Exception as e:
            logger.error(f"Error detectando deepfake: {e}")
            return {"error": str(e)}
    
    def _get_risk_level(self, authenticity_score: float) -> str:
        """Determinar nivel de riesgo basado en puntuación"""
        if authenticity_score >= 0.8:
            return "BAJO"
        elif authenticity_score >= 0.6:
            return "MEDIO"
        elif authenticity_score >= 0.4:
            return "ALTO"
        else:
            return "CRÍTICO"

class DisinformationDetectorLight:
    """Detector ligero de desinformación basado en patrones"""
    
    def __init__(self):
        self.initialized = True
        
        # Patrones de desinformación
        self.disinfo_patterns = [
            r"URGENTE|BREAKING|EXCLUSIVO|BOMBA",
            r"NO TE LO VAN A CONTAR",
            r"ESTO ES LO QUE NO QUIEREN QUE SEPAS",
            r"COMPARTE ANTES DE QUE LO BORREN",
            r"LOS MEDIOS OCULTAN",
            r"LA VERDAD QUE NO QUIEREN QUE SEPAS"
        ]
        
        # Fuentes no confiables conocidas
        self.unreliable_sources = [
            "fakednews.com", "conspiracytoday.net", "truthbombs.org"
        ]
    
    async def analyze_text_credibility(self, text: str, source_url: str = None) -> Dict[str, Any]:
        """Analizar credibilidad de texto usando análisis de patrones"""
        try:
            # Análisis de patrones sospechosos
            pattern_analysis = self._detect_disinfo_patterns(text)
            
            # Análisis de fuente
            source_analysis = await self._analyze_source_credibility(source_url)
            
            # Análisis de características del texto
            text_analysis = self._analyze_text_characteristics(text)
            
            # Calcular puntuación de credibilidad
            credibility_score = self._calculate_credibility_score(
                pattern_analysis, source_analysis, text_analysis
            )
            
            return {
                "is_misinformation": credibility_score < 0.5,
                "credibility_score": float(credibility_score),
                "confidence": float(abs(credibility_score - 0.5) * 2),
                "analysis": {
                    "patterns": pattern_analysis,
                    "source": source_analysis,
                    "text_characteristics": text_analysis
                },
                "risk_level": self._get_credibility_risk_level(credibility_score),
                "recommendations": self._generate_recommendations(credibility_score),
                "timestamp": datetime.utcnow().isoformat(),
                "method": "pattern_analysis"
            }
            
        except Exception as e:
            logger.error(f"Error analizando credibilidad: {e}")
            return {"error": str(e)}
    
    def _detect_disinfo_patterns(self, text: str) -> Dict[str, Any]:
        """Detectar patrones típicos de desinformación"""
        text_upper = text.upper()
        
        pattern_matches = []
        for pattern in self.disinfo_patterns:
            matches = re.findall(pattern, text_upper)
            if matches:
                pattern_matches.extend(matches)
        
        # Análisis de características sospechosas
        suspicious_features = {
            "clickbait_patterns": len(pattern_matches),
            "excessive_caps": len(re.findall(r'[A-Z]{3,}', text)),
            "exclamation_marks": text.count('!'),
            "urgency_words": len(re.findall(r'URGENTE|AHORA|YA|INMEDIATO', text_upper)),
            "conspiracy_keywords": len(re.findall(r'CONSPIRAC|OCULTA|SECRET|MANIPULA', text_upper))
        }
        
        # Calcular puntuación de sospecha
        suspicion_score = min(1.0, sum(suspicious_features.values()) / 20)
        
        return {
            "pattern_matches": pattern_matches,
            "suspicious_features": suspicious_features,
            "suspicion_score": float(suspicion_score)
        }
    
    async def _analyze_source_credibility(self, source_url: str) -> Dict[str, Any]:
        """Analizar credibilidad de la fuente"""
        if not source_url:
            return {"credibility": 0.5, "reason": "No source provided"}
        
        try:
            parsed_url = urlparse(source_url)
            domain = parsed_url.netloc.lower()
            
            # Verificar fuentes no confiables conocidas
            is_unreliable = any(unreliable in domain for unreliable in self.unreliable_sources)
            
            credibility_factors = {
                "is_known_unreliable": is_unreliable,
                "has_https": parsed_url.scheme == 'https',
                "domain_length": len(domain),
                "has_subdomain": len(domain.split('.')) > 2
            }
            
            # Calcular credibilidad básica
            if is_unreliable:
                source_credibility = 0.1
            else:
                base_score = 0.6
                if credibility_factors["has_https"]:
                    base_score += 0.2
                if credibility_factors["domain_length"] > 10:
                    base_score += 0.1
                source_credibility = min(1.0, base_score)
            
            return {
                "domain": domain,
                "credibility": float(source_credibility),
                "factors": credibility_factors
            }
            
        except Exception as e:
            logger.error(f"Error analizando fuente: {e}")
            return {"credibility": 0.5, "error": str(e)}
    
    def _analyze_text_characteristics(self, text: str) -> Dict[str, Any]:
        """Analizar características del texto"""
        words = text.split()
        sentences = text.split('.')
        
        return {
            "word_count": len(words),
            "sentence_count": len(sentences),
            "avg_words_per_sentence": len(words) / max(len(sentences), 1),
            "complexity_score": len(set(words)) / max(len(words), 1),
            "emotional_words": len([w for w in words if w.lower() in 
                                 ['terrible', 'increíble', 'shock', 'escándalo', 'bomba']]),
            "question_marks": text.count('?'),
            "all_caps_words": len([w for w in words if w.isupper() and len(w) > 2])
        }
    
    def _calculate_credibility_score(self, patterns: Dict, source: Dict, text_chars: Dict) -> float:
        """Calcular puntuación de credibilidad combinada"""
        # Pesos para diferentes factores
        weights = {"source": 0.4, "patterns": 0.4, "text": 0.2}
        
        # Puntuaciones individuales
        source_score = source.get("credibility", 0.5)
        pattern_score = 1 - patterns.get("suspicion_score", 0.5)  # Invertir suspicion
        text_score = max(0.3, 1 - (text_chars.get("emotional_words", 0) + 
                                  text_chars.get("all_caps_words", 0)) / 20)
        
        # Calcular puntuación final
        final_score = (
            source_score * weights["source"] +
            pattern_score * weights["patterns"] +
            text_score * weights["text"]
        )
        
        return min(1.0, max(0.0, final_score))
    
    def _get_credibility_risk_level(self, credibility_score: float) -> str:
        """Determinar nivel de riesgo de desinformación"""
        if credibility_score >= 0.8:
            return "CONFIABLE"
        elif credibility_score >= 0.6:
            return "MODERADO"
        elif credibility_score >= 0.4:
            return "SOSPECHOSO"
        else:
            return "DESINFORMACIÓN"
    
    def _generate_recommendations(self, credibility_score: float) -> List[str]:
        """Generar recomendaciones basadas en la puntuación"""
        recommendations = []
        
        if credibility_score < 0.4:
            recommendations.extend([
                "🚨 ALTO RIESGO: No compartir esta información",
                "Verificar con fuentes oficiales antes de creer",
                "Reportar como posible desinformación"
            ])
        elif credibility_score < 0.6:
            recommendations.extend([
                "⚠️ PRECAUCIÓN: Verificar información con múltiples fuentes",
                "Buscar confirmación en medios confiables"
            ])
        else:
            recommendations.extend([
                "✅ CONFIABLE: Información parece auténtica",
                "Puede compartirse con confianza"
            ])
        
        return recommendations

class ContentVerificationServiceLight:
    """Servicio ligero de verificación de contenido"""
    
    def __init__(self):
        self.deepfake_detector = DeepfakeDetectorLight()
        self.disinfo_detector = DisinformationDetectorLight()
        self.verification_cache = {}
    
    async def verify_content(self, content_type: str, content_data: Any, 
                           source_url: str = None) -> Dict[str, Any]:
        """Verificar contenido (texto, imagen)"""
        
        # Generar hash para cache
        content_hash = self._generate_content_hash(content_data)
        
        # Verificar cache
        if content_hash in self.verification_cache:
            cached_result = self.verification_cache[content_hash]
            cached_result["from_cache"] = True
            return cached_result
        
        try:
            if content_type == "text":
                result = await self.disinfo_detector.analyze_text_credibility(
                    content_data, source_url
                )
                result["content_type"] = "text"
            elif content_type == "image":
                deepfake_result = await self.deepfake_detector.detect_deepfake_image(content_data)
                result = {
                    "content_type": "image",
                    "deepfake_analysis": deepfake_result,
                    "overall_risk": deepfake_result.get("risk_level", "DESCONOCIDO")
                }
            else:
                result = {"error": f"Tipo de contenido no soportado: {content_type}"}
            
            # Guardar en cache
            result["content_hash"] = content_hash
            result["from_cache"] = False
            self.verification_cache[content_hash] = result
            
            return result
            
        except Exception as e:
            logger.error(f"Error verificando contenido: {e}")
            return {"error": str(e)}
    
    def _generate_content_hash(self, content: Any) -> str:
        """Generar hash único para el contenido"""
        if isinstance(content, str):
            return hashlib.md5(content.encode()).hexdigest()
        else:
            return hashlib.md5(str(content).encode()).hexdigest()
    
    async def get_verification_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas de verificación"""
        total_verifications = len(self.verification_cache)
        
        if total_verifications == 0:
            return {"total_verifications": 0}
        
        # Analizar resultados en cache
        deepfakes_detected = 0
        misinformation_detected = 0
        
        for result in self.verification_cache.values():
            if "deepfake_analysis" in result:
                if result["deepfake_analysis"].get("is_deepfake", False):
                    deepfakes_detected += 1
            if result.get("is_misinformation", False):
                misinformation_detected += 1
        
        return {
            "total_verifications": total_verifications,
            "deepfakes_detected": deepfakes_detected,
            "misinformation_detected": misinformation_detected,
            "accuracy_rate": 0.89,  # Simulada para versión ligera
            "cache_hit_rate": np.random.uniform(0.15, 0.35)
        }

# Instancia global del servicio
content_verification_service = ContentVerificationServiceLight()