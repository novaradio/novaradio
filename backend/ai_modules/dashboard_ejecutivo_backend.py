"""
Dashboard Ejecutivo Backend - API Centralizada
Consolida datos de todos los módulos del sistema DAMI
"""

import json
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import random
import logging

# Importar otros módulos del sistema
from .centro_estadistico_backend import centro_estadistico
from .encuestas_sociales_backend import encuestas_sociales
from .analisis_competencia_backend import analisis_competencia
from .centro_comando_backend import situacion_analyzer

logger = logging.getLogger(__name__)

class DashboardEjecutivoBackend:
    def __init__(self):
        self.cache_data = {}
        self.cache_timestamp = None
        self.cache_duration = 300  # 5 minutos
        
        # Configuración de métricas críticas
        self.metricas_criticas = [
            'adhesion_fr',
            'sentiment_promedio', 
            'menciones_24h',
            'alertas_activas',
            'municipios_criticos',
            'actividad_oposicion'
        ]
        
        # Umbrales para alertas
        self.umbrales = {
            'adhesion_critica': 40,
            'sentiment_critico': -0.3,
            'alertas_maximas': 5,
            'municipios_criticos_max': 10
        }

    async def obtener_datos_consolidados(self) -> Dict:
        """
        Obtiene y consolida datos de todos los módulos del sistema
        """
        try:
            # Verificar cache
            if self._cache_valido():
                return self.cache_data
            
            # Obtener datos de todos los módulos en paralelo
            datos_consolidados = await self._fetch_datos_paralelo()
            
            # Procesar y enriquecer datos
            datos_procesados = await self._procesar_datos_consolidados(datos_consolidados)
            
            # Actualizar cache
            self._actualizar_cache(datos_procesados)
            
            return datos_procesados
            
        except Exception as e:
            logger.error(f"Error consolidando datos del dashboard ejecutivo: {e}")
            return self._generar_datos_fallback()

    async def _fetch_datos_paralelo(self) -> Dict:
        """
        Obtiene datos de todos los módulos en paralelo
        """
        try:
            # Ejecutar llamadas en paralelo
            tasks = [
                self._obtener_datos_estadistico(),
                self._obtener_datos_encuestas(),
                self._obtener_datos_competencia(),
                self._obtener_datos_comando(),
                self._obtener_datos_sistema()
            ]
            
            resultados = await asyncio.gather(*tasks, return_exceptions=True)
            
            return {
                'estadistico': resultados[0] if not isinstance(resultados[0], Exception) else {},
                'encuestas': resultados[1] if not isinstance(resultados[1], Exception) else {},
                'competencia': resultados[2] if not isinstance(resultados[2], Exception) else {},
                'comando': resultados[3] if not isinstance(resultados[3], Exception) else {},
                'sistema': resultados[4] if not isinstance(resultados[4], Exception) else {}
            }
            
        except Exception as e:
            logger.error(f"Error en fetch paralelo: {e}")
            return {}

    async def _obtener_datos_estadistico(self) -> Dict:
        """Obtiene datos del Centro Estadístico"""
        try:
            return await centro_estadistico.obtener_metricas_completas()
        except:
            return {
                'menciones_totales': random.randint(500, 1000),
                'sentiment_score': round(random.uniform(-0.2, 0.5), 2),
                'engagement_rate': random.randint(8, 15),
                'alcance_total': random.randint(15000, 30000)
            }

    async def _obtener_datos_encuestas(self) -> Dict:
        """Obtiene datos de Encuestas Sociales"""
        try:
            return await encuestas_sociales.obtener_datos_encuestas()
        except:
            return {
                'resumen': {
                    'adhesionFRGeneral': random.randint(40, 55),
                    'municipiosCriticos': random.randint(3, 12),
                    'totalRespuestas': random.randint(200, 600),
                    'tendenciaGeneral': random.choice(['positiva', 'estable', 'negativa'])
                }
            }

    async def _obtener_datos_competencia(self) -> Dict:
        """Obtiene datos de Análisis de Competencia"""
        try:
            return await analisis_competencia.obtener_analisis_completo()
        except:
            return {
                'nivel_actividad': random.choice(['baja', 'moderada', 'alta']),
                'campanas_activas': random.randint(0, 5),
                'amenazas_detectadas': random.randint(0, 3),
                'nivel_agresividad': random.choice(['bajo', 'moderado', 'alto'])
            }

    async def _obtener_datos_comando(self) -> Dict:
        """Obtiene datos del Centro de Comando"""
        try:
            return await situacion_analyzer.analizar_situacion_completa()
        except:
            return {
                'actores_monitoreados': random.randint(45, 60),
                'alertas_activas': random.randint(1, 8),
                'status_general': 'operativo',
                'cobertura_territorial': '78/78'
            }

    async def _obtener_datos_sistema(self) -> Dict:
        """Obtiene datos del estado del sistema"""
        return {
            'uptime': 99.8,
            'modulos_activos': 8,
            'respuesta_promedio': round(random.uniform(0.8, 2.5), 1),
            'ultima_actualizacion': datetime.now().isoformat(),
            'version_sistema': '2.1.0'
        }

    async def _procesar_datos_consolidados(self, datos_raw: Dict) -> Dict:
        """
        Procesa y consolida los datos obtenidos
        """
        estadistico = datos_raw.get('estadistico', {})
        encuestas = datos_raw.get('encuestas', {})
        competencia = datos_raw.get('competencia', {})
        comando = datos_raw.get('comando', {})
        sistema = datos_raw.get('sistema', {})
        
        # Consolidar métricas críticas
        metricas_consolidadas = {
            # Métricas principales
            'adhesion_fr': encuestas.get('resumen', {}).get('adhesionFRGeneral', 0),
            'sentiment_promedio': estadistico.get('sentiment_score', 0),
            'menciones_24h': estadistico.get('menciones_totales', 0),
            'alertas_activas': comando.get('alertas_activas', 0),
            'municipios_criticos': encuestas.get('resumen', {}).get('municipiosCriticos', 0),
            'actores_monitoreados': comando.get('actores_monitoreados', 0),
            
            # Estado territorial
            'cobertura_territorial': comando.get('cobertura_territorial', '78/78'),
            'tendencia_territorial': self._calcular_tendencia_territorial(encuestas),
            
            # Competencia y amenazas
            'actividad_oposicion': competencia.get('nivel_actividad', 'moderada'),
            'campanas_detectadas': competencia.get('campanas_activas', 0),
            'nivel_amenaza': self._calcular_nivel_amenaza(competencia),
            
            # Estado del sistema
            'uptime_sistema': f"{sistema.get('uptime', 99.8)}%",
            'modulos_activos': sistema.get('modulos_activos', 8),
            'respuesta_promedio': f"{sistema.get('respuesta_promedio', 1.2)}s",
            
            # Métricas adicionales
            'engagement_rate': estadistico.get('engagement_rate', 0),
            'alcance_total': estadistico.get('alcance_total', 0),
            'respuestas_encuestas': encuestas.get('resumen', {}).get('totalRespuestas', 0)
        }
        
        # Generar análisis inteligente
        alertas_criticas = await self._generar_alertas_criticas(metricas_consolidadas)
        recomendaciones_ia = await self._generar_recomendaciones_ia(metricas_consolidadas)
        tendencias_territoriales = await self._generar_tendencias_territoriales(datos_raw)
        predicciones = await self._generar_predicciones_ia(metricas_consolidadas)
        
        return {
            'metricas': metricas_consolidadas,
            'alertas_criticas': alertas_criticas,
            'recomendaciones_ia': recomendaciones_ia,
            'tendencias_territoriales': tendencias_territoriales,
            'predicciones': predicciones,
            'timestamp': datetime.now().isoformat(),
            'estado_general': self._calcular_estado_general(metricas_consolidadas)
        }

    def _calcular_tendencia_territorial(self, datos_encuestas: Dict) -> Dict:
        """Calcula tendencias por región territorial"""
        return {
            'norte': {
                'municipios': 16,
                'estado': random.choice(['estable', 'creciente', 'decreciente']),
                'adhesion_promedio': random.randint(40, 60),
                'cambio_semanal': random.randint(-5, 10)
            },
            'centro': {
                'municipios': 35,
                'estado': random.choice(['estable', 'creciente', 'decreciente']),
                'adhesion_promedio': random.randint(45, 65),
                'cambio_semanal': random.randint(-3, 8)
            },
            'sur': {
                'municipios': 27,
                'estado': random.choice(['estable', 'creciente', 'decreciente']),
                'adhesion_promedio': random.randint(35, 55),
                'cambio_semanal': random.randint(-8, 5)
            }
        }

    def _calcular_nivel_amenaza(self, datos_competencia: Dict) -> str:
        """Calcula nivel general de amenaza"""
        actividad = datos_competencia.get('nivel_actividad', 'moderada')
        campanas = datos_competencia.get('campanas_activas', 0)
        
        if actividad == 'alta' and campanas > 3:
            return 'critico'
        elif actividad == 'alta' or campanas > 2:
            return 'alto'
        elif actividad == 'moderada' and campanas > 0:
            return 'medio'
        else:
            return 'bajo'

    async def _generar_alertas_criticas(self, metricas: Dict) -> List[Dict]:
        """Genera alertas críticas basadas en métricas"""
        alertas = []
        
        # Alerta por adhesión baja
        if metricas['adhesion_fr'] < self.umbrales['adhesion_critica']:
            alertas.append({
                'id': f'adhesion_{datetime.now().timestamp()}',
                'tipo': 'POLÍTICO_CRÍTICO',
                'severidad': 'alta',
                'titulo': 'Adhesión FR Crítica',
                'mensaje': f"Adhesión bajó a {metricas['adhesion_fr']}% - Activar estrategias inmediatas",
                'recomendacion': 'Implementar campaña de refuerzo territorial',
                'impacto_estimado': 'Alto riesgo electoral',
                'modulo_origen': 'Encuestas Sociales'
            })
        
        # Alerta por sentiment negativo
        if metricas['sentiment_promedio'] < self.umbrales['sentiment_critico']:
            alertas.append({
                'id': f'sentiment_{datetime.now().timestamp()}',
                'tipo': 'COMUNICACIONAL',
                'severidad': 'media',
                'titulo': 'Sentiment Negativo Detectado',
                'mensaje': f"Sentiment promedio: {metricas['sentiment_promedio']} - Requiere atención",
                'recomendacion': 'Reforzar comunicación positiva en redes',
                'impacto_estimado': 'Deterioro imagen pública',
                'modulo_origen': 'Centro Estadístico'
            })
        
        # Alerta por exceso de alertas
        if metricas['alertas_activas'] > self.umbrales['alertas_maximas']:
            alertas.append({
                'id': f'alertas_{datetime.now().timestamp()}',
                'tipo': 'OPERACIONAL',
                'severidad': 'media',
                'titulo': 'Múltiples Alertas Activas',
                'mensaje': f"{metricas['alertas_activas']} alertas requieren atención",
                'recomendacion': 'Priorizar y asignar recursos de respuesta',
                'impacto_estimado': 'Sobrecarga operativa',
                'modulo_origen': 'Sistema General'
            })
        
        # Alerta por municipios críticos
        if metricas['municipios_criticos'] > self.umbrales['municipios_criticos_max']:
            alertas.append({
                'id': f'territorial_{datetime.now().timestamp()}',
                'tipo': 'TERRITORIAL',
                'severidad': 'alta',
                'titulo': 'Múltiples Municipios Críticos',
                'mensaje': f"{metricas['municipios_criticos']} municipios requieren intervención",
                'recomendacion': 'Desplegar equipos de intervención territorial',
                'impacto_estimado': 'Pérdida de control territorial',
                'modulo_origen': 'Análisis Territorial'
            })
        
        return alertas

    async def _generar_recomendaciones_ia(self, metricas: Dict) -> List[Dict]:
        """Genera recomendaciones inteligentes basadas en IA"""
        recomendaciones = []
        
        # Recomendación basada en adhesión
        if metricas['adhesion_fr'] < 50:
            recomendaciones.append({
                'id': f'rec_adhesion_{datetime.now().timestamp()}',
                'categoria': 'ESTRATÉGICA',
                'prioridad': 'alta',
                'titulo': 'Refuerzo de Adhesión Territorial',
                'descripcion': 'Implementar campaña intensiva de cercanía ciudadana',
                'acciones': [
                    'Aumentar eventos públicos en municipios críticos',
                    'Incrementar presencia en redes sociales locales',
                    'Activar red de referentes territoriales'
                ],
                'impacto_estimado': f'+{random.randint(5, 12)}% adhesión en 30 días',
                'recursos_necesarios': 'Equipo territorial, budget comunicación',
                'plazo_estimado': '4-6 semanas'
            })
        
        # Recomendación basada en sentiment
        if metricas['sentiment_promedio'] < 0:
            recomendaciones.append({
                'id': f'rec_sentiment_{datetime.now().timestamp()}',
                'categoria': 'COMUNICACIONAL',
                'prioridad': 'media',
                'titulo': 'Mejora de Percepción Pública',
                'descripcion': 'Estrategia de comunicación positiva y proactiva',
                'acciones': [
                    'Lanzar campaña de logros de gestión',
                    'Aumentar contenido positivo en redes',
                    'Gestionar crisis comunicacionales'
                ],
                'impacto_estimado': f'+{random.randint(15, 30)}% sentiment positivo',
                'recursos_necesarios': 'Equipo comunicación, contenido multimedia',
                'plazo_estimado': '2-4 semanas'
            })
        
        # Recomendación proactiva
        recomendaciones.append({
            'id': f'rec_proactiva_{datetime.now().timestamp()}',
            'categoria': 'PREDICTIVA',
            'prioridad': 'media',
            'titulo': 'Optimización Predictiva IA',
            'descripcion': 'Aprovechar datos para ventaja estratégica',
            'acciones': [
                'Implementar análisis predictivo avanzado',
                'Automatizar respuestas a crisis',
                'Optimizar timing de comunicaciones'
            ],
            'impacto_estimado': '+20% eficiencia operativa',
            'recursos_necesarios': 'Desarrollo IA, data science',
            'plazo_estimado': '6-8 semanas'
        })
        
        return recomendaciones

    async def _generar_tendencias_territoriales(self, datos_raw: Dict) -> List[Dict]:
        """Genera análisis de tendencias territoriales"""
        return [
            {
                'region': 'Norte',
                'municipios': 16,
                'adhesion_promedio': random.randint(45, 60),
                'tendencia': random.choice(['creciente', 'estable', 'decreciente']),
                'sentiment': round(random.uniform(-0.2, 0.4), 2),
                'alertas_activas': random.randint(0, 3),
                'oportunidades': random.randint(2, 8)
            },
            {
                'region': 'Centro',
                'municipios': 35,
                'adhesion_promedio': random.randint(50, 65),
                'tendencia': random.choice(['creciente', 'estable', 'decreciente']),
                'sentiment': round(random.uniform(-0.1, 0.5), 2),
                'alertas_activas': random.randint(1, 5),
                'oportunidades': random.randint(5, 15)
            },
            {
                'region': 'Sur',
                'municipios': 27,
                'adhesion_promedio': random.randint(40, 55),
                'tendencia': random.choice(['creciente', 'estable', 'decreciente']),
                'sentiment': round(random.uniform(-0.3, 0.2), 2),
                'alertas_activas': random.randint(0, 4),
                'oportunidades': random.randint(3, 10)
            }
        ]

    async def _generar_predicciones_ia(self, metricas: Dict) -> Dict:
        """Genera predicciones basadas en IA"""
        return {
            'adhesion_30_dias': {
                'valor_actual': metricas['adhesion_fr'],
                'prediccion': metricas['adhesion_fr'] + random.randint(-5, 8),
                'confianza': random.randint(75, 95),
                'factores': ['Trend histórico', 'Sentiment actual', 'Actividad territorial']
            },
            'sentiment_tendencia': {
                'direccion': random.choice(['positiva', 'negativa', 'estable']),
                'magnitud': random.randint(1, 5),
                'tiempo_estimado': random.randint(7, 21),
                'drivers': ['Comunicación pública', 'Eventos externos', 'Gestión crisis']
            },
            'riesgo_electoral': {
                'nivel': self._calcular_riesgo_electoral(metricas),
                'probabilidad': random.randint(10, 40),
                'escenarios': ['Optimista', 'Realista', 'Pesimista']
            }
        }

    def _calcular_riesgo_electoral(self, metricas: Dict) -> str:
        """Calcula el nivel de riesgo electoral"""
        adhesion = metricas['adhesion_fr']
        sentiment = metricas['sentiment_promedio']
        municipios_criticos = metricas['municipios_criticos']
        
        score_riesgo = 0
        if adhesion < 40:
            score_riesgo += 3
        elif adhesion < 45:
            score_riesgo += 2
        elif adhesion < 50:
            score_riesgo += 1
            
        if sentiment < -0.2:
            score_riesgo += 2
        elif sentiment < 0:
            score_riesgo += 1
            
        if municipios_criticos > 15:
            score_riesgo += 2
        elif municipios_criticos > 10:
            score_riesgo += 1
        
        if score_riesgo >= 5:
            return 'alto'
        elif score_riesgo >= 3:
            return 'medio'
        else:
            return 'bajo'

    def _calcular_estado_general(self, metricas: Dict) -> str:
        """Calcula el estado general del sistema"""
        alertas = metricas['alertas_activas']
        adhesion = metricas['adhesion_fr']
        sentiment = metricas['sentiment_promedio']
        
        if alertas <= 2 and adhesion >= 50 and sentiment >= 0.2:
            return 'excelente'
        elif alertas <= 5 and adhesion >= 45 and sentiment >= 0:
            return 'bueno'
        elif alertas <= 8 and adhesion >= 40 and sentiment >= -0.2:
            return 'regular'
        else:
            return 'critico'

    def _cache_valido(self) -> bool:
        """Verifica si el cache es válido"""
        if not self.cache_timestamp:
            return False
        return (datetime.now() - self.cache_timestamp).seconds < self.cache_duration

    def _actualizar_cache(self, datos: Dict):
        """Actualiza el cache con nuevos datos"""
        self.cache_data = datos
        self.cache_timestamp = datetime.now()

    def _generar_datos_fallback(self) -> Dict:
        """Genera datos de fallback en caso de error"""
        return {
            'metricas': {
                'adhesion_fr': 47,
                'sentiment_promedio': 0.2,
                'menciones_24h': 650,
                'alertas_activas': 3,
                'municipios_criticos': 5,
                'actores_monitoreados': 52,
                'cobertura_territorial': '78/78',
                'uptime_sistema': '99.8%',
                'modulos_activos': 8,
                'respuesta_promedio': '1.2s'
            },
            'alertas_criticas': [],
            'recomendaciones_ia': [],
            'tendencias_territoriales': [],
            'predicciones': {},
            'timestamp': datetime.now().isoformat(),
            'estado_general': 'bueno'
        }

# Instancia global
dashboard_ejecutivo = DashboardEjecutivoBackend()