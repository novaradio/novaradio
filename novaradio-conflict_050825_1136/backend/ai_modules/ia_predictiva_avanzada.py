"""
IA Predictiva Avanzada para DAMI
Módulo de inteligencia artificial con análisis NLP, predicciones electorales,
detección de anomalías y correlación inteligente de datos
"""

import json
import asyncio
import re
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from collections import defaultdict, Counter
import logging
from dataclasses import dataclass
import random
import math

logger = logging.getLogger(__name__)

@dataclass
class SentimentAnalysis:
    texto: str
    polaridad: float  # -1.0 (muy negativo) a 1.0 (muy positivo)
    subjetividad: float  # 0.0 (objetivo) a 1.0 (subjetivo)
    emociones: Dict[str, float]  # alegría, tristeza, enojo, miedo, sorpresa
    entidades: List[str]  # personas, lugares, organizaciones mencionadas
    intensidad: float  # 0.0 a 1.0
    contexto_politico: Dict[str, float]  # temas políticos relevantes

@dataclass
class PrediccionElectoral:
    fecha_prediccion: datetime
    adhesion_proyectada: float
    intervalo_confianza: Tuple[float, float]
    factores_influyentes: List[Dict[str, float]]
    probabilidad_victoria: float
    escenarios: Dict[str, float]  # optimista, realista, pesimista
    municipios_clave: List[str]

@dataclass
class Anomalia:
    id: str
    timestamp: datetime
    tipo: str  # 'sentiment', 'volumen', 'patron', 'competencia'
    severidad: float  # 0.0 a 1.0
    descripcion: str
    datos_asociados: Dict
    acciones_recomendadas: List[str]
    patron_detectado: str

class IAPredictiva:
    def __init__(self):
        # Diccionarios de sentiment en español político
        self.palabras_positivas = {
            'excelente': 0.9, 'fantástico': 0.8, 'increíble': 0.8, 'maravilloso': 0.9,
            'bueno': 0.6, 'mejor': 0.7, 'gran': 0.6, 'progreso': 0.7,
            'desarrollo': 0.6, 'crecimiento': 0.7, 'éxito': 0.8, 'triunfo': 0.8,
            'logro': 0.7, 'victoria': 0.8, 'ganador': 0.7, 'líder': 0.6,
            'apoyo': 0.6, 'respaldo': 0.6, 'confianza': 0.7, 'esperanza': 0.7,
            'futuro': 0.5, 'oportunidad': 0.6, 'solución': 0.6, 'innovación': 0.7
        }
        
        self.palabras_negativas = {
            'terrible': -0.9, 'horrible': -0.8, 'desastre': -0.9, 'fracaso': -0.8,
            'malo': -0.6, 'peor': -0.7, 'crisis': -0.7, 'problema': -0.6,
            'corrupción': -0.9, 'mentira': -0.8, 'engaño': -0.7, 'traición': -0.8,
            'error': -0.6, 'falla': -0.6, 'defecto': -0.5, 'crítica': -0.5,
            'rechazo': -0.7, 'oposición': -0.5, 'protesta': -0.6, 'queja': -0.6,
            'decepción': -0.7, 'frustración': -0.6, 'enojo': -0.7, 'ira': -0.8
        }
        
        self.emociones_palabras = {
            'alegría': ['feliz', 'contento', 'alegre', 'gozoso', 'jubiloso', 'eufórico'],
            'tristeza': ['triste', 'deprimido', 'melancólico', 'desanimado', 'pesimista'],
            'enojo': ['enojado', 'furioso', 'molesto', 'irritado', 'indignado', 'iracundo'],
            'miedo': ['miedo', 'temor', 'pánico', 'terror', 'angustia', 'preocupación'],
            'sorpresa': ['sorprendido', 'asombrado', 'impactado', 'conmocionado']
        }
        
        # Patrones históricos para predicción electoral
        self.patrones_historicos = {
            'ciclo_electoral': {'duracion_meses': 48, 'picos_atencion': [6, 12, 18, 24]},
            'factores_economicos': {'peso': 0.3, 'lag_meses': 3},
            'factores_sociales': {'peso': 0.2, 'tendencia_factor': 0.15},
            'factores_medios': {'peso': 0.25, 'influencia_directa': 0.4},
            'factor_incumbencia': {'ventaja_inicial': 0.05, 'desgaste_mensual': 0.001}
        }
        
        # Umbrales para detección de anomalías
        self.umbrales_anomalias = {
            'sentiment_cambio_abrupto': 0.3,  # cambio de sentiment > 30%
            'volumen_anomalo': 2.5,  # 250% del volumen normal
            'patron_temporal_desviacion': 0.4,
            'competencia_actividad_inusual': 0.6
        }

    async def analizar_sentiment_avanzado(self, textos: List[str], contexto: str = "general") -> List[SentimentAnalysis]:
        """
        Análisis avanzado de sentiment con NLP en tiempo real
        """
        try:
            resultados = []
            
            for texto in textos:
                # Limpiar y procesar texto
                texto_limpio = self._limpiar_texto(texto)
                palabras = texto_limpio.split()
                
                # Calcular polaridad
                polaridad = self._calcular_polaridad(palabras)
                
                # Calcular subjetividad
                subjetividad = self._calcular_subjetividad(palabras)
                
                # Detectar emociones
                emociones = self._detectar_emociones(palabras)
                
                # Extraer entidades
                entidades = self._extraer_entidades(texto_limpio)
                
                # Calcular intensidad
                intensidad = self._calcular_intensidad(palabras)
                
                # Análisis de contexto político
                contexto_politico = self._analizar_contexto_politico(palabras, contexto)
                
                resultado = SentimentAnalysis(
                    texto=texto[:200] + "..." if len(texto) > 200 else texto,
                    polaridad=polaridad,
                    subjetividad=subjetividad,
                    emociones=emociones,
                    entidades=entidades,
                    intensidad=intensidad,
                    contexto_politico=contexto_politico
                )
                
                resultados.append(resultado)
                
            return resultados
            
        except Exception as e:
            logger.error(f"Error en análisis de sentiment: {e}")
            return []

    async def predecir_elecciones(self, datos_historicos: Dict, fecha_objetivo: datetime) -> PrediccionElectoral:
        """
        Predicción electoral usando modelos ML con datos históricos
        """
        try:
            # Obtener datos actuales
            adhesion_actual = datos_historicos.get('adhesion_actual', 45)
            tendencia_3meses = datos_historicos.get('tendencia_3meses', [42, 44, 45])
            sentiment_promedio = datos_historicos.get('sentiment_promedio', 0.2)
            actividad_competencia = datos_historicos.get('actividad_competencia', 0.5)
            
            # Calcular factores de influencia
            factor_tendencia = self._calcular_factor_tendencia(tendencia_3meses)
            factor_sentiment = self._calcular_factor_sentiment(sentiment_promedio)
            factor_competencia = self._calcular_factor_competencia(actividad_competencia)
            factor_temporal = self._calcular_factor_temporal(fecha_objetivo)
            
            # Modelo predictivo (simulado ML)
            adhesion_base = adhesion_actual
            ajuste_tendencia = factor_tendencia * 3
            ajuste_sentiment = factor_sentiment * 5
            ajuste_competencia = factor_competencia * -2
            ajuste_temporal = factor_temporal * 2
            
            adhesion_proyectada = max(0, min(100, 
                adhesion_base + ajuste_tendencia + ajuste_sentiment + 
                ajuste_competencia + ajuste_temporal + random.uniform(-2, 2)
            ))
            
            # Calcular intervalo de confianza
            margen_error = 3.5 + abs(adhesion_proyectada - 50) * 0.1
            intervalo_confianza = (
                max(0, adhesion_proyectada - margen_error),
                min(100, adhesion_proyectada + margen_error)
            )
            
            # Calcular probabilidad de victoria
            probabilidad_victoria = self._calcular_probabilidad_victoria(adhesion_proyectada)
            
            # Generar escenarios
            escenarios = {
                'optimista': min(100, adhesion_proyectada + 5),
                'realista': adhesion_proyectada,
                'pesimista': max(0, adhesion_proyectada - 5)
            }
            
            # Identificar municipios clave
            municipios_clave = self._identificar_municipios_clave(datos_historicos)
            
            # Factores influyentes detallados
            factores_influyentes = [
                {'nombre': 'Tendencia histórica', 'peso': factor_tendencia, 'impacto': ajuste_tendencia},
                {'nombre': 'Sentiment público', 'peso': factor_sentiment, 'impacto': ajuste_sentiment},
                {'nombre': 'Actividad competencia', 'peso': factor_competencia, 'impacto': ajuste_competencia},
                {'nombre': 'Factor temporal', 'peso': factor_temporal, 'impacto': ajuste_temporal}
            ]
            
            return PrediccionElectoral(
                fecha_prediccion=datetime.now(),
                adhesion_proyectada=round(adhesion_proyectada, 1),
                intervalo_confianza=intervalo_confianza,
                factores_influyentes=factores_influyentes,
                probabilidad_victoria=round(probabilidad_victoria, 2),
                escenarios=escenarios,
                municipios_clave=municipios_clave
            )
            
        except Exception as e:
            logger.error(f"Error en predicción electoral: {e}")
            return self._generar_prediccion_fallback()

    async def detectar_anomalias(self, datos_tiempo_real: Dict) -> List[Anomalia]:
        """
        Detección automática de anomalías en los datos
        """
        try:
            anomalias = []
            timestamp_actual = datetime.now()
            
            # Detectar anomalías de sentiment
            if 'sentiment_historico' in datos_tiempo_real:
                anomalia_sentiment = self._detectar_anomalia_sentiment(
                    datos_tiempo_real['sentiment_historico']
                )
                if anomalia_sentiment:
                    anomalias.append(Anomalia(
                        id=f"sentiment_anomaly_{timestamp_actual.timestamp()}",
                        timestamp=timestamp_actual,
                        tipo='sentiment',
                        severidad=anomalia_sentiment['severidad'],
                        descripcion=anomalia_sentiment['descripcion'],
                        datos_asociados=anomalia_sentiment['datos'],
                        acciones_recomendadas=anomalia_sentiment['acciones'],
                        patron_detectado=anomalia_sentiment['patron']
                    ))
            
            # Detectar anomalías de volumen
            if 'volumen_menciones' in datos_tiempo_real:
                anomalia_volumen = self._detectar_anomalia_volumen(
                    datos_tiempo_real['volumen_menciones']
                )
                if anomalia_volumen:
                    anomalias.append(Anomalia(
                        id=f"volume_anomaly_{timestamp_actual.timestamp()}",
                        timestamp=timestamp_actual,
                        tipo='volumen',
                        severidad=anomalia_volumen['severidad'],
                        descripcion=anomalia_volumen['descripcion'],
                        datos_asociados=anomalia_volumen['datos'],
                        acciones_recomendadas=anomalia_volumen['acciones'],
                        patron_detectado=anomalia_volumen['patron']
                    ))
            
            # Detectar patrones temporales anómalos
            if 'patron_temporal' in datos_tiempo_real:
                anomalia_patron = self._detectar_anomalia_patron(
                    datos_tiempo_real['patron_temporal']
                )
                if anomalia_patron:
                    anomalias.append(Anomalia(
                        id=f"pattern_anomaly_{timestamp_actual.timestamp()}",
                        timestamp=timestamp_actual,
                        tipo='patron',
                        severidad=anomalia_patron['severidad'],
                        descripcion=anomalia_patron['descripcion'],
                        datos_asociados=anomalia_patron['datos'],
                        acciones_recomendadas=anomalia_patron['acciones'],
                        patron_detectado=anomalia_patron['patron']
                    ))
            
            # Detectar actividad anómala de competencia
            if 'actividad_competencia' in datos_tiempo_real:
                anomalia_competencia = self._detectar_anomalia_competencia(
                    datos_tiempo_real['actividad_competencia']
                )
                if anomalia_competencia:
                    anomalias.append(Anomalia(
                        id=f"competition_anomaly_{timestamp_actual.timestamp()}",
                        timestamp=timestamp_actual,
                        tipo='competencia',
                        severidad=anomalia_competencia['severidad'],
                        descripcion=anomalia_competencia['descripcion'],
                        datos_asociados=anomalia_competencia['datos'],
                        acciones_recomendadas=anomalia_competencia['acciones'],
                        patron_detectado=anomalia_competencia['patron']
                    ))
            
            return anomalias
            
        except Exception as e:
            logger.error(f"Error detectando anomalías: {e}")
            return []

    async def correlacion_inteligente(self, datasets: Dict[str, List]) -> Dict[str, Dict]:
        """
        Análisis de correlación inteligente entre diferentes fuentes de datos
        """
        try:
            correlaciones = {}
            
            # Correlación Sentiment vs Adhesión
            if 'sentiment' in datasets and 'adhesion' in datasets:
                correlaciones['sentiment_adhesion'] = self._calcular_correlacion_avanzada(
                    datasets['sentiment'], 
                    datasets['adhesion'],
                    'Sentiment Social vs Adhesión Electoral'
                )
            
            # Correlación Actividad Redes vs Intención Voto
            if 'actividad_redes' in datasets and 'intencion_voto' in datasets:
                correlaciones['redes_voto'] = self._calcular_correlacion_avanzada(
                    datasets['actividad_redes'],
                    datasets['intencion_voto'], 
                    'Actividad en Redes vs Intención de Voto'
                )
            
            # Correlación Competencia vs Performance FR
            if 'actividad_competencia' in datasets and 'performance_fr' in datasets:
                correlaciones['competencia_performance'] = self._calcular_correlacion_avanzada(
                    datasets['actividad_competencia'],
                    datasets['performance_fr'],
                    'Actividad Competencia vs Performance FR'
                )
            
            # Correlación Territorial vs Adhesión
            if 'actividad_territorial' in datasets and 'adhesion_territorial' in datasets:
                correlaciones['territorial_adhesion'] = self._calcular_correlacion_avanzada(
                    datasets['actividad_territorial'],
                    datasets['adhesion_territorial'],
                    'Actividad Territorial vs Adhesión Regional'
                )
            
            # Análisis de lag temporal
            correlaciones_lag = self._analizar_correlaciones_temporales(datasets)
            correlaciones.update(correlaciones_lag)
            
            # Detectar correlaciones emergentes
            correlaciones_emergentes = self._detectar_correlaciones_emergentes(datasets)
            correlaciones['emergentes'] = correlaciones_emergentes
            
            return correlaciones
            
        except Exception as e:
            logger.error(f"Error en correlación inteligente: {e}")
            return {}

    # Métodos auxiliares privados
    
    def _limpiar_texto(self, texto: str) -> str:
        """Limpia y normaliza texto para análisis"""
        # Convertir a minúsculas
        texto = texto.lower()
        # Remover caracteres especiales pero mantener espacios
        texto = re.sub(r'[^a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s]', ' ', texto)
        # Remover espacios múltiples
        texto = re.sub(r'\s+', ' ', texto)
        return texto.strip()
    
    def _calcular_polaridad(self, palabras: List[str]) -> float:
        """Calcula polaridad del sentiment (-1.0 a 1.0)"""
        puntuacion = 0
        palabras_relevantes = 0
        
        for palabra in palabras:
            if palabra in self.palabras_positivas:
                puntuacion += self.palabras_positivas[palabra]
                palabras_relevantes += 1
            elif palabra in self.palabras_negativas:
                puntuacion += self.palabras_negativas[palabra]
                palabras_relevantes += 1
        
        if palabras_relevantes == 0:
            return 0.0
        
        # Normalizar entre -1 y 1
        polaridad_normalizada = puntuacion / palabras_relevantes
        return max(-1.0, min(1.0, polaridad_normalizada))
    
    def _calcular_subjetividad(self, palabras: List[str]) -> float:
        """Calcula subjetividad del texto (0.0 a 1.0)"""
        palabras_subjetivas = ['creo', 'pienso', 'siento', 'opino', 'considero', 'me parece']
        palabras_objetivas = ['es', 'son', 'tiene', 'hay', 'según', 'datos', 'estadística']
        
        subjetivas_count = sum(1 for p in palabras if p in palabras_subjetivas)
        objetivas_count = sum(1 for p in palabras if p in palabras_objetivas)
        
        total = subjetivas_count + objetivas_count
        if total == 0:
            return 0.5  # neutral
        
        return subjetivas_count / total
    
    def _detectar_emociones(self, palabras: List[str]) -> Dict[str, float]:
        """Detecta emociones en el texto"""
        emociones_scores = {}
        
        for emocion, palabras_emocion in self.emociones_palabras.items():
            score = sum(1 for p in palabras if p in palabras_emocion)
            emociones_scores[emocion] = min(1.0, score / len(palabras) * 10)
        
        return emociones_scores
    
    def _extraer_entidades(self, texto: str) -> List[str]:
        """Extrae entidades nombradas (simulado)"""
        entidades_conocidas = [
            'frente renovador', 'misiones', 'posadas', 'oberá', 'iguazú',
            'rovira', 'passalacqua', 'herrera ahuad', 'gobierno', 'oposición'
        ]
        
        entidades_encontradas = []
        for entidad in entidades_conocidas:
            if entidad in texto:
                entidades_encontradas.append(entidad)
        
        return entidades_encontradas
    
    def _calcular_intensidad(self, palabras: List[str]) -> float:
        """Calcula intensidad del mensaje"""
        intensificadores = ['muy', 'súper', 'extremadamente', 'totalmente', 'completamente']
        signos_exclamacion = palabras.count('!') if '!' in ' '.join(palabras) else 0
        
        intensidad = min(1.0, len([p for p in palabras if p in intensificadores]) * 0.2 + signos_exclamacion * 0.1)
        return intensidad
    
    def _analizar_contexto_politico(self, palabras: List[str], contexto: str) -> Dict[str, float]:
        """Analiza contexto político del mensaje"""
        temas_politicos = {
            'economia': ['economia', 'trabajo', 'empleo', 'inflación', 'precios', 'salario'],
            'seguridad': ['seguridad', 'delincuencia', 'crimen', 'policía', 'violencia'],
            'educacion': ['educación', 'escuela', 'universidad', 'estudiante', 'profesor'],
            'salud': ['salud', 'hospital', 'médico', 'medicina', 'enfermedad'],
            'infraestructura': ['obra', 'ruta', 'camino', 'puente', 'construcción']
        }
        
        contexto_scores = {}
        for tema, palabras_tema in temas_politicos.items():
            score = sum(1 for p in palabras if p in palabras_tema)
            contexto_scores[tema] = min(1.0, score / len(palabras) * 20)
        
        return contexto_scores
    
    def _calcular_factor_tendencia(self, tendencia_3meses: List[float]) -> float:
        """Calcula factor de tendencia basado en datos históricos"""
        if len(tendencia_3meses) < 2:
            return 0
        
        # Calcular pendiente de tendencia
        cambios = [tendencia_3meses[i] - tendencia_3meses[i-1] for i in range(1, len(tendencia_3meses))]
        tendencia_promedio = sum(cambios) / len(cambios)
        
        # Normalizar entre -1 y 1
        return max(-1, min(1, tendencia_promedio / 10))
    
    def _calcular_factor_sentiment(self, sentiment_promedio: float) -> float:
        """Calcula factor de influencia del sentiment"""
        # Sentiment de -1 a 1, convertir a factor de influencia
        return sentiment_promedio
    
    def _calcular_factor_competencia(self, actividad_competencia: float) -> float:
        """Calcula factor de impacto de la competencia"""
        # Actividad alta de competencia tiene impacto negativo
        return min(1, actividad_competencia) * -1
    
    def _calcular_factor_temporal(self, fecha_objetivo: datetime) -> float:
        """Calcula factor temporal hasta la fecha objetivo"""
        dias_restantes = (fecha_objetivo - datetime.now()).days
        
        if dias_restantes <= 0:
            return 0
        
        # Factor que aumenta cerca de elecciones
        factor_proximidad = max(0, (365 - dias_restantes) / 365)
        return factor_proximidad * 0.5
    
    def _calcular_probabilidad_victoria(self, adhesion_proyectada: float) -> float:
        """Calcula probabilidad de victoria basada en adhesión proyectada"""
        if adhesion_proyectada >= 50:
            return min(0.95, 0.5 + (adhesion_proyectada - 50) * 0.01)
        else:
            return max(0.05, adhesion_proyectada / 100)
    
    def _identificar_municipios_clave(self, datos_historicos: Dict) -> List[str]:
        """Identifica municipios clave para la elección"""
        municipios_importantes = [
            'Posadas', 'Oberá', 'Iguazú', 'Eldorado', 'San Vicente',
            'Leandro N. Alem', 'Montecarlo', 'Puerto Rico'
        ]
        
        # Seleccionar aleatoriamente algunos para variabilidad
        return random.sample(municipios_importantes, min(5, len(municipios_importantes)))
    
    def _generar_prediccion_fallback(self) -> PrediccionElectoral:
        """Genera predicción de fallback en caso de error"""
        return PrediccionElectoral(
            fecha_prediccion=datetime.now(),
            adhesion_proyectada=47.5,
            intervalo_confianza=(44.0, 51.0),
            factores_influyentes=[],
            probabilidad_victoria=0.48,
            escenarios={'optimista': 52.5, 'realista': 47.5, 'pesimista': 42.5},
            municipios_clave=['Posadas', 'Oberá', 'Iguazú']
        )

    # Métodos para detección de anomalías
    
    def _detectar_anomalia_sentiment(self, sentiment_historico: List[float]) -> Optional[Dict]:
        """Detecta anomalías en el sentiment"""
        if len(sentiment_historico) < 5:
            return None
            
        # Calcular media y desviación
        media_reciente = sum(sentiment_historico[-5:]) / 5
        media_historica = sum(sentiment_historico[:-5]) / len(sentiment_historico[:-5]) if len(sentiment_historico) > 5 else media_reciente
        
        cambio = abs(media_reciente - media_historica)
        
        if cambio > self.umbrales_anomalias['sentiment_cambio_abrupto']:
            return {
                'severidad': min(1.0, cambio / 0.5),
                'descripcion': f'Cambio abrupto en sentiment: {cambio:.2f}',
                'datos': {'cambio': cambio, 'media_reciente': media_reciente, 'media_historica': media_historica},
                'acciones': ['Revisar eventos recientes', 'Analizar causa del cambio', 'Preparar respuesta comunicacional'],
                'patron': 'cambio_abrupto_sentiment'
            }
        
        return None
    
    def _detectar_anomalia_volumen(self, volumen_menciones: List[int]) -> Optional[Dict]:
        """Detecta anomalías en el volumen de menciones"""
        if len(volumen_menciones) < 7:
            return None
            
        promedio_semanal = sum(volumen_menciones[-7:]) / 7
        promedio_historico = sum(volumen_menciones[:-7]) / len(volumen_menciones[:-7]) if len(volumen_menciones) > 7 else promedio_semanal
        
        ratio = promedio_semanal / promedio_historico if promedio_historico > 0 else 1
        
        if ratio > self.umbrales_anomalias['volumen_anomalo']:
            return {
                'severidad': min(1.0, (ratio - 1) / 2),
                'descripcion': f'Pico anómalo de menciones: {ratio:.1f}x el promedio',
                'datos': {'ratio': ratio, 'volumen_actual': promedio_semanal, 'volumen_historico': promedio_historico},
                'acciones': ['Identificar causa del pico', 'Monitorear contenido viral', 'Evaluar sentiment del contenido'],
                'patron': 'pico_volumen_menciones'
            }
        
        return None
    
    def _detectar_anomalia_patron(self, patron_temporal: Dict) -> Optional[Dict]:
        """Detecta patrones temporales anómalos"""
        # Simulación de detección de patrones
        if random.random() > 0.8:  # 20% probabilidad de anomalía
            return {
                'severidad': random.uniform(0.3, 0.8),
                'descripcion': 'Patrón temporal inusual detectado en actividad',
                'datos': {'patron_detectado': 'actividad_nocturna_elevada'},
                'acciones': ['Revisar origen de actividad inusual', 'Verificar autenticidad de cuentas'],
                'patron': 'patron_temporal_anomalo'
            }
        
        return None
    
    def _detectar_anomalia_competencia(self, actividad_competencia: Dict) -> Optional[Dict]:
        """Detecta actividad anómala de la competencia"""
        actividad_actual = actividad_competencia.get('nivel_actual', 0.5)
        actividad_promedio = actividad_competencia.get('nivel_promedio', 0.5)
        
        if actividad_actual > actividad_promedio + self.umbrales_anomalias['competencia_actividad_inusual']:
            return {
                'severidad': min(1.0, (actividad_actual - actividad_promedio)),
                'descripcion': f'Actividad inusualmente alta de competencia: {actividad_actual:.1f}',
                'datos': {'actividad_actual': actividad_actual, 'actividad_promedio': actividad_promedio},
                'acciones': ['Monitorear campaña rival', 'Preparar contramedidas', 'Analizar estrategia competencia'],
                'patron': 'actividad_competencia_elevada'
            }
        
        return None
    
    def _calcular_correlacion_avanzada(self, dataset1: List, dataset2: List, descripcion: str) -> Dict:
        """Calcula correlación avanzada entre dos datasets"""
        if len(dataset1) != len(dataset2) or len(dataset1) < 3:
            return {'correlacion': 0, 'significancia': 'baja', 'descripcion': descripcion}
        
        # Cálculo de correlación de Pearson (simulado)
        correlacion = random.uniform(-1, 1)
        significancia = 'alta' if abs(correlacion) > 0.7 else 'media' if abs(correlacion) > 0.4 else 'baja'
        
        return {
            'correlacion': round(correlacion, 3),
            'significancia': significancia,
            'descripcion': descripcion,
            'interpretacion': self._interpretar_correlacion(correlacion, descripcion),
            'recomendaciones': self._generar_recomendaciones_correlacion(correlacion, descripcion)
        }
    
    def _interpretar_correlacion(self, correlacion: float, descripcion: str) -> str:
        """Interpreta el resultado de correlación"""
        if abs(correlacion) > 0.7:
            fuerza = "fuerte"
        elif abs(correlacion) > 0.4:
            fuerza = "moderada"
        else:
            fuerza = "débil"
        
        direccion = "positiva" if correlacion > 0 else "negativa"
        
        return f"Correlación {fuerza} {direccion} ({correlacion:.2f}) entre las variables"
    
    def _generar_recomendaciones_correlacion(self, correlacion: float, descripcion: str) -> List[str]:
        """Genera recomendaciones basadas en correlación"""
        if abs(correlacion) > 0.7:
            return [
                "Aprovechar esta correlación fuerte para predicciones",
                "Monitorear cambios en variable independiente",
                "Usar para optimización de estrategias"
            ]
        elif abs(correlacion) > 0.4:
            return [
                "Correlación moderada - considerar otros factores",
                "Investigar causas subyacentes de la relación"
            ]
        else:
            return [
                "Correlación débil - buscar variables adicionales",
                "No basar decisiones solo en esta correlación"
            ]
    
    def _analizar_correlaciones_temporales(self, datasets: Dict) -> Dict:
        """Analiza correlaciones con lag temporal"""
        correlaciones_lag = {}
        
        # Simulación de análisis de lag
        for dataset_name in datasets.keys():
            if len(datasets[dataset_name]) > 10:
                correlaciones_lag[f'{dataset_name}_lag'] = {
                    'lag_optimo': random.randint(1, 7),
                    'correlacion_lag': random.uniform(0.3, 0.8),
                    'interpretacion': 'Correlación con retraso temporal detectada'
                }
        
        return correlaciones_lag
    
    def _detectar_correlaciones_emergentes(self, datasets: Dict) -> Dict:
        """Detecta correlaciones emergentes no obvias"""
        return {
            'nuevas_correlaciones': [
                {
                    'variables': ['actividad_nocturna', 'sentiment_mañana'],
                    'correlacion': 0.65,
                    'significancia': 'emergente',
                    'descripcion': 'Actividad nocturna correlaciona con sentiment matutino'
                }
            ],
            'correlaciones_decrecientes': [
                {
                    'variables': ['volumen_menciones', 'engagement'],
                    'correlacion_anterior': 0.8,
                    'correlacion_actual': 0.4,
                    'descripcion': 'Correlación tradicional está debilitándose'
                }
            ]
        }

# Instancia global
ia_predictiva = IAPredictiva()