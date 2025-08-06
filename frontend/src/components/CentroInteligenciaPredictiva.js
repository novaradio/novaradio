import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Brain, Zap, Target, TrendingUp, AlertTriangle, Clock, ArrowRight, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CentroInteligenciaPredictiva = () => {
  const [inteligencia, setInteligencia] = useState({
    predicciones: [],
    prioridades: [],
    automatizacion: [],
    situacionGeneral: 'CARGANDO...'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarInteligenciaCompleta();
    
    // Auto-actualización cada 30 segundos
    const interval = setInterval(() => {
      cargarInteligenciaCompleta();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const cargarInteligenciaCompleta = async () => {
    setLoading(true);
    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Llamada al endpoint con autenticación
      const response = await axios.get(`${API}/inteligencia-predictiva/completo`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data;

      setInteligencia({
        predicciones: data.predicciones_ml || [],
        prioridades: data.prioridades_algoritmica || [],
        automatizacion: data.automatizacion_estado || [],
        situacionGeneral: data.situacion_general || 'CARGANDO...',
        timestamp: data.ultima_actualizacion || new Date().toLocaleTimeString(),
        metricas: data.metricas_clave || {}
      });

    } catch (error) {
      console.error('Error cargando inteligencia:', error);
      toast.error('Error actualizando inteligencia predictiva');
      
      // Fallback con datos simulados
      setInteligencia({
        predicciones: [
          {
            tipo: "📺 PREDICCIÓN MEDIA",
            evento: "Pico de engagement político esperado",
            probabilidad: 91,
            tiempo: "Próximas 3 horas", 
            impacto: "ALTO",
            recomendacion: "Aprovechar momentum con contenido clave"
          }
        ],
        prioridades: [
          {
            nivel: "🚨 CRÍTICO",
            titulo: "Desinformación viral detectada",
            descripcion: "Fake news escalando rápidamente",
            accion: "DESMENTIR INMEDIATAMENTE",
            tiempo: "URGENTE - AHORA",
            fuente: "Algoritmo Anti-DeepFakes"
          }
        ],
        automatizacion: [
          {
            estado: "✅ EJECUTANDO",
            accion: "Escudo anti-fake news automático", 
            detalle: "4 noticias falsas neutralizadas",
            autonomo: true
          }
        ],
        situacionGeneral: "VIGILANCIA",
        timestamp: new Date().toLocaleTimeString(),
        metricas: {
          sentiment_publico: 0.69,
          ataques_activos: 2,
          prediccion_confianza: 0.87
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const ejecutarAccionInteligente = async (accion) => {
    try {
      toast.loading('Ejecutando acción inteligente...', { id: 'exec' });
      const token = localStorage.getItem('token');
      
      await axios.post(`${API}/centro-comando/accion-rapida`, {
        accion: accion,
        contexto: { timestamp: new Date().toISOString(), auto: true }
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('✅ Acción ejecutada exitosamente', { id: 'exec' });
      cargarInteligenciaCompleta();
      
    } catch (error) {
      toast.error('❌ Error ejecutando acción', { id: 'exec' });
    }
  };

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'CRÍTICO': return 'bg-red-900 border-red-500 text-red-100';
      case 'VIGILANCIA': return 'bg-yellow-900 border-yellow-500 text-yellow-100';
      case 'CONTROLADO': return 'bg-green-900 border-green-500 text-green-100';
      default: return 'bg-gray-900 border-gray-500 text-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Inteligente */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Brain className="w-12 h-12 text-cyan-400 mr-3" />
          <Bot className="w-12 h-12 text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold text-cyan-400 mb-2">
          🧠 CENTRO DE INTELIGENCIA PREDICTIVA
        </h1>
        <div className={`inline-block px-6 py-2 rounded-lg font-bold text-lg ${getEstadoColor(inteligencia.situacionGeneral)}`}>
          {inteligencia.situacionGeneral} - {inteligencia.timestamp}
        </div>
      </div>

      {/* CAPA 1: PREDICCIONES AUTOMÁTICAS */}
      <div className="dami-card bg-gradient-to-r from-purple-900 to-blue-900">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-yellow-400" />
          🔮 PREDICCIONES AUTOMÁTICAS ML
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {inteligencia.predicciones.map((pred, index) => (
            <div key={index} className="bg-black bg-opacity-40 rounded-lg p-4 border border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-purple-300">{pred.tipo}</span>
                <span className="text-sm bg-purple-800 px-2 py-1 rounded text-purple-200">
                  {pred.probabilidad}% confianza
                </span>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{pred.evento}</h3>
              <p className="text-gray-300 text-sm mb-3">{pred.recomendacion}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {pred.tiempo}
                </span>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  pred.impacto === 'CRÍTICO' ? 'bg-red-800 text-red-200' :
                  pred.impacto === 'ALTO' ? 'bg-orange-800 text-orange-200' :
                  'bg-blue-800 text-blue-200'
                }`}>
                  {pred.impacto}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CAPA 2: PRIORIDADES ALGORÍTMICAS */}
      <div className="dami-card bg-gradient-to-r from-red-900 to-orange-900">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <Target className="w-6 h-6 mr-2 text-red-400" />
          📊 PRIORIDADES AUTO-ORDENADAS (ML)
        </h2>
        
        <div className="space-y-3">
          {inteligencia.prioridades.map((prio, index) => (
            <div key={index} className="bg-black bg-opacity-40 rounded-lg p-4 border-l-4 border-red-500 hover:bg-opacity-60 transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="font-bold text-xl mr-3">#{index + 1}</span>
                  <span className="font-bold text-red-300">{prio.nivel}</span>
                </div>
                <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                  {prio.fuente}
                </span>
              </div>
              
              <h3 className="text-lg font-medium text-white mb-1">{prio.titulo}</h3>
              <p className="text-gray-300 text-sm mb-3">{prio.descripcion}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-300 font-medium">
                  ⚡ {prio.accion}
                </span>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-2">{prio.tiempo}</span>
                  <button
                    onClick={() => ejecutarAccionInteligente(prio.accion.toLowerCase().replace(' ', '_'))}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition"
                  >
                    EJECUTAR
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CAPA 3: AUTOMATIZACIÓN INTELIGENTE */}
      <div className="dami-card bg-gradient-to-r from-green-900 to-teal-900">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <Bot className="w-6 h-6 mr-2 text-green-400" />
          🤖 AUTOMATIZACIÓN INTELIGENTE
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {inteligencia.automatizacion.map((auto, index) => (
            <div key={index} className="bg-black bg-opacity-40 rounded-lg p-4 border border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-green-300">{auto.estado}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  auto.autonomo ? 'bg-green-800 text-green-200' : 'bg-yellow-800 text-yellow-200'
                }`}>
                  {auto.autonomo ? 'AUTÓNOMO' : 'MANUAL'}
                </span>
              </div>
              <h3 className="text-sm font-medium text-white mb-2">{auto.accion}</h3>
              <p className="text-gray-300 text-xs">{auto.detalle}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Botón de actualización */}
      <div className="text-center">
        <button
          onClick={cargarInteligenciaCompleta}
          disabled={loading}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition font-medium"
        >
          {loading ? '🔄 Actualizando...' : '⚡ Actualizar Inteligencia'}
        </button>
      </div>
    </div>
  );
};

export default CentroInteligenciaPredictiva;