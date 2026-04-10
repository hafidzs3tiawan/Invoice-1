import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { useHydrated } from '@/hooks/useHydrated';
import { useWizardStore } from '@/store/wizardStore';
import Step1Klien from '@/components/wizard/Step1Klien';
import Step2Barang from '@/components/wizard/Step2Barang';
import Step3Review from '@/components/wizard/Step3Review';
import { jwtDecode } from 'jwt-decode';

export default function Home() {
  const router = useRouter();
  const hydrated = useHydrated();
  const step = useWizardStore(state => state.step);
  const [authChecking, setAuthChecking] = useState(true);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.replace('/login');
    } else {
      try {
        const decoded: any = jwtDecode(token);
        setUserRole(decoded.role || 'User');
        setAuthChecking(false);
      } catch(e) {
        Cookies.remove('token');
        router.replace('/login');
      }
    }
  }, [router]);

  if (!hydrated || authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const logout = () => {
    Cookies.remove('token');
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-gray-900 font-sans pb-16">
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <div className="bg-blue-600 p-2 rounded-lg text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
             </div>
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800">
                Invoice Generator
             </h1>
          </div>
          <div className="flex items-center space-x-4">
             <span className="text-sm font-medium bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                Logged in as <strong className="font-bold">{userRole}</strong>
             </span>
             <button onClick={logout} className="text-sm text-gray-500 hover:text-red-700 font-semibold bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-4 py-2 rounded-lg transition-all">Logout</button>
          </div>
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto pt-10 px-4">
        {/* Wizard Progress Bar */}
        <div className="mb-10 px-4">
           <div className="flex items-center justify-between relative max-w-2xl mx-auto">
              <div className="absolute top-1/2 transform -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-200 z-0 rounded-full"></div>
              <div className={`absolute top-1/2 transform -translate-y-1/2 left-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 z-0 transition-all duration-700 ease-in-out rounded-full`} style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>
              
              {[1, 2, 3].map((s) => (
                 <div key={s} className={`relative z-10 text-sm font-bold flex items-center justify-center w-10 h-10 rounded-full transition-all duration-500 shadow-sm
                    ${step >= s ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-200 scale-110' : 'bg-white text-gray-400 border-2 border-gray-200'}`}>
                    {s}
                 </div>
              ))}
           </div>
           <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-wider text-gray-400 max-w-2xl mx-auto">
              <span className={`w-20 text-center ${step >= 1 ? 'text-blue-600 font-extrabold' : ''}`}>Client Info</span>
              <span className={`w-20 text-center ${step >= 2 ? 'text-blue-600 font-extrabold' : ''}`}>Items Detail</span>
              <span className={`w-20 text-center ${step >= 3 ? 'text-blue-600 font-extrabold' : ''}`}>Review & Submit</span>
           </div>
        </div>

        <div className="mt-8 transition-opacity duration-300">
          {step === 1 && <Step1Klien />}
          {step === 2 && <Step2Barang />}
          {step === 3 && <Step3Review />}
        </div>
      </main>
    </div>
  );
}
