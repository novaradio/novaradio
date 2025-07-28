#!/usr/bin/env python3
"""
Backend Test Suite for DAMI Centro de Monitoreo Inteligente
Testing Centro Estadístico and Informe Diario functionality
"""

import requests
import json
import sys
import os
from datetime import datetime, timedelta
from typing import Dict, Any, List

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://2150ed7b-63ac-4e90-881f-58d6db2f6fae.preview.emergentagent.com')
API_BASE = f"{BACKEND_URL}/api"

class DAMIBackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "status": status,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def authenticate(self) -> bool:
        """Authenticate with administrator credentials"""
        try:
            login_data = {
                "username": "luis",
                "password": "claveDAMI2025"
            }
            
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.session.headers.update({
                    "Authorization": f"Bearer {self.token}"
                })
                self.log_test("Authentication", True, f"Logged in as {data.get('username')} with role {data.get('role')}")
                return True
            else:
                self.log_test("Authentication", False, f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Authentication", False, f"Exception: {str(e)}")
            return False
    
    def test_centro_estadistico_resumen(self) -> bool:
        """Test Centro Estadístico resumen endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/centro-estadistico/resumen")
            
            if response.status_code == 200:
                data = response.json()
                
                # Validate response structure
                if not data.get("success"):
                    self.log_test("Centro Estadístico - Resumen", False, "Response success flag is False")
                    return False
                
                estadisticas = data.get("data", {})
                if not estadisticas:
                    self.log_test("Centro Estadístico - Resumen", False, "No statistics data returned")
                    return False
                
                # Check for required fields
                required_fields = ["resumen_general", "metricas_clave"]
                for field in required_fields:
                    if field not in estadisticas:
                        self.log_test("Centro Estadístico - Resumen", False, f"Missing required field: {field}")
                        return False
                
                # Validate Frente Renovador focus
                resumen = estadisticas.get("resumen_general", {})
                menciones_total = resumen.get("total_menciones", 0)
                
                self.log_test("Centro Estadístico - Resumen", True, 
                             f"Total mentions: {menciones_total}, Sentiment: {resumen.get('sentimiento_general')}")
                return True
            else:
                self.log_test("Centro Estadístico - Resumen", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Centro Estadístico - Resumen", False, f"Exception: {str(e)}")
            return False
    
    def test_centro_estadistico_completo(self) -> bool:
        """Test Centro Estadístico complete statistics endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/centro-estadistico/completo")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Centro Estadístico - Completo", False, "Response success flag is False")
                    return False
                
                estadisticas = data.get("data", {})
                
                # Check for all required sections
                required_sections = [
                    "estadisticas_generales", "estadisticas_por_red", 
                    "analisis_tematico", "tendencias_temporales", "alertas", "metadata"
                ]
                
                for section in required_sections:
                    if section not in estadisticas:
                        self.log_test("Centro Estadístico - Completo", False, f"Missing section: {section}")
                        return False
                
                # Validate metadata shows Frente Renovador focus
                metadata = estadisticas.get("metadata", {})
                if "Frente Renovador" not in metadata.get("enfoque", ""):
                    self.log_test("Centro Estadístico - Completo", False, "Missing Frente Renovador focus in metadata")
                    return False
                
                self.log_test("Centro Estadístico - Completo", True, 
                             f"All sections present, Focus: {metadata.get('enfoque')}")
                return True
            else:
                self.log_test("Centro Estadístico - Completo", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Centro Estadístico - Completo", False, f"Exception: {str(e)}")
            return False
    
    def test_centro_estadistico_redes_sociales(self) -> bool:
        """Test Centro Estadístico social networks analysis endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/centro-estadistico/redes-sociales")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Centro Estadístico - Redes Sociales", False, "Response success flag is False")
                    return False
                
                redes_data = data.get("data", [])
                if not isinstance(redes_data, list) or len(redes_data) == 0:
                    self.log_test("Centro Estadístico - Redes Sociales", False, "No social networks data returned")
                    return False
                
                # Validate social network data structure
                expected_networks = ["Facebook", "Twitter/X", "Instagram", "TikTok", "YouTube", "WhatsApp"]
                found_networks = [red.get("red_social") for red in redes_data]
                
                for network in expected_networks:
                    if network not in found_networks:
                        self.log_test("Centro Estadístico - Redes Sociales", False, f"Missing network: {network}")
                        return False
                
                # Check positive/negative analysis
                for red in redes_data:
                    required_fields = ["menciones_positivas", "menciones_negativas", "porcentaje_positivo", "porcentaje_negativo"]
                    for field in required_fields:
                        if field not in red:
                            self.log_test("Centro Estadístico - Redes Sociales", False, f"Missing field {field} in network data")
                            return False
                
                self.log_test("Centro Estadístico - Redes Sociales", True, 
                             f"Found {len(redes_data)} networks with positive/negative analysis")
                return True
            else:
                self.log_test("Centro Estadístico - Redes Sociales", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Centro Estadístico - Redes Sociales", False, f"Exception: {str(e)}")
            return False
    
    def test_centro_estadistico_tendencias(self) -> bool:
        """Test Centro Estadístico temporal trends endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/centro-estadistico/tendencias")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Centro Estadístico - Tendencias", False, "Response success flag is False")
                    return False
                
                tendencias = data.get("data", {})
                
                # Check for required trend categories
                required_categories = ["menciones_diarias", "sentimiento_diario", "alcance_diario"]
                for category in required_categories:
                    if category not in tendencias:
                        self.log_test("Centro Estadístico - Tendencias", False, f"Missing trend category: {category}")
                        return False
                    
                    # Validate 7 days of data
                    category_data = tendencias[category]
                    if not isinstance(category_data, list) or len(category_data) != 7:
                        self.log_test("Centro Estadístico - Tendencias", False, f"Invalid data length for {category}: expected 7 days")
                        return False
                
                self.log_test("Centro Estadístico - Tendencias", True, 
                             "7-day temporal trends data validated successfully")
                return True
            else:
                self.log_test("Centro Estadístico - Tendencias", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Centro Estadístico - Tendencias", False, f"Exception: {str(e)}")
            return False
    
    def test_centro_estadistico_alertas(self) -> bool:
        """Test Centro Estadístico statistical alerts endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/centro-estadistico/alertas")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Centro Estadístico - Alertas", False, "Response success flag is False")
                    return False
                
                alertas = data.get("data", [])
                if not isinstance(alertas, list):
                    self.log_test("Centro Estadístico - Alertas", False, "Alerts data is not a list")
                    return False
                
                # Validate alert structure
                for alerta in alertas:
                    required_fields = ["tipo", "severidad", "mensaje", "red_afectada", "accion_sugerida"]
                    for field in required_fields:
                        if field not in alerta:
                            self.log_test("Centro Estadístico - Alertas", False, f"Missing field {field} in alert")
                            return False
                
                self.log_test("Centro Estadístico - Alertas", True, 
                             f"Found {len(alertas)} statistical alerts with proper structure")
                return True
            else:
                self.log_test("Centro Estadístico - Alertas", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Centro Estadístico - Alertas", False, f"Exception: {str(e)}")
            return False
    
    def test_informe_diario_completo(self) -> bool:
        """Test Informe Diario complete report endpoint"""
        try:
            # Test without date parameter (should use today)
            response = self.session.get(f"{API_BASE}/informe-diario")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Informe Diario - Completo", False, "Response success flag is False")
                    return False
                
                informe = data.get("data", {})
                
                # Check for all required sections
                required_sections = [
                    "encabezado", "resumen_ejecutivo", "analisis_de_actividad",
                    "eventos_destacados", "analisis_territorial", "recomendaciones_estrategicas",
                    "alertas_y_riesgos", "plan_accion_24h", "metricas_kpi", "conclusion"
                ]
                
                for section in required_sections:
                    if section not in informe:
                        self.log_test("Informe Diario - Completo", False, f"Missing section: {section}")
                        return False
                
                # Validate Frente Renovador focus in header
                encabezado = informe.get("encabezado", {})
                if "Frente Renovador" not in encabezado.get("titulo", ""):
                    self.log_test("Informe Diario - Completo", False, "Missing Frente Renovador focus in title")
                    return False
                
                self.log_test("Informe Diario - Completo", True, 
                             f"Complete report generated for {encabezado.get('fecha')}")
                return True
            else:
                self.log_test("Informe Diario - Completo", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Informe Diario - Completo", False, f"Exception: {str(e)}")
            return False
    
    def test_informe_diario_con_fecha(self) -> bool:
        """Test Informe Diario with specific date parameter"""
        try:
            # Test with specific date
            test_date = "2025-01-15"
            response = self.session.get(f"{API_BASE}/informe-diario?fecha={test_date}")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Informe Diario - Con Fecha", False, "Response success flag is False")
                    return False
                
                informe = data.get("data", {})
                encabezado = informe.get("encabezado", {})
                
                if encabezado.get("fecha") != test_date:
                    self.log_test("Informe Diario - Con Fecha", False, f"Date mismatch: expected {test_date}, got {encabezado.get('fecha')}")
                    return False
                
                self.log_test("Informe Diario - Con Fecha", True, 
                             f"Report generated for specific date: {test_date}")
                return True
            else:
                self.log_test("Informe Diario - Con Fecha", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Informe Diario - Con Fecha", False, f"Exception: {str(e)}")
            return False
    
    def test_informe_diario_resumen(self) -> bool:
        """Test Informe Diario executive summary endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/informe-diario/resumen")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Informe Diario - Resumen", False, "Response success flag is False")
                    return False
                
                resumen_data = data.get("data", {})
                
                # Check for required summary sections
                required_sections = ["encabezado", "resumen_ejecutivo", "metricas_kpi", "conclusion"]
                for section in required_sections:
                    if section not in resumen_data:
                        self.log_test("Informe Diario - Resumen", False, f"Missing section: {section}")
                        return False
                
                # Validate executive summary content
                resumen_ejecutivo = resumen_data.get("resumen_ejecutivo", {})
                required_fields = ["situacion_general", "descripcion", "menciones_total", "puntos_clave"]
                for field in required_fields:
                    if field not in resumen_ejecutivo:
                        self.log_test("Informe Diario - Resumen", False, f"Missing field {field} in executive summary")
                        return False
                
                self.log_test("Informe Diario - Resumen", True, 
                             f"Executive summary: {resumen_ejecutivo.get('situacion_general')}")
                return True
            else:
                self.log_test("Informe Diario - Resumen", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Informe Diario - Resumen", False, f"Exception: {str(e)}")
            return False
    
    def test_informe_diario_recomendaciones(self) -> bool:
        """Test Informe Diario strategic recommendations endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/informe-diario/recomendaciones")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Informe Diario - Recomendaciones", False, "Response success flag is False")
                    return False
                
                recom_data = data.get("data", {})
                
                # Check for required recommendation sections
                required_sections = ["recomendaciones_estrategicas", "alertas_y_riesgos", "plan_accion_24h"]
                for section in required_sections:
                    if section not in recom_data:
                        self.log_test("Informe Diario - Recomendaciones", False, f"Missing section: {section}")
                        return False
                
                # Validate strategic recommendations structure
                recomendaciones = recom_data.get("recomendaciones_estrategicas", [])
                if not isinstance(recomendaciones, list) or len(recomendaciones) == 0:
                    self.log_test("Informe Diario - Recomendaciones", False, "No strategic recommendations found")
                    return False
                
                # Check recommendation structure
                for recom in recomendaciones:
                    required_fields = ["prioridad", "area", "accion", "justificacion"]
                    for field in required_fields:
                        if field not in recom:
                            self.log_test("Informe Diario - Recomendaciones", False, f"Missing field {field} in recommendation")
                            return False
                
                self.log_test("Informe Diario - Recomendaciones", True, 
                             f"Found {len(recomendaciones)} strategic recommendations")
                return True
            else:
                self.log_test("Informe Diario - Recomendaciones", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Informe Diario - Recomendaciones", False, f"Exception: {str(e)}")
            return False
    
    def test_informe_diario_pdf_data(self) -> bool:
        """Test Informe Diario PDF data endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/informe-diario/pdf-data")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Informe Diario - PDF Data", False, "Response success flag is False")
                    return False
                
                pdf_data = data.get("data", {})
                
                # Check for required PDF data fields
                required_fields = [
                    "titulo", "fecha", "resumen", "metricas_principales",
                    "recomendaciones_top", "alertas_principales", "conclusion"
                ]
                
                for field in required_fields:
                    if field not in pdf_data:
                        self.log_test("Informe Diario - PDF Data", False, f"Missing field: {field}")
                        return False
                
                # Validate data types
                if not isinstance(pdf_data.get("metricas_principales"), list):
                    self.log_test("Informe Diario - PDF Data", False, "metricas_principales should be a list")
                    return False
                
                if not isinstance(pdf_data.get("recomendaciones_top"), list):
                    self.log_test("Informe Diario - PDF Data", False, "recomendaciones_top should be a list")
                    return False
                
                self.log_test("Informe Diario - PDF Data", True, 
                             f"PDF data structure validated for {pdf_data.get('fecha')}")
                return True
            else:
                self.log_test("Informe Diario - PDF Data", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Informe Diario - PDF Data", False, f"Exception: {str(e)}")
            return False
    
    def test_invalid_date_format(self) -> bool:
        """Test error handling for invalid date format"""
        try:
            # Test with invalid date format
            response = self.session.get(f"{API_BASE}/informe-diario?fecha=invalid-date")
            
            if response.status_code == 400:
                self.log_test("Date Validation", True, "Properly rejected invalid date format")
                return True
            else:
                self.log_test("Date Validation", False, 
                             f"Expected 400 for invalid date, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Date Validation", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 80)
        print("DAMI BACKEND TESTING - Centro Estadístico & Informe Diario")
        print("=" * 80)
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print()
        
        # Authentication
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        print()
        print("Testing Centro Estadístico Endpoints:")
        print("-" * 40)
        
        # Centro Estadístico tests
        self.test_centro_estadistico_resumen()
        self.test_centro_estadistico_completo()
        self.test_centro_estadistico_redes_sociales()
        self.test_centro_estadistico_tendencias()
        self.test_centro_estadistico_alertas()
        
        print()
        print("Testing Informe Diario Endpoints:")
        print("-" * 40)
        
        # Informe Diario tests
        self.test_informe_diario_completo()
        self.test_informe_diario_con_fecha()
        self.test_informe_diario_resumen()
        self.test_informe_diario_recomendaciones()
        self.test_informe_diario_pdf_data()
        
        print()
        print("Testing Error Handling:")
        print("-" * 40)
        
        # Error handling tests
        self.test_invalid_date_format()
        
        # Summary
        print()
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("\n🎉 ALL TESTS PASSED! Backend functionality is working correctly.")
            return True
        else:
            print(f"\n⚠️  {total - passed} tests failed. Check details above.")
            return False

def main():
    """Main test execution"""
    tester = DAMIBackendTester()
    success = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()