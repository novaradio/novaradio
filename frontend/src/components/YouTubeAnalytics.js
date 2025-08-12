import React, { useState, useEffect } from 'react';
import { 
  Youtube, 
  Search, 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  Play,
  Settings,
  Key,
  AlertCircle,
  CheckCircle,
  BarChart3,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const YouTubeAnalytics = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [error, setError] = useState('');

  // Estados para formularios
  const [searchQuery, setSearchQuery] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [daysBack, setDaysBack] = useState(30);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [apiKey, setApiKey] = useState('');

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchData = async (endpoint, method = 'GET', body = null, params = {}) => {
    try {
      setLoading(true);
      setError('');
      
      const queryString = new URLSearchParams(params).toString();
      const url = `${BACKEND_URL}/api/youtube/${endpoint}${queryString ? '?' + queryString : ''}`;
      
      const config = {
        method,
        headers: getAuthHeaders()
      };
      
      if (body) {
        config.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, config);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Error en la solicitud');
      }
      
      return result.data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
    const dashboardData = await fetchData('dashboard');
    const apiStatus = await fetchData('api-status');
    
    setData({
      dashboard: dashboardData,
      apiStatus: apiStatus
    });
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const buscarCanales = async () => {
    const params = {
      query: searchQuery || undefined,
      max_results: maxResults
    };
    
    const resultado = await fetchData('search-channels', 'GET', null, params);
    if (resultado) {
      setData(prev => ({ ...prev, channels: resultado }));
    }
  };

  const buscarVideos = async () => {
    const params = {
      query: searchQuery || undefined,
      max_results: maxResults,
      days_back: daysBack
    };
    
    const resultado = await fetchData('search-videos', 'GET', null, params);
    if (resultado) {
      setData(prev => ({ ...prev, videos: resultado }));
    }
  };

  const obtenerTendencias = async () => {
    const resultado = await fetchData('political-trends');
    if (resultado) {
      setData(prev => ({ ...prev, trends: resultado }));
    }
  };

  const analizarCanal = async () => {
    if (!selectedChannel) {
      setError('Selecciona un canal para analizar');
      return;
    }
    
    const params = { days_back: daysBack };
    const resultado = await fetchData(`channel/${selectedChannel}/analytics`, 'GET', null, params);
    if (resultado) {
      setData(prev => ({ ...prev, analytics: resultado }));
    }
  };

  const configurarApiKey = async () => {
    if (!apiKey.trim()) {
      setError('Ingresa una API key válida');
      return;
    }
    
    const resultado = await fetchData('configure-api-key', 'POST', { api_key: apiKey });
    if (resultado) {
      setData(prev => ({ ...prev, apiConfig: resultado }));
      await loadDashboard(); // Recargar dashboard con nueva configuración
      setApiKey(''); // Limpiar campo
    }
  };

  // Preparar datos para gráficos
  const prepareSentimentChart = () => {
    if (!data.trends?.sentiment_analysis) return null;
    
    const sentiment = data.trends.sentiment_analysis;
    return {
      labels: ['Positivos', 'Negativos', 'Neutrales'],
      datasets: [{
        data: [sentiment.positive_videos, sentiment.negative_videos, sentiment.neutral_videos],
        backgroundColor: ['#10B981', '#EF4444', '#6B7280'],
        borderWidth: 2
      }]
    };
  };

  const prepareEngagementChart = () => {
    if (!data.videos?.videos) return null;
    
    const videos = data.videos.videos.slice(0, 10);
    return {
      labels: videos.map(v => v.title.substring(0, 20) + '...'),
      datasets: [{
        label: 'Engagement Rate (%)',
        data: videos.map(v => v.engagement_rate),
        backgroundColor: '#3B82F6',
        borderColor: '#2563EB',
        borderWidth: 1
      }]
    };
  };

  const renderDashboardTab = () => (
    <div className="space-y-6">
      {data.dashboard && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Canales Monitoreados</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {data.dashboard.overview?.channels_monitored || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Play className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Videos Analizados</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {data.dashboard.overview?.videos_analyzed || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sentiment Político</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {data.dashboard.overview?.avg_political_sentiment || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Videos 24h</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {data.dashboard.real_time_metrics?.videos_last_24h || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status de API */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Estado de la API</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                data.apiStatus?.api_configured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.apiStatus?.service_status || 'Desconocido'}
              </span>
            </div>
            <p className="text-gray-700">
              API Key: {data.apiStatus?.api_key_preview || 'No configurada'}
            </p>
            {!data.apiStatus?.api_configured && (
              <div className="mt-2 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    Funcionando en modo simulación. Configura una API key real para datos en vivo.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Contenido Viral */}
          {data.dashboard.top_performers && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Contenido Viral</h3>
                <div className="space-y-3">
                  {data.dashboard.top_performers.viral_content.map((content, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{content.title}</p>
                        <p className="text-xs text-gray-600">{content.channel}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold">{content.views.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">views</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Canales en Crecimiento</h3>
                <div className="space-y-3">
                  {data.dashboard.top_performers?.growing_channels?.map((channel, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{channel.title}</p>
                        <p className="text-xs text-gray-600">{channel.category}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold">{channel.subscribers.toLocaleString()}</p>
                        <p className="text-xs text-green-600">{channel.growth_estimate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderSearchTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Search className="mr-2 text-blue-600" size={20} />
          Búsqueda de Contenido
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Término de Búsqueda</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ej: Frente Renovador, Misiones..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Máx. Resultados</label>
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Período (días)</label>
            <select
              value={daysBack}
              onChange={(e) => setDaysBack(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={7}>7 días</option>
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
              <option value={365}>1 año</option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={buscarCanales}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          >
            <Users className="mr-2" size={16} />
            {loading ? 'Buscando...' : 'Buscar Canales'}
          </button>
          <button
            onClick={buscarVideos}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Play className="mr-2" size={16} />
            {loading ? 'Buscando...' : 'Buscar Videos'}
          </button>
        </div>
      </div>

      {/* Resultados de Canales */}
      {data.channels && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">
            Canales Encontrados ({data.channels.channels_found})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.channels.channels.map((channel, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <img 
                    src={channel.thumbnail_url} 
                    alt={channel.title}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{channel.title}</h5>
                    <p className="text-xs text-gray-600 mt-1">
                      {channel.description.substring(0, 100)}...
                    </p>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{channel.growth_metrics.subscribers_formatted} subs</span>
                      <span>{channel.growth_metrics.views_formatted} views</span>
                    </div>
                    <button
                      onClick={() => setSelectedChannel(channel.channel_id)}
                      className="mt-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                    >
                      Analizar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados de Videos */}
      {data.videos && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold">
              Videos Encontrados ({data.videos.videos_found})
            </h4>
            {data.videos.statistics && (
              <div className="text-sm text-gray-600">
                Total views: {data.videos.statistics.total_views.toLocaleString()}
              </div>
            )}
          </div>
          
          {/* Gráfico de Engagement */}
          {prepareEngagementChart() && (
            <div className="mb-6 max-w-4xl">
              <h5 className="font-medium mb-2">Engagement Rate por Video</h5>
              <Bar data={prepareEngagementChart()} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
            </div>
          )}
          
          <div className="space-y-3">
            {data.videos.videos.map((video, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{video.title}</h5>
                    <p className="text-xs text-gray-600">{video.channel_title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {video.description.substring(0, 150)}...
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Eye size={12} className="mr-1" />
                        {video.view_count.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <Heart size={12} className="mr-1" />
                        {video.like_count}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle size={12} className="mr-1" />
                        {video.comment_count}
                      </span>
                    </div>
                    <div className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        video.performance === 'viral' ? 'bg-red-100 text-red-800' :
                        video.performance === 'alto' ? 'bg-orange-100 text-orange-800' :
                        video.performance === 'moderado' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {video.performance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tendencias Políticas</h3>
        <button
          onClick={obtenerTendencias}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
        >
          <TrendingUp className="mr-2" size={16} />
          {loading ? 'Actualizando...' : 'Actualizar Tendencias'}
        </button>
      </div>

      {data.trends && (
        <>
          {/* Sentiment Analysis Chart */}
          {prepareSentimentChart() && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold mb-4">Análisis de Sentiment</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Doughnut data={prepareSentimentChart()} />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Sentiment General:</span>
                      <span className={`font-semibold ${
                        data.trends.sentiment_analysis.sentiment_trend === 'positivo' ? 'text-green-600' :
                        data.trends.sentiment_analysis.sentiment_trend === 'negativo' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {data.trends.sentiment_analysis.sentiment_trend}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {data.trends.sentiment_analysis.interpretation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trending Topics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Temas Trending</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.trends.trending_topics?.map((topic, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium">{topic.term}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      topic.trend_status === 'viral' ? 'bg-red-100 text-red-800' :
                      topic.trend_status === 'alto' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {topic.trend_status}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Videos: {topic.video_count}</div>
                    <div>Views: {topic.total_views.toLocaleString()}</div>
                    <div>Score: {topic.popularity_score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geographic Data */}
          {data.trends.geographic_analysis && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold mb-4">Análisis Geográfico</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(data.trends.geographic_analysis.sentiment_by_region).map(([city, data]) => (
                  <div key={city} className="text-center p-3 border rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <MapPin size={16} className="text-blue-600 mr-1" />
                      <span className="font-medium text-sm">{city}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div>Menciones: {data.mention_count}</div>
                      <div className={`font-medium ${
                        data.sentiment_label === 'positivo' ? 'text-green-600' :
                        data.sentiment_label === 'negativo' ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {data.sentiment_label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Insights */}
          {data.trends.key_insights && (
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold mb-4">Insights Clave</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.trends.key_insights.map((insight, index) => (
                  <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="text-blue-600 mr-3" size={16} />
                    <span className="text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2 text-purple-600" size={20} />
          Analytics de Canal
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">ID del Canal</label>
            <input
              type="text"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              placeholder="UC1234567890abcdefg..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Período de Análisis</label>
            <select
              value={daysBack}
              onChange={(e) => setDaysBack(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={7}>7 días</option>
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
              <option value={365}>1 año</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={analizarCanal}
          disabled={loading || !selectedChannel}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
        >
          <BarChart3 className="mr-2" size={16} />
          {loading ? 'Analizando...' : 'Analizar Canal'}
        </button>
      </div>

      {data.analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Métricas de Crecimiento</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Crecimiento Suscriptores:</span>
                <span className={`font-semibold ${
                  data.analytics.growth_metrics.subscriber_growth > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.analytics.growth_metrics.subscriber_growth > 0 ? '+' : ''}{data.analytics.growth_metrics.subscriber_growth}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Crecimiento Views:</span>
                <span className="font-semibold">
                  +{data.analytics.growth_metrics.view_growth.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Nuevos Videos:</span>
                <span className="font-semibold">
                  {data.analytics.growth_metrics.video_count_growth}
                </span>
              </div>
              <div className="flex justify-between">
                <span>% Crecimiento:</span>
                <span className={`font-semibold ${
                  data.analytics.growth_metrics.growth_percentage > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data.analytics.growth_metrics.growth_percentage}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold mb-4">Engagement</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Engagement Rate:</span>
                <span className="font-semibold">
                  {data.analytics.engagement_metrics.engagement_rate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Nivel:</span>
                <span className={`font-semibold px-2 py-1 rounded text-sm ${
                  data.analytics.engagement_metrics.engagement_level === 'alto' ? 'bg-green-100 text-green-800' :
                  data.analytics.engagement_metrics.engagement_level === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {data.analytics.engagement_metrics.engagement_level}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Performance:</span>
                <span className="font-semibold">
                  {data.analytics.engagement_metrics.performance_rating}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {data.analytics?.recommendations && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Recomendaciones</h4>
          <div className="space-y-2">
            {data.analytics.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="text-green-600 mr-2 mt-0.5" size={16} />
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderConfigTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="mr-2 text-gray-600" size={20} />
          Configuración de YouTube API
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">YouTube API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Ingresa tu YouTube Data API v3 key..."
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              Obtén tu API key en: https://console.cloud.google.com/apis/credentials
            </p>
          </div>
          
          <button
            onClick={configurarApiKey}
            disabled={loading || !apiKey.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Key className="mr-2" size={16} />
            {loading ? 'Configurando...' : 'Configurar API Key'}
          </button>
        </div>

        {data.apiConfig && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 mr-2" size={16} />
              <span className="text-green-800">API Key configurada exitosamente</span>
            </div>
          </div>
        )}
      </div>

      {/* Estado actual de la API */}
      {data.apiStatus && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Estado Actual</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>API Configurada:</span>
              <span className={`font-semibold ${
                data.apiStatus.api_configured ? 'text-green-600' : 'text-red-600'
              }`}>
                {data.apiStatus.api_configured ? 'Sí' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estado del Servicio:</span>
              <span className="font-semibold">{data.apiStatus.service_status}</span>
            </div>
            <div className="flex justify-between">
              <span>Límite Diario:</span>
              <span className="font-semibold">{data.apiStatus.quota_info?.daily_limit}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <h5 className="font-medium mb-2">Funcionalidades Disponibles:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.apiStatus.features_available?.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircle className="text-green-600 mr-2" size={14} />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Youtube },
    { id: 'search', label: 'Búsqueda', icon: Search },
    { id: 'trends', label: 'Tendencias', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'config', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">YouTube Analytics</h1>
          <p className="text-gray-600">Monitoreo y análisis de contenido político en YouTube</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="mr-2" size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'dashboard' && renderDashboardTab()}
          {activeTab === 'search' && renderSearchTab()}
          {activeTab === 'trends' && renderTrendsTab()}
          {activeTab === 'analytics' && renderAnalyticsTab()}
          {activeTab === 'config' && renderConfigTab()}
        </div>
      </div>
    </div>
  );
};

export default YouTubeAnalytics;