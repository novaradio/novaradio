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

      {/* NUEVA SECCIÓN: ESTADÍSTICAS ESPECÍFICAS FR */}
      <div className="dami-card bg-gradient-to-r from-cyan-900 to-blue-900">
        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-cyan-400" />
          📊 ESTADÍSTICAS DETALLADAS FRENTE RENOVADOR
        </h2>
        
        {/* Métricas Hora a Hora */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Redes Sociales Hora a Hora */}
          <div className="bg-black bg-opacity-40 rounded-lg p-4 border border-cyan-500">
            <h3 className="text-lg font-bold text-cyan-300 mb-4">📱 REDES SOCIALES (Últimas 6h)</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">20:00-21:00</span>
                <div className="flex items-center">
                  <span className="text-green-400 font-bold mr-2">+127 menciones</span>
                  <span className="text-xs bg-green-800 px-2 py-1 rounded">72% positivo</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">21:00-22:00</span>
                <div className="flex items-center">
                  <span className="text-green-400 font-bold mr-2">+89 menciones</span>
                  <span className="text-xs bg-green-800 px-2 py-1 rounded">68% positivo</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">22:00-23:00</span>
                <div className="flex items-center">
                  <span className="text-yellow-400 font-bold mr-2">+45 menciones</span>
                  <span className="text-xs bg-yellow-800 px-2 py-1 rounded">52% positivo</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">23:00-00:00</span>
                <div className="flex items-center">
                  <span className="text-red-400 font-bold mr-2">+23 menciones</span>
                  <span className="text-xs bg-red-800 px-2 py-1 rounded">31% positivo</span>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-cyan-900 bg-opacity-30 rounded">
              <strong className="text-cyan-300">Tendencia:</strong>
              <span className="text-yellow-300"> Bajando desde las 20:00. Activar campaña nocturna.</span>
            </div>
          </div>

          {/* YouTube Específico */}
          <div className="bg-black bg-opacity-40 rounded-lg p-4 border border-red-500">
            <h3 className="text-lg font-bold text-red-300 mb-4">📺 YOUTUBE FR TRACKING</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Videos FR hoy:</span>
                <span className="text-white font-bold">3 publicados</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Views totales:</span>
                <span className="text-green-400 font-bold">12,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Comentarios:</span>
                <span className="text-blue-400 font-bold">287 (79% positivos)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300">Suscriptores hoy:</span>
                <span className="text-green-400 font-bold">+24</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-400 mb-2">Video top performance:</div>
              <div className="bg-red-900 bg-opacity-30 p-2 rounded">
                <div className="font-medium text-red-200">"Obras en Posadas - Progreso Real"</div>
                <div className="text-xs text-gray-300">4,521 views • 91% engagement positivo</div>
              </div>
            </div>
          </div>

          {/* Comparación Territorial */}
          <div className="bg-black bg-opacity-40 rounded-lg p-4 border border-purple-500">
            <h3 className="text-lg font-bold text-purple-300 mb-4">🗺️ POSICIONAMIENTO TERRITORIAL FR</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">🟢 Posadas</span>
                <span className="text-green-400 font-bold">76% favorable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">🟢 Puerto Iguazú</span>
                <span className="text-green-400 font-bold">71% favorable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">🟡 Oberá</span>
                <span className="text-yellow-400 font-bold">58% favorable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">🟡 Eldorado</span>
                <span className="text-yellow-400 font-bold">54% favorable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">🔴 Apóstoles</span>
                <span className="text-red-400 font-bold">39% favorable</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">🔴 San Vicente</span>
                <span className="text-red-400 font-bold">33% favorable</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-purple-900 bg-opacity-30 rounded">
              <strong className="text-purple-300">Acción:</strong>
              <span className="text-yellow-300"> Reforzar presencia en Apóstoles y San Vicente urgentemente.</span>
            </div>
          </div>
        </div>

        {/* Análisis de Competencia Específico */}
        <div className="bg-gradient-to-r from-orange-900 to-red-900 rounded-lg p-6 border border-orange-500">
          <h3 className="text-xl font-bold text-orange-300 mb-4">⚔️ COMPETENCIA POLÍTICA - RANKING ACTUAL</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-orange-200 mb-3">🏆 RANKING DE PARTIDOS</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-black bg-opacity-40 p-3 rounded">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🥇</span>
                    <div>
                      <div className="font-bold text-green-300">FRENTE RENOVADOR</div>
                      <div className="text-xs text-gray-400">Liderando en redes</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">67%</div>
                    <div className="text-xs text-green-300">+3% vs ayer</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-black bg-opacity-40 p-3 rounded">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🥈</span>
                    <div>
                      <div className="font-bold text-yellow-300">UCR MISIONES</div>
                      <div className="text-xs text-gray-400">Segundo lugar</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">24%</div>
                    <div className="text-xs text-red-300">-2% vs ayer</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-black bg-opacity-40 p-3 rounded">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🥉</span>
                    <div>
                      <div className="font-bold text-orange-300">PJ MISIONES</div>
                      <div className="text-xs text-gray-400">Tercer lugar</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-400 font-bold">9%</div>
                    <div className="text-xs text-gray-300">=0% vs ayer</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-orange-200 mb-3">👤 FIGURAS MÁS MENCIONADAS</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-black bg-opacity-40 p-3 rounded">
                  <div>
                    <div className="font-bold text-cyan-300">Hugo Passalacqua (FR)</div>
                    <div className="text-xs text-gray-400">Gobernador</div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 font-bold">342 menciones</div>
                    <div className="text-xs text-green-300">83% positivo</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-black bg-opacity-40 p-3 rounded">
                  <div>
                    <div className="font-bold text-yellow-300">Figura UCR</div>
                    <div className="text-xs text-gray-400">Oposición principal</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">127 menciones</div>
                    <div className="text-xs text-red-300">34% positivo</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-black bg-opacity-40 p-3 rounded">
                  <div>
                    <div className="font-bold text-orange-300">Referente PJ</div>
                    <div className="text-xs text-gray-400">Tercera fuerza</div>
                  </div>
                  <div className="text-right">
                    <div className="text-orange-400 font-bold">89 menciones</div>
                    <div className="text-xs text-yellow-300">52% positivo</div>
                  </div>
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