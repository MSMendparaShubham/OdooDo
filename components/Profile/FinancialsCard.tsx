import React, { useState, useEffect } from 'react';
import { mockApi } from '../../services/mockApi';
import { User, UserRole } from '../../types';

interface FinancialsCardProps {
  employee: User;
  currentUser: User;
  onUpdate?: () => void;
}

const FinancialsCard: React.FC<FinancialsCardProps> = ({ employee, currentUser, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    basic: 0,
    hra: 0,
    allowances: 0,
    deductions: 0,
  });

  // Sync with mockApi on mount or employee change to fetch full salary breakdown
  useEffect(() => {
    const struct = mockApi.getSalaryStructure(employee.id);
    if (struct) {
      setFormData({
        basic: struct.basic,
        hra: struct.hra,
        allowances: struct.allowances,
        deductions: struct.deductions,
      });
    }
  }, [employee.id]);

  // Calculate Net Salary on the fly for live accuracy preview
  const netSalary = Number(formData.basic) + Number(formData.hra) + Number(formData.allowances) - Number(formData.deductions);

  const handleSave = () => {
    // Call API to update the structure in the vault
    mockApi.updateSalaryStructure(employee.id, formData);
    setIsEditing(false);
    if (onUpdate) onUpdate(); // Refresh parent to sync views
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-theme">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Financials & Payroll</h3>
        
        {/* STRICT ADMIN CHECK: Only show edit button to HR Administrators */}
        {currentUser?.role === UserRole.ADMIN && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1 rounded-md text-sm font-medium transition flex items-center gap-1"
          >
            ✏️ Edit Structure
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* REUSABLE FIELD LOGIC: Maps Basic, HRA, Allowances, Deductions */}
        {(['basic', 'hra', 'allowances', 'deductions'] as const).map((field) => (
          <div key={field} className="flex flex-col">
            <label className="text-xs uppercase text-gray-500 dark:text-slate-400 font-semibold mb-1 tracking-wider">
              {field}
            </label>
            {isEditing ? (
              <input
                type="number"
                value={formData[field]}
                onChange={(e) => setFormData({...formData, [field]: Number(e.target.value)})}
                className="border dark:border-slate-600 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-900 dark:text-white font-bold"
              />
            ) : (
              <span className="text-gray-900 dark:text-slate-200 font-medium text-lg">
                ${Number(formData[field]).toLocaleString()}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* NET SALARY HIGHLIGHT: Visual confirmation of total take-home pay */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-end bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg">
        <span className="text-gray-500 dark:text-slate-400 font-medium text-sm">Net Salary (Monthly)</span>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          ${netSalary.toLocaleString()}
        </span>
      </div>

      {/* SAVE/CANCEL BUTTONS: Only visible during active administrative sessions */}
      {isEditing && (
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all font-bold text-xs uppercase tracking-widest"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default FinancialsCard;