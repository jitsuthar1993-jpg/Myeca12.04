import React from "react";
import TaxOptimizer from "@/components/TaxOptimizer";
import EnhancedSEO from "@/components/EnhancedSEO";
import { useLocation } from "wouter";

export default function TaxOptimizerPage() {
  const [location] = useLocation();
  
  return (
    <>
      <EnhancedSEO
        title="Tax Optimizer - Maximize Your Tax Savings | MyeCA"
        description="Get personalized tax-saving recommendations. Our AI-powered Tax Optimizer analyzes your income and suggests optimal deductions under Section 80C, 80D, NPS, and more."
        canonicalUrl={`https://myeca.in${location}`}
        keywords={[
          "tax optimizer",
          "tax saving recommendations",
          "section 80c investment",
          "tax deductions india",
          "income tax planning",
          "80d health insurance",
          "nps tax benefit",
          "elss investment",
          "tax saving calculator"
        ]}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
        <TaxOptimizer />
      </div>
    </>
  );
}
