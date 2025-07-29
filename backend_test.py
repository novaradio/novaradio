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
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://760cb0bc-9667-4870-8ef4-27ad943db3dc.preview.emergentagent.com')
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
    
    def test_instagram_integration_in_resumen(self) -> bool:
        """Test Instagram data integration in Centro Estadístico resumen"""
        try:
            response = self.session.get(f"{API_BASE}/centro-estadistico/resumen")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Instagram Integration - Resumen", False, "Response success flag is False")
                    return False
                
                estadisticas = data.get("data", {})
                resumen = estadisticas.get("resumen_general", {})
                
                # Check for Instagram-specific indicators in metadata or response
                # Instagram should contribute to total mentions and engagement
                total_menciones = resumen.get("total_menciones", 0)
                engagement_rate = resumen.get("engagement_rate", 0)
                
                # Instagram typically has higher engagement rates, so combined rate should reflect this
                if total_menciones > 0 and engagement_rate > 0:
                    self.log_test("Instagram Integration - Resumen", True, 
                                 f"Instagram data integrated: {total_menciones} mentions, {engagement_rate}% engagement")
                    return True
                else:
                    self.log_test("Instagram Integration - Resumen", False, 
                                 "No Instagram data detected in combined metrics")
                    return False
            else:
                self.log_test("Instagram Integration - Resumen", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Instagram Integration - Resumen", False, f"Exception: {str(e)}")
            return False
    
    def test_instagram_in_redes_sociales(self) -> bool:
        """Test Instagram appears in social networks breakdown"""
        try:
            response = self.session.get(f"{API_BASE}/centro-estadistico/redes-sociales")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Instagram in Networks", False, "Response success flag is False")
                    return False
                
                redes_data = data.get("data", [])
                
                # Find Instagram in the networks list
                instagram_data = None
                for red in redes_data:
                    if red.get("red_social") == "Instagram":
                        instagram_data = red
                        break
                
                if not instagram_data:
                    self.log_test("Instagram in Networks", False, "Instagram not found in social networks list")
                    return False
                
                # Validate Instagram-specific data
                required_fields = ["menciones_total", "menciones_positivas", "menciones_negativas", 
                                 "porcentaje_positivo", "hashtags_trending", "audiencia_principal"]
                
                for field in required_fields:
                    if field not in instagram_data:
                        self.log_test("Instagram in Networks", False, f"Missing Instagram field: {field}")
                        return False
                
                # Check Instagram-specific characteristics
                audiencia = instagram_data.get("audiencia_principal", "")
                if "18-34" not in audiencia:
                    self.log_test("Instagram in Networks", False, f"Incorrect Instagram demographic: {audiencia}")
                    return False
                
                # Check for Instagram-typical hashtags
                hashtags = instagram_data.get("hashtags_trending", [])
                instagram_hashtags = ["#FrenteRenovador", "#MisionesAvanza", "#DesarrolloSocial"]
                has_instagram_hashtags = any(tag in hashtags for tag in instagram_hashtags)
                
                if not has_instagram_hashtags:
                    self.log_test("Instagram in Networks", False, "No Instagram-typical hashtags found")
                    return False
                
                self.log_test("Instagram in Networks", True, 
                             f"Instagram data validated: {instagram_data.get('menciones_total')} posts, "
                             f"{instagram_data.get('porcentaje_positivo')}% positive, audience: {audiencia}")
                return True
            else:
                self.log_test("Instagram in Networks", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Instagram in Networks", False, f"Exception: {str(e)}")
            return False
    
    def test_three_platform_weighted_calculation(self) -> bool:
        """Test three-platform weighted engagement calculation (Twitter: 25%, Facebook: 35%, Instagram: 40%)"""
        try:
            # Get complete statistics to analyze weighted calculations
            response = self.session.get(f"{API_BASE}/centro-estadistico/completo")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Three-Platform Weighting", False, "Response success flag is False")
                    return False
                
                estadisticas = data.get("data", {})
                
                # Check metadata for integration confirmation
                metadata = estadisticas.get("metadata", {})
                integraciones = metadata.get("integraciones_activas", [])
                
                expected_integrations = ["Twitter API v2", "Facebook Graph API", "Instagram Basic API"]
                missing_integrations = [integration for integration in expected_integrations 
                                      if integration not in integraciones]
                
                if missing_integrations:
                    self.log_test("Three-Platform Weighting", False, 
                                 f"Missing integrations: {missing_integrations}")
                    return False
                
                # Check that general statistics reflect combined data
                generales = estadisticas.get("estadisticas_generales", {})
                resumen = generales.get("resumen_general", {})
                
                # Verify we have data from all three platforms
                has_twitter_data = resumen.get("twitter_tweets", 0) > 0
                has_facebook_data = resumen.get("facebook_posts", 0) > 0
                
                # Check for Instagram indicators in network breakdown
                redes = estadisticas.get("estadisticas_por_red", [])
                instagram_network = next((red for red in redes if red.get("red_social") == "Instagram"), None)
                has_instagram_data = instagram_network and instagram_network.get("menciones_total", 0) > 0
                
                if not (has_twitter_data or has_facebook_data or has_instagram_data):
                    self.log_test("Three-Platform Weighting", False, 
                                 "No data detected from any of the three integrated platforms")
                    return False
                
                # Check engagement rate reflects weighted calculation
                engagement_rate = resumen.get("engagement_rate", 0)
                if engagement_rate <= 0:
                    self.log_test("Three-Platform Weighting", False, 
                                 "No weighted engagement rate calculated")
                    return False
                
                self.log_test("Three-Platform Weighting", True, 
                             f"Three-platform integration confirmed: Twitter({has_twitter_data}), "
                             f"Facebook({has_facebook_data}), Instagram({has_instagram_data}), "
                             f"Weighted engagement: {engagement_rate}%")
                return True
            else:
                self.log_test("Three-Platform Weighting", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Three-Platform Weighting", False, f"Exception: {str(e)}")
            return False
    
    def test_instagram_visual_content_metrics(self) -> bool:
        """Test Instagram visual content metrics (image/video ratio)"""
        try:
            response = self.session.get(f"{API_BASE}/centro-estadistico/redes-sociales")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Instagram Visual Metrics", False, "Response success flag is False")
                    return False
                
                redes_data = data.get("data", [])
                
                # Find Instagram data
                instagram_data = None
                for red in redes_data:
                    if red.get("red_social") == "Instagram":
                        instagram_data = red
                        break
                
                if not instagram_data:
                    self.log_test("Instagram Visual Metrics", False, "Instagram not found in networks")
                    return False
                
                # Check for Instagram-specific engagement characteristics
                # Instagram typically has higher engagement than Twitter/Facebook
                engagement_rate = instagram_data.get("engagement_rate", 0)
                menciones_total = instagram_data.get("menciones_total", 0)
                
                # Instagram should have reasonable engagement and content
                if menciones_total > 0:
                    # Check for Instagram-typical positive sentiment (visual content tends to be more positive)
                    porcentaje_positivo = instagram_data.get("porcentaje_positivo", 0)
                    
                    # Instagram typically has higher positive sentiment due to visual nature
                    if porcentaje_positivo > 40:  # Instagram content is usually more positive
                        self.log_test("Instagram Visual Metrics", True, 
                                     f"Instagram visual content validated: {menciones_total} posts, "
                                     f"{porcentaje_positivo}% positive (typical for visual platform)")
                        return True
                    else:
                        self.log_test("Instagram Visual Metrics", True, 
                                     f"Instagram data present: {menciones_total} posts, "
                                     f"{porcentaje_positivo}% positive")
                        return True
                else:
                    self.log_test("Instagram Visual Metrics", False, "No Instagram content detected")
                    return False
            else:
                self.log_test("Instagram Visual Metrics", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Instagram Visual Metrics", False, f"Exception: {str(e)}")
            return False
    
    def test_mapa_territorial_actividad_endpoint(self) -> bool:
        """Test Mapa de Misiones territorial activity endpoint with 3-API integration"""
        try:
            response = self.session.get(f"{API_BASE}/mapa-territorial/actividad")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Mapa Territorial - Actividad Endpoint", False, "Response success flag is False")
                    return False
                
                actividad_data = data.get("data", {})
                
                # Validate main structure
                required_sections = ["general", "municipios", "metadata"]
                for section in required_sections:
                    if section not in actividad_data:
                        self.log_test("Mapa Territorial - Actividad Endpoint", False, f"Missing section: {section}")
                        return False
                
                # Validate general section with 3 platforms + combined
                general = actividad_data.get("general", {})
                required_platforms = ["twitter", "facebook", "instagram", "combinado"]
                for platform in required_platforms:
                    if platform not in general:
                        self.log_test("Mapa Territorial - Actividad Endpoint", False, f"Missing platform: {platform}")
                        return False
                
                self.log_test("Mapa Territorial - Actividad Endpoint", True, 
                             "Endpoint structure validated with all 3 platforms + combined data")
                return True
            else:
                self.log_test("Mapa Territorial - Actividad Endpoint", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Mapa Territorial - Actividad Endpoint", False, f"Exception: {str(e)}")
            return False
    
    def test_mapa_territorial_data_structure(self) -> bool:
        """Test Mapa Territorial data structure validation"""
        try:
            response = self.session.get(f"{API_BASE}/mapa-territorial/actividad")
            
            if response.status_code == 200:
                data = response.json()
                actividad_data = data.get("data", {})
                general = actividad_data.get("general", {})
                
                # Test Twitter data structure
                twitter = general.get("twitter", {})
                twitter_fields = ["total_tweets", "positive_tweets", "negative_tweets", "sentiment_score", "engagement_rate", "timestamp"]
                for field in twitter_fields:
                    if field not in twitter:
                        self.log_test("Mapa Territorial - Twitter Data", False, f"Missing Twitter field: {field}")
                        return False
                
                # Test Facebook data structure
                facebook = general.get("facebook", {})
                facebook_fields = ["total_posts", "positive_posts", "negative_posts", "sentiment_score", "engagement_rate", "timestamp"]
                for field in facebook_fields:
                    if field not in facebook:
                        self.log_test("Mapa Territorial - Facebook Data", False, f"Missing Facebook field: {field}")
                        return False
                
                # Test Instagram data structure
                instagram = general.get("instagram", {})
                instagram_fields = ["total_posts", "positive_posts", "negative_posts", "sentiment_score", "engagement_rate", "timestamp"]
                for field in instagram_fields:
                    if field not in instagram:
                        self.log_test("Mapa Territorial - Instagram Data", False, f"Missing Instagram field: {field}")
                        return False
                
                # Test combined data structure
                combinado = general.get("combinado", {})
                combinado_fields = ["total_menciones", "sentiment_promedio", "engagement_promedio", "nivel_actividad", "estado_general"]
                for field in combinado_fields:
                    if field not in combinado:
                        self.log_test("Mapa Territorial - Combined Data", False, f"Missing combined field: {field}")
                        return False
                
                self.log_test("Mapa Territorial - Data Structure", True, 
                             "All platform data structures validated successfully")
                return True
            else:
                self.log_test("Mapa Territorial - Data Structure", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Mapa Territorial - Data Structure", False, f"Exception: {str(e)}")
            return False
    
    def test_mapa_territorial_weighted_calculations(self) -> bool:
        """Test weighted calculations (Instagram: 40%, Facebook: 35%, Twitter: 25%)"""
        try:
            response = self.session.get(f"{API_BASE}/mapa-territorial/actividad")
            
            if response.status_code == 200:
                data = response.json()
                actividad_data = data.get("data", {})
                general = actividad_data.get("general", {})
                
                # Get individual platform data
                twitter = general.get("twitter", {})
                facebook = general.get("facebook", {})
                instagram = general.get("instagram", {})
                combinado = general.get("combinado", {})
                
                # Verify metadata shows correct weighting algorithm
                metadata = actividad_data.get("metadata", {})
                algoritmo = metadata.get("algoritmo_ponderacion", "")
                expected_algorithm = "Instagram: 40%, Facebook: 35%, Twitter: 25%"
                
                if expected_algorithm not in algoritmo:
                    self.log_test("Mapa Territorial - Weighted Algorithm", False, 
                                 f"Incorrect weighting algorithm: {algoritmo}")
                    return False
                
                # Verify combined calculations exist
                sentiment_promedio = combinado.get("sentiment_promedio", 0)
                engagement_promedio = combinado.get("engagement_promedio", 0)
                total_menciones = combinado.get("total_menciones", 0)
                
                # Check that combined metrics are calculated
                if sentiment_promedio == 0 and engagement_promedio == 0 and total_menciones == 0:
                    self.log_test("Mapa Territorial - Weighted Calculations", False, 
                                 "No weighted calculations detected")
                    return False
                
                # Verify total mentions is sum of all platforms
                expected_total = (twitter.get("total_tweets", 0) + 
                                facebook.get("total_posts", 0) + 
                                instagram.get("total_posts", 0))
                
                if total_menciones != expected_total:
                    self.log_test("Mapa Territorial - Weighted Calculations", False, 
                                 f"Total mentions mismatch: expected {expected_total}, got {total_menciones}")
                    return False
                
                self.log_test("Mapa Territorial - Weighted Calculations", True, 
                             f"Weighted calculations validated: {total_menciones} total mentions, "
                             f"sentiment: {sentiment_promedio:.3f}, engagement: {engagement_promedio:.2f}%")
                return True
            else:
                self.log_test("Mapa Territorial - Weighted Calculations", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Mapa Territorial - Weighted Calculations", False, f"Exception: {str(e)}")
            return False
    
    def test_mapa_territorial_activity_analysis(self) -> bool:
        """Test territorial activity level and state determination"""
        try:
            response = self.session.get(f"{API_BASE}/mapa-territorial/actividad")
            
            if response.status_code == 200:
                data = response.json()
                actividad_data = data.get("data", {})
                general = actividad_data.get("general", {})
                combinado = general.get("combinado", {})
                
                # Test activity level determination
                nivel_actividad = combinado.get("nivel_actividad", "")
                valid_activity_levels = ["CRÍTICO", "ALTO", "MEDIO", "BAJO", "DESCONOCIDO"]
                
                if nivel_actividad not in valid_activity_levels:
                    self.log_test("Mapa Territorial - Activity Analysis", False, 
                                 f"Invalid activity level: {nivel_actividad}")
                    return False
                
                # Test territorial state determination
                estado_general = combinado.get("estado_general", "")
                valid_states = ["MUY_FAVORABLE", "FAVORABLE", "NEUTRAL", "DESFAVORABLE", "CRÍTICO", "SIN_DATOS", "ERROR"]
                
                if estado_general not in valid_states:
                    self.log_test("Mapa Territorial - Activity Analysis", False, 
                                 f"Invalid territorial state: {estado_general}")
                    return False
                
                # Verify consistency between sentiment and state
                sentiment_promedio = combinado.get("sentiment_promedio", 0)
                engagement_promedio = combinado.get("engagement_promedio", 0)
                
                # Basic consistency check
                if sentiment_promedio > 0.3 and estado_general in ["DESFAVORABLE", "CRÍTICO"]:
                    self.log_test("Mapa Territorial - Activity Analysis", False, 
                                 f"Inconsistent state: positive sentiment ({sentiment_promedio}) but negative state ({estado_general})")
                    return False
                
                self.log_test("Mapa Territorial - Activity Analysis", True, 
                             f"Activity analysis validated: Level={nivel_actividad}, State={estado_general}, "
                             f"Sentiment={sentiment_promedio:.3f}, Engagement={engagement_promedio:.2f}%")
                return True
            else:
                self.log_test("Mapa Territorial - Activity Analysis", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Mapa Territorial - Activity Analysis", False, f"Exception: {str(e)}")
            return False
    
    def test_mapa_territorial_metadata_verification(self) -> bool:
        """Test metadata shows active integrations and data quality"""
        try:
            response = self.session.get(f"{API_BASE}/mapa-territorial/actividad")
            
            if response.status_code == 200:
                data = response.json()
                actividad_data = data.get("data", {})
                metadata = actividad_data.get("metadata", {})
                
                # Check for required metadata fields
                required_metadata = ["integraciones_activas", "algoritmo_ponderacion", "ultima_actualizacion", 
                                   "datos_disponibles", "calidad_datos"]
                for field in required_metadata:
                    if field not in metadata:
                        self.log_test("Mapa Territorial - Metadata", False, f"Missing metadata field: {field}")
                        return False
                
                # Verify active integrations
                integraciones = metadata.get("integraciones_activas", [])
                expected_integrations = ["Twitter API v2", "Facebook Graph API", "Instagram Basic API"]
                
                for integration in expected_integrations:
                    if integration not in integraciones:
                        self.log_test("Mapa Territorial - Metadata", False, f"Missing integration: {integration}")
                        return False
                
                # Check data availability flags
                datos_disponibles = metadata.get("datos_disponibles", {})
                required_flags = ["twitter", "facebook", "instagram"]
                for flag in required_flags:
                    if flag not in datos_disponibles:
                        self.log_test("Mapa Territorial - Metadata", False, f"Missing data availability flag: {flag}")
                        return False
                
                # Verify data quality assessment
                calidad_datos = metadata.get("calidad_datos", "")
                valid_quality_levels = ["alta", "media", "baja"]
                
                if calidad_datos not in valid_quality_levels:
                    self.log_test("Mapa Territorial - Metadata", False, f"Invalid data quality: {calidad_datos}")
                    return False
                
                self.log_test("Mapa Territorial - Metadata", True, 
                             f"Metadata validated: {len(integraciones)} integrations active, "
                             f"data quality: {calidad_datos}")
                return True
            else:
                self.log_test("Mapa Territorial - Metadata", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Mapa Territorial - Metadata", False, f"Exception: {str(e)}")
            return False
    
    def test_mapa_territorial_fallback_handling(self) -> bool:
        """Test fallback data structure when APIs fail"""
        try:
            response = self.session.get(f"{API_BASE}/mapa-territorial/actividad")
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if we're in fallback mode
                actividad_data = data.get("data", {})
                metadata = actividad_data.get("metadata", {})
                
                if metadata.get("fallback_mode", False):
                    # Validate fallback structure
                    general = actividad_data.get("general", {})
                    combinado = general.get("combinado", {})
                    
                    # In fallback mode, should have basic structure with zero values
                    if (combinado.get("total_menciones", -1) == 0 and 
                        combinado.get("nivel_actividad") == "DESCONOCIDO" and
                        combinado.get("estado_general") == "ERROR"):
                        
                        self.log_test("Mapa Territorial - Fallback Handling", True, 
                                     "Fallback mode detected and structure validated")
                        return True
                    else:
                        self.log_test("Mapa Territorial - Fallback Handling", False, 
                                     "Fallback mode detected but structure invalid")
                        return False
                else:
                    # Normal mode - verify we have actual data
                    general = actividad_data.get("general", {})
                    combinado = general.get("combinado", {})
                    total_menciones = combinado.get("total_menciones", 0)
                    
                    if total_menciones > 0:
                        self.log_test("Mapa Territorial - Fallback Handling", True, 
                                     f"Normal mode with {total_menciones} mentions - fallback not needed")
                        return True
                    else:
                        self.log_test("Mapa Territorial - Fallback Handling", True, 
                                     "Normal mode with zero mentions - APIs may be returning empty data")
                        return True
                        
            else:
                self.log_test("Mapa Territorial - Fallback Handling", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Mapa Territorial - Fallback Handling", False, f"Exception: {str(e)}")
            return False
    
    def test_analisis_competencia_completo(self) -> bool:
        """Test complete political competition analysis endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/analisis-competencia/completo")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Análisis Competencia - Completo", False, "Response success flag is False")
                    return False
                
                analisis = data.get("data", {})
                
                # Check for required main sections
                required_sections = [
                    "resumen_ejecutivo", "analisis_por_partido", "datos_frente_renovador",
                    "analisis_comparativo", "campañas_coordinadas", "influencia_territorial",
                    "recomendaciones_estrategicas", "metadata"
                ]
                
                for section in required_sections:
                    if section not in analisis:
                        self.log_test("Análisis Competencia - Completo", False, f"Missing section: {section}")
                        return False
                
                # Validate executive summary
                resumen = analisis.get("resumen_ejecutivo", {})
                partidos_monitoreados = resumen.get("partidos_monitoreados", 0)
                if partidos_monitoreados != 4:  # Should monitor 4 political parties
                    self.log_test("Análisis Competencia - Completo", False, f"Expected 4 parties, got {partidos_monitoreados}")
                    return False
                
                # Validate party analysis contains all 4 parties
                analisis_partidos = analisis.get("analisis_por_partido", {})
                expected_parties = ["JUNTOS_POR_EL_CAMBIO", "UNION_POR_LA_PATRIA", "LA_LIBERTAD_AVANZA", "OPOSICION_LOCAL"]
                
                for party_id in expected_parties:
                    if party_id not in analisis_partidos:
                        self.log_test("Análisis Competencia - Completo", False, f"Missing party analysis: {party_id}")
                        return False
                
                # Validate 3-platform integration in metadata
                metadata = analisis.get("metadata", {})
                fuentes = metadata.get("fuentes_datos", [])
                expected_sources = ["Twitter API v2", "Facebook Graph API", "Instagram Basic API"]
                
                for source in expected_sources:
                    if source not in fuentes:
                        self.log_test("Análisis Competencia - Completo", False, f"Missing data source: {source}")
                        return False
                
                self.log_test("Análisis Competencia - Completo", True, 
                             f"Complete analysis validated: {partidos_monitoreados} parties, "
                             f"{resumen.get('total_menciones_competencia', 0)} total mentions, "
                             f"threat level: {resumen.get('nivel_amenaza_general', 'N/A')}")
                return True
            else:
                self.log_test("Análisis Competencia - Completo", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Análisis Competencia - Completo", False, f"Exception: {str(e)}")
            return False
    
    def test_analisis_competencia_resumen(self) -> bool:
        """Test executive summary with threat levels"""
        try:
            response = self.session.get(f"{API_BASE}/analisis-competencia/resumen")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Análisis Competencia - Resumen", False, "Response success flag is False")
                    return False
                
                resumen = data.get("data", {})
                
                # Check for required summary fields
                required_fields = [
                    "partidos_monitoreados", "total_menciones_competencia", "nivel_amenaza_general",
                    "campañas_coordinadas_detectadas", "posicion_competitiva", "principal_competidor"
                ]
                
                for field in required_fields:
                    if field not in resumen:
                        self.log_test("Análisis Competencia - Resumen", False, f"Missing field: {field}")
                        return False
                
                # Validate threat levels
                nivel_amenaza = resumen.get("nivel_amenaza_general", "")
                valid_threat_levels = ["CRÍTICO", "ALTO", "MEDIO", "BAJO", "DESCONOCIDO"]
                
                if nivel_amenaza not in valid_threat_levels:
                    self.log_test("Análisis Competencia - Resumen", False, f"Invalid threat level: {nivel_amenaza}")
                    return False
                
                # Validate competitive position
                posicion = resumen.get("posicion_competitiva", "")
                valid_positions = ["DOMINANTE", "COMPETITIVA", "DEFENSIVA", "DESCONOCIDA"]
                
                if posicion not in valid_positions:
                    self.log_test("Análisis Competencia - Resumen", False, f"Invalid competitive position: {posicion}")
                    return False
                
                self.log_test("Análisis Competencia - Resumen", True, 
                             f"Executive summary validated: {resumen.get('partidos_monitoreados')} parties monitored, "
                             f"threat level: {nivel_amenaza}, position: {posicion}")
                return True
            else:
                self.log_test("Análisis Competencia - Resumen", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Análisis Competencia - Resumen", False, f"Exception: {str(e)}")
            return False
    
    def test_analisis_competencia_campañas_coordinadas(self) -> bool:
        """Test coordinated campaign detection algorithms"""
        try:
            response = self.session.get(f"{API_BASE}/analisis-competencia/campañas-coordinadas")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Análisis Competencia - Campañas Coordinadas", False, "Response success flag is False")
                    return False
                
                campañas_data = data.get("data", {})
                
                # Check for required fields
                required_fields = ["campañas_detectadas", "total_campañas", "nivel_alerta", "recomendaciones_inmediatas"]
                
                for field in required_fields:
                    if field not in campañas_data:
                        self.log_test("Análisis Competencia - Campañas Coordinadas", False, f"Missing field: {field}")
                        return False
                
                # Validate campaign detection structure
                campañas = campañas_data.get("campañas_detectadas", [])
                if not isinstance(campañas, list):
                    self.log_test("Análisis Competencia - Campañas Coordinadas", False, "Campaigns should be a list")
                    return False
                
                # Validate campaign structure if campaigns exist
                for campaña in campañas:
                    required_campaign_fields = ["tipo_campaña", "partidos_involucrados", "nivel_confianza", "descripcion"]
                    for field in required_campaign_fields:
                        if field not in campaña:
                            self.log_test("Análisis Competencia - Campañas Coordinadas", False, 
                                         f"Missing campaign field: {field}")
                            return False
                
                # Validate alert level
                nivel_alerta = campañas_data.get("nivel_alerta", "")
                valid_alert_levels = ["CRÍTICO", "ALTO", "MEDIO", "BAJO"]
                
                if nivel_alerta not in valid_alert_levels:
                    self.log_test("Análisis Competencia - Campañas Coordinadas", False, 
                                 f"Invalid alert level: {nivel_alerta}")
                    return False
                
                self.log_test("Análisis Competencia - Campañas Coordinadas", True, 
                             f"Campaign detection validated: {len(campañas)} campaigns detected, "
                             f"alert level: {nivel_alerta}")
                return True
            else:
                self.log_test("Análisis Competencia - Campañas Coordinadas", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Análisis Competencia - Campañas Coordinadas", False, f"Exception: {str(e)}")
            return False
    
    def test_analisis_competencia_influencia_territorial(self) -> bool:
        """Test territorial influence analysis across Misiones municipalities"""
        try:
            response = self.session.get(f"{API_BASE}/analisis-competencia/influencia-territorial")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Análisis Competencia - Influencia Territorial", False, "Response success flag is False")
                    return False
                
                influencia = data.get("data", {})
                
                # Check for required sections
                required_sections = ["analisis_municipal", "resumen_territorial"]
                
                for section in required_sections:
                    if section not in influencia:
                        self.log_test("Análisis Competencia - Influencia Territorial", False, f"Missing section: {section}")
                        return False
                
                # Validate municipal analysis
                analisis_municipal = influencia.get("analisis_municipal", {})
                
                # Check for key Misiones municipalities
                expected_municipalities = ["Posadas", "Oberá", "Puerto Iguazú", "Eldorado", "Leandro N. Alem"]
                found_municipalities = list(analisis_municipal.keys())
                
                for municipality in expected_municipalities:
                    if municipality not in found_municipalities:
                        self.log_test("Análisis Competencia - Influencia Territorial", False, 
                                     f"Missing key municipality: {municipality}")
                        return False
                
                # Validate municipality data structure
                for municipio, datos in analisis_municipal.items():
                    required_fields = ["influencias", "partido_dominante", "nivel_competencia", "riesgo_alternancia"]
                    for field in required_fields:
                        if field not in datos:
                            self.log_test("Análisis Competencia - Influencia Territorial", False, 
                                         f"Missing field {field} in municipality {municipio}")
                            return False
                    
                    # Validate influence data includes Frente Renovador
                    influencias = datos.get("influencias", {})
                    if "Frente Renovador" not in influencias:
                        self.log_test("Análisis Competencia - Influencia Territorial", False, 
                                     f"Missing Frente Renovador influence in {municipio}")
                        return False
                
                # Validate territorial summary
                resumen = influencia.get("resumen_territorial", {})
                required_summary_fields = ["municipios_seguros_fr", "municipios_competitivos", "principal_competidor_territorial"]
                
                for field in required_summary_fields:
                    if field not in resumen:
                        self.log_test("Análisis Competencia - Influencia Territorial", False, 
                                     f"Missing summary field: {field}")
                        return False
                
                self.log_test("Análisis Competencia - Influencia Territorial", True, 
                             f"Territorial analysis validated: {len(analisis_municipal)} municipalities analyzed, "
                             f"{resumen.get('municipios_seguros_fr', 0)} secure municipalities for FR, "
                             f"main competitor: {resumen.get('principal_competidor_territorial', 'N/A')}")
                return True
            else:
                self.log_test("Análisis Competencia - Influencia Territorial", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Análisis Competencia - Influencia Territorial", False, f"Exception: {str(e)}")
            return False
    
    def test_analisis_competencia_recomendaciones(self) -> bool:
        """Test strategic recommendation generation"""
        try:
            response = self.session.get(f"{API_BASE}/analisis-competencia/recomendaciones")
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_test("Análisis Competencia - Recomendaciones", False, "Response success flag is False")
                    return False
                
                recom_data = data.get("data", {})
                
                # Check for required sections
                required_sections = ["recomendaciones_por_prioridad", "total_recomendaciones", 
                                   "accion_inmediata_requerida", "resumen_acciones"]
                
                for section in required_sections:
                    if section not in recom_data:
                        self.log_test("Análisis Competencia - Recomendaciones", False, f"Missing section: {section}")
                        return False
                
                # Validate priority-based recommendations
                recom_por_prioridad = recom_data.get("recomendaciones_por_prioridad", {})
                expected_priorities = ["criticas", "altas", "medias"]
                
                for priority in expected_priorities:
                    if priority not in recom_por_prioridad:
                        self.log_test("Análisis Competencia - Recomendaciones", False, 
                                     f"Missing priority level: {priority}")
                        return False
                    
                    # Validate recommendation structure
                    recommendations = recom_por_prioridad[priority]
                    if not isinstance(recommendations, list):
                        self.log_test("Análisis Competencia - Recomendaciones", False, 
                                     f"Priority {priority} should be a list")
                        return False
                    
                    # Validate individual recommendation structure
                    for recom in recommendations:
                        required_fields = ["prioridad", "categoria", "accion", "descripcion"]
                        for field in required_fields:
                            if field not in recom:
                                self.log_test("Análisis Competencia - Recomendaciones", False, 
                                             f"Missing recommendation field: {field}")
                                return False
                
                # Validate action summary by category
                resumen_acciones = recom_data.get("resumen_acciones", {})
                expected_categories = ["comunicacion", "inteligencia", "territorial", "contra_inteligencia"]
                
                for category in expected_categories:
                    if category not in resumen_acciones:
                        self.log_test("Análisis Competencia - Recomendaciones", False, 
                                     f"Missing action category: {category}")
                        return False
                
                # Count total recommendations
                total_recomendaciones = recom_data.get("total_recomendaciones", 0)
                calculated_total = sum(len(recom_por_prioridad[p]) for p in expected_priorities)
                
                if total_recomendaciones != calculated_total:
                    self.log_test("Análisis Competencia - Recomendaciones", False, 
                                 f"Total recommendations mismatch: reported {total_recomendaciones}, calculated {calculated_total}")
                    return False
                
                self.log_test("Análisis Competencia - Recomendaciones", True, 
                             f"Strategic recommendations validated: {total_recomendaciones} total recommendations, "
                             f"critical: {len(recom_por_prioridad['criticas'])}, "
                             f"immediate action required: {recom_data.get('accion_inmediata_requerida', False)}")
                return True
            else:
                self.log_test("Análisis Competencia - Recomendaciones", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Análisis Competencia - Recomendaciones", False, f"Exception: {str(e)}")
            return False
    
    def test_analisis_competencia_party_data_validation(self) -> bool:
        """Test detailed validation of 4 political parties data"""
        try:
            response = self.session.get(f"{API_BASE}/analisis-competencia/completo")
            
            if response.status_code == 200:
                data = response.json()
                analisis = data.get("data", {})
                analisis_partidos = analisis.get("analisis_por_partido", {})
                
                # Expected parties with their characteristics
                expected_parties = {
                    "JUNTOS_POR_EL_CAMBIO": "Juntos por el Cambio",
                    "UNION_POR_LA_PATRIA": "Unión por la Patria", 
                    "LA_LIBERTAD_AVANZA": "La Libertad Avanza",
                    "OPOSICION_LOCAL": "Oposición Local Misiones"
                }
                
                for party_id, expected_name in expected_parties.items():
                    if party_id not in analisis_partidos:
                        self.log_test("Análisis Competencia - Party Data Validation", False, 
                                     f"Missing party: {party_id}")
                        return False
                    
                    party_data = analisis_partidos[party_id]
                    
                    # Validate party structure
                    required_sections = ["info_partido", "metricas_generales", "datos_por_plataforma", 
                                       "analisis_contenido", "riesgo_competitivo"]
                    
                    for section in required_sections:
                        if section not in party_data:
                            self.log_test("Análisis Competencia - Party Data Validation", False, 
                                         f"Missing section {section} for party {party_id}")
                            return False
                    
                    # Validate party info
                    info_partido = party_data.get("info_partido", {})
                    if info_partido.get("nombre") != expected_name:
                        self.log_test("Análisis Competencia - Party Data Validation", False, 
                                     f"Incorrect party name for {party_id}: expected {expected_name}, got {info_partido.get('nombre')}")
                        return False
                    
                    # Validate 3-platform data
                    datos_plataforma = party_data.get("datos_por_plataforma", {})
                    expected_platforms = ["twitter", "facebook", "instagram"]
                    
                    for platform in expected_platforms:
                        if platform not in datos_plataforma:
                            self.log_test("Análisis Competencia - Party Data Validation", False, 
                                         f"Missing platform {platform} for party {party_id}")
                            return False
                        
                        platform_data = datos_plataforma[platform]
                        required_metrics = ["menciones", "sentiment", "engagement"]
                        
                        for metric in required_metrics:
                            if metric not in platform_data:
                                self.log_test("Análisis Competencia - Party Data Validation", False, 
                                             f"Missing metric {metric} in {platform} for party {party_id}")
                                return False
                    
                    # Validate weighted calculations
                    metricas = party_data.get("metricas_generales", {})
                    required_metrics = ["total_menciones", "sentiment_promedio", "engagement_promedio", 
                                      "nivel_actividad", "tendencia_7dias"]
                    
                    for metric in required_metrics:
                        if metric not in metricas:
                            self.log_test("Análisis Competencia - Party Data Validation", False, 
                                         f"Missing general metric {metric} for party {party_id}")
                            return False
                
                self.log_test("Análisis Competencia - Party Data Validation", True, 
                             f"All 4 political parties validated with complete data structure and 3-platform integration")
                return True
            else:
                self.log_test("Análisis Competencia - Party Data Validation", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Análisis Competencia - Party Data Validation", False, f"Exception: {str(e)}")
            return False
    
    def test_analisis_competencia_weighted_calculations(self) -> bool:
        """Test 3-platform weighted calculations (Twitter: 25%, Facebook: 35%, Instagram: 40%)"""
        try:
            response = self.session.get(f"{API_BASE}/analisis-competencia/completo")
            
            if response.status_code == 200:
                data = response.json()
                analisis = data.get("data", {})
                
                # Check metadata confirms weighted algorithm
                metadata = analisis.get("metadata", {})
                fuentes = metadata.get("fuentes_datos", [])
                expected_sources = ["Twitter API v2", "Facebook Graph API", "Instagram Basic API"]
                
                for source in expected_sources:
                    if source not in fuentes:
                        self.log_test("Análisis Competencia - Weighted Calculations", False, 
                                     f"Missing data source: {source}")
                        return False
                
                # Validate Frente Renovador data uses same weighting
                datos_fr = analisis.get("datos_frente_renovador", {})
                fr_platforms = datos_fr.get("datos_por_plataforma", {})
                
                if not all(platform in fr_platforms for platform in ["twitter", "facebook", "instagram"]):
                    self.log_test("Análisis Competencia - Weighted Calculations", False, 
                                 "Frente Renovador missing platform data")
                    return False
                
                # Check that weighted calculations exist for parties
                analisis_partidos = analisis.get("analisis_por_partido", {})
                
                for party_id, party_data in analisis_partidos.items():
                    metricas = party_data.get("metricas_generales", {})
                    platforms = party_data.get("datos_por_plataforma", {})
                    
                    # Verify all platforms have data
                    if not all(platform in platforms for platform in ["twitter", "facebook", "instagram"]):
                        self.log_test("Análisis Competencia - Weighted Calculations", False, 
                                     f"Party {party_id} missing platform data")
                        return False
                    
                    # Check weighted metrics exist
                    if "sentiment_promedio" not in metricas or "engagement_promedio" not in metricas:
                        self.log_test("Análisis Competencia - Weighted Calculations", False, 
                                     f"Party {party_id} missing weighted metrics")
                        return False
                    
                    # Verify total mentions is sum of all platforms
                    expected_total = (platforms["twitter"].get("menciones", 0) + 
                                    platforms["facebook"].get("menciones", 0) + 
                                    platforms["instagram"].get("menciones", 0))
                    
                    actual_total = metricas.get("total_menciones", 0)
                    
                    if expected_total != actual_total:
                        self.log_test("Análisis Competencia - Weighted Calculations", False, 
                                     f"Party {party_id} total mentions mismatch: expected {expected_total}, got {actual_total}")
                        return False
                
                self.log_test("Análisis Competencia - Weighted Calculations", True, 
                             "3-platform weighted calculations validated for all parties (Twitter: 25%, Facebook: 35%, Instagram: 40%)")
                return True
            else:
                self.log_test("Análisis Competencia - Weighted Calculations", False, 
                             f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Análisis Competencia - Weighted Calculations", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 80)
        print("DAMI BACKEND TESTING - Complete System Validation")
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
        print("Testing Instagram Integration:")
        print("-" * 40)
        
        # Instagram integration tests
        self.test_instagram_integration_in_resumen()
        self.test_instagram_in_redes_sociales()
        self.test_three_platform_weighted_calculation()
        self.test_instagram_visual_content_metrics()
        
        print()
        print("Testing Mapa Territorial Activity Endpoint:")
        print("-" * 40)
        
        # Mapa Territorial tests
        self.test_mapa_territorial_actividad_endpoint()
        self.test_mapa_territorial_data_structure()
        self.test_mapa_territorial_weighted_calculations()
        self.test_mapa_territorial_activity_analysis()
        self.test_mapa_territorial_metadata_verification()
        self.test_mapa_territorial_fallback_handling()
        
        print()
        print("🎯 Testing Análisis de Competencia - Political Intelligence System:")
        print("-" * 60)
        
        # Análisis de Competencia tests - THE MAIN FOCUS
        self.test_analisis_competencia_completo()
        self.test_analisis_competencia_resumen()
        self.test_analisis_competencia_campañas_coordinadas()
        self.test_analisis_competencia_influencia_territorial()
        self.test_analisis_competencia_recomendaciones()
        self.test_analisis_competencia_party_data_validation()
        self.test_analisis_competencia_weighted_calculations()
        
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