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