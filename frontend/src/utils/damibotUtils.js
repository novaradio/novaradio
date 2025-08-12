// Utilidades para DAMIBOT - Sistema de triggers inteligentes
export const DAMIBOTTriggers = {
  
  // Analiza datos y determina si DAMIBOT debe aparecer
  shouldTriggerAlert: (data, user) => {
    const triggers = [];
    
    // 1. Nuevos posts críticos en redes sociales
    if (data.newPosts) {
      data.newPosts.forEach(post => {
        if (post.alert_level === 'critical') {
          triggers.push({
            type: 'CRITICAL_SOCIAL_POST',
            priority: 1,
            data: post
          });
        } else if (post.alert_level === 'high' && post.keywords_triggered.length > 2) {
          triggers.push({
            type: 'HIGH_SOCIAL_ACTIVITY',
            priority: 2,
            data: post
          });
        }
      });
    }
    
    // 2. Cambios drásticos en actores políticos
    if (data.actorChanges) {
      data.actorChanges.forEach(change => {
        if (change.statusChange && change.newStatus === 'roja') {
          triggers.push({
            type: 'ACTOR_ESCALATION',
            priority: 1,
            data: change
          });
        }
      });
    }
    
    // 3. Incremento territorial significativo
    if (data.territorialChanges) {
      data.territorialChanges.forEach(change => {
        if (change.activityIncrease > 30) {
          triggers.push({
            type: 'TERRITORIAL_SPIKE',
            priority: 2,
            data: change
          });
        }
      });
    }
    
    // 4. Nuevas recomendaciones IA críticas
    if (data.newRecommendations) {
      data.newRecommendations.forEach(rec => {
        if (rec.priority === 'critical') {
          triggers.push({
            type: 'CRITICAL_AI_RECOMMENDATION',
            priority: 1,
            data: rec
          });
        }
      });
    }
    
    // 5. Patrones anómalos detectados
    if (data.anomalies) {
      triggers.push({
        type: 'ANOMALY_DETECTED',
        priority: 3,
        data: data.anomalies
      });
    }
    
    return triggers.sort((a, b) => a.priority - b.priority);
  },
  
  // Genera alertas contextuales inteligentes
  generateContextualAlerts: (currentContext, user) => {
    const alerts = [];
    const now = new Date();
    const hour = now.getHours();
    
    // Alertas basadas en tiempo
    if (hour >= 6 && hour <= 9) {
      alerts.push({
        type: 'MORNING_BRIEFING',
        title: '🌅 Briefing Matutino',
        message: 'Buenos días. Te proporciono un resumen de la actividad nocturna y las prioridades del día.',
        priority: 4
      });
    } else if (hour >= 18 && hour <= 20) {
      alerts.push({
        type: 'EVENING_SUMMARY',
        title: '🌆 Resumen Vespertino',
        message: 'Aquí tienes un análisis de la jornada y preparación para el monitoreo nocturno.',
        priority: 4
      });
    }
    
    // Alertas basadas en rol
    if (user.role === 'administrator') {
      alerts.push({
        type: 'ADMIN_STRATEGIC_UPDATE',
        title: '👑 Actualización Estratégica',
        message: 'Como administrador, necesitas conocer estos desarrollos críticos que requieren decisiones de alto nivel.',
        priority: 2
      });
    } else if (user.role === 'analyst') {
      alerts.push({
        type: 'ANALYST_DATA_INSIGHT',
        title: '📊 Insight Analítico',
        message: 'He identificado patrones en los datos que requieren tu análisis especializado.',
        priority: 3
      });
    } else if (user.role === 'operator') {
      alerts.push({
        type: 'OPERATOR_ACTION_REQUIRED',
        title: '⚡ Acción Requerida',
        message: 'Se necesita ejecutar protocolos operativos específicos basados en la situación actual.',
        priority: 2
      });
    }
    
    return alerts;
  },
  
  // Genera recomendaciones específicas según el contexto
  generateSmartRecommendations: (alertType, data, user) => {
    const recommendations = [];
    
    switch (alertType) {
      case 'CRITICAL_SOCIAL_POST':
        recommendations.push(
          'Ir al Feed Sr. X para análisis completo',
          'Activar protocolo de respuesta inmediata',
          'Notificar al equipo de comunicaciones',
          'Evaluar necesidad de contrarespuesta'
        );
        break;
        
      case 'ACTOR_ESCALATION':
        recommendations.push(
          'Revisar perfil completo en Radar de Actores',
          'Analizar historial de declaraciones recientes',
          'Evaluar impacto en zonas territoriales',
          'Preparar estrategia de contención'
        );
        break;
        
      case 'TERRITORIAL_SPIKE':
        recommendations.push(
          'Examinar Mapa de Calor Territorial',
          'Identificar factores desencadenantes',
          'Evaluar necesidad de recursos adicionales',
          'Coordinar con equipos locales'
        );
        break;
        
      case 'CRITICAL_AI_RECOMMENDATION':
        recommendations.push(
          'Revisar recomendaciones en IA Táctica',
          'Evaluar viabilidad de implementación',
          'Consultar con equipo de análisis',
          'Programar ejecución si es necesario'
        );
        break;
        
      case 'MORNING_BRIEFING':
        recommendations.push(
          'Revisar Dashboard para métricas nocturnas',
          'Verificar alertas pendientes',
          'Planificar prioridades del día',
          'Sincronizar con equipo'
        );
        break;
        
      case 'EVENING_SUMMARY':
        recommendations.push(
          'Revisar logros del día',
          'Identificar temas para seguimiento nocturno',
          'Preparar briefing para turno siguiente',
          'Configurar alertas automáticas'
        );
        break;
        
      default:
        recommendations.push(
          'Revisar Dashboard General',
          'Consultar módulos relevantes',
          'Evaluar necesidad de acción'
        );
    }
    
    // Filtrar recomendaciones según rol
    if (user.role === 'operator') {
      return recommendations.filter(rec => 
        !rec.includes('estrategia') && 
        !rec.includes('análisis completo')
      );
    }
    
    return recommendations;
  },
  
  // Determina la urgencia del mensaje
  calculateUrgency: (alertType, data) => {
    const urgencyMap = {
      'CRITICAL_SOCIAL_POST': 'high',
      'ACTOR_ESCALATION': 'high',
      'CRITICAL_AI_RECOMMENDATION': 'high',
      'TERRITORIAL_SPIKE': 'medium',
      'HIGH_SOCIAL_ACTIVITY': 'medium',
      'ANOMALY_DETECTED': 'medium',
      'MORNING_BRIEFING': 'low',
      'EVENING_SUMMARY': 'low'
    };
    
    return urgencyMap[alertType] || 'low';
  },
  
  // Genera contexto adicional para cada tipo de alerta
  enrichAlertContext: (alertType, data, user) => {
    const context = {
      timestamp: new Date(),
      userRole: user.role,
      alertType
    };
    
    switch (alertType) {
      case 'CRITICAL_SOCIAL_POST':
        context.platform = data.platform;
        context.author = data.author;
        context.sentiment = data.sentiment_score;
        context.keywords = data.keywords_triggered;
        break;
        
      case 'ACTOR_ESCALATION':
        context.actorName = data.name;
        context.previousStatus = data.oldStatus;
        context.currentStatus = data.newStatus;
        context.changeReason = data.reason;
        break;
        
      case 'TERRITORIAL_SPIKE':
        context.zoneName = data.name;
        context.previousLevel = data.oldLevel;
        context.currentLevel = data.newLevel;
        context.increasePercentage = data.activityIncrease;
        break;
    }
    
    return context;
  }
};

// Mensajes predefinidos para diferentes situaciones
export const DAMIBOTMessages = {
  CRITICAL_SOCIAL_POST: (data) => 
    `¡Alerta crítica! He detectado una publicación de ${data.author} en ${data.platform} que requiere atención inmediata. El análisis de sentimiento muestra ${data.sentiment_score > -0.5 ? 'contenido moderadamente negativo' : 'alto contenido negativo'} con palabras clave sensibles detectadas.`,
    
  ACTOR_ESCALATION: (data) => 
    `Atención: ${data.name} ha cambiado su estado de ${data.oldStatus} a ${data.newStatus}. Este cambio indica un escalamiento en su actividad que requiere monitoreo intensivo y posible respuesta estratégica.`,
    
  TERRITORIAL_SPIKE: (data) => 
    `Se ha registrado un incremento significativo del ${data.activityIncrease}% en la actividad política de ${data.name}. Este pico puede indicar tensiones emergentes que requieren análisis territorial inmediato.`,
    
  CRITICAL_AI_RECOMMENDATION: (data) => 
    `El sistema de IA ha generado una recomendación crítica basada en el análisis de patrones actuales. La implementación de estas medidas podría ser crucial para mantener la estabilidad de la situación.`,
    
  MORNING_BRIEFING: () => 
    `Buenos días. Durante la noche se han registrado diversos eventos que requieren tu atención. Te proporciono un resumen ejecutivo para comenzar eficientemente tu jornada de trabajo.`,
    
  EVENING_SUMMARY: () => 
    `La jornada ha concluido con varios desarrollos importantes. Aquí tienes un análisis de los eventos del día y las preparaciones necesarias para el monitoreo nocturno.`
};

export default { DAMIBOTTriggers, DAMIBOTMessages };