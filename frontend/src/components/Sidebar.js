import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Radar, 
  MapPin, 
  Radio, 
  AlertTriangle, 
  LogOut,
  Brain,
  Shield,
  User,
  Users,
  Bot,
  TrendingUp,
  Heart,
  ChevronDown,
  ChevronRight,
  Eye,
  Command,
  BarChart3,
  FileText,
  Target,
  Zap,
  Youtube,
  Map,
  Instagram
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle, user, onLogout, currentPath }) => {
  const navigate = useNavigate();
  const [aiModulesExpanded, setAiModulesExpanded] = useState(false);

  const navigationItems = [
    { 
      id: 'centro-inteligencia', 
      label: '🧠 Centro Inteligencia', 
      icon: Brain, 
      path: '/dashboard/centro-inteligencia',
      description: 'IA Predictiva + Análisis + Automatización + Estadísticas Completas'
    },
    { 
      id: 'estrategias-campana-ia', 
      label: '⚔️ Estrategias Campaña IA', 
      icon: Target, 
      path: '/dashboard/estrategias-campana-ia',
      description: 'Contramedidas oposición + Análisis medios + IA autónoma'
    },
    { 
      id: 'centro-comando', 
      label: '⚡ Centro de Comando', 
      icon: Zap, 
      path: '/dashboard/centro-comando',
      description: 'Situación actual y acciones rápidas'
    },
    { 
      id: 'dashboard-general', 
      label: '📊 Dashboard General', 
      icon: BarChart3, 
      path: '/dashboard',
      description: 'Resumen general'
    },
    { 
      id: 'mapa-territorial', 
      label: '🗺️ Mapa Territorial', 
      icon: Map, 
      path: '/dashboard/mapa-territorial',
      description: 'Análisis territorial en tiempo real'
    },
    { 
      id: 'instagram-hashtags', 
      label: '📸 Instagram Hashtags + IA', 
      icon: Instagram, 
      path: '/dashboard/instagram-hashtags',
      description: 'Monitoreo hashtags con cost-aware AI'
    }
  ];

  const aiModules = [
    {
      id: 'ai-overview',
      label: 'Resumen IA',
      icon: Brain,
      path: '/dashboard/ai/overview',
      description: 'Estado general módulos IA'
    },
    {
      id: 'deepfake-detection',
      label: 'Detección Deepfakes',
      icon: Shield,
      path: '/dashboard/ai/deepfake-detection',
      description: 'Verificación de contenido'
    },
    {
      id: 'autonomous-agent',
      label: 'Agente Autónomo',
      icon: Bot,
      path: '/dashboard/ai/autonomous-agent',
      description: 'DAMI-GPT inteligente'
    },
    {
      id: 'predictive-analysis',
      label: 'Análisis Predictivo',
      icon: TrendingUp,
      path: '/dashboard/ai/predictive-analysis',
      description: 'Predicciones y tendencias'
    },
    {
      id: 'emotional-intelligence',
      label: 'Inteligencia Emocional',
      icon: Heart,
      path: '/dashboard/ai/emotional-intelligence',
      description: 'Análisis psicológico'
    }
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'administrator':
        return <Shield className="w-4 h-4" />;
      case 'analyst':
        return <Brain className="w-4 h-4" />;
      case 'operator':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'administrator':
        return 'Administrador';
      case 'analyst':
        return 'Analista';
      case 'operator':
        return 'Operador';
      default:
        return 'Usuario';
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gray-800 border-r border-gray-700 z-30
        transition-transform duration-300 ease-in-out overflow-y-auto sidebar-scrollable
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 lg:translate-x-0
      `}>
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Brain className="w-8 h-8 text-green-400 mr-2" />
              <div>
                <h2 className="text-lg font-bold text-green-400">DAMI</h2>
                <p className="text-xs text-gray-400">Intelligence</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="lg:hidden text-gray-400 hover:text-green-400"
            >
              ✕
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center text-black font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{user?.username}</p>
              <div className="flex items-center text-xs text-gray-400">
                {getRoleIcon(user?.role)}
                <span className="ml-1">{getRoleLabel(user?.role)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto max-h-screen">
          <ul className="space-y-2 pb-20">{/* Added padding bottom for mobile */}
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || 
                             (item.path === '/dashboard' && currentPath === '/dashboard/');
              
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center p-3 rounded-lg transition-colors duration-200
                      ${isActive 
                        ? 'bg-green-400 text-black' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-green-400'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className={`text-xs ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}

            {/* AI Modules Section */}
            <li className="pt-4">
              <div className="mb-2">
                <button
                  onClick={() => setAiModulesExpanded(!aiModulesExpanded)}
                  className="flex items-center w-full p-2 text-gray-400 hover:text-green-400 transition-colors duration-200"
                >
                  {aiModulesExpanded ? (
                    <ChevronDown className="w-4 h-4 mr-2" />
                  ) : (
                    <ChevronRight className="w-4 h-4 mr-2" />
                  )}
                  <Brain className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Módulos IA Avanzada</span>
                </button>
              </div>
              
              {aiModulesExpanded && (
                <ul className="space-y-1 ml-4 border-l border-gray-700 pl-4">
                  {aiModules.map((module) => {
                    const ModuleIcon = module.icon;
                    const isActive = currentPath === module.path;
                    
                    return (
                      <li key={module.id}>
                        <Link
                          to={module.path}
                          className={`
                            flex items-center p-2 rounded-lg transition-colors duration-200 text-sm
                            ${isActive 
                              ? 'bg-green-400 text-black' 
                              : 'text-gray-300 hover:bg-gray-700 hover:text-green-400'
                            }
                          `}
                        >
                          <ModuleIcon className="w-4 h-4 mr-2" />
                          <div className="flex-1">
                            <div className="font-medium">{module.label}</div>
                            <div className={`text-xs ${isActive ? 'text-gray-700' : 'text-gray-500'}`}>
                              {module.description}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center p-3 w-full text-left text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
        
        {/* System Status */}
        <div className="p-4 text-center">
          <div className="flex items-center justify-center text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 pulse-green"></div>
            Sistema Activo
          </div>
          <p className="text-xs text-gray-600 mt-1">DAMI v1.0.0</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;