import React, { useState } from 'react';
import { Company, User, TermsAcceptance } from '../types';
import { acceptTerms, updateCompanyProfile } from '../services/mockBackend';
import { TermsModal } from './TermsModal';
import { OperationalDashboard } from './OperationalDashboard';
import { Building2, FileCheck, ShieldCheck, ArrowRight, User as UserIcon, LogOut, Lock, Search, Edit3, MapPin, Phone, FileText, Camera, X, Loader2, Globe, Sparkles, Moon, Settings, HelpCircle, ChevronDown } from 'lucide-react';

interface Props {
  user: User;
  company: Company;
  terms: TermsAcceptance | null;
  onTermsAccepted: (terms: TermsAcceptance) => void;
  onLogout: () => void;
}

export const Dashboard: React.FC<Props> = ({ user, company, terms, onTermsAccepted, onLogout }) => {
  const [isSigning, setIsSigning] = useState(false);
  const [showOperational, setShowOperational] = useState(false);
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Profile Menu Dropdown State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // Local state for immediate UI updates
  const [localCompany, setLocalCompany] = useState<Company>(company);

  const needsToSign = !terms;

  const handleSignTerms = async () => {
    setIsSigning(true);
    try {
      const newTerms = await acceptTerms(user.id);
      onTermsAccepted(newTerms);
    } catch (e) {
      alert("Erro ao assinar os termos.");
    } finally {
      setIsSigning(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSavingProfile(true);
      
      const formData = new FormData(e.currentTarget);
      const updates = {
          address: formData.get('address') as string,
          phone: formData.get('phone') as string,
          description: formData.get('description') as string,
          logo: localCompany.logo // Already updated via file reader
      };

      try {
          const updated = await updateCompanyProfile(company.id, updates);
          setLocalCompany(updated);
          setIsEditingProfile(false);
      } catch (err) {
          alert('Falha ao atualizar o perfil');
      } finally {
          setIsSavingProfile(false);
      }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setLocalCompany(prev => ({ ...prev, logo: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const TopBar = () => (
    <div className="bg-white border-b border-gray-200 h-16 px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
                <ShieldCheck size={18} />
            </div>
            <span>CorporateGuard</span>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-1.5 border border-gray-200 focus-within:bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
                <Search size={14} className="text-gray-400 mr-2" />
                <input className="bg-transparent border-none outline-none text-sm text-gray-700 w-48 placeholder-gray-400" placeholder="Pesquisar documentação..." />
            </div>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            
            {/* User Profile Dropdown Area */}
            <div className="relative">
                <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors outline-none focus:ring-2 focus:ring-gray-100"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900 leading-none">{user.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold mt-1 tracking-wide text-brand-600">{user.role}</p>
                    </div>
                    <div className="w-9 h-9 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 overflow-hidden">
                        <UserIcon size={16} />
                    </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                    <>
                        {/* Invisible backdrop to close on click outside */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)}></div>
                        
                        <div className="absolute right-0 top-full mt-2 w-72 bg-[#1E1E1E] text-gray-200 rounded-2xl shadow-2xl border border-gray-800 p-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            {/* Header Info */}
                            <div className="flex items-center gap-3 p-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-900/20 shrink-0">
                                    {getInitials(user.name)}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="h-px bg-gray-700/50 mx-2 mb-2"></div>

                            {/* Menu Items */}
                            <div className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2C2C2C] transition-colors text-sm font-medium text-gray-300 hover:text-white group">
                                    <Sparkles size={16} className="text-gray-400 group-hover:text-emerald-400 transition-colors" /> 
                                    Atualizar plano
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2C2C2C] transition-colors text-sm font-medium text-gray-300 hover:text-white group">
                                    <Moon size={16} className="text-gray-400 group-hover:text-brand-400 transition-colors" /> 
                                    Personalização
                                </button>
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2C2C2C] transition-colors text-sm font-medium text-gray-300 hover:text-white group">
                                    <Settings size={16} className="text-gray-400 group-hover:text-brand-400 transition-colors" /> 
                                    Definições
                                </button>
                            </div>

                            <div className="h-px bg-gray-700/50 mx-2 my-2"></div>

                            <div className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2C2C2C] transition-colors text-sm font-medium text-gray-300 hover:text-white group">
                                    <HelpCircle size={16} className="text-gray-400 group-hover:text-brand-400 transition-colors" /> 
                                    Ajuda
                                </button>
                                <button 
                                    onClick={onLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2C2C2C] transition-colors text-sm font-medium text-gray-300 hover:text-red-400 group"
                                >
                                    <LogOut size={16} className="text-gray-400 group-hover:text-red-400 transition-colors" /> 
                                    Terminar sessão
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    </div>
  );

  const StatusBadge = ({ active }: { active: boolean }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        active 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' 
        : 'bg-amber-50 text-amber-700 border-amber-200/60'
    }`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
        {active ? 'Em Conformidade' : 'Atenção Necessária'}
    </span>
  );

  const EditProfileModal = () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Editar Perfil</h3>
                    <p className="text-xs text-gray-500">Atualize os dados públicos da sua organização.</p>
                  </div>
                  <button onClick={() => setIsEditingProfile(false)} className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="overflow-y-auto p-6 space-y-6 bg-white">
                  {/* Logo Upload */}
                  <div className="flex flex-col items-center justify-center mb-2">
                      <div className="relative group cursor-pointer">
                          <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg ring-1 ring-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden">
                              {localCompany.logo ? (
                                  <img src={localCompany.logo} alt="Logótipo" className="w-full h-full object-cover" />
                              ) : (
                                  <Building2 size={40} className="text-gray-300" />
                              )}
                          </div>
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                             <Camera size={20} className="text-white" />
                          </div>
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer rounded-full" />
                      </div>
                      <span className="text-xs text-brand-600 font-medium mt-3 hover:underline cursor-pointer">Alterar Logótipo</span>
                  </div>

                  <div className="space-y-5">
                      <div>
                          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Descrição da Empresa</label>
                          <textarea 
                            name="description" 
                            rows={3} 
                            defaultValue={localCompany.description}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none shadow-sm"
                            placeholder="Descreva brevemente a missão da sua empresa..."
                          ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Morada Comercial</label>
                            <div className="relative">
                                <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    name="address" 
                                    type="text" 
                                    defaultValue={localCompany.address}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                                    placeholder="Rua Exemplo, 123"
                                />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Telefone</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input 
                                    name="phone" 
                                    type="tel" 
                                    defaultValue={localCompany.phone}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm"
                                    placeholder="+351 ..."
                                />
                            </div>
                          </div>
                      </div>
                  </div>

                  <div className="pt-6 flex gap-3 border-t border-gray-100 mt-2">
                      <button 
                        type="button" 
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
                      >
                          Cancelar
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSavingProfile}
                        className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-black disabled:opacity-70 flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
                      >
                          {isSavingProfile && <Loader2 size={16} className="animate-spin" />}
                          Guardar Alterações
                      </button>
                  </div>
              </form>
          </div>
      </div>
  );

  const InstitutionalView = () => (
    <div className="max-w-6xl mx-auto py-10 px-6">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Visão Geral</h1>
            <p className="text-gray-500 mt-2 text-lg">Gira a sua identidade institucional e o estado de conformidade.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Entity Card - 2/3 Width */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden flex flex-col">
            {/* Banner Decor - Google AI Studio Style */}
            <div className="h-48 bg-black relative overflow-hidden group">
                {/* CSS Grid Pattern */}
                <div 
                    className="absolute inset-0 opacity-20" 
                    style={{
                        backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }}
                ></div>
                
                {/* Radial Gradient Glow (Degrade) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                {/* Center Content (Logo/Name like AI Studio) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="flex items-center gap-3 animate-in fade-in zoom-in-95 duration-700">
                         <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10 text-white">
                             <ShieldCheck size={32} />
                         </div>
                         <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
                             CorporateGuard
                         </h1>
                     </div>
                </div>

                <div className="absolute top-4 right-4 z-10">
                    <button 
                        onClick={() => setIsEditingProfile(true)}
                        className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 transition-all shadow-sm"
                    >
                        <Edit3 size={14} /> Editar Perfil
                    </button>
                </div>
            </div>

            <div className="px-8 pb-8 relative">
                {/* Logo overlapping banner */}
                <div className="w-24 h-24 bg-white rounded-xl shadow-lg border border-gray-100 absolute -top-12 left-8 flex items-center justify-center overflow-hidden z-10">
                     {localCompany.logo ? (
                        <img src={localCompany.logo} alt="Company Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Building2 size={40} className="text-gray-300" />
                    )}
                </div>

                <div className="mt-16 flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-1">{localCompany.nome_fantasia}</h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            {localCompany.setor}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                         <div className="bg-green-50 text-green-700 border border-green-200/60 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            {localCompany.status_validacao}
                         </div>
                    </div>
                </div>

                {localCompany.description ? (
                    <p className="text-gray-600 leading-relaxed mb-8 max-w-2xl text-sm">
                        {localCompany.description}
                    </p>
                ) : (
                    <div className="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg text-sm text-gray-400 mb-8 italic">
                        Nenhuma descrição fornecida. Adicione uma descrição para melhorar o seu perfil.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <FileText size={16} />
                            </div>
                            <div>
                                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">NIF</span>
                                <span className="text-sm font-medium text-gray-900 font-mono">{localCompany.nif}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <Globe size={16} />
                            </div>
                            <div>
                                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ID Entidade</span>
                                <span className="text-sm font-medium text-gray-500 truncate max-w-[150px]" title={localCompany.id}>
                                    {localCompany.id}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <MapPin size={16} />
                            </div>
                            <div>
                                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Morada</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {localCompany.address || <span className="text-gray-400 italic font-normal">Não definida</span>}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                <Phone size={16} />
                            </div>
                            <div>
                                <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Telefone</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {localCompany.phone || <span className="text-gray-400 italic font-normal">Não definido</span>}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Compliance & Actions */}
        <div className="flex flex-col gap-6">
            
            {/* Compliance Card */}
            <div className="bg-white p-6 rounded-2xl shadow-card border border-gray-200">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                            <FileCheck size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 text-sm">Conformidade Legal</h3>
                            <p className="text-xs text-gray-500">Estado Atual</p>
                        </div>
                    </div>
                    <StatusBadge active={!!terms} />
                </div>
                
                <div className="space-y-3">
                     <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-gray-500">Acordo TdU</span>
                        <span className="text-gray-900 font-bold">v1.0</span>
                     </div>
                     <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-gray-500">Validação</span>
                        <span className="text-gray-900 font-medium">Automática</span>
                     </div>
                     <div className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="text-gray-500">Data Aprov.</span>
                        <span className="text-gray-900 font-medium">{company.data_aprovacao ? new Date(company.data_aprovacao).toLocaleDateString() : '-'}</span>
                     </div>
                </div>
            </div>

            {/* Gateway Card (Mini) */}
            <div className="bg-gray-900 rounded-2xl p-6 shadow-float relative overflow-hidden text-white flex-1 flex flex-col justify-between">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
                
                <div className="relative z-10">
                    <div className="flex items-center gap-2 text-brand-400 font-semibold mb-3">
                        <Lock size={16} /> Gateway Seguro
                    </div>
                    <h3 className="text-xl font-bold mb-2">Painel Operacional</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6">
                        Acesso exclusivo à rede de transações seguras.
                    </p>
                </div>

                <button 
                    onClick={() => setShowOperational(true)}
                    className="relative z-10 w-full bg-white text-gray-900 hover:bg-gray-100 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    Entrar na Rede
                    <ArrowRight size={16} />
                </button>
            </div>

        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <TopBar />
      
      {needsToSign && (
        <TermsModal onAccept={handleSignTerms} isAccepting={isSigning} />
      )}
      
      {isEditingProfile && <EditProfileModal />}

      {showOperational ? (
        <OperationalDashboard company={localCompany} onBack={() => setShowOperational(false)} />
      ) : (
        <InstitutionalView />
      )}
    </div>
  );
};