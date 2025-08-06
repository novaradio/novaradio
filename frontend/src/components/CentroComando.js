import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Shield, TrendingDown, TrendingUp, Users, MessageSquare, Eye, Zap, Info, HelpCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CentroComando = () => {
  const [situacionActual, setSituacionActual] = useState({});
  const [alertasUrgentes, setAlertasUrgentes] = useState([]);
  const [monitoreoTiempoReal, setMonitoreoTiempoReal] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showExplanation, setShowExplanation] = useState(null);

  // Explicaciones para cada nivel de amenaza
  const explicacionesNivel = {
    'CRÍTICO': {
      significado: 'Situación de máxima alerta',
      queHacer: 'Activar protocolo de crisis inmediatamente. Convocar equipo de emergencia.',
      color: 'text-red-400',
      icon: '🚨'
    },
    'ALTO': {
      significado: 'Riesgo elevado que requiere atención inmediata',
      queHacer: 'Monitorear de cerca y preparar respuestas. Alertar a equipo clave.',
      color: 'text-orange-400',
      icon: '⚠️'
    },
    'MODERADO': {
      significado: 'Situación controlable pero que requiere seguimiento',
      queHacer: 'Mantener vigilancia activa. Preparar estrategias preventivas.',
      color: 'text-yellow-400',
      icon: '👁️'
    },
    'BAJO': {
      significado: 'Situación estable y favorable',
      queHacer: 'Continuar monitoreo rutinario. Aprovechar momento favorable.',
      color: 'text-green-400',
      icon: '✅'
    }
  };

  // Explicaciones para acciones rápidas
  const explicacionesAcciones = {
    'respuesta_emergencia': {
      titulo: 'Respuesta de Emergencia',
      descripcion: 'Activa comunicaciones de crisis inmediatas',
      cuandoUsar: 'Cuando hay ataques directos o crisis reputacional',
      queHace: 'Genera respuesta oficial, activa voceros, coordina mensajes'
    },
    'activar_red_apoyo': {
      titulo: 'Activar Red de Apoyo',
      descripcion: 'Moviliza base de militantes y simpatizantes',
      cuandoUsar: 'Para contrarrestar campañas negativas',
      queHace: 'Notifica a militantes, genera contenido de apoyo, organiza respuestas'
    },
    'campana_positiva': {
      titulo: 'Campaña Positiva',
      descripcion: 'Lanza contenido positivo para mejorar imagen',
      cuandoUsar: 'Cuando el sentiment público está bajo',
      queHace: 'Publica logros, testimonios, noticias positivas automáticamente'
    },
    'contramedidas': {
      titulo: 'Contramedidas',
      descripcion: 'Implementa estrategias defensivas específicas',
      cuandoUsar: 'Ante desinformación o ataques coordinados',
      queHace: 'Fact-checking, reportes, bloqueos, respuestas técnicas'
    }
  };

  useEffect(() => {
    // Cargar datos iniciales
    actualizarTodosLosDatos();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      actualizarTodosLosDatos();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const actualizarTodosLosDatos = async () => {
    setLoading(true);
    try {
      // Obtener situación actual del backend
      const situacionResponse = await axios.get(`${API}/centro-comando/situacion-actual`);
      const situacion = situacionResponse.data;
      
      setSituacionActual({
        nivelAmenaza: situacion.nivel_amenaza,
        ataquesPrincipales: situacion.ataques_activos,
        desinformacionActiva: situacion.desinformacion_detectada,
        sentimientoPublico: Math.round(situacion.sentiment_publico * 100),
        tendencia: "tiempo_real"
      });
      
      setAlertasUrgentes(situacion.ataques_detalle || []);
      
      // Obtener monitoreo en tiempo real
      const monitoreoResponse = await axios.get(`${API}/centro-comando/monitoreo-tiempo-real`);
      setMonitoreoTiempoReal(monitoreoResponse.data.eventos || []);
      
      setLastUpdate(new Date().toLocaleTimeString());
      
    } catch (error) {
      console.error('Error actualizando datos del centro de comando:', error);
      toast.error('Error actualizando información en tiempo real');
    } finally {
      setLoading(false);
    }
  };

  const ejecutarAccionRapida = async (accion) => {
    try {
      const response = await axios.post(`${API}/centro-comando/accion-rapida`, {
        accion: accion,
        contexto: { timestamp: new Date().toISOString() }
      });
      
      toast.success(`✅ ${response.data.mensaje}`);
      
      // Mostrar detalles de la acción
      if (response.data.detalles) {
        setTimeout(() => {
          toast.success(response.data.detalles, { duration: 4000 });
        }, 1000);
      }
      
      // Actualizar datos después de la acción
      setTimeout(() => {
        actualizarTodosLosDatos();
      }, 2000);
      
    } catch (error) {
      console.error('Error ejecutando acción:', error);
      toast.error('Error ejecutando acción rápida');
    }
  };

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'CRÍTICO': return 'bg-red-900 border-red-500 text-red-100';
      case 'URGENTE': return 'bg-orange-900 border-orange-500 text-orange-100';
      case 'ATENCIÓN': return 'bg-yellow-900 border-yellow-500 text-yellow-100';
      default: return 'bg-gray-900 border-gray-500 text-gray-100';
    }
  };

  const getSentimientoColor = (sentimiento) => {
    switch(sentimiento) {
      case 'positivo': return 'text-green-400 bg-green-900 bg-opacity-30';
      case 'negativo': return 'text-red-400 bg-red-900 bg-opacity-30';
      default: return 'text-gray-400 bg-gray-900 bg-opacity-30';
    }
  };

  const getNivelAmenazaColor = (nivel) => {
    switch(nivel) {
      case 'CRÍTICO': return 'text-red-400 bg-red-900 bg-opacity-50';
      case 'ALTO': return 'text-orange-400 bg-orange-900 bg-opacity-50';
      case 'MODERADO': return 'text-yellow-400 bg-yellow-900 bg-opacity-50';
      case 'BAJO': return 'text-green-400 bg-green-900 bg-opacity-50';
      default: return 'text-gray-400 bg-gray-900 bg-opacity-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Eye className="w-12 h-12 text-green-400 mr-3" />
          <Shield className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-green-400 mb-2">
          🎯 Centro de Comando - Situación Actual
        </h1>
        <p className="text-gray-400 text-lg">
          Monitoreo específico para decisiones inmediatas
        </p>
      </div>

      {/* Panel de Situación General */}
      <div className="dami-card mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">📊 SITUACIÓN GENERAL AHORA</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={actualizarTodosLosDatos}
              disabled={loading}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
            >
              {loading ? '⟳' : '🔄'} Actualizar
            </button>
            {lastUpdate && (
              <span className="text-sm text-gray-400">
                Última actualización: {lastUpdate}
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-800 rounded-lg relative group">
            <div className={`text-2xl font-bold px-3 py-1 rounded ${getNivelAmenazaColor(situacionActual.nivelAmenaza)} cursor-help`}
                 onClick={() => setShowExplanation('nivel-amenaza')}>
              {explicacionesNivel[situacionActual.nivelAmenaza]?.icon || '🔄'} {situacionActual.nivelAmenaza || 'CARGANDO...'}
            </div>
            <div className="text-sm text-gray-400 mt-2">Nivel de Amenaza</div>
            <button 
              onClick={() => setShowExplanation('nivel-amenaza')}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            {situacionActual.nivelAmenaza && explicacionesNivel[situacionActual.nivelAmenaza] && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-black text-white p-3 rounded-lg text-xs w-64 border border-gray-600">
                  <div className="font-bold text-yellow-400 mb-1">
                    {explicacionesNivel[situacionActual.nivelAmenaza].significado}
                  </div>
                  <div className="text-gray-300">
                    {explicacionesNivel[situacionActual.nivelAmenaza].queHacer}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="text-center p-4 bg-gray-800 rounded-lg relative group">
            <div className="text-2xl font-bold text-red-400">
              🎯 {situacionActual.ataquesPrincipales || 0}
            </div>
            <div className="text-sm text-gray-400 mt-2">Ataques Activos</div>
            <button 
              onClick={() => setShowExplanation('ataques')}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-black text-white p-3 rounded-lg text-xs w-64 border border-gray-600">
                <div className="font-bold text-red-400 mb-1">Ataques Políticos Detectados</div>
                <div className="text-gray-300">Campañas negativas, críticas coordinadas o desinformación dirigida contra Frente Renovador</div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-800 rounded-lg relative group">
            <div className="text-2xl font-bold text-orange-400">
              📰 {situacionActual.desinformacionActiva || 0}
            </div>
            <div className="text-sm text-gray-400 mt-2">Desinformación Detectada</div>
            <button 
              onClick={() => setShowExplanation('desinformacion')}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-black text-white p-3 rounded-lg text-xs w-64 border border-gray-600">
                <div className="font-bold text-orange-400 mb-1">Noticias Falsas Activas</div>
                <div className="text-gray-300">Información falsa, rumores maliciosos o datos tergiversados circulando en redes sociales</div>
              </div>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-800 rounded-lg relative group">
            <div className={`text-2xl font-bold ${situacionActual.sentimientoPublico >= 60 ? 'text-green-400' : situacionActual.sentimientoPublico >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
              {situacionActual.sentimientoPublico >= 60 ? '😊' : situacionActual.sentimientoPublico >= 40 ? '😐' : '😟'} {situacionActual.sentimientoPublico || 0}%
            </div>
            <div className="text-sm text-gray-400 mt-2">Apoyo Público</div>
            <button 
              onClick={() => setShowExplanation('apoyo')}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-black text-white p-3 rounded-lg text-xs w-64 border border-gray-600">
                <div className="font-bold text-blue-400 mb-1">Sentimiento Público Actual</div>
                <div className="text-gray-300">
                  Porcentaje de menciones positivas vs negativas sobre Frente Renovador en redes sociales. 
                  <br/>• +60%: Muy favorable
                  <br/>• 40-59%: Favorable 
                  <br/>• -40%: Desfavorable
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Urgentes - LO MÁS IMPORTANTE */}
      <div className="dami-card">
        <h2 className="text-2xl font-semibold text-white mb-6">🚨 PROBLEMAS QUE REQUIEREN ACCIÓN</h2>
        
        <div className="space-y-4">
          {alertasUrgentes.length > 0 ? alertasUrgentes.map((alerta, index) => (
            <div key={index} className={`border-2 rounded-lg p-6 ${getTipoColor(alerta.tipo)}`}>
              {/* Encabezado del problema */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3" />
                  <h3 className="text-xl font-bold">{alerta.tipo}: {alerta.problema}</h3>
                </div>
                <span className="text-sm opacity-75">{alerta.tiempo}</span>
              </div>

              {/* Detalles del problema */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <strong>¿QUÉ PASA?</strong>
                  <p className="mt-1">{alerta.detalles}</p>
                </div>
                <div>
                  <strong>¿DÓNDE?</strong>
                  <p className="mt-1">{alerta.ubicacion}</p>
                </div>
              </div>

              {/* Acción requerida */}
              <div className="bg-black bg-opacity-30 rounded p-4 mb-3">
                <div className="flex items-center mb-2">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  <strong className="text-yellow-400">ACCIÓN REQUERIDA:</strong>
                </div>
                <p className="text-lg">{alerta.accion}</p>
                <p className="text-sm mt-1"><strong>Responsable:</strong> {alerta.responsable}</p>
              </div>

              {/* Impacto */}
              <div className="text-sm">
                <strong>IMPACTO:</strong> {alerta.impacto}
              </div>
            </div>
          )) : (
            <div className="text-center py-8 text-gray-400">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">✅ No hay problemas urgentes detectados</p>
              <p className="text-sm">El sistema continúa monitoreando en tiempo real</p>
            </div>
          )}
        </div>
      </div>

      {/* Monitoreo en Tiempo Real */}
      <div className="dami-card">
        <h2 className="text-2xl font-semibold text-white mb-6">⏱️ LO QUE ESTÁ PASANDO AHORA</h2>
        
        <div className="space-y-3">
          {monitoreoTiempoReal.map((evento, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm font-mono">{evento.tiempo}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getSentimientoColor(evento.sentimiento)}`}>
                  {evento.sentimiento === 'positivo' ? '✅ POSITIVO' : evento.sentimiento === 'negativo' ? '⚠️ NEGATIVO' : '➖ NEUTRO'}
                </span>
                <div>
                  <div className="text-white font-medium">{evento.evento}</div>
                  <div className="text-gray-400 text-sm">{evento.detalle}</div>
                </div>
              </div>
              <div className="text-gray-500 text-sm">{evento.fuente}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel de Acciones Rápidas */}
      <div className="dami-card">
        <h2 className="text-2xl font-semibold text-white mb-6">⚡ ACCIONES RÁPIDAS DISPONIBLES</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative group">
            <button 
              onClick={() => ejecutarAccionRapida('respuesta_emergencia')}
              className="w-full p-4 bg-red-600 hover:bg-red-700 rounded-lg transition text-center relative"
            >
              <MessageSquare className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">🚨 Respuesta de Emergencia</div>
              <div className="text-xs text-red-200 mt-1">Crisis inmediata</div>
              <HelpCircle className="w-4 h-4 absolute top-1 right-1 text-red-300" />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
              <div className="bg-red-800 text-white p-4 rounded-lg text-xs w-72 border border-red-500">
                <div className="font-bold text-red-200 mb-2">🚨 Respuesta de Emergencia</div>
                <div className="mb-2"><strong>Cuándo usar:</strong> Ataques directos, crisis reputacional grave</div>
                <div className="mb-2"><strong>Qué hace:</strong> Activa protocolo de crisis, genera respuesta oficial, coordina voceros</div>
                <div><strong>Tiempo de respuesta:</strong> 2-5 minutos</div>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <button 
              onClick={() => ejecutarAccionRapida('activar_red_apoyo')}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-center relative"
            >
              <Users className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">👥 Activar Red de Apoyo</div>
              <div className="text-xs text-blue-200 mt-1">Movilizar militantes</div>
              <HelpCircle className="w-4 h-4 absolute top-1 right-1 text-blue-300" />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
              <div className="bg-blue-800 text-white p-4 rounded-lg text-xs w-72 border border-blue-500">
                <div className="font-bold text-blue-200 mb-2">👥 Red de Apoyo</div>
                <div className="mb-2"><strong>Cuándo usar:</strong> Contrarrestar campañas negativas, amplificar mensajes positivos</div>
                <div className="mb-2"><strong>Qué hace:</strong> Notifica militantes, genera contenido de apoyo, coordina respuestas</div>
                <div><strong>Alcance:</strong> 500+ militantes activos</div>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <button 
              onClick={() => ejecutarAccionRapida('campana_positiva')}
              className="w-full p-4 bg-green-600 hover:bg-green-700 rounded-lg transition text-center relative"
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">📈 Campaña Positiva</div>
              <div className="text-xs text-green-200 mt-1">Mejorar imagen</div>
              <HelpCircle className="w-4 h-4 absolute top-1 right-1 text-green-300" />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
              <div className="bg-green-800 text-white p-4 rounded-lg text-xs w-72 border border-green-500">
                <div className="font-bold text-green-200 mb-2">📈 Campaña Positiva</div>
                <div className="mb-2"><strong>Cuándo usar:</strong> Sentiment público bajo (menos de 40%)</div>
                <div className="mb-2"><strong>Qué hace:</strong> Publica logros, testimonios, noticias positivas automáticamente</div>
                <div><strong>Duración:</strong> 24-48 horas activa</div>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <button 
              onClick={() => ejecutarAccionRapida('contramedidas')}
              className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-center relative"
            >
              <Shield className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-medium">🛡️ Contramedidas</div>
              <div className="text-xs text-purple-200 mt-1">Defensa activa</div>
              <HelpCircle className="w-4 h-4 absolute top-1 right-1 text-purple-300" />
            </button>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
              <div className="bg-purple-800 text-white p-4 rounded-lg text-xs w-72 border border-purple-500">
                <div className="font-bold text-purple-200 mb-2">🛡️ Contramedidas</div>
                <div className="mb-2"><strong>Cuándo usar:</strong> Desinformación activa, ataques coordinados</div>
                <div className="mb-2"><strong>Qué hace:</strong> Fact-checking, reportes automáticos, respuestas técnicas</div>
                <div><strong>Efectividad:</strong> 85-95% detección</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Explicación Detallada */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">📚 Guía Detallada</h3>
              <button 
                onClick={() => setShowExplanation(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {showExplanation === 'nivel-amenaza' && situacionActual.nivelAmenaza && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-gray-700 rounded">
                  <div className={`text-3xl font-bold ${explicacionesNivel[situacionActual.nivelAmenaza]?.color}`}>
                    {explicacionesNivel[situacionActual.nivelAmenaza]?.icon} {situacionActual.nivelAmenaza}
                  </div>
                  <div className="text-lg text-gray-300 mt-2">
                    {explicacionesNivel[situacionActual.nivelAmenaza]?.significado}
                  </div>
                </div>
                
                <div className="bg-yellow-900 bg-opacity-30 p-4 rounded border border-yellow-500">
                  <h4 className="font-bold text-yellow-400 mb-2">🎯 Qué hacer ahora:</h4>
                  <p className="text-gray-200">{explicacionesNivel[situacionActual.nivelAmenaza]?.queHacer}</p>
                </div>
                
                <div className="bg-blue-900 bg-opacity-30 p-4 rounded border border-blue-500">
                  <h4 className="font-bold text-blue-400 mb-2">📊 Niveles explicados:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center"><span className="text-red-400 mr-2">🚨 CRÍTICO:</span> Crisis inmediata - Protocolo de emergencia</li>
                    <li className="flex items-center"><span className="text-orange-400 mr-2">⚠️ ALTO:</span> Riesgo elevado - Atención inmediata</li>
                    <li className="flex items-center"><span className="text-yellow-400 mr-2">👁️ MODERADO:</span> Requiere seguimiento - Vigilancia activa</li>
                    <li className="flex items-center"><span className="text-green-400 mr-2">✅ BAJO:</span> Estable - Monitoreo rutinario</li>
                  </ul>
                </div>
              </div>
            )}
            
            {showExplanation === 'ataques' && (
              <div className="space-y-4">
                <div className="bg-red-900 bg-opacity-30 p-4 rounded border border-red-500">
                  <h4 className="font-bold text-red-400 mb-2">🎯 Ataques Activos Detectados</h4>
                  <p className="text-gray-200 mb-3">El sistema identifica campañas negativas, críticas coordinadas o desinformación dirigida específicamente contra Frente Renovador.</p>
                  
                  <h5 className="font-semibold text-red-300 mb-2">Tipos de ataques que detectamos:</h5>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• <strong>Campañas coordinadas:</strong> Múltiples cuentas atacando simultáneamente</li>
                    <li>• <strong>Hashtags maliciosos:</strong> Tendencias negativas artificiales</li>
                    <li>• <strong>Desinformación dirigida:</strong> Noticias falsas sobre el partido</li>
                    <li>• <strong>Trolling organizado:</strong> Comentarios masivos negativos</li>
                  </ul>
                  
                  <div className="mt-3 p-2 bg-black bg-opacity-30 rounded">
                    <strong className="text-yellow-400">Acción recomendada:</strong> 
                    <span className="text-gray-200"> Si hay ataques activos, usar "🚨 Respuesta de Emergencia" o "🛡️ Contramedidas"</span>
                  </div>
                </div>
              </div>
            )}
            
            {showExplanation === 'desinformacion' && (
              <div className="space-y-4">
                <div className="bg-orange-900 bg-opacity-30 p-4 rounded border border-orange-500">
                  <h4 className="font-bold text-orange-400 mb-2">📰 Desinformación Detectada</h4>
                  <p className="text-gray-200 mb-3">Algoritmos de IA analizan el contenido para identificar información falsa, rumores maliciosos o datos tergiversados que circulan en redes sociales.</p>
                  
                  <h5 className="font-semibold text-orange-300 mb-2">Qué consideramos desinformación:</h5>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• <strong>Hechos falsos:</strong> Información objetivamente incorrecta</li>
                    <li>• <strong>Datos tergiversados:</strong> Estadísticas manipuladas o descontextualizadas</li>
                    <li>• <strong>Rumores maliciosos:</strong> Especulaciones dañinas sin fundamento</li>
                    <li>• <strong>Imágenes falsificadas:</strong> Fotos o videos manipulados</li>
                  </ul>
                  
                  <div className="mt-3 p-2 bg-black bg-opacity-30 rounded">
                    <strong className="text-yellow-400">Precisión del sistema:</strong> 
                    <span className="text-gray-200"> 87% de efectividad en detección automática de fake news</span>
                  </div>
                </div>
              </div>
            )}
            
            {showExplanation === 'apoyo' && (
              <div className="space-y-4">
                <div className="bg-blue-900 bg-opacity-30 p-4 rounded border border-blue-500">
                  <h4 className="font-bold text-blue-400 mb-2">😊 Apoyo Público Actual</h4>
                  <p className="text-gray-200 mb-3">Medimos el sentimiento público analizando menciones de "Frente Renovador" en redes sociales (Twitter, Facebook, Instagram, YouTube).</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-800 bg-opacity-30 p-3 rounded">
                      <div className="text-green-400 font-bold">😊 60%+ = Muy Favorable</div>
                      <div className="text-sm text-gray-300">Mayoría de menciones positivas</div>
                    </div>
                    <div className="bg-yellow-800 bg-opacity-30 p-3 rounded">
                      <div className="text-yellow-400 font-bold">😐 40-59% = Favorable</div>
                      <div className="text-sm text-gray-300">Balance positivo moderado</div>
                    </div>
                    <div className="bg-orange-800 bg-opacity-30 p-3 rounded">
                      <div className="text-orange-400 font-bold">😕 20-39% = Neutro</div>
                      <div className="text-sm text-gray-300">Menciones equilibradas</div>
                    </div>
                    <div className="bg-red-800 bg-opacity-30 p-3 rounded">
                      <div className="text-red-400 font-bold">😟 -20% = Desfavorable</div>
                      <div className="text-sm text-gray-300">Mayoría de menciones negativas</div>
                    </div>
                  </div>
                  
                  <h5 className="font-semibold text-blue-300 mb-2">Fuentes analizadas:</h5>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• <strong>Twitter/X:</strong> Tweets y respuestas (25% del peso total)</li>
                    <li>• <strong>Facebook:</strong> Posts y comentarios (35% del peso total)</li>
                    <li>• <strong>Instagram:</strong> Posts y historias (40% del peso total)</li>
                    <li>• <strong>YouTube:</strong> Videos y comentarios políticos</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guía de Uso Mejorada */}
      <div className="dami-card bg-gradient-to-r from-green-900 to-blue-900 bg-opacity-20 border border-green-500">
        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
          <Info className="w-6 h-6 mr-2" />
          💡 CÓMO USAR EL CENTRO DE COMANDO
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div className="bg-black bg-opacity-30 p-4 rounded-lg">
            <div className="text-green-400 font-bold mb-2 flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              1. OBSERVA LA SITUACIÓN
            </div>
            <p className="text-gray-300 mb-2">Revisa los 4 indicadores principales arriba. Cada uno tiene un ícono de ayuda (?) para más detalles.</p>
            <div className="text-xs text-green-400">• Nivel de amenaza actual<br/>• Ataques detectados<br/>• Desinformación activa<br/>• Apoyo público</div>
          </div>
          
          <div className="bg-black bg-opacity-30 p-4 rounded-lg">
            <div className="text-red-400 font-bold mb-2 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              2. ATIENDE LAS ALERTAS
            </div>
            <p className="text-gray-300 mb-2">Los problemas urgentes aparecen con explicaciones claras de QUÉ PASA, DÓNDE y QUÉ HACER.</p>
            <div className="text-xs text-red-400">• Problemas específicos<br/>• Acciones requeridas<br/>• Responsables asignados<br/>• Impacto potencial</div>
          </div>
          
          <div className="bg-black bg-opacity-30 p-4 rounded-lg">
            <div className="text-blue-400 font-bold mb-2 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              3. MONITOREA EN TIEMPO REAL
            </div>
            <p className="text-gray-300 mb-2">Ve qué está pasando AHORA MISMO en redes sociales para tomar decisiones informadas.</p>
            <div className="text-xs text-blue-400">• Eventos en vivo<br/>• Sentimiento público<br/>• Fuentes verificadas<br/>• Actualizacn automática</div>
          </div>
          
          <div className="bg-black bg-opacity-30 p-4 rounded-lg">
            <div className="text-yellow-400 font-bold mb-2 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              4. ACTÚA RÁPIDAMENTE
            </div>
            <p className="text-gray-300 mb-2">Usa los 4 botones de acción. Cada uno tiene tooltips explicando CUÁNDO y CÓMO usarlos.</p>
            <div className="text-xs text-yellow-400">• Respuesta de emergencia<br/>• Activar red de apoyo<br/>• Campaña positiva<br/>• Contramedidas defensivas</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-900 bg-opacity-20 rounded-lg border border-yellow-500">
          <div className="flex items-center mb-2">
            <HelpCircle className="w-5 h-5 mr-2 text-yellow-400" />
            <strong className="text-yellow-400">CONSEJOS DE USO:</strong>
          </div>
          <ul className="text-gray-300 text-sm space-y-1">
            <li>• Haz clic en los íconos <HelpCircle className="w-4 h-4 inline mx-1" /> para obtener explicaciones detalladas</li>
            <li>• Los tooltips aparecen al pasar el mouse por encima de los elementos</li>
            <li>• El sistema se actualiza automáticamente cada 30 segundos</li>
            <li>• Usa "Actualizar" solo si necesitas datos más recientes inmediatamente</li>
            <li>• En crisis: prioriza "Respuesta de Emergencia" sobre otras acciones</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CentroComando;