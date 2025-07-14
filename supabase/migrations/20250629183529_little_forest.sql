/*
  # Esquema inicial de Lista Golden

  1. Tablas principales
    - roles: Roles de usuario (empresa, cliente, admin)
    - provinces: Provincias de Argentina
    - days: Días de la semana
    - peoples: Información de personas
    - companies: Empresas/establecimientos
    - locations: Ubicaciones por provincia
    - memberships: Membresías de usuarios
    - services: Servicios ofrecidos por empresas
    - promotions: Promociones de servicios
    - schedules: Horarios de empresas
    - companies_images: Imágenes de empresas
    - user_profiles: Perfiles de usuario extendidos
    - user_memberships: Membresías activas de usuarios

  2. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas para acceso seguro a datos
*/

-- Crear tablas principales
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS provinces (
  id BIGSERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS days (
  id BIGSERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS peoples (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dni_identification VARCHAR(255) NOT NULL,
  is_foreign BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  short_description VARCHAR(255),
  long_description TEXT,
  with_reservation BOOLEAN DEFAULT FALSE,
  with_delivery BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id BIGSERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  province_id BIGINT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations_companies (
  id BIGSERIAL PRIMARY KEY,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  lat DECIMAL(10,7) NOT NULL,
  long DECIMAL(10,7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memberships (
  id BIGSERIAL PRIMARY KEY,
  location_id BIGINT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  people_id BIGINT NOT NULL REFERENCES peoples(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL,
  total_keys INTEGER NOT NULL,
  remaining_keys INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS keys_used_companies (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  membership_id BIGINT NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT FALSE,
  date_of_use DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotions (
  id BIGSERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  service_id BIGINT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedules (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  days_id BIGINT NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies_images (
  id BIGSERIAL PRIMARY KEY,
  file_url TEXT NOT NULL,
  company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tablas específicas para autenticación de Supabase
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  city TEXT,
  phone TEXT,
  profile_picture_url TEXT,
  accumulated_savings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  province_id BIGINT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, province_id)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE days ENABLE ROW LEVEL SECURITY;
ALTER TABLE peoples ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE keys_used_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas RLS para user_memberships
CREATE POLICY "Users can read own memberships"
  ON user_memberships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memberships"
  ON user_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memberships"
  ON user_memberships
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para tablas públicas (solo lectura)
CREATE POLICY "Anyone can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read provinces"
  ON provinces
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read days"
  ON days
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read locations"
  ON locations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read locations_companies"
  ON locations_companies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read services"
  ON services
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read promotions"
  ON promotions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read schedules"
  ON schedules
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read companies_images"
  ON companies_images
  FOR SELECT
  TO authenticated
  USING (true);

-- Insertar datos iniciales
INSERT INTO roles (description) VALUES 
  ('empresa'),
  ('cliente'),
  ('admin')
ON CONFLICT DO NOTHING;

INSERT INTO provinces (description) VALUES 
  ('Buenos Aires'),
  ('Catamarca'),
  ('Chaco'),
  ('Chubut'),
  ('Córdoba'),
  ('Corrientes'),
  ('Entre Ríos'),
  ('Formosa'),
  ('Jujuy'),
  ('La Pampa'),
  ('La Rioja'),
  ('Mendoza'),
  ('Misiones'),
  ('Neuquén'),
  ('Río Negro'),
  ('Salta'),
  ('San Juan'),
  ('San Luis'),
  ('Santa Cruz'),
  ('Santa Fe'),
  ('Santiago del Estero'),
  ('Tierra del Fuego'),
  ('Tucumán')
ON CONFLICT DO NOTHING;

INSERT INTO days (description) VALUES 
  ('Lunes'),
  ('Martes'),
  ('Miércoles'),
  ('Jueves'),
  ('Viernes'),
  ('Sábado'),
  ('Domingo')
ON CONFLICT DO NOTHING;