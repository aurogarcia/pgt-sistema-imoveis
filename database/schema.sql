-- Sistema de Gestão de Imóveis Rurais e Urbanos
-- Schema Principal PostgreSQL

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Enum para tipos de usuário
CREATE TYPE user_type AS ENUM ('admin', 'user', 'agent', 'viewer');

-- Enum para status de regularização
CREATE TYPE regularization_status AS ENUM ('regular', 'irregular', 'pending', 'in_process', 'blocked');

-- Enum para tipos de imóvel rural
CREATE TYPE rural_property_type AS ENUM ('farm', 'ranch', 'settlement', 'indigenous_land', 'environmental_reserve');

-- Enum para tipos de imóvel urbano
CREATE TYPE urban_property_type AS ENUM ('residential', 'commercial', 'industrial', 'mixed', 'vacant_lot');

-- Enum para estados brasileiros
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

-- Tabela de Perfis de Usuário (detalhes adicionais)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    avatar_url VARCHAR(500),
    address TEXT,
    city VARCHAR(100),
    state state_code,
    zip_code VARCHAR(10),
    professional_register VARCHAR(50), -- OAB, CREA, etc.
    specialization TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Imóveis Rurais
CREATE TABLE rural_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id),
    
    -- Dados básicos
    property_name VARCHAR(255) NOT NULL,
    property_type rural_property_type NOT NULL,
    total_area_hectares DECIMAL(12,4) NOT NULL,
    productive_area_hectares DECIMAL(12,4),
    
    -- Localização
    state state_code NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    coordinates GEOMETRY(POINT, 4326),
    polygon_coordinates GEOMETRY(POLYGON, 4326),
    
    -- Documentação
    matricula_number VARCHAR(100),
    incra_code VARCHAR(50),
    car_code VARCHAR(50), -- Cadastro Ambiental Rural
    cafir_code VARCHAR(50), -- Cadastro de Imóveis Rurais
    sigef_code VARCHAR(50), -- Sistema de Gestão Fundiária
    sncr_code VARCHAR(50), -- Sistema Nacional de Cadastro Rural
    
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

-- Tabela de Imóveis Urbanos
CREATE TABLE urban_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id),
    
    -- Dados básicos
    property_name VARCHAR(255),
    property_type urban_property_type NOT NULL,
    built_area_m2 DECIMAL(10,2),
    land_area_m2 DECIMAL(10,2) NOT NULL,
    
    -- Localização
    state state_code NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    street_address TEXT NOT NULL,
    zip_code VARCHAR(10),
    coordinates GEOMETRY(POINT, 4326),
    polygon_coordinates GEOMETRY(POLYGON, 4326),
    
    -- Documentação
    matricula_number VARCHAR(100),
    iptu_registration VARCHAR(50),
    building_permit VARCHAR(50),
    habite_se VARCHAR(50),
    
    -- REURB (Regularização Fundiária Urbana)
    reurb_modality VARCHAR(20), -- 'S' (Social) ou 'E' (Específica)
    reurb_status regularization_status DEFAULT 'pending',
    reurb_process_number VARCHAR(100),
    
    -- Características do imóvel
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

-- Tabela de Documentos (para ambos os tipos de imóveis)
CREATE TABLE property_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rural_property_id UUID REFERENCES rural_properties(id) ON DELETE CASCADE,
    urban_property_id UUID REFERENCES urban_properties(id) ON DELETE CASCADE,
    
    document_type VARCHAR(100) NOT NULL, -- 'escritura', 'certidao', 'planta', 'memorial', etc.
    document_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500),
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    document_date DATE,
    is_valid BOOLEAN DEFAULT true,
    
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: documento deve pertencer a um imóvel (rural OU urbano)
    CONSTRAINT property_document_check CHECK (
        (rural_property_id IS NOT NULL AND urban_property_id IS NULL) OR
        (rural_property_id IS NULL AND urban_property_id IS NOT NULL)
    )
);

-- Tabela de Diagnósticos/Relatórios
CREATE TABLE property_diagnostics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rural_property_id UUID REFERENCES rural_properties(id) ON DELETE CASCADE,
    urban_property_id UUID REFERENCES urban_properties(id) ON DELETE CASCADE,
    
    -- Informações do diagnóstico
    diagnostic_type VARCHAR(100) NOT NULL, -- 'IRTR', 'compliance', 'environmental', 'regularization'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Resultados do diagnóstico
    overall_status regularization_status NOT NULL,
    compliance_score DECIMAL(5,2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
    
    -- Issues encontradas (JSON)
    issues JSONB,
    recommendations JSONB,
    required_documents TEXT[],
    estimated_cost DECIMAL(12,2),
    estimated_timeline_days INTEGER,
    
    -- IA e automação
    generated_by_ai BOOLEAN DEFAULT false,
    ai_confidence_score DECIMAL(5,2) CHECK (ai_confidence_score >= 0 AND ai_confidence_score <= 100),
    ai_model_version VARCHAR(50),
    
    -- Metadata
    generated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: diagnóstico deve pertencer a um imóvel
    CONSTRAINT diagnostic_property_check CHECK (
        (rural_property_id IS NOT NULL AND urban_property_id IS NULL) OR
        (rural_property_id IS NULL AND urban_property_id IS NOT NULL)
    )
);

-- Tabela de Relatórios IRTR (Imposto sobre a Propriedade Territorial Rural)
CREATE TABLE irtr_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rural_property_id UUID NOT NULL REFERENCES rural_properties(id) ON DELETE CASCADE,
    
    -- Ano fiscal
    fiscal_year INTEGER NOT NULL,
    
    -- Valores calculados
    property_value_reais DECIMAL(15,2),
    tax_due_reais DECIMAL(12,2),
    tax_paid_reais DECIMAL(12,2) DEFAULT 0,
    
    -- Classificação da propriedade
    property_classification VARCHAR(50), -- 'pequena', 'média', 'grande'
    is_productive BOOLEAN,
    productivity_index DECIMAL(5,2),
    
    -- Dados para cálculo
    vtn_value DECIMAL(15,2), -- Valor da Terra Nua
    area_utilized_hectares DECIMAL(12,4),
    area_with_improvements_hectares DECIMAL(12,4),
    
    -- Status do pagamento
    payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'overdue', 'exempt'
    due_date DATE,
    payment_date DATE,
    
    -- Multas e juros
    fine_amount DECIMAL(12,2) DEFAULT 0,
    interest_amount DECIMAL(12,2) DEFAULT 0,
    
    -- Observações
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: ano fiscal único por propriedade
    UNIQUE (rural_property_id, fiscal_year)
);

-- Tabela de Processos de Regularização
CREATE TABLE regularization_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rural_property_id UUID REFERENCES rural_properties(id) ON DELETE CASCADE,
    urban_property_id UUID REFERENCES urban_properties(id) ON DELETE CASCADE,
    
    -- Identificação do processo
    process_number VARCHAR(100) UNIQUE,
    process_type VARCHAR(100) NOT NULL, -- 'car_registration', 'reurb', 'title_regularization', etc.
    
    -- Status do processo
    current_status VARCHAR(100) NOT NULL,
    status_history JSONB,
    
    -- Órgãos envolvidos
    responsible_agency VARCHAR(255),
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Datas importantes
    started_date DATE NOT NULL,
    expected_completion_date DATE,
    completed_date DATE,
    
    -- Custos e documentos
    estimated_cost DECIMAL(12,2),
    actual_cost DECIMAL(12,2),
    required_documents TEXT[],
    submitted_documents TEXT[],
    
    -- Observações
    notes TEXT,
    
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint: processo deve pertencer a um imóvel
    CONSTRAINT process_property_check CHECK (
        (rural_property_id IS NOT NULL AND urban_property_id IS NULL) OR
        (rural_property_id IS NULL AND urban_property_id IS NOT NULL)
    )
);

-- Tabela de Chat/Conversas com IA
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Contexto da conversa
    context_type VARCHAR(50), -- 'general', 'property_specific', 'diagnostic'
    rural_property_id UUID REFERENCES rural_properties(id),
    urban_property_id UUID REFERENCES urban_properties(id),
    
    -- Dados da conversa
    messages JSONB NOT NULL,
    session_summary TEXT,
    
    -- Metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    total_messages INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs de Auditoria (LGPD)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    -- Ação realizada
    action VARCHAR(100) NOT NULL, -- 'create', 'read', 'update', 'delete', 'export', 'login', etc.
    resource_type VARCHAR(100) NOT NULL, -- 'user', 'rural_property', 'urban_property', etc.
    resource_id UUID,
    
    -- Detalhes da ação
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configurações do Sistema
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA PERFORMANCE

-- Índices para usuários
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cpf_cnpj ON users(cpf_cnpj);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_active ON users(is_active);

-- Índices geoespaciais
CREATE INDEX idx_rural_properties_coordinates ON rural_properties USING GIST (coordinates);
CREATE INDEX idx_rural_properties_polygon ON rural_properties USING GIST (polygon_coordinates);
CREATE INDEX idx_urban_properties_coordinates ON urban_properties USING GIST (coordinates);
CREATE INDEX idx_urban_properties_polygon ON urban_properties USING GIST (polygon_coordinates);

-- Índices para propriedades rurais
CREATE INDEX idx_rural_properties_owner ON rural_properties(owner_id);
CREATE INDEX idx_rural_properties_state ON rural_properties(state);
CREATE INDEX idx_rural_properties_status ON rural_properties(regularization_status);
CREATE INDEX idx_rural_properties_car ON rural_properties(car_code);
CREATE INDEX idx_rural_properties_sigef ON rural_properties(sigef_code);

-- Índices para propriedades urbanas
CREATE INDEX idx_urban_properties_owner ON urban_properties(owner_id);
CREATE INDEX idx_urban_properties_state ON urban_properties(state);
CREATE INDEX idx_urban_properties_status ON urban_properties(regularization_status);
CREATE INDEX idx_urban_properties_reurb ON urban_properties(reurb_status);

-- Índices para diagnósticos
CREATE INDEX idx_diagnostics_rural_property ON property_diagnostics(rural_property_id);
CREATE INDEX idx_diagnostics_urban_property ON property_diagnostics(urban_property_id);
CREATE INDEX idx_diagnostics_type ON property_diagnostics(diagnostic_type);
CREATE INDEX idx_diagnostics_status ON property_diagnostics(overall_status);
CREATE INDEX idx_diagnostics_ai ON property_diagnostics(generated_by_ai);

-- Índices para relatórios IRTR
CREATE INDEX idx_irtr_reports_property ON irtr_reports(rural_property_id);
CREATE INDEX idx_irtr_reports_year ON irtr_reports(fiscal_year);
CREATE INDEX idx_irtr_reports_status ON irtr_reports(payment_status);

-- Índices para auditoria
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- TRIGGERS PARA UPDATED_AT

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para tabelas principais
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rural_properties_updated_at BEFORE UPDATE ON rural_properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_urban_properties_updated_at BEFORE UPDATE ON urban_properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_diagnostics_updated_at BEFORE UPDATE ON property_diagnostics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_irtr_reports_updated_at BEFORE UPDATE ON irtr_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regularization_processes_updated_at BEFORE UPDATE ON regularization_processes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- VIEWS ÚTEIS

-- View consolidada de propriedades (rural + urbano)
CREATE VIEW all_properties AS
SELECT 
    'rural' AS property_category,
    r.id,
    r.owner_id,
    r.property_name,
    r.state,
    r.municipality,
    r.regularization_status,
    r.created_at,
    r.updated_at,
    u.full_name AS owner_name,
    u.email AS owner_email
FROM rural_properties r
JOIN users u ON r.owner_id = u.id
UNION ALL
SELECT 
    'urban' AS property_category,
    ur.id,
    ur.owner_id,
    ur.property_name,
    ur.state,
    ur.municipality,
    ur.regularization_status,
    ur.created_at,
    ur.updated_at,
    u.full_name AS owner_name,
    u.email AS owner_email
FROM urban_properties ur
JOIN users u ON ur.owner_id = u.id;

-- View de estatísticas por estado
CREATE VIEW property_statistics_by_state AS
SELECT 
    state,
    COUNT(*) FILTER (WHERE property_category = 'rural') AS rural_count,
    COUNT(*) FILTER (WHERE property_category = 'urban') AS urban_count,
    COUNT(*) FILTER (WHERE regularization_status = 'regular') AS regular_count,
    COUNT(*) FILTER (WHERE regularization_status = 'irregular') AS irregular_count,
    COUNT(*) FILTER (WHERE regularization_status = 'pending') AS pending_count
FROM all_properties
GROUP BY state;

-- DADOS INICIAIS

-- Configurações padrão do sistema
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('ai_model_version', '"gpt-4-turbo"', 'Versão atual do modelo de IA utilizado'),
('irtr_calculation_year', '2026', 'Ano base para cálculos do IRTR'),
('max_file_upload_size', '10485760', 'Tamanho máximo para upload de arquivos (10MB)'),
('allowed_file_types', '["pdf", "jpg", "jpeg", "png", "doc", "docx"]', 'Tipos de arquivo permitidos para upload'),
('data_retention_days', '2555', 'Período de retenção de dados em dias (7 anos)');

-- Usuário administrador padrão (senha: admin123)
INSERT INTO users (email, password_hash, full_name, cpf_cnpj, user_type, is_active, email_verified) VALUES
('admin@pgt-system.com', '$2b$10$rOKB5KMkY3qOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4KOp4', 'Administrador do Sistema', '00000000000', 'admin', true, true);

-- Comentários das tabelas
COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema';
COMMENT ON TABLE user_profiles IS 'Perfis detalhados dos usuários com informações adicionais';
COMMENT ON TABLE rural_properties IS 'Cadastro de imóveis rurais com dados completos para regularização';
COMMENT ON TABLE urban_properties IS 'Cadastro de imóveis urbanos com foco em REURB';
COMMENT ON TABLE property_documents IS 'Armazenamento de documentos digitais dos imóveis';
COMMENT ON TABLE property_diagnostics IS 'Diagnósticos automatizados e manuais das propriedades';
COMMENT ON TABLE irtr_reports IS 'Relatórios específicos do Imposto Territorial Rural';
COMMENT ON TABLE regularization_processes IS 'Acompanhamento de processos de regularização';
COMMENT ON TABLE ai_conversations IS 'Histórico de conversas com IA para suporte aos usuários';
COMMENT ON TABLE audit_logs IS 'Logs de auditoria para compliance LGPD';
COMMENT ON TABLE system_settings IS 'Configurações gerais do sistema';

-- Índices compostos para consultas específicas
CREATE INDEX idx_properties_owner_status ON rural_properties(owner_id, regularization_status);
CREATE INDEX idx_urban_properties_owner_status ON urban_properties(owner_id, regularization_status);
CREATE INDEX idx_diagnostics_property_type ON property_diagnostics(rural_property_id, urban_property_id, diagnostic_type);