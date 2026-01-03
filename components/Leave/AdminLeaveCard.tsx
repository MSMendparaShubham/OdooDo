import React, { useState } from 'react';
import { LeaveRequest, LeaveStatus, User } from '../../types';

interface AdminLeaveCardProps {
  leave: LeaveRequest;
  user: User | undefined;
  onStatusChange: (id: string, status: LeaveStatus, comment: string) => void;
}

type RejectionStep = 'IDLE' | 'CONFIRM' | 'REMARK';

const AdminLeaveCard: React.FC<AdminLeaveCardProps> = ({ leave, user, onStatusChange }) => {
  const [rejectionStep, setRejectionStep] = useState<RejectionStep>('IDLE');
  const [remark, setRemark] = useState("");

  const handleApprove = () => {
    onStatusChange(leave.id, LeaveStatus.APPROVED, "Approved by Admin");
  };

  const handleDeclineAndSend = () => {
    if (!remark.trim()) return;
    onStatusChange(leave.id, LeaveStatus.REJECTED, remark);
    setRejectionStep('IDLE');
    setRemark("");
  };

  const closeModal = () => {
    setRejectionStep('IDLE');
    setRemark("");
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col md:flex-row transition-theme">
      <div className={`w-2 shrink-0 ${leave.status === LeaveStatus.APPROVED ? 'bg-emerald-500' : leave.status === LeaveStatus.REJECTED ? 'bg-red-500' : 'bg-amber-500'}`}></div>
      <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <img 
            src={user?.profilePic} 
            alt={user?.name} 
            className="w-12 h-12 rounded-full object-cover border border-gray-100 dark:border-slate-700 shadow-sm" 
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-gray-900 dark:text-slate-200">{user?.name || 'System User'}</span>
              <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-widest ${
                leave.status === LeaveStatus.APPROVED ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 
                leave.status === LeaveStatus.REJECTED ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 
                'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
              }`}>
                {leave.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-bold uppercase tracking-tight">
              <i className="fa-solid fa-calendar-day mr-1.5 opacity-60"></i>
              {leave.startDate} to {leave.endDate} • {leave.type}
            </p>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-2 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-xl italic border border-gray-100 dark:border-slate-700">
              "{leave.remarks}"
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto flex flex-col items-end gap-3">
          {leave.status === LeaveStatus.PENDING ? (
            <div className="flex space-x-2 w-full md:w-auto">
               <button 
                onClick={() => setRejectionStep('CONFIRM')}
                className="flex-1 md:flex-none h-11 px-6 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark mr-2"></i> Reject
              </button>
              <button 
                onClick={handleApprove}
                className="flex-1 md:flex-none h-11 px-6 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center"
              >
                <i className="fa-solid fa-check mr-2"></i> Approve
              </button>
            </div>
          ) : (
            <div className="text-right">
               <p className="text-[10px] text-gray-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">Final HR Decision</p>
               <p className={`text-sm font-bold italic ${leave.status === LeaveStatus.REJECTED ? 'text-red-500' : 'text-gray-700 dark:text-slate-300'}`}>
                 {leave.adminComment || 'No additional remarks.'}
               </p>
            </div>
          )}
          <span className="text-[10px] text-gray-300 dark:text-slate-600 font-bold uppercase tracking-widest italic opacity-40">REF: #{leave.id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Two-Step Rejection Modal */}
      {rejectionStep !== 'IDLE' && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center">
              
              {rejectionStep === 'CONFIRM' ? (
                <>
                  <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                    <i className="fa-solid fa-circle-question"></i>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-4 leading-tight">Are you sure you want to reject this request?</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mb-8">
                    Denying the application for {user?.name}. You will be required to provide a valid reason in the next step.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={closeModal}
                      className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                    >
                      No, Keep Pending
                    </button>
                    <button 
                      onClick={() => setRejectionStep('REMARK')}
                      className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 shadow-xl shadow-red-500/20 transition-all"
                    >
                      Yes, Reject
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
                    <i className="fa-solid fa-comment-dots"></i>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-4">Please write down a remark</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 font-medium mb-6">
                    Provide clear feedback to {user?.name} explaining the rejection.
                  </p>
                  
                  <textarea 
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="e.g. Schedule conflict with upcoming project deadline..."
                    className="w-full h-32 px-5 py-4 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-500/20 rounded-[1.5rem] outline-none focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-sm text-gray-900 dark:text-white resize-none mb-6"
                    autoFocus
                    required
                  />
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setRejectionStep('CONFIRM')}
                      className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleDeclineAndSend}
                      disabled={!remark.trim()}
                      className="flex-1 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                    >
                      Decline & Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveCard;