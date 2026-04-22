import { m } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Home, 
  Receipt, 
  TrendingUp, 
  GitCompare, 
  PiggyBank, 
  Shield, 
  Landmark, 
  CreditCard,
  Car,
  Wallet,
  GraduationCap,
  ArrowRight,
  Calendar,
  ShieldAlert
} from "lucide-react";
import { Link } from "wouter";
import { calculators, calculatorCategories } from "@/data/calculators-section";

const iconMap = {
  Calculator,
  Home,
  Receipt,
  TrendingUp,
  GitCompare,
  PiggyBank,
  Shield,
  Landmark,
  CreditCard,
  Car,
  Wallet,
  GraduationCap,
  Calendar,
  ShieldAlert
};

const colorMap = {
  blue: "bg-blue-100 group-hover:bg-blue-600 text-blue-600 group-hover:text-white",
  green: "bg-green-100 group-hover:bg-green-600 text-green-600 group-hover:text-white",
  orange: "bg-orange-100 group-hover:bg-orange-600 text-orange-600 group-hover:text-white",
  purple: "bg-purple-100 group-hover:bg-purple-600 text-purple-600 group-hover:text-white",
  indigo: "bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white",
  emerald: "bg-emerald-100 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white",
  cyan: "bg-cyan-100 group-hover:bg-cyan-600 text-cyan-600 group-hover:text-white",
  teal: "bg-teal-100 group-hover:bg-teal-600 text-teal-600 group-hover:text-white",
  rose: "bg-rose-100 group-hover:bg-rose-600 text-rose-600 group-hover:text-white"
};

interface CalculatorsSectionProps {
  searchTerm?: string;
  selectedCategory?: string;
}

export default function CalculatorsSection({ searchTerm = "", selectedCategory = "all" }: CalculatorsSectionProps) {
  // Filter calculators based on search and category
  const filteredCalculators = calculators.filter(calc => {
    const matchesSearch = calc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         calc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || calc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const taxCalculators = filteredCalculators.filter(calc => calc.category === 'tax');
  const investmentCalculators = filteredCalculators.filter(calc => calc.category === 'investment');
  const loanCalculators = filteredCalculators.filter(calc => calc.category === 'loan');
  const otherCalculators = filteredCalculators.filter(calc => calc.category === 'other');

  return (
    <section className="relative py-12 bg-gray-50 overflow-hidden">
      {/* Enhanced background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-100/50 to-blue-200/50 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-200/50 to-blue-100/50 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Show results count when searching */}
        {(searchTerm || selectedCategory !== "all") && (
          <m.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-gray-600">
              Found {filteredCalculators.length} calculator{filteredCalculators.length !== 1 ? 's' : ''}
              {searchTerm && ` for "${searchTerm}"`}
              {selectedCategory !== "all" && ` in ${selectedCategory} category`}
            </p>
          </m.div>
        )}

        {/* Tax Calculators */}
        {taxCalculators.length > 0 && (
          <m.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-8 bg-blue-600 rounded-full mr-4"></div>
                  Tax Calculators
                  <span className="ml-3 text-lg font-normal text-gray-500">({taxCalculators.length})</span>
                </h3>
                <p className="text-gray-600 ml-6">
                  Essential calculators for income tax planning and compliance
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taxCalculators.map((calculator, index) => {
                const Icon = iconMap[calculator.icon as keyof typeof iconMap] || Calculator;
                
                return (
                  <m.div
                    key={calculator.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="group bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 h-full cursor-pointer hover:border-blue-300">
                      <Link href={calculator.href}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            colorMap[calculator.color as keyof typeof colorMap] || colorMap.blue
                          }`}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors">
                            {calculator.category.toUpperCase()}
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                          {calculator.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                          {calculator.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:text-blue-700 transition-colors">
                            Calculate Now
                            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div className="text-xs text-gray-400">Free</div>
                        </div>
                      </Link>
                    </Card>
                  </m.div>
                );
              })}
            </div>
          </m.div>
        )}

        {/* Investment Calculators */}
        {investmentCalculators.length > 0 && (
          <m.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-8 bg-green-600 rounded-full mr-4"></div>
                  Investment Calculators
                  <span className="ml-3 text-lg font-normal text-gray-500">({investmentCalculators.length})</span>
                </h3>
                <p className="text-gray-600 ml-6">
                  Plan your investments and calculate returns
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {investmentCalculators.map((calculator, index) => {
                const Icon = iconMap[calculator.icon as keyof typeof iconMap] || Calculator;
                
                return (
                  <m.div
                    key={calculator.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                      <Card className="group bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 h-full cursor-pointer hover:border-green-300">
                        <Link href={calculator.href}>
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                              colorMap[calculator.color as keyof typeof colorMap] || colorMap.green
                            }`}>
                              <Icon className="w-7 h-7" />
                            </div>
                            <div className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                              {calculator.category.toUpperCase()}
                            </div>
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                            {calculator.title}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            {calculator.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-green-600 font-semibold text-sm group-hover:text-green-700 transition-colors">
                              Calculate Now
                              <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                            </div>
                            <div className="text-xs text-gray-400">Free</div>
                          </div>
                        </Link>
                      </Card>
                </m.div>
              );
            })}
            </div>
          </m.div>
        )}

        {/* Loan Calculators */}
        {loanCalculators.length > 0 && (
          <m.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-8 bg-orange-600 rounded-full mr-4"></div>
                  Loan Calculators
                  <span className="ml-3 text-lg font-normal text-gray-500">({loanCalculators.length})</span>
                </h3>
                <p className="text-gray-600 ml-6">
                  Calculate EMI and loan repayment schedules
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loanCalculators.map((calculator, index) => {
                const Icon = iconMap[calculator.icon as keyof typeof iconMap] || Calculator;
                
                return (
                  <m.div
                    key={calculator.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="group bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 h-full cursor-pointer hover:border-orange-300">
                      <Link href={calculator.href}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            colorMap[calculator.color as keyof typeof colorMap] || colorMap.orange
                          }`}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-700 transition-colors">
                            {calculator.category.toUpperCase()}
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                          {calculator.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                          {calculator.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-orange-600 font-semibold text-sm group-hover:text-orange-700 transition-colors">
                            Calculate Now
                            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div className="text-xs text-gray-400">Free</div>
                        </div>
                      </Link>
                    </Card>
                  </m.div>
                );
              })}
            </div>
          </m.div>
        )}

        {/* Other Tools */}
        {otherCalculators.length > 0 && (
          <m.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <div className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></div>
                  Other Utilities
                  <span className="ml-3 text-lg font-normal text-gray-500">({otherCalculators.length})</span>
                </h3>
                <p className="text-gray-600 ml-6">
                  Statutory calendars and compliance utilities
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherCalculators.map((calculator, index) => {
                const Icon = iconMap[calculator.icon as keyof typeof iconMap] || Calculator;
                
                return (
                  <m.div
                    key={calculator.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="group bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 h-full cursor-pointer hover:border-indigo-300">
                      <Link href={calculator.href}>
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            colorMap[calculator.color as keyof typeof colorMap] || colorMap.indigo
                          }`}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                            {calculator.category.toUpperCase()}
                          </div>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                          {calculator.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                          {calculator.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-indigo-600 font-semibold text-sm group-hover:text-indigo-700 transition-colors">
                            Calculate Now
                            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div className="text-xs text-gray-400">Free</div>
                        </div>
                      </Link>
                    </Card>
                  </m.div>
                );
              })}
            </div>
          </m.div>
        )}

        {/* Call-to-Action */}
        <m.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-lg text-gray-600 mb-6">
            Need personalized tax advice? Our expert CAs are here to help.
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            asChild
          >
            <Link href="/pricing">
              Consult an Expert CA
            </Link>
          </Button>
        </m.div>
      </div>
    </section>
  );
}