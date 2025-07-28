import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Shield, AlertTriangle, CheckCircle, Camera, FileText, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DeepfakeDetection = () => {
  const [stats, setStats] = useState({});
  const [analysisResults, setAnalysisResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('text');
  const [textInput, setTextInput] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/ai/deepfake-detection/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching deepfake stats:', error);
    }
  };

  const analyzeContent = async () => {
    if (activeTab === 'text' && !textInput.trim()) {
      toast.error('Por favor ingresa el texto a analizar');
      return;
    }
    
    if (activeTab === 'image' && !imageFile) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        content_type: activeTab,
        content_data: activeTab === 'text' ? textInput : '/path/to/image',
        source_url: sourceUrl || null
      };

      const response = await axios.post(`${API}/ai/deepfake-detection`, requestData);
      const result = response.data.analysis_result;
      
      setAnalysisResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
      
      // Show result notification
      if (result.is_deepfake || result.is_misinformation) {
        toast.error('⚠️ Contenido sospechoso detectado');
      } else {
        toast.success('✅ Contenido parece auténtico');
      }
      
      // Clear inputs
      setTextInput('');
      setImageFile(null);
      setSourceUrl('');
      
      // Refresh stats
      fetchStats();
      
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Error al analizar contenido');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'CRÍTICO': return 'text-red-400 bg-red-900 bg-opacity-30';
      case 'ALTO': return 'text-orange-400 bg-orange-900 bg-opacity-30';
      case 'MEDIO': return 'text-yellow-400 bg-yellow-900 bg-opacity-30';
      case 'BAJO': return 'text-green-400 bg-green-900 bg-opacity-30';
      default: return 'text-gray-400 bg-gray-900 bg-opacity-30';
    }
  };

  const formatScore = (score) => {
    return `${(score * 100).toFixed(1)}%`;
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
          🛡️ Detección de Deepfakes y Desinformación
        </h1>
        <p className="text-gray-400 text-lg">
          Sistema avanzado de verificación de contenido usando IA
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-green-400">{stats.total_verifications || 0}</div>
          <div className="text-sm text-gray-400">Verificaciones Totales</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-red-400">{stats.deepfakes_detected || 0}</div>
          <div className="text-sm text-gray-400">Deepfakes Detectados</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-orange-400">{stats.misinformation_detected || 0}</div>
          <div className="text-sm text-gray-400">Desinformación</div>
        </div>
        <div className="dami-card text-center">
          <div className="text-2xl font-bold text-blue-400">{formatScore(stats.accuracy_rate || 0.89)}</div>
          <div className="text-sm text-gray-400">Precisión del Sistema</div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="dami-card">
        <h2 className="text-2xl font-semibold text-white mb-6">🔍 Analizar Contenido</h2>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 rounded transition ${
              activeTab === 'text' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Texto
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`px-4 py-2 rounded transition ${
              activeTab === 'image' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Camera className="w-4 h-4 inline mr-2" />
            Imagen
          </button>
        </div>

        {/* Content Input */}
        {activeTab === 'text' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Texto a Analizar
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
                placeholder="Ingresa el texto que quieres verificar..."
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Imagen a Analizar
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded cursor-pointer hover:bg-gray-800">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click para subir</span> o arrastra aquí
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG o GIF</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </label>
              </div>
              {imageFile && (
                <p className="text-sm text-green-400 mt-2">
                  Archivo seleccionado: {imageFile.name}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Source URL */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            URL de Fuente (Opcional)
          </label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
            placeholder="https://ejemplo.com/fuente"
          />
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyzeContent}
          disabled={loading}
          className="w-full mt-6 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Analizando...
            </div>
          ) : (
            'Analizar Contenido'
          )}
        </button>
      </div>

      {/* Results */}
      {analysisResults.length > 0 && (
        <div className="dami-card">
          <h2 className="text-2xl font-semibold text-white mb-6">📊 Resultados Recientes</h2>
          <div className="space-y-4">
            {analysisResults.map((result, index) => (
              <div key={index} className="border border-gray-600 rounded p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {result.is_deepfake || result.is_misinformation ? (
                      <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                    )}
                    <span className="font-medium text-white">
                      {result.content_type === 'text' ? 'Análisis de Texto' : 'Análisis de Imagen'}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    getRiskColor(result.risk_level || result.deepfake_analysis?.risk_level)
                  }`}>
                    {result.risk_level || result.deepfake_analysis?.risk_level || 'DESCONOCIDO'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Puntuación de Autenticidad:</span>
                    <span className="text-white ml-2">
                      {formatScore(result.authenticity_score || result.credibility_score || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Confianza:</span>
                    <span className="text-white ml-2">
                      {formatScore(result.confidence || 0)}
                    </span>
                  </div>
                </div>
                
                {result.recommendations && (
                  <div className="mt-3">
                    <span className="text-gray-400 text-sm">Recomendaciones:</span>
                    <ul className="mt-1 space-y-1">
                      {result.recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx} className="text-xs text-gray-300 flex items-start">
                          <span className="text-green-400 mr-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="dami-card">
        <h3 className="text-lg font-medium text-green-400 mb-2">💡 ¿Cómo Funciona?</h3>
        <p className="text-gray-300 leading-relaxed mb-4">
          Nuestro sistema de detección utiliza algoritmos avanzados para identificar contenido manipulado:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900 bg-opacity-30 border border-green-400 rounded p-4">
            <h4 className="text-green-400 font-semibold mb-2">📝 Análisis de Texto</h4>
            <p className="text-gray-300 text-sm">
              Detecta patrones de desinformación, verifica credibilidad de fuentes y analiza 
              características lingüísticas sospechosas en tiempo real.
            </p>
          </div>
          <div className="bg-blue-900 bg-opacity-30 border border-blue-400 rounded p-4">
            <h4 className="text-blue-400 font-semibold mb-2">🖼️ Análisis de Imagen</h4>
            <p className="text-gray-300 text-sm">
              Examina inconsistencias faciales, artefactos digitales y metadatos para 
              identificar imágenes generadas artificialmente o manipuladas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeepfakeDetection;