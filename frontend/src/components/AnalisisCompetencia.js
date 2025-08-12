import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Target,
  Users,
  MapPin,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  Zap,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AnalisisCompetencia = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analisisCompleto, setAnalisisCompleto] = useState(null);
  const [vistaActual, setVistaActual] = useState('resumen');
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    cargarAnalisisCompleto();
    
    // Auto-refresh cada 5 minutos
    const interval = setInterval(() => {
      cargarAnalisisCompleto(true);
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);

  const cargarAnalisisCompleto = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await axios.get(`${API}/analisis-competencia/completo`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setAnalisisCompleto(response.data.data);
        setLastUpdate(new Date().toLocaleTimeString());
        
        if (isRefresh) {
          toast.success('Análisis de competencia actualizado');
        }
      } else {
        throw new Error('Error en respuesta del servidor');
      }
      
    } catch (error) {
      console.error('Error cargando análisis:', error);
      toast.error('Error cargando análisis de competencia');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getNivelAmenazaColor = (nivel) => {
    switch(nivel) {
      case 'CRÍTICO': return 'text-red-400 bg-red-900 border-red-400';
      case 'ALTO': return 'text-orange-400 bg-orange-900 border-orange-400';
      case 'MEDIO': return 'text-yellow-400 bg-yellow-900 border-yellow-400';
      case 'BAJO': return 'text-green-400 bg-green-900 border-green-400';
      default: return 'text-gray-400 bg-gray-900 border-gray-400';
    }
  };

  const getNivelRiesgoIcon = (nivel) => {
    switch(nivel) {
      case 'CRÍTICO': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'ALTO': return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'MEDIO': return <Eye className="w-5 h-5 text-yellow-400" />;
      case 'BAJO': return <CheckCircle className="w-5 h-5 text-green-400" />;
      default: return <Shield className="w-5 h-5 text-gray-400" />;
    }
  };

  const renderResumenEjecutivo = () => {
    const resumen = analisisCompleto?.resumen_ejecutivo || {};
    const comparativo = analisisCompleto?.analisis_comparativo || {};
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Métricas Principales */}
        <div className="dami-card">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-6 h-6 text-green-400 mr-2" />
            Métricas Generales
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-800 rounded">
              <div className="text-2xl font-bold text-blue-400">{resumen.partidos_monitoreados || 0}</div>
              <div className="text-sm text-gray-400">Partidos Monitoreados</div>
            </div>
            
            <div className="text-center p-4 bg-gray-800 rounded">
              <div className="text-2xl font-bold text-purple-400">{resumen.total_menciones_competencia || 0}</div>
              <div className="text-sm text-gray-400">Menciones Competencia</div>
            </div>
            
            <div className="text-center p-4 bg-gray-800 rounded">
              <div className="text-2xl font-bold text-red-400">{resumen.campañas_coordinadas_detectadas || 0}</div>
              <div className="text-sm text-gray-400">Campañas Coordinadas</div>
            </div>
            
            <div className={`text-center p-4 rounded border ${getNivelAmenazaColor(resumen.nivel_amenaza_general)}`}>
              <div className="text-lg font-bold">
                {resumen.nivel_amenaza_general || 'DESCONOCIDO'}
              </div>
              <div className="text-xs opacity-80">Nivel de Amenaza</div>
            </div>
          </div>
        </div>

        {/* Posición Competitiva */}
        <div className="dami-card">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Target className="w-6 h-6 text-green-400 mr-2" />
            Posición Competitiva
          </h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-gray-400">Posición General:</span>
              <span className={`ml-2 px-3 py-1 rounded font-semibold ${
                comparativo.posicion_general === 'DOMINANTE' ? 'bg-green-600 text-white' :
                comparativo.posicion_general === 'COMPETITIVA' ? 'bg-yellow-600 text-white' :
                'bg-red-600 text-white'
              }`}>
                {comparativo.posicion_general || 'DESCONOCIDA'}
              </span>
            </div>
            
            <div>
              <span className="text-gray-400">Principal Competidor:</span>
              <span className="ml-2 text-orange-400 font-medium">
                {comparativo.principal_competidor || 'Ninguno'}
              </span>
            </div>
            
            {comparativo.resumen_ventajas && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Ventajas del Frente Renovador:</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-green-400 font-bold">{comparativo.resumen_ventajas.menciones_superiores || 0}</div>
                    <div className="text-gray-400">+ Menciones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-bold">{comparativo.resumen_ventajas.sentiment_superior || 0}</div>
                    <div className="text-gray-400">+ Sentiment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-bold">{comparativo.resumen_ventajas.engagement_superior || 0}</div>
                    <div className="text-gray-400">+ Engagement</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderAnalisisPorPartido = () => {
    const partidos = analisisCompleto?.analisis_por_partido || {};
    
    return (
      <div className="space-y-6">
        {Object.entries(partidos).map(([partidoId, datos]) => {
          const info = datos.info_partido || {};
          const metricas = datos.metricas_generales || {};
          const riesgo = datos.riesgo_competitivo || {};
          
          return (
            <div key={partidoId} className="dami-card">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4">
                <div className="flex items-center mb-2 lg:mb-0">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: info.color || '#64748b' }}
                  ></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{info.nombre}</h3>
                    <p className="text-sm text-gray-400">{info.sigla} - {info.lider}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getNivelRiesgoIcon(riesgo.nivel_riesgo)}
                  <span className={`px-3 py-1 rounded text-sm font-medium ${getNivelAmenazaColor(riesgo.nivel_riesgo)}`}>
                    {riesgo.nivel_riesgo || 'DESCONOCIDO'}
                  </span>
                </div>
              </div>
              
              {/* Métricas del Partido */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-800 rounded">
                  <div className="text-lg font-bold text-blue-400">{metricas.total_menciones || 0}</div>
                  <div className="text-xs text-gray-400">Menciones</div>
                </div>
                
                <div className="text-center p-3 bg-gray-800 rounded">
                  <div className="text-lg font-bold text-green-400">
                    {metricas.sentiment_promedio ? (metricas.sentiment_promedio * 100).toFixed(1) : 0}%
                  </div>
                  <div className="text-xs text-gray-400">Sentiment</div>
                </div>
                
                <div className="text-center p-3 bg-gray-800 rounded">
                  <div className="text-lg font-bold text-purple-400">
                    {metricas.engagement_promedio ? metricas.engagement_promedio.toFixed(1) : 0}%
                  </div>
                  <div className="text-xs text-gray-400">Engagement</div>
                </div>
                
                <div className="text-center p-3 bg-gray-800 rounded">
                  <div className="text-lg font-bold text-orange-400">{riesgo.score_numerico || 0}</div>
                  <div className="text-xs text-gray-400">Score Riesgo</div>
                </div>
              </div>
              
              {/* Datos por Plataforma */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {['twitter', 'facebook', 'instagram'].map(plataforma => {
                  const datosPlatforma = datos.datos_por_plataforma?.[plataforma] || {};
                  return (
                    <div key={plataforma} className="bg-gray-800 p-3 rounded">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 capitalize">{plataforma}</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Menciones:</span>
                          <span className="text-white">{datosPlatforma.menciones || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sentiment:</span>
                          <span className={datosPlatforma.sentiment > 0 ? 'text-green-400' : 'text-red-400'}>
                            {datosPlatforma.sentiment ? (datosPlatforma.sentiment * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Engagement:</span>
                          <span className="text-purple-400">{datosPlatforma.engagement?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCampañasCoordinadas = () => {
    const campañas = analisisCompleto?.campañas_coordinadas || [];
    
    if (campañas.length === 0) {
      return (
        <div className="dami-card text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No se detectaron campañas coordinadas</h3>
          <p className="text-gray-400">El sistema no ha identificado actividad coordinada sospechosa entre partidos de oposición.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        {campañas.map((campaña, index) => (
          <div key={index} className="dami-card border-l-4 border-red-400">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-white capitalize">
                    {campaña.tipo_campaña?.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-sm text-gray-400">
                    Nivel de confianza: {(campaña.nivel_confianza * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              
              <span className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium">
                CRÍTICO
              </span>
            </div>
            
            <p className="text-gray-300 mb-4">{campaña.descripcion}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Partidos Involucrados:</h4>
                <ul className="space-y-1">
                  {campaña.partidos_involucrados?.map((partido, idx) => (
                    <li key={idx} className="text-sm text-orange-400 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {partido}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Acción Recomendada:</h4>
                <p className="text-sm text-yellow-400 bg-yellow-900 bg-opacity-30 p-2 rounded">
                  {campaña.accion_recomendada}
                </p>
              </div>
            </div>
            
            {campaña.hashtags_sospechosos && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Hashtags Sospechosos:</h4>
                <div className="flex flex-wrap gap-2">
                  {campaña.hashtags_sospechosos.map((hashtag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs">
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderInfluenciaTerritorial = () => {
    const influencia = analisisCompleto?.influencia_territorial || {};
    const analisis_municipal = influencia.analisis_municipal || {};
    const resumen = influencia.resumen_territorial || {};
    
    return (
      <div className="space-y-6">
        {/* Resumen Territorial */}
        <div className="dami-card">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <MapPin className="w-6 h-6 text-green-400 mr-2" />
            Resumen Territorial
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-900 bg-opacity-30 border border-green-400 rounded">
              <div className="text-2xl font-bold text-green-400">{resumen.municipios_seguros_fr || 0}</div>
              <div className="text-sm text-gray-300">Municipios Seguros FR</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-900 bg-opacity-30 border border-yellow-400 rounded">
              <div className="text-2xl font-bold text-yellow-400">{resumen.municipios_competitivos || 0}</div>
              <div className="text-sm text-gray-300">Municipios Competitivos</div>
            </div>
            
            <div className="text-center p-4 bg-red-900 bg-opacity-30 border border-red-400 rounded">
              <div className="text-lg font-bold text-red-400">{resumen.principal_competidor_territorial || 'Ninguno'}</div>
              <div className="text-sm text-gray-300">Principal Competidor</div>
            </div>
          </div>
        </div>
        
        {/* Análisis por Municipio */}
        <div className="dami-card">
          <h3 className="text-xl font-semibold text-white mb-4">Análisis Municipal Detallado</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.entries(analisis_municipal).map(([municipio, datos]) => (
              <div key={municipio} className="bg-gray-800 p-4 rounded">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">{municipio}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    datos.nivel_competencia === 'ALTA' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'
                  }`}>
                    {datos.nivel_competencia}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Dominante:</span>
                    <span className="text-sm font-medium text-green-400">{datos.partido_dominante}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Riesgo Alternancia:</span>
                    <span className={`text-sm ${datos.riesgo_alternancia ? 'text-red-400' : 'text-green-400'}`}>
                      {datos.riesgo_alternancia ? 'SÍ' : 'NO'}
                    </span>
                  </div>
                  
                  {/* Barra de influencias */}
                  <div className="mt-3">
                    <div className="text-xs text-gray-400 mb-1">Distribución de influencia:</div>
                    <div className="space-y-1">
                      {Object.entries(datos.influencias || {}).map(([partido, porcentaje]) => (
                        <div key={partido} className="flex items-center text-xs">
                          <span className="w-24 text-gray-300 truncate">{partido}:</span>
                          <div className="flex-1 bg-gray-700 rounded-full h-2 ml-2">
                            <div 
                              className={`h-2 rounded-full ${
                                partido === 'Frente Renovador' ? 'bg-green-400' : 'bg-orange-400'
                              }`}
                              style={{ width: `${porcentaje * 100}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-gray-400 w-12">{(porcentaje * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRecomendaciones = () => {
    const recomendaciones = analisisCompleto?.recomendaciones_estrategicas || [];
    
    const getPrioridadColor = (prioridad) => {
      switch(prioridad) {
        case 'CRÍTICA': return 'border-red-400 bg-red-900 bg-opacity-20';
        case 'ALTA': return 'border-orange-400 bg-orange-900 bg-opacity-20';
        case 'MEDIA': return 'border-yellow-400 bg-yellow-900 bg-opacity-20';
        default: return 'border-gray-400 bg-gray-900 bg-opacity-20';
      }
    };
    
    const getPrioridadIcon = (prioridad) => {
      switch(prioridad) {
        case 'CRÍTICA': return <Zap className="w-5 h-5 text-red-400" />;
        case 'ALTA': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
        case 'MEDIA': return <Eye className="w-5 h-5 text-yellow-400" />;
        default: return <CheckCircle className="w-5 h-5 text-gray-400" />;
      }
    };
    
    return (
      <div className="space-y-4">
        {recomendaciones.map((rec, index) => (
          <div key={index} className={`dami-card border-l-4 ${getPrioridadColor(rec.prioridad)}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {getPrioridadIcon(rec.prioridad)}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-white">{rec.accion}</h3>
                  <p className="text-sm text-gray-400 capitalize">{rec.categoria?.replace(/_/g, ' ')}</p>
                </div>
              </div>
              
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                rec.prioridad === 'CRÍTICA' ? 'bg-red-600 text-white' :
                rec.prioridad === 'ALTA' ? 'bg-orange-600 text-white' :
                'bg-yellow-600 text-white'
              }`}>
                {rec.prioridad}
              </span>
            </div>
            
            <p className="text-gray-300 mb-4">{rec.descripcion}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Recursos Necesarios:</h4>
                <ul className="space-y-1">
                  {rec.recursos_necesarios?.map((recurso, idx) => (
                    <li key={idx} className="text-sm text-blue-400 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {recurso}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Tiempo de Implementación:</h4>
                <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  {rec.tiempo_implementacion}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando análisis de competencia...</p>
        </div>
      </div>
    );
  }

  const vistas = [
    { id: 'resumen', label: 'Resumen Ejecutivo', icon: BarChart3 },
    { id: 'partidos', label: 'Por Partido', icon: Users },
    { id: 'campañas', label: 'Campañas Coordinadas', icon: AlertTriangle },
    { id: 'territorial', label: 'Influencia Territorial', icon: MapPin },
    { id: 'recomendaciones', label: 'Recomendaciones', icon: Target }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="w-12 h-12 text-green-400 mr-3" />
          <Target className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">
          🎯 Análisis de Competencia Política
        </h1>
        <p className="text-gray-400 text-lg">
          Monitoreo estratégico de partidos políticos y detección de amenazas
        </p>
      </div>

      {/* Controls */}
      <div className="dami-card">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <h2 className="text-2xl font-semibold text-white">📊 Centro de Análisis</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => cargarAnalisisCompleto(true)}
              disabled={refreshing}
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            {lastUpdate && (
              <span className="text-sm text-gray-400">
                Última actualización: {lastUpdate}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {vistas.map(vista => {
            const IconComponent = vista.icon;
            return (
              <button
                key={vista.id}
                onClick={() => setVistaActual(vista.id)}
                className={`flex items-center px-4 py-2 rounded transition ${
                  vistaActual === vista.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {vista.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div>
          {vistaActual === 'resumen' && renderResumenEjecutivo()}
          {vistaActual === 'partidos' && renderAnalisisPorPartido()}
          {vistaActual === 'campañas' && renderCampañasCoordinadas()}
          {vistaActual === 'territorial' && renderInfluenciaTerritorial()}
          {vistaActual === 'recomendaciones' && renderRecomendaciones()}
        </div>
      </div>

      {/* Footer con Metadata */}
      {analisisCompleto?.metadata && (
        <div className="dami-card">
          <h3 className="text-lg font-medium text-green-400 mb-3">🔍 Información del Análisis</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Algoritmo:</span>
              <p className="text-gray-300">{analisisCompleto.metadata.algoritmo_deteccion}</p>
            </div>
            <div>
              <span className="text-gray-400">Fuentes de Datos:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {analisisCompleto.metadata.fuentes_datos?.map((fuente, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                    {fuente}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Confiabilidad:</span>
              <span className="ml-2 text-green-400 font-medium">
                {(analisisCompleto.metadata.metrica_confiabilidad * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalisisCompetencia;