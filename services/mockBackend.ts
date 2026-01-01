import { Company, SessionData, User, UserRole, ValidationStatus, RegistrationData, TermsAcceptance } from '../types';

// ============================================================================
// CONFIGURAÇÃO CENTRAL (ENV VARS)
// ============================================================================

// Tenta ler do arquivo .env (VITE_USE_REAL_API=true)
// Se não existir, usa 'false' como padrão (Modo Mock / LocalStorage)
const VITE_ENV = (import.meta as ImportMeta).env || {};
const ENV_USE_REAL_API =
  (VITE_ENV.VITE_USE_REAL_API ?? process.env.REACT_APP_USE_REAL_API) === 'true';

// Se quiser forçar manualmente no código, altere esta linha para true/false ignorando o .env
const FORCE_MANUAL_OVERRIDE: boolean | null = null; 

const USE_REAL_API = FORCE_MANUAL_OVERRIDE !== null ? FORCE_MANUAL_OVERRIDE : ENV_USE_REAL_API;

const API_CONFIG = {
  // Lê a URL do .env ou usa o localhost padrão
  // NOTA: O Frontend só precisa saber a URL da API.
  // As credenciais do Banco de Dados (DB_HOST, DB_PASS) ficam APENAS no servidor Backend.
 codex/review-project-and-provide-feedback-8g3oj9
  // Variáveis suportadas: VITE_API_URL (Vite) e REACT_APP_API_URL (legado).

 codex/review-project-and-provide-feedback-g8yxq9
 main
  BASE_URL:
    VITE_ENV.VITE_API_URL ||
    process.env.REACT_APP_API_URL ||
    'http://localhost:3001/api',
codex/review-project-and-provide-feedback-8g3oj9


  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
main
 main
  TIMEOUT: 5000
};

console.log(`[System Init] Mode: ${USE_REAL_API ? 'REAL BACKEND (DB)' : 'MOCK (LocalStorage)'}`);

// ============================================================================
// DOCUMENTAÇÃO PARA O DESENVOLVEDOR DO BACKEND (DB)
// ============================================================================
/*
  Se você estiver implementando o Backend (Node/Python/Go) para conectar ao Banco de Dados,
  estas são as rotas que este Frontend espera que existam:

  1. POST /auth/login
     - Body: { email: string } (Adicionar password em produção)
     - Response: { user: User, company: Company, terms: TermsAcceptance | null, token: string }
  
  2. POST /auth/register
     - Body: { nif, nome_fantasia, setor, email, name }
     - DB Action: INSERT INTO users...; INSERT INTO companies...;
     - Response: { user: User, company: Company, token: string }

  3. GET /users/me/company
     - Header: Authorization: Bearer <token>
     - DB Action: SELECT * FROM companies WHERE id = (SELECT company_id FROM users WHERE id = :userId)
     - Response: Company (JSON)

  4. POST /terms/accept
     - Header: Authorization: Bearer <token>
     - Body: { versao_termos: string }
     - DB Action: INSERT INTO terms_acceptance (user_id, versao, ip, data) VALUES (...)
     - Response: TermsAcceptance (JSON)

  5. PATCH /companies/:id
     - Header: Authorization: Bearer <token>
     - Body: { address, phone, description, logo? }
     - DB Action: UPDATE companies SET ... WHERE id = :id
     - Response: Company (Updated JSON)

  6. GET /admin/companies
     - Header: Authorization: Bearer <token> (Validar se user.role == 'admin')
     - Response: Array<Company>

  7. POST /admin/companies/:id/approve
     - Header: Authorization: Bearer <token> (Validar se user.role == 'admin')
     - DB Action: UPDATE companies SET status_validacao = 'aprovado', data_aprovacao = NOW() WHERE id = :id

  8. POST /admin/companies/:id/revoke
     - Header: Authorization: Bearer <token> (Validar se user.role == 'admin')
     - DB Action: UPDATE companies SET status_validacao = 'pendente' WHERE id = :id
*/

// ============================================================================
// CLIENTE HTTP (REAL API)
// ============================================================================

const getAuthToken = () => localStorage.getItem('auth_token');
const setAuthToken = (token: string) => localStorage.setItem('auth_token', token);

const apiRequest = async <T>(endpoint: string, method: string, body?: any): Promise<T> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const config: RequestInit = {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, config);
    
    // Tratamento de Erros HTTP
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('auth_token');
        localStorage.removeItem('session_user_email');
        window.location.reload();
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Erro na API (${response.status})`);
    }

    // Se a resposta for 204 No Content, retorna null
    if (response.status === 204) return null as T;

    return await response.json();
  } catch (error) {
    console.error(`API Request Failed [${method} ${endpoint}]:`, error);
    throw error;
  }
};

// ============================================================================
// MOCK DATABASE (LOCAL STORAGE)
// ============================================================================

const STORAGE_KEY = 'corporate_guard_db';
const CURRENT_TERMS_VERSION = 'v1.0';

const initMockDB = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    const initialData = {
      users: [] as User[],
      companies: [] as Company[],
      terms: [] as TermsAcceptance[],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  }
};

const getMockDB = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
const saveMockDB = (data: any) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

// ============================================================================
// SERVICE METHODS (PUBLIC INTERFACE)
// ============================================================================

// --- 1. Autenticação e Registro ---

export const registerCompany = async (data: RegistrationData): Promise<SessionData> => {
  if (USE_REAL_API) {
    // Backend: Criar User, Company e retornar Token JWT + SessionData
    const response = await apiRequest<SessionData & { token: string }>('/auth/register', 'POST', data);
    if (response.token) setAuthToken(response.token);
    return response; 
  }

  // --- MOCK ---
  await new Promise(r => setTimeout(r, 800));
  initMockDB();
  const db = getMockDB();

  // Check duplicate
  if (db.users.find((u: User) => u.email === data.email)) throw new Error("Email já registado");
  if (db.companies.find((c: Company) => c.nif === data.nif)) throw new Error("NIF já registado");

  const companyId = `comp_${Date.now()}`;
  const userId = `user_${Date.now()}`;

  const newCompany: Company = {
    id: companyId,
    nif: data.nif,
    nome_fantasia: data.nome_fantasia,
    setor: data.setor,
    status_validacao: ValidationStatus.PENDING
  };

  const newUser: User = {
    id: userId,
    name: data.name,
    email: data.email,
    role: UserRole.ADMIN,
    company_id: companyId
  };

  db.companies.push(newCompany);
  db.users.push(newUser);
  saveMockDB(db);

  return { user: newUser, company: newCompany, terms: null };
};

export const login = async (email: string): Promise<SessionData> => {
  if (USE_REAL_API) {
    // Backend: Validar credenciais e retornar Token JWT + SessionData
    // Nota: Em produção, envie password também. Aqui mantemos simplificado pelo fluxo atual.
    const response = await apiRequest<SessionData & { token: string }>('/auth/login', 'POST', { email });
    if (response.token) setAuthToken(response.token);
    return response;
  }

  // --- MOCK ---
  await new Promise(r => setTimeout(r, 600));
  initMockDB();
  const db = getMockDB();

  // Hardcoded Sys Admin
  if (email === 'admin@system.com') {
      const sysAdmin: User = {
          id: 'sys_admin',
          name: 'System Administrator',
          email: 'admin@system.com',
          role: UserRole.ADMIN,
          company_id: 'sys_corp'
      };
      return { 
        user: sysAdmin, 
        company: { id: 'sys', nif: '000', nome_fantasia: 'System', setor: 'Tech', status_validacao: ValidationStatus.APPROVED }, 
        terms: null 
      };
  }

  const user = db.users.find((u: User) => u.email === email);
  if (!user) throw new Error('Credenciais inválidas');

  const company = db.companies.find((c: Company) => c.id === user.company_id);
  
  // Encontrar termo mais recente para a versão atual
  const terms = db.terms.find((t: TermsAcceptance) => 
    t.usuario_id === user.id && t.versao_termos === CURRENT_TERMS_VERSION
  ) || null;

  return { user, company, terms };
};

export const clearSession = () => {
    localStorage.removeItem('session_user_email'); 
    localStorage.removeItem('auth_token');
};

// --- 2. Validação e Estado ---

export const checkValidationStatus = async (userId: string): Promise<Company> => {
  if (USE_REAL_API) {
    // Backend: Endpoint que retorna apenas o objeto Company atualizado
    return await apiRequest<Company>(`/users/me/company`, 'GET');
  }

  // --- MOCK ---
  await new Promise(r => setTimeout(r, 500));
  const db = getMockDB();
  const user = db.users.find((u: User) => u.id === userId);
  if (!user) throw new Error("Utilizador não encontrado");
  
  return db.companies.find((c: Company) => c.id === user.company_id);
};

// --- 3. Conformidade e Assinatura ---

export const acceptTerms = async (userId: string): Promise<TermsAcceptance> => {
  if (USE_REAL_API) {
    // Backend: Regista IP, User Agent e Timestamp no banco
    return await apiRequest<TermsAcceptance>('/terms/accept', 'POST', { 
      versao_termos: CURRENT_TERMS_VERSION 
    });
  }

  // --- MOCK ---
  await new Promise(r => setTimeout(r, 800));
  const db = getMockDB();
  
  const acceptance: TermsAcceptance = {
    usuario_id: userId,
    versao_termos: CURRENT_TERMS_VERSION,
    data_aceite: new Date().toISOString(),
    ip_endereco: '127.0.0.1 (Mock)' // Em produção, backend extrai do socket
  };

  // Remove aceites antigos da mesma versão (se houver lógica de re-aceite)
  db.terms = db.terms.filter((t: TermsAcceptance) => !(t.usuario_id === userId && t.versao_termos === CURRENT_TERMS_VERSION));
  db.terms.push(acceptance);
  
  saveMockDB(db);
  return acceptance;
};

// --- 4. Perfil da Empresa ---

export const updateCompanyProfile = async (companyId: string, updates: Partial<Company>): Promise<Company> => {
  if (USE_REAL_API) {
    return await apiRequest<Company>(`/companies/${companyId}`, 'PATCH', updates);
  }

  // --- MOCK ---
  await new Promise(r => setTimeout(r, 1000));
  const db = getMockDB();
  const idx = db.companies.findIndex((c: Company) => c.id === companyId);
  
  if (idx === -1) throw new Error("Empresa não encontrada");

  const updatedCompany = { ...db.companies[idx], ...updates };
  db.companies[idx] = updatedCompany;
  saveMockDB(db);

  return updatedCompany;
};

// --- 5. ADMINISTRAÇÃO DO SISTEMA (Backoffice) ---

export const getAllCompanies = async (): Promise<Company[]> => {
    if (USE_REAL_API) {
      return await apiRequest<Company[]>('/admin/companies', 'GET');
    }

    // --- MOCK ---
    await new Promise(r => setTimeout(r, 400));
    const db = getMockDB();
    return db.companies || [];
};

export const approveCompany = async (companyId: string) => {
    if (USE_REAL_API) {
      // Backend: UPDATE companies SET status_validacao = 'aprovado', data_aprovacao = NOW() WHERE id = :id
      await apiRequest(`/admin/companies/${companyId}/approve`, 'POST');
      return;
    }

    // --- MOCK ---
    await new Promise(r => setTimeout(r, 600));
    const db = getMockDB();
    const idx = db.companies.findIndex((c: Company) => c.id === companyId);
    if(idx >= 0) {
        db.companies[idx].status_validacao = ValidationStatus.APPROVED;
        db.companies[idx].data_aprovacao = new Date().toISOString();
        saveMockDB(db);
    }
};

export const revokeCompany = async (companyId: string) => {
    if (USE_REAL_API) {
      // Backend: UPDATE companies SET status_validacao = 'pendente' ...
      // Backend: DELETE FROM terms_acceptance WHERE usuario_id IN (SELECT id FROM users WHERE company_id = :id)
      await apiRequest(`/admin/companies/${companyId}/revoke`, 'POST');
      return;
    }

    // --- MOCK ---
    await new Promise(r => setTimeout(r, 600));
    const db = getMockDB();
    
    // 1. Reset Company Status
    const companyIdx = db.companies.findIndex((c: Company) => c.id === companyId);
    if (companyIdx >= 0) {
        db.companies[companyIdx].status_validacao = ValidationStatus.PENDING;
        db.companies[companyIdx].data_aprovacao = undefined;
    }

    // 2. Invalidate Terms (Force re-acceptance)
    const companyUsers = db.users.filter((u: User) => u.company_id === companyId).map((u: User) => u.id);
    db.terms = db.terms.filter((t: TermsAcceptance) => !companyUsers.includes(t.usuario_id));

    saveMockDB(db);
};

// --- DEV TOOLS ---

export const forceApproveCompany = async (companyId: string) => {
    // Esta função é apenas para auxílio no desenvolvimento local
    if (USE_REAL_API) {
      console.warn("Force approve client-side ignorado em modo Real API.");
      return;
    }
    await approveCompany(companyId);
};
