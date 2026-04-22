import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calculator, Delete, History, Sparkles, Zap } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";
import Breadcrumb from "@/components/Breadcrumb";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { getSEOConfig } from "@/config/seo.config";

// Pure calculator logic
const ops: Record<string, (a: number, b: number) => number> = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => (b === 0 ? NaN : a / b),
};

export default function GeneralCalculatorPage() {
  const seo = getSEOConfig('/calculators/general');

  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [history, setHistory] = useState<{ expression: string; result: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  const inputDigit = useCallback((digit: string) => {
    if (waitingForNewValue) {
      setDisplay(digit);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }, [display, waitingForNewValue]);

  const inputDecimal = useCallback(() => {
    if (waitingForNewValue) { setDisplay("0."); setWaitingForNewValue(false); return; }
    if (!display.includes(".")) setDisplay(display + ".");
  }, [display, waitingForNewValue]);

  const performOperation = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display);
    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const result = ops[operator](prevValue, inputValue);
      const item = { expression: `${prevValue} ${operator} ${inputValue}`, result: String(result) };
      setHistory(prev => [item, ...prev].slice(0, 10));
      setPrevValue(result);
      setDisplay(String(result));
    }
    setWaitingForNewValue(true);
    setOperator(nextOperator);
    setEquation(`${display} ${nextOperator}`);
  }, [display, operator, prevValue]);

  const handleFunction = useCallback((func: string) => {
    const v = parseFloat(display);
    let result = 0; let expr = "";
    switch (func) {
      case "%": result = v / 100; expr = `${v}%`; break;
      case "sqrt": result = Math.sqrt(v); expr = `√(${v})`; break;
      case "sqr": result = v * v; expr = `sqr(${v})`; break;
      case "inv": result = 1 / v; expr = `1/(${v})`; break;
      case "neg": setDisplay(String(v * -1)); setWaitingForNewValue(true); return;
    }
    setDisplay(String(result));
    setWaitingForNewValue(true);
    setHistory(prev => [{ expression: expr, result: String(result) }, ...prev].slice(0, 10));
  }, [display]);

  const clear = useCallback(() => {
    setDisplay("0"); setEquation(""); setPrevValue(null); setOperator(null); setWaitingForNewValue(false);
  }, []);

  const backspace = useCallback(() => {
    if (waitingForNewValue) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  }, [display, waitingForNewValue]);

  const handleEquals = useCallback(() => {
    if (!operator || prevValue === null) return;
    const inputValue = parseFloat(display);
    const result = ops[operator](prevValue, inputValue);
    setHistory(prev => [{ expression: `${prevValue} ${operator} ${inputValue}`, result: String(result) }, ...prev].slice(0, 10));
    setDisplay(String(result));
    setPrevValue(null); setOperator(null); setWaitingForNewValue(true); setEquation("");
  }, [display, operator, prevValue]);

  // Keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (/\d/.test(e.key)) { e.preventDefault(); inputDigit(e.key); }
      else if (e.key === ".") { e.preventDefault(); inputDecimal(); }
      else if (["+", "-", "*", "/"].includes(e.key)) { e.preventDefault(); performOperation(e.key); }
      else if (e.key === "Enter" || e.key === "=") { e.preventDefault(); handleEquals(); }
      else if (e.key === "Backspace") { e.preventDefault(); backspace(); }
      else if (e.key === "Escape") { e.preventDefault(); clear(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [inputDigit, inputDecimal, performOperation, handleEquals, backspace, clear]);

  // Formatted display
  const formattedDisplay = (() => {
    const num = parseFloat(display);
    if (isNaN(num)) return "Error";
    if (display.endsWith(".")) return display;
    if (Math.abs(num) > 1e15) return num.toExponential(6);
    return num.toLocaleString("en-US", { maximumFractionDigits: 10 }).replace(/,/g, ",");
  })();

  const btnBase = "h-[68px] text-xl font-semibold rounded-none transition-all duration-100 border-0";

  return (
    <>
      <MetaSEO
        title={seo?.title || "General Calculator 2025 | Free Online Calculator | MyeCA.in"}
        description={seo?.description || "Free online general calculator with keyboard support, calculation history, and scientific functions. Clean, professional, and instant calculations."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="min-h-screen bg-[#f8fafc] antialiased">
        {/* Ambient blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[30%] -right-[10%] w-[55%] h-[55%] bg-gradient-to-bl from-blue-100/30 to-transparent blur-[100px] rounded-full" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[45%] h-[45%] bg-gradient-to-tr from-slate-100/60 to-transparent blur-[100px] rounded-full" />
        </div>

        {/* Sticky Breadcrumb */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
          <Breadcrumb items={[{ name: "Calculators", href: "/calculators" }, { name: "General Calculator" }]} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-5">

          {/* ── Compact Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-5"
          >
            <div className="flex items-center gap-3">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                General Calculator
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Keyboard Supported
              </span>
            </div>
            <Link href="/calculators">
              <button className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
                <Calculator className="w-3.5 h-3.5 text-blue-400" />
                All Calculators
              </button>
            </Link>
          </motion.div>

          {/* ── Calculator + History ── */}
          <div className="flex flex-col md:flex-row gap-5 items-start justify-center">

            {/* Main Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="w-full max-w-md mx-auto"
            >
              <Card className="shadow-lg border-slate-200 bg-white overflow-hidden rounded-3xl">

                {/* ── Display Area (LIGHT THEMED) ── */}
                <div className="bg-slate-50 border-b border-slate-200 px-5 pt-5 pb-4 text-right relative">
                  <div className="absolute top-3 left-4 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold text-slate-500 border-slate-200 bg-white">Standard</Badge>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                        showHistory ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      )}
                      title="Toggle History"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="h-6 text-slate-400 text-xs font-mono mb-1 mt-2 truncate">{equation || "\u00A0"}</div>
                  <div className="text-4xl sm:text-5xl font-bold text-slate-900 font-mono tracking-tight overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {formattedDisplay}
                  </div>
                </div>

                <CardContent className="p-0">
                  {/* Functions Bar */}
                  <div className="grid grid-cols-5 border-b border-slate-100 bg-white">
                    {[
                      { label: "⌫", action: () => backspace(), title: "Backspace" },
                      { label: "√", action: () => handleFunction("sqrt"), title: "Square Root" },
                      { label: "x²", action: () => handleFunction("sqr"), title: "Square" },
                      { label: "1/x", action: () => handleFunction("inv"), title: "Inverse" },
                      { label: "%", action: () => handleFunction("%"), title: "Percent" },
                    ].map(btn => (
                      <button
                        key={btn.label}
                        onClick={btn.action}
                        title={btn.title}
                        className="h-12 text-[15px] font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors border-r border-slate-100 last:border-r-0"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Main Keypad */}
                  <div className="grid grid-cols-4 gap-[1px] bg-slate-100">
                    {/* Row 1: AC, +/−, ops */}
                    <button onClick={clear} className={cn(btnBase, "h-[64px] text-red-500 bg-white hover:bg-red-50 font-bold text-base")}>AC</button>
                    <button onClick={() => handleFunction("neg")} className={cn(btnBase, "h-[64px] text-slate-600 bg-white hover:bg-slate-50 text-lg")}>+/−</button>
                    <button onClick={() => performOperation("/")} className={cn(btnBase, "h-[64px] text-blue-600 bg-blue-50/40 hover:bg-blue-50 font-bold text-xl")}>÷</button>
                    <button onClick={() => performOperation("*")} className={cn(btnBase, "h-[64px] text-blue-600 bg-blue-50/40 hover:bg-blue-50 font-bold text-xl")}>×</button>

                    {/* Row 2: 7,8,9, − */}
                    {["7", "8", "9"].map(d => (
                      <button key={d} onClick={() => inputDigit(d)} className={cn(btnBase, "bg-white text-slate-800 hover:bg-slate-50")}>{d}</button>
                    ))}
                    <button onClick={() => performOperation("-")} className={cn(btnBase, "text-blue-600 bg-blue-50/40 hover:bg-blue-50 font-bold")}>−</button>

                    {/* Row 3: 4,5,6, + */}
                    {["4", "5", "6"].map(d => (
                      <button key={d} onClick={() => inputDigit(d)} className={cn(btnBase, "bg-white text-slate-800 hover:bg-slate-50")}>{d}</button>
                    ))}
                    <button onClick={() => performOperation("+")} className={cn(btnBase, "text-blue-600 bg-blue-50/40 hover:bg-blue-50 font-bold")}>+</button>

                    {/* Row 4: 1,2,3, = */}
                    {["1", "2", "3"].map(d => (
                      <button key={d} onClick={() => inputDigit(d)} className={cn(btnBase, "bg-white text-slate-800 hover:bg-slate-50")}>{d}</button>
                    ))}
                    <button
                      onClick={handleEquals}
                      className={cn(btnBase, "row-span-2 text-white bg-blue-600 hover:bg-blue-700 shadow-inner text-2xl h-[132px]")}
                    >=</button>

                    {/* Row 5: +/−, 0, . */}
                    <button onClick={() => inputDigit("0")} className={cn(btnBase, "col-span-2 bg-white text-slate-800 hover:bg-slate-50")}>0</button>
                    <button onClick={inputDecimal} className={cn(btnBase, "bg-white text-slate-800 hover:bg-slate-50 font-bold text-2xl")}>.</button>
                  </div>
                </CardContent>
              </Card>
              <p className="mt-3 text-center text-[11px] text-slate-400 font-medium">
                ⌨️ Keyboard shortcuts supported · NumPad enabled
              </p>
            </motion.div>

            {/* History Panel */}
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full max-w-xs"
              >
                <Card className="h-full max-h-[520px] flex flex-col bg-white border-slate-200 shadow-sm rounded-3xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-sm text-slate-700 flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-400" /> Calculation History
                    </h3>
                    <button onClick={() => setHistory([])} disabled={history.length === 0} className="text-[11px] font-bold text-red-500 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed">
                      Clear All
                    </button>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    {history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                        <Calculator className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-xs font-medium">No history yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {history.map((item, i) => (
                          <div
                            key={i}
                            className="group p-3 rounded-xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                            onClick={() => setDisplay(item.result)}
                            title="Click to use this value"
                          >
                            <div className="text-xs text-slate-400 text-right mb-0.5 font-mono">{item.expression} =</div>
                            <div className="text-base font-bold text-slate-800 text-right group-hover:text-blue-600 font-mono tabular-nums">
                              {parseFloat(item.result).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </Card>
              </motion.div>
            )}
          </div>

          {/* ═══════════════ INFORMATION SECTION ═══════════════ */}
          <CalculatorMiniBlog
            features={[
              {
                icon: <Calculator className="w-5 h-5" />,
                iconBg: "bg-blue-50 text-blue-600",
                title: "Keyboard Shortcuts",
                desc: "Use your numpad or keyboard for lightning-fast calculations. Press Enter for equals, Escape to clear, and Backspace to delete. All standard operators are supported.",
              },
              {
                icon: <History className="w-5 h-5" />,
                iconBg: "bg-indigo-50 text-indigo-600",
                title: "Calculation History",
                desc: "The history panel stores your last 10 calculations. Click on any previous result to instantly load it into the display for use in your next calculation.",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                iconBg: "bg-slate-100 text-slate-600",
                title: "Scientific Functions",
                desc: "Built-in functions include square root (√), square (x²), inverse (1/x), percentage (%), and positive/negative toggle — all one click away.",
              },
            ]}
            howItWorks={{
              title: "How to Use the Calculator",
              description: (
                <p>
                  This is a standard arithmetic calculator with scientific function shortcuts. It supports chained operations, keyboard input, and maintains a session history of your calculations.
                </p>
              ),
              steps: [
                { title: "Enter a Number", desc: "Click the digit buttons or use your keyboard numpad. The display shows your current input in real time." },
                { title: "Choose an Operation", desc: "Click +, −, ×, ÷ to select an arithmetic operation. For functions, use the top row (√, x², 1/x, %)." },
                { title: "View Result", desc: "Press = or Enter to compute. The result appears instantly and is saved to your History panel automatically." },
              ],
            }}
            faqs={[
              {
                q: "How do I calculate a percentage?",
                a: "Enter a number and press the % button. For example, to calculate 15% of 5000: enter 5000, press ×, enter 15, press %.",
              },
              {
                q: "Does this support keyboard input?",
                a: "Yes. You can use number keys (0-9), operators (+, -, *, /), decimal point (.), Enter for equals, Backspace to delete, and Escape to clear.",
              },
              {
                q: "How does the history panel work?",
                a: "Toggle history by clicking the clock icon near the display. Every calculation is saved (up to 10). Click any history entry to load that result directly into the display.",
              },
              {
                q: "What happens if I divide by zero?",
                a: "Dividing by zero returns 'Error'. Press AC (All Clear) to reset the calculator and start a new calculation.",
              },
            ]}
            ctaTitle="Need a Specialized Financial Calculator?"
            ctaDescription="Browse our suite of professional financial calculators — SIP, PPF, EMI, HRA, TDS, Income Tax, and more — all designed for Indian taxpayers."
          />
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200/60 py-8 px-4 text-center mt-12">
          <p className="text-[11px] font-medium text-slate-400 tracking-wide">
            MyeCA.in · Free Online Calculator · Professional Financial Tools · © 2025
          </p>
        </div>
      </div>
    </>
  );
}
