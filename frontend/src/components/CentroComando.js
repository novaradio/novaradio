import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, TrendingDown, TrendingUp, Users, MessageSquare, Eye, Zap } from 'lucide-react';

const CentroComando = () => {
  const [situacionActual, setSituacionActual] = useState({});
  const [alertasUrgentes, setAlertasUrgentes] = useState([]);
  const [monitoreoTiempoReal, setMonitoreoTiempoReal] = useState([]);

  useEffect(() => {
    // Simular datos en tiempo real para demostración
    const interval = setInterval(() => {
      actualizarSituacion();
    }, 5000);

    actualizarSituacion();
    return () => clearInterval(interval);
  }, []);

  const actualizarSituacion = () => {
    // Datos simulados específicos y realistas
    setSituacionActual({
      nivelAmenaza: "MODERADO",
      ataquesPrincipales: 3,
      desinformacionActiva: 2,
      sentimientoPublico: 65,
      tendencia: "estable"
    });

    setAlertasUrgentes([
      {
        id: 1,
        tipo: "CRÍTICO",
        problema: "Campaña coordinada de desinformación detectada",
        detalles: "12 cuentas falsas están difundiendo información falsa sobre presupuesto municipal",
        ubicacion: "Redes sociales - Twitter y Facebook",
        tiempo: "Hace 15 minutos",
        accion: "RESPONDER INMEDIATAMENTE con comunicado oficial",
        responsable: "Equipo de Comunicaciones",
        impacto: "ALTO - 2,400 interacciones detectadas"
      },
      {
        id: 2,
        tipo: "URGENTE",
        problema: "Ataque coordinado en redes contra liderazgo",
        detalles: "Hashtag #FrenteCorrupto trending artificialmente",
        ubicacion: "Twitter - Tendencias manipuladas",
        tiempo: "Hace 45 minutos",
        accion: "Activar red de apoyo digital y contra-narrativa",
        responsable: "Coordinación Digital",
        impacto: "MEDIO - 8,200 menciones"
      },
      {
        id: 3,
        tipo: "ATENCIÓN",
        problema: "Movimiento opositor planificando evento",
        detalles: "Organización de marcha para el viernes en plaza central",
        ubicacion: "Grupos de WhatsApp monitoreados",
        tiempo: "Hace 2 horas",
        accion: "Preparar evento de respuesta y logística",
        responsable: "Coordinación Territorial",
        impacto: "BAJO - Evento local estimado 500 personas"
      }
    ]);

    setMonitoreoTiempoReal([
      {
        evento: "Mención positiva en medio local",
        detalle: "Nota favorable sobre gestión en Canal 7",
        sentimiento: "positivo",
        tiempo: "13:45",
        fuente: "Medios tradicionales"
      },
      {
        evento: "Actividad sospechosa detectada",
        detalle: "30 cuentas nuevas mencionando misma frase",
        sentimiento: "negativo",
        tiempo: "13:42",
        fuente: "Redes sociales"
      },
      {
        evento: "Apoyo ciudadano registrado",
        detalle: "Comentarios positivos en publicación oficial",
        sentimiento: "positivo",
        tiempo: "13:38",
        fuente: "Facebook oficial"
      },
      {
        evento: "Crítica en blog opositor",
        detalle: "Artículo crítico sobre última decisión municipal",
        sentimiento: "negativo",
        tiempo: "13:35",
        fuente: "Blog político"
      }
    ]);
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
        <h2 className="text-2xl font-semibold text-white mb-6">📊 SITUACIÓN GENERAL AHORA</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-800 rounded-lg">
            <div className={`text-2xl font-bold px-3 py-1 rounded ${getNivelAmenazaColor(situacionActual.nivelAmenaza)}`}>
              {situacionActual.nivelAmenaza || 'MODERADO'}
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
          {alertasUrgentes.map((alerta) => (
            <div key={alerta.id} className={`border-2 rounded-lg p-6 ${getTipoColor(alerta.tipo)}`}>
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
          ))}
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
          <button className="p-4 bg-red-600 hover:bg-red-700 rounded-lg transition text-center">
            <MessageSquare className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Respuesta de Emergencia</div>
          </button>
          
          <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-center">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Activar Red de Apoyo</div>
          </button>
          
          <button className="p-4 bg-green-600 hover:bg-green-700 rounded-lg transition text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Campaña Positiva</div>
          </button>
          
          <button className="p-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-center">
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