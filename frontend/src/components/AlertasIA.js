import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertTriangle, 
  Brain, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Zap,
  Target,
  MessageSquare,
  Filter,
  RefreshCw,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AlertasIA = ({ user }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPriority, setFilterPriority] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [recommendationsRes, alertsRes] = await Promise.all([
        axios.get(`${API}/recommendations`),
        axios.get(`${API}/alerts`)
      ]);
      
      setRecommendations(recommendationsRes.data);
      setAlerts(alertsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching IA data:', error);
      toast.error('Error al cargar recomendaciones de IA');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Recomendaciones actualizadas');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white border-red-400';
      case 'high': return 'bg-orange-500 text-white border-orange-400';
      case 'medium': return 'bg-yellow-500 text-black border-yellow-400';
      case 'low': return 'bg-green-500 text-black border-green-400';
      default: return 'bg-gray-500 text-white border-gray-400';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'critical': return 'Crítica';
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return <Zap className="w-5 h-5" />;
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <TrendingUp className="w-5 h-5" />;
      case 'low': return <Target className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const filteredRecommendations = recommendations.filter(rec => 
    filterPriority === 'all' || rec.priority === filterPriority
  );

  const executeRecommendation = async (recommendationId) => {
    if (user?.role !== 'administrator' && user?.role !== 'analyst') {
      toast.error('Permisos insuficientes para ejecutar recomendaciones');
      return;
    }
    
    // Simulate execution
    toast.success('Recomendación marcada para ejecución');
    
    // Update local state
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recommendationId 
          ? { ...rec, is_executed: true }
          : rec
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner mr-2"></div>
        <span className="text-green-400">Cargando sistema de IA táctica...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Brain className="w-8 h-8 text-green-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">🔔 IA Táctica DAMI</h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="dami-button-secondary flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
        <p className="text-gray-400">
          Sistema de inteligencia artificial para recomendaciones tácticas y análisis predictivo
        </p>
      </div>

      {/* Stats & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
          <div className="dami-card text-center">
            <div className="text-2xl font-bold text-red-400">
              {recommendations.filter(r => r.priority === 'critical').length}
            </div>
            <div className="text-sm text-gray-400 mt-1">Críticas</div>
          </div>
          <div className="dami-card text-center">
            <div className="text-2xl font-bold text-orange-400">
              {recommendations.filter(r => r.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-400 mt-1">Alta Prioridad</div>
          </div>
          <div className="dami-card text-center">
            <div className="text-2xl font-bold text-green-400">
              {recommendations.filter(r => r.is_executed).length}
            </div>
            <div className="text-sm text-gray-400 mt-1">Ejecutadas</div>
          </div>
          <div className="dami-card text-center">
            <div className="text-2xl font-bold text-blue-400">
              {recommendations.length}
            </div>
            <div className="text-sm text-gray-400 mt-1">Total</div>
          </div>
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="dami-input pl-10 pr-8"
          >
            <option value="all">Todas las prioridades</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>
      </div>

      {/* Main Recommendations Section */}
      <div className="dami-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Recomendaciones Activas</h2>
          <div className="flex items-center text-sm text-gray-400">
            <Brain className="w-4 h-4 mr-1" />
            IA Táctica Operativa
          </div>
        </div>

        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <div 
              key={recommendation.id} 
              className={`border-l-4 p-4 bg-gray-700 bg-opacity-50 rounded-r-lg transition-all duration-200 hover:bg-gray-700 cursor-pointer ${
                recommendation.priority === 'critical' ? 'border-red-400' :
                recommendation.priority === 'high' ? 'border-orange-400' :
                recommendation.priority === 'medium' ? 'border-yellow-400' :
                'border-green-400'
              }`}
              onClick={() => setSelectedRecommendation(recommendation)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center mb-2">
                    <div className={`p-2 rounded-lg mr-3 ${
                      recommendation.priority === 'critical' ? 'bg-red-500 bg-opacity-20' :
                      recommendation.priority === 'high' ? 'bg-orange-500 bg-opacity-20' :
                      recommendation.priority === 'medium' ? 'bg-yellow-500 bg-opacity-20' :
                      'bg-green-500 bg-opacity-20'
                    }`}>
                      {getPriorityIcon(recommendation.priority)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white capitalize">
                        {recommendation.type.replace('_', ' ')}
                      </h3>
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTimeAgo(recommendation.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white mb-3 leading-relaxed">
                    {recommendation.description}
                  </p>

                  {/* Actions Suggested */}
                  {recommendation.actions_suggested && recommendation.actions_suggested.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-300 mb-2 block">
                        Acciones Sugeridas:
                      </span>
                      <ul className="space-y-1">
                        {recommendation.actions_suggested.map((action, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-400">
                            <div className="w-1 h-1 bg-green-400 rounded-full mr-2"></div>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  {/* Priority Badge */}
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    recommendation.priority === 'critical' ? 'bg-red-500 bg-opacity-20 text-red-400 border-red-400' :
                    recommendation.priority === 'high' ? 'bg-orange-500 bg-opacity-20 text-orange-400 border-orange-400' :
                    recommendation.priority === 'medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-400' :
                    'bg-green-500 bg-opacity-20 text-green-400 border-green-400'
                  }`}>
                    {getPriorityLabel(recommendation.priority)}
                  </div>

                  {/* Status */}
                  {recommendation.is_executed ? (
                    <div className="flex items-center text-green-400 text-xs">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Ejecutada
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        executeRecommendation(recommendation.id);
                      }}
                      className="dami-button text-xs px-3 py-1"
                      disabled={user?.role === 'operator'}
                    >
                      Ejecutar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No hay recomendaciones disponibles
            </h3>
            <p className="text-gray-500">
              {filterPriority !== 'all' 
                ? 'No hay recomendaciones con el filtro seleccionado' 
                : 'El sistema de IA no ha generado nuevas recomendaciones'
              }
            </p>
          </div>
        )}
      </div>

      {/* Default Tactical Recommendations */}
      <div className="dami-card">
        <h3 className="text-xl font-semibold text-white mb-4">
          Recomendaciones Tácticas Estándar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <MessageSquare className="w-5 h-5 text-green-400 mr-2" />
              <span className="font-medium text-white">Respuesta Emocional</span>
            </div>
            <p className="text-sm text-gray-400">
              Responder con refuerzo emocional en zona sur
            </p>
          </div>
          
          <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-green-400 mr-2" />
              <span className="font-medium text-white">Spot Radial</span>
            </div>
            <p className="text-sm text-gray-400">
              Emitir spot radial breve de 30 seg con voz emocional
            </p>
          </div>
          
          <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Eye className="w-5 h-5 text-green-400 mr-2" />
              <span className="font-medium text-white">Desmentida Visual</span>
            </div>
            <p className="text-sm text-gray-400">
              Publicar desmentida visual en redes sociales
            </p>
          </div>
        </div>
      </div>

      {/* Recommendation Detail Modal */}
      {selectedRecommendation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white capitalize">
                {selectedRecommendation.type.replace('_', ' ')}
              </h2>
              <button 
                onClick={() => setSelectedRecommendation(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Prioridad</span>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border mt-1 ${
                    selectedRecommendation.priority === 'critical' ? 'bg-red-500 bg-opacity-20 text-red-400 border-red-400' :
                    selectedRecommendation.priority === 'high' ? 'bg-orange-500 bg-opacity-20 text-orange-400 border-orange-400' :
                    selectedRecommendation.priority === 'medium' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-400' :
                    'bg-green-500 bg-opacity-20 text-green-400 border-green-400'
                  }`}>
                    {getPriorityLabel(selectedRecommendation.priority)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Estado</span>
                  <p className={`font-semibold mt-1 ${selectedRecommendation.is_executed ? 'text-green-400' : 'text-yellow-400'}`}>
                    {selectedRecommendation.is_executed ? 'Ejecutada' : 'Pendiente'}
                  </p>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-400">Descripción Completa</span>
                <p className="text-white mt-1 leading-relaxed">{selectedRecommendation.description}</p>
              </div>
              
              {selectedRecommendation.actions_suggested && selectedRecommendation.actions_suggested.length > 0 && (
                <div>
                  <span className="text-sm text-gray-400">Acciones Detalladas</span>
                  <ul className="mt-2 space-y-2">
                    {selectedRecommendation.actions_suggested.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-white">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <span className="text-sm text-gray-400">Contexto</span>
                <div className="mt-1 bg-gray-700 bg-opacity-50 p-3 rounded">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(selectedRecommendation.context, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertasIA;