import React, { useState } from 'react';
import { RegistrationData } from '../types';
import { login, registerCompany } from '../services/mockBackend';
import { LayoutDashboard, ArrowRight, Loader2, CheckCircle2, Shield } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

// FIX: Component defined OUTSIDE the main component to prevent re-mounting on every keystroke
const InputField = ({ label, type, value, onChange, placeholder }: any) => (
  <div className="group">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
      {label}
    </label>
    <input
      required
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all duration-200 shadow-sm group-hover:border-gray-300"
      placeholder={placeholder}
    />
  </div>
);

export const AuthScreen: React.FC<Props> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [nif, setNif] = useState('');
  const [fantasyName, setFantasyName] = useState('');
  const [sector, setSector] = useState('Tecnologia');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        const session = await login(email);
        localStorage.setItem('session_user_email', session.user.email);
        onSuccess();
      } else {
        const data: RegistrationData = { email, name, nif, nome_fantasia: fantasyName, setor: sector };
        const session = await registerCompany(data);
        localStorage.setItem('session_user_email', session.user.email);
        onSuccess();
      }
    } catch (err: any) {
      setError(isLogin ? "Utilizador não encontrado." : "Erro ao processar solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  const fillAdmin = () => {
      setEmail('admin@system.com');
      setIsLogin(true);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Panel: Brand Experience */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Abstract decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-brand-600/30 to-purple-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center gap-3 text-white font-medium text-lg tracking-tight">
          <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/10">
             <LayoutDashboard size={20} />
          </div>
          <span>CorporateGuard</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-semibold mb-6 tracking-tight leading-[1.1]">
            Conformidade <br/> Empresarial.
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed font-light">
            Orquestre a validação da sua identidade corporativa e o acesso operacional com uma plataforma desenhada para a empresa moderna.
          </p>
          
          <div className="mt-8 flex gap-4 text-sm text-slate-300">
             <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-500" /> Auditoria Segura
             </div>
             <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-brand-500" /> Preparado para ISO 27001
             </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 font-medium tracking-wide">
          © 2024 CORPORATEGUARD INC.
        </div>
      </div>

      {/* Right Panel: Clean Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-gray-50/50">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-card border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isLogin ? 'Bem-vindo de volta' : 'Inicie a sua candidatura'}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              {isLogin ? 'Insira as suas credenciais para aceder ao espaço de trabalho.' : 'Registe a sua organização para auditoria de conformidade.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Nome do Admin" type="text" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="João Silva" />
                  <InputField label="ID Fiscal (NIF)" type="text" value={nif} onChange={(e: any) => setNif(e.target.value)} placeholder="000.000.000" />
                </div>
                <InputField label="Nome da Empresa" type="text" value={fantasyName} onChange={(e: any) => setFantasyName(e.target.value)} placeholder="Acme Lda" />
                <div className="group">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Setor</label>
                    <div className="relative">
                        <select 
                            value={sector} 
                            onChange={e => setSector(e.target.value)} 
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                        >
                            <option value="Tecnologia">Tecnologia</option>
                            <option value="Finanças">Finanças</option>
                            <option value="Saúde">Saúde</option>
                            <option value="Varejo">Retalho</option>
                        </select>
                        <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
                             <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                        </div>
                    </div>
                </div>
              </div>
            )}
            
            <InputField label="Email Profissional" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="nome@empresa.com" />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3.5 rounded-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin text-gray-400" size={20} />
              ) : (
                <>
                  {isLogin ? 'Entrar' : 'Submeter Candidatura'} <ArrowRight size={16} className="text-gray-400" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4">
            <button
              onClick={() => { setError(''); setIsLogin(!isLogin); }}
              className="text-sm text-gray-600 hover:text-brand-600 font-medium transition-colors"
            >
              {isLogin ? "Não tem conta? Candidate-se agora" : "Já verificado? Entrar"}
            </button>
            
            <button onClick={fillAdmin} className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600 transition-colors">
                <Shield size={10} /> Acesso Admin Sistema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};