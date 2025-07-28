import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Radio, 
  AlertTriangle, 
  TrendingUp, 
  MessageSquare,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Heart,
  Share
} from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FeedSrX = ({ user, realTimeData }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update posts with real-time data
    if (realTimeData.posts.length > 0) {
      setPosts(prevPosts => {
        const newPosts = realTimeData.posts.filter(
          newPost => !prevPosts.some(post => post.id === newPost.id)
        );
        return [...newPosts, ...prevPosts].slice(0, 100); // Keep latest 100 posts
      });
    }
  }, [realTimeData.posts]);

  const fetchFeed = async () => {
    try {
      const response = await axios.get(`${API}/feed?limit=50`);
      setPosts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching feed:', error);
      toast.error('Error al cargar el feed de monitoreo social');
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
    toast.success('Feed actualizado');
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-500 text-white border-red-400';
      case 'high': return 'bg-orange-500 text-white border-orange-400';
      case 'medium': return 'bg-yellow-500 text-black border-yellow-400';
      case 'low': return 'bg-green-500 text-black border-green-400';
      default: return 'bg-gray-500 text-white border-gray-400';
    }
  };

  const getAlertLabel = (level) => {
    switch (level) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';
      default: return 'Normal';
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return '🐦';
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      case 'telegram': return '✈️';
      default: return '📱';
    }
  };

  const getSentimentColor = (score) => {
    if (score > 0.3) return 'text-green-400';
    if (score < -0.3) return 'text-red-400';
    return 'text-gray-400';
  };

  const getSentimentLabel = (score) => {
    if (score > 0.3) return 'Positivo';
    if (score < -0.3) return 'Negativo';
    return 'Neutro';
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

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterLevel === 'all' || post.alert_level === filterLevel;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner mr-2"></div>
        <span className="text-green-400">Cargando monitoreo de redes sociales...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Radio className="w-8 h-8 text-green-400 mr-3" />
            <h1 className="text-3xl font-bold text-white">📡 ¿Qué dijo el Sr. X?</h1>
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
          Monitoreo en tiempo real de actividad en redes sociales y medios digitales
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar en el feed por contenido o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dami-input w-full pl-10"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="dami-input pl-10 pr-8"
          >
            <option value="all">Todos los niveles</option>
            <option value="critical">Crítico</option>
            <option value="high">Alto</option>
            <option value="medium">Medio</option>
            <option value="low">Bajo</option>
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-red-400">
            {posts.filter(p => p.alert_level === 'critical').length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Alertas Críticas</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-orange-400">
            {posts.filter(p => p.alert_level === 'high').length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Nivel Alto</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-green-400">
            {posts.filter(p => p.sentiment_score > 0).length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Sentimiento +</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-blue-400">
            {posts.length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Total Posts</div>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="dami-card hover:border-green-400 transition-all duration-200">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                  <span className="text-lg">{getPlatformIcon(post.platform)}</span>
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-white mr-2">{post.author}</h3>
                    <span className="text-sm text-gray-400">@{post.platform}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeAgo(post.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Alert Level */}
                <div className={`px-2 py-1 rounded text-xs font-semibold ${getAlertColor(post.alert_level)}`}>
                  {getAlertLabel(post.alert_level)}
                </div>
                
                {/* Sentiment */}
                <div className={`text-xs font-medium ${getSentimentColor(post.sentiment_score)}`}>
                  {getSentimentLabel(post.sentiment_score)}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-white text-base leading-relaxed mb-3">
                "{post.content}"
              </p>
              
              {/* Keywords Triggered */}
              {post.keywords_triggered.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="text-xs text-gray-400 mr-2">Palabras clave:</span>
                  {post.keywords_triggered.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-red-500 bg-opacity-20 text-red-400 text-xs rounded border border-red-400"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Alert Section */}
            {(post.alert_level === 'critical' || post.alert_level === 'high') && (
              <div className="bg-red-900 bg-opacity-30 border border-red-400 rounded p-3 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                  <span className="text-red-400 font-semibold text-sm">
                    ALERTA: Discurso opositor detectado. Requiere acción táctica.
                  </span>
                </div>
              </div>
            )}

            {/* Post Stats */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-700">
              <div className="flex items-center space-x-4 text-gray-400">
                <button className="flex items-center hover:text-green-400 transition-colors">
                  <Heart className="w-4 h-4 mr-1" />
                  <span className="text-xs">Analizar</span>
                </button>
                <button className="flex items-center hover:text-green-400 transition-colors">
                  <Share className="w-4 h-4 mr-1" />
                  <span className="text-xs">Compartir</span>
                </button>
                <button className="flex items-center hover:text-green-400 transition-colors">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span className="text-xs">Responder</span>
                </button>
              </div>
              
              <div className="text-xs text-gray-500">
                Sentiment: {post.sentiment_score.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <Radio className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No se encontraron publicaciones
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterLevel !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'No hay actividad reciente en redes sociales'
            }
          </p>
        </div>
      )}

      {/* Load More */}
      {filteredPosts.length > 0 && (
        <div className="text-center pt-6">
          <button className="dami-button-secondary">
            Cargar más publicaciones
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedSrX;