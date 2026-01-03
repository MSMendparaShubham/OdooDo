import React, { useState, useEffect, useMemo } from 'react';
import { mockApi, SalaryStructure } from '../../services/mockApi';

interface SalaryEditModalProps {
  userId: string;
  onClose: () => void;
  onSave: () => void;
}

const SalaryEditModal: React.FC<SalaryEditModalProps> = ({ userId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    basic: 0,
    hra: 0,
    allowances: 0,
    deductions: 0
  });
  const [loading, setLoading] = useState(false);
  const user = mockApi.getUsers().find(u => u.id === userId);

  useEffect(() => {
    const struct = mockApi.getAllSalaryStructures().find(s => s.userId === userId);
    if (struct) {
      setFormData({
        basic: struct.basic,
        hra: struct.hra,
        allowances: struct.allowances,
        deductions: struct.deductions
      });
    }
  }, [userId]);

  const calculations = useMemo(() => {
    const gross = formData.basic + formData.hra + formData.allowances;
    const net = gross - formData.deductions;
    return { gross, net };
  }, [formData]);

  const isValid = calculations.net >= 0;

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    mockApi.updateSalaryStructure(userId, formData);
    setTimeout(() => {
      setLoading(false);
      onSave();
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-900 rounded-xl outline-none transition-all font-bold text-gray-900 dark:text-white";
  const labelClass = "text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest pl-1 mb-2 block";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <header className="p-8 pb-4 border-b border-gray-50 dark:border-slate-800">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Adjust Structure</h3>
              <p className="text-xs font-bold text-gray-400 dark:text-slate-500 mt-1">Configuring payroll for <span className="text-blue-600">{user?.name}</span></p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-400 transition-colors">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </header>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Basic Salary</label>
              <input 
                type="number" 
                value={formData.basic} 
                onChange={e => setFormData({...formData, basic: Number(e.target.value)})}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>HRA (Rent Allowance)</label>
              <input 
                type="number" 
                value={formData.hra} 
                onChange={e => setFormData({...formData, hra: Number(e.target.value)})}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Fixed Allowances</label>
              <input 
                type="number" 
                value={formData.allowances} 
                onChange={e => setFormData({...formData, allowances: Number(e.target.value)})}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Monthly Deductions</label>
              <input 
                type="number" 
                value={formData.deductions} 
                onChange={e => setFormData({...formData, deductions: Number(e.target.value)})}
                className={`${inputClass} text-red-600 focus:border-red-500/20`}
              />
            </div>
          </div>

          {/* Accuracy Preview Card */}
          <div className={`p-6 rounded-[2rem] border-2 transition-all duration-500 ${!isValid ? 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-gray-50 border-gray-100 dark:bg-slate-800 dark:border-slate-700'}`}>
            <p className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Live Preview Ledger</p>
            
            <div className="flex justify-between items-end gap-2">
              <div className="text-center flex-1">
                <p className="text-[9px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Gross</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(calculations.gross)}</p>
              </div>
              <div className="pb-1 text-gray-300 font-bold">-</div>
              <div className="text-center flex-1">
                <p className="text-[9px] font-bold text-gray-500 dark:text-slate-400 uppercase mb-1">Deductions</p>
                <p className="text-sm font-bold text-red-500">{formatCurrency(formData.deductions)}</p>
              </div>
              <div className="pb-1 text-gray-300 font-bold">=</div>
              <div className="text-center flex-1">
                <p className="text-[9px] font-bold text-blue-600 uppercase mb-1 tracking-widest">Net Payable</p>
                <p className={`text-xl font-black ${!isValid ? 'text-red-600' : 'text-blue-600 dark:text-blue-400'}`}>
                  {formatCurrency(calculations.net)}
                </p>
              </div>
            </div>

            {!isValid && (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-600 text-[10px] font-black uppercase tracking-widest animate-pulse">
                <i className="fa-solid fa-circle-exclamation"></i>
                Invalid Financial Structure: Net Salary Cannot Be Negative
              </div>
            )}
          </div>
        </div>

        <footer className="p-8 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-white dark:bg-slate-900 text-gray-400 font-black text-xs uppercase tracking-widest rounded-2xl border border-gray-100 dark:border-slate-700 hover:bg-gray-100 transition-all"
          >
            Discard
          </button>
          <button 
            onClick={handleSave}
            disabled={!isValid || loading}
            className="flex-[2] py-4 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Confirm Structure'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SalaryEditModal;