import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, BarChart3, Target, AlertTriangle, Clock, Brain, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PredictiveAnalysis = () => {
  const [analyticsStatus, setAnalyticsStatus] = useState({});
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  useEffect(() => {
    fetchAnalyticsStatus();
  }, []);

  const fetchAnalyticsStatus = async () => {
    try {
      const response = await axios.get(`${API}/ai/predictive-analysis/status`);
      setAnalyticsStatus(response.data);
    } catch (error) {
      console.error('Error fetching analytics status:', error);
    }
  };

  const runPredictiveAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/ai/predictive-analysis`);
      setPredictions(response.data);
      setLastAnalysis(new Date().toLocaleString());
      toast.success('📊 Análisis predictivo completado');
      
      // Show key insights
      if (response.data.executive_summary?.overall_risk_level === 'high') {
        toast.error('⚠️ Riesgo alto detectado en las predicciones');
      }
      
      fetchAnalyticsStatus(); // Refresh status
    } catch (error) {
      console.error('Error running predictive analysis:', error);
      toast.error('Error ejecutando análisis predictivo');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-900 bg-opacity-30';
      case 'medium': return 'text-yellow-400 bg-yellow-900 bg-opacity-30';
      case 'low': return 'text-green-400 bg-green-900 bg-opacity-30';
      default: return 'text-gray-400 bg-gray-900 bg-opacity-30';
    }
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 0.7) return 'text-red-400';
    if (probability >= 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatProbability = (prob) => {
    return `${(prob * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp className="w-12 h-12 text-green-400 mr-3" />
          <BarChart3 className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">
          📈 Análisis Predictivo Avanzado
        </h1>
        <p className="text-gray-400 text-lg">
          Predicciones inteligentes de comportamiento, tendencias y crisis usando IA
        </p>
      </div>

      {/* System Status */}
      <div className="dami-card">
        <h2 className="text-2xl font-semibold text-white mb-6">📊 Estado del Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{analyticsStatus.active_predictions || 0}</div>
            <div className="text-sm text-gray-400">Predicciones Activas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{analyticsStatus.prediction_history_size || 0}</div>
            <div className="text-sm text-gray-400">Historial</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{analyticsStatus.supported_prediction_types?.length || 5}</div>
            <div className="text-sm text-gray-400">Tipos de Predicción</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {analyticsStatus.average_confidence ? `${(analyticsStatus.average_confidence * 100).toFixed(0)}%` : '75%'}
            </div>
            <div className="text-sm text-gray-400">Confianza Promedio</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={runPredictiveAnalysis}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-600 transition"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Analizando...
              </div>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Ejecutar Análisis Predictivo
              </>
            )}
          </button>
          
          {lastAnalysis && (
            <div className="text-sm text-gray-400">
              <Clock className="w-4 h-4 inline mr-1" />
              Último análisis: {lastAnalysis}
            </div>
          )}
        </div>
      </div>

      {/* Predictions Results */}
      {predictions && (
        <>
          {/* Executive Summary */}
          {predictions.executive_summary && (
            <div className="dami-card">
              <h2 className="text-2xl font-semibold text-white mb-6">📋 Resumen Ejecutivo</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    getRiskColor(predictions.executive_summary.overall_risk_level)
                  }`}>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {predictions.executive_summary.overall_risk_level?.toUpperCase() || 'MEDIO'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Nivel de Riesgo General</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{predictions.total_predictions || 0}</div>
                  <div className="text-xs text-gray-400">Predicciones Generadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {predictions.analysis_confidence ? `${(predictions.analysis_confidence * 100).toFixed(0)}%` : '0%'}
                  </div>
                  <div className="text-xs text-gray-400">Confianza del Análisis</div>
                </div>
              </div>

              {predictions.executive_summary.key_insights && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-green-400 mb-3">💡 Insights Clave</h3>
                  <ul className="space-y-2">
                    {predictions.executive_summary.key_insights.map((insight, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start">
                        <span className="text-green-400 mr-2">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {predictions.executive_summary.immediate_actions && (
                <div>
                  <h3 className="text-lg font-medium text-orange-400 mb-3">⚡ Acciones Inmediatas</h3>
                  <ul className="space-y-2">
                    {predictions.executive_summary.immediate_actions.map((action, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start">
                        <span className="text-orange-400 mr-2">→</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Actor Behavior Predictions */}
          {predictions.predictions?.actor_behavior && (
            <div className="dami-card">
              <h2 className="text-2xl font-semibold text-white mb-6">👥 Predicciones de Comportamiento de Actores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {predictions.predictions.actor_behavior.map((prediction, idx) => (
                  <div key={idx} className="border border-gray-600 rounded p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-white">{prediction.actor}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        getRiskColor(prediction.details?.current_status === 'roja' ? 'high' : 
                                   prediction.details?.current_status === 'naranja' ? 'medium' : 'low')
                      }`}>
                        {prediction.details?.current_status?.toUpperCase() || 'VERDE'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Probabilidad de Escalamiento:</span>
                        <span className={`font-semibold ${getProbabilityColor(prediction.escalation_probability)}`}>
                          {formatProbability(prediction.escalation_probability)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Timeframe:</span>
                        <span className="text-white">{prediction.timeframe}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confianza:</span>
                        <span className="text-white">{formatProbability(prediction.confidence)}</span>
                      </div>
                    </div>

                    {prediction.details?.predicted_actions && (
                      <div className="mt-3">
                        <span className="text-gray-400 text-xs">Acciones Predichas:</span>
                        <ul className="mt-1 space-y-1">
                          {prediction.details.predicted_actions.slice(0, 2).map((action, actionIdx) => (
                            <li key={actionIdx} className="text-xs text-gray-300 flex items-start">
                              <span className="text-blue-400 mr-1">•</span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social Trends */}
          {predictions.predictions?.social_trends && (
            <div className="dami-card">
              <h2 className="text-2xl font-semibold text-white mb-6">📱 Tendencias Sociales</h2>
              <div className="border border-gray-600 rounded p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-gray-400">Probabilidad de Cambio:</span>
                    <span className={`ml-2 font-semibold ${getProbabilityColor(predictions.predictions.social_trends.trend_change_probability)}`}>
                      {formatProbability(predictions.predictions.social_trends.trend_change_probability)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Timeframe:</span>
                    <span className="text-white ml-2">{predictions.predictions.social_trends.timeframe}</span>
                  </div>
                </div>

                {predictions.predictions.social_trends.details && (
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400">Sentiment Actual:</span>
                      <span className="text-white ml-2">
                        {(predictions.predictions.social_trends.details.current_sentiment * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    {predictions.predictions.social_trends.details.dominant_topic && (
                      <div>
                        <span className="text-gray-400">Tema Dominante:</span>
                        <span className="text-white ml-2">{predictions.predictions.social_trends.details.dominant_topic}</span>
                      </div>
                    )}

                    {predictions.predictions.social_trends.details.future_sentiment_forecast && (
                      <div>
                        <span className="text-gray-400 text-sm">Pronóstico de Sentiment (7 días):</span>
                        <div className="mt-2 flex items-center space-x-2">
                          {predictions.predictions.social_trends.details.future_sentiment_forecast.slice(0, 7).map((value, idx) => (
                            <div key={idx} className="text-center">
                              <div className={`w-6 h-12 rounded-t ${
                                value > 0.6 ? 'bg-green-500' : value > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                              }`} 
                              style={{height: `${Math.max(10, value * 48)}px`}}></div>
                              <div className="text-xs text-gray-400 mt-1">D{idx + 1}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Crisis Probability */}
          {predictions.predictions?.crisis_probability && (
            <div className="dami-card">
              <h2 className="text-2xl font-semibold text-white mb-6">⚠️ Probabilidad de Crisis</h2>
              <div className="border border-gray-600 rounded p-4">
                <div className="text-center mb-6">
                  <div className={`text-4xl font-bold ${getProbabilityColor(predictions.predictions.crisis_probability.crisis_probability)}`}>
                    {formatProbability(predictions.predictions.crisis_probability.crisis_probability)}
                  </div>
                  <div className="text-gray-400">Probabilidad de Crisis Sistémica</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Timeframe: {predictions.predictions.crisis_probability.timeframe}
                  </div>
                </div>

                {predictions.predictions.crisis_probability.details?.contributing_factors && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-red-400 mb-3">⚡ Factores Contribuyentes</h3>
                    <ul className="space-y-2">
                      {predictions.predictions.crisis_probability.details.contributing_factors.map((factor, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start">
                          <span className="text-red-400 mr-2">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {predictions.predictions.crisis_probability.details?.mitigation_recommendations && (
                  <div>
                    <h3 className="text-lg font-medium text-green-400 mb-3">🛡️ Recomendaciones de Mitigación</h3>
                    <ul className="space-y-2">
                      {predictions.predictions.crisis_probability.details.mitigation_recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start">
                          <span className="text-green-400 mr-2">→</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Section */}
      <div className="dami-card">
        <h3 className="text-lg font-medium text-green-400 mb-2">🔮 ¿Cómo Funciona el Análisis Predictivo?</h3>
        <p className="text-gray-300 leading-relaxed mb-4">
          Nuestro sistema utiliza algoritmos avanzados de machine learning para predecir eventos futuros:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-900 bg-opacity-30 border border-blue-400 rounded p-4">
            <h4 className="text-blue-400 font-semibold mb-2">👥 Comportamiento de Actores</h4>
            <p className="text-gray-300 text-sm">
              Predice escalamientos, cambios de posición y acciones futuras de actores políticos 
              basado en patrones históricos e influencia.
            </p>
          </div>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-400 rounded p-4">
            <h4 className="text-purple-400 font-semibold mb-2">📊 Tendencias Sociales</h4>
            <p className="text-gray-300 text-sm">
              Analiza sentiment público, temas dominantes y proyecta la evolución 
              del clima social en los próximos días.
            </p>
          </div>
          <div className="bg-red-900 bg-opacity-30 border border-red-400 rounded p-4">
            <h4 className="text-red-400 font-semibold mb-2">⚠️ Crisis Sistémica</h4>
            <p className="text-gray-300 text-sm">
              Evalúa múltiples indicadores para calcular la probabilidad de crisis 
              y ofrece recomendaciones de mitigación preventiva.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalysis;