import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, Play, Square, Activity, Brain, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AutonomousAgent = ({ user }) => {
  const [agentStatus, setAgentStatus] = useState({});
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    fetchAgentStatus();
  }, []);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchAgentStatus, 5000); // Refresh every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchAgentStatus = async () => {
    try {
      const response = await axios.get(`${API}/ai/autonomous-agent/status`);
      setAgentStatus(response.data);
    } catch (error) {
      console.error('Error fetching agent status:', error);
    }
  };

  const startAgent = async () => {
    if (user?.role !== 'Administrator') {
      toast.error('Solo administradores pueden iniciar el agente autónomo');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/ai/autonomous-agent/start`);
      toast.success('🤖 Agente autónomo DAMI-GPT iniciado');
      setAgentStatus(prev => ({ ...prev, active_monitoring: true, agent_state: 'monitoring' }));
      setAutoRefresh(true);
    } catch (error) {
      console.error('Error starting agent:', error);
      toast.error('Error al iniciar el agente autónomo');
    } finally {
      setLoading(false);
    }
  };

  const stopAgent = async () => {
    if (user?.role !== 'Administrator') {
      toast.error('Solo administradores pueden detener el agente autónomo');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/ai/autonomous-agent/stop`);
      toast.success('🛑 Agente autónomo detenido');
      setAgentStatus(prev => ({ ...prev, active_monitoring: false, agent_state: 'idle' }));
      setAutoRefresh(false);
    } catch (error) {
      console.error('Error stopping agent:', error);
      toast.error('Error al detener el agente autónomo');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const situationData = {
        trigger: 'manual_analysis',
        user_id: user?.username,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(`${API}/ai/autonomous-agent/analyze`, {
        situation_data: situationData
      });
      
      setAnalysisResult(response.data);
      toast.success('✅ Análisis autónomo completado');
      fetchAgentStatus(); // Refresh status
    } catch (error) {
      console.error('Error running analysis:', error);
      toast.error('Error ejecutando análisis autónomo');
    } finally {
      setLoading(false);
    }
  };

  const getStateColor = (state) => {
    switch(state) {
      case 'monitoring': return 'text-green-400 bg-green-900 bg-opacity-30';
      case 'analyzing': return 'text-blue-400 bg-blue-900 bg-opacity-30';
      case 'deciding': return 'text-yellow-400 bg-yellow-900 bg-opacity-30';
      case 'executing': return 'text-orange-400 bg-orange-900 bg-opacity-30';
      case 'learning': return 'text-purple-400 bg-purple-900 bg-opacity-30';
      case 'idle': return 'text-gray-400 bg-gray-900 bg-opacity-30';
      default: return 'text-gray-400 bg-gray-900 bg-opacity-30';
    }
  };

  const getStateIcon = (state) => {
    switch(state) {
      case 'monitoring': return <Activity className="w-4 h-4" />;
      case 'analyzing': return <Brain className="w-4 h-4" />;
      case 'deciding': return <Zap className="w-4 h-4" />;
      case 'executing': return <CheckCircle className="w-4 h-4" />;
      case 'learning': return <Bot className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Bot className="w-12 h-12 text-green-400 mr-3" />
          <Brain className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">
          🤖 DAMI-GPT Agente Autónomo
        </h1>
        <p className="text-gray-400 text-lg">
          Sistema de inteligencia artificial que piensa, analiza y decide de forma independiente
        </p>
      </div>

      {/* Agent Status */}
      <div className="dami-card">
        <h2 className="text-2xl font-semibold text-white mb-6">📊 Estado del Agente</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              getStateColor(agentStatus.agent_state)
            }`}>
              {getStateIcon(agentStatus.agent_state)}
              <span className="ml-2">{agentStatus.agent_state || 'idle'}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">Estado Actual</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{agentStatus.decisions_made || 0}</div>
            <div className="text-xs text-gray-400">Decisiones Tomadas</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{agentStatus.memory_items || 0}</div>
            <div className="text-xs text-gray-400">Items en Memoria</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              agentStatus.active_monitoring ? 'text-green-400' : 'text-red-400'
            }`}>
              {agentStatus.active_monitoring ? 'ACTIVO' : 'INACTIVO'}
            </div>
            <div className="text-xs text-gray-400">Monitoreo</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-4">
          {!agentStatus.active_monitoring ? (
            <button
              onClick={startAgent}
              disabled={loading || user?.role !== 'Administrator'}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              <Play className="w-4 h-4 mr-2" />
              Iniciar Agente
            </button>
          ) : (
            <button
              onClick={stopAgent}
              disabled={loading || user?.role !== 'Administrator'}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              <Square className="w-4 h-4 mr-2" />
              Detener Agente
            </button>
          )}
          
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-600 transition"
          >
            <Brain className="w-4 h-4 mr-2" />
            Ejecutar Análisis
          </button>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center px-4 py-2 rounded transition ${
              autoRefresh 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
            }`}
          >
            <Activity className="w-4 h-4 mr-2" />
            Auto-Actualizar
          </button>
        </div>

        {user?.role !== 'Administrator' && (
          <div className="mt-4 p-3 bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded">
            <p className="text-yellow-400 text-sm">
              ⚠️ Solo los administradores pueden controlar el agente autónomo
            </p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="dami-card">
          <h2 className="text-2xl font-semibold text-white mb-6">🧠 Resultado del Análisis Autónomo</h2>
          
          <div className="space-y-4">
            {/* Situation Assessment */}
            {analysisResult.situation_assessment && (
              <div className="border border-gray-600 rounded p-4">
                <h3 className="text-lg font-medium text-green-400 mb-3">Evaluación de Situación</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Tipo de Situación:</span>
                    <span className="text-white ml-2">{analysisResult.situation_assessment.situation_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Confianza:</span>
                    <span className="text-white ml-2">{(analysisResult.situation_assessment.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                {analysisResult.situation_assessment.conclusions && (
                  <div className="mt-3">
                    <span className="text-gray-400 text-sm">Conclusiones:</span>
                    <ul className="mt-1 space-y-1">
                      {analysisResult.situation_assessment.conclusions.map((conclusion, idx) => (
                        <li key={idx} className="text-sm text-gray-300 flex items-start">
                          <span className="text-green-400 mr-1">•</span>
                          {conclusion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Autonomous Decision */}
            {analysisResult.autonomous_decision && (
              <div className="border border-gray-600 rounded p-4">
                <h3 className="text-lg font-medium text-blue-400 mb-3">Decisión Autónoma</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-400">Tipo de Decisión:</span>
                    <span className="text-white ml-2">{analysisResult.autonomous_decision.decision_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Razonamiento:</span>
                    <p className="text-gray-300 mt-1 text-sm">{analysisResult.autonomous_decision.reasoning}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Confianza:</span>
                    <span className="text-white ml-2">{(analysisResult.autonomous_decision.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                {analysisResult.autonomous_decision.actions && (
                  <div className="mt-3">
                    <span className="text-gray-400 text-sm">Acciones Recomendadas:</span>
                    <div className="mt-2 space-y-2">
                      {analysisResult.autonomous_decision.actions.map((action, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-800 rounded p-2">
                          <span className="text-sm text-gray-300">{action.action}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            action.priority === 'high' ? 'bg-red-900 text-red-400' :
                            action.priority === 'medium' ? 'bg-yellow-900 text-yellow-400' :
                            'bg-green-900 text-green-400'
                          }`}>
                            {action.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations && (
              <div className="border border-gray-600 rounded p-4">
                <h3 className="text-lg font-medium text-purple-400 mb-3">Recomendaciones del Sistema</h3>
                <ul className="space-y-2">
                  {analysisResult.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-gray-300 flex items-start">
                      <span className="text-purple-400 mr-2">💡</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="dami-card">
        <h3 className="text-lg font-medium text-green-400 mb-2">🧠 ¿Qué es DAMI-GPT?</h3>
        <p className="text-gray-300 leading-relaxed mb-4">
          DAMI-GPT es un agente de inteligencia artificial autónomo que puede:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-900 bg-opacity-30 border border-blue-400 rounded p-4">
            <h4 className="text-blue-400 font-semibold mb-2">🎯 Análisis Autónomo</h4>
            <p className="text-gray-300 text-sm">
              Analiza situaciones complejas, identifica patrones y toma decisiones 
              estratégicas basadas en datos del sistema en tiempo real.
            </p>
          </div>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-400 rounded p-4">
            <h4 className="text-purple-400 font-semibold mb-2">🚀 Respuesta Proactiva</h4>
            <p className="text-gray-300 text-sm">
              Genera recomendaciones tácticas, alertas inteligentes y planes de acción 
              para responder a situaciones críticas de forma autónoma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutonomousAgent;