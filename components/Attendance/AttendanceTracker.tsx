
import React, { useState, useEffect } from 'react';
import { User, AttendanceRecord, AttendanceStatus } from '../../types';
import { mockApi } from '../../services/mockApi';

interface AttendanceTrackerProps {
  user: User;
  records: AttendanceRecord[];
  onUpdateAttendance: () => Promise<void>;
  isAdmin: boolean;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ user, records, onUpdateAttendance, isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Internal clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayRecord = records.find(r => r.date.startsWith(today));

  const handleToggleAttendance = async () => {
    setLoading(true);
    try {
      // Logic for toggle happens in the mock service
      if (!todayRecord) {
        await mockApi.mockCheckIn(user.id);
      } else if (todayRecord.checkIn && !todayRecord.checkOut) {
        await mockApi.mockCheckOut(user.id);
      }
      
      // Notify App to refresh its local state
      await onUpdateAttendance();
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isShiftComplete = todayRecord?.checkIn && todayRecord?.checkOut;
  const isCurrentlyWorking = todayRecord?.checkIn && !todayRecord?.checkOut;

  const getStatusColor = (status: AttendanceStatus) => {
    switch(status) {
      case AttendanceStatus.PRESENT: return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
      case AttendanceStatus.ABSENT: return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case AttendanceStatus.HALF_DAY: return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-slate-700/50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight italic uppercase">Workday Log</h2>
        <p className="text-gray-500 dark:text-slate-400 font-medium">Synced with local vault. No server required.</p>
      </header>

      {/* Main Attendance Card */}
      {!isAdmin && (
        <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 transition-theme">
          <div className="flex items-center space-x-8">
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shadow-inner transition-all duration-500 border ${
              isCurrentlyWorking 
              ? 'bg-blue-50 border-blue-100 text-blue-600 animate-pulse' 
              : isShiftComplete 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-500' 
              : 'bg-gray-50 border-gray-100 text-gray-300'
            }`}>
              <i className={`fa-solid ${isShiftComplete ? 'fa-circle-check' : isCurrentlyWorking ? 'fa-hourglass-start' : 'fa-clock'}`}></i>
            </div>
            <div>
              <p className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </p>
              <p className="text-xs font-black text-gray-400 dark:text-slate-500 mt-2 uppercase tracking-[0.3em]">
                {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
            <button 
              disabled={loading || !!isShiftComplete}
              onClick={handleToggleAttendance}
              className={`h-14 px-12 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-3 w-full md:w-auto shadow-lg ${
                isShiftComplete 
                ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100 shadow-emerald-500/5' 
                : isCurrentlyWorking
                ? 'bg-slate-900 dark:bg-slate-950 text-white hover:opacity-90 active:scale-95 shadow-slate-900/20'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-500/30'
              } ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
              {loading ? (
                <i className="fa-solid fa-circle-notch fa-spin"></i>
              ) : isShiftComplete ? (
                <><span>Workday Finished</span><i className="fa-solid fa-check-double text-lg"></i></>
              ) : isCurrentlyWorking ? (
                <><span>End Shift</span><i className="fa-solid fa-power-off text-lg"></i></>
              ) : (
                <><span>Start Shift</span><i className="fa-solid fa-play text-lg"></i></>
              )}
            </button>
            
            <div className="h-6">
              {isCurrentlyWorking && (
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center bg-blue-50 dark:bg-blue-900/20 px-4 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/30 animate-in zoom-in">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping mr-2"></span>
                  Active Session
                </span>
              )}
              {isShiftComplete && (
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center bg-emerald-50 dark:bg-emerald-900/20 px-4 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-900/30 animate-in zoom-in">
                  Data Persistence Confirmed
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-theme">
        <div className="px-8 py-6 border-b border-gray-50 dark:border-slate-700 flex justify-between items-center bg-gray-50/30 dark:bg-slate-900/20">
          <h3 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest italic">Local Transaction Ledger</h3>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{records.length} Records found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-50 dark:border-slate-700 bg-white dark:bg-slate-800">
                <th className="px-8 py-5">Calendar Date</th>
                <th className="px-8 py-5">Clock In</th>
                <th className="px-8 py-5">Clock Out</th>
                <th className="px-8 py-5">Duration</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-700">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center text-gray-400 italic text-sm font-medium">
                    No transactions found in this vault.
                  </td>
                </tr>
              ) : (
                records.slice().reverse().map(record => {
                  const cin = record.checkIn ? new Date(record.checkIn) : null;
                  const cout = record.checkOut ? new Date(record.checkOut) : null;
                  const diff = cin && cout ? ((cout.getTime() - cin.getTime()) / (1000 * 60 * 60)).toFixed(1) + 'h' : '--';
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                      <td className="px-8 py-5 text-xs font-black text-gray-900 dark:text-slate-200 uppercase tracking-wider">
                        {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-5 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                        {cin ? cin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'}
                      </td>
                      <td className="px-8 py-5 text-[11px] font-bold text-gray-500 dark:text-slate-400">
                        {cout ? cout.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '--'}
                      </td>
                      <td className="px-8 py-5 text-[11px] font-mono font-black text-blue-600">
                        {diff}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] border border-transparent ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
