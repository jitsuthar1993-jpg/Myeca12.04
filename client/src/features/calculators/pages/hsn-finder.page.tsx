import React, { useState } from "react";
import { getSEOConfig } from "@/config/seo.config";
import { m, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Info, 
  Tag, 
  Box, 
  Briefcase, 
  ChevronRight,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  FileText
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import Breadcrumb from "@/components/Breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HSN_DATA = [
  { code: "1001", name: "Wheat and meslin", rate: "0%", category: "Grains" },
  { code: "6109", name: "T-shirts, singlets and other vests, knitted or crocheted", rate: "5%", category: "Apparel" },
  { code: "8471", name: "Automatic data processing machines and units thereof (Laptops/PCs)", rate: "18%", category: "Electronics" },
  { code: "8517", name: "Telephone sets, including smartphones", rate: "18%", category: "Electronics" },
  { code: "3304", name: "Beauty or make-up preparations and preparations for the care of the skin", rate: "28%", category: "Cosmetics" }
];

const SAC_DATA = [
  { code: "9983", name: "Other professional, technical and business services (CA/Legal)", rate: "18%", category: "Professional" },
  { code: "9984", name: "Telecommunications, broadcasting and information supply services", rate: "18%", category: "IT" },
  { code: "9963", name: "Accommodation, food and beverage services (Hotels)", rate: "12%/18%", category: "Hospitality" },
  { code: "9965", name: "Goods transport services (GTA)", rate: "5%/12%", category: "Logistics" }
];

export default function HSNFinderPage() {
  const seo = getSEOConfig('/calculators/hsn-finder');
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("hsn");

  const filteredHsn = HSN_DATA.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.code.includes(query)
  );

  const filteredSac = SAC_DATA.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.code.includes(query)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <MetaSEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        type={seo?.type}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
        faqPageData={[
          {
            question: "What is HSN and SAC code?",
            answer: "HSN (Harmonized System of Nomenclature) is used for classifying goods, while SAC (Services Accounting Code) is used for classifying services under GST."
          },
          {
            question: "How many digits of HSN code are required?",
            answer: "Businesses with turnover up to ₹5 crore need 4-digit HSN codes, while those above ₹5 crore require 6-digit codes for B2B invoices."
          },
          {
            question: "Where can I find the latest GST rates for HSN codes?",
            answer: "You can use MyeCA's HSN finder tool to search by product name or code to see the latest applicable GST rates."
          }
        ]}
      />

      <div className="bg-white border-b">
        <Breadcrumb items={[{ name: "Calculators", href: "/calculators" }, { name: "HSN Finder" }]} />
      </div>

      {/* Hero */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-emerald-100 text-emerald-700 px-4 py-1 font-bold border-emerald-200 mb-6">
              Updated for FY 2025-26
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              GST HSN & SAC <span className="text-blue-600">Code Finder</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
              Quickly find the correct 4, 6, or 8-digit HSN code and applicable GST rates for your business invoices.
            </p>

            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
              <Input 
                placeholder="Search by name (e.g. 'Laptop') or Code (e.g. '8471')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-14 h-16 rounded-2xl border-2 border-slate-200 focus:border-blue-500 text-lg shadow-lg"
              />
            </div>
          </m.div>
        </div>
      </section>

      {/* Search Results */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Tabs defaultValue="hsn" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-12 bg-slate-200/50 p-1.5 rounded-2xl h-14">
              <TabsTrigger value="hsn" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-lg">
                <Box className="w-5 h-5 mr-2" />
                HSN (Goods)
              </TabsTrigger>
              <TabsTrigger value="sac" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-bold text-lg">
                <Briefcase className="w-5 h-5 mr-2" />
                SAC (Services)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hsn">
              <div className="grid gap-4">
                {filteredHsn.map((item, i) => (
                  <m.div
                    key={item.code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="hover:border-blue-300 transition-all group hover:shadow-md border-slate-200">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-14 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-900 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {item.code}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-lg">{item.name}</div>
                            <div className="text-sm text-slate-500 font-medium">{item.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-600 text-white font-black px-4 py-1 text-base">
                            {item.rate} GST
                          </Badge>
                          <div className="text-xs text-slate-400 mt-1 font-bold italic">Applicable 2025</div>
                        </div>
                      </CardContent>
                    </Card>
                  </m.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sac">
              <div className="grid gap-4">
                {filteredSac.map((item, i) => (
                  <m.div
                    key={item.code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="hover:border-blue-300 transition-all group hover:shadow-md border-slate-200">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                        <div className="w-16 h-14 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-900 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {item.code}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-lg">{item.name}</div>
                            <div className="text-sm text-slate-500 font-medium">{item.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-blue-600 text-white font-black px-4 py-1 text-base">
                            {item.rate} GST
                          </Badge>
                          <div className="text-xs text-slate-400 mt-1 font-bold italic">Applicable 2025</div>
                        </div>
                      </CardContent>
                    </Card>
                  </m.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-blue-600" />
                What is HSN Code?
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                HSN stands for **Harmonized System of Nomenclature**. It is a multipurpose international product 
                nomenclature developed by the World Customs Organization (WCO).
              </p>
              <p className="text-slate-600 leading-relaxed">
                In India, HSN codes help in classifying goods for systematic GST calculation and trade documentation. 
                Businesses with turnover above ₹5 Cr require 6-digit HSN codes.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                What is SAC Code?
              </h2>
              <p className="text-slate-600 leading-relaxed mb-4">
                SAC stands for **Services Accounting Code**. It is a classification system for services 
                similar to HSN for goods.
              </p>
              <p className="text-slate-600 leading-relaxed">
                All services under GST are assigned a unique 6-digit SAC code starting with '99'. 
                Using the correct SAC ensures you claim the right Input Tax Credit (ITC).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet Integration */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="p-8 bg-blue-600 rounded-3xl text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h2 className="text-2xl font-black mb-4">Need help with GST Billing?</h2>
            <p className="mb-8 text-blue-100">Our CAs can help you set up your billing system and ensure 100% compliance.</p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-black px-10 rounded-xl">
              Get Expert Assistance
            </Button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
