import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FileSearch, Home, Calculator, Briefcase, ChevronRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[var(--color-primary-50)] p-4">
      <Card className="w-full max-w-lg shadow-xl border-[var(--color-primary-100)] rounded-[var(--radius-3xl)] overflow-hidden">
        <CardHeader className="text-center pt-10 pb-6 bg-white">
          <div className="mx-auto w-20 h-20 bg-[var(--color-primary-100)] rounded-full flex items-center justify-center mb-6">
            <FileSearch className="h-10 w-10 text-[var(--color-primary-600)]" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-[var(--color-primary-900)] tracking-tight">
            Page Not Found
          </CardTitle>
          <p className="mt-4 text-[var(--color-primary-500)] font-medium max-w-xs mx-auto">
            We couldn't find the page you're looking for. Let's get you back on track.
          </p>
        </CardHeader>
        
        <CardContent className="px-8 pb-8 bg-white">
          <div className="grid grid-cols-1 gap-3">
            <h3 className="text-xs font-bold text-[var(--color-primary-400)] uppercase tracking-widest mb-2">Popular Destinations</h3>
            
            <Link href="/">
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] hover:border-[var(--color-primary-200)] transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Home className="h-5 w-5 text-[var(--color-primary-600)]" />
                  </div>
                  <span className="font-bold text-[var(--color-primary-800)]">Homepage</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--color-primary-300)] group-hover:text-[var(--color-primary-600)] transition-colors" />
              </div>
            </Link>

            <Link href="/calculators">
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] hover:border-[var(--color-primary-200)] transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Calculator className="h-5 w-5 text-[var(--color-primary-600)]" />
                  </div>
                  <span className="font-bold text-[var(--color-primary-800)]">Tax Calculators</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--color-primary-300)] group-hover:text-[var(--color-primary-600)] transition-colors" />
              </div>
            </Link>

            <Link href="/services">
              <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-primary-100)] hover:bg-[var(--color-primary-50)] hover:border-[var(--color-primary-200)] transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Briefcase className="h-5 w-5 text-[var(--color-primary-600)]" />
                  </div>
                  <span className="font-bold text-[var(--color-primary-800)]">All Services</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[var(--color-primary-300)] group-hover:text-[var(--color-primary-600)] transition-colors" />
              </div>
            </Link>
          </div>
        </CardContent>

        <CardFooter className="bg-[var(--color-primary-50)] border-t border-[var(--color-primary-100)] flex justify-center py-6">
          <Link href="/">
            <Button size="lg" className="bg-[var(--color-primary-900)] hover:bg-black text-white px-8 rounded-full shadow-lg">
              Return Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
