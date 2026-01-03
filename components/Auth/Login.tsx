import React, { useState } from 'react';
import { User } from '../../types';
import PasswordInput from './PasswordInput';
import { mockApi } from '../../services/mockApi';

interface LoginProps {
  onLogin: (data: { token: string, user: User }) => void;
  onGoToSignUp: () => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, demoEmail?: string) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const targetEmail = demoEmail || email;
    const targetPass = demoEmail ? 'password123' : password;

    try {
      const result = await mockApi.mockLogin(targetEmail, targetPass);
      onLogin(result);
    } catch (err: any) {
      setError(err.message || 'Login failed. Local vault could not be accessed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-12 transition-all border border-gray-100 dark:border-slate-800">
        {/* Rebranded Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            OdooDo
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mt-1">
            Workplace productivity
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center animate-in shake duration-500">
            <i className="fa-solid fa-triangle-exclamation mr-3 text-lg"></i>
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] pl-1">Identity Email</label>
            <div className="relative group">
              <i className="fa-solid fa-id-card absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors"></i>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="identity@odoodo.com"
                className="w-full pl-14 pr-5 py-5 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-600/10 rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-sm dark:text-white"
                required
              />
            </div>
          </div>

          <PasswordInput 
            value={password}
            onChange={setPassword}
            showChecklist={false}
          />

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin text-lg"></i> : 'Authorize Session'}
          </button>
        </form>

        {/* Quick Access Demo Section */}
        <div className="mt-8 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 text-center">Quick Access Identities</p>
          <div className="flex gap-2">
            <button 
              onClick={() => handleSubmit(undefined, 'admin@odoodo.com')}
              className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 transition-colors"
            >
              HR Admin
            </button>
            <button 
              onClick={() => handleSubmit(undefined, 'employee@odoodo.com')}
              className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-50 transition-colors"
            >
              Staff Member
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
            Don't have an ID? <button onClick={onGoToSignUp} className="text-blue-600 hover:underline">Provision Now</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;