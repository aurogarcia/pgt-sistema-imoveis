-- Schema Simplificado SEM PostGIS (para começar)
-- Sistema de Gestão de Imóveis Rurais e Urbanos

-- Extensões básicas (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para tipos de usuário (PostgreSQL)
CREATE TYPE user_type AS ENUM ('admin', 'user', 'agent', 'viewer');

-- Enum para status de regularização (PostgreSQL)
CREATE TYPE regularization_status AS ENUM ('regular', 'irregular', 'pending', 'in_process', 'blocked');

-- Enum para tipos de imóvel rural (PostgreSQL)
CREATE TYPE rural_property_type AS ENUM ('farm', 'ranch', 'settlement', 'indigenous_land', 'environmental_reserve');

-- Enum para tipos de imóvel urbano (PostgreSQL)
CREATE TYPE urban_property_type AS ENUM ('residential', 'commercial', 'industrial', 'mixed', 'vacant_lot');

-- Enum para estados brasileiros (PostgreSQL)
CREATE TYPE state_code AS ENUM ('RJ', 'ES', 'SP', 'MG', 'BA', 'RS', 'PR', 'SC', 'GO', 'MT', 'MS', 'TO', 'AC', 'RO', 'AM', 'RR', 'PA', 'AP', 'MA', 'PI', 'CE', 'RN', 'PB', 'PE', 'AL', 'SE', 'DF');

-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    phone VARCHAR(20),
    user_type user_type DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Auditoria LGPD
    data_processing_consent BOOLEAN DEFAULT false,
    consent_date TIMESTAMP WITH TIME ZONE,
    data_retention_date TIMESTAMP WITH TIME ZONE
);

-- Tabela de Perfis de Usuário
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_url VARCHAR(500),
    address TEXT,
    city VARCHAR(100),
    state state_code,
    zip_code VARCHAR(10),
    professional_register VARCHAR(50),
    specialization TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Imóveis Rurais (SEM PostGIS)
CREATE TABLE rural_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id),
    
    -- Dados básicos
    property_name VARCHAR(255) NOT NULL,
    property_type rural_property_type NOT NULL,
    total_area_hectares DECIMAL(12,4) NOT NULL,
    productive_area_hectares DECIMAL(12,4),
    
    -- Localização (SEM GEOMETRY)
    state state_code NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Documentação
    matricula_number VARCHAR(100),
    incra_code VARCHAR(50),
    car_code VARCHAR(50),
    cafir_code VARCHAR(50),
    sigef_code VARCHAR(50),
    sncr_code VARCHAR(50),
    
    -- Status e regularização
    regularization_status regularization_status DEFAULT 'pending',
    has_environmental_license BOOLEAN DEFAULT false,
    has_water_usage_grant BOOLEAN DEFAULT false,
    is_settlement_area BOOLEAN DEFAULT false,
    
    -- Uso da terra
    main_activity VARCHAR(255),
    secondary_activities TEXT[],
    has_permanent_preservation_area BOOLEAN DEFAULT false,
    ppa_area_hectares DECIMAL(10,4),
    has_legal_reserve BOOLEAN DEFAULT false,
    legal_reserve_area_hectares DECIMAL(10,4),
    
    -- Infraestrutura
    has_electricity BOOLEAN DEFAULT false,
    has_water_supply BOOLEAN DEFAULT false,
    has_sewage_system BOOLEAN DEFAULT false,
    access_road_type VARCHAR(50),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_areas CHECK (
        productive_area_hectares <= total_area_hectares AND
        ppa_area_hectares <= total_area_hectares AND
        legal_reserve_area_hectares <= total_area_hectares
    )
);

-- Tabela de Imóveis Urbanos (SEM PostGIS)
CREATE TABLE urban_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id),
    
    -- Dados básicos
    property_name VARCHAR(255),
    property_type urban_property_type NOT NULL,
    built_area_m2 DECIMAL(10,2),
    land_area_m2 DECIMAL(10,2) NOT NULL,
    
    -- Localização (SEM GEOMETRY)
    state state_code NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    street_address TEXT NOT NULL,
    zip_code VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Documentação
    matricula_number VARCHAR(100),
    iptu_registration VARCHAR(50),
    building_permit VARCHAR(50),
    habite_se VARCHAR(50),
    
    -- REURB
    reurb_modality VARCHAR(20),
    reurb_status regularization_status DEFAULT 'pending',
    reurb_process_number VARCHAR(100),
    
    -- Características
    construction_year INTEGER,
    floors_count INTEGER DEFAULT 1,
    rooms_count INTEGER,
    bathrooms_count INTEGER,
    parking_spaces INTEGER DEFAULT 0,
    
    -- Infraestrutura urbana
    has_electricity BOOLEAN DEFAULT false,
    has_water_supply BOOLEAN DEFAULT false,
    has_sewage_system BOOLEAN DEFAULT false,
    has_garbage_collection BOOLEAN DEFAULT false,
    has_paving BOOLEAN DEFAULT false,
    has_sidewalk BOOLEAN DEFAULT false,
    has_street_lighting BOOLEAN DEFAULT false,
    
    -- Regularização
    regularization_status regularization_status DEFAULT 'pending',
    is_social_interest_area BOOLEAN DEFAULT false,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_urban_areas CHECK (built_area_m2 <= land_area_m2)
);

-- Restante das tabelas...
CREATE TABLE property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rural_property_id UUID REFERENCES rural_properties(id) ON DELETE CASCADE,
    urban_property_id UUID REFERENCES urban_properties(id) ON DELETE CASCADE,
    
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    document_date DATE,
    is_valid BOOLEAN DEFAULT true,
    
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT property_document_check CHECK (
        (rural_property_id IS NOT NULL AND urban_property_id IS NULL) OR
        (rural_property_id IS NULL AND urban_property_id IS NOT NULL)
    )
);

CREATE TABLE property_diagnostics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rural_property_id UUID REFERENCES rural_properties(id) ON DELETE CASCADE,
    urban_property_id UUID REFERENCES urban_properties(id) ON DELETE CASCADE,
    
    diagnostic_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    overall_status regularization_status NOT NULL,
    compliance_score DECIMAL(5,2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
    
    issues JSONB,
    recommendations JSONB,
    required_documents TEXT[],
    estimated_cost DECIMAL(12,2),
    estimated_timeline_days INTEGER,
    
    generated_by_ai BOOLEAN DEFAULT false,
    ai_confidence_score DECIMAL(5,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100),
    ai_model_version VARCHAR(50),
    
    generated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT diagnostic_property_check CHECK (
        (rural_property_id IS NOT NULL AND urban_property_id IS NULL) OR
        (rural_property_id IS NULL AND urban_property_id IS NOT NULL)
    )
);

CREATE TABLE irtr_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rural_property_id UUID NOT NULL REFERENCES rural_properties(id) ON DELETE CASCADE,
    
    fiscal_year INTEGER NOT NULL,
    
    property_value_reais DECIMAL(15,2),
    tax_due_reais DECIMAL(12,2),
    tax_paid_reais DECIMAL(12,2) DEFAULT 0,
    
    property_classification VARCHAR(50),
    is_productive BOOLEAN,
    productivity_index DECIMAL(5,2),
    
    vtn_value DECIMAL(15,2),
    area_utilized_hectares DECIMAL(12,4),
    area_with_improvements_hectares DECIMAL(12,4),
    
    payment_status VARCHAR(50) DEFAULT 'pending',
    due_date DATE,
    payment_date DATE,
    
    fine_amount DECIMAL(12,2) DEFAULT 0,
    interest_amount DECIMAL(12,2) DEFAULT 0,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (rural_property_id, fiscal_year)
);

CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    context_type VARCHAR(50),
    rural_property_id UUID REFERENCES rural_properties(id),
    urban_property_id UUID REFERENCES urban_properties(id),
    
    messages JSONB NOT NULL,
    session_summary TEXT,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    total_messages INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf_cnpj ON users(cpf_cnpj);
CREATE INDEX idx_rural_properties_owner ON rural_properties(owner_id);
CREATE INDEX idx_urban_properties_owner ON urban_properties(owner_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rural_properties_updated_at BEFORE UPDATE ON rural_properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_urban_properties_updated_at BEFORE UPDATE ON urban_properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DADOS INICIAIS
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('ai_model_version', '"gpt-4-turbo"', 'Versão atual do modelo de IA'),
('max_file_upload_size', '10485760', 'Tamanho máximo para upload');

-- Usuário admin padrão (senha: admin123)
-- Hash bcrypt para 'admin123': $2b$10$rOKB5KMkY3qOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4
INSERT INTO users (email, password_hash, full_name, cpf_cnpj, user_type, is_active, email_verified, data_processing_consent, consent_date) VALUES
('admin@pgt-system.com', '$2b$10$rOKB5KMkY3qOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4', 'Administrador do Sistema', '00000000000', 'admin', true, true, true, CURRENT_TIMESTAMP);

-- Comentários
COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema';
COMMENT ON TABLE rural_properties IS 'Cadastro de imóveis rurais';
COMMENT ON TABLE urban_properties IS 'Cadastro de imóveis urbanos';

ANALYZE;