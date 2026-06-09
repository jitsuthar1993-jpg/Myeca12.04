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
        title="Tax Optimizer - Estimate Eligible Tax Savings | MyeCA"
        description="Compare tax-saving scenarios using your income and eligible deduction inputs, then verify each planned claim against current rules and supporting records."
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
