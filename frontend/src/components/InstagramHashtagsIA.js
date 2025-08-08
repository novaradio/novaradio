import React, { useState, useEffect } from 'react';
import { AlertTriangle, Instagram, Hash, TrendingUp, Brain, Settings, Activity, DollarSign, Eye, MessageCircle, Heart, ExternalLink, Calendar, Filter } from 'lucide-react';

const InstagramHashtagsIA = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [configData, setConfigData] = useState(null);
  const [pullResults, setPullResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Configuración de pull
  const [pullConfig, setPullConfig] = useState({
    hashtags: [],
    since: '',
    limit_per_tag: 20,
    max_total: 80
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('dami_token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${BACKEND_URL}/api${url}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Cargar health status al montar componente
  useEffect(() => {
    loadHealthStatus();
  }, []);

  // Cargar dashboard cuando se selecciona esa tab
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboard();
    } else if (activeTab === 'config') {
      loadConfig();
    }
  }, [activeTab]);

  const loadHealthStatus = async () => {
    try {
      const response = await fetchWithAuth('/instagram/hashtags/health');
      setHealthStatus(response);
    } catch (err) {
      console.error('Error cargando health status:', err);
      setError(err.message);
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/instagram/hashtags/dashboard');
      setDashboardData(response.dashboard);
      setError(null);
    } catch (err) {
      console.error('Error cargando dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/instagram/hashtags/config');
      setConfigData(response.config);
      setError(null);
    } catch (err) {
      console.error('Error cargando configuración:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executePull = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/instagram/hashtags/pull', {
        method: 'POST',
        body: JSON.stringify(pullConfig)
      });
      setPullResults(response.data);
      setError(null);
      console.log('✅ Pull Instagram exitoso:', response.data);
    } catch (err) {
      console.error('Error en pull:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderHealthBadge = (status) => {
    const badgeClass = status === 'operational' 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${badgeClass}`}>
        {status === 'operational' ? '🟢 Operacional' : '🟡 En desarrollo'}
      </span>
    );
  };

  const renderSentimentBadge = (sentiment) => {
    const badges = {
      'positivo': 'bg-green-100 text-green-800 border-green-200',
      'negativo': 'bg-red-100 text-red-800 border-red-200',
      'neutral': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const emojis = {
      'positivo': '😊',
      'negativo': '😞', 
      'neutral': '😐'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[sentiment] || badges.neutral}`}>
        {emojis[sentiment] || emojis.neutral} {sentiment}
      </span>
    );
  };

  const renderRiskBadge = (risk) => {
    const level = risk >= 8 ? 'alto' : risk >= 5 ? 'medio' : 'bajo';
    const badges = {
      'alto': 'bg-red-100 text-red-800 border-red-200',
      'medio': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bajo': 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${badges[level]}`}>
        🎯 Riesgo {level} ({risk}/10)
      </span>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header con status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Instagram className="h-8 w-8 text-pink-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Instagram Hashtags + IA</h2>
            <p className="text-gray-600">Monitoreo inteligente con optimización de costos</p>
          </div>
        </div>
        {healthStatus && renderHealthBadge(healthStatus.status)}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando dashboard...</span>
        </div>
      )}

      {dashboardData && (
        <>
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Posts Monitoreados</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.resumen.total_posts_monitoreados}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Última actualización: ahora</p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Hashtags Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.resumen.hashtags_activos}</p>
                </div>
                <Hash className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Misiones enfocado</p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Posts Alto Riesgo</p>
                  <p className="text-2xl font-bold text-red-600">{dashboardData.resumen.posts_alto_riesgo}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Engagement Prom.</p>
                  <p className="text-2xl font-bold text-purple-600">{dashboardData.resumen.engagement_promedio}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Likes + Comentarios</p>
            </div>
          </div>

          {/* Hashtags Top y Sentiment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Hash className="h-5 w-5 text-blue-600 mr-2" />
                Hashtags Top Performance
              </h3>
              <div className="space-y-3">
                {Object.entries(dashboardData.hashtags_top).map(([hashtag, count]) => (
                  <div key={hashtag} className="flex items-center justify-between">
                    <span className="font-mono text-sm text-blue-600">{hashtag}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(count/200)*100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 text-green-600 mr-2" />
                Distribución de Sentiment
              </h3>
              <div className="space-y-4">
                {Object.entries(dashboardData.tendencias_sentiment).map(([sentiment, count]) => (
                  <div key={sentiment} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {renderSentimentBadge(sentiment)}
                      <span className="text-sm text-gray-700 capitalize">{sentiment}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${sentiment === 'positivo' ? 'bg-green-500' : 
                            sentiment === 'negativo' ? 'bg-red-500' : 'bg-gray-500'}`}
                          style={{ width: `${(count/(Object.values(dashboardData.tendencias_sentiment).reduce((a,b) => a+b, 0)))*100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Optimización de Costos */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              Optimización de Costos IA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{dashboardData.optimizacion_costos.analisis_basicos}</p>
                <p className="text-sm text-gray-600">Análisis Básicos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{dashboardData.optimizacion_costos.analisis_ia}</p>
                <p className="text-sm text-gray-600">Análisis con IA</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{dashboardData.optimizacion_costos.ahorro_estimado}</p>
                <p className="text-sm text-gray-600">Ahorro Estimado</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">95%</p>
                <p className="text-sm text-gray-600">Eficiencia</p>
              </div>
            </div>
          </div>

          {/* Alertas Activas */}
          {dashboardData.alertas_activas.length > 0 && (
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                Alertas Activas ({dashboardData.alertas_activas.length})
              </h3>
              <div className="space-y-3">
                {dashboardData.alertas_activas.map((alerta, index) => (
                  <div key={alerta.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alerta.nivel === 'alto' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alerta.nivel.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">{alerta.hashtag}</span>
                      </div>
                      <p className="text-sm text-gray-700">{alerta.mensaje}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alerta.timestamp).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderPull = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pull de Hashtags</h2>
          <p className="text-gray-600">Extraer contenido de Instagram con análisis IA</p>
        </div>
      </div>

      {/* Formulario de configuración */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración del Pull</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtags (separados por coma)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="#Misiones, #Posadas, #Obera"
              value={pullConfig.hashtags.join(', ')}
              onChange={(e) => setPullConfig({
                ...pullConfig,
                hashtags: e.target.value.split(',').map(h => h.trim()).filter(h => h)
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desde fecha (opcional)
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={pullConfig.since}
              onChange={(e) => setPullConfig({...pullConfig, since: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Límite por hashtag
            </label>
            <input
              type="number"
              min="5"
              max="50"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={pullConfig.limit_per_tag}
              onChange={(e) => setPullConfig({...pullConfig, limit_per_tag: parseInt(e.target.value)})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Máximo total
            </label>
            <input
              type="number"
              min="10"
              max="200"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={pullConfig.max_total}
              onChange={(e) => setPullConfig({...pullConfig, max_total: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={executePull}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-md transition-colors flex items-center space-x-2"
          >
            <Instagram className="h-4 w-4" />
            <span>{loading ? 'Ejecutando Pull...' : 'Ejecutar Pull'}</span>
          </button>
        </div>
      </div>

      {/* Resultados del pull */}
      {pullResults && (
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resultados del Pull</h3>
          
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Posts Obtenidos</p>
              <p className="text-2xl font-bold text-blue-600">{pullResults.stats.total}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Hashtags Procesados</p>
              <p className="text-2xl font-bold text-green-600">{pullResults.stats.hashtags_processed}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Posts Alto Riesgo</p>
              <p className="text-2xl font-bold text-yellow-600">{pullResults.stats.high_risk_posts}</p>
            </div>
          </div>

          {/* Lista de posts */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {pullResults.posts.slice(0, 10).map((post, index) => (
              <div key={post.ig_id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm text-blue-600">{post.hashtag}</span>
                    <span className="text-sm text-gray-500">@{post.username}</span>
                    {renderSentimentBadge(post.sentiment)}
                    {renderRiskBadge(post.risk)}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.metrics.like_count}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.metrics.comments_count}</span>
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{post.text}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Tópico: <span className="font-medium">{post.topic}</span></span>
                  <span>{new Date(post.timestamp).toLocaleString('es-AR')}</span>
                </div>
              </div>
            ))}
          </div>

          {pullResults.posts.length > 10 && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Mostrando 10 de {pullResults.posts.length} posts. Total disponible en logs.
            </p>
          )}
        </div>
      )}
    </div>
  );

  const renderConfig = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
          <p className="text-gray-600">Ajustes del servicio Instagram Hashtags + IA</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando configuración...</span>
        </div>
      )}

      {configData && (
        <>
          {/* Estado del servicio */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="h-5 w-5 text-blue-600 mr-2" />
              Estado del Servicio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Servicio</p>
                <p className="text-lg font-semibold text-gray-900">{configData.service_name}</p>
                <p className="text-sm text-gray-500">Versión {configData.version}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Modo</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  configData.mode === 'simulation' 
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  📋 {configData.mode === 'simulation' ? 'Simulación' : 'Producción'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Hashtags</p>
                <p className="text-lg font-semibold text-gray-900">{configData.hashtags_configurados.length}</p>
                <p className="text-sm text-gray-500">configurados</p>
              </div>
            </div>
          </div>

          {/* Hashtags configurados */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Hash className="h-5 w-5 text-green-600 mr-2" />
              Hashtags Configurados
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {configData.hashtags_configurados.map(hashtag => (
                <span 
                  key={hashtag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-mono bg-blue-100 text-blue-800 border border-blue-200"
                >
                  {hashtag}
                </span>
              ))}
            </div>
          </div>

          {/* Configuración LLM */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="h-5 w-5 text-purple-600 mr-2" />
              Configuración IA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Modo LLM</p>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                  configData.llm_settings.mode === 'cheap'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  🧠 {configData.llm_settings.mode}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Máx. Caracteres</p>
                <p className="text-lg font-semibold text-gray-900">{configData.llm_settings.max_chars}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Límite Batch</p>
                <p className="text-lg font-semibold text-gray-900">{configData.llm_settings.batch_limit}</p>
              </div>
            </div>
          </div>

          {/* Features activas */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features Activas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {configData.features_activas.map(feature => (
                <div key={feature} className="flex items-center space-x-2">
                  <span className="text-green-600">✅</span>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Próximos pasos */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              Próximos Pasos para Producción
            </h3>
            <div className="space-y-2">
              {configData.next_steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Instagram className="h-10 w-10 text-pink-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instagram Hashtags + IA</h1>
            <p className="text-gray-600">Servicio ultra-optimizado con cost-aware AI</p>
          </div>
        </div>

        {/* Status rápido */}
        {healthStatus && (
          <div className="flex items-center space-x-4 text-sm">
            {renderHealthBadge(healthStatus.status)}
            <span className="text-gray-600">
              Modo: {healthStatus.mode === 'production' ? '✅ PRODUCCIÓN' : '🎭 SIMULACIÓN'}
            </span>
            <span className="text-gray-600">
              Datos: {healthStatus.mode === 'production' ? 'Instagram API' : 'Simulados realistas'}
            </span>
            <span className="text-gray-600">LLM: {healthStatus.llm_mode}</span>
            <span className="text-green-600">✅ Cost Optimized</span>
          </div>
        )}
      </div>

      {/* Navegación por tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'pull', label: 'Pull Hashtags', icon: Instagram },
              { id: 'config', label: 'Configuración', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Error handling */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p className="font-medium">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Contenido según tab activa */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'pull' && renderPull()}
      {activeTab === 'config' && renderConfig()}
    </div>
  );
};

export default InstagramHashtagsIA;