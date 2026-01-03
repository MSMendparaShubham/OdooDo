import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { mockApi, SalaryStructure } from '../../services/mockApi';
import SalaryEditModal from './SalaryEditModal';

const AdminPayrollTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const loadData = () => {
    const allUsers = mockApi.getUsers().filter(u => u.role === UserRole.EMPLOYEE);
    const allStructures = mockApi.getAllSalaryStructures();
    setUsers(allUsers);
    setStructures(allStructures);
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStructureForUser = (userId: string) => {
    return structures.find(s => s.userId === userId);
  };

  const handleEdit = (userId: string) => {
    setEditingUserId(userId);
  };

  const handleUpdate = () => {
    loadData();
    setEditingUserId(null);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden transition-theme">
      <div className="p-6 border-b border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/30 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
            <i className="fa-solid fa-money-check-dollar mr-2 text-emerald-600"></i>
            Master Salary Roster
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Viewing {users.length} active employee compensation structures.</p>
        </div>
        <button className="h-9 px-4 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
          <i className="fa-solid fa-file-export"></i> Export Financials
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-slate-900/50 text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-700">
              <th className="px-6 py-4">Employee Details</th>
              <th className="px-6 py-4">Basic Pay</th>
              <th className="px-6 py-4">HRA</th>
              <th className="px-6 py-4">Allowances</th>
              <th className="px-6 py-4">Deductions</th>
              <th className="px-6 py-4">Net Salary</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {users.map(user => {
              const struct = getStructureForUser(user.id);
              if (!struct) return null;

              return (
                <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img src={user.profilePic} className="w-8 h-8 rounded-full border border-gray-100" alt="" />
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-slate-200 leading-none">{user.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">ID: {user.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">{formatCurrency(struct.basic)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-gray-600 dark:text-slate-400">{formatCurrency(struct.hra)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(struct.allowances)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">-{formatCurrency(struct.deductions)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(struct.netSalary)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleEdit(user.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                    >
                      <i className="fa-solid fa-pencil"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingUserId && (
        <SalaryEditModal 
          userId={editingUserId} 
          onClose={() => setEditingUserId(null)} 
          onSave={handleUpdate} 
        />
      )}
    </div>
  );
};

export default AdminPayrollTable;