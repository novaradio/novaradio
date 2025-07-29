import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2,
  X,
  Brain,
  Shield,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatBot = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Generate unique session ID
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // Welcome message based on user role
    const welcomeMessage = getWelcomeMessage(user?.role);
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        message: welcomeMessage,
        timestamp: new Date()
      }
    ]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getWelcomeMessage = (role) => {
    const baseExplanation = `

🧠 DAMI Bot - Tu Asistente de Inteligencia Política

¿Qué puedo hacer por ti?
• Analizar situaciones políticas complejas
• Generar reportes personalizados en tiempo real
• Proporcionar recomendaciones estratégicas basadas en datos
• Interpretar patrones de comportamiento político
• Sugerir acciones tácticas según tu nivel de acceso
• Responder consultas sobre el estado del sistema

Simplemente escribe tu pregunta y te ayudaré con análisis especializado.`;

    switch (role) {
      case 'administrator':
        return `¡Hola! Soy DAMI Bot, tu asistente de inteligencia política avanzada. Como administrador, tienes acceso completo a todas mis capacidades analíticas.${baseExplanation}

Como ADMINISTRADOR puedes:
• Acceso a análisis estratégicos de máximo nivel
• Coordinación de equipos y asignación de recursos
• Toma de decisiones críticas con soporte de IA
• Generación de reportes ejecutivos
• Análisis de riesgo político y social`;

      case 'analyst':
        return `¡Saludos! Soy DAMI Bot, especializado en análisis inteligente profundo. Como analista, puedo proporcionarte insights detallados y correlaciones de datos complejas.${baseExplanation}

Como ANALISTA puedes acceder a:
• Interpretación avanzada de datos políticos
• Análisis de tendencias y patrones de comportamiento  
• Generación de reportes analíticos especializados
• Correlación de eventos políticos y sociales
• Predicciones basadas en modelos estadísticos`;

      case 'operator':
        return `¡Bienvenido! Soy DAMI Bot, tu guía operativo especializado. Te ayudo con instrucciones precisas y procedimientos tácticos para la ejecución eficiente de operaciones.${baseExplanation}

Como OPERADOR tienes acceso a:
• Instrucciones específicas para operaciones tácticas
• Verificación de procedimientos estándar
• Coordinación de acciones de campo
• Consultas sobre protocolos de seguridad
• Orientación para ejecución de estrategias`;

      default:
        return `¡Hola! Soy DAMI Bot, tu asistente de inteligencia política integral.${baseExplanation}`;
    }
  };

  const getUserRoleIcon = (role) => {
    switch (role) {
      case 'administrator':
        return <Shield className="w-4 h-4" />;
      case 'analyst':
        return <Brain className="w-4 h-4" />;
      case 'operator':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: inputMessage,
        session_id: sessionId
      });

      const botMessage = {
        id: `bot_${Date.now()}`,
        type: 'bot',
        message: response.data.response,
        timestamp: new Date(response.data.timestamp)
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al comunicarse con DAMI Bot');
      
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'bot',
        message: 'Disculpa, he tenido un problema técnico. Por favor intenta nuevamente.',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickResponses = [
    '¿Cuál es la situación actual?',
    'Genera un reporte de actividad',
    'Muéstrame las alertas críticas',
    '¿Qué recomiendas hacer?',
    'Analiza las últimas tendencias'
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-400 hover:bg-green-300 text-black p-4 rounded-full shadow-lg transition-all duration-200 pulse-green"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-96 sm:h-96 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl flex flex-col max-w-[calc(100vw-3rem)]">
      {/* Header */}
      <div className="bg-gray-700 p-3 sm:p-4 rounded-t-lg border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center mr-3">
              <Bot className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="text-white font-semibold">DAMI Bot</h3>
              <p className="text-xs text-gray-400">Asistente IA</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full pulse-green"></div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] sm:max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-blue-500' 
                    : message.isError 
                      ? 'bg-red-500' 
                      : 'bg-green-400'
                }`}>
                  {message.type === 'user' ? (
                    getUserRoleIcon(user?.role)
                  ) : (
                    <Bot className="w-4 h-4 text-black" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`p-2 sm:p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : message.isError
                      ? 'bg-red-900 bg-opacity-50 text-red-400 border border-red-400'
                      : 'bg-gray-700 text-white'
                }`}>
                  <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.message}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-black" />
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Responses */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Respuestas rápidas:</p>
          <div className="flex flex-wrap gap-1">
            {quickResponses.slice(0, 3).map((response, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(response)}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
              >
                {response}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu consulta..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-green-400 focus:outline-none resize-none text-sm"
            rows="1"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !inputMessage.trim()}
            className="bg-green-400 hover:bg-green-300 disabled:bg-gray-600 disabled:cursor-not-allowed text-black p-2 rounded-lg transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;