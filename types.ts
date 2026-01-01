export enum ValidationStatus {
  PENDING = 'pendente',
  APPROVED = 'aprovado',
  REJECTED = 'rejeitado'
}

export enum UserRole {
  ADMIN = 'admin',
  MEMBER = 'membro'
}

export interface Company {
  id: string;
  nif: string;
  nome_fantasia: string;
  setor: string;
  status_validacao: ValidationStatus;
  data_aprovacao?: string; // ISO Date
  // Profile Fields
  logo?: string; // Base64 or URL
  address?: string;
  phone?: string;
  description?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company_id: string;
}

export interface TermsAcceptance {
  usuario_id: string;
  versao_termos: string;
  data_aceite: string; // ISO Date
  ip_endereco: string;
}

export interface SessionData {
  user: User;
  company: Company;
  terms?: TermsAcceptance | null;
}

// Mock Types for Forms
export interface RegistrationData {
  nif: string;
  nome_fantasia: string;
  setor: string;
  email: string;
  name: string;
}