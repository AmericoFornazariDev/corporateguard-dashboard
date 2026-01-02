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

    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reputação e Histórico</h1>
        <p className="text-gray-500 text-sm">
          Empresa: {company.nome_fantasia} · Utilizador: {user.name}
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? <p className="text-sm text-gray-500">A carregar...</p> : null}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Score atual</h2>
        <p className="mt-2 text-3xl font-bold text-gray-900">{score}</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900">Histórico de participações</h2>
        {history.length === 0 ? <p className="mt-2 text-sm text-gray-500">Sem histórico.</p> : null}
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          {history.map((entry) => (
            <li key={entry.id} className="bg-white border border-gray-200 rounded-lg p-3">

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

      </div>

      </section>

    </div>
  );
};

export default ReputationModule;
