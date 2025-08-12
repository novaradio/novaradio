# DAMI Centro Inteligente - Guía de Despliegue

## 🚀 Opciones de Instalación

### Opción 1: Instalación Automática (Recomendada)
```bash
# Clonar o descargar el proyecto
git clone https://github.com/dami-center/dami-centro-inteligente.git
cd dami-centro-inteligente

# Ejecutar instalación automática
chmod +x install.sh
./install.sh

# Iniciar el sistema
./start_dami.sh
```

### Opción 2: Instalación Manual

#### Requisitos Previos
- **Python 3.11+**
- **Node.js 18+** 
- **MongoDB 7.0+**
- **Yarn package manager**

#### Pasos de Instalación

1. **Instalar dependencias del backend:**
```bash
cd backend
pip install -r requirements.txt
```

2. **Instalar dependencias del frontend:**
```bash
cd frontend
yarn install
```

3. **Configurar variables de entorno:**
```bash
# Backend (.env)
MONGO_URL="mongodb://localhost:27017"
DB_NAME="dami_database"
SECRET_KEY="dami_secret_key_2025"

# Frontend (.env)
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
```

4. **Iniciar servicios:**
```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend
cd backend && python server.py

# Terminal 3: Frontend
cd frontend && yarn start
```

### Opción 3: Despliegue con Docker

```bash
# Construir y ejecutar contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

### Opción 4: Despliegue con Supervisor

```bash
# Copiar configuración
sudo cp supervisor.conf /etc/supervisor/conf.d/dami.conf

# Recargar configuración
sudo supervisorctl reread
sudo supervisorctl update

# Iniciar servicios
sudo supervisorctl start dami-services:*

# Ver estado
sudo supervisorctl status
```

## 🌐 Acceso al Sistema

Una vez instalado, el sistema estará disponible en:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

## 👥 Credenciales por Defecto

| Usuario  | Contraseña      | Rol           | Descripción                    |
|----------|-----------------|---------------|--------------------------------|
| luis     | claveDAMI2025   | Administrador | Acceso completo al sistema     |
| rovira   | confidencial123 | Administrador | Acceso completo al sistema     |
| castano  | tactico456      | Analista      | Análisis y reportes            |
| torres   | vision789       | Analista      | Análisis y reportes            |
| victoria | coordinacion321 | Operador      | Operaciones tácticas           |

## 🔧 Configuración Avanzada

### Base de Datos MongoDB

Para configuración personalizada de MongoDB:

```javascript
// Conectar a MongoDB
use dami_database

// Crear usuario personalizado
db.createUser({
  user: "dami_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

### Variables de Entorno de Producción

#### Backend (.env)
```env
MONGO_URL="mongodb://usuario:password@host:27017/dami_database"
DB_NAME="dami_production"
SECRET_KEY="your-super-secure-secret-key-here"
ENVIRONMENT="production"
LOG_LEVEL="INFO"
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=https://tu-dominio.com
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

### Configuración de SSL/HTTPS

Para despliegue en producción con HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name tu-dominio.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 Monitoreo y Logs

### Ubicación de Logs
- **Backend**: `/var/log/supervisor/dami-backend.log`
- **Frontend**: `/var/log/supervisor/dami-frontend.log`
- **MongoDB**: `/var/log/mongodb/mongod.log`

### Comandos de Monitoreo
```bash
# Ver logs en tiempo real
tail -f /var/log/supervisor/dami-backend.log

# Estado de servicios
sudo supervisorctl status dami-services:*

# Reiniciar servicios específicos
sudo supervisorctl restart dami-backend
sudo supervisorctl restart dami-frontend
```

## 🔒 Seguridad

### Recomendaciones de Producción

1. **Cambiar credenciales por defecto**
2. **Usar HTTPS en producción**
3. **Configurar firewall adecuadamente**
4. **Actualizar SECRET_KEY**
5. **Habilitar autenticación MongoDB**
6. **Implementar rate limiting**

### Configuración de Firewall
```bash
# Permitir solo puertos necesarios
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 🚨 Solución de Problemas

### Problemas Comunes

#### MongoDB no conecta
```bash
# Verificar estado
sudo systemctl status mongod

# Iniciar MongoDB
sudo systemctl start mongod

# Ver logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### Frontend no carga
```bash
# Verificar puerto
netstat -tulpn | grep :3000

# Reiniciar servicio
sudo supervisorctl restart dami-frontend
```

#### Backend retorna 500
```bash
# Ver logs detallados
tail -f /var/log/supervisor/dami-backend.log

# Verificar dependencias
cd backend && pip install -r requirements.txt
```

### Logs de Debug

Para habilitar logs detallados:

```python
# En server.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📈 Optimización de Performance

### Configuración de Producción

#### Backend Optimizations
```python
# server.py
app = FastAPI(
    title="DAMI Intelligence Platform",
    docs_url=None,  # Deshabilitar en producción
    redoc_url=None
)
```

#### Frontend Optimizations
```json
// package.json build script
"build": "GENERATE_SOURCEMAP=false react-scripts build"
```

### Monitoreo de Recursos
```bash
# Uso de CPU y memoria
htop

# Espacio en disco
df -h

# Conexiones de red
netstat -tulpn
```

## 🔄 Backup y Recuperación

### Backup de MongoDB
```bash
# Crear backup
mongodump --db dami_database --out /backup/dami-$(date +%Y%m%d)

# Restaurar backup
mongorestore --db dami_database /backup/dami-20250101/dami_database
```

### Backup de Configuración
```bash
# Backup completo del sistema
tar -czf dami-backup-$(date +%Y%m%d).tar.gz \
  /app/backend/.env \
  /app/frontend/.env \
  /etc/supervisor/conf.d/dami.conf
```

## 📞 Soporte Técnico

Para soporte técnico adicional:

- **Documentación**: Ver README.md principal
- **Issues**: Crear ticket en el repositorio
- **Email**: soporte@dami-center.com

---

**DAMI Centro Inteligente v1.0.0** - Sistema de Inteligencia Política Digital © 2025