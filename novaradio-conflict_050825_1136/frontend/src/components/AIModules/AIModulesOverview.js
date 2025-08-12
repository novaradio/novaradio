import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, Shield, Bot, TrendingUp, Heart, Zap, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AIModulesOverview = () => {
  const [overview, setOverview] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/ai/modules/overview`);
      setOverview(response.data);
    } catch (error) {
      console.error('Error fetching AI modules overview:', error);
      toast.error('Error cargando resumen de módulos IA');
    } finally {
      setLoading(false);
    }
  };

  const getModuleIcon = (moduleKey) => {
    const icons = {
      deepfake_detection: Shield,
      autonomous_agent: Bot,
      predictive_analysis: TrendingUp,
      emotional_intelligence: Heart
    };
    return icons[moduleKey] || Brain;
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
      case 'operational':
      case 'monitoring':
        return 'text-green-400 bg-green-900 bg-opacity-30';
      case 'analyzing':
      case 'deciding':
        return 'text-blue-400 bg-blue-900 bg-opacity-30';
      case 'idle':
        return 'text-gray-400 bg-gray-900 bg-opacity-30';
      default:
        return 'text-orange-400 bg-orange-900 bg-opacity-30';
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
      case 'operational':
      case 'monitoring':
        return <CheckCircle className="w-4 h-4" />;
      case 'idle':
        return <Activity className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando módulos IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Brain className="w-12 h-12 text-green-400 mr-3" />
          <Zap className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">
          🤖 Módulos de IA Avanzada
        </h1>
        <p className="text-gray-400 text-lg">
          Sistema integral de inteligencia artificial para análisis y decisiones estratégicas
        </p>
      </div>

      {/* System Status Summary */}
      <div className="dami-card">
        <h2 className="text-2xl font-semibold text-white mb-6">📊 Estado General del Sistema</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{overview.total_modules || 4}</div>
            <div className="text-sm text-gray-400">Módulos Disponibles</div>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              overview.ai_modules_status === 'operational' ? 'text-green-400' : 'text-red-400'
            }`}>
              {overview.ai_modules_status === 'operational' ? 'ACTIVO' : 'INACTIVO'}
            </div>
            <div className="text-sm text-gray-400">Estado Sistema</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">
              {Object.keys(overview.modules || {}).filter(key => 
                overview.modules[key].status === 'active' || 
                overview.modules[key].status === 'operational' ||
                overview.modules[key].status === 'monitoring'
              ).length}
            </div>
            <div className="text-sm text-gray-400">Módulos Activos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {overview.timestamp ? new Date(overview.timestamp).toLocaleTimeString() : '--:--'}
            </div>
            <div className="text-sm text-gray-400">Última Actualización</div>
          </div>
        </div>

        <button
          onClick={fetchOverview}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          🔄 Actualizar Estado
        </button>
      </div>

      {/* AI Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(overview.modules || {}).map(([moduleKey, moduleData]) => {
          const IconComponent = getModuleIcon(moduleKey);
          
          return (
            <div key={moduleKey} className="dami-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <IconComponent className="w-8 h-8 text-green-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">{moduleData.name}</h3>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  getStatusColor(moduleData.status)
                }`}>
                  {getStatusIcon(moduleData.status)}
                  <span className="ml-2">{moduleData.status?.toUpperCase() || 'UNKNOWN'}</span>
                </span>
              </div>

              <div className="space-y-3">
                {/* Module-specific metrics */}
                {moduleKey === 'deepfake_detection' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Verificaciones:</span>
                      <span className="text-white ml-2">{moduleData.verifications || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Precisión:</span>
                      <span className="text-green-400 ml-2">
                        {moduleData.accuracy ? `${(moduleData.accuracy * 100).toFixed(1)}%` : '89%'}
                      </span>
                    </div>
                  </div>
                )}

                {moduleKey === 'autonomous_agent' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Decisiones:</span>
                      <span className="text-white ml-2">{moduleData.decisions_made || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Monitoreo:</span>
                      <span className={`ml-2 ${moduleData.monitoring ? 'text-green-400' : 'text-red-400'}`}>
                        {moduleData.monitoring ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                  </div>
                )}

                {moduleKey === 'predictive_analysis' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Predicciones:</span>
                      <span className="text-white ml-2">{moduleData.active_predictions || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Tipos:</span>
                      <span className="text-white ml-2">{moduleData.prediction_types || 5}</span>
                    </div>
                  </div>
                )}

                {moduleKey === 'emotional_intelligence' && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Emociones:</span>
                      <span className="text-white ml-2">{moduleData.supported_emotions || 7}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Método:</span>
                      <span className="text-white ml-2">
                        {moduleData.analysis_method === 'heuristic' ? 'Heurístico' : 'Avanzado'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Module description */}
                <div className="pt-2 border-t border-gray-600">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {getModuleDescription(moduleKey)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Integration Info */}
      <div className="dami-card">
        <h3 className="text-lg font-medium text-green-400 mb-4">🔗 Integración de Módulos IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-2">✨ Capacidades Integradas</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Detección automática de deepfakes y desinformación</li>
              <li>• Análisis autónomo de situaciones complejas</li>
              <li>• Predicciones de comportamiento y crisis</li>
              <li>• Evaluación psicológica y emocional continua</li>
              <li>• Recomendaciones tácticas inteligentes</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">🎯 Ventajas del Sistema</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Procesamiento en tiempo real</li>
              <li>• Algoritmos optimizados sin dependencias pesadas</li>
              <li>• Interfaz intuitiva y dashboards especializados</li>
              <li>• Integración completa con datos del sistema</li>
              <li>• Escalabilidad y rendimiento optimizado</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dami-card">
        <h3 className="text-lg font-medium text-blue-400 mb-4">⚡ Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => window.location.href = '#/ai/deepfake-detection'}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded transition text-center"
          >
            <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-sm text-gray-300">Verificar Contenido</div>
          </button>
          <button 
            onClick={() => window.location.href = '#/ai/autonomous-agent'}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded transition text-center"
          >
            <Bot className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-sm text-gray-300">Agente Autónomo</div>
          </button>
          <button 
            onClick={() => window.location.href = '#/ai/predictive-analysis'}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded transition text-center"
          >
            <TrendingUp className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-sm text-gray-300">Análisis Predictivo</div>
          </button>
          <button 
            onClick={() => window.location.href = '#/ai/emotional-intelligence'}
            className="p-4 bg-gray-800 hover:bg-gray-700 rounded transition text-center"
          >
            <Heart className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <div className="text-sm text-gray-300">Inteligencia Emocional</div>
          </button>
        </div>
      </div>
    </div>
  );
};

const getModuleDescription = (moduleKey) => {
  const descriptions = {
    deepfake_detection: "Sistema avanzado de verificación de contenido que detecta deepfakes, manipulaciones digitales y desinformación utilizando análisis heurístico y patrones de comportamiento.",
    autonomous_agent: "Agente de IA completamente autónomo que piensa, analiza situaciones complejas y toma decisiones estratégicas basadas en datos del sistema en tiempo real.",
    predictive_analysis: "Motor de predicciones que analiza tendencias, comportamientos de actores y probabilidades de crisis utilizando algoritmos de machine learning simplificados.",
    emotional_intelligence: "Sistema de análisis psicológico y emocional que evalúa patrones de comportamiento, riesgos psicológicos y estados emocionales colectivos."
  };
  return descriptions[moduleKey] || "Módulo de IA especializado para análisis avanzado.";
};

export default AIModulesOverview;