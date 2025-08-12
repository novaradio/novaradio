import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Calendar, AlertTriangle, CheckCircle, Target, TrendingUp, Users, Download, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const InformeDiario = () => {
  const [informe, setInforme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSection, setSelectedSection] = useState('resumen');

  useEffect(() => {
    cargarInforme();
  }, [selectedDate]);

  const cargarInforme = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/informe-diario`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { fecha: selectedDate }
      });
      
      setInforme(response.data.data);
      
    } catch (error) {
      console.error('Error cargando informe:', error);
      toast.error('Error al cargar el informe diario');
    } finally {
      setLoading(false);
    }
  };

  const descargarInformePDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/informe-diario/pdf-data`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { fecha: selectedDate }
      });
      
      // Simular descarga (en producción se generaría PDF real)
      const dataStr = JSON.stringify(response.data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `informe-diario-${selectedDate}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Datos del informe descargados');
      
    } catch (error) {
      console.error('Error descargando informe:', error);
      toast.error('Error al generar el informe');
    }
  };

  const getSituationColor = (situacion) => {
    switch(situacion) {
      case 'Favorable': return 'text-green-400';
      case 'Desafiante': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getSituationIcon = (situacion) => {
    switch(situacion) {
      case 'Favorable': return '✅';
      case 'Desafiante': return '⚠️';
      default: return '📊';
    }
  };

  const getPriorityColor = (prioridad) => {
    switch(prioridad) {
      case 'Alta': return 'bg-red-600';
      case 'Media': return 'bg-orange-600';
      default: return 'bg-blue-600';
    }
  };

  if (loading && !informe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-green-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Generando informe diario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <FileText className="w-12 h-12 text-green-400 mr-3" />
          <Calendar className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">
          📋 Informe Diario
        </h1>
        <p className="text-gray-400 text-lg">
          Análisis y recomendaciones - {informe?.encabezado?.titulo || 'Frente Renovador'}
        </p>
      </div>

      {/* Controls */}
      <div className="dami-card mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha del informe:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-green-400"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Sección:</label>
              <select 
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-green-400"
              >
                <option value="resumen">Resumen Ejecutivo</option>
                <option value="actividad">Análisis de Actividad</option>
                <option value="territorial">Análisis Territorial</option>
                <option value="recomendaciones">Recomendaciones</option>
                <option value="alertas">Alertas y Riesgos</option>
                <option value="accion">Plan de Acción</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={cargarInforme}
              disabled={loading}
              className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            
            <button
              onClick={descargarInformePDF}
              className="flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition"
            >
              <Download className="w-4 h-4 mr-1" />
              Descargar
            </button>
          </div>
        </div>
      </div>

      {informe && (
        <>
          {/* Resumen Ejecutivo */}
          {selectedSection === 'resumen' && (
            <div className="space-y-6">
              {/* Situación General */}
              <div className="dami-card">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <Target className="w-6 h-6 mr-2" />
                  Resumen Ejecutivo
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-3xl mb-2">{getSituationIcon(informe.resumen_ejecutivo.situacion_general)}</div>
                    <div className={`text-xl font-bold mb-1 ${getSituationColor(informe.resumen_ejecutivo.situacion_general)}`}>
                      {informe.resumen_ejecutivo.situacion_general}
                    </div>
                    <div className="text-sm text-gray-400">Situación General</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-white mb-1">
                      {informe.resumen_ejecutivo.menciones_total.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Total Menciones</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-xl font-bold text-white mb-1">
                      {informe.resumen_ejecutivo.nivel_actividad}
                    </div>
                    <div className="text-sm text-gray-400">Nivel de Actividad</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-800 rounded-lg mb-6">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {informe.resumen_ejecutivo.descripcion}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-green-400 mb-3">Puntos Clave del Día</h3>
                  <ul className="space-y-2">
                    {informe.resumen_ejecutivo.puntos_clave.map((punto, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{punto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Métricas KPI */}
              <div className="dami-card">
                <h2 className="text-2xl font-semibold text-white mb-6">📊 KPIs del Día</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {informe.metricas_kpi.alcance_digital.impresiones_total.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Impresiones Totales</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {informe.metricas_kpi.engagement.rate_promedio}%
                    </div>
                    <div className="text-sm text-gray-400">Engagement Rate</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {informe.metricas_kpi.sentimiento.score_general > 0 ? '+' : ''}{informe.metricas_kpi.sentimiento.score_general}
                    </div>
                    <div className="text-sm text-gray-400">Score Sentimiento</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      {informe.metricas_kpi.territorial.municipios_activos}
                    </div>
                    <div className="text-sm text-gray-400">Municipios Activos</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Análisis de Actividad */}
          {selectedSection === 'actividad' && (
            <div className="space-y-6">
              <div className="dami-card">
                <h2 className="text-2xl font-semibold text-white mb-6">📈 Análisis de Actividad</h2>
                
                {/* Picos de Actividad */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-green-400 mb-4">Picos de Actividad</h3>
                  <div className="space-y-4">
                    {informe.analisis_de_actividad.picos_de_actividad.map((pico, index) => (
                      <div key={index} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-white">{pico.horario}</h4>
                            <p className="text-sm text-green-400">{pico.tipo}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{pico.volumen}</div>
                            <div className="text-xs text-gray-400">menciones</div>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-2">{pico.descripcion}</p>
                        <div className="flex flex-wrap gap-2">
                          {pico.redes_principales.map((red, idx) => (
                            <span key={idx} className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs">
                              {red}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Temas Trending */}
                <div>
                  <h3 className="text-lg font-medium text-green-400 mb-4">Temas en Tendencia</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {informe.analisis_de_actividad.temas_trending.map((tema, index) => (
                      <div key={index} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{tema.tema}</h4>
                          <span className={`px-2 py-1 rounded text-xs ${
                            tema.sentimiento === 'Positivo' ? 'bg-green-600' :
                            tema.sentimiento === 'Negativo' ? 'bg-red-600' : 'bg-gray-600'
                          } text-white`}>
                            {tema.sentimiento}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-white mb-2">{tema.menciones} menciones</div>
                        <div className="flex flex-wrap gap-1">
                          {tema.palabras_clave.map((palabra, idx) => (
                            <span key={idx} className="inline-block bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                              {palabra}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Análisis Territorial */}
          {selectedSection === 'territorial' && (
            <div className="space-y-6">
              <div className="dami-card">
                <h2 className="text-2xl font-semibold text-white mb-6">🗺️ Análisis Territorial</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {informe.analisis_territorial.analisis_municipal.map((municipio, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-white">{municipio.municipio}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          municipio.nivel_actividad === 'Alta' ? 'bg-red-600' :
                          municipio.nivel_actividad === 'Media' ? 'bg-orange-600' : 'bg-green-600'
                        } text-white`}>
                          {municipio.nivel_actividad}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-400">Menciones:</span>
                          <span className="text-white font-medium">{municipio.menciones}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-400">Sentimiento:</span>
                          <span className={`text-sm font-medium ${
                            municipio.sentimiento_predominante === 'Positivo' ? 'text-green-400' :
                            municipio.sentimiento_predominante === 'Negativo' ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {municipio.sentimiento_predominante}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <div className="text-sm text-gray-400 mb-1">Temas principales:</div>
                        <div className="flex flex-wrap gap-1">
                          {municipio.temas_principales.map((tema, idx) => (
                            <span key={idx} className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs">
                              {tema}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-300">{municipio.observaciones}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recomendaciones */}
          {selectedSection === 'recomendaciones' && (
            <div className="space-y-6">
              <div className="dami-card">
                <h2 className="text-2xl font-semibold text-white mb-6">🎯 Recomendaciones Estratégicas</h2>
                
                <div className="space-y-4">
                  {informe.recomendaciones_estrategicas.map((rec, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg border-l-4 border-green-400">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white mb-2 ${getPriorityColor(rec.prioridad)}`}>
                            {rec.prioridad} PRIORIDAD
                          </span>
                          <h3 className="font-semibold text-white">{rec.area}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">Plazo:</div>
                          <div className="text-sm font-medium text-yellow-400">{rec.plazo}</div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-green-400 mb-1">Acción Recomendada:</h4>
                        <p className="text-gray-300">{rec.accion}</p>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-blue-400 mb-1">Justificación:</h4>
                        <p className="text-gray-300">{rec.justificacion}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-purple-400 mb-1">Recursos Necesarios:</h4>
                        <div className="flex flex-wrap gap-1">
                          {rec.recursos_necesarios.map((recurso, idx) => (
                            <span key={idx} className="inline-block bg-purple-600 text-white px-2 py-1 rounded text-xs">
                              {recurso}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Alertas y Riesgos */}
          {selectedSection === 'alertas' && (
            <div className="space-y-6">
              <div className="dami-card">
                <h2 className="text-2xl font-semibold text-white mb-6">⚠️ Alertas y Riesgos</h2>
                
                {informe.alertas_y_riesgos.length > 0 ? (
                  <div className="space-y-4">
                    {informe.alertas_y_riesgos.map((alerta, index) => (
                      <div key={index} className={`p-4 rounded-lg border-l-4 ${
                        alerta.nivel === 'Alto' ? 'bg-red-900 bg-opacity-30 border-red-400' :
                        alerta.nivel === 'Medio' ? 'bg-orange-900 bg-opacity-30 border-orange-400' :
                        'bg-yellow-900 bg-opacity-30 border-yellow-400'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white mb-2 ${
                              alerta.nivel === 'Alto' ? 'bg-red-600' :
                              alerta.nivel === 'Medio' ? 'bg-orange-600' : 'bg-yellow-600'
                            }`}>
                              NIVEL {alerta.nivel.toUpperCase()}
                            </span>
                            <h3 className="font-semibold text-white">{alerta.tipo}</h3>
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          <p className="text-gray-300 mb-2">{alerta.descripcion}</p>
                        </div>
                        
                        <div className="p-3 bg-gray-700 rounded">
                          <h4 className="text-sm font-medium text-green-400 mb-1">Recomendación:</h4>
                          <p className="text-gray-300">{alerta.recomendacion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <p className="text-gray-400">No se detectaron alertas críticas para hoy</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plan de Acción */}
          {selectedSection === 'accion' && (
            <div className="space-y-6">
              <div className="dami-card">
                <h2 className="text-2xl font-semibold text-white mb-6">⚡ Plan de Acción - Próximas 24h</h2>
                
                {/* Acciones Inmediatas */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-red-400 mb-4">🚨 Acciones Inmediatas</h3>
                  <div className="space-y-3">
                    {informe.plan_accion_24h.acciones_inmediatas.map((accion, index) => (
                      <div key={index} className="p-4 bg-red-900 bg-opacity-20 rounded-lg border border-red-400">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{accion.accion}</h4>
                          <span className="text-sm text-red-400 font-medium">{accion.horario}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">
                            <strong>Responsable:</strong> {accion.responsable}
                          </span>
                          <div className="flex space-x-1">
                            {accion.plataformas.map((plataforma, idx) => (
                              <span key={idx} className="inline-block bg-red-600 text-white px-2 py-1 rounded text-xs">
                                {plataforma}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acciones Programadas */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-blue-400 mb-4">📅 Acciones Programadas</h3>
                  <div className="space-y-3">
                    {informe.plan_accion_24h.acciones_programadas.map((accion, index) => (
                      <div key={index} className="p-4 bg-blue-900 bg-opacity-20 rounded-lg border border-blue-400">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white">{accion.accion}</h4>
                          <span className="text-sm text-blue-400 font-medium">{accion.fecha}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">
                            <strong>Responsable:</strong> {accion.responsable}
                          </span>
                          <div className="flex space-x-1">
                            {accion.recursos.map((recurso, idx) => (
                              <span key={idx} className="inline-block bg-blue-600 text-white px-2 py-1 rounded text-xs">
                                {recurso}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seguimientos */}
                <div>
                  <h3 className="text-lg font-medium text-green-400 mb-4">🔍 Seguimientos Requeridos</h3>
                  <ul className="space-y-2">
                    {informe.plan_accion_24h.seguimientos_requeridos.map((seguimiento, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{seguimiento}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InformeDiario;