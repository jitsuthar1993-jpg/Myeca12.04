import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, Sigma, Lightbulb } from "lucide-react";
import { ReactNode } from "react";

export interface GuideStep {
  title: string;
  description: string | ReactNode;
  formula?: string | ReactNode;
  example?: {
    inputs: string | ReactNode;
    outputs: string | ReactNode;
  };
  note?: string | ReactNode;
}

export function CalculatorGuide({
  title,
  intro,
  steps,
}: {
  title: string;
  intro?: string | ReactNode;
  steps: GuideStep[];
}) {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg transition-colors duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </CardTitle>
          </div>
          <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">Step-by-step</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {intro && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl text-gray-700 dark:text-gray-300">
            {intro}
          </div>
        )}

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-700/30">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
                  {idx + 1}
                </div>
                <div className="w-full">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{step.title}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{step.description}</p>

                  {step.formula && (
                    <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-2">
                        <Sigma className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium">Formula</span>
                      </div>
                      <code className="block text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{step.formula}</code>
                    </div>
                  )}

                  {step.example && (
                    <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-2">
                        <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium">Example</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-300">Inputs</p>
                          <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700">{step.example.inputs}</div>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-300">Outputs</p>
                          <div className="bg-white dark:bg-gray-800 rounded-md p-2 border border-gray-200 dark:border-gray-700">{step.example.outputs}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.note && (
                    <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Note:</span> {step.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="dark:border-gray-700" />
        <p className="text-xs text-gray-500 dark:text-gray-400">This guide reflects the methodology implemented in this calculator. Real-world rules may vary by assessment year and specific conditions.</p>
      </CardContent>
    </Card>
  );
}