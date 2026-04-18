import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bookmark, 
  ChevronRight, 
  Search, 
  BookOpen, 
  ArrowUpRight, 
  MessageCircle,
  Hash,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

const glossaryTerms = [
  { term: "ITR-1 (Sahaj)", category: "Compliance", definition: "The simplest income tax return form for residents with total income up to ₹50 lakh from salary, one house property, and other sources.", href: "/itr/filing" },
  { term: "Section 80C", category: "Deductions", definition: "A popular tax deduction section allowing individuals to save up to ₹1.5 lakh by investing in PPF, ELSS, Insurance, etc.", href: "/calculators/income-tax" },
  { term: "TDS", category: "Direct Tax", definition: "Tax Deducted at Source is a means of collecting direct tax by the government at the very source of income.", href: "/calculators/tds" },
  { term: "SIP", category: "Investment", definition: "Systematic Investment Plan is a disciplined way of investing fixed amounts in mutual funds at regular intervals.", href: "/calculators/sip" },
  { term: "Form 16", category: "Documents", definition: "A certificate issued by an employer detailing the salary paid and the tax deducted (TDS) from the employee's income.", href: "/form16-parser" },
  { term: "GSTIN", category: "Business", definition: "Unique 15-digit identifier for every registered business under the Goods and Services Tax system in India.", href: "/services/gst-registration" },
  { term: "Form 26AS", category: "Reports", definition: "An annual consolidated tax statement showing tax deducted, collected, and paid against your PAN.", href: "/ais-viewer" },
  { term: "HRA Exemption", category: "Allowance", definition: "Exemption on House Rent Allowance under Section 10(13A) for employees living in rented accommodation.", href: "/calculators/hra" },
  { term: "AIS", category: "Reports", definition: "Annual Information Statement provides a comprehensive view of a taxpayer's financial transactions.", href: "/ais-viewer" },
  { term: "LTCG", category: "Capital Gains", definition: "Profit from the sale of a capital asset held for more than a specified period (usually 1-3 years).", href: "/calculators/capital-gains" },
  { term: "Advance Tax", category: "Direct Tax", definition: "Pre-payment of income tax in installments during the financial year.", href: "/calculators/advance-tax" },
  { term: "Standard Deduction", category: "Deductions", definition: "A flat deduction allowed from gross salary, providing tax relief without needing investment proofs.", href: "/calculators/income-tax" },
  { term: "PAN Card", category: "Identity", definition: "Permanent Account Number is a 10-digit alphanumeric code that tracks all your financial transactions with the IT department.", href: "/services/pan-card" },
  { term: "TAN", category: "Direct Tax", definition: "Tax Deduction and Collection Account Number is a 10-digit alphanumeric number required for all persons responsible for deducting or collecting tax.", href: "/services/tan-registration" },
  { term: "DSC", category: "Digital", definition: "Digital Signature Certificate is a secure digital key used to sign documents electronically for filing and compliance.", href: "/services/dsc" },
  { term: "MSME", category: "Business", definition: "Micro, Small and Medium Enterprises are businesses that can avail various benefits and subsidies from the government.", href: "/services/msme-registration" },
  { term: "Startup India", category: "Business", definition: "A government initiative to foster innovation and provide tax exemptions and funding to new startups in India.", href: "/services/startup-india" },
  { term: "DIN", category: "Corporate", definition: "Director Identification Number is a unique 8-digit identification number assigned to any individual who is a director of a company.", href: "/services/director-identification" },
  { term: "TCS", category: "Direct Tax", definition: "Tax Collected at Source is the tax payable by a seller which he collects from the buyer at the time of sale.", href: "/calculators/tds" },
  { term: "Professional Tax", category: "Compliance", definition: "A direct tax levied by state governments on individuals earning income from salary or professions.", href: "/services/professional-tax" },
  { term: "VDA Tax", category: "Crypto", definition: "Tax on Virtual Digital Assets (Crypto) which is 30% on income and 1% TDS on transactions in India.", href: "/calculators/vda-tax" },
  { term: "Gratuity", category: "Benefits", definition: "A monetary benefit given by an employer to an employee for services rendered to the organization for 5 or more years.", href: "/calculators/gratuity" },
  { term: "Section 80D", category: "Deductions", definition: "Deduction for medical insurance premiums paid for self, family, and parents.", href: "/calculators/income-tax" },
  { term: "GSTR-1", category: "GST", definition: "A monthly or quarterly return that summarizes all outward supplies (sales) of a registered taxpayer.", href: "/services/gst-return" },
  { term: "GSTR-3B", category: "GST", definition: "A monthly self-declaration that summarizes outward supplies, input tax credit claimed, and tax paid.", href: "/services/gst-return" },
  { term: "Section 54", category: "Capital Gains", definition: "Tax exemption on long-term capital gains from the sale of a residential house if reinvested in another house.", href: "/calculators/capital-gains" },
  { term: "Input Tax Credit", category: "GST", definition: "The credit a business receives for the tax paid on its inputs, which can be used to reduce the tax on its outputs.", href: "/services/gst-registration" },
  { term: "Assessment Year", category: "General", definition: "The year immediately following the financial year in which the income of the financial year is assessed.", href: "/calculators/income-tax" },
  { term: "Financial Year", category: "General", definition: "The period from April 1 to March 31 of the following year during which you earn your income.", href: "/calculators/income-tax" },
  { term: "EPF", category: "Payroll", definition: "Employee Provident Fund is a retirement benefit scheme for salaried employees.", href: "/calculators/epf" },
  { term: "Form 10E", category: "Relief", definition: "A form required to claim tax relief under Section 89(1) on salary arrears or advance salary.", href: "/itr/filing" },
  { term: "LUT", category: "GST", definition: "Letter of Undertaking for exporting goods or services without payment of integrated tax.", href: "/services/gst-registration" },
  { term: "ROC Filing", category: "Corporate", definition: "Annual filing of financial statements and returns by companies with the Registrar of Companies.", href: "/services/company-registration" },
  { term: "Section 80G", category: "Deductions", definition: "Tax deduction for donations made to specified charitable institutions and relief funds.", href: "/calculators/income-tax" },
  { term: "STCG", category: "Capital Gains", definition: "Short Term Capital Gains are profits from the sale of assets held for a short period, taxed at different rates.", href: "/calculators/capital-gains" },
  { term: "RCM", category: "GST", definition: "Reverse Charge Mechanism where the liability to pay tax is on the recipient of goods/services instead of the supplier.", href: "/services/gst-registration" },
  { term: "Section 194J", category: "TDS", definition: "TDS on fees for professional or technical services at 10% or 2%.", href: "/calculators/tds" },
  { term: "Tax Audit", category: "Audit", definition: "An examination of a taxpayer's accounts to ensure compliance with the provisions of the Income Tax Act.", href: "/services/audit" },
  { term: "AOC-4", category: "Corporate", definition: "The form for filing financial statements with the Registrar of Companies (ROC) every year.", href: "/services/company-registration" },
  { term: "MGT-7", category: "Corporate", definition: "The form for filing the annual return of a company with the Registrar of Companies.", href: "/services/company-registration" },
  { term: "Section 234A", category: "Penalty", definition: "Interest charged for delay in filing the income tax return.", href: "/calculators/income-tax" },
  { term: "Section 234B", category: "Penalty", definition: "Interest charged for default in payment of advance tax (less than 90% paid).", href: "/calculators/income-tax" },
  { term: "ESI", category: "Payroll", definition: "Employee State Insurance is a self-financing social security and health insurance scheme for Indian workers.", href: "/services/esi-registration" },
  { term: "DSC Token", category: "Digital", definition: "A physical USB device that stores the digital signature certificate securely.", href: "/services/dsc" },
  { term: "DIN KYC", category: "Compliance", definition: "Annual KYC requirement for every individual who holds a Director Identification Number.", href: "/services/director-identification" },
  { term: "Section 80E", category: "Deductions", definition: "Deduction for interest paid on an education loan for higher studies.", href: "/calculators/income-tax" },
  { term: "HSN Code", category: "GST", definition: "Harmonized System of Nomenclature code used for classifying goods under GST.", href: "/calculators/hsn-finder" },
  { term: "SAC Code", category: "GST", definition: "Services Accounting Code used for classifying services under GST.", href: "/calculators/hsn-finder" },
  { term: "Form 15CA", category: "Foreign", definition: "A declaration by a person making a remittance to a non-resident or a foreign company.", href: "/services/foreign-remittance" },
  { term: "Form 15CB", category: "Foreign", definition: "A certificate from a Chartered Accountant certifying the tax rates and payment details for foreign remittances.", href: "/services/foreign-remittance" },
  { term: "Section 194C", category: "TDS", definition: "TDS on payments made to contractors or sub-contractors for carrying out any work.", href: "/calculators/tds" },
  { term: "Authorized Capital", category: "Corporate", definition: "The maximum amount of share capital that a company is authorized by its constitutional documents to issue.", href: "/services/company-registration" }
];

export default function FinancialGlossary() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(glossaryTerms.map(t => t.category)));
    return ["All", ...uniqueCats];
  }, []);

  const filteredTerms = useMemo(() => {
    return glossaryTerms.filter(t => {
      const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                           t.definition.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.03),transparent)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-4 uppercase tracking-wider">
              <BookOpen className="w-3 h-3" />
              Learning Center
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Smart Tax <span className="text-blue-600">Glossary</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Demystifying Indian taxation Jargon. Simplified definitions for smarter financial decisions.
            </p>
          </div>
          
          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <Input 
                  placeholder="Search tax terms..." 
                  className="pl-12 h-14 w-full sm:w-[320px] rounded-2xl bg-slate-50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
          <div className="flex items-center gap-2 px-4 border-r border-slate-200 mr-2 text-slate-400">
             <Filter className="w-4 h-4" />
             <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Filter</span>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeCategory === cat 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-transparent hover:border-slate-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Glossary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((item, index) => (
              <Link key={index} href={item.href || "#"}>
                <div className="group relative bg-white border border-slate-200/60 rounded-[32px] p-6 h-full transition-all duration-500 hover:shadow-[0_22px_60px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 cursor-pointer flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      {item.category}
                    </span>
                    <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight group-hover:text-blue-600 transition-colors">
                    {item.term}
                  </h3>
                  
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium mb-6">
                    {item.definition}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                     <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Explore Topic</span>
                     <div className="h-1.5 w-1.5 rounded-full bg-blue-100 group-hover:w-8 group-hover:bg-blue-600 transition-all duration-500"></div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Search className="w-6 h-6 text-slate-300" />
               </div>
               <h3 className="text-xl font-bold text-slate-900">No terms found</h3>
               <p className="text-slate-500 mt-2">Try searching for something else like "ITR" or "TDS"</p>
            </div>
          )}
        </div>

        {/* Feature Banner */}
        <div className="mt-24 relative rounded-[3rem] overflow-hidden bg-slate-900 p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>
          <div className="relative z-10 max-w-xl">
             <div className="inline-flex items-center gap-2 p-2 rounded-xl bg-slate-800 text-slate-300 text-[11px] font-bold uppercase tracking-widest mb-6 border border-slate-700">
                <Hash className="w-3 h-3 text-blue-400" />
                Expert Support
             </div>
             <h4 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                Still confused about <span className="text-blue-400">Tax Jargon?</span>
             </h4>
             <p className="text-lg text-slate-400 font-medium">
                Our expert CAs handle the complexity so you don't have to. Real experts, real advice.
             </p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4">
             <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] px-10 h-16 text-lg font-bold shadow-2xl shadow-blue-500/30 transition-all hover:scale-105 group">
                Connect with a CA
                <MessageCircle className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
             </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
