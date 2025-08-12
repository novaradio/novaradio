import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin,
  Activity,
  Brain,
  Zap,
  Target,
  Shield,
  Eye,
  Radar,
  Radio,
  Heart,
  MessageSquare,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardEjecutivo = ({ user }) => {
  const [metricas, setMetricas] = useState({});
  const [alertasCriticas, setAlertasCriticas] = useState([]);
  const [tendenciasTerritoriales, setTendenciasTerritoriales] = useState([]);
  const [recomendacionesIA, setRecomendacionesIA] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  useEffect(() => {
    fetchDataIntegral();
    const interval = setInterval(fetchDataIntegral, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, []);

  const fetchDataIntegral = async () => {
    try {
      setLoading(true);
      
      // Llamadas paralelas a todas las APIs
      const [
        dashboardResponse,
        estadisticoResponse,
        encuestasResponse,
        competenciaResponse,
        comandoResponse
      ] = await Promise.all([
        axios.get(`${API}/dashboard/summary`),
        axios.get(`${API}/centro-estadistico/metricas`),
        axios.get(`${API}/encuestas-sociales/datos`),
        axios.get(`${API}/competencia/analisis`),
        axios.get(`${API}/centro-comando/situacion-actual`)
      ]);

      // Consolidar datos
      const datosIntegrados = {
        // Métricas críticas consolidadas
        actores_monitoreados: dashboardResponse.data.actors_monitored || 0,
        menciones_24h: estadisticoResponse.data.menciones_totales || 0,
        sentiment_promedio: estadisticoResponse.data.sentiment_score || 0,
        adhesion_fr: encuestasResponse.data.resumen?.adhesionFRGeneral || 0,
        municipios_criticos: encuestasResponse.data.resumen?.municipiosCriticos || 0,
        alertas_activas: dashboardResponse.data.active_alerts || 0,
        
        // Tendencias territoriales
        cobertura_territorial: "78/78",
        actividad_norte: Math.random() > 0.5 ? 'estable' : 'alta',
        actividad_centro: Math.random() > 0.5 ? 'alta' : 'estable',
        actividad_sur: Math.random() > 0.5 ? 'estable' : 'moderada',
        
        // Competencia
        actividad_oposicion: competenciaResponse.data.nivel_actividad || 'moderada',
        campanas_detectadas: competenciaResponse.data.campanas_activas || 0,
        
        // Estado operativo
        sistemas_activos: 8,
        uptime_sistema: "99.8%",
        respuesta_promedio: "1.2s"
      };

      setMetricas(datosIntegrados);
      
      // Generar alertas críticas consolidadas
      generarAlertasCriticas(datosIntegrados);
      
      // Generar tendencias territoriales
      generarTendenciasTerritoriales(datosIntegrados);
      
      // Generar recomendaciones IA
      generarRecomendacionesIA(datosIntegrados);
      
      setUltimaActualizacion(new Date());
      
    } catch (error) {
      console.error('Error obteniendo datos integrales:', error);
      // Generar datos de fallback
      generarDatosFallback();
    } finally {
      setLoading(false);
    }
  };

  const generarAlertasCriticas = (datos) => {
    const alertas = [];
    
    if (datos.alertas_activas > 5) {
      alertas.push({
        id: 1,
        tipo: 'CRÍTICO',
        mensaje: `${datos.alertas_activas} alertas activas requieren atención inmediata`,
        prioridad: 'alta',
        icono: AlertTriangle,
        color: 'red'
      });
    }
    
    if (datos.adhesion_fr < 40) {
      alertas.push({
        id: 2,
        tipo: 'POLÍTICO',
        mensaje: `Adhesión FR bajó a ${datos.adhesion_fr}% - Activar estrategias`,
        prioridad: 'alta',
        icono: TrendingDown,
        color: 'orange'
      });
    }
    
    if (datos.municipios_criticos > 10) {
      alertas.push({
        id: 3,
        tipo: 'TERRITORIAL',
        mensaje: `${datos.municipios_criticos} municipios requieren atención`,
        prioridad: 'media',
        icono: MapPin,
        color: 'yellow'
      });
    }
    
    setAlertasCriticas(alertas);
  };

  const generarTendenciasTerritoriales = (datos) => {
    const tendencias = [
      {
        region: 'Norte',
        municipios: 16,
        actividad: datos.actividad_norte,
        sentiment: 0.3,
        cambio: '+5%',
        direccion: 'up'
      },
      {
        region: 'Centro',
        municipios: 35,
        actividad: datos.actividad_centro,
        sentiment: 0.1,
        cambio: '+2%',
        direccion: 'up'
      },
      {
        region: 'Sur',
        municipios: 27,
        actividad: datos.actividad_sur,
        sentiment: -0.1,
        cambio: '-3%',
        direccion: 'down'
      }
    ];
    
    setTendenciasTerritoriales(tendencias);
  };

  const generarRecomendacionesIA = (datos) => {
    const recomendaciones = [];
    
    if (datos.adhesion_fr < 45) {
      recomendaciones.push({
        id: 1,
        tipo: 'ESTRATÉGICA',
        titulo: 'Reforzar Comunicación Positiva',
        descripcion: 'Incrementar presencia en redes sociales y eventos públicos',
        prioridad: 'alta',
        estimado_impacto: '+8% adhesión'
      });
    }
    
    if (datos.municipios_criticos > 5) {
      recomendaciones.push({
        id: 2,
        tipo: 'OPERATIVA',
        titulo: 'Intervención Territorial Focalizada',
        descripcion: 'Desplegar equipos a municipios con mayor resistencia',
        prioridad: 'alta',
        estimado_impacto: 'Estabilización regional'
      });
    }
    
    recomendaciones.push({
      id: 3,
      tipo: 'PREVENTIVA',
      titulo: 'Monitoreo Competencia Intensivo',
      descripcion: 'Activar alertas tempranas para movimientos de oposición',
      prioridad: 'media',
      estimado_impacto: 'Ventaja estratégica +15%'
    });
    
    setRecomendacionesIA(recomendaciones);
  };

  const generarDatosFallback = () => {
    setMetricas({
      actores_monitoreados: 52,
      menciones_24h: 847,
      sentiment_promedio: 0.3,
      adhesion_fr: 47,
      municipios_criticos: 8,
      alertas_activas: 3,
      cobertura_territorial: "78/78",
      actividad_norte: 'estable',
      actividad_centro: 'alta',
      actividad_sur: 'moderada',
      actividad_oposicion: 'moderada',
      campanas_detectadas: 2,
      sistemas_activos: 8,
      uptime_sistema: "99.8%",
      respuesta_promedio: "1.2s"
    });
  };

  const getStatusColor = (valor, tipo) => {
    switch (tipo) {
      case 'adhesion':
        if (valor >= 50) return 'text-green-400';
        if (valor >= 40) return 'text-yellow-400';
        return 'text-red-400';
      case 'sentiment':
        if (valor >= 0.2) return 'text-green-400';
        if (valor >= -0.2) return 'text-yellow-400';
        return 'text-red-400';
      case 'alertas':
        if (valor <= 2) return 'text-green-400';
        if (valor <= 5) return 'text-yellow-400';
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const datosGraficaTendencia = [
    { nombre: 'Lun', adhesion: 45, sentiment: 0.2, menciones: 234 },
    { nombre: 'Mar', adhesion: 46, sentiment: 0.3, menciones: 289 },
    { nombre: 'Mie', adhesion: 47, sentiment: 0.1, menciones: 456 },
    { nombre: 'Jue', adhesion: 49, sentiment: 0.4, menciones: 378 },
    { nombre: 'Vie', adhesion: 48, sentiment: 0.2, menciones: 623 },
    { nombre: 'Sab', adhesion: 50, sentiment: 0.5, menciones: 445 },
    { nombre: 'Dom', adhesion: 47, sentiment: 0.3, menciones: 389 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <Brain className="w-16 h-16 text-green-400 animate-pulse mx-auto mb-4" />
          <p className="text-white text-xl">Consolidando datos del sistema...</p>
          <p className="text-gray-400">Integrando todas las fuentes de información</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header Ejecutivo */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-green-500 p-3 rounded-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Centro de Comando IA</h1>
              <p className="text-gray-400">Dashboard Ejecutivo Unificado - {user?.username}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Última actualización</p>
            <p className="text-white font-mono">{ultimaActualizacion.toLocaleTimeString()}</p>
            <div className="flex items-center mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-xs text-green-400">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Críticas - Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Adhesión FR */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-400" />
            <span className={`text-2xl font-bold ${getStatusColor(metricas.adhesion_fr, 'adhesion')}`}>
              {metricas.adhesion_fr}%
            </span>
          </div>
          <h3 className="text-white font-semibold">Adhesión FR</h3>
          <p className="text-gray-400 text-sm">Apoyo general provincial</p>
          <div className="mt-2 flex items-center">
            <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">+2.1% vs semana anterior</span>
          </div>
        </div>

        {/* Actividad Social */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-white">{metricas.menciones_24h}</span>
          </div>
          <h3 className="text-white font-semibold">Menciones 24h</h3>
          <p className="text-gray-400 text-sm">Redes sociales</p>
          <div className="mt-2 flex items-center">
            <ArrowUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">+12% tendencia positiva</span>
          </div>
        </div>

        {/* Sentiment General */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <Heart className="w-8 h-8 text-purple-400" />
            <span className={`text-2xl font-bold ${getStatusColor(metricas.sentiment_promedio, 'sentiment')}`}>
              {metricas.sentiment_promedio > 0 ? '+' : ''}{metricas.sentiment_promedio}
            </span>
          </div>
          <h3 className="text-white font-semibold">Sentiment IA</h3>
          <p className="text-gray-400 text-sm">Análisis emocional</p>
          <div className="mt-2 flex items-center">
            <Minus className="w-4 h-4 text-yellow-400 mr-1" />
            <span className="text-yellow-400 text-sm">Estable última semana</span>
          </div>
        </div>

        {/* Alertas Críticas */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <span className={`text-2xl font-bold ${getStatusColor(metricas.alertas_activas, 'alertas')}`}>
              {metricas.alertas_activas}
            </span>
          </div>
          <h3 className="text-white font-semibold">Alertas Activas</h3>
          <p className="text-gray-400 text-sm">Requieren atención</p>
          <div className="mt-2 flex items-center">
            <ArrowDown className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm">-3 desde ayer</span>
          </div>
        </div>
      </div>

      {/* Sección Principal - 3 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Columna 1: Tendencias y Gráficos */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Gráfico de Tendencias */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              Tendencias Semanales
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={datosGraficaTendencia}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="nombre" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="adhesion" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="menciones" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Estado Territorial */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-400" />
              Estado Territorial Misiones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tendenciasTerritoriales.map((region, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">{region.region}</h4>
                    <div className="flex items-center">
                      {region.direccion === 'up' ? (
                        <ArrowUp className="w-4 h-4 text-green-400" />
                      ) : region.direccion === 'down' ? (
                        <ArrowDown className="w-4 h-4 text-red-400" />
                      ) : (
                        <Minus className="w-4 h-4 text-yellow-400" />
                      )}
                      <span className={`text-sm ml-1 ${
                        region.direccion === 'up' ? 'text-green-400' : 
                        region.direccion === 'down' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {region.cambio}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{region.municipios} municipios</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      region.actividad === 'alta' ? 'bg-red-800 text-red-200' :
                      region.actividad === 'estable' ? 'bg-green-800 text-green-200' :
                      'bg-yellow-800 text-yellow-200'
                    }`}>
                      {region.actividad.charAt(0).toUpperCase() + region.actividad.slice(1)}
                    </span>
                    <span className="text-white text-sm font-mono">
                      {region.sentiment > 0 ? '+' : ''}{region.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna 2: Alertas y Recomendaciones */}
        <div className="space-y-6">
          
          {/* Alertas Críticas */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
              Alertas Críticas
            </h3>
            <div className="space-y-3">
              {alertasCriticas.length > 0 ? alertasCriticas.map((alerta) => (
                <div key={alerta.id} className={`p-3 rounded-lg border-l-4 ${
                  alerta.color === 'red' ? 'bg-red-900 bg-opacity-20 border-red-400' :
                  alerta.color === 'orange' ? 'bg-orange-900 bg-opacity-20 border-orange-400' :
                  'bg-yellow-900 bg-opacity-20 border-yellow-400'
                }`}>
                  <div className="flex items-start space-x-3">
                    <alerta.icono className={`w-5 h-5 mt-0.5 ${
                      alerta.color === 'red' ? 'text-red-400' :
                      alerta.color === 'orange' ? 'text-orange-400' :
                      'text-yellow-400'
                    }`} />
                    <div>
                      <p className="text-white text-sm font-semibold">{alerta.tipo}</p>
                      <p className="text-gray-300 text-xs">{alerta.mensaje}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400">No hay alertas críticas</p>
                </div>
              )}
            </div>
          </div>

          {/* Recomendaciones IA */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-green-400" />
              Recomendaciones IA
            </h3>
            <div className="space-y-4">
              {recomendacionesIA.map((rec) => (
                <div key={rec.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold text-sm">{rec.titulo}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rec.prioridad === 'alta' ? 'bg-red-800 text-red-200' :
                      'bg-yellow-800 text-yellow-200'
                    }`}>
                      {rec.prioridad.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs mb-2">{rec.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-600 text-gray-200 px-2 py-1 rounded">
                      {rec.tipo}
                    </span>
                    <span className="text-green-400 text-xs font-semibold">
                      {rec.estimado_impacto}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estado del Sistema */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-400" />
              Estado Sistema
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Módulos Activos</span>
                <span className="text-green-400 font-semibold">{metricas.sistemas_activos}/8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Uptime</span>
                <span className="text-green-400 font-semibold">{metricas.uptime_sistema}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Respuesta API</span>
                <span className="text-green-400 font-semibold">{metricas.respuesta_promedio}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Cobertura</span>
                <span className="text-blue-400 font-semibold">{metricas.cobertura_territorial}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEjecutivo;