import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUIStore } from '@/stores/uiStore';
import { Link } from 'wouter';
import {
  Calculator,
  FileText,
  TrendingUp,
  Shield,
  Rocket,
  CheckCircle,
  ArrowRight,
  X,
  Sparkles,
  Building2,
  User,
  HelpCircle
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
  tips?: string[];
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to MyeCA.in!',
    description: 'Your one-stop platform for tax filing, calculators, and professional CA services.',
    icon: <Sparkles className="h-12 w-12 text-blue-500" />,
    tips: [
      'We help you save tax legally',
      'Expert CAs available for consultation',
      'All your compliance needs in one place'
    ]
  },
  {
    id: 'calculators',
    title: 'Free Tax Calculators',
    description: 'Use our accurate calculators to plan your taxes and investments.',
    icon: <Calculator className="h-12 w-12 text-green-500" />,
    action: {
      label: 'Try Income Tax Calculator',
      href: '/calculators/income-tax'
    },
    tips: [
      'Compare old vs new tax regime',
      'Calculate HRA exemption',
      'Plan your investments with SIP calculator'
    ]
  },
  {
    id: 'itr-filing',
    title: 'Easy ITR Filing',
    description: 'File your Income Tax Return with expert CA assistance at affordable prices.',
    icon: <FileText className="h-12 w-12 text-purple-500" />,
    action: {
      label: 'Start Filing ITR',
      href: '/itr/form-selector'
    },
    tips: [
      'ITR-1 filing starts at just \u20B9499',
      'Upload Form 16 and we handle the rest',
      'Track your refund status in real-time'
    ]
  },
  {
    id: 'services',
    title: 'Professional CA Services',
    description: 'From GST registration to company formation - we have you covered.',
    icon: <Building2 className="h-12 w-12 text-orange-500" />,
    action: {
      label: 'Browse Services',
      href: '/services/marketplace'
    },
    tips: [
      'Transparent pricing for all services',
      'Quick turnaround time',
      'Dedicated support team'
    ]
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Start exploring MyeCA and take control of your finances.',
    icon: <CheckCircle className="h-12 w-12 text-green-500" />,
    tips: [
      'Your data is saved automatically',
      'Access help anytime via chat',
      'Compliance reminders keep you on track'
    ]
  }
];

export function OnboardingModal() {
  const { onboarding, completeOnboardingStep, skipOnboarding, completeOnboarding } = useUIStore();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Don't show if already completed or skipped
  if (onboarding.completed || onboarding.skippedAt) {
    return null;
  }

  // Don't show if onboarding hasn't started
  if (onboarding.currentStep === 0) {
    return null;
  }

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    completeOnboardingStep(step.id);
    if (isLastStep) {
      completeOnboarding();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-lg"
        >
          <Card className="overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Skip onboarding"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm text-blue-200 mb-1">
                    Step {currentStep + 1} of {ONBOARDING_STEPS.length}
                  </p>
                  <h2 className="text-2xl font-bold">{step.title}</h2>
                </div>
              </div>
              
              <Progress 
                value={progress} 
                className="mt-4 h-1 bg-white/20"
              />
            </div>

            {/* Content */}
            <CardContent className="p-6">
              <p className="text-gray-600 mb-6">{step.description}</p>

              {step.tips && (
                <div className="space-y-3 mb-6">
                  {step.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                {currentStep > 0 ? (
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(prev => prev - 1)}
                  >
                    Back
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip Tour
                  </Button>
                )}

                <div className="flex gap-2">
                  {step.action && (
                    <Link href={step.action.href}>
                      <Button variant="outline" onClick={handleSkip}>
                        {step.action.label}
                      </Button>
                    </Link>
                  )}
                  
                  <Button onClick={handleNext}>
                    {isLastStep ? 'Get Started' : 'Next'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Floating button to restart onboarding
export function OnboardingTrigger() {
  const { onboarding, startOnboarding, resetOnboarding } = useUIStore();
  const [showTooltip, setShowTooltip] = useState(false);

  // Show for new users after 5 seconds
  useEffect(() => {
    if (!onboarding.completed && !onboarding.skippedAt && onboarding.currentStep === 0) {
      const timer = setTimeout(() => {
        startOnboarding();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [onboarding, startOnboarding]);

  // Don't show trigger if onboarding is active
  if (onboarding.currentStep > 0 && !onboarding.completed && !onboarding.skippedAt) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 md:bottom-8">
      <div className="relative">
        <Button
          size="icon"
          variant="outline"
          className="h-12 w-12 rounded-full shadow-lg bg-white hover:bg-blue-50 border-blue-200"
          onClick={() => {
            resetOnboarding();
            startOnboarding();
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <HelpCircle className="h-6 w-6 text-blue-600" />
        </Button>
        
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-full mr-2 top-1/2 -translate-y-1/2 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg"
          >
            Take a tour
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Welcome banner for first-time users
export function WelcomeBanner() {
  const { onboarding, startOnboarding } = useUIStore();
  const [dismissed, setDismissed] = useState(false);

  if (onboarding.completed || onboarding.skippedAt || dismissed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5" />
          <p className="text-sm font-medium">
            New here? Take a quick tour to get started!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={() => startOnboarding()}
          >
            Start Tour
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default OnboardingModal;

