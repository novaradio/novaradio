#!/bin/bash

# DAMI Centro Inteligente - Script de Inicio Rápido
# ================================================

echo "🧠 DAMI - Centro de Inteligencia Política Digital"
echo "=================================================="

# Función para manejar Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios DAMI..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servicios detenidos correctamente"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Verificar dependencias
check_mongodb() {
    if pgrep -x "mongod" > /dev/null; then
        echo "✅ MongoDB está ejecutándose"
    else
        echo "🔄 Iniciando MongoDB..."
        sudo systemctl start mongod 2>/dev/null || mongod --fork --logpath /tmp/mongodb.log --dbpath /tmp/mongodb-data 2>/dev/null
        sleep 2
        if pgrep -x "mongod" > /dev/null; then
            echo "✅ MongoDB iniciado correctamente"
        else
            echo "❌ Error: No se pudo iniciar MongoDB"
            exit 1
        fi
    fi
}

# Iniciar servicios
start_services() {
    echo ""
    echo "🚀 Iniciando servicios DAMI..."
    echo ""
    
    # Backend
    echo "📡 Iniciando Backend DAMI (FastAPI)..."
    cd backend
    python3 server.py > /tmp/dami-backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Esperar a que el backend esté listo
    echo "⏳ Esperando a que el backend esté listo..."
    sleep 8
    
    # Verificar que el backend esté funcionando
    if curl -s http://localhost:8001/api/ > /dev/null; then
        echo "✅ Backend listo en http://localhost:8001"
    else
        echo "❌ Error: Backend no responde"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
    
    # Frontend
    echo "🌐 Iniciando Frontend DAMI (React)..."
    cd frontend
    yarn start > /tmp/dami-frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    echo "⏳ Preparando interfaz de usuario..."
    sleep 10
}

# Mostrar información del sistema
show_info() {
    echo ""
    echo "🎉 ¡DAMI Centro Inteligente está ejecutándose!"
    echo ""
    echo "📱 URLs del Sistema:"
    echo "   🌐 Frontend: http://localhost:3000"
    echo "   🔧 Backend:  http://localhost:8001"
    echo "   📊 API Docs: http://localhost:8001/docs"
    echo ""
    echo "👥 Credenciales de Demostración:"
    echo "   🛡️  Admin:    luis / claveDAMI2025"
    echo "   🛡️  Admin:    rovira / confidencial123"
    echo "   📊 Analista: castano / tactico456"
    echo "   📊 Analista: torres / vision789"
    echo "   ⚡ Operador: victoria / coordinacion321"
    echo ""
    echo "🤖 Características Principales:"
    echo "   • Radar de Actores Políticos en Tiempo Real"
    echo "   • Mapa de Calor Territorial Inteligente"
    echo "   • Monitoreo de Redes Sociales (Sr. X)"
    echo "   • IA Táctica con Recomendaciones Automáticas"
    echo "   • DAMIBOT - Asistente Inteligente Emergente"
    echo "   • Sistema Multi-Rol con Permisos Granulares"
    echo ""
    echo "📊 Estado de Servicios:"
    echo "   🟢 MongoDB: Activo"
    echo "   🟢 Backend: Activo (PID: $BACKEND_PID)"
    echo "   🟢 Frontend: Activo (PID: $FRONTEND_PID)"
    echo ""
    echo "ℹ️  Presiona Ctrl+C para detener todos los servicios"
    echo "ℹ️  Los logs se guardan en /tmp/dami-*.log"
    echo ""
    echo "🎯 ¡Disfruta usando DAMI Centro Inteligente!"
    echo ""
}

# Función principal
main() {
    check_mongodb
    start_services
    show_info
    
    # Mantener el script ejecutándose
    while true; do
        sleep 1
        
        # Verificar que los procesos sigan corriendo
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            echo "❌ Backend se detuvo inesperadamente"
            cleanup
        fi
        
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            echo "❌ Frontend se detuvo inesperadamente"
            cleanup
        fi
    done
}

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Ejecutar desde el directorio raíz del proyecto DAMI"
    echo "   Debe contener las carpetas 'backend' y 'frontend'"
    exit 1
fi

# Ejecutar función principal
main