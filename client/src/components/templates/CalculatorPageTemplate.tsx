import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EnhancedSEO from '@/components/EnhancedSEO';
import { Calculator, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface CalculatorPageTemplateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  breadcrumbs?: Array<{ label: string; href?: string }>;
  inputSection: ReactNode;
  resultSection?: ReactNode;
  additionalInfo?: ReactNode;
  sidebarContent?: ReactNode;
  footerContent?: ReactNode;
  className?: string;
  showBackButton?: boolean;
  backButtonHref?: string;
  fullWidth?: boolean;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export function CalculatorPageTemplate({
  title,
  description,
  icon,
  seoTitle,
  seoDescription,
  seoKeywords = [],
  breadcrumbs = [],
  inputSection,
  resultSection,
  additionalInfo,
  sidebarContent,
  footerContent,
  className,
  showBackButton = true,
  backButtonHref = '/calculators',
  fullWidth = false,
}: CalculatorPageTemplateProps) {
  return (
    <>
      <EnhancedSEO
        title={seoTitle || `${title} - MyeCA.in`}
        description={seoDescription || description}
        keywords={['calculator', 'tax', 'India', ...seoKeywords]}
        type="article"
      />

      <div className={cn('min-h-screen bg-background', className)}>
        <div className={cn('container mx-auto px-4 py-6 md:py-8', fullWidth ? 'max-w-7xl' : 'max-w-6xl')}>
          {/* Header with breadcrumbs */}
          <motion.div {...fadeInUp} className="mb-6">
            {showBackButton && (
              <Link href={backButtonHref}>
                <Button variant="ghost" size="sm" className="mb-4 gap-2" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Calculators
                </Button>
              </Link>
            )}

            {breadcrumbs.length > 0 && (
              <nav aria-label="Breadcrumb" className="mb-4">
                <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                  {breadcrumbs.map((crumb, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {index > 0 && <span>/</span>}
                      {crumb.href ? (
                        <Link href={crumb.href} className="hover:text-foreground transition-colors">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-foreground">{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon || <Calculator className="h-6 w-6" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl" data-testid="text-page-title">
                  {title}
                </h1>
                <p className="text-muted-foreground mt-1">{description}</p>
              </div>
            </div>
          </motion.div>

          {/* Main content layout */}
          <div className={cn('grid gap-6', sidebarContent ? 'lg:grid-cols-3' : 'lg:grid-cols-1')}>
            {/* Calculator section */}
            <div className={cn(sidebarContent ? 'lg:col-span-2' : '')}>
              <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Enter Details</CardTitle>
                    <CardDescription>
                      Fill in the required information to calculate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {inputSection}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Results section */}
              {resultSection && (
                <motion.div {...fadeInUp} transition={{ delay: 0.2 }} className="mt-6">
                  {resultSection}
                </motion.div>
              )}

              {/* Additional info below results */}
              {additionalInfo && (
                <motion.div {...fadeInUp} transition={{ delay: 0.3 }} className="mt-6">
                  {additionalInfo}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            {sidebarContent && (
              <motion.aside {...fadeInUp} transition={{ delay: 0.2 }} className="space-y-6">
                {sidebarContent}
              </motion.aside>
            )}
          </div>

          {/* Footer content */}
          {footerContent && (
            <motion.div {...fadeInUp} transition={{ delay: 0.4 }} className="mt-8">
              {footerContent}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

export default CalculatorPageTemplate;
