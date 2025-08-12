import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Heart, Brain, Users, TrendingUp, User, Zap, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EmotionalIntelligence = () => {
  const [systemStatus, setSystemStatus] = useState({});
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get(`${API}/ai/emotional-intelligence/status`);
      setSystemStatus(response.data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const runEmotionalAnalysis = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/ai/emotional-intelligence`);
      setAnalysisResults(response.data);
      setLastAnalysis(new Date().toLocaleString());
      toast.success('🧠 Análisis emocional completado');
      
      // Show key insights
      const collectiveRisk = response.data.collective_emotional_analysis?.social_risk_assessment?.overall_social_risk;
      if (collectiveRisk > 0.7) {
        toast.error('⚠️ Alto riesgo social detectado');
      }
      
      fetchSystemStatus(); // Refresh status
    } catch (error) {
      console.error('Error running emotional analysis:', error);
      toast.error('Error ejecutando análisis emocional');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    if (typeof riskLevel === 'number') {
      if (riskLevel >= 0.7) return 'text-red-400 bg-red-900 bg-opacity-30';
      if (riskLevel >= 0.4) return 'text-yellow-400 bg-yellow-900 bg-opacity-30';
      return 'text-green-400 bg-green-900 bg-opacity-30';
    }
    
    switch(riskLevel?.toLowerCase()) {
      case 'high': return 'text-red-400 bg-red-900 bg-opacity-30';
      case 'medium': return 'text-yellow-400 bg-yellow-900 bg-opacity-30';
      case 'low': return 'text-green-400 bg-green-900 bg-opacity-30';
      default: return 'text-gray-400 bg-gray-900 bg-opacity-30';
    }
  };

  const getEmotionColor = (emotion) => {
    const emotionColors = {
      'anger': 'text-red-400',
      'fear': 'text-orange-400',
      'joy': 'text-green-400',
      'sadness': 'text-blue-400',
      'surprise': 'text-purple-400',
      'disgust': 'text-gray-400',
      'neutral': 'text-gray-300'
    };
    return emotionColors[emotion] || 'text-gray-300';
  };

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getEmotionIcon = (emotion) => {
    const icons = {
      'anger': '😡',
      'fear': '😰',
      'joy': '😊',
      'sadness': '😢',
      'surprise': '😲',
      'disgust': '🤢',
      'neutral': '😐'
    };
    return icons[emotion] || '🤔';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-12 h-12 text-green-400 mr-3" />
          <Brain className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">
          🧠 Inteligencia Emocional y Psicológica
        </h1>
        <p className="text-gray-400 text-lg">
          Análisis profundo de patrones emocionales, psicológicos y comportamentales
        </p>
      </div>

      {/* System Status */}
      <div className="dami-card">
        <h2 className="text-2xl font-semibold text-white mb-6">📊 Estado del Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{systemStatus.supported_emotions || 7}</div>
            <div className="text-sm text-gray-400">Emociones Detectables</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{systemStatus.psychological_profiles || 6}</div>
            <div className="text-sm text-gray-400">Perfiles Psicológicos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{systemStatus.cached_analyses || 0}</div>
            <div className="text-sm text-gray-400">Análisis en Cache</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              systemStatus.system_status === 'operational' ? 'text-green-400' : 'text-red-400'
            }`}>
              {systemStatus.system_status === 'operational' ? 'ACTIVO' : 'INACTIVO'}
            </div>
            <div className="text-sm text-gray-400">Estado</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={runEmotionalAnalysis}
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
                <Heart className="w-4 h-4 mr-2" />
                Ejecutar Análisis Emocional
              </>
            )}
          </button>
          
          {lastAnalysis && (
            <div className="text-sm text-gray-400">
              Último análisis: {lastAnalysis}
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <>
          {/* Actor Psychological Profiles */}
          {analysisResults.actor_psychological_profiles && (
            <div className="dami-card">
              <h2 className="text-2xl font-semibold text-white mb-6">👤 Perfiles Psicológicos de Actores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(analysisResults.actor_psychological_profiles).map(([actorName, profile]) => (
                  <div key={actorName} className="border border-gray-600 rounded p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        {actorName}
                      </h3>
                      <span className="text-xs text-gray-400">
                        Confianza: {formatPercentage(profile.analysis_confidence)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-400 text-sm">Perfil Principal:</span>
                        <span className="text-green-400 ml-2 font-medium">
                          {profile.primary_psychological_profile}
                        </span>
                      </div>

                      {profile.emotional_patterns?.dominant_emotions?.length > 0 && (
                        <div>
                          <span className="text-gray-400 text-sm">Emociones Dominantes:</span>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {profile.emotional_patterns.dominant_emotions.slice(0, 3).map((emotion, idx) => (
                              <span key={idx} className={`px-2 py-1 rounded text-xs ${getEmotionColor(emotion.primary_emotion)}`}>
                                {getEmotionIcon(emotion.primary_emotion)} {emotion.primary_emotion}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {profile.risk_assessment?.overall_risk && (
                        <div>
                          <span className="text-gray-400 text-sm">Riesgo General:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                            getRiskColor(profile.risk_assessment.overall_risk)
                          }`}>
                            {formatPercentage(profile.risk_assessment.overall_risk)}
                          </span>
                        </div>
                      )}

                      {profile.recommendations?.length > 0 && (
                        <div>
                          <span className="text-gray-400 text-sm">Recomendaciones:</span>
                          <ul className="mt-1 space-y-1">
                            {profile.recommendations.slice(0, 2).map((rec, idx) => (
                              <li key={idx} className="text-xs text-gray-300 flex items-start">
                                <span className="text-blue-400 mr-1">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collective Emotional Analysis */}
          {analysisResults.collective_emotional_analysis && (
            <div className="dami-card">
              <h2 className="text-2xl font-semibold text-white mb-6">👥 Análisis Emocional Colectivo</h2>

              {/* Collective Metrics */}
              {analysisResults.collective_emotional_analysis.collective_metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-lg font-bold text-blue-400">
                      {formatPercentage(analysisResults.collective_emotional_analysis.collective_metrics.collective_valence)}
                    </div>
                    <div className="text-xs text-gray-400">Valencia Colectiva</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-lg font-bold text-purple-400">
                      {formatPercentage(analysisResults.collective_emotional_analysis.collective_metrics.collective_arousal)}
                    </div>
                    <div className="text-xs text-gray-400">Activación</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-lg font-bold text-orange-400">
                      {formatPercentage(analysisResults.collective_emotional_analysis.collective_metrics.emotional_volatility)}
                    </div>
                    <div className="text-xs text-gray-400">Volatilidad</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 rounded">
                    <div className="text-lg font-bold text-green-400">
                      {analysisResults.collective_emotional_analysis.collective_metrics.sample_size}
                    </div>
                    <div className="text-xs text-gray-400">Tamaño Muestra</div>
                  </div>
                </div>
              )}

              {/* Dominant Emotions */}
              {analysisResults.collective_emotional_analysis.dominant_emotions && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-green-400 mb-3">🎭 Emociones Dominantes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysisResults.collective_emotional_analysis.dominant_emotions.map((emotion, idx) => (
                      <div key={idx} className="border border-gray-600 rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-lg ${getEmotionColor(emotion.emotion)}`}>
                            {getEmotionIcon(emotion.emotion)} {emotion.emotion}
                          </span>
                          <span className="text-sm font-semibold text-white">
                            {formatPercentage(emotion.percentage)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Intensidad: {formatPercentage(emotion.average_intensity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Risk Assessment */}
              {analysisResults.collective_emotional_analysis.social_risk_assessment && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-red-400 mb-3">⚠️ Evaluación de Riesgo Social</h3>
                  <div className="border border-gray-600 rounded p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getRiskColor(analysisResults.collective_emotional_analysis.social_risk_assessment.overall_social_risk).split(' ')[0]}`}>
                          {formatPercentage(analysisResults.collective_emotional_analysis.social_risk_assessment.overall_social_risk)}
                        </div>
                        <div className="text-xs text-gray-400">Riesgo General</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-400">
                          {formatPercentage(analysisResults.collective_emotional_analysis.social_risk_assessment.emotion_based_risk)}
                        </div>
                        <div className="text-xs text-gray-400">Riesgo Emocional</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-400">
                          {formatPercentage(analysisResults.collective_emotional_analysis.social_risk_assessment.valence_risk)}
                        </div>
                        <div className="text-xs text-gray-400">Riesgo Valencia</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">
                          {formatPercentage(analysisResults.collective_emotional_analysis.social_risk_assessment.volatility_risk)}
                        </div>
                        <div className="text-xs text-gray-400">Riesgo Volatilidad</div>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        getRiskColor(analysisResults.collective_emotional_analysis.social_risk_assessment.risk_level)
                      }`}>
                        NIVEL: {analysisResults.collective_emotional_analysis.social_risk_assessment.risk_level?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {analysisResults.collective_emotional_analysis.recommendations && (
                <div>
                  <h3 className="text-lg font-medium text-purple-400 mb-3">💡 Recomendaciones Colectivas</h3>
                  <ul className="space-y-2">
                    {analysisResults.collective_emotional_analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start">
                        <span className="text-purple-400 mr-2">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Integrated Recommendations */}
          {analysisResults.integrated_recommendations && (
            <div className="dami-card">
              <h2 className="text-2xl font-semibold text-white mb-6">🎯 Recomendaciones Integradas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResults.integrated_recommendations.map((rec, idx) => (
                  <div key={idx} className="border border-gray-600 rounded p-3 flex items-start">
                    <Zap className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Info Section */}
      <div className="dami-card">
        <h3 className="text-lg font-medium text-green-400 mb-2">🧠 ¿Cómo Funciona la Inteligencia Emocional?</h3>
        <p className="text-gray-300 leading-relaxed mb-4">
          Nuestro sistema analiza patrones emocionales y psicológicos para proporcionar insights profundos:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-900 bg-opacity-30 border border-blue-400 rounded p-4">
            <h4 className="text-blue-400 font-semibold mb-2">👤 Perfiles Individuales</h4>
            <p className="text-gray-300 text-sm">
              Analiza patrones de lenguaje, estilos de comunicación y rasgos psicológicos 
              para crear perfiles detallados de actores.
            </p>
          </div>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-400 rounded p-4">
            <h4 className="text-purple-400 font-semibold mb-2">👥 Análisis Colectivo</h4>
            <p className="text-gray-300 text-sm">
              Evalúa el clima emocional de grupos, detecta contagio emocional y 
              mide la estabilidad social en tiempo real.
            </p>
          </div>
          <div className="bg-green-900 bg-opacity-30 border border-green-400 rounded p-4">
            <h4 className="text-green-400 font-semibold mb-2">⚠️ Evaluación de Riesgos</h4>
            <p className="text-gray-300 text-sm">
              Identifica riesgos psicológicos, tendencias autoritarias, polarización 
              y inestabilidad emocional para prevenir crisis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionalIntelligence;