import React, { useState } from 'react';
import { User, AttendanceRecord, LeaveRequest, PayrollRecord, UserStatus, UserRole, LeaveStatus, AttendanceStatus, LeaveType } from '../../types';
import DocumentManagement from '../Profile/DocumentManagement';
import AttendanceCorrectionModal from './AttendanceCorrectionModal';
import FinancialsCard from '../Profile/FinancialsCard';
import { mockApi } from '../../services/mockApi';

interface EmployeeDetailViewProps {
  employee: User;
  currentUser: User;
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payrolls: PayrollRecord[];
  onUpdateEmployee: (user: User) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  onUpdateLeave: (id: string, status: LeaveStatus, comment: string) => void;
  onBack: () => void;
}

const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({
  employee,
  currentUser,
  attendance,
  leaves,
  payrolls,
  onUpdateEmployee,
  onUpdateAttendance,
  onUpdateLeave,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'attendance' | 'leaves' | 'payroll' | 'documents'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<User>(employee);
  const [correctingRecord, setCorrectingRecord] = useState<AttendanceRecord | null>(null);
  const [terminating, setTerminating] = useState(false);

  const handleSaveProfile = () => {
    onUpdateEmployee(editData);
    setIsEditing(false);
  };

  const handleTerminate = () => {
    if (employee.id === currentUser.id) {
      alert("Self-Termination Guard: You cannot terminate your own account.");
      return;
    }

    if (window.confirm(`Are you sure you want to terminate ${employee.name}? Access will be revoked immediately.`)) {
      setTerminating(true);
      try {
        mockApi.fireEmployee(employee.id, currentUser.id);
        const updated = mockApi.getUsers().find(u => u.id === employee.id);
        if (updated) onUpdateEmployee(updated);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setTerminating(false);
      }
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    const colors = {
      [UserStatus.ACTIVE]: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
      [UserStatus.ON_LEAVE]: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
      [UserStatus.TERMINATED]: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
    };
    return <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase ${colors[status]}`}>{status}</span>;
  };

  const cardClass = "bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm transition-theme p-6";
  const inputClass = "w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-900 dark:text-white text-sm";
  const labelClass = "text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest pl-1 mb-1 block";

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Breadcrumb & Navigation */}
      <nav className="flex items-center space-x-2 text-sm">
        <button onClick={onBack} className="text-gray-500 hover:text-blue-600 transition-colors flex items-center">
          <i className="fa-solid fa-arrow-left mr-2"></i> Dashboard
        </button>
        <i className="fa-solid fa-chevron-right text-[10px] text-gray-300"></i>
        <span className="text-gray-900 dark:text-white font-bold">Manage: {employee.name}</span>
      </nav>

      {/* Header Profile Section */}
      <div className={`${cardClass} flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16"></div>
        <div className="flex items-center space-x-5 z-10">
          <div className="relative">
            <img src={employee.profilePic} alt="" className="w-24 h-24 rounded-2xl object-cover border-4 border-blue-50 dark:border-slate-700 shadow-xl" />
            <div className={`absolute -bottom-2 -right-2 p-1.5 rounded-lg border shadow-sm ${employee.status === UserStatus.ACTIVE ? 'bg-emerald-500 border-emerald-400' : employee.status === UserStatus.ON_LEAVE ? 'bg-amber-500 border-amber-400' : 'bg-red-500 border-red-400'}`}>
              <i className={`fa-solid ${employee.status === UserStatus.TERMINATED ? 'fa-user-slash' : 'fa-shield-halved'} text-white text-[10px]`}></i>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{employee.name}</h2>
              {getStatusBadge(employee.status)}
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">{employee.position} • {employee.department}</p>
            <div className="flex items-center space-x-4 mt-2">
               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">ID: {employee.employeeId}</p>
               <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded">Joined: {employee.joiningDate}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3 z-10">
          {employee.status !== UserStatus.TERMINATED && (
            <button 
              onClick={handleTerminate}
              disabled={terminating}
              className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all flex items-center"
            >
              <i className="fa-solid fa-user-slash mr-2"></i> Terminate
            </button>
          )}
          <button 
            onClick={() => { setIsEditing(true); setActiveTab('personal'); }}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all flex items-center"
          >
            <i className="fa-solid fa-pen-nib mr-2"></i> Edit Record
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 w-fit">
        {[
          { id: 'personal', label: 'Core Info', icon: 'fa-id-card' },
          { id: 'attendance', label: 'Logbook', icon: 'fa-clock' },
          { id: 'leaves', label: 'Time Off', icon: 'fa-plane-departure' },
          { id: 'payroll', label: 'Financials', icon: 'fa-file-invoice-dollar' },
          { id: 'documents', label: 'Vault', icon: 'fa-vault' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === tab.id 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}
          >
            <i className={`fa-solid ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content Rendering */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-6">
              <div className={cardClass}>
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center text-sm uppercase tracking-widest">
                  <i className="fa-solid fa-user-gear mr-2 text-blue-500"></i> Personal & Contact
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      {isEditing ? <input className={inputClass} value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} /> : <p className="text-gray-900 dark:text-white font-medium">{employee.name}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Corporate Email</label>
                      {isEditing ? <input className={inputClass} value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} /> : <p className="text-gray-900 dark:text-white font-medium">{employee.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Primary Phone</label>
                    {isEditing ? <input className={inputClass} value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} /> : <p className="text-gray-900 dark:text-white font-medium">{employee.phone || 'Not set'}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Residential Address</label>
                    {isEditing ? <textarea className={inputClass} rows={2} value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})} /> : <p className="text-gray-900 dark:text-white font-medium">{employee.address || 'Not set'}</p>}
                  </div>
                </div>
              </div>
              
              <div className={cardClass}>
                <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center text-sm uppercase tracking-widest">
                  <i className="fa-solid fa-briefcase mr-2 text-blue-500"></i> Job Lifecycle
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Current Designation</label>
                      {isEditing ? <input className={inputClass} value={editData.position} onChange={e => setEditData({...editData, position: e.target.value})} /> : <p className="text-gray-900 dark:text-white font-medium">{employee.position}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Department</label>
                      {isEditing ? (
                        <select className={inputClass} value={editData.department} onChange={e => setEditData({...editData, department: e.target.value})}>
                          {['Engineering', 'Product', 'Sales', 'HR', 'Marketing', 'Finance'].map(d => <option key={d}>{d}</option>)}
                        </select>
                      ) : <p className="text-gray-900 dark:text-white font-medium">{employee.department}</p>}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Onboarding Date</label>
                    {isEditing ? <input type="date" className={inputClass} value={editData.joiningDate} onChange={e => setEditData({...editData, joiningDate: e.target.value})} /> : <p className="text-gray-900 dark:text-white font-medium">{employee.joiningDate}</p>}
                  </div>
                </div>
                {isEditing && (
                  <div className="mt-8 flex space-x-3">
                    <button onClick={handleSaveProfile} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all">Update Database</button>
                    <button onClick={() => { setIsEditing(false); setEditData(employee); }} className="px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 rounded-xl font-bold">Discard Changes</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className={cardClass}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center">
                <i className="fa-solid fa-calendar-check mr-2 text-blue-500"></i> Attendance Ledger
              </h3>
              <div className="flex space-x-2">
                 <button className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-3 py-1.5 rounded-lg font-bold">Previous Month</button>
                 <button className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-bold">Export CSV</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-700">
                    <th className="pb-4 px-2">Work Date</th>
                    <th className="pb-4">Arrival</th>
                    <th className="pb-4">Departure</th>
                    <th className="pb-4">Duration</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
                  {attendance.slice().reverse().map(log => {
                     const start = log.checkIn ? new Date(log.checkIn) : null;
                     const end = log.checkOut ? new Date(log.checkOut) : null;
                     const duration = start && end ? ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1) + 'h' : '--';
                     return (
                        <tr key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-4 px-2 text-sm font-bold text-gray-900 dark:text-slate-200">{log.date}</td>
                          <td className="py-4 text-sm text-gray-600 dark:text-slate-400">{log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                          <td className="py-4 text-sm text-gray-600 dark:text-slate-400">{log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                          <td className="py-4 text-sm font-mono text-gray-500">{duration}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              log.status === AttendanceStatus.PRESENT ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
                            }`}>{log.status}</span>
                          </td>
                          <td className="py-4 text-right">
                            <button 
                              onClick={() => setCorrectingRecord(log)}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" 
                              title="Manual Correction"
                            >
                              <i className="fa-solid fa-pen-nib"></i>
                            </button>
                          </td>
                        </tr>
                     );
                  })}
                </tbody>
              </table>
              {attendance.length === 0 && <p className="py-12 text-center text-gray-400 italic">No historical logs for this period.</p>}
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Allowance (Paid)', value: '18 Days', sub: '12 Remaining', color: 'blue' },
                { label: 'Sick Leaves Taken', value: leaves.filter(l => l.type === LeaveType.SICK && l.status === LeaveStatus.APPROVED).length + ' Days', sub: 'No cap', color: 'red' },
                { label: 'Unpaid Requests', value: leaves.filter(l => l.type === LeaveType.UNPAID).length, sub: 'Total history', color: 'gray' },
              ].map((stat, i) => (
                <div key={i} className={`${cardClass} border-l-4 border-l-${stat.color}-500 flex flex-col justify-center`}>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                  <p className={`text-[10px] font-bold text-${stat.color}-600 dark:text-${stat.color}-400 mt-1`}>{stat.sub}</p>
                </div>
              ))}
            </div>
            
            <div className={cardClass}>
              <h3 className="font-bold text-gray-900 dark:text-white mb-6">Leave Application Stream</h3>
              <div className="space-y-4">
                {leaves.length === 0 && <p className="text-center text-gray-400 italic py-10">No leave history found.</p>}
                {leaves.slice().reverse().map(req => (
                  <div key={req.id} className="p-5 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800 flex flex-col md:flex-row justify-between gap-6 transition-all hover:border-gray-200">
                    <div className="flex space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
                        req.status === LeaveStatus.APPROVED ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                        req.status === LeaveStatus.REJECTED ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 
                        'bg-amber-500 text-white shadow-lg shadow-amber-500/20 animate-pulse'
                      }`}>
                        <i className={`fa-solid ${req.type === LeaveType.SICK ? 'fa-briefcase-medical' : 'fa-umbrella-beach'}`}></i>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                           <p className="font-black text-gray-900 dark:text-white">{req.type} Leave</p>
                           <span className="text-[10px] text-gray-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-100 dark:border-slate-700 uppercase font-bold">Ref: #{req.id.slice(0, 5)}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-tighter mt-1">{req.startDate} → {req.endDate}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-300 mt-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 italic">"{req.remarks}"</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      {req.status === LeaveStatus.PENDING ? (
                        <div className="flex space-x-2">
                           <button onClick={() => onUpdateLeave(req.id, LeaveStatus.REJECTED, 'Request denied based on current resource planning.')} className="px-5 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 text-red-600 font-bold rounded-xl text-xs hover:bg-red-50 transition-all">Reject</button>
                           <button onClick={() => onUpdateLeave(req.id, LeaveStatus.APPROVED, 'Approved.')} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-all shadow-md">Approve</button>
                        </div>
                      ) : (
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${req.status === LeaveStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{req.status}</span>
                          <p className="text-xs text-gray-400 italic mt-2 max-w-[200px] leading-snug">{req.adminComment}</p>
                        </div>
                      )}
                      <p className="text-[10px] text-gray-300 dark:text-slate-600 font-bold uppercase mt-4">Requested {new Date(req.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payroll' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FinancialsCard 
              employee={employee} 
              currentUser={currentUser} 
              onUpdate={() => onUpdateEmployee(employee)} 
            />
            
            <div className={cardClass}>
              <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center uppercase text-sm tracking-widest">
                <i className="fa-solid fa-receipt mr-2 text-blue-500"></i> Payroll Artifacts
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {payrolls.slice().reverse().map(pay => (
                  <div key={pay.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border border-gray-100 dark:border-slate-800 hover:border-blue-100 transition-colors">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">{pay.month} {pay.year}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Reference ID: {pay.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600 dark:text-emerald-400 text-lg">${pay.netPay.toLocaleString()}</p>
                      <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center justify-end hover:underline mt-1">
                        <i className="fa-solid fa-file-pdf mr-1"></i> Get PDF
                      </button>
                    </div>
                  </div>
                ))}
                {payrolls.length === 0 && <p className="text-center text-gray-400 italic py-10">No historical payslips generated.</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <DocumentManagement 
            employee={employee}
            currentUser={currentUser} 
            documents={[]} 
            onUpload={() => {}} 
            onDelete={() => {}}
          />
        )}
      </div>

      {/* Modals */}
      {correctingRecord && (
        <AttendanceCorrectionModal 
          record={correctingRecord} 
          onSave={(updated) => { onUpdateAttendance(updated); setCorrectingRecord(null); }}
          onClose={() => setCorrectingRecord(null)}
        />
      )}
    </div>
  );
};

export default EmployeeDetailView;