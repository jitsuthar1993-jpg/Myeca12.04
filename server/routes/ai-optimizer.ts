import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Tax optimization request schema
const optimizationRequestSchema = z.object({
  income: z.number().positive(),
  age: z.number().min(18).max(100),
  currentDeductions: z.object({
    section80C: z.number().default(0),
    section80D: z.number().default(0),
    section80E: z.number().default(0),
    section80G: z.number().default(0),
    hra: z.number().default(0),
    lta: z.number().default(0)
  }).optional(),
  goals: z.array(z.string()).optional()
});

// Tax calculation helper
function calculateTax(income: number, deductions: any, regime: "old" | "new") {
  let taxableIncome = income;
  let totalDeductions = 0;

  if (regime === "old") {
    // Standard deduction
    totalDeductions += 50000;
    
    // Section deductions
    totalDeductions += Math.min(deductions.section80C || 0, 150000);
    totalDeductions += Math.min(deductions.section80D || 0, 50000);
    totalDeductions += deductions.section80E || 0;
    totalDeductions += deductions.section80G || 0;
    totalDeductions += deductions.hra || 0;
    totalDeductions += Math.min(deductions.lta || 0, 50000);
    
    taxableIncome = Math.max(0, income - totalDeductions);
  } else {
    // New regime - only standard deduction
    totalDeductions = 75000; // Higher standard deduction in new regime
    taxableIncome = Math.max(0, income - totalDeductions);
  }

  // Calculate tax based on slabs
  let tax = 0;
  
  if (regime === "old") {
    // Old regime tax slabs (FY 2024-25)
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.30;
      taxableIncome = 1500000;
    }
    if (taxableIncome > 1200000) {
      tax += (taxableIncome - 1200000) * 0.20;
      taxableIncome = 1200000;
    }
    if (taxableIncome > 900000) {
      tax += (taxableIncome - 900000) * 0.20;
      taxableIncome = 900000;
    }
    if (taxableIncome > 600000) {
      tax += (taxableIncome - 600000) * 0.10;
      taxableIncome = 600000;
    }
    if (taxableIncome > 300000) {
      tax += (taxableIncome - 300000) * 0.05;
    }
  } else {
    // New regime tax slabs (FY 2024-25)
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.30;
      taxableIncome = 1500000;
    }
    if (taxableIncome > 1200000) {
      tax += (taxableIncome - 1200000) * 0.25;
      taxableIncome = 1200000;
    }
    if (taxableIncome > 900000) {
      tax += (taxableIncome - 900000) * 0.20;
      taxableIncome = 900000;
    }
    if (taxableIncome > 600000) {
      tax += (taxableIncome - 600000) * 0.10;
      taxableIncome = 600000;
    }
    if (taxableIncome > 300000) {
      tax += (taxableIncome - 300000) * 0.05;
    }
  }

  // Add cess
  tax = tax * 1.04; // 4% health and education cess

  return Math.round(tax);
}

// Optimize tax regime
router.post("/optimize", authenticateToken, (req: Request, res: Response) => {
  try {
    const data = optimizationRequestSchema.parse(req.body);
    
    // Calculate tax under both regimes
    const oldRegimeTax = calculateTax(data.income, data.currentDeductions || {}, "old");
    const newRegimeTax = calculateTax(data.income, {}, "new");
    
    const savings = Math.abs(oldRegimeTax - newRegimeTax);
    const recommendedRegime = oldRegimeTax < newRegimeTax ? "old" : "new";
    
    res.json({
      success: true,
      analysis: {
        oldRegimeTax,
        newRegimeTax,
        savings,
        recommendedRegime,
        savingsPercentage: ((savings / Math.max(oldRegimeTax, newRegimeTax)) * 100).toFixed(2)
      },
      recommendations: [
        recommendedRegime === "old" 
          ? "Continue with the Old Tax Regime to maximize your deductions"
          : "Switch to the New Tax Regime for simplified taxation and lower rates",
        data.currentDeductions?.section80C && data.currentDeductions.section80C < 150000
          ? `Increase Section 80C investments by ₹${150000 - data.currentDeductions.section80C} to maximize deductions`
          : "Your Section 80C limit is fully utilized",
        !data.currentDeductions?.section80D || data.currentDeductions.section80D < 25000
          ? "Consider health insurance to claim Section 80D deductions up to ₹25,000"
          : "Your health insurance deductions are optimized",
        data.income > 1000000
          ? "Consider NPS contributions for additional ₹50,000 deduction under Section 80CCD(1B)"
          : "Focus on maximizing basic deductions under Section 80C"
      ]
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid request data" });
  }
});

// Get tax-saving recommendations
router.post("/recommendations", authenticateToken, (req: Request, res: Response) => {
  const { income, age, hasLoan, hasChildren } = req.body;
  
  const recommendations = [];
  
  // Basic recommendations
  recommendations.push({
    category: "Investment",
    suggestion: "Invest in ELSS mutual funds",
    potentialSaving: 46800,
    description: "Tax saving up to ₹46,800 on ₹1.5 lakh investment under Section 80C"
  });
  
  recommendations.push({
    category: "Insurance",
    suggestion: "Buy term life insurance",
    potentialSaving: 46800,
    description: "Premiums qualify for Section 80C deduction with life cover"
  });
  
  recommendations.push({
    category: "Health",
    suggestion: "Family health insurance",
    potentialSaving: 15600,
    description: "Save up to ₹15,600 on ₹50,000 premium under Section 80D"
  });
  
  if (hasLoan) {
    recommendations.push({
      category: "Loan",
      suggestion: "Claim home loan interest",
      potentialSaving: 62400,
      description: "Deduction up to ₹2 lakh on home loan interest under Section 24"
    });
  }
  
  if (hasChildren) {
    recommendations.push({
      category: "Education",
      suggestion: "Education loan interest",
      potentialSaving: 31200,
      description: "Full deduction on education loan interest under Section 80E"
    });
  }
  
  if (age > 50) {
    recommendations.push({
      category: "Retirement",
      suggestion: "Additional NPS contribution",
      potentialSaving: 15600,
      description: "Extra ₹50,000 deduction under Section 80CCD(1B)"
    });
  }
  
  res.json({
    success: true,
    recommendations,
    totalPotentialSaving: recommendations.reduce((sum, r) => sum + r.potentialSaving, 0)
  });
});

// Get month-wise tax planning
router.get("/monthly-plan", authenticateToken, (req: Request, res: Response) => {
  const currentMonth = new Date().getMonth();
  const monthlyPlan = [];
  
  const months = ["January", "February", "March", "April", "May", "June", 
                  "July", "August", "September", "October", "November", "December"];
  
  for (let i = 0; i < 12; i++) {
    const month = (currentMonth + i) % 12;
    const plan: any = {
      month: months[month],
      actions: []
    };
    
    // Quarter-specific actions
    if (month === 0 || month === 3 || month === 6 || month === 9) {
      plan.actions.push("Pay advance tax installment (if applicable)");
      plan.actions.push("Review investment portfolio");
    }
    
    // Year-end actions
    if (month === 2) {
      plan.actions.push("Complete tax-saving investments");
      plan.actions.push("Collect all tax documents");
      plan.actions.push("Submit investment proofs to employer");
    }
    
    // Mid-year review
    if (month === 8) {
      plan.actions.push("Review tax-saving progress");
      plan.actions.push("Rebalance investment portfolio");
    }
    
    // ITR filing season
    if (month === 6) {
      plan.actions.push("File Income Tax Return");
      plan.actions.push("Verify ITR after filing");
    }
    
    // General monthly actions
    plan.actions.push("Track expenses and income");
    plan.actions.push("Invest in SIP for tax saving");
    
    monthlyPlan.push(plan);
  }
  
  res.json({
    success: true,
    monthlyPlan,
    currentMonth: months[currentMonth]
  });
});

export default router;