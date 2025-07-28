#!/bin/bash

# DAMI Centro Inteligente - Script de Instalación Automática
# ==========================================================

echo "🧠 Centro de Monitoreo Inteligente DAMI"
echo "=================================================="
echo "Iniciando instalación automática del sistema..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funciones de utilidad
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar dependencias del sistema
check_dependencies() {
    print_info "Verificando dependencias del sistema..."
    
    # Verificar Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_success "Python $PYTHON_VERSION encontrado"
    else
        print_error "Python 3.11+ requerido. Por favor instalar primero."
        exit 1
    fi
    
    # Verificar Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js $NODE_VERSION encontrado"
    else
        print_error "Node.js 18+ requerido. Por favor instalar primero."
        exit 1
    fi
    
    # Verificar Yarn
    if command -v yarn &> /dev/null; then
        YARN_VERSION=$(yarn --version)
        print_success "Yarn $YARN_VERSION encontrado"
    else
        print_error "Yarn requerido. Instalando..."
        npm install -g yarn
    fi
    
    # Verificar MongoDB
    if command -v mongod &> /dev/null; then
        print_success "MongoDB encontrado"
    else
        print_warning "MongoDB no encontrado. Asegúrate de instalarlo y ejecutarlo."
    fi
}

# Instalar dependencias del backend
install_backend() {
    print_info "Instalando dependencias del backend..."
    cd backend
    
    if [ -f "requirements.txt" ]; then
        pip3 install -r requirements.txt
        print_success "Dependencias de Python instaladas"
    else
        print_error "requirements.txt no encontrado"
        exit 1
    fi
    
    cd ..
}

# Instalar dependencias del frontend
install_frontend() {
    print_info "Instalando dependencias del frontend..."
    cd frontend
    
    if [ -f "package.json" ]; then
        yarn install
        print_success "Dependencias de Node.js instaladas"
    else
        print_error "package.json no encontrado"
        exit 1
    fi
    
    cd ..
}

# Configurar variables de entorno
setup_environment() {
    print_info "Configurando variables de entorno..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        print_warning "Creando archivo backend/.env"
        cat > backend/.env << EOF
MONGO_URL="mongodb://localhost:27017"
DB_NAME="dami_database"
SECRET_KEY="dami_secret_key_2025_intelligence_platform"
EOF
        print_success "Archivo backend/.env creado"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        print_warning "Creando archivo frontend/.env"
        cat > frontend/.env << EOF
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
EOF
        print_success "Archivo frontend/.env creado"
    fi
}

# Inicializar base de datos
init_database() {
    print_info "Inicializando base de datos MongoDB..."
    
    # Verificar si MongoDB está corriendo
    if pgrep -x "mongod" > /dev/null; then
        print_success "MongoDB está ejecutándose"
    else
        print_warning "Iniciando MongoDB..."
        sudo systemctl start mongod 2>/dev/null || mongod --fork --logpath /var/log/mongodb.log --dbpath /var/lib/mongodb 2>/dev/null
    fi
}

# Crear script de inicio
create_start_script() {
    print_info "Creando script de inicio..."
    
    cat > start_dami.sh << 'EOF'
#!/bin/bash

echo "🧠 Iniciando DAMI Centro Inteligente..."

# Función para manejar Ctrl+C
cleanup() {
    echo "Deteniendo servicios DAMI..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Iniciar MongoDB si no está corriendo
if ! pgrep -x "mongod" > /dev/null; then
    echo "Iniciando MongoDB..."
    sudo systemctl start mongod 2>/dev/null || mongod --fork --logpath /var/log/mongodb.log --dbpath /var/lib/mongodb 2>/dev/null
fi

# Iniciar Backend
echo "> Iniciando Backend DAMI (FastAPI)..."
cd backend
python3 server.py &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
sleep 5

# Iniciar Frontend
echo "> Iniciando Frontend DAMI (React)..."
cd frontend
yarn start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🚀 DAMI Centro Inteligente está ejecutándose:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8001"
echo ""
echo "Credenciales de demostración:"
echo "   Admin: luis / claveDAMI2025"
echo "   Admin: rovira / confidencial123"
echo "   Analista: castano / tactico456"
echo "   Analista: torres / vision789"
echo "   Operador: victoria / coordinacion321"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"

# Esperar a que terminen los procesos
wait
EOF

    chmod +x start_dami.sh
    print_success "Script de inicio creado: ./start_dami.sh"
}

# Función principal
main() {
    echo ""
    print_info "Iniciando instalación de DAMI Centro Inteligente..."
    echo ""
    
    check_dependencies
    echo ""
    
    install_backend
    echo ""
    
    install_frontend
    echo ""
    
    setup_environment
    echo ""
    
    init_database
    echo ""
    
    create_start_script
    echo ""
    
    print_success "¡Instalación completada exitosamente! 🎉"
    echo ""
    echo "==================================================="
    echo "🧠 DAMI Centro Inteligente - Listo para usar"
    echo "==================================================="
    echo ""
    echo "Para iniciar el sistema:"
    echo "  ./start_dami.sh"
    echo ""
    echo "O manualmente:"
    echo "  Backend:  cd backend && python3 server.py"
    echo "  Frontend: cd frontend && yarn start"
    echo ""
    echo "URLs del sistema:"
    echo "  🌐 Frontend: http://localhost:3000"
    echo "  🔧 Backend:  http://localhost:8001"
    echo "  📊 API Docs: http://localhost:8001/docs"
    echo ""
    echo "¡Disfruta usando DAMI Centro Inteligente! 🚀"
}

# Ejecutar instalación
main