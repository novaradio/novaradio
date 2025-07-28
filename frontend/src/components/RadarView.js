import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Radar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  User,
  Activity,
  Calendar,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RadarView = ({ user }) => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActor, setSelectedActor] = useState(null);

  useEffect(() => {
    fetchActors();
    const interval = setInterval(fetchActors, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchActors = async () => {
    try {
      const response = await axios.get(`${API}/actors`);
      setActors(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching actors:', error);
      toast.error('Error al cargar actores políticos');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'roja': return 'bg-red-500 text-white';
      case 'naranja': return 'bg-orange-500 text-white';
      case 'amarilla': return 'bg-yellow-500 text-black';
      case 'verde': return 'bg-green-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'roja': return 'Crítico';
      case 'naranja': return 'Alto Riesgo';
      case 'amarilla': return 'Precaución';
      case 'verde': return 'Neutro';
      default: return 'Desconocido';
    }
  };

  const getInfluenceLevel = (score) => {
    if (score >= 90) return { label: 'Muy Alto', color: 'text-red-400' };
    if (score >= 70) return { label: 'Alto', color: 'text-orange-400' };
    if (score >= 50) return { label: 'Medio', color: 'text-yellow-400' };
    return { label: 'Bajo', color: 'text-green-400' };
  };

  const filteredActors = actors.filter(actor =>
    actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actor.activity_description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner mr-2"></div>
        <span className="text-green-400">Cargando radar de actores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Radar className="w-8 h-8 text-green-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">🛰️ Radar de Actores</h1>
        </div>
        <p className="text-gray-400">
          Monitoreo en tiempo real de figuras políticas clave y su actividad
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar actores por nombre o actividad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="dami-input w-full pl-10"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-red-400">
            {actors.filter(a => a.status === 'roja').length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Nivel Crítico</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-orange-400">
            {actors.filter(a => a.status === 'naranja').length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Alto Riesgo</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {actors.filter(a => a.status === 'amarilla').length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Precaución</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-green-400">
            {actors.filter(a => a.status === 'verde').length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Neutro</div>
        </div>
      </div>

      {/* Actors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActors.map((actor) => {
          const influence = getInfluenceLevel(actor.influence_score);
          
          return (
            <div 
              key={actor.id} 
              className="dami-card cursor-pointer hover:border-green-400 transition-all duration-200"
              onClick={() => setSelectedActor(actor)}
            >
              {/* Actor Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{actor.name}</h3>
                    <p className="text-sm text-gray-400">{actor.social_media_handle}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(actor.status)}`}>
                  {getStatusLabel(actor.status)}
                </div>
              </div>

              {/* Activity Description */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Activity className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-sm font-medium text-gray-300">Actividad Actual</span>
                </div>
                <p className="text-sm text-white bg-gray-700 bg-opacity-50 p-3 rounded">
                  {actor.activity_description}
                </p>
              </div>

              {/* Influence Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Nivel de Influencia</span>
                  <span className={`text-sm font-semibold ${influence.color}`}>
                    {influence.label}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${actor.influence_score}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400 mt-1 text-right">
                  {actor.influence_score}/100
                </div>
              </div>

              {/* Keywords */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-sm text-gray-400">Palabras Clave</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {actor.keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-green-400 bg-opacity-20 text-green-400 text-xs rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Last Update */}
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                Actualizado: {new Date(actor.last_update).toLocaleString('es-ES')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredActors.length === 0 && (
        <div className="text-center py-12">
          <Radar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No se encontraron actores
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay actores configurados'}
          </p>
        </div>
      )}

      {/* Actor Detail Modal */}
      {selectedActor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedActor.name}</h2>
              <button 
                onClick={() => setSelectedActor(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Estado Actual</span>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedActor.status)} mt-1`}>
                    {getStatusLabel(selectedActor.status)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Puntuación de Influencia</span>
                  <p className="text-lg font-semibold text-green-400">{selectedActor.influence_score}/100</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-400">Descripción de Actividad</span>
                <p className="text-white mt-1">{selectedActor.activity_description}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-400">Handle de Redes Sociales</span>
                <p className="text-green-400 mt-1">{selectedActor.social_media_handle}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-400">Palabras Clave Monitoreadas</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedActor.keywords.map((keyword, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-green-400 bg-opacity-20 text-green-400 text-xs rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RadarView;