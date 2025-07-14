# Lista Golden - Expo App con Supabase

Una aplicación móvil desarrollada con Expo y React Native que permite a los usuarios acceder a beneficios exclusivos en establecimientos de Argentina.

## 🚀 Características Principales

### 🔐 Autenticación Completa
- **Registro e inicio de sesión** con email y contraseña
- **Autenticación con Supabase** para seguridad robusta
- **Perfiles de usuario** con información personalizada
- **Gestión de sesiones** automática

### 🗺️ Mapa Interactivo
- **Mapa real de Argentina** con OpenStreetMap
- **Polígonos de provincias** coloreados según estado de activación
- **Geolocalización** del usuario
- **Controles de zoom** y navegación
- **Selección interactiva** de provincias

### 🏢 Sistema de Establecimientos
- **Base de datos real** con empresas y servicios
- **Categorización** por tipo de establecimiento
- **Horarios y servicios** detallados
- **Imágenes y promociones** de cada establecimiento
- **Sistema de reservas** y delivery

### 💳 Membresías por Provincia
- **Activación de provincias** con pago único
- **Gestión de beneficios** por ubicación
- **Seguimiento de ahorros** acumulados
- **Llaves digitales** para usar beneficios

## 🛠️ Tecnologías Utilizadas

- **Expo SDK 53** - Framework de desarrollo
- **React Native** - Desarrollo móvil multiplataforma
- **Supabase** - Backend como servicio
- **TypeScript** - Tipado estático
- **React Native Maps** - Mapas interactivos
- **Expo Router** - Navegación basada en archivos

## 📦 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd lista-golden-expo
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Supabase

#### Crear proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Obtén tu URL y clave anónima del proyecto

#### Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:
```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

#### Ejecutar migraciones
1. Ve a tu dashboard de Supabase
2. Navega a SQL Editor
3. Ejecuta el contenido de `supabase/migrations/001_initial_schema.sql`
4. Ejecuta el contenido de `supabase/migrations/002_sample_data.sql`

### 4. Ejecutar la aplicación
```bash
npm run dev
```

## 📱 Estructura del Proyecto

```
├── app/                    # Rutas de la aplicación
│   ├── (tabs)/            # Navegación por pestañas
│   ├── auth.tsx           # Pantalla de autenticación
│   └── index.tsx          # Pantalla de inicio
├── components/            # Componentes reutilizables
├── hooks/                 # Hooks personalizados
├── lib/                   # Configuración de librerías
├── supabase/             # Migraciones de base de datos
├── types/                # Definiciones de tipos
└── utils/                # Utilidades
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales
- **companies** - Establecimientos y empresas
- **provinces** - Provincias de Argentina
- **user_profiles** - Perfiles extendidos de usuarios
- **user_memberships** - Membresías activas por provincia
- **services** - Servicios ofrecidos por empresas
- **promotions** - Promociones y beneficios
- **schedules** - Horarios de atención

### Seguridad
- **Row Level Security (RLS)** habilitado en todas las tablas
- **Políticas de acceso** para proteger datos de usuarios
- **Autenticación JWT** con Supabase Auth

## 🔧 Funcionalidades Implementadas

### ✅ Autenticación
- [x] Registro con email y contraseña
- [x] Inicio de sesión
- [x] Gestión de perfiles de usuario
- [x] Cierre de sesión

### ✅ Mapa y Ubicaciones
- [x] Mapa interactivo de Argentina
- [x] Polígonos de provincias
- [x] Geolocalización
- [x] Controles de navegación

### ✅ Establecimientos
- [x] Lista de empresas por provincia
- [x] Detalles de establecimientos
- [x] Horarios y servicios
- [x] Sistema de imágenes

### ✅ Membresías
- [x] Activación de provincias
- [x] Gestión de beneficios
- [x] Seguimiento de ahorros

## 🚀 Próximas Funcionalidades

- [ ] Sistema de pagos con Stripe
- [ ] Notificaciones push
- [ ] Chat con establecimientos
- [ ] Sistema de reseñas
- [ ] Programa de referidos
- [ ] Integración con redes sociales

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes alguna pregunta o necesitas ayuda, puedes:

- Abrir un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de Supabase

---

**Lista Golden** - Tu llave a beneficios exclusivos en Argentina 🇦🇷