import React from 'react';
import { Company } from '../types';
import { Building2, ArrowRight } from 'lucide-react';

interface Props {
  company: Company;
  onBack: () => void;
}

export const OperationalDashboard: React.FC<Props> = ({ company, onBack }) => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Operational */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4 sticky top-16 z-20">
          <button 
            onClick={onBack} 
            className="text-gray-500 hover:text-brand-600 transition-colors flex items-center gap-1 text-sm font-medium group"
          >
            <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={16} /> 
            Voltar
          </button>
          <div className="h-4 w-px bg-gray-200"></div>
          <span className="font-semibold text-gray-900">Rede Operacional</span>
      </div>

      {/* Workspace Content */}
      <div className="max-w-7xl mx-auto p-8">
          <div className="flex items-center justify-center h-[600px] border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
             <div className="text-center max-w-md">
                 <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6 text-brand-600 overflow-hidden">
                    {company.logo ? (
                        <img src={company.logo} alt="Company Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Building2 size={40} />
                    )}
                 </div>
                 <h2 className="text-2xl font-bold text-gray-900 mb-3">Espaço de Trabalho Pronto</h2>
                 <p className="text-gray-500 mb-8">
                    Bem-vindo ao ambiente seguro de {company.nome_fantasia}. 
                    Os módulos estão a inicializar.
                 </p>
                 
                 {/* Skeleton Loading Effect for Modules */}
                 <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none select-none">
                     <div className="h-24 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <div className="w-8 h-8 bg-gray-100 rounded mb-2"></div>
                        <div className="w-16 h-2 bg-gray-100 rounded"></div>
                     </div>
                     <div className="h-24 bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                        <div className="w-8 h-8 bg-gray-100 rounded mb-2"></div>
                        <div className="w-16 h-2 bg-gray-100 rounded"></div>
                     </div>
                 </div>
             </div>
          </div>
      </div>
    </div>
  );
};