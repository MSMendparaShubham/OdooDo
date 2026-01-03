import React, { useState } from 'react';
import { User, UserStatus, UserRole } from '../../types';
import { mockApi } from '../../services/mockApi';

interface StatusManagerCardProps {
  employee: User;
  onUpdate: (updatedUser: User) => void;
}

const StatusManagerCard: React.FC<StatusManagerCardProps> = ({ employee, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: UserStatus) => {
    if (newStatus === employee.status) return;

    // Safety Mechanism for Termination
    if (newStatus === UserStatus.TERMINATED) {
      const confirmed = window.confirm(
        `CRITICAL ACTION: Are you sure you want to fire ${employee.name}? \n\nThis employee will lose all access to the Dayflow portal immediately and their credentials will be invalidated.`
      );
      if (!confirmed) return;
    }

    setLoading(true);
    try {
      // Small simulated network lag for UX feedback
      await new Promise(r => setTimeout(r, 400));
      // Fix: updateEmployeeStatus now exists in mockApi
      const updatedUsers = mockApi.updateEmployeeStatus(employee.id, newStatus);
      // Find and pass the single updated user instead of the entire array
      const updatedUser = updatedUsers.find(u => u.id === employee.id);
      if (updatedUser) onUpdate(updatedUser);
    } catch (err) {
      console.error(err);
      alert("Failed to update status. Registry error.");
    } finally {
      setLoading(false);
    }
  };

  const statusConfigs = {
    [UserStatus.ACTIVE]: {
      label: "Active",
      actionLabel: "Keep it on",
      color: "emerald",
      icon: "fa-circle-check"
    },
    [UserStatus.ON_LEAVE]: {
      label: "On Leave",
      actionLabel: "Set it on rest",
      color: "amber",
      icon: "fa-mug-hot"
    },
    [UserStatus.TERMINATED]: {
      label: "Terminated",
      actionLabel: "Set it fire",
      color: "rose",
      icon: "fa-user-slash"
    }
  };

  const currentConfig = statusConfigs[employee.status];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-theme relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${currentConfig.color}-500/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110`}></div>
      
      <header className="mb-6 relative z-10">
        <h4 className="font-bold text-gray-900 dark:text-white flex items-center text-sm uppercase tracking-widest">
          <i className="fa-solid fa-shield-halved mr-2 text-blue-500"></i>
          Employment Status
        </h4>
      </header>

      <div className="space-y-6 relative z-10">
        {/* Dynamic Badge */}
        <div className={`flex items-center p-4 bg-${currentConfig.color}-50 dark:bg-${currentConfig.color}-900/20 rounded-2xl border border-${currentConfig.color}-100 dark:border-${currentConfig.color}-900/30 transition-all duration-500`}>
          <div className={`w-10 h-10 rounded-full bg-${currentConfig.color}-500 flex items-center justify-center text-white shadow-lg shadow-${currentConfig.color}-500/20`}>
            <i className={`fa-solid ${currentConfig.icon}`}></i>
          </div>
          <div className="ml-4">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] text-${currentConfig.color}-600 dark:text-${currentConfig.color}-400`}>Current Standing</p>
            <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">{currentConfig.label}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 gap-2">
          {Object.values(UserStatus).map((status) => {
            const config = statusConfigs[status];
            const isActive = employee.status === status;

            return (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={loading || isActive}
                className={`
                  relative flex items-center justify-between px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                  ${isActive 
                    ? `bg-${config.color}-500 text-white shadow-md shadow-${config.color}-500/20 cursor-default ring-2 ring-offset-2 ring-${config.color}-500 dark:ring-offset-slate-800` 
                    : `bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent hover:border-gray-200 dark:hover:border-slate-600`
                  }
                  ${loading ? 'opacity-50 cursor-wait' : ''}
                `}
              >
                <span>{config.actionLabel}</span>
                {isActive && <i className="fa-solid fa-check ml-2"></i>}
              </button>
            );
          })}
        </div>
      </div>
      
      <p className="mt-4 text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest text-center italic">
        <i className="fa-solid fa-circle-info mr-1"></i> Changes are recorded in local audit vault
      </p>
    </div>
  );
};

export default StatusManagerCard;