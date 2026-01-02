import { useEffect, useState } from 'react';
import { Company, User } from '../../types';
import {
  createCollectivePurchase,
  getFinalDocumentData,
  getMyCollectivePurchases
} from '../../../services/collectivePurchasesService';

type CollectivePurchasesModuleProps = {
  company: Company;
  user: User;
  token: string;
};

type Purchase = {
  id: string;
  product_name: string;
  description: string;
  target_quantity: number;
  status: 'OPEN' | 'CLOSED';
  created_at: string;
  closed_at?: string | null;
  total_confirmed?: number;
  participants?: Array<{
    id: string;
    company_id: string;
    quantity: number;
    status: string;
    nome_fantasia?: string;
    nif?: string;
    address?: string | null;
  }>;
};

type FinalDocumentData = {
  purchase: Purchase;
  participants: Array<{
    quantity: number;
    status: string;
    nome_fantasia: string;
    nif: string;
    address?: string | null;
  }>;
};

const CollectivePurchasesModule = ({ company, user, token }: CollectivePurchasesModuleProps) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalDocument, setFinalDocument] = useState<FinalDocumentData | null>(null);

  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('');
  const [creatorQuantity, setCreatorQuantity] = useState('');
  const [signatureId, setSignatureId] = useState('');
  const [signatureName, setSignatureName] = useState('');
  const [signatureContact, setSignatureContact] = useState('');

  const loadPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyCollectivePurchases(token);
      setPurchases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar compras.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const handleCreate = async () => {
    setError(null);
    setFinalDocument(null);
    try {
      await createCollectivePurchase(
        {
          product_name: productName,
          description,
          target_quantity: Number(targetQuantity),
          creator_quantity: Number(creatorQuantity),
          signature_id: signatureId,
          signature_name: signatureName,
          signature_contact: signatureContact
        },
        token
      );
      setProductName('');
      setDescription('');
      setTargetQuantity('');
      setCreatorQuantity('');
      setSignatureId('');
      setSignatureName('');
      setSignatureContact('');
      await loadPurchases();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar compra.');
    }
  };

  const handleFetchFinalDocument = async (purchaseId: string) => {
    setError(null);
    try {
      const data = await getFinalDocumentData(purchaseId, token);
      setFinalDocument(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados finais.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compras Coletivas</h1>
        <p className="text-gray-500 text-sm">
          Empresa: {company.nome_fantasia} · Utilizador: {user.name}
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? <p className="text-sm text-gray-500">A carregar...</p> : null}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Criar nova compra</h2>
        <div className="space-y-3">
          <label className="block text-sm text-gray-700">
            Produto
            <input
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
            />
          </label>
          <label className="block text-sm text-gray-700">
            Descrição
            <textarea
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block text-sm text-gray-700">
              Quantidade alvo
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                type="number"
                value={targetQuantity}
                onChange={(event) => setTargetQuantity(event.target.value)}
              />
            </label>
            <label className="block text-sm text-gray-700">
              Quantidade do criador
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                type="number"
                value={creatorQuantity}
                onChange={(event) => setCreatorQuantity(event.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block text-sm text-gray-700">
              Assinatura - ID
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={signatureId}
                onChange={(event) => setSignatureId(event.target.value)}
              />
            </label>
            <label className="block text-sm text-gray-700">
              Assinatura - Nome
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={signatureName}
                onChange={(event) => setSignatureName(event.target.value)}
              />
            </label>
            <label className="block text-sm text-gray-700">
              Assinatura - Contacto
              <input
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={signatureContact}
                onChange={(event) => setSignatureContact(event.target.value)}
              />
            </label>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
        >
          Criar compra
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Minhas compras</h2>
        {purchases.length === 0 ? <p className="text-sm text-gray-500">Sem compras registadas.</p> : null}
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-semibold text-gray-900">{purchase.product_name}</h3>
                <p className="text-sm text-gray-600">{purchase.description}</p>
                <p className="text-sm text-gray-700">
                  Status: {purchase.status} · Confirmado: {purchase.total_confirmed ?? 0} / {purchase.target_quantity}
                </p>
                {purchase.status === 'CLOSED' ? (
                  <button
                    type="button"
                    onClick={() => handleFetchFinalDocument(purchase.id)}
                    className="self-start text-sm font-semibold text-gray-900 hover:text-gray-700"
                  >
                    Ver dados para documento final
                  </button>
                ) : (
                  <p className="text-xs text-gray-500">Edição bloqueada quando CLOSED.</p>
                )}
              </div>
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900">Participantes</p>
                {purchase.participants && purchase.participants.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-gray-600">
                    {purchase.participants.map((participant) => (
                      <li key={participant.id}>
                        {participant.nome_fantasia || participant.company_id} - {participant.quantity} ({participant.status})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Sem participantes ainda.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {finalDocument ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Dados do documento final</h2>
          <p className="text-sm text-gray-600">Compra: {finalDocument.purchase.product_name}</p>
          <ul className="mt-3 space-y-1 text-sm text-gray-600">
            {finalDocument.participants.map((participant, index) => (
              <li key={`${participant.nif}-${index}`}>
                {participant.nome_fantasia} - {participant.quantity} - {participant.nif} -{' '}
                {participant.address || 'Sem morada'}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default CollectivePurchasesModule;
