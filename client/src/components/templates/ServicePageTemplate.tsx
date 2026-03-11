import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EnhancedSEO from '@/components/EnhancedSEO';
import { ArrowLeft, Phone, Mail, CheckCircle, Clock, Shield, Award } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface PricingPlan {
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText?: string;
  ctaHref?: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ServicePageTemplateProps {
  title: string;
  subtitle: string;
  description: string;
  icon: ReactNode;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  heroStats?: Array<{ value: string; label: string }>;
  benefits?: Array<{ icon: ReactNode; title: string; description: string }>;
  process?: Array<{ step: number; title: string; description: string }>;
  pricingPlans?: PricingPlan[];
  faqs?: FAQ[];
  documents?: Array<{ name: string; description?: string }>;
  eligibility?: string[];
  additionalContent?: ReactNode;
  ctaSection?: ReactNode;
  className?: string;
  showContactForm?: boolean;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function ServicePageTemplate({
  title,
  subtitle,
  description,
  icon,
  seoTitle,
  seoDescription,
  seoKeywords = [],
  heroStats = [],
  benefits = [],
  process = [],
  pricingPlans = [],
  faqs = [],
  documents = [],
  eligibility = [],
  additionalContent,
  ctaSection,
  className,
  showContactForm = true,
}: ServicePageTemplateProps) {
  return (
    <>
      <EnhancedSEO
        title={seoTitle || `${title} - Professional Services | MyeCA.in`}
        description={seoDescription || description}
        keywords={['service', 'professional', 'India', 'business', ...seoKeywords]}
        type="article"
      />

      <div className={cn('min-h-screen bg-background', className)}>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <Link href="/services">
              <Button variant="ghost" size="sm" className="mb-6 gap-2" data-testid="button-back-services">
                <ArrowLeft className="h-4 w-4" />
                Back to Services
              </Button>
            </Link>

            <motion.div {...fadeInUp} className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge variant="secondary" className="mb-4">{subtitle}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-service-title">
                  {title}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">{description}</p>
                
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="gap-2" data-testid="button-get-started">
                    Get Started
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2" data-testid="button-contact">
                    <Mail className="h-4 w-4" />
                    Contact Expert
                  </Button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {icon}
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            {heroStats.length > 0 && (
              <motion.div 
                {...fadeInUp} 
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12"
              >
                {heroStats.map((stat, i) => (
                  <Card key={i} className="text-center">
                    <CardContent className="pt-6">
                      <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* Benefits Section */}
        {benefits.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <motion.h2 {...fadeInUp} className="text-2xl md:text-3xl font-bold text-center mb-8">
                Key Benefits
              </motion.h2>
              <motion.div 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid md:grid-cols-3 gap-6"
              >
                {benefits.map((benefit, i) => (
                  <motion.div key={i} variants={fadeInUp}>
                    <Card className="h-full hover-elevate">
                      <CardContent className="pt-6">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                          {benefit.icon}
                        </div>
                        <h3 className="font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* Process Section */}
        {process.length > 0 && (
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <motion.h2 {...fadeInUp} className="text-2xl md:text-3xl font-bold text-center mb-8">
                How It Works
              </motion.h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {process.map((step, i) => (
                  <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                    <Card className="h-full relative">
                      <CardContent className="pt-6">
                        <div className="absolute -top-4 left-6 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {step.step}
                        </div>
                        <h3 className="font-semibold mt-2 mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Documents Required */}
        {documents.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 max-w-6xl">
              <motion.h2 {...fadeInUp} className="text-2xl md:text-3xl font-bold text-center mb-8">
                Documents Required
              </motion.h2>
              <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {documents.map((doc, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground">{doc.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </section>
        )}

        {/* Pricing Section */}
        {pricingPlans.length > 0 && (
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <motion.h2 {...fadeInUp} className="text-2xl md:text-3xl font-bold text-center mb-8">
                Pricing Plans
              </motion.h2>
              <div className={cn(
                'grid gap-6',
                pricingPlans.length === 1 ? 'max-w-md mx-auto' :
                pricingPlans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
                'md:grid-cols-3'
              )}>
                {pricingPlans.map((plan, i) => (
                  <motion.div key={i} {...fadeInUp} transition={{ delay: i * 0.1 }}>
                    <Card className={cn(
                      'h-full relative',
                      plan.popular && 'border-primary ring-2 ring-primary/20'
                    )}>
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                          Most Popular
                        </Badge>
                      )}
                      <CardHeader>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">{plan.price}</span>
                          {plan.originalPrice && (
                            <span className="ml-2 text-muted-foreground line-through">
                              {plan.originalPrice}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, j) => (
                            <li key={j} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full mt-6" variant={plan.popular ? 'default' : 'outline'}>
                          {plan.ctaText || 'Get Started'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs Section */}
        {faqs.length > 0 && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              <motion.h2 {...fadeInUp} className="text-2xl md:text-3xl font-bold text-center mb-8">
                Frequently Asked Questions
              </motion.h2>
              <motion.div {...fadeInUp} transition={{ delay: 0.1 }} className="space-y-4">
                {faqs.map((faq, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{faq.question}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </div>
          </section>
        )}

        {/* Additional Content */}
        {additionalContent}

        {/* CTA Section */}
        {ctaSection || (
          <section className="py-12 md:py-16 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <motion.div {...fadeInUp}>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-lg opacity-90 mb-6">
                  Our expert team is here to help you every step of the way.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Call Now
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 border-primary-foreground/30 hover:bg-primary-foreground/10">
                    <Mail className="h-4 w-4" />
                    Email Us
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        {/* Trust indicators */}
        <section className="py-8 border-t">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex flex-wrap justify-center gap-8 text-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>Quick Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span>Expert Assistance</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default ServicePageTemplate;
