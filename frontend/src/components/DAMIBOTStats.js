import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Brain,
  Zap
} from 'lucide-react';

const DAMIBOTStats = ({ user }) => {
  const [stats, setStats] = useState({
    totalAlerts: 0,
    criticalAlerts: 0,
    resolvedAlerts: 0,
    averageResponseTime: 0,
    userInteractions: 0,
    predictiveAccuracy: 95.3
  });

  useEffect(() => {
    // Simular estadísticas de DAMIBOT
    const generateStats = () => {
      setStats({
        totalAlerts: Math.floor(Math.random() * 50) + 20,
        criticalAlerts: Math.floor(Math.random() * 10) + 3,
        resolvedAlerts: Math.floor(Math.random() * 40) + 15,
        averageResponseTime: (Math.random() * 5 + 1).toFixed(1),
        userInteractions: Math.floor(Math.random() * 100) + 50,
        predictiveAccuracy: (95 + Math.random() * 4).toFixed(1)
      });
    };

    generateStats();
    const interval = setInterval(generateStats, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dami-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Bot className="w-6 h-6 text-green-400 mr-3" />
          <h3 className="text-xl font-semibold text-white">Estado DAMIBOT</h3>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 pulse-green"></div>
          <span className="text-green-400 text-sm font-medium">Operativo</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Total Alerts */}
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-blue-400">{stats.totalAlerts}</span>
          </div>
          <p className="text-xs text-gray-400">Alertas Generadas (24h)</p>
        </div>

        {/* Critical Alerts */}
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Zap className="w-5 h-5 text-red-400" />
            <span className="text-2xl font-bold text-red-400">{stats.criticalAlerts}</span>
          </div>
          <p className="text-xs text-gray-400">Alertas Críticas</p>
        </div>

        {/* Resolved Alerts */}
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-green-400">{stats.resolvedAlerts}</span>
          </div>
          <p className="text-xs text-gray-400">Resueltas</p>
        </div>

        {/* Response Time */}
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">{stats.averageResponseTime}s</span>
          </div>
          <p className="text-xs text-gray-400">Tiempo Respuesta</p>
        </div>

        {/* User Interactions */}
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <span className="text-2xl font-bold text-purple-400">{stats.userInteractions}</span>
          </div>
          <p className="text-xs text-gray-400">Interacciones (24h)</p>
        </div>

        {/* Predictive Accuracy */}
        <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Brain className="w-5 h-5 text-green-400" />
            <span className="text-2xl font-bold text-green-400">{stats.predictiveAccuracy}%</span>
          </div>
          <p className="text-xs text-gray-400">Precisión IA</p>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-6 p-4 bg-green-900 bg-opacity-30 border border-green-400 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-1">
              Rendimiento del Sistema
            </h4>
            <p className="text-xs text-gray-300">
              DAMIBOT está funcionando óptimamente con alta precisión predictiva
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-400">A+</div>
            <div className="text-xs text-gray-400">Calificación</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="px-3 py-1 bg-blue-500 bg-opacity-20 text-blue-400 text-xs rounded-full border border-blue-400 hover:bg-blue-500 hover:bg-opacity-30 transition-colors">
          Ver Historial
        </button>
        <button className="px-3 py-1 bg-green-500 bg-opacity-20 text-green-400 text-xs rounded-full border border-green-400 hover:bg-green-500 hover:bg-opacity-30 transition-colors">
          Configurar
        </button>
        <button className="px-3 py-1 bg-purple-500 bg-opacity-20 text-purple-400 text-xs rounded-full border border-purple-400 hover:bg-purple-500 hover:bg-opacity-30 transition-colors">
          Reportes IA
        </button>
      </div>
    </div>
  );
};

export default DAMIBOTStats;