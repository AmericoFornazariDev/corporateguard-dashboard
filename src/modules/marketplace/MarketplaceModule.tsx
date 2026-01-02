import { useEffect, useState } from 'react';
import { Company, User } from '../../types';
import {
  cancelMarketplaceParticipation,
  getOpenMarketplacePurchases,
  joinMarketplacePurchase
} from '../../../services/marketplaceService';

type MarketplaceModuleProps = {
  company: Company;
  user: User;
  token: string;
};

type MarketplacePurchase = {
  id: string;
  product_name: string;
  description: string;
  target_quantity: number;
  status: 'OPEN' | 'CLOSED';
  nome_fantasia: string;
  total_confirmed: number;
  remaining_quantity: number;
};

const MarketplaceModule = ({ company, user, token }: MarketplaceModuleProps) => {
  const [purchases, setPurchases] = useState<MarketplacePurchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState<Record<string, string>>({});
  const [signatureId, setSignatureId] = useState<Record<string, string>>({});
  const [signatureName, setSignatureName] = useState<Record<string, string>>({});
  const [signatureContact, setSignatureContact] = useState<Record<string, string>>({});

  const loadMarketplace = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOpenMarketplacePurchases(token);
      setPurchases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar marketplace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplace();
  }, []);

  const handleJoin = async (purchaseId: string) => {
    setError(null);
    try {
      await joinMarketplacePurchase(
        purchaseId,
        {
          quantity: Number(quantity[purchaseId]),
          signature_id: signatureId[purchaseId],
          signature_name: signatureName[purchaseId],
          signature_contact: signatureContact[purchaseId]
        },
        token
      );
      setQuantity((prev) => ({ ...prev, [purchaseId]: '' }));
      setSignatureId((prev) => ({ ...prev, [purchaseId]: '' }));
      setSignatureName((prev) => ({ ...prev, [purchaseId]: '' }));
      setSignatureContact((prev) => ({ ...prev, [purchaseId]: '' }));
      await loadMarketplace();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aderir à compra.');
    }
  };

  const handleCancel = async (purchaseId: string) => {
    setError(null);
    try {
      await cancelMarketplaceParticipation(purchaseId, token);
      await loadMarketplace();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar participação.');
    }
  };

  return (
    <div>
      <h2>Marketplace de Compras Coletivas</h2>
      <p>Empresa: {company.nome_fantasia}</p>
      <p>Utilizador: {user.name}</p>

      {error && <p>{error}</p>}
      {loading ? <p>A carregar...</p> : null}

      <section>
        <h3>Compras abertas</h3>
        {purchases.length === 0 ? <p>Sem compras abertas.</p> : null}
        {purchases.map((purchase) => (
          <div key={purchase.id} style={{ border: '1px solid #ddd', marginBottom: '1rem', padding: '0.75rem' }}>
            <h4>{purchase.product_name}</h4>
            <p>{purchase.description}</p>
            <p>Empresa criadora: {purchase.nome_fantasia}</p>
            <p>
              Status: {purchase.status} | Restante: {purchase.remaining_quantity}
            </p>
            {purchase.status === 'OPEN' && purchase.remaining_quantity > 0 ? (
              <div>
                <div>
                  <label>
                    Quantidade
                    <input
                      type="number"
                      value={quantity[purchase.id] || ''}
                      onChange={(event) =>
                        setQuantity((prev) => ({ ...prev, [purchase.id]: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Assinatura - ID
                    <input
                      value={signatureId[purchase.id] || ''}
                      onChange={(event) =>
                        setSignatureId((prev) => ({ ...prev, [purchase.id]: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Assinatura - Nome
                    <input
                      value={signatureName[purchase.id] || ''}
                      onChange={(event) =>
                        setSignatureName((prev) => ({ ...prev, [purchase.id]: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div>
                  <label>
                    Assinatura - Contacto
                    <input
                      value={signatureContact[purchase.id] || ''}
                      onChange={(event) =>
                        setSignatureContact((prev) => ({ ...prev, [purchase.id]: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <button type="button" onClick={() => handleJoin(purchase.id)}>
                  Aderir
                </button>
                <button type="button" onClick={() => handleCancel(purchase.id)}>
                  Cancelar participação
                </button>
              </div>
            ) : (
              <p>Adesões bloqueadas quando CLOSED.</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

export default MarketplaceModule;
