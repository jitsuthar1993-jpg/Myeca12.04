import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, RotateCcw, Delete, History, Check } from "lucide-react";
import SEO from "@/components/SEO";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Calculator operations
const add = (a: number, b: number) => a + b;
const subtract = (a: number, b: number) => a - b;
const multiply = (a: number, b: number) => a * b;
const divide = (a: number, b: number) => b === 0 ? NaN : a / b;
const percent = (a: number) => a / 100;
const sqrt = (a: number) => Math.sqrt(a);
const square = (a: number) => a * a;

export default function GeneralCalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [history, setHistory] = useState<{ expression: string; result: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);

  // Handle number input
  const inputDigit = useCallback((digit: string) => {
    if (waitingForNewValue) {
      setDisplay(digit);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  }, [display, waitingForNewValue]);

  // Handle decimal point
  const inputDecimal = useCallback(() => {
    if (waitingForNewValue) {
      setDisplay("0.");
      setWaitingForNewValue(false);
      return;
    }

    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForNewValue]);

  // Handle operators
  const performOperation = useCallback((nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      const newValue = inputValue;
      
      let result = 0;
      switch (operator) {
        case "+": result = add(currentValue, newValue); break;
        case "-": result = subtract(currentValue, newValue); break;
        case "*": result = multiply(currentValue, newValue); break;
        case "/": result = divide(currentValue, newValue); break;
      }

      setPrevValue(result);
      setDisplay(String(result));
      
      // Add to history
      const newHistoryItem = {
        expression: `${currentValue} ${operator} ${newValue}`,
        result: String(result)
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // Keep last 10
    }

    setWaitingForNewValue(true);
    setOperator(nextOperator);
    setEquation(`${display} ${nextOperator}`);
  }, [display, operator, prevValue]);

  // Handle special functions
  const handleFunction = useCallback((func: string) => {
    const currentValue = parseFloat(display);
    let result = 0;
    let expr = "";

    switch (func) {
      case "%":
        result = percent(currentValue);
        expr = `${currentValue}%`;
        break;
      case "sqrt":
        result = sqrt(currentValue);
        expr = `√(${currentValue})`;
        break;
      case "sqr":
        result = square(currentValue);
        expr = `sqr(${currentValue})`;
        break;
      case "inv":
        result = 1 / currentValue;
        expr = `1/(${currentValue})`;
        break;
      case "neg":
        result = currentValue * -1;
        break;
    }

    setDisplay(String(result));
    setWaitingForNewValue(true);
    
    if (func !== "neg") {
      setHistory(prev => [{ expression: expr, result: String(result) }, ...prev].slice(0, 10));
    }
  }, [display]);

  // Handle clear
  const clear = useCallback(() => {
    setDisplay("0");
    setEquation("");
    setPrevValue(null);
    setOperator(null);
    setWaitingForNewValue(false);
  }, []);

  // Handle backspace
  const backspace = useCallback(() => {
    if (waitingForNewValue) return;
    
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  }, [display, waitingForNewValue]);

  // Handle equals
  const handleEquals = useCallback(() => {
    if (!operator || prevValue === null) return;

    const inputValue = parseFloat(display);
    let result = 0;

    switch (operator) {
      case "+": result = add(prevValue, inputValue); break;
      case "-": result = subtract(prevValue, inputValue); break;
      case "*": result = multiply(prevValue, inputValue); break;
      case "/": result = divide(prevValue, inputValue); break;
    }

    setHistory(prev => [{ 
      expression: `${prevValue} ${operator} ${inputValue}`, 
      result: String(result) 
    }, ...prev].slice(0, 10));

    setDisplay(String(result));
    setPrevValue(null);
    setOperator(null);
    setWaitingForNewValue(true);
    setEquation("");
  }, [display, operator, prevValue]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      if (/\d/.test(key)) {
        event.preventDefault();
        inputDigit(key);
      } else if (key === ".") {
        event.preventDefault();
        inputDecimal();
      } else if (["+", "-", "*", "/"].includes(key)) {
        event.preventDefault();
        performOperation(key);
      } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        handleEquals();
      } else if (key === "Backspace") {
        event.preventDefault();
        backspace();
      } else if (key === "Escape") {
        event.preventDefault();
        clear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputDigit, inputDecimal, performOperation, handleEquals, backspace, clear]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <SEO 
        title="General Calculator - SmartTax" 
        description="A powerful and easy-to-use general purpose calculator for all your calculation needs."
      />
      
      {/* Compact Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold mb-4 border border-slate-200">
          <Calculator className="w-4 h-4 mr-2" />
          Standard Calculator
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          General Calculator
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Perform standard arithmetic operations with a history log. Keyboard shortcuts enabled.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
        {/* Main Calculator */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-slate-200 bg-white overflow-hidden rounded-3xl">
            {/* Display Area */}
            <div className="bg-slate-900 p-6 text-right relative">
              <div className="h-6 text-slate-400 text-sm font-mono mb-1">{equation}</div>
              <div className="text-4xl sm:text-5xl font-bold text-white font-mono tracking-wider overflow-x-auto scrollbar-hide">
                {parseFloat(display).toLocaleString('en-US', { maximumFractionDigits: 10 })}
              </div>
              <div className="absolute top-4 left-4">
                 <Badge variant="outline" className="text-slate-400 border-slate-700 bg-slate-800/50">Standard</Badge>
              </div>
            </div>

            <CardContent className="p-0">
              {/* Controls & Functions Bar */}
              <div className="grid grid-cols-5 bg-slate-100 border-b border-slate-200">
                 <Button variant="ghost" className="h-14 rounded-none text-slate-600 hover:text-blue-600 hover:bg-white" onClick={() => setShowHistory(!showHistory)}>
                   <History className="w-5 h-5" />
                 </Button>
                 <Button variant="ghost" className="h-14 rounded-none text-slate-600 hover:text-blue-600 hover:bg-white" onClick={() => handleFunction("sqrt")}>√</Button>
                 <Button variant="ghost" className="h-14 rounded-none text-slate-600 hover:text-blue-600 hover:bg-white" onClick={() => handleFunction("sqr")}>x²</Button>
                 <Button variant="ghost" className="h-14 rounded-none text-slate-600 hover:text-blue-600 hover:bg-white" onClick={() => handleFunction("inv")}>1/x</Button>
                 <Button variant="ghost" className="h-14 rounded-none text-slate-600 hover:text-blue-600 hover:bg-white" onClick={() => handleFunction("%")}>%</Button>
              </div>

              {/* Main Keypad */}
              <div className="grid grid-cols-4 gap-[1px] bg-slate-200">
                {/* Row 1 */}
                <Button variant="ghost" className="h-20 text-lg font-medium bg-white rounded-none hover:bg-slate-50 text-red-500" onClick={clear}>AC</Button>
                <Button variant="ghost" className="h-20 text-lg font-medium bg-white rounded-none hover:bg-slate-50 text-slate-600" onClick={backspace}><Delete className="w-5 h-5" /></Button>
                <Button variant="ghost" className="h-20 text-lg font-medium bg-white rounded-none hover:bg-slate-50 text-blue-600 bg-blue-50/30" onClick={() => performOperation("/")}>÷</Button>
                <Button variant="ghost" className="h-20 text-lg font-medium bg-white rounded-none hover:bg-slate-50 text-blue-600 bg-blue-50/30" onClick={() => performOperation("*")}>×</Button>

                {/* Row 2 */}
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={() => inputDigit("7")}>7</Button>
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={() => inputDigit("8")}>8</Button>
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={() => inputDigit("9")}>9</Button>
                <Button variant="ghost" className="h-20 text-lg font-medium bg-white rounded-none hover:bg-slate-50 text-blue-600 bg-blue-50/30" onClick={() => performOperation("-")}>−</Button>

                {/* Row 3 */}
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={() => inputDigit("4")}>4</Button>
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={() => inputDigit("5")}>5</Button>
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={() => inputDigit("6")}>6</Button>
                <Button variant="ghost" className="h-20 text-lg font-medium bg-white rounded-none hover:bg-slate-50 text-blue-600 bg-blue-50/30" onClick={() => performOperation("+")}>+</Button>

                {/* Row 4 */}
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={() => inputDigit("1")}>1</Button>
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={() => inputDigit("2")}>2</Button>
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={() => inputDigit("3")}>3</Button>
                <Button variant="ghost" className="h-20 row-span-2 text-xl font-medium bg-blue-600 text-white rounded-none hover:bg-blue-700 shadow-inner" onClick={handleEquals}>=</Button>

                {/* Row 5 */}
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={() => handleFunction("neg")}>+/−</Button>
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={() => inputDigit("0")}>0</Button>
                <Button variant="ghost" className="h-20 text-2xl font-normal bg-white rounded-none hover:bg-slate-50 text-slate-800" onClick={inputDecimal}>.</Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 text-center text-sm text-slate-500">
             Keyboard shortcuts enabled. Use NumPad or standard keys.
          </div>
        </div>

        {/* History Panel (Desktop) */}
        {showHistory && (
           <div className="w-full max-w-xs animate-in slide-in-from-right duration-300">
             <Card className="h-full max-h-[600px] flex flex-col bg-white/80 backdrop-blur border-slate-200 shadow-lg">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                   <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                      <History className="w-4 h-4" /> History
                   </h3>
                   <Button variant="ghost" size="sm" onClick={() => setHistory([])} disabled={history.length === 0} className="text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                      Clear
                   </Button>
                </div>
                <ScrollArea className="flex-1 p-4">
                   {history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                         <Calculator className="w-8 h-8 mb-2 opacity-20" />
                         No history yet
                      </div>
                   ) : (
                      <div className="space-y-4">
                         {history.map((item, index) => (
                            <div key={index} className="group p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer" onClick={() => setDisplay(item.result)}>
                               <div className="text-sm text-slate-500 text-right mb-1">{item.expression} =</div>
                               <div className="text-lg font-semibold text-slate-800 text-right group-hover:text-blue-600">{parseFloat(item.result).toLocaleString()}</div>
                            </div>
                         ))}
                      </div>
                   )}
                </ScrollArea>
             </Card>
           </div>
        )}
      </div>
    </div>
  );
}
