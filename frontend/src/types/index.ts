// Tipos de usuário
export type UserType = 'admin' | 'user' | 'agent' | 'viewer';

export interface User {
  id: string;
  email: string;
  fullName: string;
  cpfCnpj: string;
  phone?: string;
  userType: UserType;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  profile?: UserProfile;
}

export interface UserProfile {
  avatarUrl?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  professionalRegister?: string;
  specialization?: string[];
}

// Tipos de autenticação
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  cpfCnpj: string;
  phone?: string;
  dataProcessingConsent: boolean;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

// Tipos de propriedades
export type PropertyType = 'rural' | 'urban';
export type RegularizationStatus = 'regular' | 'irregular' | 'pending' | 'in_process' | 'blocked';
export type RuralPropertyType = 'farm' | 'sitio' | 'settlement' | 'indigenous_land' | 'environmental_reserve';
export type UrbanPropertyType = 'residential' | 'commercial' | 'industrial' | 'mixed' | 'vacant_lot';
export type StateCode = 'RJ' | 'ES' | 'SP' | 'MG' | 'BA' | 'RS' | 'PR' | 'SC' | 'GO' | 'MT' | 'MS' | 'TO' | 'AC' | 'RO' | 'AM' | 'RR' | 'PA' | 'AP' | 'MA' | 'PI' | 'CE' | 'RN' | 'PB' | 'PE' | 'AL' | 'SE' | 'DF';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BaseProperty {
  id: string;
  ownerId: string;
  propertyName?: string;
  state: StateCode;
  municipality: string;
  coordinates?: Coordinates;
  regularizationStatus: RegularizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RuralProperty extends BaseProperty {
  propertyType: RuralPropertyType;
  totalAreaHectares: number;
  productiveAreaHectares?: number;
  district?: string;
  matriculaNumber?: string;
  incraCode?: string;
  carCode?: string;
  cafirCode?: string;
  sigefCode?: string;
  sncrCode?: string;
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
}

export interface UrbanProperty extends BaseProperty {
  propertyType: UrbanPropertyType;
  builtAreaM2?: number;
  landAreaM2: number;
  neighborhood?: string;
  streetAddress: string;
  zipCode?: string;
  matriculaNumber?: string;
  iptuRegistration?: string;
  buildingPermit?: string;
  habiteSe?: string;
  reurbModality?: 'S' | 'E';
  reurbStatus?: RegularizationStatus;
  reurbProcessNumber?: string;
  constructionYear?: number;
  floorsCount: number;
  roomsCount?: number;
  bathroomsCount?: number;
  parkingSpaces: number;
  hasElectricity: boolean;
  hasWaterSupply: boolean;
  hasSewageSystem: boolean;
  hasGarbageCollection: boolean;
  hasPaving: boolean;
  hasSidewalk: boolean;
  hasStreetLighting: boolean;
  isSocialInterestArea: boolean;
}

// Tipos de diagnóstico
export type DiagnosticType = 'IRTR' | 'compliance' | 'environmental' | 'regularization';

export interface PropertyDiagnostic {
  id: string;
  ruralPropertyId?: string;
  urbanPropertyId?: string;
  diagnosticType: DiagnosticType;
  title: string;
  description?: string;
  overallStatus: RegularizationStatus;
  complianceScore?: number;
  issues?: Record<string, any>;
  recommendations?: Record<string, any>;
  requiredDocuments?: string[];
  estimatedCost?: number;
  estimatedTimelineDays?: number;
  generatedByAi: boolean;
  aiConfidenceScore?: number;
  aiModelVersion?: string;
  generatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de relatório IRTR
export interface IRTRReport {
  id: string;
  ruralPropertyId: string;
  fiscalYear: number;
  propertyValueReais?: number;
  taxDueReais?: number;
  taxPaidReais: number;
  propertyClassification?: string;
  isProductive?: boolean;
  productivityIndex?: number;
  vtnValue?: number;
  areaUtilizedHectares?: number;
  areaWithImprovementsHectares?: number;
  paymentStatus: string;
  dueDate?: string;
  paymentDate?: string;
  fineAmount: number;
  interestAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Tipos de conversa com IA
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  contextType?: string;
  ruralPropertyId?: string;
  urbanPropertyId?: string;
  messages: AIMessage[];
  sessionSummary?: string;
  startedAt: string;
  endedAt?: string;
  totalMessages: number;
}

// Tipos de API
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos de dashboard
export interface DashboardStats {
  totalRuralProperties: number;
  totalUrbanProperties: number;
  regularProperties: number;
  irregularProperties: number;
  pendingDiagnostics: number;
  overdueIRTR: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'property_created' | 'diagnostic_completed' | 'irtr_generated' | 'status_changed';
  title: string;
  description: string;
  timestamp: string;
  propertyId?: string;
  propertyName?: string;
}

// Tipos de estatísticas comparativas
export interface StateComparison {
  state: StateCode;
  totalProperties: number;
  regularProperties: number;
  irregularProperties: number;
  complianceRate: number;
}

// Tipos de formulário
export interface FormFieldError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiError {
  error: string;
  code: string;
  details?: FormFieldError[];
  timestamp?: string;
  path?: string;
  method?: string;
}