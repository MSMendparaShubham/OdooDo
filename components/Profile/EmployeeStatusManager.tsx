import React, { useState } from 'react';
import { User, UserStatus } from '../../types';
import { mockApi } from '../../services/mockApi';

interface EmployeeStatusManagerProps {
  employee: User;
  currentUser: User; // Added missing prop to satisfy fireEmployee requirement
  onUpdate: (user: User) => void;
}

const EmployeeStatusManager: React.FC<EmployeeStatusManagerProps> = ({ employee, currentUser, onUpdate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleStatusTransition = async (newStatus: UserStatus) => {
    if (newStatus === employee.status) return;
    
    setLoading(true);
    try {
      // Fix: updateEmployeeStatus now exists in mockApi
      const updatedUsers = mockApi.updateEmployeeStatus(employee.id, newStatus);
      const updatedUser = updatedUsers.find(u => u.id === employee.id);
      setIsMenuOpen(false);
      if (updatedUser) onUpdate(updatedUser);
    } catch (err) {
      alert("Status update failed. Registry lock encountered.");
    } finally {
      setLoading(false);
    }
  };

  const handleFireProtocol = async () => {
    setLoading(true);
    try {
      // Fix: fireEmployee now receives currentUserId as second argument
      const updatedUsers = mockApi.fireEmployee(employee.id, currentUser.id);
      const updatedUser = updatedUsers.find(u => u.id === employee.id);
      setIsConfirmOpen(false);
      setIsMenuOpen(false);
      if (updatedUser) onUpdate(updatedUser);
    } catch (err: any) {
      alert(err.message || "Fire sequence failed. Identity protection active.");
    } finally {
      setLoading(false);
    }
  };

  const statusStyle = {
    [UserStatus.ACTIVE]: { icon: 'fa-circle-check', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    [UserStatus.ON_LEAVE]: { icon: 'fa-clock-rotate-left', color: 'text-amber-500', bg: 'bg-amber-50' },
    [UserStatus.TERMINATED]: { icon: 'fa-user-slash', color: 'text-rose-500', bg: 'bg-rose-50' },
  };

  const currentConfig = statusStyle[employee.status];

  return (
    <div className="relative">
      {/* 1. INITIAL TRIGGER BUTTON */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="w-full flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-3xl shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-2xl ${currentConfig.bg} dark:bg-opacity-10 flex items-center justify-center ${currentConfig.color} shadow-sm`}>
            <i className={`fa-solid ${currentConfig.icon} text-lg`}></i>
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Status Policy</p>
            <p className="text-base font-black text-gray-900 dark:text-white italic tracking-tight">{employee.status}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
           <i className="fa-solid fa-gear text-gray-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:rotate-90 transition-all duration-500"></i>
           <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage</span>
        </div>
      </button>

      {/* 2. MANAGEMENT MENU MODAL */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !loading && setIsMenuOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-900 w-full max-sm:max-w-xs w-full max-w-sm rounded-[3rem] shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10">
              <header className="mb-8">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Adjust Status</h3>
                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Employee: {employee.employeeId}</p>
              </header>
              
              <div className="space-y-3">
                {/* ACTIVE OPTION */}
                <button 
                  onClick={() => handleStatusTransition(UserStatus.ACTIVE)}
                  disabled={employee.status === UserStatus.ACTIVE || loading}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${employee.status === UserStatus.ACTIVE ? 'bg-emerald-50 border-emerald-500 dark:bg-emerald-900/10' : 'bg-gray-50 border-transparent dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-4">
                    <i className={`fa-solid fa-circle ${employee.status === UserStatus.ACTIVE ? 'text-emerald-500' : 'text-gray-300'} text-[10px]`}></i>
                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Set Active</span>
                  </div>
                  {employee.status === UserStatus.ACTIVE && <i className="fa-solid fa-check text-emerald-600"></i>}
                </button>

                {/* ON LEAVE OPTION */}
                <button 
                  onClick={() => handleStatusTransition(UserStatus.ON_LEAVE)}
                  disabled={employee.status === UserStatus.ON_LEAVE || loading}
                  className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${employee.status === UserStatus.ON_LEAVE ? 'bg-amber-50 border-amber-500 dark:bg-amber-900/10' : 'bg-gray-50 border-transparent dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800'}`}
                >
                  <div className="flex items-center gap-4">
                    <i className={`fa-solid fa-circle ${employee.status === UserStatus.ON_LEAVE ? 'text-amber-500' : 'text-gray-300'} text-[10px]`}></i>
                    <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Set On Leave</span>
                  </div>
                  {employee.status === UserStatus.ON_LEAVE && <i className="fa-solid fa-check text-amber-600"></i>}
                </button>

                {/* FIRE TRIGGER (STEP 1) */}
                <div className="pt-6 mt-4 border-t border-gray-100 dark:border-slate-800">
                  <button 
                    onClick={() => setIsConfirmOpen(true)}
                    className="w-full py-5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 font-black text-xs uppercase tracking-[0.3em] rounded-2xl border border-rose-100 dark:border-rose-900/30 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-500/5"
                  >
                    <i className="fa-solid fa-fire-flame-curved"></i>
                    Fire Employee
                  </button>
                </div>
              </div>
              
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="w-full mt-8 py-2 text-[10px] font-black text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors uppercase tracking-[0.4em] italic"
              >
                Close Protocol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SAFETY CONFIRMATION BOX (STEP 2) */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-rose-950/60 backdrop-blur-xl animate-in fade-in duration-300"></div>
          
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-xs rounded-[3rem] shadow-2xl border-4 border-rose-500/20 p-10 text-center animate-in zoom-in-90 duration-300">
            <div className="w-20 h-20 bg-rose-600 text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl shadow-rose-500/40 ring-4 ring-rose-500/20 animate-bounce">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            
            <h4 className="text-xl font-black text-gray-900 dark:text-white mb-3 uppercase italic tracking-tighter">Permanent Action</h4>
            <p className="text-xs text-gray-500 dark:text-slate-400 font-bold mb-10 leading-relaxed uppercase tracking-wider">
              Are you sure? This will remove {employee.name.split(' ')[0]} from rosters and zero-out liability immediately.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleFireProtocol}
                disabled={loading}
                className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-rose-500/30 hover:bg-rose-700 transition-all active:scale-95"
              >
                {loading ? <i className="fa-solid fa-circle-notch fa-spin text-lg"></i> : 'Yes, Confirm Fire'}
              </button>
              <button 
                onClick={() => setIsConfirmOpen(false)}
                className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Abort Protocol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeStatusManager;