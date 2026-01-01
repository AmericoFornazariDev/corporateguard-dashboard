import React, { useState } from 'react';
import { User, Company } from '../types';
import { checkValidationStatus, forceApproveCompany } from '../services/mockBackend';
import { Clock, RefreshCw, LogOut, ShieldAlert } from 'lucide-react';

interface Props {
  user: User;
  company: Company;
  onStatusUpdate: (updatedCompany: Company) => void;
  onLogout: () => void;
}

export const PendingScreen: React.FC<Props> = ({ user, company, onStatusUpdate, onLogout }) => {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const updatedCompany = await checkValidationStatus(user.id);
      
      if (updatedCompany.status_validacao !== company.status_validacao) {
        onStatusUpdate(updatedCompany);
      } else {
        setMessage("Auditoria ainda em curso. A nossa equipa de conformidade está a rever os documentos.");
      }
    } catch (err) {
      setMessage("Falha na conexão. Por favor, tente novamente.");
    } finally {
      setChecking(false);
    }
  };

  const devForceApprove = async () => {
      await forceApproveCompany(company.id);
      handleCheckStatus();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-float border border-gray-100 overflow-hidden relative">
          {/* Decorative Top Bar */}
          <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-orange-400"></div>
          
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600 ring-1 ring-amber-100">
                    <Clock size={24} strokeWidth={2.5} />
                </div>
                <div className="bg-gray-50 px-3 py-1 rounded-full text-xs font-medium text-gray-500 border border-gray-200">
                    {company.nif}
                </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">Validação Pendente</h1>
            
            <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>
                    Olá <span className="text-gray-900 font-medium">{user.name}</span>. A candidatura da <span className="text-gray-900 font-medium">{company.nome_fantasia}</span> foi colocada na fila com segurança.
                </p>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 flex gap-3 items-start">
                    <ShieldAlert size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-500">
                        O nosso motor de conformidade IA executa verificações cruzadas de dados fiscais e regulamentos do setor. Tempo médio de espera: <span className="font-medium text-gray-700">2-48 horas</span>.
                    </p>
                </div>
            </div>

            {message && (
                <div className="mt-6 p-3 bg-amber-50 border border-amber-100 text-amber-700 text-xs rounded-md text-center animate-in fade-in">
                {message}
                </div>
            )}

            <div className="mt-8 space-y-3">
                <button
                onClick={handleCheckStatus}
                disabled={checking}
                className="w-full py-2.5 px-4 bg-white border border-gray-300 shadow-sm text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2 active:bg-gray-100"
                >
                {checking ? <RefreshCw className="animate-spin text-gray-400" size={16} /> : <RefreshCw size={16} />}
                Verificar Estado
                </button>
            </div>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
             <button
                onClick={onLogout}
                className="text-gray-500 hover:text-gray-800 text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                <LogOut size={14} />
                Sair
            </button>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                Ref ID: #{company.id.slice(-6)}
            </span>
          </div>
        </div>

        {/* Developer Tool - Subtle */}
        <div className="mt-8 flex justify-center opacity-30 hover:opacity-100 transition-opacity">
            <button onClick={devForceApprove} className="text-[10px] bg-gray-900 text-white px-3 py-1 rounded shadow hover:bg-black">
                [DEV] Simular Aprovação
            </button>
        </div>
      </div>
    </div>
  );
};