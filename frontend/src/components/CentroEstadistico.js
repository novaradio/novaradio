import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, AlertTriangle, Activity, RefreshCw, Users, MessageSquare, Hash, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CentroEstadistico = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedTab, setSelectedTab] = useState('resumen');

  useEffect(() => {
    cargarEstadisticas();
    // Actualizar cada 5 minutos
    const interval = setInterval(cargarEstadisticas, 300000);
    return () => clearInterval(interval);
  }, []);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/centro-estadistico/completo`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEstadisticas(response.data.data);
      setLastUpdate(new Date().toLocaleTimeString());
      
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      toast.error('Error al cargar estadísticas del centro');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'Positivo': return 'text-green-400';
      case 'Negativo': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch(sentiment) {
      case 'Positivo': return '📈';
      case 'Negativo': return '📉';
      default: return '📊';
    }
  };

  const getAlertIcon = (severidad) => {
    switch(severidad) {
      case 'alta': return '🔴';
      case 'media': return '🟠';
      default: return '🟡';
    }
  };

  if (loading && !estadisticas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando estadísticas del centro...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <BarChart3 className="w-12 h-12 text-green-400 mr-3" />
          <TrendingUp className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">
          📊 Centro Estadístico
        </h1>
        <p className="text-gray-400 text-lg">
          Análisis de redes sociales - Frente Renovador de la Concordia Social
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="dami-card mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            {[
              { id: 'resumen', label: 'Resumen General', icon: Activity },
              { id: 'redes', label: 'Por Red Social', icon: MessageSquare },
              { id: 'tendencias', label: 'Tendencias', icon: TrendingUp },
              { id: 'alertas', label: 'Alertas', icon: AlertTriangle }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition ${
                    selectedTab === tab.id 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={cargarEstadisticas}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            {lastUpdate && (
              <span className="text-sm text-gray-400">
                <Clock className="w-4 h-4 inline mr-1" />
                {lastUpdate}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resumen General */}
      {selectedTab === 'resumen' && estadisticas && (
        <div className="space-y-6">
          {/* Métricas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="dami-card text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {estadisticas.estadisticas_generales.resumen_general.total_menciones.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Menciones</div>
            </div>
            
            <div className="dami-card text-center">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-2xl font-bold text-green-400">
                {estadisticas.estadisticas_generales.resumen_general.menciones_positivas.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Menciones Positivas</div>
            </div>
            
            <div className="dami-card text-center">
              <div className="text-3xl mb-2">📉</div>
              <div className="text-2xl font-bold text-red-400">
                {estadisticas.estadisticas_generales.resumen_general.menciones_negativas.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Menciones Negativas</div>
            </div>
            
            <div className="dami-card text-center">
              <Activity className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {estadisticas.estadisticas_generales.resumen_general.engagement_rate}%
              </div>
              <div className="text-sm text-gray-400">Engagement Rate</div>
            </div>
          </div>

          {/* Métricas Clave */}
          <div className="dami-card">
            <h2 className="text-2xl font-semibold text-white mb-6">🎯 Métricas Clave</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-lg font-semibold text-white mb-1">
                  {estadisticas.estadisticas_generales.metricas_clave.crecimiento_semanal}%
                </div>
                <div className="text-sm text-gray-400">Crecimiento Semanal</div>
              </div>
              
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-lg font-semibold text-white mb-1">
                  {estadisticas.estadisticas_generales.metricas_clave.indice_influencia}
                </div>
                <div className="text-sm text-gray-400">Índice de Influencia</div>
              </div>
              
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className="text-lg font-semibold text-white mb-1">
                  {estadisticas.estadisticas_generales.metricas_clave.score_reputacion}
                </div>
                <div className="text-sm text-gray-400">Score Reputación</div>
              </div>
              
              <div className="text-center p-4 bg-gray-800 rounded-lg">
                <div className={`text-lg font-semibold mb-1 ${
                  estadisticas.estadisticas_generales.metricas_clave.nivel_crisis === 'Bajo' ? 'text-green-400' :
                  estadisticas.estadisticas_generales.metricas_clave.nivel_crisis === 'Medio' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {estadisticas.estadisticas_generales.metricas_clave.nivel_crisis}
                </div>
                <div className="text-sm text-gray-400">Nivel de Crisis</div>
              </div>
            </div>
          </div>

          {/* Análisis Temático */}
          <div className="dami-card">
            <h2 className="text-2xl font-semibold text-white mb-6">📋 Análisis Temático</h2>
            <div className="space-y-4">
              {estadisticas.analisis_tematico.slice(0, 5).map((tema, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-white">{tema.tema}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      Palabras clave: {tema.palabras_clave.join(', ')}
                    </div>
                  </div>
                  <div className="text-center mr-4">
                    <div className="text-lg font-bold text-white">{tema.menciones}</div>
                    <div className="text-xs text-gray-400">menciones</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg ${getSentimentColor(tema.sentiment_label)}`}>
                      {getSentimentIcon(tema.sentiment_label)}
                    </div>
                    <div className="text-xs text-gray-400">{tema.sentiment_label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas por Red Social */}
      {selectedTab === 'redes' && estadisticas && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {estadisticas.estadisticas_por_red.map((red, index) => (
              <div key={index} className="dami-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">{red.red_social}</h3>
                  <div className={`px-3 py-1 rounded text-sm ${
                    red.tendencia === 'creciente' ? 'bg-green-600' :
                    red.tendencia === 'decreciente' ? 'bg-red-600' : 'bg-gray-600'
                  }`}>
                    {red.tendencia}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{red.menciones_total}</div>
                    <div className="text-xs text-gray-400">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{red.menciones_positivas}</div>
                    <div className="text-xs text-gray-400">Positivas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{red.menciones_negativas}</div>
                    <div className="text-xs text-gray-400">Negativas</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Sentimiento Positivo</span>
                    <span className="text-green-400">{red.porcentaje_positivo}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${red.porcentaje_positivo}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400">
                  <div className="mb-1">
                    <strong>Horario pico:</strong> {red.horario_pico}
                  </div>
                  <div className="mb-2">
                    <strong>Audiencia:</strong> {red.audiencia_principal}
                  </div>
                  <div>
                    <strong>Hashtags trending:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {red.hashtags_trending.map((hashtag, idx) => (
                        <span key={idx} className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs">
                          {hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tendencias Temporales */}
      {selectedTab === 'tendencias' && estadisticas && (
        <div className="space-y-6">
          <div className="dami-card">
            <h2 className="text-2xl font-semibold text-white mb-6">📈 Tendencias de los Últimos 7 Días</h2>
            
            {/* Menciones Diarias */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-green-400 mb-4">Menciones Diarias</h3>
              <div className="space-y-2">
                {estadisticas.tendencias_temporales.menciones_diarias.map((dia, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div className="text-white font-medium">
                      {new Date(dia.fecha).toLocaleDateString('es-AR')}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-green-400">+{dia.positivas}</div>
                      <div className="text-red-400">-{dia.negativas}</div>
                      <div className="text-white font-bold">{dia.total}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Alcance Diario */}
            <div>
              <h3 className="text-lg font-medium text-green-400 mb-4">Alcance y Engagement</h3>
              <div className="space-y-2">
                {estadisticas.tendencias_temporales.alcance_diario.map((dia, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                    <div className="text-white font-medium">
                      {new Date(dia.fecha).toLocaleDateString('es-AR')}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-blue-400">{dia.alcance.toLocaleString()} alcance</div>
                      <div className="text-purple-400">{dia.engagement}% engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {selectedTab === 'alertas' && estadisticas && (
        <div className="space-y-6">
          <div className="dami-card">
            <h2 className="text-2xl font-semibold text-white mb-6">🚨 Alertas Estadísticas</h2>
            
            {estadisticas.alertas.length > 0 ? (
              <div className="space-y-4">
                {estadisticas.alertas.map((alerta, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    alerta.severidad === 'alta' ? 'bg-red-900 bg-opacity-30 border-red-400' :
                    alerta.severidad === 'media' ? 'bg-orange-900 bg-opacity-30 border-orange-400' :
                    'bg-yellow-900 bg-opacity-30 border-yellow-400'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">{getAlertIcon(alerta.severidad)}</span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            alerta.severidad === 'alta' ? 'bg-red-600' :
                            alerta.severidad === 'media' ? 'bg-orange-600' : 'bg-yellow-600'
                          } text-white`}>
                            {alerta.severidad.toUpperCase()}
                          </span>
                          <span className="ml-2 text-sm text-gray-400">{alerta.timestamp}</span>
                        </div>
                        
                        <h4 className="font-semibold text-white mb-2">{alerta.mensaje}</h4>
                        <p className="text-sm text-gray-300 mb-2">
                          <strong>Red afectada:</strong> {alerta.red_afectada}
                        </p>
                        <p className="text-sm text-green-400">
                          <strong>Acción sugerida:</strong> {alerta.accion_sugerida}
                        </p>
                      </div>
                      
                      <div className={`px-3 py-1 rounded text-sm ${
                        alerta.estado === 'nueva' ? 'bg-red-600' :
                        alerta.estado === 'en_proceso' ? 'bg-yellow-600' : 'bg-green-600'
                      } text-white`}>
                        {alerta.estado.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No hay alertas activas en este momento</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CentroEstadistico;