// Inicialización de la base de datos MongoDB para DAMI
// Este script se ejecuta automáticamente al crear el contenedor

// Crear base de datos DAMI
db = db.getSiblingDB('dami_database');

// Crear usuario administrativo
db.createUser({
  user: 'dami_admin',
  pwd: 'dami_secure_password_2025',
  roles: [
    {
      role: 'readWrite',
      db: 'dami_database'
    }
  ]
});

// Crear colecciones iniciales
db.createCollection('users');
db.createCollection('political_actors');
db.createCollection('territorial_zones');
db.createCollection('social_media_posts');
db.createCollection('ai_recommendations');
db.createCollection('alerts');
db.createCollection('chat_messages');

// Insertar usuarios iniciales
db.users.insertMany([
  {
    id: 'admin-001',
    username: 'luis',
    hashed_password: '$2b$12$K8.V8iDvBmKxZ5Y3xQ.XDOHQr7P9QqN7rE5mF6hI3bJ2cA1dF0gH6',
    role: 'administrator',
    created_at: new Date(),
    is_active: true
  },
  {
    id: 'admin-002', 
    username: 'rovira',
    hashed_password: '$2b$12$L9.W9jEvCnLyA6Z4yR.YEPIRs8Q0RrO8sF6nG7iJ4cK3dB2eG1hI7',
    role: 'administrator',
    created_at: new Date(),
    is_active: true
  },
  {
    id: 'analyst-001',
    username: 'castano', 
    hashed_password: '$2b$12$M0.X0kFwDoMzB7A5zS.ZFQJSt9R1SsP9tG7oH8jK5dL4eC3fH2iJ8',
    role: 'analyst',
    created_at: new Date(),
    is_active: true
  },
  {
    id: 'analyst-002',
    username: 'torres',
    hashed_password: '$2b$12$N1.Y1lGxEpN0C8B6AS.AGRKTu0S2TtQ0uH8pI9kL6eM5fD4gI3jK9',
    role: 'analyst', 
    created_at: new Date(),
    is_active: true
  },
  {
    id: 'operator-001',
    username: 'victoria',
    hashed_password: '$2b$12$O2.Z2mHyFqO1D9C7BT.BHSLUv1T3UuR1vI9qJ0lM7fN6gE5hJ4kL0',
    role: 'operator',
    created_at: new Date(), 
    is_active: true
  }
]);

// Insertar actores políticos iniciales
db.political_actors.insertMany([
  {
    id: 'actor-001',
    name: 'Carlos Rovira',
    status: 'roja',
    activity_description: 'Actividad Crítica',
    social_media_handle: '@CarlosRovira',
    keywords: ['rovira', 'crítica', 'ataque'],
    influence_score: 95,
    last_update: new Date()
  },
  {
    id: 'actor-002',
    name: 'Diego Harfield', 
    status: 'naranja',
    activity_description: 'Ataque discursivo',
    social_media_handle: '@DiegoHarfield',
    keywords: ['harfield', 'ataque', 'discurso'],
    influence_score: 75,
    last_update: new Date()
  },
  {
    id: 'actor-003',
    name: 'Hugo Passalacqua',
    status: 'verde',
    activity_description: 'Discurso neutro', 
    social_media_handle: '@HugoPassalacqua',
    keywords: ['passalacqua', 'neutro', 'gobierno'],
    influence_score: 60,
    last_update: new Date()
  }
]);

// Insertar zonas territoriales iniciales
db.territorial_zones.insertMany([
  {
    id: 'zone-001',
    name: 'Zona Sur',
    status: 'roja',
    activity_level: 90,
    description: 'Alta tensión política',
    last_update: new Date()
  },
  {
    id: 'zone-002',
    name: 'Puerto Rico',
    status: 'amarilla', 
    activity_level: 60,
    description: 'Actividad moderada',
    last_update: new Date()
  },
  {
    id: 'zone-003',
    name: 'Eldorado',
    status: 'verde',
    activity_level: 30,
    description: 'Zona estable',
    last_update: new Date()
  },
  {
    id: 'zone-004', 
    name: 'San Vicente',
    status: 'naranja',
    activity_level: 75,
    description: 'Tensión creciente',
    last_update: new Date()
  }
]);

// Crear índices para optimizar consultas
db.users.createIndex({ username: 1 }, { unique: true });
db.political_actors.createIndex({ name: 1 });
db.territorial_zones.createIndex({ name: 1 });
db.social_media_posts.createIndex({ timestamp: -1 });
db.ai_recommendations.createIndex({ timestamp: -1 });
db.alerts.createIndex({ timestamp: -1 });

print('✅ Base de datos DAMI inicializada correctamente');
print('📊 Usuarios creados: 5');
print('🎭 Actores políticos: 3'); 
print('🗺️  Zonas territoriales: 4');
print('🧠 Sistema DAMI listo para usar');