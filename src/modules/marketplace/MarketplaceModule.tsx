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

    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Marketplace de Compras Coletivas</h1>
        <p className="text-gray-500 text-sm">
          Empresa: {company.nome_fantasia} · Utilizador: {user.name}
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? <p className="text-sm text-gray-500">A carregar...</p> : null}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Compras abertas</h2>
        {purchases.length === 0 ? <p className="text-sm text-gray-500">Sem compras abertas.</p> : null}
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-gray-900">{purchase.product_name}</h3>
                <p className="text-sm text-gray-600">{purchase.description}</p>
                <p className="text-sm text-gray-700">Empresa criadora: {purchase.nome_fantasia}</p>
                <p className="text-sm text-gray-700">Status: {purchase.status} · Restante: {purchase.remaining_quantity}</p>
              </div>
              {purchase.status === 'OPEN' && purchase.remaining_quantity > 0 ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="block text-sm text-gray-700">
                    Quantidade
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
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

                  <label className="block text-sm text-gray-700">
                    Assinatura - ID
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"

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

                  <label className="block text-sm text-gray-700">
                    Assinatura - Nome
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"

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

                  <label className="block text-sm text-gray-700">
                    Assinatura - Contacto
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"

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

                  <div className="flex flex-wrap gap-3 md:col-span-2">
                    <button
                      type="button"
                      onClick={() => handleJoin(purchase.id)}
                      className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                    >
                      Aderir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancel(purchase.id)}
                      className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar participação
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">Adesões bloqueadas quando CLOSED.</p>
              )}
            </div>
          ))}
        </div>
      </div>

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
