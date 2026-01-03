
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/employees/liability
 * Logic: Sum of salary_base for all users where status IS NOT 'Terminated'.
 */
export const getCompanyLiability = async (req, res) => {
  try {
    const activeUsers = await prisma.user.findMany({
      where: {
        NOT: {
          status: 'Terminated'
        }
      },
      select: {
        salaryBase: true
      }
    });

    const totalLiability = activeUsers.reduce((sum, user) => sum + (Number(user.salaryBase) || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalLiability,
        currency: 'USD',
        headcount: activeUsers.length
      }
    });
  } catch (error) {
    console.error("Liability Calculation Error:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/**
 * POST /api/employees/:id/terminate
 * Logic: Set status to 'Terminated', clear password hash.
 * Guard: Cannot terminate self.
 */
export const terminateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.userId;

    // 1. Mandatory Self-Fire Guard
    if (id === adminId) {
      return res.status(403).json({ 
        success: false, 
        error: "Security Restriction: You cannot terminate your own account." 
      });
    }

    // 2. Perform termination
    const user = await prisma.user.update({
      where: { id },
      data: {
        status: 'Terminated',
        // Revoke credentials
        password: 'REVOKED_' + Math.random().toString(36)
      }
    });

    return res.status(200).json({
      success: true,
      message: `Resource ${user.employeeId} successfully deactivated.`,
      data: { id: user.id, status: user.status }
    });
  } catch (error) {
    console.error("Termination Error:", error);
    return res.status(500).json({ success: false, error: "Failed to process termination sequence." });
  }
};

/**
 * PATCH /api/employees/:id/salary
 * Logic: Update salary structure for a specific employee.
 */
export const updateSalaryStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const { salaryBase } = req.body;

    if (salaryBase === undefined || salaryBase < 0) {
      return res.status(400).json({ success: false, error: "Invalid salary amount." });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { salaryBase: Number(salaryBase) }
    });

    return res.status(200).json({
      success: true,
      message: "Salary structure synchronized.",
      data: { id: user.id, salaryBase: user.salaryBase }
    });
  } catch (error) {
    console.error("Salary Update Error:", error);
    return res.status(500).json({ success: false, error: "Failed to update financial record." });
  }
};
