import React, { useEffect, useState } from 'react';
import { SessionData, ValidationStatus, TermsAcceptance, Company } from './types';
import { login, clearSession } from './services/mockBackend';
import { AuthScreen } from './components/AuthScreen';
import { PendingScreen } from './components/PendingScreen';
import { Dashboard } from './components/Dashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Global State Machine
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);

  // 1. Session Restoration (Simulates middleware check on mount)
  const refreshSession = async () => {
    setLoading(true);
    const storedEmail = localStorage.getItem('session_user_email');
    if (storedEmail) {
      try {
        const data = await login(storedEmail);
        setSession(data);
      } catch (e) {
        console.error("Session invalid");
        localStorage.removeItem('session_user_email');
        setSession(null);
      }
    } else {
        setSession(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession(null);
  };

  const handleStatusUpdate = (updatedCompany: Company) => {
      if (!session) return;
      setSession({
          ...session,
          company: updatedCompany
      });
  };

  const handleTermsAccepted = (terms: TermsAcceptance) => {
    if (!session) return;
    setSession({
        ...session,
        terms: terms
    });
  };

  // 2. Loading State - Minimalist Centered Loader
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-white text-gray-900">
        <Loader2 className="animate-spin text-gray-900 mb-4" size={32} strokeWidth={1.5} />
        <div className="text-xs font-medium tracking-widest text-gray-400 uppercase">Secure Boot</div>
      </div>
    );
  }

  // 3. State Router Logic
  
  if (!session) {
    return <AuthScreen onSuccess={refreshSession} />;
  }

  // SYSTEM ADMIN ROUTE (Separated Logic)
  if (session.user.email === 'admin@system.com') {
      return <AdminDashboard onLogout={handleLogout} />;
  }

  // STANDARD USER FLOW
  if (session.company.status_validacao === ValidationStatus.PENDING) {
    return (
      <PendingScreen 
        user={session.user} 
        company={session.company} 
        onStatusUpdate={handleStatusUpdate}
        onLogout={handleLogout}
      />
    );
  }

  if (session.company.status_validacao === ValidationStatus.REJECTED) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Rejected</h1>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">Your company does not meet the compliance requirements at this time.</p>
        <button onClick={handleLogout} className="text-gray-900 font-semibold border-b border-gray-900 pb-0.5 hover:text-gray-600 hover:border-gray-600 transition-colors">Return to Sign In</button>
      </div>
    );
  }

  if (session.company.status_validacao === ValidationStatus.APPROVED) {
    return (
      <Dashboard 
        user={session.user} 
        company={session.company} 
        terms={session.terms || null}
        onTermsAccepted={handleTermsAccepted}
        onLogout={handleLogout}
      />
    );
  }

  return <div>Unknown State Error</div>;
};

export default App;