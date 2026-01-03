
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTodayStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date().toISOString().split('T')[0];

    const records = await prisma.attendance.findMany({
      where: { userId }
    });
    
    const todayRecord = records.find(r => r.date.toISOString().startsWith(today));

    return res.status(200).json({ 
      success: true, 
      data: todayRecord || null 
    });

  } catch (error) {
    console.error("GetTodayStatus Error:", error);
    return res.status(500).json({ success: false, error: "Cloud sync error" });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const userId = req.userId;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDate = new Date(todayStr);
    const now = new Date();

    // Find record for today
    const existing = await prisma.attendance.findFirst({
      where: {
        userId,
        date: todayDate
      }
    });

    if (!existing) {
      // Toggle logic: No record -> Check In
      const record = await prisma.attendance.create({
        data: {
          userId,
          date: todayDate,
          checkIn: now,
          status: "Present"
        }
      });

      return res.status(201).json({ 
        success: true, 
        message: "Check-in recorded.",
        data: record 
      });
    }

    if (existing.checkIn && !existing.checkOut) {
      // Toggle logic: Has check-in but no check-out -> Check Out
      const record = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkOut: now
        }
      });

      return res.status(200).json({ 
        success: true, 
        message: "Check-out recorded.",
        data: record 
      });
    }

    return res.status(400).json({ 
      success: false, 
      error: "Workday already finalized." 
    });

  } catch (error) {
    console.error("MarkAttendance Error:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Database transaction failed." 
    });
  }
};
