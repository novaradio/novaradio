"""
DAMI-GPT - Agente Autónomo Inteligente
======================================

Sistema de inteligencia artificial autónoma que piensa, analiza y toma
decisiones estratégicas de forma independiente para el centro DAMI.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
import numpy as np
from dataclasses import dataclass
from enum import Enum
import openai
import re
from collections import defaultdict, deque
import networkx as nx
from concurrent.futures import ThreadPoolExecutor
import threading
import time

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

@dataclass
class DecisionContext:
    """Contexto para toma de decisiones"""
    situation_type: str
    urgency_level: int  # 1-10
    confidence_threshold: float
    available_resources: Dict[str, Any]
    historical_outcomes: List[Dict]
    user_preferences: Dict[str, Any]
    risk_tolerance: float

@dataclass
class AutonomousDecision:
    """Decisión tomada de forma autónoma"""
    decision_id: str
    decision_type: DecisionType
    reasoning: str
    actions: List[Dict[str, Any]]
    confidence: float
    expected_outcome: str
    risk_assessment: Dict[str, float]
    timestamp: datetime
    context: DecisionContext

class KnowledgeGraph:
    """Grafo de conocimiento político para el agente"""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.entity_embeddings = {}
        self.relationship_weights = defaultdict(float)
        
    def add_entity(self, entity_id: str, entity_type: str, properties: Dict[str, Any]):
        """Agregar entidad al grafo de conocimiento"""
        self.graph.add_node(entity_id, type=entity_type, **properties)
        
    def add_relationship(self, source: str, target: str, relationship: str, weight: float = 1.0):
        """Agregar relación entre entidades"""
        self.graph.add_edge(source, target, relationship=relationship, weight=weight)
        self.relationship_weights[(source, target, relationship)] = weight
        
    def get_entity_context(self, entity_id: str, depth: int = 2) -> Dict[str, Any]:
        """Obtener contexto de una entidad y sus relaciones"""
        if entity_id not in self.graph:
            return {}
            
        # Obtener nodos relacionados
        related_nodes = []
        for _ in range(depth):
            neighbors = list(self.graph.neighbors(entity_id))
            related_nodes.extend(neighbors)
            
        # Construir contexto
        context = {
            "entity": dict(self.graph.nodes[entity_id]),
            "direct_relations": [],
            "influence_score": self._calculate_influence_score(entity_id),
            "centrality": nx.degree_centrality(self.graph).get(entity_id, 0)
        }
        
        # Agregar relaciones
        for neighbor in self.graph.neighbors(entity_id):
            edge_data = self.graph[entity_id][neighbor]
            context["direct_relations"].append({
                "target": neighbor,
                "relationship": edge_data.get("relationship", "unknown"),
                "weight": edge_data.get("weight", 1.0)
            })
            
        return context
    
    def _calculate_influence_score(self, entity_id: str) -> float:
        """Calcular puntuación de influencia de una entidad"""
        if entity_id not in self.graph:
            return 0.0
            
        # Combinar diferentes métricas de centralidad
        degree_centrality = nx.degree_centrality(self.graph).get(entity_id, 0)
        try:
            betweenness_centrality = nx.betweenness_centrality(self.graph).get(entity_id, 0)
            closeness_centrality = nx.closeness_centrality(self.graph).get(entity_id, 0)
        except:
            betweenness_centrality = 0
            closeness_centrality = 0
            
        # Puntuación ponderada
        influence_score = (
            degree_centrality * 0.4 +
            betweenness_centrality * 0.3 +
            closeness_centrality * 0.3
        )
        
        return influence_score

class MemorySystem:
    """Sistema de memoria para el agente autónomo"""
    
    def __init__(self, max_short_term: int = 100, max_long_term: int = 1000):
        self.short_term_memory = deque(maxlen=max_short_term)
        self.long_term_memory = deque(maxlen=max_long_term)
        self.working_memory = {}
        self.episodic_memory = []
        self.semantic_memory = {}
        
    def store_short_term(self, memory_item: Dict[str, Any]):
        """Almacenar en memoria a corto plazo"""
        memory_item["timestamp"] = datetime.utcnow()
        memory_item["memory_type"] = "short_term"
        self.short_term_memory.append(memory_item)
        
    def store_long_term(self, memory_item: Dict[str, Any]):
        """Almacenar en memoria a largo plazo"""
        memory_item["timestamp"] = datetime.utcnow()
        memory_item["memory_type"] = "long_term"
        self.long_term_memory.append(memory_item)
        
    def store_episode(self, episode: Dict[str, Any]):
        """Almacenar episodio completo"""
        episode["timestamp"] = datetime.utcnow()
        self.episodic_memory.append(episode)
        
    def update_semantic_knowledge(self, concept: str, knowledge: Dict[str, Any]):
        """Actualizar conocimiento semántico"""
        if concept not in self.semantic_memory:
            self.semantic_memory[concept] = {}
        self.semantic_memory[concept].update(knowledge)
        
    def retrieve_relevant_memories(self, query: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Recuperar memorias relevantes para un query"""
        relevant_memories = []
        
        # Buscar en memoria a corto plazo
        for memory in self.short_term_memory:
            if self._is_relevant(memory, query, context):
                relevant_memories.append(memory)
                
        # Buscar en memoria a largo plazo
        for memory in self.long_term_memory:
            if self._is_relevant(memory, query, context):
                relevant_memories.append(memory)
                
        # Ordenar por relevancia y timestamp
        relevant_memories.sort(key=lambda x: (x.get("relevance_score", 0), x.get("timestamp", datetime.min)), reverse=True)
        
        return relevant_memories[:10]  # Top 10 más relevantes
    
    def _is_relevant(self, memory: Dict[str, Any], query: str, context: Dict[str, Any]) -> bool:
        """Determinar si una memoria es relevante"""
        # Simular análisis de relevancia
        memory_text = json.dumps(memory, default=str).lower()
        query_words = query.lower().split()
        
        relevance_score = sum(1 for word in query_words if word in memory_text) / len(query_words)
        memory["relevance_score"] = relevance_score
        
        return relevance_score > 0.3

class ReasoningEngine:
    """Motor de razonamiento para el agente autónomo"""
    
    def __init__(self):
        self.reasoning_strategies = {
            "causal": self._causal_reasoning,
            "analogical": self._analogical_reasoning,
            "deductive": self._deductive_reasoning,
            "abductive": self._abductive_reasoning,
            "case_based": self._case_based_reasoning
        }
        
    async def reason_about_situation(self, situation: Dict[str, Any], 
                                   context: DecisionContext,
                                   memory_system: MemorySystem) -> Dict[str, Any]:
        """Razonar sobre una situación específica"""
        
        reasoning_results = {}
        
        # Aplicar diferentes estrategias de razonamiento
        for strategy_name, strategy_func in self.reasoning_strategies.items():
            try:
                result = await strategy_func(situation, context, memory_system)
                reasoning_results[strategy_name] = result
            except Exception as e:
                logger.error(f"Error en estrategia {strategy_name}: {e}")
                reasoning_results[strategy_name] = {"error": str(e)}
        
        # Combinar resultados de razonamiento
        combined_reasoning = self._combine_reasoning_results(reasoning_results)
        
        return combined_reasoning
    
    async def _causal_reasoning(self, situation: Dict[str, Any], 
                              context: DecisionContext,
                              memory_system: MemorySystem) -> Dict[str, Any]:
        """Razonamiento causal: causa -> efecto"""
        
        # Identificar causas potenciales
        potential_causes = []
        if "political_actor" in situation:
            potential_causes.append(f"Acción de {situation['political_actor']}")
        if "social_media_activity" in situation:
            potential_causes.append("Actividad viral en redes sociales")
        if "territorial_change" in situation:
            potential_causes.append("Cambio en situación territorial")
            
        # Predecir efectos basados en experiencia
        predicted_effects = []
        for cause in potential_causes:
            effects = self._predict_effects_from_cause(cause, memory_system)
            predicted_effects.extend(effects)
            
        return {
            "strategy": "causal",
            "potential_causes": potential_causes,
            "predicted_effects": predicted_effects,
            "confidence": np.random.uniform(0.6, 0.9)
        }
    
    async def _analogical_reasoning(self, situation: Dict[str, Any], 
                                  context: DecisionContext,
                                  memory_system: MemorySystem) -> Dict[str, Any]:
        """Razonamiento analógico: situaciones similares"""
        
        # Buscar situaciones similares en memoria
        similar_situations = memory_system.retrieve_relevant_memories(
            json.dumps(situation), context.__dict__
        )
        
        analogies = []
        for similar in similar_situations[:3]:  # Top 3
            analogy = {
                "similar_situation": similar,
                "similarity_score": similar.get("relevance_score", 0),
                "outcome": similar.get("outcome", "unknown"),
                "lessons_learned": similar.get("lessons", [])
            }
            analogies.append(analogy)
            
        return {
            "strategy": "analogical",
            "analogies": analogies,
            "confidence": np.mean([a["similarity_score"] for a in analogies]) if analogies else 0.5
        }
    
    async def _deductive_reasoning(self, situation: Dict[str, Any], 
                                 context: DecisionContext,
                                 memory_system: MemorySystem) -> Dict[str, Any]:
        """Razonamiento deductivo: reglas generales -> casos específicos"""
        
        # Reglas políticas generales
        political_rules = [
            "Si un actor político está en estado crítico, la probabilidad de escalamiento es alta",
            "Si hay alta actividad en redes sociales, puede indicar movimiento coordenado",
            "Si múltiples zonas territoriales muestran tensión, puede ser crisis sistémica"
        ]
        
        applicable_rules = []
        for rule in political_rules:
            if self._rule_applies_to_situation(rule, situation):
                applicable_rules.append(rule)
                
        deductions = []
        for rule in applicable_rules:
            deduction = self._apply_rule_to_situation(rule, situation)
            deductions.append(deduction)
            
        return {
            "strategy": "deductive",
            "applicable_rules": applicable_rules,
            "deductions": deductions,
            "confidence": 0.8 if applicable_rules else 0.3
        }
    
    async def _abductive_reasoning(self, situation: Dict[str, Any], 
                                 context: DecisionContext,
                                 memory_system: MemorySystem) -> Dict[str, Any]:
        """Razonamiento abductivo: mejor explicación para observaciones"""
        
        observations = situation.get("observations", [])
        
        # Generar hipótesis explicativas
        hypotheses = [
            "Campaña coordinada de desinformación",
            "Reacción espontánea a evento político",
            "Manipulación por actores externos",
            "Crisis de confianza institucional",
            "Movimiento político organizado"
        ]
        
        # Evaluar cada hipótesis
        hypothesis_scores = []
        for hypothesis in hypotheses:
            score = self._evaluate_hypothesis(hypothesis, observations)
            hypothesis_scores.append({
                "hypothesis": hypothesis,
                "probability": score,
                "supporting_evidence": observations[:2]  # Simular evidencia
            })
            
        # Ordenar por probabilidad
        hypothesis_scores.sort(key=lambda x: x["probability"], reverse=True)
        
        return {
            "strategy": "abductive",
            "best_explanation": hypothesis_scores[0] if hypothesis_scores else None,
            "alternative_explanations": hypothesis_scores[1:3],
            "confidence": hypothesis_scores[0]["probability"] if hypothesis_scores else 0.5
        }
    
    async def _case_based_reasoning(self, situation: Dict[str, Any], 
                                  context: DecisionContext,
                                  memory_system: MemorySystem) -> Dict[str, Any]:
        """Razonamiento basado en casos: casos previos similares"""
        
        # Recuperar casos similares
        similar_cases = memory_system.retrieve_relevant_memories(
            f"case: {json.dumps(situation)}", context.__dict__
        )
        
        case_adaptations = []
        for case in similar_cases[:3]:
            adaptation = {
                "original_case": case,
                "adaptations_needed": self._identify_adaptations(case, situation),
                "expected_outcome": case.get("outcome", "unknown"),
                "confidence": case.get("relevance_score", 0.5)
            }
            case_adaptations.append(adaptation)
            
        return {
            "strategy": "case_based",
            "similar_cases": case_adaptations,
            "recommended_actions": self._adapt_actions_from_cases(case_adaptations),
            "confidence": np.mean([c["confidence"] for c in case_adaptations]) if case_adaptations else 0.4
        }
    
    def _combine_reasoning_results(self, results: Dict[str, Dict]) -> Dict[str, Any]:
        """Combinar resultados de diferentes estrategias de razonamiento"""
        
        # Calcular confianza promedio
        confidences = [r.get("confidence", 0.5) for r in results.values() if "error" not in r]
        avg_confidence = np.mean(confidences) if confidences else 0.5
        
        # Extraer recomendaciones principales
        main_recommendations = []
        for strategy, result in results.items():
            if "error" not in result:
                if "deductions" in result:
                    main_recommendations.extend(result["deductions"])
                if "recommended_actions" in result:
                    main_recommendations.extend(result["recommended_actions"])
                    
        return {
            "reasoning_strategies_used": list(results.keys()),
            "overall_confidence": avg_confidence,
            "main_recommendations": main_recommendations[:5],  # Top 5
            "detailed_results": results,
            "reasoning_quality": "high" if avg_confidence > 0.7 else "medium" if avg_confidence > 0.5 else "low"
        }
    
    def _predict_effects_from_cause(self, cause: str, memory_system: MemorySystem) -> List[str]:
        """Predecir efectos basados en una causa"""
        # Simular predicción de efectos
        effect_patterns = {
            "Acción de": ["Reacción de opositores", "Cambio en opinión pública", "Respuesta mediática"],
            "Actividad viral": ["Polarización social", "Respuesta institucional", "Contra-narrativas"],
            "Cambio territorial": ["Movilización local", "Intervención estatal", "Tensión regional"]
        }
        
        for pattern, effects in effect_patterns.items():
            if pattern in cause:
                return effects
                
        return ["Efectos impredecibles"]
    
    def _rule_applies_to_situation(self, rule: str, situation: Dict[str, Any]) -> bool:
        """Verificar si una regla aplica a la situación"""
        # Simular aplicabilidad de regla
        rule_keywords = {
            "crítico": "critical" in str(situation).lower(),
            "redes sociales": "social_media" in str(situation).lower(),
            "territorial": "territorial" in str(situation).lower()
        }
        
        return any(keyword in rule.lower() and applies for keyword, applies in rule_keywords.items())
    
    def _apply_rule_to_situation(self, rule: str, situation: Dict[str, Any]) -> str:
        """Aplicar regla a situación específica"""
        return f"Basado en '{rule}': {situation.get('conclusion', 'Se requiere acción preventiva')}"
    
    def _evaluate_hypothesis(self, hypothesis: str, observations: List[str]) -> float:
        """Evaluar probabilidad de una hipótesis"""
        # Simular evaluación de hipótesis
        return np.random.uniform(0.3, 0.9)
    
    def _identify_adaptations(self, case: Dict[str, Any], current_situation: Dict[str, Any]) -> List[str]:
        """Identificar adaptaciones necesarias de un caso previo"""
        return ["Ajustar intensidad de respuesta", "Considerar contexto actual", "Adaptar canales de comunicación"]
    
    def _adapt_actions_from_cases(self, case_adaptations: List[Dict]) -> List[str]:
        """Adaptar acciones de casos previos"""
        actions = []
        for adaptation in case_adaptations:
            actions.extend(adaptation.get("adaptations_needed", []))
        return list(set(actions))  # Eliminar duplicados

class DAMIAutonomousAgent:
    """Agente autónomo DAMI-GPT principal"""
    
    def __init__(self):
        self.state = AgentState.IDLE
        self.knowledge_graph = KnowledgeGraph()
        self.memory_system = MemorySystem()
        self.reasoning_engine = ReasoningEngine()
        
        # Configuración del agente
        self.autonomy_level = 0.8  # Nivel de autonomía (0-1)
        self.decision_confidence_threshold = 0.7
        self.learning_rate = 0.1
        
        # Métricas de rendimiento
        self.decisions_made = 0
        self.successful_decisions = 0
        self.learning_episodes = 0
        
        # Cola de tareas autónomas
        self.task_queue = asyncio.Queue()
        self.active_tasks = {}
        
        # Thread pool para procesamiento paralelo
        self.executor = ThreadPoolExecutor(max_workers=4)
        
        # Control de ejecución
        self.running = False
        self.last_decision_time = datetime.utcnow()
        
    async def start_autonomous_operation(self):
        """Iniciar operación autónoma del agente"""
        self.running = True
        self.state = AgentState.MONITORING
        
        logger.info("🤖 DAMI-GPT Agente Autónomo iniciado")
        
        # Inicializar conocimiento base
        await self._initialize_knowledge_base()
        
        # Crear tareas principales
        tasks = [
            self._monitoring_loop(),
            self._decision_loop(),
            self._learning_loop(),
            self._task_processor()
        ]
        
        # Ejecutar tareas concurrentemente
        await asyncio.gather(*tasks)
    
    async def stop_autonomous_operation(self):
        """Detener operación autónoma"""
        self.running = False
        self.state = AgentState.IDLE
        logger.info("🤖 DAMI-GPT Agente Autónomo detenido")
    
    async def _monitoring_loop(self):
        """Loop principal de monitoreo"""
        while self.running:
            try:
                self.state = AgentState.MONITORING
                
                # Monitorear fuentes de datos
                monitoring_data = await self._gather_monitoring_data()
                
                # Detectar situaciones que requieren atención
                situations = await self._detect_situations(monitoring_data)
                
                # Agregar situaciones a la cola de tareas
                for situation in situations:
                    await self.task_queue.put({
                        "type": "situation_analysis",
                        "data": situation,
                        "priority": situation.get("urgency", 5),
                        "timestamp": datetime.utcnow()
                    })
                
                # Almacenar en memoria
                self.memory_system.store_short_term({
                    "type": "monitoring_cycle",
                    "data": monitoring_data,
                    "situations_detected": len(situations)
                })
                
                await asyncio.sleep(30)  # Monitorear cada 30 segundos
                
            except Exception as e:
                logger.error(f"Error en loop de monitoreo: {e}")
                await asyncio.sleep(60)  # Esperar más en caso de error
    
    async def _decision_loop(self):
        """Loop de toma de decisiones autónomas"""
        while self.running:
            try:
                self.state = AgentState.DECIDING
                
                # Verificar si hay decisiones pendientes
                if datetime.utcnow() - self.last_decision_time > timedelta(minutes=5):
                    # Evaluar situación general
                    general_assessment = await self._assess_general_situation()
                    
                    if general_assessment.get("requires_decision", False):
                        decision = await self._make_autonomous_decision(general_assessment)
                        
                        if decision:
                            await self._execute_decision(decision)
                            self.decisions_made += 1
                            self.last_decision_time = datetime.utcnow()
                
                await asyncio.sleep(60)  # Evaluar decisiones cada minuto
                
            except Exception as e:
                logger.error(f"Error en loop de decisiones: {e}")
                await asyncio.sleep(120)
    
    async def _learning_loop(self):
        """Loop de aprendizaje continuo"""
        while self.running:
            try:
                self.state = AgentState.LEARNING
                
                # Evaluar decisiones pasadas
                await self._evaluate_past_decisions()
                
                # Actualizar conocimiento basado en nuevos datos
                await self._update_knowledge_from_experience()
                
                # Optimizar estrategias de razonamiento
                await self._optimize_reasoning_strategies()
                
                self.learning_episodes += 1
                
                await asyncio.sleep(300)  # Aprender cada 5 minutos
                
            except Exception as e:
                logger.error(f"Error en loop de aprendizaje: {e}")
                await asyncio.sleep(600)
    
    async def _task_processor(self):
        """Procesador de tareas de la cola"""
        while self.running:
            try:
                # Obtener tarea de la cola
                task = await asyncio.wait_for(self.task_queue.get(), timeout=10.0)
                
                self.state = AgentState.ANALYZING
                
                # Procesar tarea según tipo
                if task["type"] == "situation_analysis":
                    result = await self._analyze_situation(task["data"])
                    
                    # Si la situación requiere acción inmediata
                    if result.get("immediate_action_required", False):
                        decision_context = DecisionContext(
                            situation_type=task["data"].get("type", "unknown"),
                            urgency_level=task["priority"],
                            confidence_threshold=self.decision_confidence_threshold,
                            available_resources={"analysis_result": result},
                            historical_outcomes=[],
                            user_preferences={},
                            risk_tolerance=0.6
                        )
                        
                        decision = await self._make_autonomous_decision(task["data"], decision_context)
                        if decision:
                            await self._execute_decision(decision)
                
                # Marcar tarea como completada
                self.task_queue.task_done()
                
            except asyncio.TimeoutError:
                continue  # No hay tareas, continuar
            except Exception as e:
                logger.error(f"Error procesando tarea: {e}")
    
    async def _gather_monitoring_data(self) -> Dict[str, Any]:
        """Recopilar datos de monitoreo de todas las fuentes"""
        # Simular recopilación de datos de múltiples fuentes
        monitoring_data = {
            "political_actors": [
                {"name": "Actor1", "status": "critical", "activity_level": 0.9},
                {"name": "Actor2", "status": "normal", "activity_level": 0.3}
            ],
            "social_media_activity": {
                "total_posts": np.random.randint(100, 500),
                "critical_posts": np.random.randint(5, 25),
                "sentiment_score": np.random.uniform(-0.5, 0.5)
            },
            "territorial_zones": [
                {"name": "Zone1", "tension_level": np.random.uniform(0.3, 0.9)},
                {"name": "Zone2", "tension_level": np.random.uniform(0.1, 0.6)}
            ],
            "system_health": {
                "api_response_time": np.random.uniform(100, 300),
                "database_load": np.random.uniform(0.4, 0.8),
                "active_users": np.random.randint(50, 200)
            }
        }
        
        return monitoring_data
    
    async def _detect_situations(self, monitoring_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Detectar situaciones que requieren atención"""
        situations = []
        
        # Detectar actores críticos
        for actor in monitoring_data.get("political_actors", []):
            if actor.get("status") == "critical" and actor.get("activity_level", 0) > 0.8:
                situations.append({
                    "type": "critical_actor",
                    "actor": actor["name"],
                    "urgency": 9,
                    "description": f"Actor {actor['name']} en estado crítico con alta actividad"
                })
        
        # Detectar alta actividad en redes sociales
        social_activity = monitoring_data.get("social_media_activity", {})
        if social_activity.get("critical_posts", 0) > 15:
            situations.append({
                "type": "high_social_activity",
                "critical_posts": social_activity["critical_posts"],
                "urgency": 7,
                "description": f"Alta actividad crítica en redes: {social_activity['critical_posts']} posts"
            })
        
        # Detectar tensión territorial
        for zone in monitoring_data.get("territorial_zones", []):
            if zone.get("tension_level", 0) > 0.8:
                situations.append({
                    "type": "territorial_tension",
                    "zone": zone["name"],
                    "tension": zone["tension_level"],
                    "urgency": 8,
                    "description": f"Alta tensión en {zone['name']}: {zone['tension_level']:.2f}"
                })
        
        return situations
    
    async def _analyze_situation(self, situation: Dict[str, Any]) -> Dict[str, Any]:
        """Analizar una situación específica"""
        
        # Crear contexto de decisión
        context = DecisionContext(
            situation_type=situation.get("type", "unknown"),
            urgency_level=situation.get("urgency", 5),
            confidence_threshold=self.decision_confidence_threshold,
            available_resources={},
            historical_outcomes=[],
            user_preferences={},
            risk_tolerance=0.6
        )
        
        # Usar motor de razonamiento
        reasoning_result = await self.reasoning_engine.reason_about_situation(
            situation, context, self.memory_system
        )
        
        # Determinar si requiere acción inmediata
        immediate_action = (
            situation.get("urgency", 5) >= 8 and
            reasoning_result.get("overall_confidence", 0) >= self.decision_confidence_threshold
        )
        
        analysis_result = {
            "situation": situation,
            "reasoning": reasoning_result,
            "immediate_action_required": immediate_action,
            "recommended_actions": reasoning_result.get("main_recommendations", []),
            "analysis_timestamp": datetime.utcnow(),
            "confidence": reasoning_result.get("overall_confidence", 0.5)
        }
        
        # Almacenar análisis en memoria
        self.memory_system.store_short_term({
            "type": "situation_analysis",
            "situation_id": situation.get("type", "unknown"),
            "analysis": analysis_result
        })
        
        return analysis_result
    
    async def _make_autonomous_decision(self, situation_data: Dict[str, Any], 
                                      context: DecisionContext = None) -> Optional[AutonomousDecision]:
        """Tomar una decisión autónoma"""
        
        if not context:
            context = DecisionContext(
                situation_type="general_assessment",
                urgency_level=5,
                confidence_threshold=self.decision_confidence_threshold,
                available_resources={},
                historical_outcomes=[],
                user_preferences={},
                risk_tolerance=0.6
            )
        
        # Solo tomar decisiones si el nivel de autonomía lo permite
        if self.autonomy_level < 0.5:
            return None
        
        # Determinar tipo de decisión requerida
        decision_type = self._determine_decision_type(situation_data)
        
        # Generar opciones de decisión
        decision_options = await self._generate_decision_options(situation_data, decision_type, context)
        
        # Evaluar opciones
        best_option = self._evaluate_decision_options(decision_options, context)
        
        if not best_option or best_option.get("confidence", 0) < context.confidence_threshold:
            return None
        
        # Crear decisión autónoma
        decision = AutonomousDecision(
            decision_id=f"auto_decision_{int(time.time())}",
            decision_type=decision_type,
            reasoning=best_option.get("reasoning", "Decisión basada en análisis autónomo"),
            actions=best_option.get("actions", []),
            confidence=best_option.get("confidence", 0.5),
            expected_outcome=best_option.get("expected_outcome", "Mitigación de riesgo"),
            risk_assessment=best_option.get("risk_assessment", {"low": 0.7, "medium": 0.2, "high": 0.1}),
            timestamp=datetime.utcnow(),
            context=context
        )
        
        return decision
    
    def _determine_decision_type(self, situation_data: Dict[str, Any]) -> DecisionType:
        """Determinar qué tipo de decisión se requiere"""
        situation_type = situation_data.get("type", "unknown")
        urgency = situation_data.get("urgency", 5)
        
        if urgency >= 9:
            return DecisionType.ESCALATION
        elif "critical_actor" in situation_type:
            return DecisionType.TACTICAL_RESPONSE
        elif "social_activity" in situation_type:
            return DecisionType.COUNTER_NARRATIVE
        elif "territorial" in situation_type:
            return DecisionType.RESOURCE_ALLOCATION
        else:
            return DecisionType.ALERT_GENERATION
    
    async def _generate_decision_options(self, situation_data: Dict[str, Any], 
                                       decision_type: DecisionType,
                                       context: DecisionContext) -> List[Dict[str, Any]]:
        """Generar opciones de decisión"""
        options = []
        
        if decision_type == DecisionType.ALERT_GENERATION:
            options = [
                {
                    "option": "generate_standard_alert",
                    "actions": [{"type": "alert", "level": "medium", "message": "Situación detectada"}],
                    "confidence": 0.7,
                    "expected_outcome": "Notificación a usuarios",
                    "risk_assessment": {"low": 0.8, "medium": 0.2, "high": 0.0}
                },
                {
                    "option": "generate_priority_alert",
                    "actions": [{"type": "alert", "level": "high", "message": "Situación prioritaria"}],
                    "confidence": 0.8,
                    "expected_outcome": "Respuesta inmediata de usuarios",
                    "risk_assessment": {"low": 0.6, "medium": 0.3, "high": 0.1}
                }
            ]
        elif decision_type == DecisionType.TACTICAL_RESPONSE:
            options = [
                {
                    "option": "immediate_monitoring",
                    "actions": [
                        {"type": "increase_monitoring", "target": situation_data.get("actor", "unknown")},
                        {"type": "alert_team", "urgency": "high"}
                    ],
                    "confidence": 0.85,
                    "expected_outcome": "Contención de situación",
                    "risk_assessment": {"low": 0.7, "medium": 0.2, "high": 0.1}
                }
            ]
        
        # Agregar razonamiento a cada opción
        for option in options:
            option["reasoning"] = f"Opción {option['option']} seleccionada basada en {decision_type.value}"
        
        return options
    
    def _evaluate_decision_options(self, options: List[Dict[str, Any]], 
                                 context: DecisionContext) -> Optional[Dict[str, Any]]:
        """Evaluar opciones de decisión y seleccionar la mejor"""
        if not options:
            return None
        
        # Calcular puntuación para cada opción
        for option in options:
            score = (
                option.get("confidence", 0.5) * 0.4 +
                (1 - option.get("risk_assessment", {}).get("high", 0.5)) * 0.3 +
                (option.get("expected_outcome") is not None) * 0.3
            )
            option["total_score"] = score
        
        # Seleccionar mejor opción
        best_option = max(options, key=lambda x: x.get("total_score", 0))
        
        return best_option if best_option.get("total_score", 0) > 0.6 else None
    
    async def _execute_decision(self, decision: AutonomousDecision):
        """Ejecutar una decisión autónoma"""
        self.state = AgentState.EXECUTING
        
        logger.info(f"🤖 Ejecutando decisión autónoma: {decision.decision_type.value}")
        
        execution_results = []
        
        for action in decision.actions:
            try:
                result = await self._execute_action(action)
                execution_results.append(result)
            except Exception as e:
                logger.error(f"Error ejecutando acción {action}: {e}")
                execution_results.append({"error": str(e)})
        
        # Almacenar decisión y resultados en memoria
        self.memory_system.store_long_term({
            "type": "autonomous_decision",
            "decision": decision.__dict__,
            "execution_results": execution_results,
            "success": all("error" not in result for result in execution_results)
        })
        
        # Actualizar métricas
        if all("error" not in result for result in execution_results):
            self.successful_decisions += 1
        
        logger.info(f"✅ Decisión ejecutada. Éxito: {self.successful_decisions}/{self.decisions_made}")
    
    async def _execute_action(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Ejecutar una acción específica"""
        action_type = action.get("type", "unknown")
        
        if action_type == "alert":
            return await self._send_alert(action)
        elif action_type == "increase_monitoring":
            return await self._increase_monitoring(action)
        elif action_type == "alert_team":
            return await self._alert_team(action)
        else:
            return {"error": f"Tipo de acción desconocida: {action_type}"}
    
    async def _send_alert(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Enviar alerta"""
        # Simular envío de alerta
        await asyncio.sleep(0.1)
        return {
            "action": "alert_sent",
            "level": action.get("level", "medium"),
            "message": action.get("message", "Alerta automática"),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def _increase_monitoring(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Aumentar monitoreo de objetivo específico"""
        await asyncio.sleep(0.1)
        return {
            "action": "monitoring_increased",
            "target": action.get("target", "unknown"),
            "level": "high",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def _alert_team(self, action: Dict[str, Any]) -> Dict[str, Any]:
        """Alertar al equipo"""
        await asyncio.sleep(0.1)
        return {
            "action": "team_alerted",
            "urgency": action.get("urgency", "medium"),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def _initialize_knowledge_base(self):
        """Inicializar base de conocimiento del agente"""
        # Agregar entidades políticas básicas
        political_entities = [
            {"id": "gov_party", "type": "political_party", "name": "Partido Oficialista"},
            {"id": "opp_party", "type": "political_party", "name": "Partido Opositor"},
            {"id": "media_group", "type": "media", "name": "Grupo Mediático Principal"}
        ]
        
        for entity in political_entities:
            self.knowledge_graph.add_entity(
                entity["id"], entity["type"], 
                {"name": entity["name"], "importance": 0.8}
            )
        
        # Agregar relaciones
        self.knowledge_graph.add_relationship("gov_party", "opp_party", "opposes", 0.9)
        self.knowledge_graph.add_relationship("media_group", "gov_party", "supports", 0.6)
        
        logger.info("📚 Base de conocimiento inicializada")
    
    async def _assess_general_situation(self) -> Dict[str, Any]:
        """Evaluar situación general del sistema"""
        # Obtener datos actuales
        current_data = await self._gather_monitoring_data()
        
        # Evaluar métricas clave
        critical_actors = sum(1 for actor in current_data.get("political_actors", []) 
                            if actor.get("status") == "critical")
        
        high_tension_zones = sum(1 for zone in current_data.get("territorial_zones", [])
                               if zone.get("tension_level", 0) > 0.7)
        
        social_sentiment = current_data.get("social_media_activity", {}).get("sentiment_score", 0)
        
        # Determinar si requiere decisión
        requires_decision = (
            critical_actors > 1 or
            high_tension_zones > 1 or
            abs(social_sentiment) > 0.7
        )
        
        return {
            "critical_actors": critical_actors,
            "high_tension_zones": high_tension_zones,
            "social_sentiment": social_sentiment,
            "requires_decision": requires_decision,
            "overall_risk_level": min(1.0, (critical_actors * 0.4 + high_tension_zones * 0.3 + abs(social_sentiment) * 0.3))
        }
    
    async def _evaluate_past_decisions(self):
        """Evaluar efectividad de decisiones pasadas"""
        # Obtener decisiones de memoria a largo plazo
        past_decisions = [mem for mem in self.memory_system.long_term_memory 
                         if mem.get("type") == "autonomous_decision"]
        
        # Analizar patrones de éxito
        success_rate = self.successful_decisions / max(self.decisions_made, 1)
        
        if success_rate < 0.7:
            # Ajustar parámetros si el éxito es bajo
            self.decision_confidence_threshold = min(0.9, self.decision_confidence_threshold + 0.05)
            logger.info(f"📈 Ajustando threshold de confianza: {self.decision_confidence_threshold}")
    
    async def _update_knowledge_from_experience(self):
        """Actualizar conocimiento basado en experiencia"""
        # Simular actualización de conocimiento
        recent_memories = list(self.memory_system.short_term_memory)[-10:]
        
        for memory in recent_memories:
            if memory.get("type") == "situation_analysis":
                # Extraer patrones y actualizar conocimiento semántico
                situation = memory.get("analysis", {}).get("situation", {})
                self.memory_system.update_semantic_knowledge(
                    situation.get("type", "unknown"),
                    {"frequency": 1, "last_seen": datetime.utcnow()}
                )
    
    async def _optimize_reasoning_strategies(self):
        """Optimizar estrategias de razonamiento"""
        # Simular optimización
        self.learning_rate = max(0.01, self.learning_rate * 0.99)
        logger.debug(f"🎯 Learning rate ajustado: {self.learning_rate}")
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Obtener estado actual del agente"""
        return {
            "state": self.state.value,
            "autonomy_level": self.autonomy_level,
            "decisions_made": self.decisions_made,
            "successful_decisions": self.successful_decisions,
            "success_rate": self.successful_decisions / max(self.decisions_made, 1),
            "learning_episodes": self.learning_episodes,
            "knowledge_graph_nodes": self.knowledge_graph.graph.number_of_nodes(),
            "knowledge_graph_edges": self.knowledge_graph.graph.number_of_edges(),
            "short_term_memories": len(self.memory_system.short_term_memory),
            "long_term_memories": len(self.memory_system.long_term_memory),
            "last_decision_time": self.last_decision_time.isoformat(),
            "running": self.running
        }


# Instancia global del agente autónomo
dami_autonomous_agent = DAMIAutonomousAgent()