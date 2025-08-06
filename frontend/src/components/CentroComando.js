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
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className={`text-2xl font-bold px-3 py-1 rounded ${getNivelAmenazaColor(situacionActual.nivelAmenaza)}`}>
              {situacionActual.nivelAmenaza || 'CARGANDO...'}
            </div>
            <div className="text-sm text-gray-400 mt-2">Nivel de Amenaza</div>
          </div>
          
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{situacionActual.ataquesPrincipales || 0}</div>
            <div className="text-sm text-gray-400 mt-2">Ataques Activos</div>
          </div>
          
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{situacionActual.desinformacionActiva || 0}</div>
            <div className="text-sm text-gray-400 mt-2">Desinformación Detectada</div>
          </div>
          
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{situacionActual.sentimientoPublico || 0}%</div>
            <div className="text-sm text-gray-400 mt-2">Apoyo Público</div>
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
          <button 
            onClick={() => ejecutarAccionRapida('respuesta_emergencia')}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-lg transition text-center"
          >
            <MessageSquare className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Respuesta de Emergencia</div>
          </button>
          
          <button 
            onClick={() => ejecutarAccionRapida('activar_red_apoyo')}
            className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-center"
          >
            <Users className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Activar Red de Apoyo</div>
          </button>
          
          <button 
            onClick={() => ejecutarAccionRapida('campana_positiva')}
            className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition text-center"
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Campaña Positiva</div>
          </button>
          
          <button 
            onClick={() => ejecutarAccionRapida('contramedidas')}
            className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-center"
          >
            <Shield className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Contramedidas</div>
          </button>
        </div>
      </div>

      {/* Instrucciones Claras */}
      <div className="dami-card bg-green-900 bg-opacity-20 border border-green-500">
        <h3 className="text-lg font-medium text-green-400 mb-3">💡 CÓMO USAR ESTE CENTRO</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong className="text-green-400">1. MIRA ARRIBA:</strong>
            <p className="text-gray-300">Los problemas más urgentes aparecen primero con acciones específicas</p>
          </div>
          <div>
            <strong className="text-green-400">2. REVISA EL TIEMPO REAL:</strong>
            <p className="text-gray-300">Ve qué está pasando ahora mismo para tomar decisiones informadas</p>
          </div>
          <div>
            <strong className="text-green-400">3. ACTÚA RÁPIDO:</strong>
            <p className="text-gray-300">Usa los botones de acción rápida para responder inmediatamente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentroComando;