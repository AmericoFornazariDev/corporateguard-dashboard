import React, { useEffect, useState, useMemo } from 'react';
import { Company, ValidationStatus } from '../types';
import { getAllCompanies, approveCompany, revokeCompany } from '../services/mockBackend';
import { Shield, CheckCircle, XCircle, Search, RefreshCw, LogOut, AlertTriangle, Briefcase, Filter, ChevronLeft, ChevronRight, LayoutList, Clock } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

const ITEMS_PER_PAGE = 10;

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ValidationStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    const data = await getAllCompanies();
    setCompanies(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    await approveCompany(id);
    await fetchData();
    setProcessingId(null);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Atenção: Revogar o acesso forçará o cliente a aceitar novamente os termos de serviço. Tem a certeza?")) return;
    setProcessingId(id);
    await revokeCompany(id);
    await fetchData();
    setProcessingId(null);
  };

  // --- Derived State Logic ---

  // 1. Metrics
  const metrics = useMemo(() => {
    return {
      total: companies.length,
      pending: companies.filter(c => c.status_validacao === ValidationStatus.PENDING).length,
      approved: companies.filter(c => c.status_validacao === ValidationStatus.APPROVED).length
    };
  }, [companies]);

  // 2. Filtering
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = 
        company.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) || 
        company.nif.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'ALL' || company.status_validacao === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  // 3. Pagination
  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Admin Top Bar */}
      <div className="bg-slate-900 text-white h-16 px-6 md:px-8 flex items-center justify-between shadow-lg sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-rose-600 p-1.5 rounded-lg">
            <Shield size={20} className="text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg hidden md:inline">Administração do Sistema</span>
          <span className="font-bold tracking-tight text-lg md:hidden">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchData} 
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Recarregar Dados"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="h-6 w-px bg-slate-700"></div>
          <button 
            onClick={onLogout}
            className="text-sm text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button 
                onClick={() => setStatusFilter(ValidationStatus.PENDING)}
                className={`p-6 rounded-xl border text-left transition-all ${statusFilter === ValidationStatus.PENDING ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500/20 shadow-md' : 'bg-white border-slate-200 hover:border-amber-300 shadow-sm'}`}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pendentes</p>
                        <h3 className="text-3xl font-bold text-slate-900">{metrics.pending}</h3>
                    </div>
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <Clock size={20} />
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">A aguardar validação</p>
            </button>

            <button 
                 onClick={() => setStatusFilter(ValidationStatus.APPROVED)}
                 className={`p-6 rounded-xl border text-left transition-all ${statusFilter === ValidationStatus.APPROVED ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/20 shadow-md' : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'}`}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Aprovadas</p>
                        <h3 className="text-3xl font-bold text-slate-900">{metrics.approved}</h3>
                    </div>
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <CheckCircle size={20} />
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Com acesso à rede</p>
            </button>

            <button 
                 onClick={() => setStatusFilter('ALL')}
                 className={`p-6 rounded-xl border text-left transition-all ${statusFilter === 'ALL' ? 'bg-slate-100 border-slate-300 ring-2 ring-slate-500/20 shadow-md' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Entidades</p>
                        <h3 className="text-3xl font-bold text-slate-900">{metrics.total}</h3>
                    </div>
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                        <LayoutList size={20} />
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Registadas na base de dados</p>
            </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Pesquisar por Nome ou NIF..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
                />
            </div>

            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                >
                    Todas
                </button>
                <button 
                    onClick={() => setStatusFilter(ValidationStatus.PENDING)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === ValidationStatus.PENDING ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'}`}
                >
                    Pendentes
                </button>
                <button 
                    onClick={() => setStatusFilter(ValidationStatus.APPROVED)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${statusFilter === ValidationStatus.APPROVED ? 'bg-emerald-500 text-white' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                >
                    Aprovadas
                </button>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold w-[40%]">Entidade / NIF</th>
                  <th className="px-6 py-4 font-semibold w-[20%]">Setor</th>
                  <th className="px-6 py-4 font-semibold w-[20%]">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right w-[20%]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCompanies.length === 0 ? (
                    <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center justify-center text-slate-400">
                                <Briefcase size={32} strokeWidth={1.5} className="mb-2 opacity-50" />
                                <p className="text-sm font-medium">Nenhum resultado encontrado.</p>
                                <p className="text-xs">Tente ajustar os filtros ou a pesquisa.</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    paginatedCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200 overflow-hidden">
                                {company.logo ? <img src={company.logo} className="w-full h-full object-cover" /> : <Briefcase size={18} />}
                            </div>
                            <div>
                            <div className="font-semibold text-slate-900">{company.nome_fantasia}</div>
                            <div className="text-xs font-mono text-slate-500">{company.nif}</div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            {company.setor}
                        </span>
                        </td>
                        <td className="px-6 py-4">
                        {company.status_validacao === ValidationStatus.APPROVED ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <CheckCircle size={12} className="fill-emerald-500 text-white" />
                            Aprovado
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                            <AlertTriangle size={12} className="fill-amber-500 text-white" />
                            Pendente
                            </span>
                        )}
                        </td>
                        <td className="px-6 py-4 text-right">
                        {company.status_validacao === ValidationStatus.PENDING ? (
                            <button
                            onClick={() => handleApprove(company.id)}
                            disabled={processingId === company.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                            {processingId === company.id ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                            Aprovar
                            </button>
                        ) : (
                            <button
                            onClick={() => handleRevoke(company.id)}
                            disabled={processingId === company.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-sm font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group/rev"
                            >
                            {processingId === company.id ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} className="text-slate-400 group-hover/rev:text-rose-500" />}
                            Revogar
                            </button>
                        )}
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredCompanies.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                    A mostrar <span className="font-medium text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="font-medium text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredCompanies.length)}</span> de <span className="font-medium text-slate-900">{filteredCompanies.length}</span>
                </p>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-medium text-slate-700 px-2">
                        Página {currentPage} de {totalPages || 1}
                    </span>
                    <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};