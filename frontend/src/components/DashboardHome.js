import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  MapPin, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Shield,
  Brain,
  Radio,
  LayoutDashboard
} from 'lucide-react';
import toast from 'react-hot-toast';
import DAMIBOTStats from './DAMIBOTStats';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DashboardHome = ({ user }) => {
  const [summary, setSummary] = useState({
    actors_monitored: 0,
    territorial_zones: 0,
    recent_social_activity: 0,
    active_alerts: 0,
    last_update: null
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, actorsRes, feedRes] = await Promise.all([
        axios.get(`${API}/dashboard/summary`),
        axios.get(`${API}/actors`),
        axios.get(`${API}/feed?limit=5`)
      ]);

      setSummary(summaryRes.data);
      setRecentActivity(feedRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar datos del dashboard');
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, description, color = "green" }) => (
    <div className="dami-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold text-${color}-400 mt-1`}>{value}</p>
          <p className="text-gray-500 text-xs mt-1">{description}</p>
        </div>
        <div className={`p-3 bg-${color}-400 bg-opacity-20 rounded-lg`}>
          <Icon className={`w-6 h-6 text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner mr-2"></div>
        <span className="text-green-400">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Dashboard General
        </h1>
        <p className="text-gray-400 text-sm sm:text-base">
          Resumen táctico en tiempo real de actividad política y social
        </p>
        {summary.last_update && (
          <p className="text-xs sm:text-sm text-green-400 mt-2">
            Última actualización: {new Date(summary.last_update).toLocaleString('es-ES')}
          </p>
        )}
      </div>

      {/* Module Explanation */}
      <div className="dami-card mb-6">
        <div className="flex items-center mb-4">
          <LayoutDashboard className="w-6 h-6 text-green-400 mr-3" />
          <h2 className="text-xl font-semibold text-white">¿Qué es el Dashboard General?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-green-400 mb-2">Propósito Principal</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              El Dashboard General es el centro de comando del sistema DAMI. Proporciona una visión panorámica 
              de toda la actividad política y social monitoreada, permitiendo una evaluación rápida del estado 
              general de la situación.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-green-400 mb-2">Funcionalidades Clave</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• <strong>Métricas en Tiempo Real:</strong> Contadores actualizados de actores, zonas y alertas</li>
              <li>• <strong>Estado del Sistema:</strong> Monitoreo de la salud operacional de DAMI</li>
              <li>• <strong>Actividad Reciente:</strong> Stream de las últimas detecciones importantes</li>
              <li>• <strong>Accesos Rápidos:</strong> Enlaces directos a funcionalidades críticas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <StatCard
          icon={Users}
          title="Actores Monitoreados"
          value={summary.actors_monitored}
          description="Figuras políticas en seguimiento"
        />
        <StatCard
          icon={MapPin}
          title="Zonas Territoriales"
          value={summary.territorial_zones}
          description="Regiones bajo análisis"
          color="blue"
        />
        <StatCard
          icon={Activity}
          title="Actividad Social Reciente"
          value={summary.recent_social_activity}
          description="Últimas 24 horas"
          color="yellow"
        />
        <StatCard
          icon={AlertTriangle}
          title="Alertas Activas"
          value={summary.active_alerts}
          description="Requieren atención"
          color="red"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* System Status */}
        <div className="dami-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Estado del Sistema</h3>
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Monitoreo en Tiempo Real</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 pulse-green"></div>
                <span className="text-green-400 text-sm">Activo</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Base de Datos</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-green-400 text-sm">Conectada</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">IA Táctica</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-green-400 text-sm">Operativa</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Role Info */}
        <div className="dami-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Perfil de Usuario</h3>
            <Brain className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 text-sm">Usuario Activo</span>
              <p className="text-white font-semibold">{user?.username}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Nivel de Acceso</span>
              <p className="text-green-400 font-semibold capitalize">{user?.role}</p>
            </div>
            <div>
              <span className="text-gray-400 text-sm">Permisos</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {user?.role === 'administrator' && (
                  <>
                    <span className="px-2 py-1 bg-green-400 bg-opacity-20 text-green-400 text-xs rounded">Admin</span>
                    <span className="px-2 py-1 bg-blue-400 bg-opacity-20 text-blue-400 text-xs rounded">Análisis</span>
                    <span className="px-2 py-1 bg-yellow-400 bg-opacity-20 text-yellow-400 text-xs rounded">Operaciones</span>
                  </>
                )}
                {user?.role === 'analyst' && (
                  <>
                    <span className="px-2 py-1 bg-blue-400 bg-opacity-20 text-blue-400 text-xs rounded">Análisis</span>
                    <span className="px-2 py-1 bg-gray-400 bg-opacity-20 text-gray-400 text-xs rounded">Lectura</span>
                  </>
                )}
                {user?.role === 'operator' && (
                  <span className="px-2 py-1 bg-yellow-400 bg-opacity-20 text-yellow-400 text-xs rounded">Operaciones</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dami-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Actividad Reciente</h3>
            <Radio className="w-5 h-5 text-green-400" />
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 bg-gray-700 bg-opacity-50 rounded">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.alert_level === 'critical' ? 'bg-red-400' :
                    activity.alert_level === 'high' ? 'bg-orange-400' :
                    activity.alert_level === 'medium' ? 'bg-yellow-400' :
                    'bg-green-400'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{activity.author}</p>
                    <p className="text-xs text-gray-400 truncate">{activity.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)} • {activity.platform}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </div>

      {/* DAMIBOT Statistics */}
      <DAMIBOTStats user={user} />

      {/* Quick Actions */}
      <div className="dami-card">
        <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="dami-button-secondary text-left p-3">
            <TrendingUp className="w-5 h-5 mb-2" />
            <div className="text-sm font-medium">Generar Reporte</div>
            <div className="text-xs text-gray-400">Análisis completo</div>
          </button>
          <button className="dami-button-secondary text-left p-3">
            <AlertTriangle className="w-5 h-5 mb-2" />
            <div className="text-sm font-medium">Ver Alertas</div>
            <div className="text-xs text-gray-400">Revisar pendientes</div>
          </button>
          <button className="dami-button-secondary text-left p-3">
            <Users className="w-5 h-5 mb-2" />
            <div className="text-sm font-medium">Radar Actores</div>
            <div className="text-xs text-gray-400">Monitoreo político</div>
          </button>
          <button className="dami-button-secondary text-left p-3">
            <Radio className="w-5 h-5 mb-2" />
            <div className="text-sm font-medium">Feed Sr. X</div>
            <div className="text-xs text-gray-400">Monitoreo social</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;