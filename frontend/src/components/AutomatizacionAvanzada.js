import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  FileText, 
  AlertTriangle, 
  BarChart3, 
  Settings,
  Activity,
  Send,
  Play,
  Pause,
  Wrench,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Shield,
  RefreshCw,
  Calendar,
  Users
} from 'lucide-react';

const AutomatizacionAvanzada = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [error, setError] = useState('');

  // Estados para formularios
  const [eventoForm, setEventoForm] = useState({
    tipo: 'critico',
    descripcion: '',
    gravedad: 0.8,
    contexto: '{}',
    origen_modulo: 'manual'
  });
  
  const [reporteForm, setReporteForm] = useState({
    tipo_reporte: 'urgente',
    contexto: '{}'
  });

  const [configForm, setConfigForm] = useState({
    respuestas_automaticas: true,
    generacion_reportes: true,
    alertas_preventivas: true,
    umbral_gravedad_critica: 0.8,
    umbral_gravedad_alta: 0.6,
    intervalo_reportes_minutos: 30,
    ventana_prediccion_horas: 24
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchData = async (endpoint, method = 'GET', body = null) => {
    try {
      setLoading(true);
      setError('');
      
      const config = {
        method,
        headers: getAuthHeaders()
      };
      
      if (body) {
        config.body = JSON.stringify(body);
      }
      
      const response = await fetch(`${BACKEND_URL}/api/automatizacion/${endpoint}`, config);
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

  const loadInitialData = async () => {
    const resumenData = await fetchData('resumen-completo');
    const estadisticasData = await fetchData('estadisticas');
    const alertasData = await fetchData('alertas-preventivas');
    
    setData({
      resumen: resumenData,
      estadisticas: estadisticasData,
      alertas: alertasData
    });
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const procesarEvento = async () => {
    try {
      const contexto = JSON.parse(eventoForm.contexto);
      const resultado = await fetchData('procesar-evento', 'POST', {
        ...eventoForm,
        contexto,
        gravedad: parseFloat(eventoForm.gravedad)
      });
      
      if (resultado) {
        setData(prev => ({ ...prev, ultimoEvento: resultado }));
        // Recargar datos para reflejar cambios
        loadInitialData();
      }
    } catch (error) {
      setError('Error procesando JSON del contexto: ' + error.message);
    }
  };

  const generarReporte = async () => {
    try {
      const contexto = JSON.parse(reporteForm.contexto);
      const resultado = await fetchData('generar-reporte', 'POST', {
        ...reporteForm,
        contexto
      });
      
      if (resultado) {
        setData(prev => ({ ...prev, ultimoReporte: resultado }));
      }
    } catch (error) {
      setError('Error procesando JSON del contexto: ' + error.message);
    }
  };

  const actualizarConfiguracion = async () => {
    const resultado = await fetchData('configurar', 'POST', {
      configuracion: configForm
    });
    
    if (resultado) {
      setData(prev => ({ ...prev, configuracion: resultado }));
      loadInitialData();
    }
  };

  const cambiarEstado = async (nuevoEstado) => {
    const resultado = await fetchData('cambiar-estado', 'POST', {
      estado: nuevoEstado
    });
    
    if (resultado) {
      setData(prev => ({ ...prev, estadoCambiado: resultado }));
      loadInitialData();
    }
  };

  const recargarAlertas = async () => {
    const alertasData = await fetchData('alertas-preventivas');
    setData(prev => ({ ...prev, alertas: alertasData }));
  };

  const renderResumenTab = () => (
    <div className="space-y-6">
      {data.resumen && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Bot className="mr-2 text-blue-600" size={20} />
            Sistema de Automatización Avanzada
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Estado del Sistema</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Estado:</span>
                  <span className={`font-medium px-2 py-1 rounded-full text-sm ${
                    data.resumen.sistema?.estado === 'activo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {data.resumen.sistema?.estado?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Versión:</span>
                  <span className="font-medium">{data.resumen.sistema?.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasa de Éxito:</span>
                  <span className="font-medium text-green-600">{data.resumen.sistema?.tasa_exito}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Actividad Reciente (24h)</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Eventos Procesados:</span>
                  <span className="font-medium">{data.resumen.actividad_reciente?.eventos_procesados_24h}</span>
                </div>
                <div className="flex justify-between">
                  <span>Respuestas Automáticas:</span>
                  <span className="font-medium">{data.resumen.actividad_reciente?.respuestas_automaticas_24h}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reportes Generados:</span>
                  <span className="font-medium">{data.resumen.actividad_reciente?.reportes_generados_semana}</span>
                </div>
              </div>
            </div>
          </div>
          
          {data.resumen.capacidades && (
            <div className="mt-6">
              <h4 className="font-semibold mb-4">Capacidades Automatizadas</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Zap className="mr-2 text-green-600" size={16} />
                    <span className="font-medium">Respuestas Automáticas</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Estado:</span>
                      <span className={data.resumen.capacidades.respuestas_automaticas?.activo ? 'text-green-600' : 'text-red-600'}>
                        {data.resumen.capacidades.respuestas_automaticas?.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                    <div className="text-xs mt-1">
                      {data.resumen.capacidades.respuestas_automaticas?.patrones_disponibles} patrones disponibles
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileText className="mr-2 text-blue-600" size={16} />
                    <span className="font-medium">Reportes IA</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Estado:</span>
                      <span className={data.resumen.capacidades.generacion_reportes?.activo ? 'text-green-600' : 'text-red-600'}>
                        {data.resumen.capacidades.generacion_reportes?.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                    <div className="text-xs mt-1">
                      {data.resumen.capacidades.generacion_reportes?.tipos_disponibles?.length} tipos disponibles
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <AlertTriangle className="mr-2 text-purple-600" size={16} />
                    <span className="font-medium">Alertas Preventivas</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Estado:</span>
                      <span className={data.resumen.capacidades.alertas_preventivas?.activo ? 'text-green-600' : 'text-red-600'}>
                        {data.resumen.capacidades.alertas_preventivas?.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                    <div className="text-xs mt-1">
                      Precisión: {data.resumen.capacidades.alertas_preventivas?.precision_modelo}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderEventosTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Zap className="mr-2 text-orange-600" size={20} />
          Procesamiento de Eventos Automático
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Evento</label>
              <select 
                value={eventoForm.tipo}
                onChange={(e) => setEventoForm(prev => ({...prev, tipo: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="critico">Crítico</option>
                <option value="alerta">Alerta</option>
                <option value="anomalia">Anomalía</option>
                <option value="prediccion">Predicción</option>
                <option value="rutina">Rutina</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Descripción</label>
              <textarea
                value={eventoForm.descripcion}
                onChange={(e) => setEventoForm(prev => ({...prev, descripcion: e.target.value}))}
                placeholder="Describe el evento detectado..."
                className="w-full p-2 border border-gray-300 rounded-md"
                rows="3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Gravedad (0.0 - 1.0)</label>
              <input
                type="number"
                value={eventoForm.gravedad}
                onChange={(e) => setEventoForm(prev => ({...prev, gravedad: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                max="1"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Contexto (JSON)</label>
              <textarea
                value={eventoForm.contexto}
                onChange={(e) => setEventoForm(prev => ({...prev, contexto: e.target.value}))}
                placeholder='{"cambio_sentiment": -0.4, "volumen": 150}'
                className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
                rows="3"
              />
            </div>
            
            <button
              onClick={procesarEvento}
              disabled={loading || !eventoForm.descripcion}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center justify-center"
            >
              <Send className="mr-2" size={16} />
              {loading ? 'Procesando...' : 'Procesar Evento'}
            </button>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Patrones de Respuesta Automática</h4>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-red-50 rounded border-l-4 border-red-500">
                <div className="font-medium">Caída Sentiment</div>
                <div className="text-gray-600">→ Campaña positiva automática (5min)</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                <div className="font-medium">Anomalía Volumen</div>
                <div className="text-gray-600">→ Monitoreo intensificado (1min)</div>
              </div>
              <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                <div className="font-medium">Actividad Competencia</div>
                <div className="text-gray-600">→ Alerta equipo comunicaciones (3min)</div>
              </div>
              <div className="p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                <div className="font-medium">Tendencia Negativa</div>
                <div className="text-gray-600">→ Reporte urgente (10min)</div>
              </div>
            </div>
          </div>
        </div>
        
        {data.ultimoEvento && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Último Evento Procesado</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Evento:</strong> {data.ultimoEvento.evento_procesado?.tipo}
                <br />
                <strong>Gravedad:</strong> {data.ultimoEvento.evento_procesado?.gravedad}
              </div>
              <div>
                <strong>Respuesta:</strong> {data.ultimoEvento.respuesta_automatica?.ejecutada ? 'Ejecutada' : 'No requerida'}
                <br />
                <strong>Acción:</strong> {data.ultimoEvento.respuesta_automatica?.accion || 'N/A'}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {data.ultimoEvento.respuesta_automatica?.mensaje}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderReportesTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FileText className="mr-2 text-green-600" size={20} />
          Generación Automática de Reportes IA
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Reporte</label>
              <select 
                value={reporteForm.tipo_reporte}
                onChange={(e) => setReporteForm(prev => ({...prev, tipo_reporte: e.target.value}))}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="urgente">Urgente</option>
                <option value="predictivo">Predictivo</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Contexto Adicional (JSON)</label>
              <textarea
                value={reporteForm.contexto}
                onChange={(e) => setReporteForm(prev => ({...prev, contexto: e.target.value}))}
                placeholder='{"situacion": "crisis", "urgencia": "alta"}'
                className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
                rows="3"
              />
            </div>
            
            <button
              onClick={generarReporte}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
            >
              <FileText className="mr-2" size={16} />
              {loading ? 'Generando...' : 'Generar Reporte IA'}
            </button>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Tipos de Reportes Disponibles</h4>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-blue-50 rounded">
                <div className="font-medium">📊 Diario</div>
                <div className="text-gray-600">Análisis completo de actividad diaria</div>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <div className="font-medium">📈 Semanal</div>
                <div className="text-gray-600">Tendencias y análisis consolidado</div>
              </div>
              <div className="p-3 bg-red-50 rounded">
                <div className="font-medium">🚨 Urgente</div>
                <div className="text-gray-600">Situaciones críticas inmediatas</div>
              </div>
              <div className="p-3 bg-green-50 rounded">
                <div className="font-medium">🔮 Predictivo</div>
                <div className="text-gray-600">Tendencias emergentes y predicciones</div>
              </div>
            </div>
          </div>
        </div>
        
        {data.ultimoReporte && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Último Reporte Generado</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Tipo:</strong> {data.ultimoReporte.reporte?.tipo}
                <br />
                <strong>Título:</strong> {data.ultimoReporte.reporte?.titulo}
                <br />
                <strong>Prioridad:</strong> 
                <span className={`ml-1 px-2 py-1 rounded text-xs ${
                  data.ultimoReporte.reporte?.prioridad === 'CRITICA' ? 'bg-red-100 text-red-800' :
                  data.ultimoReporte.reporte?.prioridad === 'ALTA' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {data.ultimoReporte.reporte?.prioridad}
                </span>
              </div>
              <div>
                <strong>Insights IA:</strong> {data.ultimoReporte.reporte?.insights_ia?.length}
                <br />
                <strong>Recomendaciones:</strong> {data.ultimoReporte.reporte?.recomendaciones?.length}
                <br />
                <strong>Destinatarios:</strong> {data.ultimoReporte.reporte?.destinatarios?.length}
              </div>
            </div>
            
            {data.ultimoReporte.reporte?.insights_ia && data.ultimoReporte.reporte.insights_ia.length > 0 && (
              <div className="mt-3">
                <strong className="text-sm">Insights IA:</strong>
                <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                  {data.ultimoReporte.reporte.insights_ia.slice(0, 3).map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderAlertasTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <AlertTriangle className="mr-2 text-red-600" size={20} />
            Alertas Preventivas Proactivas
          </h3>
          <button
            onClick={recargarAlertas}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm"
          >
            <RefreshCw className="mr-1" size={14} />
            Recargar
          </button>
        </div>
        
        {data.alertas?.estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total Alertas</div>
              <div className="text-2xl font-bold text-blue-600">
                {data.alertas.estadisticas.total_alertas}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Alertas Activas</div>
              <div className="text-2xl font-bold text-green-600">
                {data.alertas.estadisticas.alertas_activas}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Alta Probabilidad</div>
              <div className="text-2xl font-bold text-orange-600">
                {data.alertas.estadisticas.alta_probabilidad}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Probabilidad Promedio</div>
              <div className="text-2xl font-bold text-purple-600">
                {(data.alertas.estadisticas.probabilidad_promedio * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        )}
        
        {data.alertas?.alertas && data.alertas.alertas.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-semibold">Alertas Detectadas</h4>
            {data.alertas.alertas.map((alerta, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${
                alerta.probabilidad >= 0.8 ? 'bg-red-50 border-red-500' :
                alerta.probabilidad >= 0.7 ? 'bg-orange-50 border-orange-500' :
                'bg-yellow-50 border-yellow-500'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{alerta.descripcion}</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-600">
                      <div>
                        <strong>Tipo:</strong> {alerta.tipo}
                      </div>
                      <div>
                        <strong>Probabilidad:</strong> {(alerta.probabilidad * 100).toFixed(1)}%
                      </div>
                      <div>
                        <strong>Confianza:</strong> {(alerta.confianza_modelo * 100).toFixed(1)}%
                      </div>
                      <div>
                        <strong>Estado:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          alerta.estado === 'activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {alerta.estado}
                        </span>
                      </div>
                    </div>
                    
                    {alerta.acciones_preventivas && alerta.acciones_preventivas.length > 0 && (
                      <div className="mt-3">
                        <strong className="text-sm">Acciones Preventivas:</strong>
                        <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                          {alerta.acciones_preventivas.map((accion, i) => (
                            <li key={i}>{accion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {alerta.tiempo_restante_horas > 0 && (
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="mr-1" size={12} />
                        {alerta.tiempo_restante_horas.toFixed(1)}h restantes
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="mx-auto mb-2" size={48} />
            <div>No hay alertas preventivas activas</div>
            <div className="text-sm">El sistema está monitoreando continuamente</div>
          </div>
        )}
        
        {data.alertas?.recomendacion_sistema && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center">
              <Target className="mr-2 text-blue-600" size={16} />
              <strong className="text-blue-800">Recomendación del Sistema:</strong>
            </div>
            <div className="text-blue-700 mt-1">{data.alertas.recomendacion_sistema}</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderEstadisticasTab = () => (
    <div className="space-y-6">
      {data.estadisticas && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="mr-2 text-purple-600" size={20} />
            Estadísticas del Sistema
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Sistema</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span className={`font-medium ${
                    data.estadisticas.estado_sistema === 'activo' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {data.estadisticas.estado_sistema?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Eventos Procesados:</span>
                  <span className="font-medium">{data.estadisticas.eventos_procesados_total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Respuestas Ejecutadas:</span>
                  <span className="font-medium">{data.estadisticas.respuestas_ejecutadas_total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasa de Éxito:</span>
                  <span className="font-medium text-green-600">{data.estadisticas.tasa_exito_respuestas}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Rendimiento</h4>
              {data.estadisticas.rendimiento && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Eventos/Hora:</span>
                    <span className="font-medium">{data.estadisticas.rendimiento.eventos_por_hora?.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiempo Respuesta:</span>
                    <span className="font-medium">{data.estadisticas.rendimiento.tiempo_respuesta_promedio?.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alertas/Día:</span>
                    <span className="font-medium">{data.estadisticas.rendimiento.alertas_por_dia?.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Salud del Sistema</h4>
              {data.estadisticas.salud_sistema && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Disponibilidad:</span>
                    <span className="font-medium text-green-600">{data.estadisticas.salud_sistema.disponibilidad}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Memoria:</span>
                    <span className="font-medium">{data.estadisticas.salud_sistema.memoria_utilizada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CPU Promedio:</span>
                    <span className="font-medium">{data.estadisticas.salud_sistema.cpu_promedio}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Configuración Actual</h4>
            {data.estadisticas.configuracion && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center">
                  <CheckCircle className={`mr-2 ${data.estadisticas.configuracion.respuestas_automaticas ? 'text-green-600' : 'text-gray-400'}`} size={16} />
                  <span>Respuestas Automáticas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className={`mr-2 ${data.estadisticas.configuracion.generacion_reportes ? 'text-green-600' : 'text-gray-400'}`} size={16} />
                  <span>Generación Reportes</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className={`mr-2 ${data.estadisticas.configuracion.alertas_preventivas ? 'text-green-600' : 'text-gray-400'}`} size={16} />
                  <span>Alertas Preventivas</span>
                </div>
                <div className="text-gray-600">
                  Umbral Crítico: {data.estadisticas.configuracion.umbral_gravedad_critica}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderConfiguracionTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Settings className="mr-2 text-gray-600" size={20} />
          Configuración del Sistema
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold">Módulos</h4>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configForm.respuestas_automaticas}
                  onChange={(e) => setConfigForm(prev => ({...prev, respuestas_automaticas: e.target.checked}))}
                  className="mr-2"
                />
                <span>Respuestas Automáticas</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configForm.generacion_reportes}
                  onChange={(e) => setConfigForm(prev => ({...prev, generacion_reportes: e.target.checked}))}
                  className="mr-2"
                />
                <span>Generación de Reportes</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={configForm.alertas_preventivas}
                  onChange={(e) => setConfigForm(prev => ({...prev, alertas_preventivas: e.target.checked}))}
                  className="mr-2"
                />
                <span>Alertas Preventivas</span>
              </label>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Umbrales</h4>
            
            <div>
              <label className="block text-sm font-medium mb-1">Umbral Gravedad Crítica</label>
              <input
                type="number"
                value={configForm.umbral_gravedad_critica}
                onChange={(e) => setConfigForm(prev => ({...prev, umbral_gravedad_critica: parseFloat(e.target.value)}))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                max="1"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Umbral Gravedad Alta</label>
              <input
                type="number"
                value={configForm.umbral_gravedad_alta}
                onChange={(e) => setConfigForm(prev => ({...prev, umbral_gravedad_alta: parseFloat(e.target.value)}))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                max="1"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Intervalo Reportes (minutos)</label>
              <input
                type="number"
                value={configForm.intervalo_reportes_minutos}
                onChange={(e) => setConfigForm(prev => ({...prev, intervalo_reportes_minutos: parseInt(e.target.value)}))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="5"
                max="1440"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Ventana Predicción (horas)</label>
              <input
                type="number"
                value={configForm.ventana_prediccion_horas}
                onChange={(e) => setConfigForm(prev => ({...prev, ventana_prediccion_horas: parseInt(e.target.value)}))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="1"
                max="168"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center space-x-4">
          <button
            onClick={actualizarConfiguracion}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Settings className="mr-2" size={16} />
            {loading ? 'Aplicando...' : 'Aplicar Configuración'}
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => cambiarEstado('activo')}
              disabled={loading}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm"
            >
              <Play className="mr-1" size={14} />
              Activar
            </button>
            
            <button
              onClick={() => cambiarEstado('pausado')}
              disabled={loading}
              className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center text-sm"
            >
              <Pause className="mr-1" size={14} />
              Pausar
            </button>
            
            <button
              onClick={() => cambiarEstado('mantenimiento')}
              disabled={loading}
              className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center text-sm"
            >
              <Wrench className="mr-1" size={14} />
              Mantenimiento
            </button>
          </div>
        </div>
        
        {data.configuracion && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
            <div className="text-green-800">
              ✅ Configuración aplicada exitosamente
            </div>
          </div>
        )}
        
        {data.estadoCambiado && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <div className="text-blue-800">
              🔄 Estado cambiado a: {data.estadoCambiado.estado_actual?.toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'resumen', label: 'Resumen Sistema', icon: Activity },
    { id: 'eventos', label: 'Eventos Automáticos', icon: Zap },
    { id: 'reportes', label: 'Reportes IA', icon: FileText },
    { id: 'alertas', label: 'Alertas Preventivas', icon: AlertTriangle },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { id: 'configuracion', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automatización Avanzada</h1>
          <p className="text-gray-600">FASE 3: Respuestas Automáticas, Reportes IA y Alertas Preventivas Proactivas</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
            <XCircle className="mr-2" size={20} />
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
                        ? 'border-blue-500 text-blue-600'
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
          {activeTab === 'resumen' && renderResumenTab()}
          {activeTab === 'eventos' && renderEventosTab()}
          {activeTab === 'reportes' && renderReportesTab()}
          {activeTab === 'alertas' && renderAlertasTab()}
          {activeTab === 'estadisticas' && renderEstadisticasTab()}
          {activeTab === 'configuracion' && renderConfiguracionTab()}
        </div>
      </div>
    </div>
  );
};

export default AutomatizacionAvanzada;