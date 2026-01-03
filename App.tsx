import React, { useState, useEffect } from 'react';
import { User, UserRole, AttendanceRecord, LeaveRequest, PayrollRecord, LeaveStatus, UserStatus } from './types';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import Layout from './components/Layout/Layout';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import ProfileView from './components/Profile/ProfileView';
import AttendanceTracker from './components/Attendance/AttendanceTracker';
import LeaveManagement from './components/Leave/LeaveManagement';
import PayrollModule from './components/Payroll/PayrollModule';
import EmployeeDetailView from './components/Admin/EmployeeDetailView';
import { mockApi } from './services/mockApi';

/**
 * RESET APP HOOK
 * Allows clearing the local vault in case of data corruption.
 */
const resetVault = () => {
  if (window.confirm("CRITICAL: Wipe all local corporate data and reset the vault?")) {
    localStorage.clear();
    window.location.reload();
  }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [view, setView] = useState<'login' | 'signup' | 'dashboard' | 'profile' | 'attendance' | 'leave' | 'payroll' | 'employee-detail'>('login');
  const [darkMode, setDarkMode] = useState(false);
  
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);

  const syncLocalState = () => {
    mockApi.initialize();
    const allUsers = mockApi.getUsers();
    setUsers(allUsers);
    
    if (currentUser) {
      // Re-fetch current user from vault to see if status or salary changed
      const freshUser = allUsers.find(u => u.id === currentUser.id);
      if (freshUser) {
        if (freshUser.status === UserStatus.TERMINATED) {
          handleLogout();
          return;
        }
        setCurrentUser(freshUser);
      }

      setAttendance(mockApi.getAttendance(currentUser.role === UserRole.ADMIN ? undefined : currentUser.id));
      setLeaves(mockApi.getLeaves(currentUser.role === UserRole.ADMIN ? undefined : currentUser.id));
      setPayrolls(mockApi.getPayrolls(currentUser.role === UserRole.ADMIN ? undefined : currentUser.id));
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('odoodo_user');
    const token = localStorage.getItem('odoodo_token');
    
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setCurrentUser(parsedUser);
        setView('dashboard');
      } catch (e) {
        localStorage.removeItem('odoodo_user');
      }
    }
    
    const savedDarkMode = localStorage.getItem('odoodo_darkmode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    syncLocalState();
  }, []);

  useEffect(() => {
    syncLocalState();
  }, [currentUser?.id, view]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('odoodo_darkmode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
  };

  const handleLogin = (loginData: { token: string, user: User }) => {
    localStorage.setItem('odoodo_user', JSON.stringify(loginData.user));
    localStorage.setItem('odoodo_token', loginData.token);
    setCurrentUser(loginData.user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('odoodo_user');
    localStorage.removeItem('odoodo_token');
    setView('login');
  };

  const renderView = () => {
    if (!currentUser) return null;

    switch (view) {
      case 'dashboard':
        return currentUser.role === UserRole.ADMIN ? (
          <AdminDashboard 
            users={users} 
            attendance={attendance} 
            leaves={leaves} 
            onSelectUser={(u) => { setSelectedEmployeeId(u.id); setView('employee-detail'); }}
            onApproveLeave={(id) => {
              mockApi.updateLeaveStatus(id, LeaveStatus.APPROVED, "Approved via Admin Dashboard");
              syncLocalState();
            }} 
            onRejectLeave={(id) => {
              mockApi.updateLeaveStatus(id, LeaveStatus.REJECTED, "Denied via Admin Dashboard");
              syncLocalState();
            }} 
          />
        ) : (
          <EmployeeDashboard 
            user={currentUser} 
            attendance={attendance} 
            leaves={leaves} 
            onNavigate={(v) => setView(v as any)} 
          />
        );
      case 'profile':
        return (
          <ProfileView 
            user={currentUser} 
            currentUser={currentUser}
            isEditingOwn={true} 
            currentUserRole={currentUser.role} 
            onUpdate={(u) => {
              mockApi.updateUser(u);
              setCurrentUser(u);
              syncLocalState();
            }} 
          />
        );
      case 'attendance':
        return (
          <AttendanceTracker 
            user={currentUser} 
            records={attendance} 
            onUpdateAttendance={async () => syncLocalState()} 
            isAdmin={false} 
          />
        );
      case 'leave':
        return (
          <LeaveManagement 
            user={currentUser} 
            isAdmin={currentUser.role === UserRole.ADMIN} 
            leaves={leaves} 
            users={users} 
            onSubmitLeave={(l) => {
              mockApi.submitLeave(l);
              syncLocalState();
            }} 
            onStatusChange={(id, status, comment) => {
              mockApi.updateLeaveStatus(id, status, comment);
              syncLocalState();
            }} 
          />
        );
      case 'payroll':
        return (
          <PayrollModule 
            currentUser={currentUser} 
            users={users} 
            payrolls={payrolls} 
            onUpdatePayroll={() => {}} 
            onAddPayroll={(p) => {
              mockApi.createPayroll(p);
              syncLocalState();
            }} 
          />
        );
      case 'employee-detail':
        const target = users.find(u => u.id === selectedEmployeeId);
        return target ? (
          <EmployeeDetailView 
            employee={target} 
            currentUser={currentUser}
            attendance={attendance.filter(a => a.userId === target.id)} 
            leaves={leaves.filter(l => l.userId === target.id)} 
            payrolls={payrolls.filter(p => p.userId === target.id)} 
            onUpdateEmployee={(u) => {
              mockApi.updateUser(u);
              syncLocalState();
            }} 
            onUpdateAttendance={() => syncLocalState()} 
            onUpdateLeave={(id, status, comment) => {
              mockApi.updateLeaveStatus(id, status, comment);
              syncLocalState();
            }} 
            onBack={() => setView('dashboard')} 
          />
        ) : null;
      default:
        return <div className="p-10 text-center text-gray-400">Section coming soon...</div>;
    }
  };

  if (view === 'login') return <Login onLogin={handleLogin} onGoToSignUp={() => setView('signup')} users={users} />;
  if (view === 'signup') return <SignUp onSignUp={(user) => { handleLogin({ token: 'mock_provisioning', user }); }} onGoToLogin={() => setView('login')} />;

  return (
    <Layout 
      user={currentUser!} 
      onLogout={handleLogout} 
      darkMode={darkMode} 
      onToggleDarkMode={toggleDarkMode}
      activeView={view}
      onViewChange={setView}
    >
      {renderView()}
      
      {/* Dev Reset Utility */}
      <button 
        onClick={resetVault}
        className="fixed bottom-4 right-4 text-[10px] font-black uppercase text-gray-300 dark:text-slate-700 hover:text-red-500 transition-colors z-50"
      >
        Reset Local Vault
      </button>
    </Layout>
  );
};

export default App;