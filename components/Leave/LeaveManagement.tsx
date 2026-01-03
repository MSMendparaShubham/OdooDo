
import React, { useState } from 'react';
import { User, LeaveRequest, LeaveType, LeaveStatus } from '../../types';
import AdminLeaveCard from './AdminLeaveCard';
import EmployeeLeaveList from './EmployeeLeaveList';

interface LeaveManagementProps {
  user: User;
  isAdmin: boolean;
  leaves: LeaveRequest[];
  users: User[];
  onSubmitLeave: (req: LeaveRequest) => void;
  onStatusChange: (id: string, status: LeaveStatus, comment: string) => void;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ user, isAdmin, leaves, users, onSubmitLeave, onStatusChange }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: LeaveType.PAID,
    startDate: '',
    endDate: '',
    remarks: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: LeaveRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      remarks: formData.remarks,
      status: LeaveStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    onSubmitLeave(newReq);
    setShowForm(false);
    setFormData({ type: LeaveType.PAID, startDate: '', endDate: '', remarks: '' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h2>
          <p className="text-gray-500 dark:text-slate-400">Track and manage time off requests.</p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-2 rounded-xl font-bold shadow-sm transition-all flex items-center gap-2 ${
              showForm 
              ? 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
            }`}
          >
            <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'}`}></i>
            {showForm ? 'Cancel Request' : 'New Leave Request'}
          </button>
        )}
      </header>

      {showForm && !isAdmin && (
        <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-blue-100 dark:border-blue-900/30 shadow-xl animate-in slide-in-from-top-4 duration-300 transition-theme">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Apply for Leave</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-[0.2em] pl-1">Leave Category</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value as LeaveType})}
                className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-medium"
                required
              >
                <option value={LeaveType.PAID}>Paid Leave</option>
                <option value={LeaveType.SICK}>Sick Leave</option>
                <option value={LeaveType.UNPAID}>Unpaid Leave</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-[0.2em] pl-1">Start Date</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-[0.2em] pl-1">End Date</label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-medium"
                  required
                />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-[0.2em] pl-1">Reason for Absence</label>
              <textarea 
                rows={3}
                value={formData.remarks}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
                placeholder="Briefly explain the reason for your leave..."
                className="w-full px-4 py-3 border border-gray-100 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white font-medium resize-none"
                required
              ></textarea>
            </div>
            <div className="md:col-span-2">
              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-xs"
              >
                Submit Application
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests Display */}
      <div className="space-y-4">
        {isAdmin ? (
          leaves.slice().reverse().map(leave => (
            <AdminLeaveCard 
              key={leave.id}
              leave={leave}
              user={users.find(u => u.id === leave.userId)}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <EmployeeLeaveList leaves={leaves} />
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
