const express = require('express');
const {
  createPurchase,
  listMyPurchases,
  listMarketplaceOpen,
  joinPurchase,
  cancelParticipation,
  getCompanyPurchaseHistory,
  getFinalDocumentData,
} = require('../services/collectivePurchasesService');
const { getUserIdFromRequest } = require('../utils/auth');

const router = express.Router();

const requireAuth = (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return null;
  }
  return userId;
};

router.post('/collective-purchases', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const result = await createPurchase({ userId, payload: req.body });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Erro no servidor.' });
  }
});

router.get('/collective-purchases/my', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const result = await listMyPurchases(userId);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Erro no servidor.' });
  }
});

router.get('/marketplace/open', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const result = await listMarketplaceOpen(userId);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Erro no servidor.' });
  }
});

router.post('/marketplace/:purchase_id/join', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const result = await joinPurchase({
      userId,
      purchaseId: req.params.purchase_id,
      payload: req.body,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Erro no servidor.' });
  }
});

router.post('/marketplace/:purchase_id/cancel', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const result = await cancelParticipation({
      userId,
      purchaseId: req.params.purchase_id,
    });
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Erro no servidor.' });
  }
});

router.get('/company/purchase-history', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const result = await getCompanyPurchaseHistory(userId);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Erro no servidor.' });
  }
});

router.get('/collective-purchases/:id/final-document-data', async (req, res) => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  try {
    const result = await getFinalDocumentData(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Erro no servidor.' });
  }
});

module.exports = router;
