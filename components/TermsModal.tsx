import React, { useState, useRef } from 'react';
import { Scroll, ShieldCheck, Lock, FileText } from 'lucide-react';

interface TermsModalProps {
  onAccept: () => void;
  isAccepting: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onAccept, isAccepting }) => {
  const [canAccept, setCanAccept] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const element = contentRef.current;
    if (!element) return;
    const { scrollTop, clientHeight, scrollHeight } = element;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      setCanAccept(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"></div>

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300 border border-gray-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-700 border border-gray-100">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Acordo de Conformidade</h2>
              <p className="text-sm text-gray-500">Leia os Termos de Uso para desbloquear o acesso ao painel.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
             <Lock size={12} /> Obrigatório
          </div>
        </div>

        {/* Scrollable Content */}
        <div 
          ref={contentRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-8 py-8 space-y-6 text-gray-600 text-justify leading-7 bg-gray-50/30 scroll-smooth"
        >
          <div className="prose prose-sm prose-slate max-w-none">
             <h3 className="text-lg font-bold text-gray-900 mb-4">Termos de Aceitação e Uso da Rede (v1.0)</h3>
            
             <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-800 text-sm mb-6">
                <strong>Resumo Executivo:</strong> O acesso à Rede Operacional CorporateGuard requer adesão estrita à conformidade fiscal e protocolos de confidencialidade de dados.
             </div>

             <p>
                1. <strong>Introdução</strong>. Bem-vindo à Plataforma de Gestão Corporativa. A utilização desta plataforma está condicionada à aceitação integral destes termos. Ao aceitar, confirma que a empresa que representa cumpre com os regulamentos fiscais em vigor.
             </p>
             <p>
                2. <strong>Responsabilidade dos Dados</strong>. A empresa declara que todos os dados fornecidos, incluindo o NIF e Setor, são exatos. O uso indevido da plataforma para fins ilícitos resultará na suspensão imediata e comunicação às autoridades competentes.
             </p>
             <p>
                3. <strong>Confidencialidade</strong>. Toda a informação trocada dentro do ambiente "Rede Operacional" é confidencial. A partilha de capturas de ecrã, dados de API ou credenciais com terceiros não autorizados é estritamente proibida.
             </p>
             <p>
                4. <strong>Auditoria Contínua</strong>. A plataforma reserva-se o direito de realizar auditorias periódicas às contas de empresas aprovadas. Se o estado de validação mudar para "Rejeitado", o acesso será revogado instantaneamente.
             </p>
             <p>
                5. <strong>Propriedade Intelectual</strong>. Todo o software, design e lógica de negócio pertencem à CorporateGuard Inc.
             </p>
             <p>
                6. <strong>Disposições Finais</strong>. Este acordo é regido pelas leis locais de proteção de dados e comércio digital.
             </p>
          </div>
          
          <div className="pt-12 pb-4 flex flex-col items-center justify-center text-gray-400 gap-2">
            <div className="w-16 h-1 bg-gray-200 rounded-full"></div>
            <span className="text-xs uppercase tracking-widest font-medium">Fim do Documento</span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-white flex justify-between items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-sm">
            {canAccept ? (
              <span className="text-emerald-600 flex items-center gap-1.5 font-medium animate-in fade-in">
                <ShieldCheck size={18} /> Leitura Confirmada
              </span>
            ) : (
              <span className="text-gray-400 flex items-center gap-1.5 animate-pulse">
                <Scroll size={18} /> Role até ao fim para assinar
              </span>
            )}
          </div>

          <button
            onClick={onAccept}
            disabled={!canAccept || isAccepting}
            className={`
              px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2
              ${canAccept 
                ? 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200 transform hover:-translate-y-0.5' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'}
            `}
          >
            {isAccepting ? 'A Registar Assinatura...' : 'Aceitar e Assinar Digitalmente'}
          </button>
        </div>

      </div>
    </div>
  );
};