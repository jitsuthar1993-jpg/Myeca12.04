import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface CTA {
  label: string;
  icon?: IconType;
  href?: string;
  variant?: "solid" | "outline";
}

interface ServiceHeaderProps {
  icon: IconType;
  title: string;
  description: string;
  accentBgClass: string;        // e.g., "bg-blue-50"
  accentIconClass: string;      // e.g., "text-blue-600"
  primaryCTA?: CTA;
  secondaryCTA?: CTA;
  tipsTitle?: string;
  tipsSubtitle?: string;
  tipsIcon?: IconType;
  tipsAccentClass?: string;     // e.g., "text-blue-600"
  children?: React.ReactNode;   // tips list
}

export default function ServiceHeader(props: ServiceHeaderProps) {
  const {
    icon: Icon,
    title,
    description,
    accentBgClass,
    accentIconClass,
    primaryCTA,
    secondaryCTA,
    tipsTitle = "Quick Tips",
    tipsSubtitle,
    tipsIcon: TipsIcon,
    tipsAccentClass = accentIconClass,
    children
  } = props;

  const PrimaryIcon = primaryCTA?.icon;
  const SecondaryIcon = secondaryCTA?.icon;

  const PrimaryButton = (
    primaryCTA && (
      <Button
        size="sm"
        className={cn("px-5 py-2.5 font-semibold", "bg-slate-800 hover:bg-slate-900 text-white")}
      >
        {PrimaryIcon && <PrimaryIcon className="w-4 h-4 mr-2" />}
        {primaryCTA.label}
      </Button>
    )
  );

  const SecondaryButton = (
    secondaryCTA && (
      <Button
        size="sm"
        variant="outline"
        className={cn("px-5 py-2.5 font-semibold", "border-slate-700 text-slate-700 hover:bg-slate-50")}
      >
        {SecondaryIcon && <SecondaryIcon className="w-4 h-4 mr-2" />}
        {secondaryCTA.label}
      </Button>
    )
  );

  return (
    <section className="bg-white border-b soft-border py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn("w-14 h-14 rounded-full flex items-center justify-center soft-shadow", accentBgClass)}>
                <Icon className={cn("w-8 h-8", accentIconClass)} />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {title}
              </h1>
            </div>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
              {description}
            </p>
            <div className="flex flex-wrap gap-3">
              {PrimaryButton}
              {SecondaryButton}
            </div>
          </div>

          <Card className="soft-shadow">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                {TipsIcon ? <TipsIcon className={cn("w-4 h-4", tipsAccentClass)} /> : null}
                {tipsTitle}
              </CardTitle>
              {tipsSubtitle && <CardDescription>{tipsSubtitle}</CardDescription>}
            </CardHeader>
            <CardContent>
              {children}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

