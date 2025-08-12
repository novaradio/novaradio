import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, Brain, TrendingUp, AlertTriangle, Zap, Radio, Tv, Smartphone, Globe, Clock, DollarSign } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const EstrategiasCampanaIA = () => {
  const [estrategias, setEstrategias] = useState({
    contramedidas: {},
    medios: {},
    recomendaciones: {},
    loaded: false
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    cargarEstrategiasCompletas();
    
    // Auto-actualización cada 5 minutos (datos críticos)
    const interval = setInterval(() => {
      cargarEstrategiasCompletas();
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const cargarEstrategiasCompletas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('dami_token');
      if (!token) return;

      const [contramedidas, medios, recomendaciones] = await Promise.all([
        axios.get(`${API}/estrategias-campana-ia/contramedidas-completas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API}/estrategias-campana-ia/analisis-medios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API}/estrategias-campana-ia/recomendaciones-ejecutivas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      setEstrategias({
        contramedidas: contramedidas.data.data,
        medios: medios.data.data,
        recomendaciones: recomendaciones.data.data,
        loaded: true
      });
    } catch (error) {
      console.error('Error cargando estrategias:', error);
      // Datos de respaldo
      setEstrategias({
        contramedidas: {
          resumen_ejecutivo: {
            oponentes_identificados: 3,
            presupuesto_total_recomendado: 180000000,
            roi_promedio_esperado: 8.2
          }
        },
        medios: {
          distribucion_recomendada: {
            radio: "28% - Mayor penetración",
            television: "32% - Alcance masivo",
            redes_sociales: "25% - Segmentación precisa"
          }
        },
        recomendaciones: {
          acciones_inmediatas_48h: []
        },
        loaded: true
      });
    } finally {
      setLoading(false);
    }
  };

  const getMediaIcon = (medio) => {
    switch(medio) {
      case 'radio': return <Radio className="w-5 h-5" />;
      case 'television': return <Tv className="w-5 h-5" />;
      case 'redes_sociales': return <Smartphone className="w-5 h-5" />;
      case 'medios_digitales': return <Globe className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (prioridad) => {
    switch(prioridad) {
      case 'CRÍTICA': return 'border-red-500 bg-red-900';
      case 'ALTA': return 'border-orange-500 bg-orange-900';
      case 'MEDIA': return 'border-yellow-500 bg-yellow-900';
      default: return 'border-gray-500 bg-gray-900';
    }
  };

  if (!estrategias.loaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Brain className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
            <div className="text-xl text-white">Cargando Estrategias de Campaña IA...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Brain className="w-10 h-10 mr-3 text-blue-400" />
            🧠 ESTRATEGIAS DE CAMPAÑA CON IA AUTÓNOMA
          </h1>
          <p className="text-gray-300 text-lg">
            Sistema inteligente para contrarrestar oposición • Análisis de medios • Recomendaciones ejecutivas
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-black bg-opacity-40 rounded-lg p-1 flex">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'dashboard' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              📊 Dashboard Ejecutivo
            </button>
            <button
              onClick={() => setActiveTab('medios')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'medios' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              📺 Análisis Medios
            </button>
            <button
              onClick={() => setActiveTab('contramedidas')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'contramedidas' 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              ⚔️ Contramedidas
            </button>
            <button
              onClick={() => setActiveTab('ia')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'ia' 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              🤖 IA Autónoma
            </button>
          </div>
        </div>

        {/* Dashboard Ejecutivo */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Resumen Ejecutivo */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg p-6 border border-blue-500">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Target className="w-6 h-6 mr-2 text-blue-400" />
                📋 RESUMEN EJECUTIVO ESTRATÉGICO
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="bg-black bg-opacity-40 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {estrategias.contramedidas.resumen_ejecutivo?.oponentes_identificados || 3}
                  </div>
                  <div className="text-sm text-gray-300">Oponentes Identificados</div>
                </div>
                <div className="bg-black bg-opacity-40 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-green-400">
                    ${((estrategias.contramedidas.resumen_ejecutivo?.presupuesto_total_recomendado || 180000000) / 1000000).toFixed(0)}M
                  </div>
                  <div className="text-sm text-gray-300">Presupuesto Total</div>
                </div>
                <div className="bg-black bg-opacity-40 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-orange-400">
                    {estrategias.contramedidas.resumen_ejecutivo?.roi_promedio_esperado || 8.2}x
                  </div>
                  <div className="text-sm text-gray-300">ROI Promedio</div>
                </div>
                <div className="bg-black bg-opacity-40 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {estrategias.contramedidas.resumen_ejecutivo?.alcance_total_estimado || '95.7%'}
                  </div>
                  <div className="text-sm text-gray-300">Alcance Población</div>
                </div>
              </div>
            </div>

            {/* Acciones Inmediatas 48h */}
            {estrategias.recomendaciones.acciones_inmediatas_48h && estrategias.recomendaciones.acciones_inmediatas_48h.length > 0 && (
              <div className="bg-gradient-to-r from-red-900 to-orange-900 rounded-lg p-6 border border-red-500">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-red-400" />
                  🚨 DECISIONES CRÍTICAS - PRÓXIMAS 48 HORAS
                </h2>
                <div className="space-y-4">
                  {estrategias.recomendaciones.acciones_inmediatas_48h.map((accion, index) => (
                    <div key={index} className="bg-black bg-opacity-50 p-4 rounded-lg border-l-4 border-red-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-red-300 text-lg">{accion.accion}</span>
                        <span className="bg-red-600 px-3 py-1 rounded-full text-white text-sm font-bold">
                          {accion.decision?.replace('CRÍTICA - ', '').replace('ALTA - ', '')}
                        </span>
                      </div>
                      <div className="text-gray-300 mb-3">{accion.razon}</div>
                      {accion.presupuesto && (
                        <div className="text-green-400 font-bold">
                          💰 Presupuesto: {accion.presupuesto}
                        </div>
                      )}
                      {accion.costo && (
                        <div className="text-green-400 font-bold">
                          💰 Costo: {accion.costo}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recomendaciones por Prioridad */}
            {estrategias.recomendaciones.decisiones_criticas_pendientes && (
              <div className="bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg p-6 border border-yellow-500">
                <h2 className="text-2xl font-bold text-white mb-6">
                  📋 RECOMENDACIONES ESTRATÉGICAS
                </h2>
                <div className="space-y-4">
                  {estrategias.recomendaciones.decisiones_criticas_pendientes.slice(0, 5).map((rec, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 bg-opacity-30 ${getPriorityColor(rec.prioridad)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white text-lg">{rec.titulo}</span>
                        <span className="bg-gray-700 px-2 py-1 rounded text-yellow-300 text-sm">
                          {rec.prioridad}
                        </span>
                      </div>
                      <div className="text-gray-300 mb-2">{rec.descripcion}</div>
                      <div className="text-yellow-300 font-bold">
                        ⚡ {rec.accion_inmediata}
                      </div>
                      {rec.impacto_esperado && (
                        <div className="text-green-400 text-sm mt-1">
                          📈 Impacto: {rec.impacto_esperado}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Análisis de Medios */}
        {activeTab === 'medios' && (
          <div className="space-y-6">
            
            {/* Distribución Recomendada */}
            <div className="bg-gradient-to-r from-green-900 to-teal-900 rounded-lg p-6 border border-green-500">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-green-400" />
                📊 DISTRIBUCIÓN ÓPTIMA PRESUPUESTO MEDIOS
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {estrategias.medios.distribucion_recomendada && Object.entries(estrategias.medios.distribucion_recomendada).map(([medio, descripcion]) => (
                  <div key={medio} className="bg-black bg-opacity-40 p-4 rounded-lg border border-gray-600">
                    <div className="flex items-center mb-3">
                      {getMediaIcon(medio)}
                      <span className="ml-2 font-bold text-white capitalize">{medio.replace('_', ' ')}</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      {descripcion.split(' - ')[0]}
                    </div>
                    <div className="text-gray-300 text-sm">
                      {descripcion.split(' - ')[1] || 'Asignación estratégica'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROI Comparativo */}
            {estrategias.medios.roi_comparativo && (
              <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6 border border-purple-500">
                <h2 className="text-2xl font-bold text-white mb-6">
                  📈 ROI COMPARATIVO POR MEDIO
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.entries(estrategias.medios.roi_comparativo).map(([medio, data]) => (
                    <div key={medio} className="bg-black bg-opacity-40 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-white capitalize">{medio.replace('_', ' ')}</span>
                        <span className={`px-2 py-1 rounded text-sm font-bold ${
                          data.recomendacion === 'MÁXIMA INVERSIÓN' ? 'bg-green-600' :
                          data.recomendacion === 'ALTA INVERSIÓN' ? 'bg-blue-600' :
                          data.recomendacion === 'INVERSIÓN ESTÁNDAR' ? 'bg-yellow-600' :
                          data.recomendacion === 'INVERSIÓN MODERADA' ? 'bg-orange-600' : 'bg-red-600'
                        }`}>
                          {data.recomendacion?.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-purple-400 mb-1">
                        {data.roi}x
                      </div>
                      <div className="text-gray-300 text-sm">
                        ROI Esperado
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Contramedidas por Rival */}
        {activeTab === 'contramedidas' && (
          <div className="space-y-6">
            
            <div className="bg-gradient-to-r from-red-900 to-pink-900 rounded-lg p-6 border border-red-500">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Target className="w-6 h-6 mr-2 text-red-400" />
                ⚔️ ESTRATEGIAS ESPECÍFICAS CONTRA CADA RIVAL
              </h2>
              
              {estrategias.contramedidas.analisis_por_oponente && Object.entries(estrategias.contramedidas.analisis_por_oponente).map(([key, oponente]) => (
                <div key={key} className="mb-6 bg-black bg-opacity-30 p-4 rounded-lg border border-gray-600">
                  <h3 className="text-xl font-bold text-red-300 mb-4">
                    🎯 {oponente.perfil_oponente?.fortalezas?.[0] ? 
                      `VS ${key.split('_')[0].toUpperCase()} ${key.split('_')[1].toUpperCase()}` : 
                      'RIVAL IDENTIFICADO'}
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-green-400 mb-2">🎯 Fortalezas del Rival:</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {oponente.perfil_oponente?.fortalezas?.map((fortaleza, idx) => (
                          <li key={idx}>• {fortaleza}</li>
                        )) || ['Análisis en proceso']}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-red-400 mb-2">⚠️ Debilidades a Explotar:</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        {oponente.perfil_oponente?.debilidades?.map((debilidad, idx) => (
                          <li key={idx}>• {debilidad}</li>
                        )) || ['Análisis en proceso']}
                      </ul>
                    </div>
                  </div>
                  
                  {oponente.estrategia_contrataque && (
                    <div className="bg-red-900 bg-opacity-30 p-3 rounded-lg">
                      <h4 className="font-bold text-yellow-300 mb-2">
                        💡 MENSAJE CENTRAL: {oponente.estrategia_contrataque.mensaje_central}
                      </h4>
                      {oponente.asignacion_medios && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(oponente.asignacion_medios).map(([medio, porcentaje]) => (
                            <span key={medio} className="bg-gray-700 px-2 py-1 rounded text-sm">
                              {medio}: {porcentaje}%
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* IA Autónoma */}
        {activeTab === 'ia' && (
          <div className="space-y-6">
            
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-lg p-6 border border-purple-500">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Brain className="w-6 h-6 mr-2 text-purple-400" />
                🤖 SISTEMA DE IA AUTÓNOMA
              </h2>
              
              {estrategias.recomendaciones.sistema_ia_autonoma && (
                <div className="space-y-4">
                  <div className="bg-black bg-opacity-40 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-purple-300 mb-3">🎯 Beneficios del Sistema IA:</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {estrategias.recomendaciones.sistema_ia_autonoma.beneficios?.map((beneficio, index) => (
                        <div key={index} className="text-gray-300 text-sm flex items-center">
                          <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                          {beneficio}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg border border-green-500">
                    <h3 className="text-lg font-bold text-green-300 mb-3">💰 Implementación:</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">
                          {estrategias.recomendaciones.sistema_ia_autonoma.implementacion?.costo?.replace(' millones (una vez)', 'M') || '8M'}
                        </div>
                        <div className="text-sm text-gray-300">Costo Único</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">
                          {estrategias.recomendaciones.sistema_ia_autonoma.implementacion?.tiempo || '1 semana'}
                        </div>
                        <div className="text-sm text-gray-300">Tiempo</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">
                          {estrategias.recomendaciones.sistema_ia_autonoma.implementacion?.roi?.replace(' primer mes', '') || '300%'}
                        </div>
                        <div className="text-sm text-gray-300">ROI 1er Mes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">
                          {estrategias.recomendaciones.sistema_ia_autonoma.implementacion?.decision_requerida?.replace(' inmediata', '') || 'GO/NO GO'}
                        </div>
                        <div className="text-sm text-gray-300">Decisión</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Botón de actualización */}
        <div className="text-center mt-8">
          <button 
            onClick={cargarEstrategiasCompletas}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-all ${
              loading 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? '🔄 Actualizando...' : '🔄 Actualizar Estrategias'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EstrategiasCampanaIA;