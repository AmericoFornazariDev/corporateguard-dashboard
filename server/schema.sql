CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY,
  nif VARCHAR(32) UNIQUE NOT NULL,
  nome_fantasia VARCHAR(255) NOT NULL,
  setor VARCHAR(120) NOT NULL,
  status_validacao VARCHAR(24) NOT NULL DEFAULT 'pendente',
  data_aprovacao TIMESTAMP NULL,
  logo TEXT NULL,
  address TEXT NULL,
  phone VARCHAR(64) NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS terms_acceptance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  versao_termos VARCHAR(32) NOT NULL,
  data_aceite TIMESTAMP NOT NULL DEFAULT NOW(),
  ip_endereco VARCHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_terms_usuario_id ON terms_acceptance(usuario_id);
