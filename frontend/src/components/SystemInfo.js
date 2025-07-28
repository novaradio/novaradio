import React from 'react';
import { 
  Brain, 
  Shield, 
  Radar, 
  MapPin, 
  Radio, 
  AlertTriangle,
  Database,
  Cpu,
  Network,
  Eye,
  Target,
  Zap
} from 'lucide-react';

const SystemInfo = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Brain className="w-8 h-8 text-green-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">🧠 Sistema DAMI - Arquitectura Completa</h1>
        </div>
        <p className="text-gray-400">
          Centro de Inteligencia Política Digital - Documentación del Sistema
        </p>
      </div>

      {/* System Overview */}
      <div className="dami-card">
        <h2 className="text-2xl font-semibold text-white mb-4">¿Qué es DAMI?</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          DAMI (Centro de Inteligencia Política Digital) es una plataforma integral de monitoreo, análisis y 
          respuesta estratégica diseñada para el análisis político en tiempo real. Combina inteligencia artificial, 
          análisis de big data y monitoreo social para proporcionar una visión completa del panorama político.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-900 bg-opacity-30 border border-green-400 rounded p-4">
            <Eye className="w-8 h-8 text-green-400 mb-2" />
            <h3 className="text-lg font-semibold text-white mb-2">Monitoreo</h3>
            <p className="text-gray-300 text-sm">Vigilancia 24/7 de actores políticos y redes sociales</p>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-400 rounded p-4">
            <Cpu className="w-8 h-8 text-blue-400 mb-2" />
            <h3 className="text-lg font-semibold text-white mb-2">Análisis</h3>
            <p className="text-gray-300 text-sm">Procesamiento inteligente de datos políticos complejos</p>
          </div>
          <div className="bg-purple-900 bg-opacity-30 border border-purple-400 rounded p-4">
            <Target className="w-8 h-8 text-purple-400 mb-2" />
            <h3 className="text-lg font-semibold text-white mb-2">Acción</h3>
            <p className="text-gray-300 text-sm">Recomendaciones estratégicas automatizadas</p>
          </div>
        </div>
      </div>

      {/* Modules Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dashboard Module */}
        <div className="dami-card">
          <div className="flex items-center mb-3">
            <Shield className="w-6 h-6 text-green-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">Dashboard General</h3>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Centro de comando principal que proporciona una visión panorámica del estado general del sistema.
          </p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Métricas en tiempo real de todos los subsistemas</li>
            <li>• Estado operacional de la infraestructura DAMI</li>
            <li>• Resumen de actividad reciente crítica</li>
            <li>• Accesos directos a funcionalidades principales</li>
          </ul>
        </div>

        {/* Radar Module */}
        <div className="dami-card">
          <div className="flex items-center mb-3">
            <Radar className="w-6 h-6 text-green-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">Radar de Actores</h3>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Sistema de vigilancia política que clasifica actores según su nivel de riesgo y actividad.
          </p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Monitoreo continuo de figuras políticas clave</li>
            <li>• Clasificación por colores según nivel de amenaza</li>
            <li>• Análisis de patrones de comportamiento</li>
            <li>• Predicción de movimientos políticos</li>
          </ul>
        </div>

        {/* Heat Map Module */}
        <div className="dami-card">
          <div className="flex items-center mb-3">
            <MapPin className="w-6 h-6 text-green-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">Mapa de Calor Territorial</h3>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Análisis geopolítico que identifica focos de tensión y actividad política por regiones.
          </p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Visualización de intensidad política territorial</li>
            <li>• Identificación de zonas de conflicto potencial</li>
            <li>• Análisis de distribución geográfica del apoyo</li>
            <li>• Alertas tempranas por región</li>
          </ul>
        </div>

        {/* Social Media Module */}
        <div className="dami-card">
          <div className="flex items-center mb-3">
            <Radio className="w-6 h-6 text-green-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">Feed Sr. X</h3>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Monitoreo avanzado de redes sociales para detectar discursos opositores y tendencias virales.
          </p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Vigilancia multi-plataforma (Twitter, FB, Instagram)</li>
            <li>• Detección automática de keywords peligrosas</li>
            <li>• Análisis de sentimiento en tiempo real</li>
            <li>• Identificación de campañas coordinadas</li>
          </ul>
        </div>

        {/* AI Module */}
        <div className="dami-card">
          <div className="flex items-center mb-3">
            <Brain className="w-6 h-6 text-green-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">IA Táctica</h3>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Cerebro del sistema que genera recomendaciones estratégicas automatizadas basadas en IA.
          </p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Análisis predictivo de escenarios políticos</li>
            <li>• Recomendaciones tácticas automatizadas</li>
            <li>• Optimización de recursos y estrategias</li>
            <li>• Aprendizaje continuo de patrones históricos</li>
          </ul>
        </div>

        {/* ChatBot Module */}
        <div className="dami-card">
          <div className="flex items-center mb-3">
            <Zap className="w-6 h-6 text-green-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">DAMI Bot</h3>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Asistente inteligente personalizado que proporciona análisis y recomendaciones según el rol del usuario.
          </p>
          <ul className="text-gray-400 text-xs space-y-1">
            <li>• Respuestas especializadas por rol de usuario</li>
            <li>• Análisis contextual de situaciones complejas</li>
            <li>• Generación de reportes personalizados</li>
            <li>• Orientación estratégica interactiva</li>
          </ul>
        </div>
      </div>

      {/* Technical Architecture */}
      <div className="dami-card">
        <h2 className="text-2xl font-semibold text-white mb-4">Arquitectura Técnica</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center mb-3">
              <Database className="w-6 h-6 text-blue-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Backend</h3>
            </div>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• FastAPI con Python</li>
              <li>• MongoDB para almacenamiento</li>
              <li>• WebSockets para tiempo real</li>
              <li>• JWT para autenticación</li>
              <li>• IA con machine learning</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center mb-3">
              <Network className="w-6 h-6 text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Frontend</h3>
            </div>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• React 19 con hooks</li>
              <li>• Tailwind CSS responsive</li>
              <li>• Socket.io para updates</li>
              <li>• Componentes modulares</li>
              <li>• Dark theme optimizado</li>
            </ul>
          </div>
          <div>
            <div className="flex items-center mb-3">
              <Shield className="w-6 h-6 text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Seguridad</h3>
            </div>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Roles y permisos granulares</li>
              <li>• Encriptación de contraseñas</li>
              <li>• Tokens de sesión seguros</li>
              <li>• Auditoría de acciones</li>
              <li>• Acceso QR para móviles</li>
            </ul>
          </div>
        </div>
      </div>

      {/* User Roles */}
      <div className="dami-card">
        <h2 className="text-2xl font-semibold text-white mb-4">Roles de Usuario</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-900 bg-opacity-30 border border-red-400 rounded p-4">
            <Shield className="w-8 h-8 text-red-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Administrador</h3>
            <p className="text-gray-300 text-sm mb-2">Acceso completo al sistema</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Gestión de usuarios y permisos</li>
              <li>• Configuración del sistema</li>
              <li>• Acceso a todos los módulos</li>
              <li>• Ejecución de recomendaciones IA</li>
            </ul>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-400 rounded p-4">
            <Brain className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Analista</h3>
            <p className="text-gray-300 text-sm mb-2">Especialista en análisis de datos</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Análisis profundo de información</li>
              <li>• Generación de reportes</li>
              <li>• Acceso a herramientas analíticas</li>
              <li>• Interpretación de tendencias</li>
            </ul>
          </div>
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-400 rounded p-4">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Operador</h3>
            <p className="text-gray-300 text-sm mb-2">Ejecución de operaciones tácticas</p>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• Implementación de estrategias</li>
              <li>• Monitoreo operacional</li>
              <li>• Ejecución de protocolos</li>
              <li>• Reportes de campo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 border-t border-gray-700">
        <p className="text-gray-400 text-sm">
          DAMI v1.0.0 - Centro de Inteligencia Política Digital © 2025
        </p>
        <p className="text-gray-500 text-xs mt-2">
          Sistema desarrollado para análisis político estratégico en tiempo real
        </p>
      </div>
    </div>
  );
};

export default SystemInfo;