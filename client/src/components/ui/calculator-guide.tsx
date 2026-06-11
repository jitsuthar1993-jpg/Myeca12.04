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
    <Card className="bg-white  border-slate-200  rounded-2xl shadow-lg transition-colors duration-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-purple-600 " />
            <CardTitle className="text-2xl font-bold text-slate-900 ">
              {title}
            </CardTitle>
          </div>
          <Badge className="bg-purple-100  text-purple-700 ">Step-by-step</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {intro && (
          <div className="bg-slate-50  p-4 rounded-xl text-slate-700 ">
            {intro}
          </div>
        )}

        <div className="space-y-6">
          {steps.map((step, idx) => (
            <div key={idx} className="border border-slate-200  rounded-xl p-4 bg-slate-50 ">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
                  {idx + 1}
                </div>
                <div className="w-full">
                  <h4 className="font-semibold text-slate-900  mb-1">{step.title}</h4>
                  <p className="text-sm text-slate-700  mb-3">{step.description}</p>

                  {step.formula && (
                    <div className="mt-2 bg-white  border border-slate-200  rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-900  mb-2">
                        <Sigma className="w-4 h-4 text-purple-600 " />
                        <span className="text-sm font-medium">Formula</span>
                      </div>
                      <code className="block text-sm text-slate-800  whitespace-pre-wrap">{step.formula}</code>
                    </div>
                  )}

                  {step.example && (
                    <div className="mt-3 bg-blue-50  border border-blue-200  rounded-lg p-3">
                      <div className="flex items-center gap-2 text-slate-900  mb-2">
                        <Lightbulb className="w-4 h-4 text-blue-600 " />
                        <span className="text-sm font-medium">Example</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-slate-600 ">Inputs</p>
                          <div className="bg-white  rounded-md p-2 border border-slate-200 ">{step.example.inputs}</div>
                        </div>
                        <div>
                          <p className="text-slate-600 ">Outputs</p>
                          <div className="bg-white  rounded-md p-2 border border-slate-200 ">{step.example.outputs}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step.note && (
                    <div className="mt-3 text-xs text-slate-600 ">
                      <span className="font-medium">Note:</span> {step.note}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="" />
        <p className="text-xs text-slate-500 ">This guide reflects the methodology implemented in this calculator. Real-world rules may vary by assessment year and specific conditions.</p>
      </CardContent>
    </Card>
  );
}