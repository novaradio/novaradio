import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Bot, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Zap,
  Brain,
  Eye,
  TrendingUp,
  Users,
  MapPin,
  Radio,
  ArrowRight,
  Lightbulb,
  Clock,
  Star
} from 'lucide-react';
import toast from 'react-hot-toast';
import { DAMIBOTTriggers, DAMIBOTMessages } from '../utils/damibotUtils';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DAMIBOT = ({ user, realTimeData }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);
  const [alertQueue, setAlertQueue] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contextualInfo, setContextualInfo] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const alertTimeoutRef = useRef(null);

  // Tipos de alertas que DAMIBOT puede mostrar
  const alertTypes = {
    NEW_CRITICAL_ACTOR: {
      icon: Users,
      color: 'red',
      title: '🚨 Actor Crítico Detectado',
      priority: 1
    },
    HIGH_SOCIAL_ACTIVITY: {
      icon: Radio,
      color: 'orange',
      title: '📡 Alta Actividad en Redes',
      priority: 2
    },
    TERRITORY_ESCALATION: {
      icon: MapPin,
      color: 'yellow',
      title: '🌍 Escalamiento Territorial',
      priority: 3
    },
    AI_RECOMMENDATION: {
      icon: Brain,
      color: 'blue',
      title: '🧠 Nueva Recomendación IA',
      priority: 4
    },
    SYSTEM_UPDATE: {
      icon: Info,
      color: 'green',
      title: '💡 Actualización del Sistema',
      priority: 5
    }
  };

  useEffect(() => {
    // Mostrar DAMIBOT al iniciar sesión
    const welcomeTimeout = setTimeout(() => {
      showWelcomeAlert();
    }, 2000);

    return () => clearTimeout(welcomeTimeout);
  }, [user]);

  useEffect(() => {
    // Monitorear datos en tiempo real
    if (realTimeData && realTimeData.posts.length > 0) {
      const latestPost = realTimeData.posts[0];
      if (latestPost.alert_level === 'critical' || latestPost.alert_level === 'high') {
        showSocialActivityAlert(latestPost);
      }
    }
  }, [realTimeData]);

  useEffect(() => {
    // Generar alertas contextuales aleatorias (simulación)
    const contextualTimeout = setInterval(() => {
      if (Math.random() > 0.7) { // 30% probabilidad cada 60 segundos
        generateContextualAlert();
      }
    }, 60000);

    return () => clearInterval(contextualTimeout);
  }, []);

  const showWelcomeAlert = () => {
    const welcomeAlert = {
      id: `welcome_${Date.now()}`,
      type: 'SYSTEM_UPDATE',
      title: `¡Bienvenido al Sistema DAMI, ${user?.username}!`,
      message: `Soy DAMIBOT, tu asistente inteligente. Te ayudaré a entender lo que está pasando en tiempo real y te daré recomendaciones personalizadas según tu rol como ${getRoleLabel(user?.role)}.`,
      context: {
        userRole: user?.role,
        accessLevel: user?.role === 'administrator' ? 'completo' : user?.role === 'analyst' ? 'analítico' : 'operativo'
      },
      recommendations: [
        `Explora el Dashboard para ver métricas en tiempo real`,
        `Revisa el Radar de Actores para monitoreo político`,
        `Consulta las Alertas IA para recomendaciones estratégicas`
      ],
      autoClose: false
    };
    
    queueAlert(welcomeAlert);
  };

  const showSocialActivityAlert = (post) => {
    const alert = {
      id: `social_${Date.now()}`,
      type: 'HIGH_SOCIAL_ACTIVITY',
      title: 'Nueva Actividad Crítica Detectada',
      message: `Se ha detectado una publicación de ${post.author} con nivel de alerta ${post.alert_level.toUpperCase()}. El sistema ha identificado palabras clave sensibles que requieren atención.`,
      context: {
        author: post.author,
        platform: post.platform,
        alertLevel: post.alert_level,
        keywords: post.keywords_triggered,
        sentiment: post.sentiment_score
      },
      recommendations: generateSocialRecommendations(post),
      autoClose: true
    };
    
    queueAlert(alert);
  };

  const generateContextualAlert = () => {
    const alertOptions = [
      {
        type: 'AI_RECOMMENDATION',
        title: 'Análisis Predictivo Completado',
        message: 'El sistema de IA ha identificado un patrón emergente en el comportamiento político que requiere tu atención. Se recomienda revisar los últimos datos del Radar de Actores.',
        recommendations: [
          'Revisa el módulo Radar de Actores',
          'Analiza las tendencias de los últimos 24 horas',
          'Considera activar protocolos preventivos'
        ]
      },
      {
        type: 'TERRITORY_ESCALATION',
        title: 'Cambio en Actividad Territorial',
        message: 'Se ha detectado un incremento significativo en la actividad política de una zona territorial. Los algoritmos sugieren monitoreo intensivo.',
        recommendations: [
          'Ve al Mapa de Calor Territorial',
          'Identifica la zona con mayor actividad',
          'Evalúa necesidad de recursos adicionales'
        ]
      }
    ];

    const selectedAlert = alertOptions[Math.floor(Math.random() * alertOptions.length)];
    const alert = {
      id: `contextual_${Date.now()}`,
      ...selectedAlert,
      context: { timestamp: new Date(), automatic: true },
      autoClose: true
    };
    
    queueAlert(alert);
  };

  const queueAlert = (alert) => {
    setAlertQueue(prev => {
      const newQueue = [...prev, alert].sort((a, b) => 
        (alertTypes[a.type]?.priority || 999) - (alertTypes[b.type]?.priority || 999)
      );
      return newQueue;
    });

    if (!isVisible) {
      showNextAlert();
    }
  };

  const showNextAlert = () => {
    if (alertQueue.length > 0) {
      const nextAlert = alertQueue[0];
      setCurrentAlert(nextAlert);
      setIsVisible(true);
      setIsExpanded(false);
      
      setAlertQueue(prev => prev.slice(1));

      // Auto-close si está configurado
      if (nextAlert.autoClose) {
        if (alertTimeoutRef.current) {
          clearTimeout(alertTimeoutRef.current);
        }
        alertTimeoutRef.current = setTimeout(() => {
          closeAlert();
        }, 15000); // 15 segundos
      }
    }
  };

  const closeAlert = () => {
    setIsVisible(false);
    setIsExpanded(false);
    if (alertTimeoutRef.current) {
      clearTimeout(alertTimeoutRef.current);
    }
    
    // Mostrar siguiente alerta si hay
    setTimeout(() => {
      if (alertQueue.length > 0) {
        showNextAlert();
      }
    }, 1000);
  };

  const generateSocialRecommendations = (post) => {
    const recommendations = [];
    
    if (post.alert_level === 'critical') {
      recommendations.push('Activar protocolo de respuesta inmediata');
      recommendations.push('Notificar al equipo de análisis');
      recommendations.push('Preparar contramedidas comunicacionales');
    } else if (post.alert_level === 'high') {
      recommendations.push('Monitorear evolución de la situación');
      recommendations.push('Evaluar impacto potencial');
      recommendations.push('Considerar respuesta preventiva');
    }

    if (post.sentiment_score < -0.5) {
      recommendations.push('Alto sentimiento negativo detectado');
    }

    return recommendations;
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'administrator': return 'Administrador';
      case 'analyst': return 'Analista';
      case 'operator': return 'Operador';
      default: return 'Usuario';
    }
  };

  const getAlertConfig = (type) => {
    return alertTypes[type] || alertTypes.SYSTEM_UPDATE;
  };

  const handleAction = (action) => {
    toast.success(`Acción ejecutada: ${action}`);
    // Aquí podrías implementar navegación o acciones específicas
  };

  if (!isVisible || !currentAlert) return null;

  const alertConfig = getAlertConfig(currentAlert.type);
  const Icon = alertConfig.icon;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        
        {/* DAMIBOT Alert */}
        <div className={`
          bg-gray-800 border-2 rounded-lg shadow-2xl max-w-2xl w-full
          transform transition-all duration-300
          ${isExpanded ? 'max-h-screen' : 'max-h-96'}
          ${alertConfig.color === 'red' ? 'border-red-400' :
            alertConfig.color === 'orange' ? 'border-orange-400' :
            alertConfig.color === 'yellow' ? 'border-yellow-400' :
            alertConfig.color === 'blue' ? 'border-blue-400' :
            'border-green-400'}
        `}>
          
          {/* Header */}
          <div className={`
            p-4 rounded-t-lg border-b border-gray-700
            ${alertConfig.color === 'red' ? 'bg-red-900 bg-opacity-30' :
              alertConfig.color === 'orange' ? 'bg-orange-900 bg-opacity-30' :
              alertConfig.color === 'yellow' ? 'bg-yellow-900 bg-opacity-30' :
              alertConfig.color === 'blue' ? 'bg-blue-900 bg-opacity-30' :
              'bg-green-900 bg-opacity-30'}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mr-4
                  ${alertConfig.color === 'red' ? 'bg-red-500' :
                    alertConfig.color === 'orange' ? 'bg-orange-500' :
                    alertConfig.color === 'yellow' ? 'bg-yellow-500' :
                    alertConfig.color === 'blue' ? 'bg-blue-500' :
                    'bg-green-500'}
                `}>
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">DAMIBOT</h2>
                  <p className="text-sm text-gray-300">Asistente Inteligente</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {alertQueue.length > 0 && (
                  <div className="bg-green-400 text-black px-2 py-1 rounded-full text-xs font-semibold">
                    +{alertQueue.length}
                  </div>
                )}
                <button
                  onClick={closeAlert}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Alert Title */}
            <div className="flex items-center mb-4">
              <Icon className={`w-6 h-6 mr-3 ${
                alertConfig.color === 'red' ? 'text-red-400' :
                alertConfig.color === 'orange' ? 'text-orange-400' :
                alertConfig.color === 'yellow' ? 'text-yellow-400' :
                alertConfig.color === 'blue' ? 'text-blue-400' :
                'text-green-400'
              }`} />
              <h3 className="text-lg font-semibold text-white">
                {currentAlert.title}
              </h3>
            </div>

            {/* Alert Message */}
            <div className="mb-6">
              <p className="text-gray-300 leading-relaxed">
                {currentAlert.message}
              </p>
            </div>

            {/* Context Information */}
            {currentAlert.context && isExpanded && (
              <div className="mb-6 p-4 bg-gray-700 bg-opacity-50 rounded-lg">
                <h4 className="text-sm font-semibold text-green-400 mb-2">
                  Información Contextual:
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(currentAlert.context).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                      <span className="text-white font-medium">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {currentAlert.recommendations && currentAlert.recommendations.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400 mr-2" />
                  <h4 className="text-sm font-semibold text-white">
                    ¿Qué debo hacer ahora?
                  </h4>
                </div>
                <div className="space-y-2">
                  {currentAlert.recommendations.map((rec, index) => (
                    <div 
                      key={index}
                      className="flex items-center p-3 bg-gray-700 bg-opacity-30 rounded-lg hover:bg-gray-700 hover:bg-opacity-50 transition-colors cursor-pointer"
                      onClick={() => handleAction(rec)}
                    >
                      <ArrowRight className="w-4 h-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm text-gray-300 flex-1">{rec}</span>
                      <CheckCircle className="w-4 h-4 text-gray-500 hover:text-green-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-gray-400 hover:text-green-400 flex items-center"
              >
                <Info className="w-4 h-4 mr-1" />
                {isExpanded ? 'Menos detalles' : 'Más detalles'}
              </button>
              
              <div className="flex space-x-3">
                {currentAlert.autoClose && (
                  <button
                    onClick={closeAlert}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors text-sm"
                  >
                    Entendido
                  </button>
                )}
                
                <button
                  onClick={() => {
                    // Aquí podrías abrir el chat completo o navegar
                    toast.success('Abriendo análisis completo...');
                  }}
                  className="px-4 py-2 bg-green-400 text-black rounded-md hover:bg-green-300 transition-colors text-sm font-semibold"
                >
                  Analizar Más
                </button>
              </div>
            </div>

            {/* Progress indicator si hay más alertas */}
            {alertQueue.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{alertQueue.length} alertas pendientes</span>
                  <div className="flex space-x-1">
                    {[...Array(Math.min(alertQueue.length, 5))].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-green-400 rounded-full opacity-50"></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DAMIBOT;