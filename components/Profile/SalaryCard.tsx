
import React, { useState, useEffect, useMemo } from 'react';
import { User, UserRole } from '../../types';
import { mockApi, SalaryStructure } from '../../services/mockApi';

interface SalaryCardProps {
  employee: User;
  currentUserRole: UserRole;
  onUpdate?: () => void;
}

const SalaryCard: React.FC<SalaryCardProps> = ({ employee, currentUserRole, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [salaryData, setSalaryData] = useState<SalaryStructure | null>(null);
  const [formData, setFormData] = useState({
    basic: 0,
    hra: 0,
    allowances: 0,
    deductions: 0
  });

  const isAdmin = currentUserRole === UserRole.ADMIN;

  const loadSalary = () => {
    const struct = mockApi.getSalaryStructure(employee.id);
    if (struct) {
      setSalaryData(struct);
      setFormData({
        basic: struct.basic,
        hra: struct.hra,
        allowances: struct.allowances,
        deductions: struct.deductions
      });
    }
  };

  useEffect(() => {
    loadSalary();
  }, [employee.id]);

  const liveNetSalary = useMemo(() => {
    const gross = formData.basic + formData.hra + formData.allowances;
    return gross - formData.deductions;
  }, [formData]);

  const handleSave = () => {
    setLoading(true);
    // Correcting the method call to updateSalaryStructure as updateEmployeeSalary does not exist in mockApi
    mockApi.updateSalaryStructure(employee.id, formData);
    setTimeout(() => {
      setLoading(false);
      setIsEditing(false);
      loadSalary();
      if (onUpdate) onUpdate();
    }, 500);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (salaryData) {
      setFormData({
        basic: salaryData.basic,
        hra: salaryData.hra,
        allowances: salaryData.allowances,
        deductions: salaryData.deductions
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const inputClass = "w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 font-bold text-gray-900 dark:text-white transition-all text-sm";
  const labelClass = "text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block mb-1";

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm transition-theme relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16"></div>
      
      <header className="flex justify-between items-center mb-6 relative z-10">
        <h4 className="font-bold text-gray-900 dark:text-white flex items-center">
          <i className="fa-solid fa-money-bill-transfer mr-2 text-emerald-600 dark:text-emerald-400"></i>
          Salary Structure
        </h4>
        {isAdmin && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
          >
            <i className="fa-solid fa-pen-to-square"></i>
          </button>
        )}
      </header>

      <div className="space-y-4 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Basic Salary</label>
            {isEditing ? (
              <input 
                type="number" 
                value={formData.basic} 
                onChange={e => setFormData({...formData, basic: Number(e.target.value)})}
                className={inputClass}
              />
            ) : (
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-200">{formatCurrency(formData.basic)}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>HRA</label>
            {isEditing ? (
              <input 
                type="number" 
                value={formData.hra} 
                onChange={e => setFormData({...formData, hra: Number(e.target.value)})}
                className={inputClass}
              />
            ) : (
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-200">{formatCurrency(formData.hra)}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Allowances</label>
            {isEditing ? (
              <input 
                type="number" 
                value={formData.allowances} 
                onChange={e => setFormData({...formData, allowances: Number(e.target.value)})}
                className={inputClass}
              />
            ) : (
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(formData.allowances)}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Deductions</label>
            {isEditing ? (
              <input 
                type="number" 
                value={formData.deductions} 
                onChange={e => setFormData({...formData, deductions: Number(e.target.value)})}
                className={`${inputClass} text-red-600`}
              />
            ) : (
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">-{formatCurrency(formData.deductions)}</p>
            )}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-slate-700">
          <label className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">
            {isEditing ? 'Live Net Calculation' : 'Monthly Net Take-Home'}
          </label>
          <div className="flex items-end justify-between">
            <p className={`text-2xl font-black tracking-tight ${liveNetSalary < 0 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
              {formatCurrency(liveNetSalary)}
            </p>
            {isEditing && (
              <div className="flex space-x-2">
                <button 
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={loading || liveNetSalary < 0}
                  className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Structure'}
                </button>
              </div>
            )}
          </div>
          {isEditing && liveNetSalary < 0 && (
            <p className="text-[10px] font-bold text-red-500 mt-2 uppercase tracking-tight italic">
              <i className="fa-solid fa-triangle-exclamation mr-1"></i> Deductions cannot exceed gross pay.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryCard;
