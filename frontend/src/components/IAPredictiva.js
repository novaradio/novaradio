import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Activity, 
  Settings,
  Send,
  Calendar,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  Database,
  HardDrive
} from 'lucide-react';

const IAPredictiva = () => {
  const [activeTab, setActiveTab] = useState('resumen');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [error, setError] = useState('');

  // Estados para formularios
  const [sentimentTexts, setSentimentTexts] = useState(['']);
  const [sentimentContext, setSentimentContext] = useState('electoral');
  const [predictionData, setPredictionData] = useState({
    adhesion_actual: 45,
    tendencia_3meses: [42, 44, 45],
    sentiment_promedio: 0.2,
    actividad_competencia: 0.5
  });
  const [targetDate, setTargetDate] = useState('2025-12-01');
  const [anomalyData, setAnomalyData] = useState({
    sentiment_historico: [0.2, 0.1, 0.3, 0.4, 0.8],
    volumen_menciones: [100, 120, 150, 200, 500],
    patron_temporal: { actividad_nocturna: true },
    actividad_competencia: { nivel_actual: 0.8, nivel_promedio: 0.5 }
  });
  const [correlationDatasets, setCorrelationDatasets] = useState({
    sentiment: [0.2, 0.3, 0.4, 0.5, 0.3],
    adhesion: [40, 42, 45, 47, 43]
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
      
      const response = await fetch(`${BACKEND_URL}/api/ia-predictiva/${endpoint}`, config);
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
    const resumenData = await fetchData('resumen-general');
    const statusData = await fetchData('status');
    
    setData({
      resumen: resumenData,
      status: statusData
    });
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSentimentAnalysis = async () => {
    const filteredTexts = sentimentTexts.filter(text => text.trim());
    if (filteredTexts.length === 0) {
      setError('Ingrese al menos un texto para analizar');
      return;
    }

    const result = await fetchData('analisis-sentiment', 'POST', {
      textos: filteredTexts,
      contexto: sentimentContext
    });
    
    if (result) {
      setData(prev => ({ ...prev, sentiment: result }));
    }
  };

  const handleElectoralPrediction = async () => {
    const result = await fetchData('prediccion-electoral', 'POST', {
      datos_historicos: predictionData,
      fecha_objetivo: targetDate
    });
    
    if (result) {
      setData(prev => ({ ...prev, prediction: result }));
    }
  };

  const handleAnomalyDetection = async () => {
    const result = await fetchData('detectar-anomalias', 'POST', {
      datos_tiempo_real: anomalyData
    });
    
    if (result) {
      setData(prev => ({ ...prev, anomalies: result }));
    }
  };

  const handleCorrelationAnalysis = async () => {
    const result = await fetchData('correlacion-inteligente', 'POST', {
      datasets: correlationDatasets
    });
    
    if (result) {
      setData(prev => ({ ...prev, correlation: result }));
    }
  };

  const addSentimentText = () => {
    if (sentimentTexts.length < 10) {
      setSentimentTexts([...sentimentTexts, '']);
    }
  };

  const updateSentimentText = (index, value) => {
    const newTexts = [...sentimentTexts];
    newTexts[index] = value;
    setSentimentTexts(newTexts);
  };

  const removeSentimentText = (index) => {
    if (sentimentTexts.length > 1) {
      setSentimentTexts(sentimentTexts.filter((_, i) => i !== index));
    }
  };

  const renderSentimentTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Brain className="mr-2 text-blue-600" size={20} />
          Análisis de Sentiment Avanzado con NLP
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Contexto de Análisis</label>
            <select 
              value={sentimentContext}
              onChange={(e) => setSentimentContext(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="electoral">Electoral</option>
              <option value="politico">Político</option>
              <option value="social">Social</option>
              <option value="general">General</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Textos a Analizar</label>
            {sentimentTexts.map((text, index) => (
              <div key={index} className="flex mb-2">
                <textarea
                  value={text}
                  onChange={(e) => updateSentimentText(index, e.target.value)}
                  placeholder={`Texto ${index + 1}...`}
                  className="flex-1 p-2 border border-gray-300 rounded-md mr-2"
                  rows="2"
                />
                {sentimentTexts.length > 1 && (
                  <button
                    onClick={() => removeSentimentText(index)}
                    className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            
            <div className="flex space-x-2">
              <button
                onClick={addSentimentText}
                disabled={sentimentTexts.length >= 10}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
              >
                Agregar Texto
              </button>
              <button
                onClick={handleSentimentAnalysis}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Send className="mr-2" size={16} />
                {loading ? 'Analizando...' : 'Analizar Sentiment'}
              </button>
            </div>
          </div>
        </div>
        
        {data.sentiment && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold">Resultados del Análisis</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Polaridad Promedio</div>
                <div className="text-2xl font-bold text-green-600">
                  {data.sentiment.estadisticas_consolidadas?.polaridad_promedio || 0}
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Textos Analizados</div>
                <div className="text-2xl font-bold text-blue-600">
                  {data.sentiment.total_textos || 0}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Textos Positivos</div>
                <div className="text-2xl font-bold text-purple-600">
                  {data.sentiment.estadisticas_consolidadas?.textos_positivos || 0}
                </div>
              </div>
            </div>
            
            {data.sentiment.estadisticas_consolidadas?.entidades_mas_mencionadas && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Entidades Más Mencionadas</h5>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(data.sentiment.estadisticas_consolidadas.entidades_mas_mencionadas).map(([entidad, count]) => (
                    <span key={entidad} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {entidad} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderPredictionTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="mr-2 text-green-600" size={20} />
          Predicción Electoral con ML
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Adhesión Actual (%)</label>
              <input
                type="number"
                value={predictionData.adhesion_actual}
                onChange={(e) => setPredictionData(prev => ({...prev, adhesion_actual: Number(e.target.value)}))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Sentiment Promedio</label>
              <input
                type="number"
                value={predictionData.sentiment_promedio}
                onChange={(e) => setPredictionData(prev => ({...prev, sentiment_promedio: Number(e.target.value)}))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="-1"
                max="1"
                step="0.1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Actividad Competencia</label>
              <input
                type="number"
                value={predictionData.actividad_competencia}
                onChange={(e) => setPredictionData(prev => ({...prev, actividad_competencia: Number(e.target.value)}))}
                className="w-full p-2 border border-gray-300 rounded-md"
                min="0"
                max="1"
                step="0.1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Objetivo</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <button
              onClick={handleElectoralPrediction}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center justify-center"
            >
              <Target className="mr-2" size={16} />
              {loading ? 'Prediciendo...' : 'Generar Predicción'}
            </button>
          </div>
        </div>
        
        {data.prediction && (
          <div className="mt-6 space-y-4">
            <h4 className="font-semibold">Predicción Electoral</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Adhesión Proyectada</div>
                <div className="text-3xl font-bold text-green-600">
                  {data.prediction.prediccion_electoral?.adhesion_proyectada}%
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Probabilidad Victoria</div>
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round((data.prediction.prediccion_electoral?.probabilidad_victoria || 0) * 100)}%
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Estado</div>
                <div className="text-lg font-bold text-purple-600 capitalize">
                  {data.prediction.interpretacion?.estado_prediccion || 'N/A'}
                </div>
              </div>
            </div>
            
            {data.prediction.prediccion_electoral?.escenarios && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">Escenarios</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Optimista</div>
                    <div className="text-xl font-bold text-green-600">
                      {data.prediction.prediccion_electoral.escenarios.optimista}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Realista</div>
                    <div className="text-xl font-bold text-blue-600">
                      {data.prediction.prediccion_electoral.escenarios.realista}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Pesimista</div>
                    <div className="text-xl font-bold text-red-600">
                      {data.prediction.prediccion_electoral.escenarios.pesimista}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderAnomalyTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertTriangle className="mr-2 text-red-600" size={20} />
          Detección de Anomalías
        </h3>
        
        <button
          onClick={handleAnomalyDetection}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center mb-4"
        >
          <Zap className="mr-2" size={16} />
          {loading ? 'Detectando...' : 'Detectar Anomalías'}
        </button>
        
        {data.anomalies && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total Anomalías</div>
                <div className="text-2xl font-bold text-red-600">
                  {data.anomalies.resumen?.total_anomalias || 0}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Críticas</div>
                <div className="text-2xl font-bold text-orange-600">
                  {data.anomalies.resumen?.criticas || 0}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Moderadas</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {data.anomalies.resumen?.moderadas || 0}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Leves</div>
                <div className="text-2xl font-bold text-green-600">
                  {data.anomalies.resumen?.leves || 0}
                </div>
              </div>
            </div>
            
            {data.anomalies.anomalias_detectadas && data.anomalies.anomalias_detectadas.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Anomalías Detectadas</h4>
                {data.anomalies.anomalias_detectadas.map((anomaly, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    anomaly.nivel_severidad === 'critica' ? 'bg-red-50 border-red-500' :
                    anomaly.nivel_severidad === 'moderada' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-green-50 border-green-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{anomaly.descripcion}</h5>
                        <p className="text-sm text-gray-600">Tipo: {anomaly.tipo} | Severidad: {anomaly.severidad}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        anomaly.nivel_severidad === 'critica' ? 'bg-red-100 text-red-800' :
                        anomaly.nivel_severidad === 'moderada' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {anomaly.nivel_severidad}
                      </span>
                    </div>
                    
                    {anomaly.acciones_recomendadas && anomaly.acciones_recomendadas.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Acciones Recomendadas:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {anomaly.acciones_recomendadas.map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderCorrelationTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2 text-purple-600" size={20} />
          Correlación Inteligente
        </h3>
        
        <button
          onClick={handleCorrelationAnalysis}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center mb-4"
        >
          <BarChart3 className="mr-2" size={16} />
          {loading ? 'Analizando...' : 'Analizar Correlaciones'}
        </button>
        
        {data.correlation && (
          <div className="space-y-4">
            {data.correlation.estadisticas_generales && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total Correlaciones</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {data.correlation.estadisticas_generales.total_correlaciones}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Correlaciones Fuertes</div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.correlation.estadisticas_generales.correlaciones_fuertes}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Promedio</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {data.correlation.estadisticas_generales.correlacion_promedio}
                  </div>
                </div>
              </div>
            )}
            
            {data.correlation.correlaciones && (
              <div className="space-y-2">
                <h4 className="font-semibold">Resultados de Correlación</h4>
                {Object.entries(data.correlation.correlaciones).map(([key, corr]) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{corr.descripcion || key}</h5>
                        <p className="text-sm text-gray-600">
                          Correlación: {corr.correlacion} | Significancia: {corr.significancia}
                        </p>
                        {corr.interpretacion && (
                          <p className="text-sm text-gray-700 mt-1">{corr.interpretacion}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        corr.fuerza === 'fuerte' ? 'bg-green-100 text-green-800' :
                        corr.fuerza === 'moderada' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {corr.fuerza}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderResumenTab = () => (
    <div className="space-y-6">
      {data.resumen && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="mr-2 text-blue-600" size={20} />
            Sistema IA Predictiva Avanzada
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Estado del Sistema</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium text-green-600">{data.resumen.estado_sistema?.status}</span>
                </div>
                <div className="flex justify-between">
                  <span>Módulos Activos:</span>
                  <span className="font-medium">{data.resumen.estado_sistema?.modulos_activos?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precisión General:</span>
                  <span className="font-medium">{data.resumen.estado_sistema?.precision_general}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Métricas de Rendimiento</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Análisis Realizados:</span>
                  <span className="font-medium">{data.resumen.metricas_rendimiento?.analisis_sentiment_realizados}</span>
                </div>
                <div className="flex justify-between">
                  <span>Predicciones:</span>
                  <span className="font-medium">{data.resumen.metricas_rendimiento?.predicciones_electorales}</span>
                </div>
                <div className="flex justify-between">
                  <span>Anomalías Detectadas:</span>
                  <span className="font-medium">{data.resumen.metricas_rendimiento?.anomalias_detectadas}</span>
                </div>
              </div>
            </div>
          </div>
          
          {data.resumen.capacidades_sistema && (
            <div className="mt-6">
              <h4 className="font-semibold mb-4">Capacidades del Sistema</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.resumen.capacidades_sistema).map(([key, capability]) => (
                  <div key={key} className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-blue-600">{capability.nombre}</h5>
                    <p className="text-sm text-gray-600 mt-1">{capability.descripcion}</p>
                    {capability.precision_modelo && (
                      <p className="text-sm font-medium mt-2">Precisión: {capability.precision_modelo}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStatusTab = () => (
    <div className="space-y-6">
      {data.status && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Settings className="mr-2 text-gray-600" size={20} />
            Status Operacional
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Estado de Módulos</h4>
              {data.status.modulos && Object.entries(data.status.modulos).map(([module, status]) => (
                <div key={module} className="flex items-center justify-between p-2 bg-gray-50 rounded mb-2">
                  <span className="capitalize">{module.replace('_', ' ')}</span>
                  <div className="flex items-center">
                    {status.status === 'activo' ? 
                      <CheckCircle className="text-green-600 mr-1" size={16} /> : 
                      <XCircle className="text-red-600 mr-1" size={16} />
                    }
                    <span className="text-sm font-medium">{status.status}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Recursos del Sistema</h4>
              {data.status.recursos_sistema && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Cpu className="mr-2 text-blue-600" size={16} />
                      <span>CPU</span>
                    </div>
                    <span className="font-medium">{data.status.recursos_sistema.cpu_usage}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="mr-2 text-green-600" size={16} />
                      <span>Memoria</span>
                    </div>
                    <span className="font-medium">{data.status.recursos_sistema.memoria_utilizada}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <HardDrive className="mr-2 text-purple-600" size={16} />
                      <span>Almacenamiento</span>
                    </div>
                    <span className="font-medium">{data.status.recursos_sistema.almacenamiento}</span>
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="mr-2 text-blue-600" size={16} />
                  <span className="font-medium">Uptime: {data.status.uptime}</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Versión: {data.status.version}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'resumen', label: 'Resumen General', icon: Activity },
    { id: 'sentiment', label: 'Análisis Sentiment', icon: Brain },
    { id: 'prediction', label: 'Predicción Electoral', icon: TrendingUp },
    { id: 'anomaly', label: 'Detección Anomalías', icon: AlertTriangle },
    { id: 'correlation', label: 'Correlación', icon: BarChart3 },
    { id: 'status', label: 'Status Sistema', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">IA Predictiva Avanzada</h1>
          <p className="text-gray-600">Análisis NLP, Predicción Electoral, Detección de Anomalías y Correlación Inteligente</p>
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
          {activeTab === 'sentiment' && renderSentimentTab()}
          {activeTab === 'prediction' && renderPredictionTab()}
          {activeTab === 'anomaly' && renderAnomalyTab()}
          {activeTab === 'correlation' && renderCorrelationTab()}
          {activeTab === 'status' && renderStatusTab()}
        </div>
      </div>
    </div>
  );
};

export default IAPredictiva;