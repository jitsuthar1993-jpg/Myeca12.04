import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";

export default function ReadyToFileSection() {
  return (
    <section className="bg-brand-600 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to File Your ITR?
        </h2>
        <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
          Guided filing starts at ₹499, with CA-assisted review available on eligible plans before submission.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/which-itr-form-to-file?source=ready_to_file_section">
            <Button
              size="lg"
              className="bg-white text-brand-600 px-8 py-4 rounded-sm font-semibold hover:bg-slate-50 transition-all duration-300 shadow-md"
            >
              <FileText className="mr-2 h-5 w-5" />
              Start Filing Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/expert-consultation?service=itr-filing">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white px-8 py-4 rounded-sm font-semibold hover:bg-white hover:text-brand-600 transition-all duration-300"
            >
              Talk to Expert
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center space-x-8 mt-8 text-blue-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">AY</div>
            <div className="text-sm">2026-27 Ready</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">CA</div>
            <div className="text-sm">Review Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">₹499</div>
            <div className="text-sm">Simple Filing From</div>
          </div>
        </div>
      </div>
    </section>
  );
}
