const { v4: uuidv4 } = require('uuid');
const { pool, withTransaction } = require('../db');

const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const getUserWithCompany = async (client, userId) => {
  const userRes = await client.query('SELECT * FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    throw createError(404, 'Usuário não encontrado.');
  }
  const user = userRes.rows[0];
  return user;
};

const sumConfirmedQuantities = async (client, purchaseId) => {
  const rowsRes = await client.query(
    "SELECT quantity FROM purchase_participants WHERE purchase_id = $1 AND status = 'CONFIRMED' FOR UPDATE",
    [purchaseId]
  );
  return rowsRes.rows.reduce((total, row) => total + Number(row.quantity || 0), 0);
};

const createPurchase = async ({ userId, payload }) => {
  const {
    product_name,
    description,
    target_quantity,
    creator_quantity,
    signature_id,
    signature_name,
    signature_contact,
  } = payload;

  if (!product_name || !description || !target_quantity) {
    throw createError(400, 'Dados obrigatórios em falta.');
  }
  if (!creator_quantity || Number(creator_quantity) <= 0) {
    throw createError(400, 'Quantidade do criador deve ser explícita e maior que zero.');
  }
  if (!signature_id || !signature_name || !signature_contact) {
    throw createError(400, 'Assinatura do criador é obrigatória.');
  }

  return withTransaction(async (client) => {
    const user = await getUserWithCompany(client, userId);
    const purchaseId = uuidv4();
    const participantId = uuidv4();

    const insertPurchase = `
      INSERT INTO collective_purchases (
        id, company_id, created_by_user_id, product_name, description, target_quantity, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
      RETURNING *
    `;
    const purchaseRes = await client.query(insertPurchase, [
      purchaseId,
      user.company_id,
      userId,
      product_name,
      description,
      target_quantity,
    ]);

    const insertParticipant = `
      INSERT INTO purchase_participants (
        id, purchase_id, company_id, user_id, quantity, signature_id, signature_name, signature_contact, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'CONFIRMED')
      RETURNING *
    `;
    const participantRes = await client.query(insertParticipant, [
      participantId,
      purchaseId,
      user.company_id,
      userId,
      creator_quantity,
      signature_id,
      signature_name,
      signature_contact,
    ]);

    await client.query('SELECT id FROM collective_purchases WHERE id = $1 FOR UPDATE', [purchaseId]);
    const totalConfirmed = await sumConfirmedQuantities(client, purchaseId);
    let updatedPurchase = purchaseRes.rows[0];

    if (totalConfirmed >= Number(target_quantity)) {
      const closedRes = await client.query(
        "UPDATE collective_purchases SET status = 'CLOSED', closed_at = NOW() WHERE id = $1 RETURNING *",
        [purchaseId]
      );
      updatedPurchase = closedRes.rows[0];
    }

    return {
      purchase: updatedPurchase,
      participant: participantRes.rows[0],
      total_confirmed: totalConfirmed,
    };
  });
};

const listMyPurchases = async (userId) => {
  const userRes = await pool.query('SELECT company_id FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    throw createError(404, 'Usuário não encontrado.');
  }
  const companyId = userRes.rows[0].company_id;

  const purchasesRes = await pool.query(
    `
      SELECT cp.*, COALESCE(SUM(pp.quantity) FILTER (WHERE pp.status = 'CONFIRMED'), 0) AS total_confirmed
      FROM collective_purchases cp
      LEFT JOIN purchase_participants pp ON pp.purchase_id = cp.id
      WHERE cp.company_id = $1
      GROUP BY cp.id
      ORDER BY cp.created_at DESC
    `,
    [companyId]
  );

  const purchaseIds = purchasesRes.rows.map((row) => row.id);
  if (purchaseIds.length === 0) {
    return [];
  }

  const participantsRes = await pool.query(
    `
      SELECT pp.*, c.nome_fantasia, c.nif, c.address
      FROM purchase_participants pp
      JOIN companies c ON c.id = pp.company_id
      WHERE pp.purchase_id = ANY($1::uuid[])
      ORDER BY pp.created_at ASC
    `,
    [purchaseIds]
  );

  const participantsByPurchase = participantsRes.rows.reduce((acc, row) => {
    acc[row.purchase_id] = acc[row.purchase_id] || [];
    acc[row.purchase_id].push(row);
    return acc;
  }, {});

  return purchasesRes.rows.map((purchase) => ({
    ...purchase,
    participants: participantsByPurchase[purchase.id] || [],
  }));
};

const listMarketplaceOpen = async (userId) => {
  const userRes = await pool.query('SELECT company_id FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    throw createError(404, 'Usuário não encontrado.');
  }
  const companyId = userRes.rows[0].company_id;

  const openRes = await pool.query(
    `
      SELECT cp.*, c.nome_fantasia, c.nif, c.setor,
        COALESCE(SUM(pp.quantity) FILTER (WHERE pp.status = 'CONFIRMED'), 0) AS total_confirmed
      FROM collective_purchases cp
      JOIN companies c ON c.id = cp.company_id
      LEFT JOIN purchase_participants pp ON pp.purchase_id = cp.id
      WHERE cp.status = 'OPEN' AND cp.company_id <> $1
      GROUP BY cp.id, c.id
      ORDER BY cp.created_at DESC
    `,
    [companyId]
  );

  return openRes.rows.map((row) => ({
    ...row,
    remaining_quantity: Math.max(Number(row.target_quantity) - Number(row.total_confirmed), 0),
  }));
};

const joinPurchase = async ({ userId, purchaseId, payload }) => {
  const { quantity, signature_id, signature_name, signature_contact } = payload;

  if (!quantity || Number(quantity) <= 0) {
    throw createError(400, 'Quantidade deve ser explícita e maior que zero.');
  }
  if (!signature_id || !signature_name || !signature_contact) {
    throw createError(400, 'Assinatura digital é obrigatória.');
  }

  return withTransaction(async (client) => {
    const user = await getUserWithCompany(client, userId);
    const purchaseRes = await client.query(
      'SELECT * FROM collective_purchases WHERE id = $1 FOR UPDATE',
      [purchaseId]
    );
    if (purchaseRes.rows.length === 0) {
      throw createError(404, 'Compra coletiva não encontrada.');
    }
    const purchase = purchaseRes.rows[0];
    if (purchase.status !== 'OPEN') {
      throw createError(409, 'Compra coletiva já está fechada.');
    }

    const totalConfirmed = await sumConfirmedQuantities(client, purchaseId);
    const remaining = Number(purchase.target_quantity) - totalConfirmed;
    if (remaining <= 0) {
      throw createError(409, 'Compra coletiva já atingiu o alvo.');
    }

    const acceptedQuantity = Math.min(Number(quantity), remaining);
    const participantId = uuidv4();

    const insertParticipant = `
      INSERT INTO purchase_participants (
        id, purchase_id, company_id, user_id, quantity, signature_id, signature_name, signature_contact, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'CONFIRMED')
      RETURNING *
    `;

    let participant;
    try {
      const participantRes = await client.query(insertParticipant, [
        participantId,
        purchaseId,
        user.company_id,
        userId,
        acceptedQuantity,
        signature_id,
        signature_name,
        signature_contact,
      ]);
      participant = participantRes.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        throw createError(409, 'Empresa já participa desta compra.');
      }
      throw err;
    }

    const updatedTotal = totalConfirmed + acceptedQuantity;
    let updatedPurchase = purchase;

    if (updatedTotal >= Number(purchase.target_quantity)) {
      const closedRes = await client.query(
        "UPDATE collective_purchases SET status = 'CLOSED', closed_at = NOW() WHERE id = $1 RETURNING *",
        [purchaseId]
      );
      updatedPurchase = closedRes.rows[0];
    }

    return {
      purchase: updatedPurchase,
      participant,
      accepted_quantity: acceptedQuantity,
      remaining_quantity: Math.max(Number(purchase.target_quantity) - updatedTotal, 0),
    };
  });
};

const cancelParticipation = async ({ userId, purchaseId }) => {
  return withTransaction(async (client) => {
    const user = await getUserWithCompany(client, userId);
    const purchaseRes = await client.query(
      'SELECT * FROM collective_purchases WHERE id = $1 FOR UPDATE',
      [purchaseId]
    );
    if (purchaseRes.rows.length === 0) {
      throw createError(404, 'Compra coletiva não encontrada.');
    }
    const purchase = purchaseRes.rows[0];
    if (purchase.status !== 'OPEN') {
      throw createError(409, 'Compra coletiva já está fechada.');
    }

    const updateRes = await client.query(
      `
        UPDATE purchase_participants
        SET status = 'CANCELLED'
        WHERE purchase_id = $1 AND company_id = $2 AND status = 'CONFIRMED'
        RETURNING *
      `,
      [purchaseId, user.company_id]
    );

    if (updateRes.rows.length === 0) {
      throw createError(404, 'Participação não encontrada ou já cancelada.');
    }

    await client.query(
      `
        INSERT INTO reputation_logs (id, company_id, user_id, purchase_id, event_type, event_reason)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [uuidv4(), user.company_id, userId, purchaseId, 'cancelled_after_confirm', 'Cancelamento após confirmação']
    );

    return { cancelled: true };
  });
};

const getCompanyPurchaseHistory = async (userId) => {
  const userRes = await pool.query('SELECT company_id FROM users WHERE id = $1', [userId]);
  if (userRes.rows.length === 0) {
    throw createError(404, 'Usuário não encontrado.');
  }
  const companyId = userRes.rows[0].company_id;

  const historyRes = await pool.query(
    `
      SELECT cp.*, pp.quantity, pp.status AS participation_status, pp.created_at AS participation_created_at
      FROM purchase_participants pp
      JOIN collective_purchases cp ON cp.id = pp.purchase_id
      WHERE pp.company_id = $1
      ORDER BY pp.created_at DESC
    `,
    [companyId]
  );

  return historyRes.rows;
};

const getFinalDocumentData = async (purchaseId) => {
  const purchaseRes = await pool.query(
    `SELECT * FROM collective_purchases WHERE id = $1`,
    [purchaseId]
  );
  if (purchaseRes.rows.length === 0) {
    throw createError(404, 'Compra coletiva não encontrada.');
  }
  const purchase = purchaseRes.rows[0];
  if (purchase.status !== 'CLOSED') {
    throw createError(409, 'Compra coletiva ainda está aberta.');
  }

  const participantsRes = await pool.query(
    `
      SELECT pp.quantity, pp.status, c.nome_fantasia, c.nif, c.address
      FROM purchase_participants pp
      JOIN companies c ON c.id = pp.company_id
      WHERE pp.purchase_id = $1 AND pp.status = 'CONFIRMED'
      ORDER BY pp.created_at ASC
    `,
    [purchaseId]
  );

  return {
    purchase,
    participants: participantsRes.rows,
  };
};

module.exports = {
  createPurchase,
  listMyPurchases,
  listMarketplaceOpen,
  joinPurchase,
  cancelParticipation,
  getCompanyPurchaseHistory,
  getFinalDocumentData,
};
