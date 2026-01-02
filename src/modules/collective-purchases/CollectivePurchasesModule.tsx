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
    <div>
      <h2>Compras Coletivas</h2>
      <p>Empresa: {company.nome_fantasia}</p>
      <p>Utilizador: {user.name}</p>

      <section>
        <h3>Criar nova compra</h3>
        <div>
          <label>
            Produto
            <input value={productName} onChange={(event) => setProductName(event.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Descrição
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Quantidade alvo
            <input
              type="number"
              value={targetQuantity}
              onChange={(event) => setTargetQuantity(event.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Quantidade do criador
            <input
              type="number"
              value={creatorQuantity}
              onChange={(event) => setCreatorQuantity(event.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Assinatura - ID
            <input value={signatureId} onChange={(event) => setSignatureId(event.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Assinatura - Nome
            <input value={signatureName} onChange={(event) => setSignatureName(event.target.value)} />
          </label>
        </div>
        <div>
          <label>
            Assinatura - Contacto
            <input value={signatureContact} onChange={(event) => setSignatureContact(event.target.value)} />
          </label>
        </div>
        <button type="button" onClick={handleCreate}>
          Criar compra
        </button>
      </section>

      {error && <p>{error}</p>}
      {loading ? <p>A carregar...</p> : null}

      <section>
        <h3>Minhas compras</h3>
        {purchases.length === 0 ? <p>Sem compras registadas.</p> : null}
        {purchases.map((purchase) => (
          <div key={purchase.id} style={{ border: '1px solid #ddd', marginBottom: '1rem', padding: '0.75rem' }}>
            <h4>{purchase.product_name}</h4>
            <p>{purchase.description}</p>
            <p>
              Status: {purchase.status} | Confirmado: {purchase.total_confirmed ?? 0} / {purchase.target_quantity}
            </p>
            {purchase.status === 'CLOSED' ? (
              <button type="button" onClick={() => handleFetchFinalDocument(purchase.id)}>
                Ver dados para documento final
              </button>
            ) : (
              <p>Edição bloqueada quando CLOSED.</p>
            )}
            <div>
              <strong>Participantes</strong>
              {purchase.participants && purchase.participants.length > 0 ? (
                <ul>
                  {purchase.participants.map((participant) => (
                    <li key={participant.id}>
                      {participant.nome_fantasia || participant.company_id} - {participant.quantity} ({participant.status})
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Sem participantes ainda.</p>
              )}
            </div>
          </div>
        ))}
      </section>

      {finalDocument ? (
        <section>
          <h3>Dados do documento final</h3>
          <p>Compra: {finalDocument.purchase.product_name}</p>
          <ul>
            {finalDocument.participants.map((participant, index) => (
              <li key={`${participant.nif}-${index}`}>
                {participant.nome_fantasia} - {participant.quantity} - {participant.nif} -{' '}
                {participant.address || 'Sem morada'}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

export default CollectivePurchasesModule;
