import React from "react";
import TaxOptimizer from "@/components/TaxOptimizer";
import EnhancedSEO from "@/components/EnhancedSEO";
import { useLocation } from "wouter";
import { Layout } from "@/components/admin/Layout";

export default function TaxOptimizerPage() {
  const [location] = useLocation();
  
  return (
    <Layout>
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
      
      <div className="py-8">
        <TaxOptimizer />
      </div>
    </Layout>
  );
}

