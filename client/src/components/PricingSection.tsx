import { Phone } from "lucide-react";
import { Link } from "wouter";
import StandardPricingSection from "@/components/pricing/StandardPricingSection";
import { Button } from "@/components/ui/button";
import { getTaxFilingPlans } from "@/data/pricing";

export default function PricingSection() {
  return (
    <section className="bg-white border-y border-gray-100">
      <StandardPricingSection
        mode="plan-grid"
        title="Plans for every tax need"
        description="Simple, honest pricing with visible CA touchpoints, timelines, GST treatment, inclusions, and exclusions before you start."
        plans={getTaxFilingPlans().slice(0, 3)}
        className="py-16"
      />

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 rounded-[28px] border border-slate-100 bg-slate-50 p-8 md:flex-row">
          <div className="flex items-center gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Phone className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Need help choosing?</h4>
              <p className="text-sm text-gray-600">Our tax experts are available for a free consultation.</p>
            </div>
          </div>
          <Link href="/expert-consultation?service=pricing-help">
            <Button variant="outline" className="rounded-xl border-slate-300 px-8 py-6 font-bold text-slate-700">
              Talk to Expert
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
