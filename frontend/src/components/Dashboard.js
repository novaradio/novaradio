import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import RadarView from './RadarView';
import MapaCalor from './MapaCalor';
import FeedSrX from './FeedSrX';
import AlertasIA from './AlertasIA';
import DAMIBOT from './DAMIBOT';
import CentroComando from './CentroComando';
import CentroEstadistico from './CentroEstadistico';
import InformeDiario from './InformeDiario';
import MapaMisiones from './MapaMisiones';
import AnalisisCompetencia from './AnalisisCompetencia';
import EncuestasSociales from './EncuestasSociales';
import DashboardEjecutivo from './DashboardEjecutivo';
import IAPredictiva from './IAPredictiva';
import AutomatizacionAvanzada from './AutomatizacionAvanzada';
import EstrategiasCampanaIA from './EstrategiasCampanaIA';
import CentroInteligenciaPredictiva from './CentroInteligenciaPredictiva';
// AI Modules
import AIModulesOverview from './AIModules/AIModulesOverview';
import DeepfakeDetection from './AIModules/DeepfakeDetection';  
import AutonomousAgent from './AIModules/AutonomousAgent';
import PredictiveAnalysis from './AIModules/PredictiveAnalysis';
import EmotionalIntelligence from './AIModules/EmotionalIntelligence';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [socket, setSocket] = useState(null);
  const [realTimeData, setRealTimeData] = useState({
    posts: [],
    alerts: [],
    recommendations: []
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to DAMI Intelligence Platform');
      toast.success('Conectado al sistema de monitoreo en tiempo real');
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      toast.error('Desconectado del sistema de monitoreo');
    });

    // Listen for real-time updates
    newSocket.on('message', (data) => {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'new_post') {
          setRealTimeData(prev => ({
            ...prev,
            posts: [parsedData.data, ...prev.posts.slice(0, 49)] // Keep latest 50
          }));
          toast.success('Nueva actividad detectada en redes sociales');
        }
      } catch (error) {
        console.error('Error parsing real-time data:', error);
      }
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        user={user}
        onLogout={onLogout}
        currentPath={location.pathname}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-gray-800 border-b border-gray-700 px-2 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="lg:hidden mr-2 sm:mr-4 text-gray-400 hover:text-green-400 text-lg"
              >
                ☰
              </button>
              <h1 className="text-sm sm:text-xl font-bold text-green-400">
                🧠 Centro DAMI
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                <span className="text-green-400">{user?.username}</span> 
                ({user?.role})
              </div>
              <div className="text-xs sm:text-sm text-gray-400 sm:hidden">
                <span className="text-green-400">{user?.username}</span>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full pulse-green"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-2 sm:p-6">
          <Routes>
            <Route path="/" element={<DashboardHome user={user} />} />
            <Route path="/dashboard-ejecutivo" element={<DashboardEjecutivo user={user} />} />
            <Route path="/ia-predictiva" element={<IAPredictiva user={user} />} />
            <Route path="/automatizacion" element={<AutomatizacionAvanzada user={user} />} />
            <Route path="/youtube-analytics" element={<YouTubeAnalytics user={user} />} />
            <Route path="/estrategias-campana-ia" element={<EstrategiasCampanaIA user={user} />} />
            <Route path="/centro-comando" element={<CentroComando user={user} />} />
            <Route path="/centro-estadistico" element={<CentroEstadistico user={user} />} />
            <Route path="/informe-diario" element={<InformeDiario user={user} />} />
            <Route path="/mapa-territorial" element={<MapaMisiones user={user} />} />
            <Route path="/encuestas-sociales" element={<EncuestasSociales user={user} />} />
            <Route path="/radar" element={<RadarView user={user} />} />
            <Route path="/mapa" element={<MapaCalor user={user} />} />
            <Route path="/feed" element={<FeedSrX user={user} realTimeData={realTimeData} />} />
            <Route path="/alertas" element={<AlertasIA user={user} />} />
            <Route path="/analisis-competencia" element={<AnalisisCompetencia user={user} />} />
            
            {/* AI Modules Routes */}
            <Route path="/ai/overview" element={<AIModulesOverview user={user} />} />
            <Route path="/ai/deepfake-detection" element={<DeepfakeDetection user={user} />} />
            <Route path="/ai/autonomous-agent" element={<AutonomousAgent user={user} />} />
            <Route path="/ai/predictive-analysis" element={<PredictiveAnalysis user={user} />} />
            <Route path="/ai/emotional-intelligence" element={<EmotionalIntelligence user={user} />} />
          </Routes>
        </main>

        {/* DAMIBOT - Unified Intelligent Assistant */}
        <DAMIBOT user={user} realTimeData={realTimeData} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Dashboard;