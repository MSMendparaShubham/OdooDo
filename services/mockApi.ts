import { User, UserRole, UserStatus, AttendanceRecord, AttendanceStatus, LeaveRequest, LeaveType, LeaveStatus, PayrollRecord } from '../types';

const STORAGE_KEYS = {
  USER: 'odoodo_user',
  TOKEN: 'odoodo_token',
  ATTENDANCE: 'odoodo_attendance',
  LEAVES: 'odoodo_leaves',
  USERS: 'odoodo_all_users',
  PAYROLL: 'odoodo_payroll',
  SALARY_STRUCTURES: 'odoodo_salary_structures'
};

export interface SalaryStructure {
  userId: string;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
  updatedAt: string;
}

export const mockApi = {
  initialize: () => {
    // Safety check for data hydration
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const initialUsers: User[] = [
        {
          id: 'usr_admin',
          employeeId: 'ADM001',
          email: 'admin@odoodo.com',
          name: 'Sarah Connor',
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          phone: '+1 (555) 999-0000',
          address: 'Cyberdyne Systems HQ',
          profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          department: 'Human Resources',
          position: 'HR Director',
          joiningDate: '2022-01-01',
          salaryBase: 12500
        },
        {
          id: 'usr_emp_1',
          employeeId: 'EMP001',
          email: 'employee@odoodo.com',
          name: 'Marcus Wright',
          role: UserRole.EMPLOYEE,
          status: UserStatus.ACTIVE,
          phone: '+1 (555) 123-4567',
          address: '456 Resistance Way',
          profilePic: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
          department: 'Engineering',
          position: 'Lead Developer',
          joiningDate: '2023-03-12',
          salaryBase: 8500
        }
      ];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
      
      const structures: SalaryStructure[] = initialUsers.map(u => ({
        userId: u.id,
        basic: u.salaryBase * 0.6,
        hra: u.salaryBase * 0.2,
        allowances: u.salaryBase * 0.2,
        deductions: 200,
        grossSalary: u.salaryBase,
        netSalary: u.salaryBase - 200,
        updatedAt: new Date().toISOString()
      }));
      localStorage.setItem(STORAGE_KEYS.SALARY_STRUCTURES, JSON.stringify(structures));
    }
  },

  getUsers: (): User[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    } catch (e) {
      return [];
    }
  },

  /**
   * REGISTRATION ENGINE
   * Prevents duplicates and initializes secondary artifacts (Salary Structures).
   */
  registerUser: (userData: Omit<User, 'id'>): User[] => {
    const users = mockApi.getUsers();
    if (users.find(u => u.email === userData.email)) {
      throw new Error("Conflict: Email identity already assigned to another resource.");
    }
    
    const newUser: User = {
      ...userData,
      id: `usr_${Math.random().toString(36).substr(2, 9)}`,
    };
    
    const updatedUsers = [...users, newUser];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    
    // Initialize default financial structure
    mockApi.updateSalaryStructure(newUser.id, {
      basic: newUser.salaryBase * 0.6,
      hra: newUser.salaryBase * 0.2,
      allowances: newUser.salaryBase * 0.2,
      deductions: 200
    });
    
    return updatedUsers;
  },

  getAllSalaryStructures: (): SalaryStructure[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SALARY_STRUCTURES) || '[]');
    } catch (e) {
      return [];
    }
  },

  getSalaryStructure: (userId: string): SalaryStructure | undefined => {
    return mockApi.getAllSalaryStructures().find(s => s.userId === userId);
  },

  getCompanyLiability: (): number => {
    const allUsers = mockApi.getUsers();
    // Sum gross salary only for non-terminated employees
    const activeUserIds = new Set(
      allUsers
        .filter(u => u.status !== UserStatus.TERMINATED)
        .map(u => u.id)
    );
    
    const structures = mockApi.getAllSalaryStructures();
    return structures
      .filter(s => activeUserIds.has(s.userId))
      .reduce((sum, s) => sum + (Number(s.grossSalary) || 0), 0);
  },

  /**
   * ATOMIC FIRE PROTOCOL
   * Logic: Guard against self-firing, then revoke credentials.
   */
  fireEmployee: (id: string, currentUserId: string): User[] => {
    if (id === currentUserId) {
      throw new Error("Security Restriction: You cannot terminate your own account.");
    }

    const users = mockApi.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error("Resource not found in current directory.");

    users[index] = {
      ...users[index],
      status: UserStatus.TERMINATED,
      password: '', // Revoke login ability
    };

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users;
  },

  /**
   * STATUS UPDATER
   * Generic status transition handler.
   */
  updateEmployeeStatus: (id: string, status: UserStatus): User[] => {
    const users = mockApi.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = { 
        ...users[index], 
        status,
        ...(status === UserStatus.TERMINATED ? { password: '' } : {}) 
      };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    return users;
  },

  updateSalaryStructure: (userId: string, data: Partial<SalaryStructure>): SalaryStructure => {
    const structures = mockApi.getAllSalaryStructures();
    const index = structures.findIndex(s => s.userId === userId);
    
    const existing = structures[index] || {
      userId,
      basic: 0,
      hra: 0,
      allowances: 0,
      deductions: 0,
      grossSalary: 0,
      netSalary: 0,
      updatedAt: new Date().toISOString()
    };
    
    const merged = { ...existing, ...data };
    const grossSalary = Number(merged.basic) + Number(merged.hra) + Number(merged.allowances);
    const netSalary = grossSalary - Number(merged.deductions);
    
    const updated: SalaryStructure = {
      ...merged,
      grossSalary,
      netSalary,
      updatedAt: new Date().toISOString()
    };

    if (index !== -1) structures[index] = updated;
    else structures.push(updated);

    localStorage.setItem(STORAGE_KEYS.SALARY_STRUCTURES, JSON.stringify(structures));

    // Update the base salary cached in the User object for roster views
    const users = mockApi.getUsers();
    const uIdx = users.findIndex(u => u.id === userId);
    if (uIdx !== -1) {
      users[uIdx].salaryBase = grossSalary;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    return updated;
  },

  mockLogin: async (email: string, pass: string) => {
    mockApi.initialize();
    const user = mockApi.getUsers().find(u => u.email === email);
    
    if (!user) throw new Error("Identity record not found.");
    if (user.status === UserStatus.TERMINATED) throw new Error("Access Denied: Account is deactivated.");
    
    return { token: 'odoodo_mock_token_xyz', user: user };
  },

  updateUser: (user: User) => {
    const users = mockApi.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  },

  getAttendance: (uid?: string) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
      return all.filter((a: any) => !uid || a.userId === uid);
    } catch(e) { return []; }
  },
  
  getLeaves: (uid?: string) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES) || '[]');
      return all.filter((a: any) => !uid || a.userId === uid);
    } catch(e) { return []; }
  },
  
  getPayrolls: (uid?: string) => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYROLL) || '[]');
      return all.filter((a: any) => !uid || a.userId === uid);
    } catch(e) { return []; }
  },

  submitLeave: (l: LeaveRequest) => {
    const leaves = mockApi.getLeaves();
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify([...leaves, l]));
  },

  updateLeaveStatus: (id: string, status: LeaveStatus, comment: string) => {
    const leaves = mockApi.getLeaves().map((l: LeaveRequest) => 
      l.id === id ? { ...l, status, adminComment: comment } : l
    );
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
  },

  createPayroll: (p: PayrollRecord) => {
    const payrolls = mockApi.getPayrolls();
    localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify([...payrolls, p]));
  },

  mockCheckIn: async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const records = mockApi.getAttendance();
    const record: AttendanceRecord = {
      id: `att_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      date: today,
      checkIn: new Date().toISOString(),
      status: AttendanceStatus.PRESENT
    };
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify([...records, record]));
  },

  mockCheckOut: async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const records = mockApi.getAttendance();
    const idx = records.findIndex(r => r.userId === userId && r.date === today);
    if (idx !== -1) {
      records[idx].checkOut = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
    }
  }
};