import React from 'react';
import { LeaveRequest, LeaveStatus } from '../../types';

interface EmployeeLeaveListProps {
  leaves: LeaveRequest[];
}

const EmployeeLeaveList: React.FC<EmployeeLeaveListProps> = ({ leaves }) => {
  return (
    <div className="space-y-4">
      {leaves.length === 0 && (
        <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-dashed border-gray-300 dark:border-slate-700 transition-theme">
          <i className="fa-solid fa-folder-open text-4xl text-gray-200 dark:text-slate-700 mb-4 block"></i>
          <p className="text-gray-400 dark:text-slate-500 font-medium italic">No leave history found in this vault.</p>
        </div>
      )}
      {leaves.slice().reverse().map(leave => (
        <div key={leave.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col md:flex-row transition-theme group hover:shadow-md transition-all duration-300">
          <div className={`w-2 shrink-0 ${leave.status === LeaveStatus.APPROVED ? 'bg-emerald-500' : leave.status === LeaveStatus.REJECTED ? 'bg-red-500' : 'bg-amber-500'}`}></div>
          <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900 dark:text-slate-200 tracking-tight">{leave.type} Leave</span>
                <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-widest ${
                  leave.status === LeaveStatus.APPROVED ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 
                  leave.status === LeaveStatus.REJECTED ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 
                  'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                }`}>
                  {leave.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-widest">
                <i className="fa-solid fa-calendar-day mr-1.5 opacity-60"></i>
                {leave.startDate} to {leave.endDate}
              </p>
              
              <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1.5">Your Submission Remark</p>
                <p className="text-sm text-gray-700 dark:text-slate-300 italic font-medium leading-relaxed">"{leave.remarks}"</p>
              </div>

              {/* HR Decision Feedback Block */}
              {leave.status === LeaveStatus.REJECTED && leave.adminComment && (
                <div className="mt-3 p-4 bg-red-50/50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 animate-in slide-in-from-left-2 duration-300">
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-black uppercase tracking-[0.2em] mb-1.5 flex items-center">
                    <i className="fa-solid fa-circle-exclamation mr-2"></i> Action Required
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 font-black leading-relaxed">
                    ⚠️ HR Remark: {leave.adminComment}
                  </p>
                </div>
              )}

              {leave.status === LeaveStatus.APPROVED && leave.adminComment && (
                <div className="mt-3 p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em] mb-1.5 flex items-center">
                    <i className="fa-solid fa-circle-check mr-2"></i> Admin Feedback
                  </p>
                  <p className="text-sm text-gray-700 dark:text-slate-300 font-bold italic">
                    {leave.adminComment}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] text-gray-300 dark:text-slate-600 font-black uppercase tracking-widest">
                Logged {new Date(leave.createdAt).toLocaleDateString()}
              </span>
              <span className="text-[10px] text-gray-200 dark:text-slate-700 font-black uppercase tracking-widest opacity-50">
                ID: {leave.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeeLeaveList;