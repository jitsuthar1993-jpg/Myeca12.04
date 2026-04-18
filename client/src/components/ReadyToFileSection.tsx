import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";

export default function ReadyToFileSection() {
  return (
    <section className="bg-[#003087] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to File Your ITR?
        </h2>
        <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
          Join 15L+ Indians who trust MyeCA.in for hassle-free tax filing
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            size="lg" 
            className="bg-white text-[#003087] px-8 py-4 rounded-sm font-semibold hover:bg-gray-50 transition-all duration-300 shadow-md"
          >
            <FileText className="mr-2 h-5 w-5" />
            Start Filing Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 border-white text-white px-8 py-4 rounded-sm font-semibold hover:bg-white hover:text-[#003087] transition-all duration-300"
          >
            Talk to Expert
          </Button>
        </div>
        
        {/* Trust indicators */}
        <div className="flex items-center justify-center space-x-8 mt-8 text-blue-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">5L+</div>
            <div className="text-sm">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">99.9%</div>
            <div className="text-sm">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-sm">Expert Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}