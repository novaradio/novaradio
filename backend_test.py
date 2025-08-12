#!/usr/bin/env python3
"""
DAMI Centro de Monitoreo Político - Backend API Testing Suite
Comprehensive testing for all backend endpoints and functionality
"""

import requests
import sys
import json
from datetime import datetime
import time

class DAMIAPITester:
    def __init__(self, base_url="https://503cd60f-ae53-46a4-9543-b8a31a457d37.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")
        return success

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        
        # Add auth header if token exists
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if success and response.content:
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'data' in response_data:
                        details += f" | Data keys: {list(response_data['data'].keys()) if isinstance(response_data['data'], dict) else 'array'}"
                    elif isinstance(response_data, list):
                        details += f" | Items: {len(response_data)}"
                except:
                    details += " | Response: non-JSON"
            
            return self.log_test(name, success, details), response.json() if success and response.content else {}

        except requests.exceptions.Timeout:
            return self.log_test(name, False, "TIMEOUT"), {}
        except requests.exceptions.ConnectionError:
            return self.log_test(name, False, "CONNECTION ERROR"), {}
        except Exception as e:
            return self.log_test(name, False, f"ERROR: {str(e)}"), {}

    def test_authentication(self):
        """Test authentication system"""
        print("\n🔐 TESTING AUTHENTICATION SYSTEM")
        
        # Test login with correct credentials
        success, response = self.run_test(
            "Login with luis/claveDAMI2025",
            "POST",
            "auth/login",
            200,
            data={"username": "luis", "password": "claveDAMI2025"}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = {
                'username': response.get('username'),
                'role': response.get('role')
            }
            print(f"   🎯 Logged in as: {self.user_data['username']} ({self.user_data['role']})")
            return True
        else:
            print("   ❌ Authentication failed - cannot continue with protected endpoints")
            return False

    def test_dashboard_endpoints(self):
        """Test dashboard and summary endpoints"""
        print("\n📊 TESTING DASHBOARD ENDPOINTS")
        
        self.run_test("Dashboard Summary", "GET", "dashboard/summary", 200)

    def test_political_actors(self):
        """Test political actors endpoints"""
        print("\n👥 TESTING POLITICAL ACTORS")
        
        success, actors = self.run_test("Get Political Actors", "GET", "actors", 200)
        
        if success and isinstance(actors, list):
            print(f"   📋 Found {len(actors)} political actors")
            for actor in actors[:3]:  # Show first 3
                print(f"   • {actor.get('name', 'Unknown')} - {actor.get('status', 'Unknown')} - Score: {actor.get('influence_score', 0)}")

    def test_territorial_zones(self):
        """Test territorial zones endpoints"""
        print("\n🗺️ TESTING TERRITORIAL ZONES")
        
        success, zones = self.run_test("Get Territorial Zones", "GET", "zones", 200)
        
        if success and isinstance(zones, list):
            print(f"   📍 Found {len(zones)} territorial zones")
            for zone in zones[:3]:  # Show first 3
                print(f"   • {zone.get('name', 'Unknown')} - {zone.get('status', 'Unknown')} - Activity: {zone.get('activity_level', 0)}")

    def test_social_media_feed(self):
        """Test social media feed endpoints"""
        print("\n📱 TESTING SOCIAL MEDIA FEED")
        
        success, posts = self.run_test("Get Social Media Feed", "GET", "feed?limit=10", 200)
        
        if success and isinstance(posts, list):
            print(f"   📰 Found {len(posts)} social media posts")
            for post in posts[:2]:  # Show first 2
                print(f"   • {post.get('author', 'Unknown')} on {post.get('platform', 'Unknown')}: {post.get('content', '')[:50]}...")

    def test_ai_recommendations(self):
        """Test AI recommendations endpoints"""
        print("\n🤖 TESTING AI RECOMMENDATIONS")
        
        success, recommendations = self.run_test("Get AI Recommendations", "GET", "recommendations?limit=10", 200)
        
        if success and isinstance(recommendations, list):
            print(f"   💡 Found {len(recommendations)} AI recommendations")
            for rec in recommendations[:2]:  # Show first 2
                print(f"   • {rec.get('type', 'Unknown')} - {rec.get('priority', 'Unknown')}: {rec.get('description', '')[:50]}...")

    def test_alerts_system(self):
        """Test alerts system"""
        print("\n⚠️ TESTING ALERTS SYSTEM")
        
        success, alerts = self.run_test("Get Alerts", "GET", "alerts?limit=10", 200)
        
        if success and isinstance(alerts, list):
            print(f"   🚨 Found {len(alerts)} alerts")
            for alert in alerts[:2]:  # Show first 2
                print(f"   • {alert.get('level', 'Unknown')} - {alert.get('title', 'Unknown')}: {alert.get('description', '')[:50]}...")

    def test_chat_system(self):
        """Test DAMIBOT chat system"""
        print("\n💬 TESTING DAMIBOT CHAT SYSTEM")
        
        # Test basic chat
        chat_data = {
            "message": "¿Cuál es la situación actual?",
            "session_id": "test_session_123"
        }
        
        success, response = self.run_test("Chat with DAMIBOT", "POST", "chat", 200, data=chat_data)
        
        if success and 'response' in response:
            print(f"   🤖 DAMIBOT Response: {response['response'][:100]}...")

    def test_centro_estadistico(self):
        """Test Centro Estadístico endpoints"""
        print("\n📈 TESTING CENTRO ESTADÍSTICO")
        
        self.run_test("Centro Estadístico - Resumen", "GET", "centro-estadistico/resumen", 200)
        self.run_test("Centro Estadístico - Completo", "GET", "centro-estadistico/completo", 200)
        self.run_test("Centro Estadístico - Redes Sociales", "GET", "centro-estadistico/redes-sociales", 200)

    def test_centro_comando(self):
        """Test Centro de Comando endpoints"""
        print("\n🎯 TESTING CENTRO DE COMANDO")
        
        self.run_test("Centro Comando - Situación", "GET", "centro-comando/situacion", 200)
        self.run_test("Centro Comando - Alertas", "GET", "centro-comando/alertas", 200)
        self.run_test("Centro Comando - Monitoreo", "GET", "centro-comando/monitoreo", 200)

    def test_dashboard_ejecutivo(self):
        """Test Dashboard Ejecutivo endpoints"""
        print("\n🏢 TESTING DASHBOARD EJECUTIVO")
        
        self.run_test("Dashboard Ejecutivo - Datos", "GET", "dashboard-ejecutivo/datos", 200)
        self.run_test("Dashboard Ejecutivo - Métricas", "GET", "dashboard-ejecutivo/metricas", 200)
        self.run_test("Dashboard Ejecutivo - Consolidado", "GET", "dashboard-ejecutivo/consolidado", 200)

    def test_analisis_competencia(self):
        """Test Análisis de Competencia endpoints"""
        print("\n⚔️ TESTING ANÁLISIS DE COMPETENCIA")
        
        self.run_test("Análisis Competencia - Datos", "GET", "analisis-competencia/datos", 200)
        self.run_test("Análisis Competencia - Comparativo", "GET", "analisis-competencia/comparativo", 200)

    def test_encuestas_sociales(self):
        """Test Encuestas Sociales endpoints"""
        print("\n📊 TESTING ENCUESTAS SOCIALES")
        
        self.run_test("Encuestas Sociales - Datos", "GET", "encuestas-sociales/datos", 200)
        self.run_test("Encuestas Sociales - Resultados", "GET", "encuestas-sociales/resultados", 200)

    def test_mapa_territorial(self):
        """Test Mapa Territorial endpoints"""
        print("\n🗺️ TESTING MAPA TERRITORIAL")
        
        self.run_test("Mapa Territorial - Municipios", "GET", "mapa-territorial/municipios", 200)
        self.run_test("Mapa Territorial - Datos", "GET", "mapa-territorial/datos", 200)

    def test_ai_modules(self):
        """Test AI modules endpoints"""
        print("\n🧠 TESTING AI MODULES")
        
        self.run_test("AI Modules Overview", "GET", "ai/modules/overview", 200)
        self.run_test("Deepfake Detection Stats", "GET", "ai/deepfake-detection/stats", 200)
        self.run_test("Autonomous Agent Status", "GET", "ai/autonomous-agent/status", 200)
        self.run_test("Predictive Analysis Status", "GET", "ai/predictive-analysis/status", 200)
        self.run_test("Emotional Intelligence Status", "GET", "ai/emotional-intelligence/status", 200)

    def test_elecciones_octubre_2025(self):
        """Test Elecciones Octubre 2025 endpoints"""
        print("\n🗳️ TESTING ELECCIONES OCTUBRE 2025")
        
        self.run_test("Elecciones - Panorama", "GET", "elecciones-octubre-2025/panorama", 200)
        self.run_test("Elecciones - Candidatos", "GET", "elecciones-octubre-2025/candidatos", 200)
        self.run_test("Elecciones - Proyecciones", "GET", "elecciones-octubre-2025/proyecciones", 200)

    def test_ia_predictiva(self):
        """Test IA Predictiva Avanzada endpoints"""
        print("\n🔮 TESTING IA PREDICTIVA AVANZADA")
        
        self.run_test("IA Predictiva - Status", "GET", "ia-predictiva/status", 200)
        self.run_test("IA Predictiva - Predicciones", "GET", "ia-predictiva/predicciones", 200)

    def test_automatizacion(self):
        """Test Automatización Avanzada endpoints"""
        print("\n🤖 TESTING AUTOMATIZACIÓN AVANZADA")
        
        self.run_test("Automatización - Status", "GET", "automatizacion/status", 200)
        self.run_test("Automatización - Estadísticas", "GET", "automatizacion/estadisticas", 200)

    def test_youtube_integration(self):
        """Test YouTube integration endpoints"""
        print("\n📺 TESTING YOUTUBE INTEGRATION")
        
        self.run_test("YouTube - Status", "GET", "youtube/status", 200)
        self.run_test("YouTube - Analytics", "GET", "youtube/analytics", 200)

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 INICIANDO PRUEBAS COMPREHENSIVAS DEL BACKEND DAMI")
        print("=" * 60)
        
        start_time = time.time()
        
        # Core authentication test - must pass to continue
        if not self.test_authentication():
            print("\n❌ AUTHENTICATION FAILED - STOPPING TESTS")
            return False
        
        # Core system tests
        self.test_dashboard_endpoints()
        self.test_political_actors()
        self.test_territorial_zones()
        self.test_social_media_feed()
        self.test_ai_recommendations()
        self.test_alerts_system()
        self.test_chat_system()
        
        # Module-specific tests
        self.test_centro_estadistico()
        self.test_centro_comando()
        self.test_dashboard_ejecutivo()
        self.test_analisis_competencia()
        self.test_encuestas_sociales()
        self.test_mapa_territorial()
        
        # AI and advanced features
        self.test_ai_modules()
        self.test_elecciones_octubre_2025()
        self.test_ia_predictiva()
        self.test_automatizacion()
        self.test_youtube_integration()
        
        # Final results
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 60)
        print("📊 RESULTADOS FINALES DE PRUEBAS BACKEND")
        print("=" * 60)
        print(f"✅ Pruebas exitosas: {self.tests_passed}/{self.tests_run}")
        print(f"📈 Tasa de éxito: {(self.tests_passed/self.tests_run)*100:.1f}%")
        print(f"⏱️ Tiempo total: {duration:.2f} segundos")
        print(f"🎯 Usuario de prueba: {self.user_data['username']} ({self.user_data['role']})")
        
        if self.tests_passed == self.tests_run:
            print("🎉 TODOS LOS TESTS PASARON - BACKEND COMPLETAMENTE FUNCIONAL")
            return True
        elif self.tests_passed / self.tests_run >= 0.8:
            print("✅ MAYORÍA DE TESTS PASARON - BACKEND MAYORMENTE FUNCIONAL")
            return True
        else:
            print("⚠️ MÚLTIPLES FALLAS DETECTADAS - REQUIERE ATENCIÓN")
            return False

def main():
    """Main test execution"""
    print("🎯 DAMI Centro de Monitoreo Político - Test Suite")
    print("🔗 URL: https://503cd60f-ae53-46a4-9543-b8a31a457d37.preview.emergentagent.com")
    print("👤 Credenciales: luis/claveDAMI2025")
    print()
    
    tester = DAMIAPITester()
    success = tester.run_comprehensive_test()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())