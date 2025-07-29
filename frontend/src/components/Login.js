import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { Eye, EyeOff, Shield, Brain } from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      toast.error('Por favor ingrese usuario y contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, credentials);
      const { access_token, username, role } = response.data;
      
      toast.success(`¡Bienvenido al sistema DAMI, ${username}!`);
      
      // Generate QR code after successful login
      try {
        const qrResponse = await axios.post(`${API}/auth/qr-generate`, {}, {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        setQrCode(qrResponse.data.qr_code);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }

      onLogin(access_token, { username, role });
    } catch (error) {
      toast.error('Acceso denegado. Verifique sus credenciales.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 sm:w-12 sm:h-12 text-green-400 mr-2 sm:mr-3" />
            <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-green-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
            🧠 DAMI
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg px-2">
            Centro de Monitoreo Inteligente DAMI
          </p>
        </div>

        {/* Login Form */}
        <div className="dami-card mx-2 sm:mx-0">
          <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4 sm:mb-6 text-white">
            Acceso DAMI
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="username"
                placeholder="Usuario"
                value={credentials.username}
                onChange={handleInputChange}
                className="dami-input w-full"
                disabled={loading}
              />
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Contraseña"
                value={credentials.password}
                onChange={handleInputChange}
                className="dami-input w-full pr-12"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="dami-button w-full flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Verificando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          {/* QR Code Display */}
          {qrCode && (
            <div className="mt-6 text-center fade-in">
              <p className="text-sm text-gray-400 mb-3">
                Código QR de acceso generado:
              </p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCode} alt="QR Code" className="w-32 h-32" />
              </div>
            </div>
          )}
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-sm font-semibold text-green-400 mb-2">
            Credenciales de Demostración:
          </h3>
          <div className="text-xs text-gray-400 space-y-1">
            <div><strong>Admin:</strong> luis / claveDAMI2025</div>
            <div><strong>Admin:</strong> rovira / confidencial123</div>
            <div><strong>Analista:</strong> castano / tactico456</div>
            <div><strong>Analista:</strong> torres / vision789</div>
            <div><strong>Operador:</strong> victoria / coordinacion321</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          Sistema de Inteligencia Política DAMI © 2025
        </div>
      </div>
    </div>
  );
};

export default Login;