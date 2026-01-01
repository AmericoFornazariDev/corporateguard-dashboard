require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============================================================================
// CONEXÃO COM POSTGRESQL
// ============================================================================
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'corporateguard',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

pool.on('error', (err) => {
  console.error('Erro inesperado no client do PostgreSQL', err);
  process.exit(-1);
});

// Inicializa Tabelas
const initDB = async () => {
    try {
        const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8');
        await pool.query(schema);
        console.log("✅ Tabelas PostgreSQL verificadas/criadas.");
    } catch (err) {
        console.error("❌ Erro ao criar tabelas no Postgres:", err);
    }
};

initDB();

// ============================================================================
// ROTAS DA API
// ============================================================================

// 1. REGISTRO
app.post('/api/auth/register', async (req, res) => {
    const { nif, nome_fantasia, setor, email, name } = req.body;
    const companyId = uuidv4();
    const userId = uuidv4();

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert Company
        const insertCompanyText = `
            INSERT INTO companies (id, nif, nome_fantasia, setor, status_validacao) 
            VALUES ($1, $2, $3, $4, 'pendente') 
            RETURNING *`;
        const companyRes = await client.query(insertCompanyText, [companyId, nif, nome_fantasia, setor]);

        // Insert User
        const insertUserText = `
            INSERT INTO users (id, name, email, role, company_id) 
            VALUES ($1, $2, $3, 'admin', $4) 
            RETURNING *`;
        const userRes = await client.query(insertUserText, [userId, name, email, companyId]);

        await client.query('COMMIT');

        res.json({
            user: userRes.rows[0],
            company: companyRes.rows[0],
            token: "fake-jwt-token-" + userId
        });
    } catch (e) {
        await client.query('ROLLBACK');
        console.error(e);
        if (e.code === '23505') { // Postgres unique violation error code
            return res.status(400).json({ message: "NIF ou Email já existem." });
        }
        res.status(500).json({ message: "Erro no servidor." });
    } finally {
        client.release();
    }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
    const { email } = req.body;

    // Backdoor Admin
    if (email === 'admin@system.com') {
        return res.json({
            user: { id: 'sys_admin', name: 'System Administrator', email, role: 'admin', company_id: 'sys' },
            company: { id: 'sys', nif: '000', nome_fantasia: 'System', setor: 'Tech', status_validacao: 'aprovado' },
            token: "admin-token"
        });
    }

    try {
        // Busca Usuário
        const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) return res.status(401).json({ message: "Usuário não encontrado" });
        const user = userRes.rows[0];

        // Busca Empresa
        const companyRes = await pool.query('SELECT * FROM companies WHERE id = $1', [user.company_id]);
        const company = companyRes.rows[0];

        // Busca Termos
        const termsRes = await pool.query("SELECT * FROM terms_acceptance WHERE usuario_id = $1 AND versao_termos = 'v1.0'", [user.id]);
        const terms = termsRes.rows.length > 0 ? termsRes.rows[0] : null;

        res.json({
            user,
            company,
            terms,
            token: "fake-jwt-token-" + user.id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro de banco de dados" });
    }
});

// 3. GET COMPANY (Me)
app.get('/api/users/me/company', async (req, res) => {
    const authHeader = req.headers.authorization || "";
    const userId = authHeader.replace("Bearer fake-jwt-token-", "");

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
        const userRes = await pool.query('SELECT company_id FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ message: "User not found" });

        const companyRes = await pool.query('SELECT * FROM companies WHERE id = $1', [userRes.rows[0].company_id]);
        res.json(companyRes.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 4. ACEITAR TERMOS
app.post('/api/terms/accept', async (req, res) => {
    const authHeader = req.headers.authorization || "";
    const userId = authHeader.replace("Bearer fake-jwt-token-", "");
    const { versao_termos } = req.body;
    const ip = req.ip || '127.0.0.1';

    try {
        const query = `
            INSERT INTO terms_acceptance (usuario_id, versao_termos, ip_endereco, data_aceite) 
            VALUES ($1, $2, $3, NOW()) 
            RETURNING *`;
        const result = await pool.query(query, [userId, versao_termos, ip]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao gravar termo" });
    }
});

// 5. UPDATE COMPANY
app.patch('/api/companies/:id', async (req, res) => {
    const { id } = req.params;
    const { address, phone, description, logo } = req.body;

    // Construção dinâmica da query para Postgres ($1, $2...)
    let updates = [];
    let values = [];
    let counter = 1;

    if (address !== undefined) { updates.push(`address = $${counter++}`); values.push(address); }
    if (phone !== undefined) { updates.push(`phone = $${counter++}`); values.push(phone); }
    if (description !== undefined) { updates.push(`description = $${counter++}`); values.push(description); }
    if (logo !== undefined) { updates.push(`logo = $${counter++}`); values.push(logo); }

    if (updates.length === 0) return res.json({});

    values.push(id);
    const query = `UPDATE companies SET ${updates.join(", ")} WHERE id = $${counter} RETURNING *`;

    try {
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 6. ADMIN - LISTAR
app.get('/api/admin/companies', async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM companies ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 7. ADMIN - APROVAR
app.post('/api/admin/companies/:id/approve', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query(
            "UPDATE companies SET status_validacao = 'aprovado', data_aprovacao = NOW() WHERE id = $1", 
            [id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 8. ADMIN - REVOGAR
app.post('/api/admin/companies/:id/revoke', async (req, res) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        
        // Update Status
        await client.query("UPDATE companies SET status_validacao = 'pendente' WHERE id = $1", [id]);

        // Delete Terms (Subquery adaptada para Postgres)
        await client.query("DELETE FROM terms_acceptance WHERE usuario_id IN (SELECT id FROM users WHERE company_id = $1)", [id]);
        
        await client.query('COMMIT');
        res.json({ success: true });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
});

app.listen(PORT, () => {
    console.log(`
    ==================================================
    🐘 BACKEND POSTGRESQL RODANDO NA PORTA ${PORT}
    📡 Conectado a: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432} / ${process.env.DB_NAME || 'corporateguard'}
    ==================================================
    `);
});
