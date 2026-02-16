// Mock Database - Dados fictícios para desenvolvimento
import { v4 as uuidv4 } from 'uuid';

// Tipos importados (simplificados para mock)
export type UserType = 'admin' | 'user' | 'agent' | 'viewer';
export type RegularizationStatus = 'regular' | 'irregular' | 'pending' | 'in_process' | 'blocked';
export type RuralPropertyType = 'farm' | 'sitio' | 'settlement' | 'indigenous_land' | 'environmental_reserve';
export type UrbanPropertyType = 'residential' | 'commercial' | 'industrial' | 'mixed' | 'vacant_lot';
export type StateCode = 'RJ' | 'ES' | 'SP' | 'MG' | 'BA' | 'RS' | 'PR' | 'SC';

// Interfaces
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  cpfCnpj: string;
  phone?: string;
  userType: UserType;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  dataProcessingConsent?: boolean;
  consentDate?: string | null;
  dataRetentionDate?: string | null;
}

export interface UserProfile {
  id: string;
  userId: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  state?: StateCode;
  zipCode?: string;
  professionalRegister?: string;
  specialization?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RuralProperty {
  id: string;
  ownerId: string;
  propertyName: string;
  propertyType: RuralPropertyType;
  totalAreaHectares: number;
  productiveAreaHectares?: number;
  state: StateCode;
  municipality: string;
  district?: string;
  coordinates?: { latitude: number; longitude: number };
  matriculaNumber?: string;
  incraCode?: string;
  carCode?: string;
  cafirCode?: string;
  sigefCode?: string;
  sncrCode?: string;
  regularizationStatus: RegularizationStatus;
  hasEnvironmentalLicense: boolean;
  hasWaterUsageGrant: boolean;
  isSettlementArea: boolean;
  mainActivity?: string;
  secondaryActivities?: string[];
  hasPermanentPreservationArea: boolean;
  ppaAreaHectares?: number;
  hasLegalReserve: boolean;
  legalReserveAreaHectares?: number;
  hasElectricity: boolean;
  hasWaterSupply: boolean;
  hasSewageSystem: boolean;
  accessRoadType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UrbanProperty {
  id: string;
  ownerId: string;
  propertyName?: string;
  propertyType: UrbanPropertyType;
  builtAreaM2?: number;
  landAreaM2: number;
  state: StateCode;
  municipality: string;
  neighborhood?: string;
  streetAddress: string;
  zipCode?: string;
  coordinates?: { latitude: number; longitude: number };
  matriculaNumber?: string;
  iptuRegistration?: string;
  buildingPermit?: string;
  habitationCertificate?: string;
  regularizationStatus: RegularizationStatus;
  reurb: {
    modalityType?: 'social' | 'specific';
    hasPossession: boolean;
    possessionTimeYears?: number;
    hasInfrastructure: boolean;
    hasUrbanServices: boolean;
    isInRiskArea: boolean;
    isInEnvironmentalProtectionArea: boolean;
  };
  hasElectricity: boolean;
  hasWaterSupply: boolean;
  hasSewageSystem: boolean;
  hasAsphaltedAccess: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock Data
export const mockUsers: User[] = [
  {
    id: 'b3d7d07b-0c53-43cc-ab21-ce9c11125103',
    email: 'admin@pgt-system.com',
    passwordHash: '$2a$10$oBV7fdhWfA3VsXgT0St7iuqld0Tu6tzpcMhF7le7In48T3tRqG6FG', // Hash bcrypt para 'admin123'
    fullName: 'Administrador do Sistema',
    cpfCnpj: '00000000000',
    phone: undefined,
    userType: 'admin',
    isActive: true,
    emailVerified: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    email: 'user@exemplo.com',
    passwordHash: '$2a$10$7GYJ1CPlOEu4N3L.WJcJ5O7/Z1SrAzV9QGz8yFzOdL.Lf2CzK9j8K', // Hash bcrypt para 'user123'
    fullName: 'João da Silva Santos',
    cpfCnpj: '98765432100',
    phone: '(27) 88888-8888',
    userType: 'user',
    isActive: true,
    emailVerified: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockUserProfiles: UserProfile[] = [
  {
    id: '1',
    userId: 'b3d7d07b-0c53-43cc-ab21-ce9c11125103',
    address: 'Rua das Palmeiras, 123',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '22071900',
    professionalRegister: 'OAB/RJ 123456',
    specialization: ['Direito Agrário', 'Direito Ambiental'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockRuralProperties: RuralProperty[] = [
  {
    id: '1',
    ownerId: '2',
    propertyName: 'Fazenda São José',
    propertyType: 'farm',
    totalAreaHectares: 125.50,
    productiveAreaHectares: 95.30,
    state: 'RJ',
    municipality: 'Campos dos Goytacazes',
    district: 'Santo Eduardo',
    coordinates: { latitude: -21.7648, longitude: -41.3262 },
    matriculaNumber: 'M-456789',
    carCode: 'RJ-1234567-89ABCDEF',
    cafirCode: 'RJ123456789',
    regularizationStatus: 'regular',
    hasEnvironmentalLicense: true,
    hasWaterUsageGrant: true,
    isSettlementArea: false,
    mainActivity: 'Pecuária Bovina',
    secondaryActivities: ['Cultivo de Cana-de-açúcar', 'Piscicultura'],
    hasPermanentPreservationArea: true,
    ppaAreaHectares: 12.5,
    hasLegalReserve: true,
    legalReserveAreaHectares: 25.1,
    hasElectricity: true,
    hasWaterSupply: true,
    hasSewageSystem: false,
    accessRoadType: 'estrada de terra',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    ownerId: '2',
    propertyName: 'Sítio Esperança',
    propertyType: 'farm',
    totalAreaHectares: 45.30,
    productiveAreaHectares: 32.80,
    state: 'ES',
    municipality: 'Linhares',
    coordinates: { latitude: -19.3911, longitude: -40.0719 },
    regularizationStatus: 'pending',
    hasEnvironmentalLicense: false,
    hasWaterUsageGrant: false,
    isSettlementArea: false,
    mainActivity: 'Cultivo de Café',
    hasPermanentPreservationArea: true,
    ppaAreaHectares: 5.2,
    hasLegalReserve: false,
    hasElectricity: true,
    hasWaterSupply: true,
    hasSewageSystem: false,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockUrbanProperties: UrbanProperty[] = [
  {
    id: '1',
    ownerId: '2',
    propertyName: 'Casa da Família Santos',
    propertyType: 'residential',
    builtAreaM2: 120,
    landAreaM2: 360,
    state: 'RJ',
    municipality: 'Nova Iguaçu',
    neighborhood: 'Centro',
    streetAddress: 'Rua Dr. Barros Franco, 456',
    zipCode: '26220080',
    coordinates: { latitude: -22.7591, longitude: -43.4509 },
    matriculaNumber: 'U-789123',
    iptuRegistration: 'IPTU-456789123',
    regularizationStatus: 'irregular',
    reurb: {
      modalityType: 'social',
      hasPossession: true,
      possessionTimeYears: 15,
      hasInfrastructure: true,
      hasUrbanServices: true,
      isInRiskArea: false,
      isInEnvironmentalProtectionArea: false,
    },
    hasElectricity: true,
    hasWaterSupply: true,
    hasSewageSystem: true,
    hasAsphaltedAccess: true,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export interface Diagnostic {
  id: string;
  ruralPropertyId?: string;
  urbanPropertyId?: string;
  diagnosticType: string;
  title: string;
  description?: string;
  overallStatus: RegularizationStatus;
  complianceScore?: number;
  issues: any;
  recommendations: any;
  requiredDocuments?: string[];
  estimatedCost?: number;
  estimatedTimelineDays?: number;
  generatedByAi: boolean;
  aiConfidenceScore?: number;
  aiModelVersion?: string;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  contextType?: string;
  ruralPropertyId?: string;
  urbanPropertyId?: string;
  messages: any;
  sessionSummary?: string;
  startedAt: string;
  endedAt?: string;
  totalMessages: number;
  createdAt: string;
  updatedAt: string;
}

export const mockDiagnostics: Diagnostic[] = [
  {
    id: '1',
    ruralPropertyId: '1',
    diagnosticType: 'environmental',
    title: 'Análise Ambiental - Fazenda São José',
    description: 'Diagnóstico completo das condições ambientais da propriedade',
    overallStatus: 'regular',
    complianceScore: 85.5,
    issues: {},
    recommendations: {},
    generatedByAi: true,
    aiConfidenceScore: 92.0,
    aiModelVersion: 'gpt-4-turbo',
    generatedBy: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockAIConversations: AIConversation[] = [
  {
    id: '1',
    userId: '2',
    contextType: 'rural_property',
    ruralPropertyId: '1',
    messages: [],
    totalMessages: 0,
    startedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Utility functions para simular operações de banco
export const createId = () => uuidv4();

export const mockDatabase = {
  users: mockUsers,
  userProfiles: mockUserProfiles,
  ruralProperties: mockRuralProperties,
  urbanProperties: mockUrbanProperties,
  diagnostics: mockDiagnostics,
  aiConversations: mockAIConversations,
};