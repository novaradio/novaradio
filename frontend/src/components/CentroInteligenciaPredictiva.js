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

      {/* ESTADÍSTICAS INTEGRADAS COMPLETAS - TODO LO QUE OBSERVA EL CENTRO */}
      <div className="dami-card bg-gradient-to-r from-cyan-900 to-blue-900">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-cyan-400" />
          📊 FRENTE RENOVADOR - OBSERVACIÓN COMPLETA 360°
        </h2>
        
        {/* RESUMEN EJECUTIVO FR */}
        <div className="bg-gradient-to-r from-green-900 to-cyan-900 rounded-lg p-6 mb-6 border border-cyan-400">
          <h3 className="text-xl font-bold text-cyan-300 mb-4">🎯 ESTADO ACTUAL FRENTE RENOVADOR</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">71%</div>
              <div className="text-sm text-cyan-300">Apoyo General</div>
              <div className="text-xs text-green-300">+4% vs ayer</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">1,247</div>
              <div className="text-sm text-cyan-300">Menciones/Hora</div>
              <div className="text-xs text-blue-300">Promedio último día</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">67%</div>
              <div className="text-sm text-cyan-300">Liderazgo</div>
              <div className="text-xs text-green-300">vs competencia</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">15/78</div>
              <div className="text-sm text-cyan-300">Municipios Fuertes</div>
              <div className="text-xs text-yellow-300">19% territorio</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* MONITOREO REDES SOCIALES INTEGRADO */}
          <div className="bg-black bg-opacity-40 rounded-lg p-6 border border-blue-500">
            <h3 className="text-lg font-bold text-blue-300 mb-4">📱 REDES SOCIALES - FRENTE RENOVADOR</h3>
            
            {/* Twitter/X */}
            <div className="mb-4 p-3 bg-blue-900 bg-opacity-30 rounded">
              <h4 className="font-semibold text-blue-200 mb-2">🐦 TWITTER/X</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-white font-bold">387</div>
                  <div className="text-gray-400">Menciones hoy</div>
                </div>
                <div>
                  <div className="text-green-400 font-bold">74%</div>
                  <div className="text-gray-400">Positivas</div>
                </div>
                <div>
                  <div className="text-yellow-400 font-bold">12,4K</div>
                  <div className="text-gray-400">Alcance</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-300">Trending: #MisionesProgresa (+127 menciones)</div>
            </div>

            {/* Facebook */}
            <div className="mb-4 p-3 bg-indigo-900 bg-opacity-30 rounded">
              <h4 className="font-semibold text-indigo-200 mb-2">📘 FACEBOOK</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-white font-bold">892</div>
                  <div className="text-gray-400">Interacciones</div>
                </div>
                <div>
                  <div className="text-green-400 font-bold">81%</div>
                  <div className="text-gray-400">Positivas</div>
                </div>
                <div>
                  <div className="text-yellow-400 font-bold">24,7K</div>
                  <div className="text-gray-400">Alcance</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-indigo-300">Post top: "Inauguración Hospital Posadas" (2.1K likes)</div>
            </div>

            {/* Instagram */}
            <div className="mb-4 p-3 bg-pink-900 bg-opacity-30 rounded">
              <h4 className="font-semibold text-pink-200 mb-2">📷 INSTAGRAM</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-white font-bold">543</div>
                  <div className="text-gray-400">Interacciones</div>
                </div>
                <div>
                  <div className="text-green-400 font-bold">79%</div>
                  <div className="text-gray-400">Positivas</div>
                </div>
                <div>
                  <div className="text-yellow-400 font-bold">8,9K</div>
                  <div className="text-gray-400">Alcance</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-pink-300">Stories vistas: 3,247 • Engagement: 12.3%</div>
            </div>

            {/* YouTube */}
            <div className="p-3 bg-red-900 bg-opacity-30 rounded">
              <h4 className="font-semibold text-red-200 mb-2">📺 YOUTUBE</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-white font-bold">15,832</div>
                  <div className="text-gray-400">Views hoy</div>
                </div>
                <div>
                  <div className="text-green-400 font-bold">87%</div>
                  <div className="text-gray-400">Likes</div>
                </div>
                <div>
                  <div className="text-yellow-400 font-bold">247</div>
                  <div className="text-gray-400">Comentarios</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-red-300">Video top: "Gestión Passalacqua" (8.2K views, 94% positivo)</div>
            </div>
          </div>

          {/* ANÁLISIS TERRITORIAL DETALLADO */}
          <div className="bg-black bg-opacity-40 rounded-lg p-6 border border-green-500">
            <h3 className="text-lg font-bold text-green-300 mb-4">🗺️ MAPA POLÍTICO MISIONES (78 Municipios)</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">23</div>
                <div className="text-sm text-green-300">Municipios Fuertes</div>
                <div className="text-xs text-gray-400">+65% apoyo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">31</div>
                <div className="text-sm text-yellow-300">Municipios Moderados</div>
                <div className="text-xs text-gray-400">45-65% apoyo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">24</div>
                <div className="text-sm text-red-300">Municipios Débiles</div>
                <div className="text-xs text-gray-400">-45% apoyo</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">78</div>
                <div className="text-sm text-cyan-300">Total Monitoreados</div>
                <div className="text-xs text-gray-400">100% cobertura</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-green-200 mb-2">🟢 TERRITORIOS MÁS FUERTES</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Posadas</span>
                  <span className="text-green-400 font-bold">84%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Pto. Iguazú</span>
                  <span className="text-green-400 font-bold">79%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Montecarlo</span>
                  <span className="text-green-400 font-bold">76%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Candelaria</span>
                  <span className="text-green-400 font-bold">73%</span>
                </div>
              </div>
              
              <h4 className="font-semibold text-red-200 mb-2 mt-4">🔴 TERRITORIOS A REFORZAR</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Apóstoles</span>
                  <span className="text-red-400 font-bold">31%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">San Vicente</span>
                  <span className="text-red-400 font-bold">28%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Concepción</span>
                  <span className="text-red-400 font-bold">33%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Ituzaingó</span>
                  <span className="text-red-400 font-bold">36%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COMPETENCIA POLÍTICA - RANKING COMPLETO */}
        <div className="bg-gradient-to-r from-orange-900 to-red-900 rounded-lg p-6 border border-orange-500">
          <h3 className="text-xl font-bold text-orange-300 mb-4">⚔️ COMPETENCIA POLÍTICA - ANÁLISIS COMPLETO</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Ranking General */}
            <div>
              <h4 className="text-lg font-semibold text-orange-200 mb-3">🏆 RANKING GENERAL</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-black bg-opacity-40 p-3 rounded border border-green-500">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🥇</span>
                    <div>
                      <div className="font-bold text-green-300">FRENTE RENOVADOR</div>
                      <div className="text-xs text-gray-400">Hugo Passalacqua</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-xl">67%</div>
                    <div className="text-xs text-green-300">+3% vs ayer</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-black bg-opacity-40 p-3 rounded border border-yellow-500">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🥈</span>
                    <div>
                      <div className="font-bold text-yellow-300">UCR MISIONES</div>
                      <div className="text-xs text-gray-400">Oposición principal</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-xl">19%</div>
                    <div className="text-xs text-red-300">-2% vs ayer</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-black bg-opacity-40 p-3 rounded border border-orange-500">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🥉</span>
                    <div>
                      <div className="font-bold text-orange-300">PJ MISIONES</div>
                      <div className="text-xs text-gray-400">Tercera fuerza</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-400 font-bold text-xl">8%</div>
                    <div className="text-xs text-gray-300">=0% vs ayer</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-black bg-opacity-40 p-3 rounded border border-gray-500">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">4️⃣</span>
                    <div>
                      <div className="font-bold text-gray-300">OTROS</div>
                      <div className="text-xs text-gray-400">Fuerzas menores</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 font-bold text-xl">6%</div>
                    <div className="text-xs text-gray-400">-1% vs ayer</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Figuras Políticas */}
            <div>
              <h4 className="text-lg font-semibold text-orange-200 mb-3">👤 FIGURAS MÁS MENCIONADAS</h4>
              <div className="space-y-3">
                <div className="bg-black bg-opacity-40 p-3 rounded border border-cyan-500">
                  <div className="font-bold text-cyan-300">Hugo Passalacqua (FR)</div>
                  <div className="text-xs text-gray-400 mb-1">Gobernador • Frente Renovador</div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">1,247 menciones</span>
                    <span className="text-cyan-400 font-bold">89% positivo</span>
                  </div>
                </div>
                
                <div className="bg-black bg-opacity-40 p-3 rounded border border-yellow-500">
                  <div className="font-bold text-yellow-300">Referente UCR</div>
                  <div className="text-xs text-gray-400 mb-1">Oposición Principal</div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">431 menciones</span>
                    <span className="text-red-400 font-bold">31% positivo</span>
                  </div>
                </div>
                
                <div className="bg-black bg-opacity-40 p-3 rounded border border-orange-500">
                  <div className="font-bold text-orange-300">Figura PJ</div>
                  <div className="text-xs text-gray-400 mb-1">Tercera Fuerza</div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">187 menciones</span>
                    <span className="text-yellow-400 font-bold">48% positivo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tendencias y Acciones */}
            <div>
              <h4 className="text-lg font-semibold text-orange-200 mb-3">📈 QUÉ HACER AHORA</h4>
              <div className="space-y-3">
                <div className="bg-green-900 bg-opacity-30 p-3 rounded border border-green-500">
                  <div className="font-bold text-green-300 mb-1">✅ MANTENER</div>
                  <div className="text-sm text-gray-300">Liderazgo sólido en Posadas y Puerto Iguazú</div>
                  <div className="text-xs text-green-400 mt-1">Acción: Continuar gestión visible</div>
                </div>
                
                <div className="bg-red-900 bg-opacity-30 p-3 rounded border border-red-500">
                  <div className="font-bold text-red-300 mb-1">🚨 URGENTE</div>
                  <div className="text-sm text-gray-300">Reforzar Apóstoles, San Vicente, Concepción</div>
                  <div className="text-xs text-red-400 mt-1">Acción: Gira territorial inmediata</div>
                </div>
                
                <div className="bg-yellow-900 bg-opacity-30 p-3 rounded border border-yellow-500">
                  <div className="font-bold text-yellow-300 mb-1">⚡ AMPLIFICAR</div>
                  <div className="text-sm text-gray-300">YouTube funcionando bien, duplicar contenido</div>
                  <div className="text-xs text-yellow-400 mt-1">Acción: +3 videos semanales</div>
                </div>
                
                <div className="bg-blue-900 bg-opacity-30 p-3 rounded border border-blue-500">
                  <div className="font-bold text-blue-300 mb-1">📊 APROVECHAR</div>
                  <div className="text-sm text-gray-300">UCR bajando (-2%), momento de contraste</div>
                  <div className="text-xs text-blue-400 mt-1">Acción: Campaña comparativa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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