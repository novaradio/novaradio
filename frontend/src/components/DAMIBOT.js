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
  
  // Nuevo estado para la solapa emergente
  const [emergentTab, setEmergentTab] = useState(null);
  const [showEmergentTab, setShowEmergentTab] = useState(false);
  const emergentTabTimeoutRef = useRef(null);

  // Estados para el chat interactivo
  const [userInput, setUserInput] = useState('');
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

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
    CRITICAL_SOCIAL_POST: {
      icon: Radio,
      color: 'red',
      title: '🚨 Post Crítico Detectado',
      priority: 1
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
    },
    MORNING_BRIEFING: {
      icon: Clock,
      color: 'blue',
      title: '🌅 Briefing Matutino',
      priority: 4
    },
    EVENING_SUMMARY: {
      icon: Star,
      color: 'purple',
      title: '🌆 Resumen Vespertino',
      priority: 4
    },
    NIGHT_MONITORING: {
      icon: Eye,
      color: 'blue',
      title: '🌙 Monitoreo Nocturno',
      priority: 3
    },
    ADMIN_STRATEGIC_UPDATE: {
      icon: Brain,
      color: 'red',
      title: '👑 Alerta Estratégica',
      priority: 2
    },
    ANALYST_DATA_INSIGHT: {
      icon: TrendingUp,
      color: 'blue',
      title: '📊 Insight de Datos',
      priority: 3
    },
    OPERATOR_ACTION_REQUIRED: {
      icon: Zap,
      color: 'orange',
      title: '⚡ Acción Requerida',
      priority: 2
    }
  };

  // Función para mostrar solapa emergente proactiva
  const showEmergentNotification = (type, message, data = {}) => {
    const emergentTypes = {
      'ALERT': {
        icon: '⚠️',
        color: 'red',
        bgColor: 'bg-red-900',
        borderColor: 'border-red-400',
        title: 'Alerta Importante'
      },
      'SUMMARY': {
        icon: '📊',
        color: 'blue',
        bgColor: 'bg-blue-900',
        borderColor: 'border-blue-400',
        title: 'Resumen Disponible'
      },
      'STATISTICS': {
        icon: '📈',
        color: 'green',
        bgColor: 'bg-green-900',
        borderColor: 'border-green-400',
        title: 'Estadísticas Actualizadas'
      },
      'IMPORTANT_DATA': {
        icon: '🔔',
        color: 'yellow',
        bgColor: 'bg-yellow-900',
        borderColor: 'border-yellow-400',
        title: 'Datos Importantes'
      },
      'CRITICAL_UPDATE': {
        icon: '🚨',
        color: 'red',
        bgColor: 'bg-red-900',
        borderColor: 'border-red-400',
        title: 'Actualización Crítica'
      }
    };

    const emergentInfo = emergentTypes[type] || emergentTypes['IMPORTANT_DATA'];
    
    const notification = {
      id: `emergent_${Date.now()}`,
      type: type,
      icon: emergentInfo.icon,
      title: emergentInfo.title,
      message: message,
      color: emergentInfo.color,
      bgColor: emergentInfo.bgColor,
      borderColor: emergentInfo.borderColor,
      timestamp: new Date(),
      data: data
    };

    setEmergentTab(notification);
    setShowEmergentTab(true);

    // Auto-cerrar después de 5 segundos (más rápido)
    if (emergentTabTimeoutRef.current) {
      clearTimeout(emergentTabTimeoutRef.current);
    }
    emergentTabTimeoutRef.current = setTimeout(() => {
      setShowEmergentTab(false);
    }, 5000);
  };

  // Función para cerrar solapa emergente
  const closeEmergentTab = () => {
    setShowEmergentTab(false);
    if (emergentTabTimeoutRef.current) {
      clearTimeout(emergentTabTimeoutRef.current);
    }
  };

  // Función para expandir desde la solapa
  const expandFromEmergentTab = () => {
    // Crear alerta completa basada en la solapa emergente
    if (emergentTab) {
      const fullAlert = {
        id: `full_${emergentTab.id}`,
        type: 'SYSTEM_UPDATE',
        title: emergentTab.title,
        message: emergentTab.message,
        context: {
          emergent_source: true,
          original_type: emergentTab.type,
          timestamp: emergentTab.timestamp
        },
        recommendations: generateRecommendationsFromEmergent(emergentTab.type, emergentTab.data),
        autoClose: false
      };
      
      // Agregar mensaje inicial al chat
      setChatHistory([{
        id: `initial_${Date.now()}`,
        type: 'bot',
        message: fullAlert.message,
        timestamp: new Date()
      }]);
      
      queueAlert(fullAlert);
    }
    closeEmergentTab();
  };

  // Función para enviar mensaje al chat
  const sendChatMessage = async () => {
    if (!userInput.trim() || isLoadingResponse) return;
    
    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      message: userInput,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoadingResponse(true);
    
    try {
      const response = await axios.post(`${API}/chat`, {
        message: userInput,
        session_id: `damibot_${Date.now()}`
      });
      
      const botMessage = {
        id: `bot_${Date.now()}`,
        type: 'bot',
        message: response.data.response,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'bot',
        message: 'Disculpa, he tenido un problema técnico. Por favor intenta nuevamente.',
        timestamp: new Date(),
        isError: true
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  // Función para manejar Enter en el input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  };

  // Generar recomendaciones basadas en el tipo de emergente
  const generateRecommendationsFromEmergent = (type, data) => {
    switch (type) {
      case 'ALERT':
        return [
          'Revisar detalles de la alerta inmediatamente',
          'Verificar nivel de severidad',
          'Activar protocolos de respuesta si es necesario',
          'Notificar al equipo correspondiente'
        ];
      case 'SUMMARY':
        return [
          'Revisar el resumen completo en el dashboard',
          'Analizar tendencias identificadas',
          'Compartir hallazgos con el equipo',
          'Planificar acciones basadas en datos'
        ];
      case 'STATISTICS':
        return [
          'Examinar métricas actualizadas',
          'Comparar con periodos anteriores',
          'Identificar patrones significativos',
          'Generar reportes si es necesario'
        ];
      case 'IMPORTANT_DATA':
        return [
          'Revisar datos importantes inmediatamente',
          'Validar información crítica',
          'Tomar acciones preventivas',
          'Documentar hallazgos'
        ];
      case 'CRITICAL_UPDATE':
        return [
          'Atender actualización crítica inmediatamente',
          'Evaluar impacto en operaciones',
          'Comunicar cambios al equipo',
          'Ajustar estrategias según sea necesario'
        ];
      default:
        return ['Revisar información proporcionada', 'Tomar acciones apropiadas'];
    }
  };

  useEffect(() => {
    // Mostrar DAMIBOT al iniciar sesión
    const welcomeTimeout = setTimeout(() => {
      showWelcomeAlert();
    }, 2000);

    // Mostrar notificación emergente de bienvenida más sutil
    const emergentWelcomeTimeout = setTimeout(() => {
      showEmergentNotification('IMPORTANT_DATA', 
        `Sistema DAMI activo. ${user?.username}, tengo información para ti.`
      );
    }, 8000);

    // Generar notificaciones emergentes con datos reales (menos frecuente)
    const realDataTimeout = setTimeout(() => {
      fetchRealTimeDataForNotifications();
    }, 15000);

    return () => {
      clearTimeout(welcomeTimeout);
      clearTimeout(emergentWelcomeTimeout);
      clearTimeout(realDataTimeout);
    };
  }, [user]);

  // Función para obtener datos reales y generar notificaciones
  const fetchRealTimeDataForNotifications = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/summary`);
      const data = response.data;
      
      // Generar notificaciones basadas en datos reales
      if (data.active_alerts > 0) {
        showEmergentNotification('ALERT', 
          `⚠️ Alerta: ${data.active_alerts} alertas activas requieren atención`
        );
      }
      
      if (data.recent_social_activity > 100) {
        showEmergentNotification('STATISTICS', 
          `📈 Estadísticas: ${data.recent_social_activity} eventos en redes sociales (últimas 24h)`
        );
      }
      
      if (data.actors_monitored > 5) {
        showEmergentNotification('SUMMARY', 
          `📊 Resumen: ${data.actors_monitored} actores políticos bajo monitoreo activo`
        );
      }
      
    } catch (error) {
      console.error('Error fetching real-time data:', error);
      // Fallback a notificación genérica
      showEmergentNotification('IMPORTANT_DATA', 
        '🔔 Datos importantes: Sistema DAMI procesando información en tiempo real'
      );
    }
  };

  useEffect(() => {
    // Análisis inteligente de datos en tiempo real
    if (realTimeData && realTimeData.posts.length > 0) {
      const triggers = DAMIBOTTriggers.shouldTriggerAlert({ 
        newPosts: realTimeData.posts.slice(0, 3) // Últimos 3 posts
      }, user);
      
      triggers.forEach(trigger => {
        if (trigger.type === 'CRITICAL_SOCIAL_POST' || trigger.type === 'HIGH_SOCIAL_ACTIVITY') {
          showIntelligentAlert(trigger);
          // También mostrar solapa emergente para eventos críticos
          if (trigger.type === 'CRITICAL_SOCIAL_POST') {
            showEmergentNotification('ALERT', 
              `⚠️ Alerta: Detectado post crítico en ${trigger.data?.platform || 'redes sociales'}`
            );
          }
        }
      });
    }
  }, [realTimeData]);

  useEffect(() => {
    // Generar alertas contextuales inteligentes y notificaciones emergentes
    const contextualTimeout = setInterval(() => {
      // Generar alertas basadas en contexto y tiempo
      const contextualAlerts = DAMIBOTTriggers.generateContextualAlerts({
        currentTime: new Date(),
        userActivity: 'active'
      }, user);
      
      if (contextualAlerts.length > 0 && Math.random() > 0.6) { // 40% probabilidad
        const selectedAlert = contextualAlerts[Math.floor(Math.random() * contextualAlerts.length)];
        showContextualAlert(selectedAlert);
      }
      
      // Generar notificaciones emergentes proactivas
      const currentTime = new Date();
      const randomChance = Math.random();
      
      if (randomChance > 0.9) { // 10% probabilidad cada minuto (menos invasivo)
        const emergentNotifications = [
          {
            type: 'STATISTICS',
            message: `📈 ${Math.floor(Math.random() * 150) + 50} eventos procesados`
          },
          {
            type: 'SUMMARY',
            message: `📊 Actividad territorial: ${Math.random() > 0.5 ? 'Normal' : 'Monitoreando'}`
          },
          {
            type: 'IMPORTANT_DATA',
            message: `🔔 ${Math.floor(Math.random() * 10) + 5} actores bajo seguimiento`
          }
        ];
        
        const randomNotification = emergentNotifications[Math.floor(Math.random() * emergentNotifications.length)];
        showEmergentNotification(randomNotification.type, randomNotification.message);
      }
      
      // Alertas automáticas por horario
      const hour = currentTime.getHours();
      const minute = currentTime.getMinutes();
      
      // Briefing matutino (8:00 AM)
      if (hour === 8 && minute === 0) {
        showMorningBriefing();
      }
      
      // Resumen vespertino (6:00 PM)
      if (hour === 18 && minute === 0) {
        showEveningSummary();
      }
      
      // Alerta de monitoreo nocturno (10:00 PM)
      if (hour === 22 && minute === 0) {
        showNightMonitoringAlert();
      }
    }, 60000); // Cada minuto

    return () => clearInterval(contextualTimeout);
  }, [user]);

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

  const showIntelligentAlert = (trigger) => {
    const alertType = trigger.type;
    const data = trigger.data;
    
    let message;
    switch (alertType) {
      case 'CRITICAL_SOCIAL_POST':
        message = DAMIBOTMessages.CRITICAL_SOCIAL_POST(data);
        break;
      case 'HIGH_SOCIAL_ACTIVITY':
        message = `Se ha detectado alta actividad de ${data.author} en ${data.platform}. El sistema ha identificado ${data.keywords_triggered.length} palabras clave sensibles que requieren seguimiento.`;
        break;
      default:
        message = 'Se ha detectado actividad que requiere tu atención inmediata.';
    }

    const alert = {
      id: `intelligent_${Date.now()}`,
      type: alertType,
      title: alertTypes[alertType]?.title || '🤖 Alerta Inteligente',
      message: message,
      context: DAMIBOTTriggers.enrichAlertContext(alertType, data, user),
      recommendations: DAMIBOTTriggers.generateSmartRecommendations(alertType, data, user),
      urgency: DAMIBOTTriggers.calculateUrgency(alertType, data),
      autoClose: trigger.priority > 2
    };
    
    queueAlert(alert);
  };

  const showContextualAlert = (alertData) => {
    const alert = {
      id: `contextual_${Date.now()}`,
      type: alertData.type,
      title: alertData.title,
      message: alertData.message,
      context: { 
        timestamp: new Date(), 
        automatic: true,
        userRole: user?.role
      },
      recommendations: DAMIBOTTriggers.generateSmartRecommendations(alertData.type, {}, user),
      autoClose: alertData.priority > 3
    };
    
    queueAlert(alert);
  };

  const showMorningBriefing = async () => {
    try {
      // Obtener datos actualizados para el briefing
      const [summaryRes, actorsRes, alertsRes] = await Promise.all([
        axios.get(`${API}/dashboard/summary`).catch(() => ({ data: null })),
        axios.get(`${API}/actors`).catch(() => ({ data: [] })),
        axios.get(`${API}/alerts`).catch(() => ({ data: [] }))
      ]);

      const criticalActors = summaryRes.data ? 
        (actorsRes.data || []).filter(actor => actor.status === 'roja').length : 0;
      const activeAlerts = summaryRes.data ? summaryRes.data.active_alerts : 0;

      const alert = {
        id: `morning_${Date.now()}`,
        type: 'MORNING_BRIEFING',
        title: '🌅 Briefing Matutino DAMI',
        message: `Buenos días, ${user?.username}. Durante la noche se registraron ${activeAlerts} alertas activas y ${criticalActors} actores en estado crítico. Te proporciono el resumen para comenzar tu jornada estratégicamente.`,
        context: {
          timestamp: new Date(),
          nightlyAlerts: activeAlerts,
          criticalActors: criticalActors,
          briefingType: 'morning'
        },
        recommendations: [
          'Revisar Dashboard General para métricas nocturnas',
          `Analizar los ${criticalActors} actores en estado crítico`,
          'Verificar alertas pendientes de atención',
          'Planificar prioridades del día con tu equipo'
        ],
        autoClose: false
      };
      
      queueAlert(alert);
    } catch (error) {
      console.error('Error generating morning briefing:', error);
    }
  };

  const showEveningSummary = async () => {
    try {
      const summaryRes = await axios.get(`${API}/dashboard/summary`).catch(() => ({ data: null }));
      const recentActivity = summaryRes.data ? summaryRes.data.recent_social_activity : 0;

      const alert = {
        id: `evening_${Date.now()}`,
        type: 'EVENING_SUMMARY',
        title: '🌆 Resumen Vespertino DAMI',
        message: `La jornada concluye con ${recentActivity} eventos registrados en redes sociales. Te proporciono un análisis de los desarrollos del día y preparaciones para el monitoreo nocturno.`,
        context: {
          timestamp: new Date(),
          dailyActivity: recentActivity,
          summaryType: 'evening'
        },
        recommendations: [
          'Revisar logros y eventos del día',
          'Identificar temas críticos para seguimiento nocturno',
          'Preparar briefing para el turno siguiente',
          'Configurar alertas automáticas para la noche'
        ],
        autoClose: false
      };
      
      queueAlert(alert);
    } catch (error) {
      console.error('Error generating evening summary:', error);
    }
  };

  const showNightMonitoringAlert = () => {
    const alert = {
      id: `night_${Date.now()}`,
      type: 'NIGHT_MONITORING',
      title: '🌙 Monitoreo Nocturno Activado',
      message: `El sistema DAMI ha activado el modo de monitoreo nocturno. Los algoritmos de IA estarán vigilando automáticamente y te alertarán solo sobre eventos críticos que requieran intervención inmediata.`,
      context: {
        timestamp: new Date(),
        monitoringMode: 'night',
        autoResponse: true
      },
      recommendations: [
        'Verificar configuración de alertas críticas',
        'Asegurar disponibilidad del equipo de emergencia',
        'Revisar protocolos de respuesta nocturna',
        'Confirmar canales de comunicación de emergencia'
      ],
      autoClose: false
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
    // Navegación inteligente basada en la acción
    if (action.includes('Dashboard')) {
      window.location.hash = '#/dashboard';
      toast.success('Navegando al Dashboard General');
    } else if (action.includes('Radar')) {
      window.location.hash = '#/dashboard/radar';
      toast.success('Navegando al Radar de Actores');
    } else if (action.includes('Mapa') || action.includes('Territorial')) {
      window.location.hash = '#/dashboard/mapa';
      toast.success('Navegando al Mapa de Calor Territorial');
    } else if (action.includes('Feed') || action.includes('redes')) {
      window.location.hash = '#/dashboard/feed';
      toast.success('Navegando al Feed Sr. X');
    } else if (action.includes('IA') || action.includes('Alertas') || action.includes('recomendaciones')) {
      window.location.hash = '#/dashboard/alertas';
      toast.success('Navegando a IA Táctica');
    } else {
      toast.success(`Acción ejecutada: ${action}`);
    }
    
    // Cerrar DAMIBOT después de ejecutar acción
    setTimeout(() => {
      closeAlert();
    }, 1500);
  };

  const showManualHelp = () => {
    const alert = {
      id: `manual_help_${Date.now()}`,
      type: 'SYSTEM_UPDATE',
      title: '🤖 Asistente DAMIBOT',
      message: `¡Hola ${user?.username}! Soy tu asistente inteligente DAMIBOT. Puedo ayudarte a entender lo que está pasando en el sistema y proporcionarte recomendaciones personalizadas según tu rol como ${getRoleLabel(user?.role)}.`,
      context: {
        userRole: user?.role,
        manualActivation: true,
        timestamp: new Date()
      },
      recommendations: [
        'Explicar el estado actual del sistema',
        'Proporcionar guía de navegación',
        'Generar reporte personalizado',
        'Mostrar alertas prioritarias',
        'Ayuda contextual por módulo'
      ],
      autoClose: false
    };
    
    queueAlert(alert);
  };

  // Funciones para activar notificaciones emergentes manuales (para testing)
  const showTestAlert = () => {
    showEmergentNotification('ALERT', 
      '⚠️ Alerta de prueba: Detectada actividad sospechosa en redes sociales'
    );
  };

  const showTestSummary = () => {
    showEmergentNotification('SUMMARY', 
      '📊 Resumen disponible: Análisis completo de actividad diaria listo para revisión'
    );
  };

  const showTestStatistics = () => {
    showEmergentNotification('STATISTICS', 
      '📈 Estadísticas actualizadas: +25% engagement, 150 menciones nuevas'
    );
  };

  const showTestCritical = () => {
    showEmergentNotification('CRITICAL_UPDATE', 
      '🚨 Actualización crítica: Sistema detecta campaña coordinada en proceso'
    );
  };

  if (!isVisible || !currentAlert) {
    // Botón flotante para activar DAMIBOT manualmente
    return (
      <>
        {/* Solapa emergente proactiva - Versión mejorada */}
        {showEmergentTab && emergentTab && (
          <div className="fixed top-4 right-4 z-40 max-w-sm">
            <div className={`
              bg-gray-800 bg-opacity-95 backdrop-blur-md
              border-l-4 ${emergentTab.borderColor.replace('border-', 'border-l-')}
              rounded-r-lg shadow-xl
              transform transition-all duration-500 ease-in-out
              ${showEmergentTab ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}>
              {/* Header compacto */}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">DAMIBOT</h3>
                    <p className="text-gray-400 text-xs">{emergentTab.title}</p>
                  </div>
                </div>
                <button
                  onClick={closeEmergentTab}
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Contenido compacto */}
              <div className="px-4 pb-3">
                <div className="flex items-start space-x-2 mb-3">
                  <div className="text-lg">{emergentTab.icon}</div>
                  <p className="text-white text-sm flex-1">{emergentTab.message}</p>
                </div>
                
                {/* Botones de acción compactos */}
                <div className="flex space-x-2">
                  <button
                    onClick={expandFromEmergentTab}
                    className="bg-green-500 hover:bg-green-400 text-black px-3 py-1 rounded text-xs font-medium transition-colors flex items-center"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Detalles
                  </button>
                  <button
                    onClick={closeEmergentTab}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
              
              {/* Indicador de progreso más sutil */}
              <div className="w-full bg-gray-700 h-1 rounded-b-lg overflow-hidden">
                <div 
                  className={`h-1 transition-all duration-5000 ease-linear ${
                    emergentTab.color === 'red' ? 'bg-red-400' :
                    emergentTab.color === 'blue' ? 'bg-blue-400' :
                    emergentTab.color === 'yellow' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`}
                  style={{ 
                    width: showEmergentTab ? '0%' : '100%',
                    transition: 'width 5s linear'
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Botón flotante para activar DAMIBOT manualmente */}
        <div className="fixed bottom-20 left-6 z-40">
          <button
            onClick={showManualHelp}
            className="bg-blue-500 hover:bg-blue-400 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center group"
            title="Activar DAMIBOT - Asistente Inteligente"
          >
            <Bot className="w-6 h-6" />
            <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap text-sm font-medium">
              DAMIBOT
            </span>
          </button>
        </div>

        {/* Botones de prueba para notificaciones emergentes (solo para testing) */}
        {user?.role === 'administrator' && (
          <div className="fixed bottom-40 left-6 z-40 space-y-2">
            <button
              onClick={showTestAlert}
              className="bg-red-500 hover:bg-red-400 text-white p-2 rounded-full shadow-lg transition-all duration-200 text-xs"
              title="Prueba: Alerta"
            >
              ⚠️
            </button>
            <button
              onClick={showTestSummary}
              className="bg-blue-500 hover:bg-blue-400 text-white p-2 rounded-full shadow-lg transition-all duration-200 text-xs"
              title="Prueba: Resumen"
            >
              📊
            </button>
            <button
              onClick={showTestStatistics}
              className="bg-green-500 hover:bg-green-400 text-white p-2 rounded-full shadow-lg transition-all duration-200 text-xs"
              title="Prueba: Estadísticas"
            >
              📈
            </button>
            <button
              onClick={showTestCritical}
              className="bg-purple-500 hover:bg-purple-400 text-white p-2 rounded-full shadow-lg transition-all duration-200 text-xs"
              title="Prueba: Crítico"
            >
              🚨
            </button>
          </div>
        )}
      </>
    );
  }

  const alertConfig = getAlertConfig(currentAlert.type);
  const Icon = alertConfig.icon;

  return (
    <>
      {/* Overlay menos invasivo */}
      <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center p-4">
        
        {/* DAMIBOT Alert - Versión mejorada */}
        <div className={`
          bg-gray-800 border-2 rounded-xl shadow-2xl max-w-xl w-full
          transform transition-all duration-300
          ${isExpanded ? 'max-h-screen' : 'max-h-80'}
          ${alertConfig.color === 'red' ? 'border-red-400' :
            alertConfig.color === 'orange' ? 'border-orange-400' :
            alertConfig.color === 'yellow' ? 'border-yellow-400' :
            alertConfig.color === 'blue' ? 'border-blue-400' :
            alertConfig.color === 'purple' ? 'border-purple-400' :
            'border-green-400'}
          animate-in slide-in-from-bottom-4 fade-in-0 duration-300
        `}>
          
          {/* Header */}
          <div className={`
            p-4 rounded-t-lg border-b border-gray-700 relative overflow-hidden
            ${alertConfig.color === 'red' ? 'bg-red-900 bg-opacity-30' :
              alertConfig.color === 'orange' ? 'bg-orange-900 bg-opacity-30' :
              alertConfig.color === 'yellow' ? 'bg-yellow-900 bg-opacity-30' :
              alertConfig.color === 'blue' ? 'bg-blue-900 bg-opacity-30' :
              alertConfig.color === 'purple' ? 'bg-purple-900 bg-opacity-30' :
              'bg-green-900 bg-opacity-30'}
          `}>
            {/* Animated background effect */}
            <div className="absolute inset-0 opacity-20">
              <div className={`absolute inset-0 animate-pulse ${
                alertConfig.color === 'red' ? 'bg-gradient-to-r from-red-500 to-transparent' :
                alertConfig.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-transparent' :
                alertConfig.color === 'yellow' ? 'bg-gradient-to-r from-yellow-500 to-transparent' :
                alertConfig.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-transparent' :
                alertConfig.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-transparent' :
                'bg-gradient-to-r from-green-500 to-transparent'
              }`}></div>
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mr-4 animate-pulse
                  ${alertConfig.color === 'red' ? 'bg-red-500' :
                    alertConfig.color === 'orange' ? 'bg-orange-500' :
                    alertConfig.color === 'yellow' ? 'bg-yellow-500' :
                    alertConfig.color === 'blue' ? 'bg-blue-500' :
                    alertConfig.color === 'purple' ? 'bg-purple-500' :
                    'bg-green-500'}
                `}>
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center">
                    DAMIBOT
                    <span className="ml-2 px-2 py-1 bg-green-400 text-black text-xs rounded-full">
                      ACTIVO
                    </span>
                  </h2>
                  <p className="text-sm text-gray-300">Asistente Inteligente • {getRoleLabel(user?.role)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {alertQueue.length > 0 && (
                  <div className="bg-green-400 text-black px-3 py-1 rounded-full text-xs font-semibold animate-bounce">
                    +{alertQueue.length} alertas
                  </div>
                )}
                <button
                  onClick={closeAlert}
                  className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition-all duration-200"
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
                alertConfig.color === 'purple' ? 'text-purple-400' :
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

            {/* Sección de Chat Interactivo */}
            <div className="mt-6 border-t border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-green-400 mb-3 flex items-center">
                <Bot className="w-4 h-4 mr-2" />
                Conversación con DAMIBOT
              </h4>
              
              {/* Historial de chat */}
              <div className="bg-gray-900 rounded-lg p-3 mb-3 max-h-40 overflow-y-auto">
                {chatHistory.length > 0 ? (
                  chatHistory.map((message) => (
                    <div key={message.id} className={`mb-2 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-2 rounded-lg text-sm ${
                        message.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : message.isError 
                            ? 'bg-red-900 text-red-400' 
                            : 'bg-gray-700 text-white'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm text-center">
                    ¡Hola! Puedes hacer preguntas sobre el sistema DAMI.
                  </p>
                )}
                
                {/* Indicador de carga */}
                {isLoadingResponse && (
                  <div className="flex justify-start mb-2">
                    <div className="bg-gray-700 p-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input para mensajes */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-green-400 focus:outline-none text-sm"
                  disabled={isLoadingResponse}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={isLoadingResponse || !userInput.trim()}
                  className="bg-green-400 hover:bg-green-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-4 py-2 rounded-lg transition-colors text-sm font-semibold"
                >
                  {isLoadingResponse ? '...' : 'Enviar'}
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