import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, AlertTriangle, CheckCircle2, RefreshCcw } from "lucide-react";
import SEO from "@/components/SEO";
import { Link } from "wouter";

const questions = [
  {
    id: 1,
    question: "What is your primary goal for investing?",
    options: [
      { value: "capital_preservation", label: "Preserve my capital (Avoid losses)", score: 1 },
      { value: "steady_income", label: "Generate steady income", score: 2 },
      { value: "growth", label: "Grow my wealth over time", score: 3 },
      { value: "aggressive_growth", label: "Maximize returns aggressively", score: 4 },
    ]
  },
  {
    id: 2,
    question: "How long do you plan to keep your money invested?",
    options: [
      { value: "short_term", label: "Less than 1 year", score: 1 },
      { value: "medium_term", label: "1-3 years", score: 2 },
      { value: "long_term", label: "3-7 years", score: 3 },
      { value: "very_long_term", label: "More than 7 years", score: 4 },
    ]
  },
  {
    id: 3,
    question: "What would you do if your portfolio dropped 20% in a month?",
    options: [
      { value: "sell_all", label: "Sell everything immediately", score: 1 },
      { value: "sell_some", label: "Sell some assets to cut losses", score: 2 },
      { value: "hold", label: "Do nothing and wait for recovery", score: 3 },
      { value: "buy_more", label: "Buy more at lower prices", score: 4 },
    ]
  },
  {
    id: 4,
    question: "How much investment knowledge do you possess?",
    options: [
      { value: "none", label: "None / Beginner", score: 1 },
      { value: "basic", label: "Basic understanding", score: 2 },
      { value: "intermediate", label: "Good understanding of markets", score: 3 },
      { value: "expert", label: "Advanced / Professional", score: 4 },
    ]
  },
  {
    id: 5,
    question: "What is your current age group?",
    options: [
      { value: "retirement", label: "60+ (Retirement age)", score: 1 },
      { value: "late_career", label: "45-60", score: 2 },
      { value: "mid_career", label: "30-45", score: 3 },
      { value: "early_career", label: "Under 30", score: 4 },
    ]
  }
];

const riskProfiles = {
  conservative: {
    title: "Conservative",
    description: "You prioritize safety over returns. You prefer low-risk investments like FDs and Debt Funds.",
    allocation: "10-20% Equity, 80-90% Debt/Fixed Income",
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  balanced: {
    title: "Balanced",
    description: "You seek a balance between risk and return. You are comfortable with moderate fluctuations.",
    allocation: "40-60% Equity, 40-60% Debt",
    color: "text-green-600",
    bg: "bg-green-50"
  },
  growth: {
    title: "Growth",
    description: "You are willing to take risks for higher returns. You have a long-term horizon.",
    allocation: "70-80% Equity, 20-30% Debt",
    color: "text-orange-600",
    bg: "bg-orange-50"
  },
  aggressive: {
    title: "Aggressive",
    description: "You seek maximum returns and can handle significant volatility.",
    allocation: "90-100% Equity, 0-10% Debt",
    color: "text-red-600",
    bg: "bg-red-50"
  }
};

export default function RiskAssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const handleOptionSelect = (score: number) => {
    setAnswers(prev => ({ ...prev, [currentStep]: score }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateResult = () => {
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    const avgScore = totalScore / questions.length;

    if (avgScore <= 1.5) return riskProfiles.conservative;
    if (avgScore <= 2.5) return riskProfiles.balanced;
    if (avgScore <= 3.5) return riskProfiles.growth;
    return riskProfiles.aggressive;
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentStep(0);
    setShowResult(false);
  };

  const progress = ((currentStep + 1) / questions.length) * 100;
  const currentQuestion = questions[currentStep];

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <SEO 
        title="Risk Assessment Questionnaire - MyeCA"
        description="Discover your investor risk profile and get personalized asset allocation suggestions."
      />

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Investor Risk Profile</h1>
        <p className="text-slate-600">Answer 5 simple questions to understand your investment style.</p>
      </div>

      {!showResult ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-500">Question {currentStep + 1} of {questions.length}</span>
              <span className="text-sm font-medium text-blue-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <CardTitle className="text-xl pt-6">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup onValueChange={(val) => handleOptionSelect(parseInt(val))} className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className={`flex items-center space-x-2 border p-4 rounded-lg transition-all cursor-pointer hover:border-blue-400 ${answers[currentStep] === option.score ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                  <RadioGroupItem value={option.score.toString()} id={`opt-${index}`} />
                  <Label htmlFor={`opt-${index}`} className="flex-1 cursor-pointer font-normal text-base">{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-end pt-4">
            <Button 
              onClick={handleNext} 
              disabled={!answers[currentStep]}
              className="w-full sm:w-auto"
            >
              {currentStep === questions.length - 1 ? "View Results" : "Next Question"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {(() => {
            const result = calculateResult();
            return (
              <>
                <Card className={`border-t-4 ${result.title === 'Conservative' ? 'border-t-blue-500' : result.title === 'Balanced' ? 'border-t-green-500' : result.title === 'Growth' ? 'border-t-orange-500' : 'border-t-red-500'}`}>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-slate-500 text-sm uppercase tracking-wider">Your Risk Profile</CardTitle>
                    <h2 className={`text-4xl font-bold mt-2 ${result.color}`}>{result.title}</h2>
                  </CardHeader>
                  <CardContent className="text-center pt-4">
                    <p className="text-lg text-slate-700 mb-6">{result.description}</p>
                    
                    <div className={`p-6 rounded-xl ${result.bg} inline-block w-full`}>
                      <h3 className="font-semibold text-slate-900 mb-2">Recommended Allocation</h3>
                      <p className={`text-xl font-bold ${result.color}`}>{result.allocation}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center pb-8">
                    <Button variant="outline" onClick={resetQuiz} className="mr-4">
                      <RefreshCcw className="w-4 h-4 mr-2" /> Retake
                    </Button>
                    <Link href="/investment/dashboard">
                      <Button>Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </Link>
                  </CardFooter>
                </Card>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-800 text-sm">Disclaimer</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      This assessment is for educational purposes only and does not constitute financial advice. 
                      Please consult a certified financial advisor before making investment decisions.
                    </p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
