import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";
import SEO from "@/components/SEO";

// Glossary Data
const glossaryTerms = [
  {
    term: "Asset Allocation",
    definition: "The implementation of an investment strategy that attempts to balance risk versus reward by adjusting the percentage of each asset in an investment portfolio according to the investor's risk tolerance, goals and investment time frame.",
    category: "Portfolio Management"
  },
  {
    term: "Bear Market",
    definition: "A market condition in which the prices of securities are falling, and widespread pessimism causes the negative sentiment to be self-sustaining. As investors anticipate losses in a bear market and selling continues, pessimism only grows.",
    category: "Market Trends"
  },
  {
    term: "Bull Market",
    definition: "A financial market of a group of securities in which prices are rising or are expected to rise. The term 'bull market' is most often used to refer to the stock market but can be applied to anything that is traded, such as bonds, real estate, currencies and commodities.",
    category: "Market Trends"
  },
  {
    term: "Capital Gains Tax",
    definition: "A tax levied on profit from the sale of property or an investment. In India, it is categorized into Short Term Capital Gains (STCG) and Long Term Capital Gains (LTCG).",
    category: "Taxation"
  },
  {
    term: "Compound Interest",
    definition: "Interest calculated on the initial principal, which also includes all of the accumulated interest of previous periods of a deposit or loan.",
    category: "Basics"
  },
  {
    term: "Diversification",
    definition: "A risk management strategy that mixes a wide variety of investments within a portfolio. The rationale behind this technique is that a portfolio constructed of different kinds of assets will yield higher long-term returns and lower the risk of any individual holding or security.",
    category: "Portfolio Management"
  },
  {
    term: "Dividend",
    definition: "A distribution of some of a company's earnings to a class of its shareholders, as determined by the company's board of directors.",
    category: "Stocks"
  },
  {
    term: "ETF (Exchange Traded Fund)",
    definition: "A type of security that tracks an index, sector, commodity, or other asset, but which can be purchased or sold on a stock exchange the same way a regular stock can.",
    category: "Investment Vehicles"
  },
  {
    term: "Index Fund",
    definition: "A type of mutual fund or exchange-traded fund (ETF) with a portfolio constructed to match or track the components of a financial market index, such as the Nifty 50 or Sensex.",
    category: "Mutual Funds"
  },
  {
    term: "Inflation",
    definition: "A quantitative measure of the rate at which the average price level of a basket of selected goods and services in an economy increases over some period of time.",
    category: "Economics"
  },
  {
    term: "IPO (Initial Public Offering)",
    definition: "The process of offering shares of a private corporation to the public in a new stock issuance. Public share issuance allows a company to raise capital from public investors.",
    category: "Stocks"
  },
  {
    term: "Mutual Fund",
    definition: "A type of financial vehicle made up of a pool of money collected from many investors to invest in securities like stocks, bonds, money market instruments, and other assets.",
    category: "Investment Vehicles"
  },
  {
    term: "P/E Ratio (Price-to-Earnings)",
    definition: "The ratio for valuing a company that measures its current share price relative to its per-share earnings.",
    category: "Analysis"
  },
  {
    term: "Risk Tolerance",
    definition: "The degree of variability in investment returns that an investor is willing to withstand in their financial planning.",
    category: "Basics"
  },
  {
    term: "SIP (Systematic Investment Plan)",
    definition: "An investment vehicle offered by mutual funds to investors, allowing them to invest small amounts periodically instead of lump sums.",
    category: "Mutual Funds"
  },
  {
    term: "Volatility",
    definition: "A statistical measure of the dispersion of returns for a given security or market index. In most cases, the higher the volatility, the riskier the security.",
    category: "Analysis"
  }
];

export default function GlossaryPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTerms = glossaryTerms.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.definition.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <SEO 
        title="Financial Glossary - MyeCA"
        description="Decode financial jargon with our comprehensive dictionary of investment terms."
      />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Financial Glossary</h1>
        <p className="text-slate-600 mb-6">Master the language of money</p>
        
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Search for a term (e.g., SIP, Inflation)..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((item, index) => (
            <Card key={index} className="hover:bg-slate-50 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-blue-700">{item.term}</CardTitle>
                  <Badge variant="outline" className="text-xs">{item.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-slate-700 text-base">
                  {item.definition}
                </CardDescription>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">No terms found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
