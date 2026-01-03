
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import * as authController from './src/controllers/authController.js';
import * as attendanceController from './src/controllers/attendanceController.js';
import * as employeeController from './src/controllers/employeeController.js';
import { verifyToken } from './src/middleware/authMiddleware.js';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

// Configuration: Port 5000
const PORT = 5000;

// 1. CORS Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// --- Public Auth Routes ---
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.signin);

// --- Analytics & Liability (Admin Only) ---
app.get('/api/employees/liability', verifyToken, employeeController.getCompanyLiability);

// --- Employee Management (Admin Only) ---
app.get('/api/employees', verifyToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, 
        employeeId: true, 
        name: true, 
        email: true, 
        role: true, 
        department: true, 
        position: true, 
        status: true, 
        profilePic: true, 
        salaryBase: true,
        joiningDate: true
      }
    });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch employees" });
  }
});

app.post('/api/employees/:id/terminate', verifyToken, employeeController.terminateEmployee);
app.patch('/api/employees/:id/salary', verifyToken, employeeController.updateSalaryStructure);

// --- Attendance Routes ---
app.get('/api/attendance/today', verifyToken, attendanceController.getTodayStatus);
app.post('/api/attendance/toggle', verifyToken, attendanceController.markAttendance);
app.get('/api/attendance/:userId', verifyToken, async (req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { userId: req.params.userId },
      orderBy: { date: 'desc' }
    });
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, data: [] });
  }
});

// --- Leave Management ---
app.get('/api/leaves', verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId: String(userId) } : {};
    const leaves = await prisma.leaveRequest.findMany({
      where: filter,
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: leaves });
  } catch (err) {
    res.status(500).json({ success: false, data: [] });
  }
});

app.post('/api/leaves', verifyToken, async (req, res) => {
  try {
    const { type, startDate, endDate, remarks } = req.body;
    const leave = await prisma.leaveRequest.create({
      data: { userId: req.userId, type, startDate, endDate, remarks }
    });
    res.status(201).json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to create leave request" });
  }
});

app.patch('/api/leaves/:id', verifyToken, async (req, res) => {
  try {
    const { status, adminComment } = req.body;
    const leave = await prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: { status, adminComment }
    });
    res.json({ success: true, data: leave });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to update leave request" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ OdooDo Backend is operational on http://localhost:5000`);
});
