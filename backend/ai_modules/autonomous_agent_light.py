"""
DAMI-GPT - Agente Autónomo Inteligente (Versión Ligera)
========================================================

Sistema de IA autónoma simplificado para análisis y toma de decisiones.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import numpy as np
from enum import Enum
import re
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

class DecisionType(Enum):
    """Tipos de decisiones que puede tomar DAMI-GPT"""
    ALERT_GENERATION = "alert_generation"
    TACTICAL_RESPONSE = "tactical_response"
    RESOURCE_ALLOCATION = "resource_allocation"
    ESCALATION = "escalation"
    INFORMATION_GATHERING = "information_gathering"
    COUNTER_NARRATIVE = "counter_narrative"
    PREDICTIVE_ANALYSIS = "predictive_analysis"

class AgentState(Enum):
    """Estados del agente autónomo"""
    MONITORING = "monitoring"
    ANALYZING = "analyzing"
    DECIDING = "deciding"
    EXECUTING = "executing"
    LEARNING = "learning"
    IDLE = "idle"

class AutonomousDecisionLight:
    """Decisión tomada de forma autónoma (versión ligera)"""
    
    def __init__(self, decision_id: str, decision_type: DecisionType, 
                 reasoning: str, actions: List[Dict], confidence: float):
        self.decision_id = decision_id
        self.decision_type = decision_type
        self.reasoning = reasoning
        self.actions = actions
        self.confidence = confidence
        self.timestamp = datetime.utcnow()
        self.expected_outcome = "Análisis y respuesta optimizada"
        self.risk_assessment = {"low": 0.2, "medium": 0.5, "high": 0.3}

class SimpleMemorySystem:
    """Sistema de memoria simplificado"""
    
    def __init__(self, max_memory: int = 50):
        self.memory = deque(maxlen=max_memory)
        self.patterns = defaultdict(int)
    
    def store_memory(self, memory_item: Dict[str, Any]):
        """Almacenar memoria"""
        memory_item["timestamp"] = datetime.utcnow()
        self.memory.append(memory_item)
        
        # Actualizar patrones
        if "pattern" in memory_item:
            self.patterns[memory_item["pattern"]] += 1
    
    def retrieve_relevant_memories(self, query: str) -> List[Dict[str, Any]]:
        """Recuperar memorias relevantes"""
        relevant = []
        query_words = query.lower().split()
        
        for memory in self.memory:
            memory_text = json.dumps(memory, default=str).lower()
            relevance = sum(1 for word in query_words if word in memory_text) / len(query_words)
            
            if relevance > 0.2:
                memory["relevance_score"] = relevance
                relevant.append(memory)
        
        return sorted(relevant, key=lambda x: x.get("relevance_score", 0), reverse=True)[:5]

class SimpleReasoningEngine:
    """Motor de razonamiento simplificado"""
    
    def __init__(self):
        self.reasoning_rules = {
            "escalation": "Si hay múltiples alertas críticas, considerar escalamiento",
            "pattern_detection": "Si se repite un patrón, aumentar la vigilancia",
            "resource_allocation": "Priorizar recursos según nivel de amenaza",
            "counter_narrative": "Si hay desinformación, preparar respuesta"
        }
    
    async def reason_about_situation(self, situation: Dict[str, Any], 
                                   memory_system: SimpleMemorySystem) -> Dict[str, Any]:
        """Razonar sobre una situación"""
        
        # Identificar el tipo de situación
        situation_type = self._identify_situation_type(situation)
        
        # Buscar memorias relevantes
        relevant_memories = memory_system.retrieve_relevant_memories(
            json.dumps(situation)
        )
        
        # Aplicar reglas de razonamiento
        applied_rules = []
        for rule_name, rule_description in self.reasoning_rules.items():
            if self._rule_applies(rule_name, situation):
                applied_rules.append({
                    "rule": rule_name,
                    "description": rule_description,
                    "confidence": np.random.uniform(0.6, 0.9)
                })
        
        # Generar conclusiones
        conclusions = self._generate_conclusions(situation_type, applied_rules, relevant_memories)
        
        return {
            "situation_type": situation_type,
            "applied_rules": applied_rules,
            "relevant_memories": len(relevant_memories),
            "conclusions": conclusions,
            "confidence": np.mean([rule["confidence"] for rule in applied_rules]) if applied_rules else 0.5
        }
    
    def _identify_situation_type(self, situation: Dict[str, Any]) -> str:
        """Identificar tipo de situación"""
        if "alert_level" in situation and situation["alert_level"] == "critical":
            return "crisis"
        elif "actor_status" in situation and situation["actor_status"] == "roja":
            return "high_risk_actor"
        elif "social_activity" in situation and situation["social_activity"] > 80:
            return "high_social_activity"
        else:
            return "routine_monitoring"
    
    def _rule_applies(self, rule_name: str, situation: Dict[str, Any]) -> bool:
        """Determinar si una regla aplica"""
        if rule_name == "escalation":
            return situation.get("alert_count", 0) > 2
        elif rule_name == "pattern_detection":
            return "pattern_detected" in situation
        elif rule_name == "resource_allocation":
            return situation.get("threat_level", 0) > 5
        elif rule_name == "counter_narrative":
            return situation.get("misinformation_detected", False)
        return False
    
    def _generate_conclusions(self, situation_type: str, rules: List[Dict], 
                           memories: List[Dict]) -> List[str]:
        """Generar conclusiones basadas en el análisis"""
        conclusions = []
        
        if situation_type == "crisis":
            conclusions.append("Situación crítica detectada - requiere atención inmediata")
            conclusions.append("Activar protocolos de respuesta de emergencia")
        elif situation_type == "high_risk_actor":
            conclusions.append("Actor de alto riesgo identificado")
            conclusions.append("Incrementar nivel de monitoreo")
        elif situation_type == "high_social_activity":
            conclusions.append("Alta actividad social detectada")
            conclusions.append("Monitorear posible coordinación")
        
        # Agregar conclusiones basadas en reglas aplicadas
        for rule in rules:
            if rule["rule"] == "escalation":
                conclusions.append("Recomendación: Escalar situación a nivel superior")
            elif rule["rule"] == "counter_narrative":
                conclusions.append("Preparar respuesta contra desinformación")
        
        return conclusions[:5]  # Limitar a 5 conclusiones principales

class DAMIAutonomousAgentLight:
    """Agente autónomo DAMI simplificado"""
    
    def __init__(self):
        self.state = AgentState.IDLE
        self.memory_system = SimpleMemorySystem()
        self.reasoning_engine = SimpleReasoningEngine()
        self.decision_history = deque(maxlen=100)
        self.active_monitoring = False
        self.analysis_cache = {}
    
    async def start_autonomous_monitoring(self) -> Dict[str, Any]:
        """Iniciar monitoreo autónomo"""
        self.active_monitoring = True
        self.state = AgentState.MONITORING
        
        logger.info("🤖 DAMI-GPT Agente Autónomo iniciado")
        
        return {
            "status": "monitoring_started",
            "agent_state": self.state.value,
            "message": "Agente autónomo DAMI-GPT activado - Monitoreo inteligente en curso",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def analyze_situation(self, situation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analizar situación de forma autónoma"""
        self.state = AgentState.ANALYZING
        
        try:
            # Razonamiento sobre la situación
            reasoning_result = await self.reasoning_engine.reason_about_situation(
                situation_data, self.memory_system
            )
            
            # Generar decisión autónoma
            decision = await self._make_autonomous_decision(situation_data, reasoning_result)
            
            # Almacenar en memoria
            self.memory_system.store_memory({
                "situation": situation_data,
                "reasoning": reasoning_result,
                "decision": decision.__dict__ if hasattr(decision, '__dict__') else str(decision),
                "pattern": reasoning_result.get("situation_type", "unknown")
            })
            
            # Almacenar decisión en historial
            self.decision_history.append(decision)
            
            self.state = AgentState.MONITORING
            
            return {
                "analysis_complete": True,
                "situation_assessment": reasoning_result,
                "autonomous_decision": {
                    "decision_id": decision.decision_id,
                    "decision_type": decision.decision_type.value,
                    "reasoning": decision.reasoning,
                    "actions": decision.actions,
                    "confidence": decision.confidence,
                    "timestamp": decision.timestamp.isoformat()
                },
                "agent_state": self.state.value,
                "recommendations": self._generate_action_recommendations(decision)
            }
            
        except Exception as e:
            logger.error(f"Error en análisis autónomo: {e}")
            self.state = AgentState.IDLE
            return {"error": str(e), "agent_state": self.state.value}
    
    async def _make_autonomous_decision(self, situation: Dict[str, Any], 
                                      reasoning: Dict[str, Any]) -> AutonomousDecisionLight:
        """Tomar decisión autónoma basada en análisis"""
        
        situation_type = reasoning.get("situation_type", "routine")
        confidence = reasoning.get("confidence", 0.5)
        
        # Determinar tipo de decisión
        if situation_type == "crisis":
            decision_type = DecisionType.ESCALATION
            actions = [
                {"action": "notify_administrators", "priority": "high"},
                {"action": "activate_emergency_protocols", "priority": "high"},
                {"action": "increase_monitoring_frequency", "priority": "medium"}
            ]
            reasoning_text = "Situación crítica detectada - escalamiento necesario"
            
        elif situation_type == "high_risk_actor":
            decision_type = DecisionType.TACTICAL_RESPONSE
            actions = [
                {"action": "increase_actor_monitoring", "priority": "high"},
                {"action": "analyze_actor_network", "priority": "medium"},
                {"action": "prepare_counter_measures", "priority": "medium"}
            ]
            reasoning_text = "Actor de alto riesgo - incrementar vigilancia táctica"
            
        elif situation_type == "high_social_activity":
            decision_type = DecisionType.INFORMATION_GATHERING
            actions = [
                {"action": "analyze_social_patterns", "priority": "high"},
                {"action": "identify_coordination", "priority": "medium"},
                {"action": "monitor_trending_topics", "priority": "low"}
            ]
            reasoning_text = "Alta actividad social - recopilar más información"
            
        else:
            decision_type = DecisionType.ALERT_GENERATION
            actions = [
                {"action": "continue_monitoring", "priority": "low"},
                {"action": "update_baselines", "priority": "low"}
            ]
            reasoning_text = "Situación rutinaria - mantener monitoreo estándar"
        
        # Crear decisión
        decision_id = f"auto_decision_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        return AutonomousDecisionLight(
            decision_id=decision_id,
            decision_type=decision_type,
            reasoning=reasoning_text,
            actions=actions,
            confidence=confidence
        )
    
    def _generate_action_recommendations(self, decision: AutonomousDecisionLight) -> List[str]:
        """Generar recomendaciones de acción"""
        recommendations = []
        
        if decision.decision_type == DecisionType.ESCALATION:
            recommendations.extend([
                "🚨 Notificar inmediatamente a administradores",
                "📋 Activar protocolos de emergencia",
                "⚡ Incrementar frecuencia de monitoreo"
            ])
        elif decision.decision_type == DecisionType.TACTICAL_RESPONSE:
            recommendations.extend([
                "🎯 Aumentar vigilancia del actor identificado",
                "🕸️ Analizar red de conexiones del actor",
                "🛡️ Preparar contramedidas preventivas"
            ])
        elif decision.decision_type == DecisionType.INFORMATION_GATHERING:
            recommendations.extend([
                "📊 Analizar patrones de actividad social",
                "🔍 Identificar posible coordinación",
                "📈 Monitorear tendencias emergentes"
            ])
        else:
            recommendations.extend([
                "✅ Continuar monitoreo rutinario",
                "📊 Actualizar líneas base de datos"
            ])
        
        return recommendations
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Obtener estado del agente"""
        return {
            "agent_state": self.state.value,
            "active_monitoring": self.active_monitoring,
            "decisions_made": len(self.decision_history),
            "memory_items": len(self.memory_system.memory),
            "last_decision": self.decision_history[-1].decision_id if self.decision_history else None,
            "uptime": "Active" if self.active_monitoring else "Idle",
            "analysis_cached": len(self.analysis_cache),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def stop_monitoring(self) -> Dict[str, Any]:
        """Detener monitoreo autónomo"""
        self.active_monitoring = False
        self.state = AgentState.IDLE
        
        return {
            "status": "monitoring_stopped",
            "agent_state": self.state.value,
            "total_decisions": len(self.decision_history),
            "timestamp": datetime.utcnow().isoformat()
        }

# Instancia global del agente autónomo
dami_autonomous_agent = DAMIAutonomousAgentLight()