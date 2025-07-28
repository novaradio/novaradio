import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Activity,
  Calendar,
  Search,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MapaCalor = ({ user }) => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    fetchZones();
    const interval = setInterval(fetchZones, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchZones = async () => {
    try {
      const response = await axios.get(`${API}/zones`);
      setZones(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching zones:', error);
      toast.error('Error al cargar zonas territoriales');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'roja': return 'bg-red-500 text-white border-red-400';
      case 'naranja': return 'bg-orange-500 text-white border-orange-400';
      case 'amarilla': return 'bg-yellow-500 text-black border-yellow-400';
      case 'verde': return 'bg-green-500 text-black border-green-400';
      default: return 'bg-gray-500 text-white border-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'roja': return 'Zona Crítica';
      case 'naranja': return 'Alta Tensión';
      case 'amarilla': return 'Moderada';
      case 'verde': return 'Estable';
      default: return 'Desconocido';
    }
  };

  const getActivityLevel = (level) => {
    if (level >= 80) return { label: 'Muy Alta', color: 'text-red-400', intensity: 'high' };
    if (level >= 60) return { label: 'Alta', color: 'text-orange-400', intensity: 'medium-high' };
    if (level >= 40) return { label: 'Media', color: 'text-yellow-400', intensity: 'medium' };
    return { label: 'Baja', color: 'text-green-400', intensity: 'low' };
  };

  const filteredZones = zones.filter(zone =>
    zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    zone.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner mr-2"></div>
        <span className="text-green-400">Cargando mapa de calor territorial...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <MapPin className="w-8 h-8 text-green-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">🌍 Mapa de Calor Territorial</h1>
        </div>
        <p className="text-gray-400">
          Análisis de actividad política por regiones y zonas territoriales
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar zonas por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="dami-input w-full pl-10"
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-red-400">
            {zones.filter(z => z.status === 'roja').length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Zonas Críticas</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-orange-400">
            {zones.filter(z => z.status === 'naranja').length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Alta Tensión</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {zones.filter(z => z.status === 'amarilla').length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Moderadas</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-green-400">
            {zones.filter(z => z.status === 'verde').length}
          </div>
          <div className="text-sm text-gray-400 mt-1">Estables</div>
        </div>
      </div>

      {/* Heat Map Visualization */}
      <div className="dami-card">
        <h3 className="text-xl font-semibold text-white mb-6">Visualización de Calor por Intensidad</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {zones.map((zone) => {
            const activity = getActivityLevel(zone.activity_level);
            const intensity = zone.activity_level / 100;
            
            return (
              <div 
                key={zone.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${getStatusColor(zone.status)}`}
                onClick={() => setSelectedZone(zone)}
                style={{
                  opacity: 0.7 + (intensity * 0.3),
                  boxShadow: `0 0 ${intensity * 20}px rgba(${
                    zone.status === 'roja' ? '239, 68, 68' :
                    zone.status === 'naranja' ? '249, 115, 22' :
                    zone.status === 'amarilla' ? '234, 179, 8' :
                    '34, 197, 94'
                  }, ${intensity * 0.5})`
                }}
              >
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <h4 className="font-semibold text-lg mb-1">{zone.name}</h4>
                  <div className="text-sm opacity-90">
                    Nivel: {zone.activity_level}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zones Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredZones.map((zone) => {
          const activity = getActivityLevel(zone.activity_level);
          
          return (
            <div 
              key={zone.id} 
              className="dami-card cursor-pointer hover:border-green-400 transition-all duration-200"
              onClick={() => setSelectedZone(zone)}
            >
              {/* Zone Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${getStatusColor(zone.status)}`}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{zone.name}</h3>
                    <p className="text-sm text-gray-400">{getStatusLabel(zone.status)}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  zone.status === 'roja' ? 'bg-red-500 bg-opacity-20 text-red-400 border-red-400' :
                  zone.status === 'naranja' ? 'bg-orange-500 bg-opacity-20 text-orange-400 border-orange-400' :
                  zone.status === 'amarilla' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-400' :
                  'bg-green-500 bg-opacity-20 text-green-400 border-green-400'
                }`}>
                  {zone.activity_level}%
                </div>
              </div>

              {/* Activity Level */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-sm font-medium text-gray-300">Nivel de Actividad</span>
                  </div>
                  <span className={`text-sm font-semibold ${activity.color}`}>
                    {activity.label}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      zone.status === 'roja' ? 'bg-red-400' :
                      zone.status === 'naranja' ? 'bg-orange-400' :
                      zone.status === 'amarilla' ? 'bg-yellow-400' :
                      'bg-green-400'
                    }`}
                    style={{ width: `${zone.activity_level}%` }}
                  ></div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <BarChart3 className="w-4 h-4 text-green-400 mr-2" />
                  <span className="text-sm font-medium text-gray-300">Situación Actual</span>
                </div>
                <p className="text-sm text-white bg-gray-700 bg-opacity-50 p-3 rounded">
                  {zone.description}
                </p>
              </div>

              {/* Last Update */}
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                Actualizado: {new Date(zone.last_update).toLocaleString('es-ES')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredZones.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">
            No se encontraron zonas
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay zonas configuradas'}
          </p>
        </div>
      )}

      {/* Zone Detail Modal */}
      {selectedZone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedZone.name}</h2>
              <button 
                onClick={() => setSelectedZone(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Estado de la Zona</span>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${
                    selectedZone.status === 'roja' ? 'bg-red-500 bg-opacity-20 text-red-400 border-red-400' :
                    selectedZone.status === 'naranja' ? 'bg-orange-500 bg-opacity-20 text-orange-400 border-orange-400' :
                    selectedZone.status === 'amarilla' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400 border-yellow-400' :
                    'bg-green-500 bg-opacity-20 text-green-400 border-green-400'
                  } mt-1`}>
                    {getStatusLabel(selectedZone.status)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Nivel de Actividad</span>
                  <p className="text-lg font-semibold text-green-400">{selectedZone.activity_level}%</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-400">Descripción de la Situación</span>
                <p className="text-white mt-1">{selectedZone.description}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-400">Última Actualización</span>
                <p className="text-green-400 mt-1">
                  {new Date(selectedZone.last_update).toLocaleString('es-ES')}
                </p>
              </div>
              
              {selectedZone.coordinates && (
                <div>
                  <span className="text-sm text-gray-400">Coordenadas</span>
                  <p className="text-white mt-1">
                    Lat: {selectedZone.coordinates.lat}, Lng: {selectedZone.coordinates.lng}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapaCalor;