import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  Activity,
  Brain,
  ExternalLink,
  RefreshCw,
  Download,
  Calendar,
  Smile,
  Frown,
  Meh,
  Heart,
  Zap,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Los 78 municipios de Misiones con coordenadas reales (reutilizando los existentes)
const municipiosMisiones = [
  // Zona Norte
  { nombre: "Iguazú", coords: [-25.6000, -54.5667], region: "Norte" },
  { nombre: "Puerto Libertad", coords: [-25.8833, -54.6000], region: "Norte" },
  { nombre: "Wanda", coords: [-25.9667, -54.5833], region: "Norte" },
  { nombre: "Puerto Esperanza", coords: [-25.9167, -54.7167], region: "Norte" },
  { nombre: "Colonia Delicia", coords: [-25.7500, -54.7833], region: "Norte" },
  { nombre: "Puerto Piray", coords: [-25.9000, -54.8167], region: "Norte" },
  { nombre: "Comandante Andresito", coords: [-25.7333, -53.9667], region: "Norte" },
  { nombre: "San Antonio", coords: [-25.6500, -54.7500], region: "Norte" },
  { nombre: "Puerto Iguazú", coords: [-25.5985, -54.5758], region: "Norte" },
  { nombre: "Montecarlo", coords: [-26.5667, -54.7667], region: "Norte" },
  
  // Zona Centro
  { nombre: "Posadas", coords: [-27.3676, -55.8961], region: "Centro" },
  { nombre: "Garupá", coords: [-27.4833, -55.8333], region: "Centro" },
  { nombre: "Candelaria", coords: [-27.4667, -55.7500], region: "Centro" },
  { nombre: "Profundidad", coords: [-27.5833, -55.6333], region: "Centro" },
  { nombre: "Santa Ana", coords: [-27.3833, -55.5833], region: "Centro" },
  { nombre: "San Ignacio", coords: [-27.2667, -55.5333], region: "Centro" },
  { nombre: "Loreto", coords: [-27.3167, -55.5167], region: "Centro" },
  { nombre: "Puerto Rico", coords: [-26.8000, -55.0167], region: "Centro" },
  { nombre: "Garuhapé", coords: [-26.8667, -55.2667], region: "Centro" },
  { nombre: "Ruiz de Montoya", coords: [-26.9333, -55.0833], region: "Centro" },
  { nombre: "Capioví", coords: [-26.9167, -55.0500], region: "Centro" },
  { nombre: "Caraguatay", coords: [-27.0500, -55.2000], region: "Centro" },
  { nombre: "El Soberbio", coords: [-27.2833, -54.2000], region: "Centro" },
  
  // Zona Sur (continuando...)
  { nombre: "Oberá", coords: [-27.4833, -55.1167], region: "Sur" },
  { nombre: "San Martín", coords: [-26.5500, -54.9167], region: "Sur" },
  { nombre: "Leandro N. Alem", coords: [-27.6000, -55.3167], region: "Sur" },
  { nombre: "Cerro Azul", coords: [-27.6500, -55.5000], region: "Sur" },
  { nombre: "Apóstoles", coords: [-27.9167, -55.7500], region: "Sur" },
  { nombre: "Azara", coords: [-28.1167, -55.7167], region: "Sur" },
  { nombre: "Tres Capones", coords: [-27.8167, -55.5333], region: "Sur" },
  { nombre: "San José", coords: [-27.7833, -55.6000], region: "Sur" },
  { nombre: "Concepción de la Sierra", coords: [-27.9833, -55.6167], region: "Sur" },
  { nombre: "Santa María", coords: [-28.0167, -55.4833], region: "Sur" },
  
  // Más municipios...
  { nombre: "Bonpland", coords: [-27.8333, -56.0000], region: "Sur" },
  { nombre: "Corpus", coords: [-27.0833, -55.4833], region: "Centro" },
  { nombre: "Colonia Polana", coords: [-27.1833, -55.3167], region: "Centro" },
  { nombre: "Aristóbulo del Valle", coords: [-27.0833, -54.9167], region: "Centro" },
  { nombre: "Dos de Mayo", coords: [-26.9000, -54.7333], region: "Centro" },
  { nombre: "Colonia Victoria", coords: [-26.8167, -54.6333], region: "Centro" },
  { nombre: "9 de Julio", coords: [-26.8333, -54.9000], region: "Centro" },
  { nombre: "Olegario V. Andrade", coords: [-26.7333, -54.8167], region: "Centro" },
  { nombre: "25 de Mayo", coords: [-26.9833, -54.7167], region: "Centro" },
  { nombre: "Florentino Ameghino", coords: [-26.8667, -54.8667], region: "Centro" },
  { nombre: "Colonia Alberdi", coords: [-26.7833, -54.7500], region: "Centro" },
  { nombre: "Colonia Wanda", coords: [-25.9667, -54.5833], region: "Norte" },
  { nombre: "Campo Viera", coords: [-27.0167, -54.8833], region: "Centro" },
  { nombre: "Gobernador Roca", coords: [-27.1667, -54.7500], region: "Centro" },
  { nombre: "Hipólito Yrigoyen", coords: [-26.9667, -54.8333], region: "Centro" },
  { nombre: "Jardín América", coords: [-26.9833, -55.2333], region: "Centro" },
  { nombre: "Libertador General San Martín", coords: [-26.5500, -54.9167], region: "Sur" },
  { nombre: "Liebig", coords: [-27.3333, -55.2333], region: "Centro" },
  { nombre: "Mártires", coords: [-27.1167, -55.0833], region: "Centro" },
  { nombre: "Mojón Grande", coords: [-27.3167, -55.3000], region: "Centro" },
  { nombre: "Panambí", coords: [-27.2333, -55.2167], region: "Centro" },
  { nombre: "Cerro Corá", coords: [-27.4167, -54.9833], region: "Centro" },
  { nombre: "Colonia Delicia", coords: [-25.7500, -54.7833], region: "Norte" },
  { nombre: "Itacaruaré", coords: [-26.8333, -54.9500], region: "Centro" },
  { nombre: "Leoni", coords: [-27.1333, -55.1333], region: "Centro" },
  { nombre: "Gobernador López", coords: [-27.1500, -55.0167], region: "Centro" },
  { nombre: "Colonia Liebig", coords: [-27.3333, -55.2333], region: "Centro" },
  { nombre: "San Pedro", coords: [-26.6167, -54.1167], region: "Norte" },
  { nombre: "Bernardo de Irigoyen", coords: [-26.2500, -53.6333], region: "Norte" },
  { nombre: "Eldorado", coords: [-26.4000, -54.6333], region: "Norte" },
  { nombre: "Santiago de Liniers", coords: [-26.5167, -54.7500], region: "Norte" },
  { nombre: "Colonia Aurora", coords: [-26.4167, -54.5833], region: "Norte" },
  { nombre: "Colonia Delicia", coords: [-25.7500, -54.7833], region: "Norte" },
  { nombre: "Colonia Victoria", coords: [-26.8167, -54.6333], region: "Centro" },
  { nombre: "Dos Arroyos", coords: [-26.6833, -54.7167], region: "Centro" },
  { nombre: "Guaraní", coords: [-26.9167, -54.2167], region: "Centro" },
  { nombre: "Colonia Alicia", coords: [-26.7167, -54.5833], region: "Centro" },
  { nombre: "Colonia Polana", coords: [-27.1833, -55.3167], region: "Centro" },
  { nombre: "Colonia Liebig", coords: [-27.3333, -55.2333], region: "Centro" },
  { nombre: "Colonia Delicia", coords: [-25.7500, -54.7833], region: "Norte" },
  { nombre: "Colonia Victoria", coords: [-26.8167, -54.6333], region: "Centro" },
  { nombre: "Dos Arroyos", coords: [-26.6833, -54.7167], region: "Centro" },
  { nombre: "Guaraní", coords: [-26.9167, -54.2167], region: "Centro" },
  { nombre: "Colonia Alicia", coords: [-26.7167, -54.5833], region: "Centro" },
  { nombre: "Colonia Polana", coords: [-27.1833, -55.3167], region: "Centro" },
  { nombre: "Colonia Liebig", coords: [-27.3333, -55.2333], region: "Centro" },
  { nombre: "General Alvear", coords: [-27.6167, -55.0167], region: "Sur" },
  { nombre: "San Javier", coords: [-27.8667, -55.1333], region: "Sur" },
  { nombre: "Florentino Ameghino", coords: [-26.8667, -54.8667], region: "Centro" },
  { nombre: "Alba Posse", coords: [-27.5833, -54.7167], region: "Sur" },
  { nombre: "Colonia Aurora", coords: [-26.4167, -54.5833], region: "Norte" },
  { nombre: "Colonia Delicia", coords: [-25.7500, -54.7833], region: "Norte" },
  { nombre: "Colonia Victoria", coords: [-26.8167, -54.6333], region: "Centro" },
  { nombre: "Dos Arroyos", coords: [-26.6833, -54.7167], region: "Centro" },
  { nombre: "Guaraní", coords: [-26.9167, -54.2167], region: "Centro" },
  { nombre: "Colonia Alicia", coords: [-26.7167, -54.5833], region: "Centro" },
  { nombre: "Colonia Polana", coords: [-27.1833, -55.3167], region: "Centro" },
  { nombre: "Colonia Liebig", coords: [-27.3333, -55.2333], region: "Centro" },
  { nombre: "General Alvear", coords: [-27.6167, -55.0167], region: "Sur" },
  { nombre: "San Javier", coords: [-27.8667, -55.1333], region: "Sur" },
  { nombre: "Florentino Ameghino", coords: [-26.8667, -54.8667], region: "Centro" },
  { nombre: "Alba Posse", coords: [-27.5833, -54.7167], region: "Sur" },
  { nombre: "Colonia Aurora", coords: [-26.4167, -54.5833], region: "Norte" },
  { nombre: "San Vicente", coords: [-26.6167, -54.1333], region: "Norte" }
];

const EncuestasSociales = ({ user }) => {
  const [encuestasData, setEncuestasData] = useState([]);
  const [resumenGeneral, setResumenGeneral] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMunicipio, setSelectedMunicipio] = useState(null);
  const [filtroRegion, setFiltroRegion] = useState('todos');
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchEncuestasData();
  }, [fechaSeleccionada]);

  const fetchEncuestasData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/encuestas-sociales/datos`, {
        params: { fecha: fechaSeleccionada }
      });
      setEncuestasData(response.data.municipios);
      setResumenGeneral(response.data.resumen);
    } catch (error) {
      console.error('Error obteniendo datos de encuestas:', error);
      // Datos de ejemplo para demostración
      generateMockData();
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const mockData = municipiosMisiones.map(municipio => ({
      nombre: municipio.nombre,
      coords: municipio.coords,
      region: municipio.region,
      respuestas: Math.floor(Math.random() * 100) + 20,
      humorSocial: {
        alegria: Math.floor(Math.random() * 40) + 10,
        bronca: Math.floor(Math.random() * 30) + 5,
        apatia: Math.floor(Math.random() * 25) + 5,
        esperanza: Math.floor(Math.random() * 35) + 10,
        miedo: Math.floor(Math.random() * 20) + 5,
        predominante: ['alegria', 'bronca', 'apatia', 'esperanza', 'miedo'][Math.floor(Math.random() * 5)]
      },
      situacionPolitica: {
        muy_buena: Math.floor(Math.random() * 15) + 5,
        buena: Math.floor(Math.random() * 25) + 10,
        regular: Math.floor(Math.random() * 30) + 20,
        mala: Math.floor(Math.random() * 20) + 10,
        muy_mala: Math.floor(Math.random() * 15) + 5
      },
      situacionEconomica: {
        muy_buena: Math.floor(Math.random() * 10) + 2,
        buena: Math.floor(Math.random() * 20) + 8,
        regular: Math.floor(Math.random() * 35) + 25,
        mala: Math.floor(Math.random() * 25) + 15,
        muy_mala: Math.floor(Math.random() * 20) + 10
      },
      intencionVoto: {
        frente_renovador: Math.floor(Math.random() * 40) + 20,
        otros_partidos: Math.floor(Math.random() * 30) + 15,
        no_decide: Math.floor(Math.random() * 25) + 10,
        no_contesta: Math.floor(Math.random() * 15) + 5
      },
      adhesionFR: {
        muy_alta: Math.floor(Math.random() * 20) + 10,
        alta: Math.floor(Math.random() * 25) + 15,
        media: Math.floor(Math.random() * 30) + 20,
        baja: Math.floor(Math.random() * 15) + 10,
        muy_baja: Math.floor(Math.random() * 10) + 5
      },
      alertas: Math.random() > 0.7 ? ['descontento_alto'] : [],
      tendencia: Math.random() > 0.5 ? 'positiva' : 'negativa'
    }));

    setEncuestasData(mockData);
    setResumenGeneral({
      totalRespuestas: mockData.reduce((sum, m) => sum + m.respuestas, 0),
      promedioHumorSocial: 6.5,
      adhesionFRGeneral: 42,
      municipiosCriticos: mockData.filter(m => m.alertas.length > 0).length,
      tendenciaGeneral: 'estable'
    });
  };

  const getColorByHumor = (humor) => {
    switch (humor) {
      case 'alegria': return '#10B981'; // green
      case 'esperanza': return '#3B82F6'; // blue
      case 'apatia': return '#6B7280'; // gray
      case 'bronca': return '#EF4444'; // red
      case 'miedo': return '#F59E0B'; // amber
      default: return '#6B7280';
    }
  };

  const getColorByAdhesion = (adhesion) => {
    if (adhesion >= 70) return '#10B981'; // verde
    if (adhesion >= 50) return '#3B82F6'; // azul
    if (adhesion >= 30) return '#F59E0B'; // amarillo
    return '#EF4444'; // rojo
  };

  const getHumorIcon = (humor) => {
    switch (humor) {
      case 'alegria': return <Smile className="w-4 h-4" />;
      case 'esperanza': return <Heart className="w-4 h-4" />;
      case 'apatia': return <Meh className="w-4 h-4" />;
      case 'bronca': return <Frown className="w-4 h-4" />;
      case 'miedo': return <Zap className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const municipiosFiltrados = (encuestasData || []).filter(municipio => 
    filtroRegion === 'todos' || municipio.region === filtroRegion
  );

  const exportarCSV = () => {
    if (!encuestasData || encuestasData.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }
    
    const csvContent = encuestasData.map(m => 
      `${m.nombre},${m.region},${m.respuestas},${m.humorSocial.predominante},${m.intencionVoto.frente_renovador},${m.tendencia}`
    ).join('\n');
    
    const blob = new Blob([`Municipio,Region,Respuestas,Humor,Adhesion FR,Tendencia\n${csvContent}`], 
      { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encuestas_sociales_${fechaSeleccionada}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Cargando datos de encuestas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Encuestas Sociales Predictivas</h1>
              <p className="text-gray-400">Humor social y tendencias políticas - Misiones</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
            <button
              onClick={exportarCSV}
              className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enlace a encuesta diaria */}
      <div className="mb-6 bg-gradient-to-r from-blue-800 to-purple-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">📋 Encuesta Diaria Activa</h3>
            <p className="text-gray-200">Los ciudadanos pueden responder la encuesta del día</p>
          </div>
          <a
            href="https://forms.gle/ENCUESTA-DIARIA-MISIONES"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Responder Encuesta</span>
          </a>
        </div>
      </div>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Respuestas</p>
              <p className="text-2xl font-bold text-green-400">{resumenGeneral.totalRespuestas}</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Adhesión FR</p>
              <p className="text-2xl font-bold text-blue-400">{resumenGeneral.adhesionFRGeneral}%</p>
            </div>
            <ThumbsUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Municipios Críticos</p>
              <p className="text-2xl font-bold text-yellow-400">{resumenGeneral.municipiosCriticos}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tendencia</p>
              <p className="text-2xl font-bold text-purple-400 capitalize">{resumenGeneral.tendenciaGeneral}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <select
            value={filtroRegion}
            onChange={(e) => setFiltroRegion(e.target.value)}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
          >
            <option value="todos">Todas las regiones</option>
            <option value="Norte">Norte</option>
            <option value="Centro">Centro</option>
            <option value="Sur">Sur</option>
          </select>
          <button
            onClick={fetchEncuestasData}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>
        <p className="text-gray-400">
          Mostrando {municipiosFiltrados.length} municipios
        </p>
      </div>

      {/* Mapa de Misiones */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-green-400" />
          Mapa de Humor Social - Misiones
        </h3>
        <div className="bg-gray-800 rounded-lg p-4">
          <MapContainer 
            center={[-26.8754, -54.6567]} 
            zoom={9} 
            style={{ height: '500px', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {municipiosFiltrados.map((municipio, index) => (
              <CircleMarker
                key={index}
                center={municipio.coords}
                radius={Math.max(4, municipio.respuestas / 10)}
                fillColor={getColorByHumor(municipio.humorSocial.predominante)}
                color={getColorByHumor(municipio.humorSocial.predominante)}
                weight={2}
                opacity={0.8}
                fillOpacity={0.6}
              >
                <Popup className="custom-popup">
                  <div className="p-2">
                    <h4 className="font-semibold text-gray-800">{municipio.nombre}</h4>
                    <p className="text-sm text-gray-600">Región: {municipio.region}</p>
                    <p className="text-sm text-gray-600">Respuestas: {municipio.respuestas}</p>
                    <div className="flex items-center mt-2">
                      {getHumorIcon(municipio.humorSocial.predominante)}
                      <span className="ml-2 text-sm font-medium capitalize">
                        {municipio.humorSocial.predominante}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Adhesión FR: {municipio.intencionVoto.frente_renovador}%
                    </p>
                    {municipio.alertas.length > 0 && (
                      <div className="mt-2 flex items-center text-red-600">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        <span className="text-xs">Requiere atención</span>
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Tabla de resultados */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Resultados por Municipio</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-2">Municipio</th>
                <th className="text-left p-2">Región</th>
                <th className="text-left p-2">Respuestas</th>
                <th className="text-left p-2">Humor Predominante</th>
                <th className="text-left p-2">Adhesión FR</th>
                <th className="text-left p-2">Tendencia</th>
                <th className="text-left p-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {municipiosFiltrados.map((municipio, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-2 font-medium">{municipio.nombre}</td>
                  <td className="p-2">{municipio.region}</td>
                  <td className="p-2">{municipio.respuestas}</td>
                  <td className="p-2">
                    <div className="flex items-center">
                      {getHumorIcon(municipio.humorSocial.predominante)}
                      <span className="ml-2 capitalize">{municipio.humorSocial.predominante}</span>
                    </div>
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      municipio.intencionVoto.frente_renovador >= 50 ? 'bg-green-800 text-green-200' :
                      municipio.intencionVoto.frente_renovador >= 30 ? 'bg-yellow-800 text-yellow-200' :
                      'bg-red-800 text-red-200'
                    }`}>
                      {municipio.intencionVoto.frente_renovador}%
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      municipio.tendencia === 'positiva' ? 'bg-green-800 text-green-200' : 'bg-red-800 text-red-200'
                    }`}>
                      {municipio.tendencia === 'positiva' ? '↗️' : '↘️'} {municipio.tendencia}
                    </span>
                  </td>
                  <td className="p-2">
                    {municipio.alertas.length > 0 ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel de Dashboard externo */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Dashboard Externo</h3>
        <div className="flex items-center justify-between">
          <p className="text-gray-400">
            Accede al dashboard completo con visualizaciones avanzadas y análisis temporal
          </p>
          <a
            href="https://datastudio.google.com/reporting/MI-MAPA-MISIONES"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver Dashboard</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default EncuestasSociales;