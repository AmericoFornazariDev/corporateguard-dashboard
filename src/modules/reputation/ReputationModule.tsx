import { useEffect, useMemo, useState } from 'react';
import { Company, User } from '../../types';
import { getCompanyPurchaseHistory } from '../../../services/reputationService';

type ReputationModuleProps = {
  company: Company;
  user: User;
  token: string;
};

type PurchaseHistoryEntry = {
  id: string;
  product_name: string;
  quantity: number;
  participation_status: string;
  participation_created_at: string;
};

const ReputationModule = ({ company, user, token }: ReputationModuleProps) => {
  const [history, setHistory] = useState<PurchaseHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCompanyPurchaseHistory(token);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const score = useMemo(() => {
    const confirmed = history.filter((entry) => entry.participation_status === 'CONFIRMED').length;
    const cancelled = history.filter((entry) => entry.participation_status === 'CANCELLED').length;
    return confirmed - cancelled;
  }, [history]);

  return (
    <div>
      <h2>Reputação e Histórico</h2>
      <p>Empresa: {company.nome_fantasia}</p>
      <p>Utilizador: {user.name}</p>

      {error && <p>{error}</p>}
      {loading ? <p>A carregar...</p> : null}

      <section>
        <h3>Score atual</h3>
        <p>{score}</p>
      </section>

      <section>
        <h3>Histórico de participações</h3>
        {history.length === 0 ? <p>Sem histórico.</p> : null}
        <ul>
          {history.map((entry) => (
            <li key={entry.id}>
              {entry.product_name} - {entry.quantity} - {entry.participation_status} ({entry.participation_created_at})
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ReputationModule;
