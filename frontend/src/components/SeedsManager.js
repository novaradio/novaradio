import React, { useState, useEffect } from 'react';
import { Settings, Upload, Download, Database, RefreshCw, CheckCircle, AlertTriangle, Info, FileText, Play } from 'lucide-react';

const SeedsManager = () => {
  const [activeTab, setActiveTab] = useState('status');
  const [seedsStatus, setSeedsStatus] = useState(null);
  const [csvText, setCsvText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('dami_token');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${BACKEND_URL}/api${url}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };

  // Cargar status al montar
  useEffect(() => {
    if (activeTab === 'status') {
      loadSeedsStatus();
    }
  }, [activeTab]);

  const loadSeedsStatus = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/seeds/status');
      setSeedsStatus(response.status);
      setError(null);
    } catch (err) {
      console.error('Error cargando status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultSeeds = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/seeds/load-default', {
        method: 'POST'
      });
      setSuccess('✅ Seeds por defecto de Misiones cargados correctamente');
      setError(null);
      await loadSeedsStatus(); // Recargar status
    } catch (err) {
      console.error('Error cargando seeds default:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadCSV = async () => {
    if (!csvText.trim()) {
      setError('El CSV no puede estar vacío');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth('/seeds/upload-csv', {
        method: 'POST',
        body: JSON.stringify({ csv_text: csvText })
      });
      
      const result = response.data;
      if (result.success) {
        setSuccess(`✅ CSV procesado: ${result.loaded} seeds cargados`);
        if (result.errors && result.errors.length > 0) {
          setError(`⚠️ ${result.total_errors} errores encontrados: ${result.errors.join(', ')}`);
        }
      } else {
        setError(result.error || 'Error procesando CSV');
      }
      
      await loadSeedsStatus(); // Recargar status
    } catch (err) {
      console.error('Error subiendo CSV:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const bootstrapSeeds = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth('/seeds/bootstrap', {
        method: 'POST'
      });
      
      const result = response.data;
      setSuccess(
        `✅ Bootstrap completado: ` +
        `${result.facebook.resolved} páginas FB, ` +
        `${result.youtube.resolved} canales YT resueltos`
      );
      
      if (result.facebook.errors > 0 || result.youtube.errors > 0) {
        setError(`⚠️ Errores: FB ${result.facebook.errors}, YT ${result.youtube.errors}`);
      }
      
      await loadSeedsStatus();
    } catch (err) {
      console.error('Error en bootstrap:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const response = await fetchWithAuth('/seeds/export-csv');
      const csvContent = response.csv;
      const filename = response.filename;
      
      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      setSuccess('✅ CSV exportado correctamente');
    } catch (err) {
      console.error('Error exportando CSV:', err);
      setError(err.message);
    }
  };

  const sampleCSV = `src,handle,alliance,municipality,actor,type
# Hashtags Instagram
ig,#Misiones,,,Provincia,hashtag
ig,#Posadas,,,Ciudad,hashtag
ig,#Obera,,,Ciudad,hashtag

# Cuentas Facebook
fb,@GobiernoDeMisiones,frente_renovador_neo,,Gobierno,oficial
fb,@muniposadas,frente_renovador_neo,Posadas,Municipalidad,oficial
fb,@ProMisiones,lla_pro,,PRO Misiones,partido

# Canales YouTube
yt,@misionesonline,,,Misiones Online,medio
yt,@ElTerritorioOficial,,,El Territorio,medio

# Búsquedas YouTube
yt_query,Oscar Herrera Ahuad,frente_renovador_neo,,Candidato,query
yt_query,Misiones elecciones,,,Electoral,query

# Twitter/X (opcional)
x,"Misiones OR Posadas",,,,query
x,"Frente Renovador Misiones",,,,query

# RSS Feeds
rss,https://misionesonline.net/feed,,,Misiones Online,medio
rss,https://www.elterritorio.com.ar/rss,,,El Territorio,medio`;

  const renderStatusTab = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Header responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Estado del Sistema</h2>
          <p className="text-sm sm:text-base text-gray-600">Configuración actual de fuentes de datos</p>
        </div>
        <button
          onClick={loadSeedsStatus}
          disabled={loading}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="ml-2 text-gray-600">Cargando estado...</span>
        </div>
      )}

      {seedsStatus && (
        <>
          {/* Métricas principales - Optimizadas para móvil */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-4 lg:p-6 rounded-xl border border-blue-200 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <Database className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-800">Total Seeds</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">{seedsStatus.total_seeds}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 sm:p-4 lg:p-6 rounded-xl border border-emerald-200 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-emerald-800">Activos</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-900">{seedsStatus.active_seeds}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 sm:p-4 lg:p-6 rounded-xl border border-purple-200 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-purple-800">FB Resueltos</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">{seedsStatus.resolved_cache.facebook_pages}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 sm:p-4 lg:p-6 rounded-xl border border-red-200 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-red-800">YT Resueltos</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-900">{seedsStatus.resolved_cache.youtube_channels}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estado APIs */}
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de APIs</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(seedsStatus.api_status).map(([api, status]) => (
                <div key={api} className="flex items-center space-x-2">
                  <span className="text-lg">{status}</span>
                  <span className="font-medium capitalize">{api}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Por fuente */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Fuente</h3>
              <div className="space-y-2">
                {Object.entries(seedsStatus.by_source).map(([source, count]) => (
                  <div key={source} className="flex justify-between">
                    <span className="font-mono text-sm">{source}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Alianza</h3>
              <div className="space-y-2">
                {Object.entries(seedsStatus.by_alliance).map(([alliance, count]) => (
                  <div key={alliance} className="flex justify-between">
                    <span className="text-sm">{alliance.replace('_', ' ')}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Municipio</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {Object.entries(seedsStatus.by_municipality).map(([municipality, count]) => (
                  <div key={municipality} className="flex justify-between">
                    <span className="text-sm">{municipality}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderUploadTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Seeds</h2>
          <p className="text-gray-600">Cargar y configurar fuentes de datos</p>
        </div>
      </div>

      {/* Botones de acción rápida */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={loadDefaultSeeds}
          disabled={loading}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          <Database className="h-4 w-4" />
          <span>Cargar Seeds Default</span>
        </button>

        <button
          onClick={bootstrapSeeds}
          disabled={loading}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          <span>Bootstrap IDs</span>
        </button>

        <button
          onClick={exportCSV}
          className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
        >
          <Download className="h-4 w-4" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Upload CSV */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Upload className="h-5 w-5 text-blue-600 mr-2" />
          Subir Configuración CSV
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido CSV (copia y pega)
            </label>
            <textarea
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder={sampleCSV}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: src,handle,alliance,municipality,actor,type
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={uploadCSV}
              disabled={loading || !csvText.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-md transition-colors flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{loading ? 'Procesando...' : 'Subir CSV'}</span>
            </button>

            <button
              onClick={() => setCsvText(sampleCSV)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Usar Ejemplo
            </button>

            <button
              onClick={() => setCsvText('')}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Información sobre formato */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Formato CSV</h4>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li><strong>src:</strong> Fuente (ig, fb, yt, yt_query, x, rss)</li>
              <li><strong>handle:</strong> @cuenta, #hashtag, URL o query</li>
              <li><strong>alliance:</strong> frente_renovador_neo, lla_pro, pays_el_instrumento, etc.</li>
              <li><strong>municipality:</strong> Posadas, Oberá, Eldorado, etc.</li>
              <li><strong>actor:</strong> Gobierno, Municipalidad, Partido, Medio</li>
              <li><strong>type:</strong> oficial, partido, medio, hashtag, query</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-10 w-10 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seeds Manager</h1>
            <p className="text-gray-600">Configuración inteligente de fuentes de datos</p>
          </div>
        </div>
      </div>

      {/* Navegación por tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'status', label: 'Estado', icon: Database },
              { id: 'upload', label: 'Gestión CSV', icon: Upload }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          <p>{success}</p>
          <button 
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Contenido según tab activa */}
      {activeTab === 'status' && renderStatusTab()}
      {activeTab === 'upload' && renderUploadTab()}
    </div>
  );
};

export default SeedsManager;