import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  BookOpen,
  ArrowUpRight,
  MessageCircle,
  Hash,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

const glossaryTerms = [
  { term: "ITR-1 (Sahaj)", category: "Compliance", definition: "The simplest income tax return form for residents with total income up to ₹50 lakh from salary, one house property, and other sources.", href: "/itr/form-selector" },
  { term: "Section 80C", category: "Deductions", definition: "A popular tax deduction section allowing individuals to save up to ₹1.5 lakh by investing in PPF, ELSS, Insurance, etc.", href: "/calculators/income-tax" },
  { term: "TDS", category: "Direct Tax", definition: "Tax Deducted at Source is a means of collecting direct tax by the government at the very source of income.", href: "/calculators/tds" },
  { term: "SIP", category: "Investment", definition: "Systematic Investment Plan is a disciplined way of investing fixed amounts in mutual funds at regular intervals.", href: "/calculators/sip" },
  { term: "Form 16", category: "Documents", definition: "A certificate issued by an employer detailing the salary paid and the tax deducted (TDS) from the employee's income.", href: "/form16-parser" },
  { term: "GSTIN", category: "Business", definition: "Unique 15-digit identifier for every registered business under the Goods and Services Tax system in India.", href: "/services/gst-registration" },
  { term: "Form 26AS", category: "Reports", definition: "An annual consolidated tax statement showing tax deducted, collected, and paid against your PAN.", href: "/ais-viewer" },
  { term: "HRA Exemption", category: "Allowance", definition: "Exemption on House Rent Allowance under Section 10(13A) for employees living in rented accommodation.", href: "/calculators/hra" },
  { term: "AIS", category: "Reports", definition: "Annual Information Statement shows financial information reported against a taxpayer's PAN and provides feedback options for displayed entries.", href: "/ais-viewer" },
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
  { term: "Form 10E", category: "Relief", definition: "A form required to claim tax relief under Section 89(1) on salary arrears or advance salary.", href: "/itr/form-selector" },
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

  const showingFocusedResults = search.trim().length > 0 || activeCategory !== "All";
  const visibleTerms = showingFocusedResults ? filteredTerms : filteredTerms.slice(0, 9);

  return (
    <section className="border-b border-slate-200 bg-white py-8 md:py-14">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              <BookOpen className="h-3.5 w-3.5" />
              People also ask before filing
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Clear answers to tax terms that change your filing path.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
              Search-friendly definitions for ITR, GST, deductions, TDS, capital gains, notices, and document terms that users ask before choosing a service.
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search tax terms..."
                className="h-11 w-full rounded-lg border-slate-200 bg-[#F8FAFC] pl-10 text-base focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-[320px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
          <div className="mr-1 flex items-center gap-2 border-r border-slate-200 pr-3 text-slate-500">
            <Filter className="h-4 w-4" />
            <span className="whitespace-nowrap text-xs font-bold uppercase tracking-[0.16em]">Filter</span>
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap rounded-lg border px-4 py-2 text-sm font-bold transition-colors",
                activeCategory === cat
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-4 text-sm font-semibold text-slate-600">
          {showingFocusedResults ? `${filteredTerms.length} matching term${filteredTerms.length === 1 ? "" : "s"}` : "Showing 9 common filing terms"}
        </div>

        {/* Glossary Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {visibleTerms.length > 0 ? (
            visibleTerms.map((item, index) => (
              <Link key={index} href={item.href}>
                <div className="group flex h-full cursor-pointer flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="rounded-lg bg-slate-50 px-2.5 py-1 type-meta font-bold uppercase tracking-wide text-slate-600">
                      {item.category}
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-700" />
                  </div>

                  <h3 className="text-base font-bold tracking-tight text-slate-950 transition-colors group-hover:text-blue-700">
                    {item.term}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.definition}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold uppercase tracking-wide text-blue-700">Explore topic</span>
                    <ChevronIcon />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-lg border border-dashed border-slate-200 bg-[#F8FAFC] py-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-400 shadow-sm">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">No terms found</h3>
              <p className="mt-2 text-sm text-slate-600">Try searching for something else like "ITR" or "TDS".</p>
            </div>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-5 shadow-sm md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-6 md:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-950 md:text-xl">Need help applying a term to your return?</h4>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Ask for a scoped review when a deduction, GST item, capital gain, notice, or document term changes your filing path.
              </p>
            </div>
          </div>

          <div className="mt-5 md:mt-0">
            <Link href="/expert-consultation">
              <Button variant="brand" className="h-11 w-full rounded-lg px-5 sm:w-auto">
                Ask an expert
                <MessageCircle className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChevronIcon() {
  return <ArrowUpRight className="h-4 w-4 text-blue-700" />;
}
