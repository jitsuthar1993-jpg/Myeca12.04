import { Fragment, useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  HelpCircle,
  Receipt,
  Rocket,
  Scale,
  ShieldCheck,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { m } from 'framer-motion';
import { Layout } from '@/components/admin/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SERVICES, SERVICE_CATEGORIES, type Service, type ServiceCategory } from '@/data/services-catalog';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import { buildDashboardServiceRequestPayload, type DashboardServiceRequestOption } from '@/lib/service-workflow';

const CUSTOM_SERVICE_ID = 'custom';

const CATEGORY_ICONS: Record<ServiceCategory, LucideIcon> = {
  individual: FileText,
  'business-registration': Building2,
  'tax-compliance': ShieldCheck,
  'gst-services': Receipt,
  startup: Rocket,
  legal: Scale,
  accounting: Calculator,
  payroll: Users,
};

const SERVICE_ROUTE_BY_ID: Partial<Record<string, string>> = {
  'itr-1-filing': '/services/itr-for-salaried',
  'itr-2-filing': '/services/itr-for-salaried',
  'itr-3-filing': '/services/itr-for-salaried',
  'tax-planning': '/services/tax-planning',
  'nri-tax-filing': '/services/itr-for-salaried',
  'pvt-ltd-registration': '/services/company-registration',
  'llp-registration': '/services/company-registration',
  'opc-registration': '/services/company-registration',
  'gst-registration': '/services/gst-registration',
  'gst-return-monthly': '/services/gst-returns',
  'gst-annual-return': '/services/gst-returns',
  'tds-return-filing': '/services/tds-filing',
  'advance-tax-planning': '/calculators/advance-tax',
  'startup-india-registration': '/services/startup-india-registration',
  'trademark-registration': '/services/trademark-registration',
  'annual-compliance': '/services/compliance-management',
};

type RelatedTool = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const RELATED_TOOLS_BY_CATEGORY: Partial<Record<ServiceCategory, RelatedTool[]>> = {
  individual: [
    { title: 'Income Tax Calculator', description: 'Estimate tax before filing.', href: '/calculators/income-tax', icon: Calculator },
    { title: 'Tax Regime Comparison', description: 'Compare old and new regime.', href: '/calculators/tax-regime', icon: Scale },
    { title: 'HRA Calculator', description: 'Check rent exemption support.', href: '/calculators/hra', icon: Building2 },
  ],
  'tax-compliance': [
    { title: 'Advance Tax Calculator', description: 'Estimate quarterly payments.', href: '/calculators/advance-tax', icon: CreditCard },
    { title: 'TDS Calculator', description: 'Check deduction estimates.', href: '/calculators/tds', icon: Receipt },
  ],
  'gst-services': [
    { title: 'GST Calculator', description: 'Calculate tax inclusive or exclusive values.', href: '/calculators/gst', icon: Calculator },
    { title: 'HSN / SAC Finder', description: 'Find goods and service codes.', href: '/calculators/hsn-finder', icon: FileText },
  ],
  'business-registration': [
    { title: 'Company Registration Guide', description: 'Review incorporation options.', href: '/services/company-registration', icon: Building2 },
    { title: 'MSME Registration', description: 'Check Udyam registration support.', href: '/services/msme-udyam-registration', icon: ShieldCheck },
  ],
  startup: [
    { title: 'Startup Planning', description: 'Map founder and funding steps.', href: '/startup/planning', icon: Rocket },
    { title: 'Startup Services', description: 'Browse startup support routes.', href: '/startup-services', icon: Briefcase },
  ],
  legal: [
    { title: 'Trademark Registration', description: 'Review brand protection support.', href: '/services/trademark-registration', icon: Star },
    { title: 'Document Generator', description: 'Prepare common legal documents.', href: '/documents/generator', icon: FileText },
  ],
};

const requestableServices = SERVICES.filter((service) => service.pricing.type !== 'custom' || service.pricing.amount > 0);

function getCategoryLabel(categoryId: ServiceCategory) {
  return SERVICE_CATEGORIES.find((category) => category.id === categoryId)?.name || 'General service';
}

function getServicePriceLabel(service: Service) {
  const amount = `Rs ${service.pricing.amount.toLocaleString('en-IN')}`;
  const unit = service.pricing.unit ? ` (${service.pricing.unit})` : '';

  switch (service.pricing.type) {
    case 'starting':
      return `Starting ${amount}${unit}`;
    case 'monthly':
      return `${amount}/month${unit}`;
    case 'yearly':
      return `${amount}/year${unit}`;
    case 'custom':
      return 'Custom quote';
    default:
      return `${amount}${unit}`;
  }
}

function getOriginalAmountLabel(service: Service) {
  if (!service.pricing.originalAmount || service.pricing.originalAmount <= service.pricing.amount) return null;
  return `Rs ${service.pricing.originalAmount.toLocaleString('en-IN')}`;
}

function toRequestOption(service: Service): DashboardServiceRequestOption {
  return {
    id: service.id,
    title: service.name,
    categoryLabel: getCategoryLabel(service.category),
    paymentAmount: service.pricing.type === 'custom' ? null : service.pricing.amount,
    originalServicePath: SERVICE_ROUTE_BY_ID[service.id] ?? null,
  };
}

function getRelatedTools(service: Service) {
  const categoryTools = RELATED_TOOLS_BY_CATEGORY[service.category] || [];
  const serviceRoute = SERVICE_ROUTE_BY_ID[service.id];
  const serviceGuide = serviceRoute
    ? [{
        title: 'Service guide',
        description: 'Open the public service details.',
        href: serviceRoute,
        icon: HelpCircle,
      }]
    : [];

  return [...serviceGuide, ...categoryTools]
    .filter((tool, index, tools) => tools.findIndex((item) => item.href === tool.href) === index)
    .slice(0, 4);
}

type SelectedServiceDetailsProps = {
  service?: Service;
  isCustomRequest: boolean;
  relatedTools: RelatedTool[];
};

function SelectedServiceDetails({
  service,
  isCustomRequest,
  relatedTools,
}: SelectedServiceDetailsProps) {
  const title = isCustomRequest ? 'Custom service request' : service!.name;
  const description = isCustomRequest
    ? 'Share the requirement and the team will review the right service path before assigning the case.'
    : service!.description;

  return (
    <m.section
      role="region"
      aria-label={`${title} service details`}
      data-testid="inline-service-details"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="overflow-hidden rounded-xl border border-blue-200 bg-white shadow-[0_14px_36px_-24px_rgba(37,99,235,0.45)] md:col-span-2"
    >
      <div className="h-1 bg-blue-600" />
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-blue-700">
              <CheckCircle2 className="h-4 w-4" />
              Selected service
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600">
              {description}
            </p>
          </div>

          <Badge className="w-fit shrink-0 border border-blue-200 bg-blue-50 px-3 py-1 text-blue-800 shadow-none">
            {isCustomRequest ? 'Scope review' : getCategoryLabel(service!.category)}
          </Badge>
        </div>

        <dl className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            {
              label: 'Professional fee',
              value: isCustomRequest ? 'Scope based' : getServicePriceLabel(service!),
              icon: CreditCard,
            },
            {
              label: 'Timeline',
              value: isCustomRequest ? 'After review' : service!.timeline,
              icon: Clock,
            },
            {
              label: 'Documents',
              value: isCustomRequest ? 'Shared after review' : `${service!.documents.length} listed`,
              icon: FileText,
            },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
              <dt className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">
                <item.icon className="h-4 w-4 text-blue-600" />
                {item.label}
              </dt>
              <dd className="mt-1.5 text-sm font-black text-slate-950">{item.value}</dd>
            </div>
          ))}
        </dl>

        {!isCustomRequest && getOriginalAmountLabel(service!) && (
          <p className="mt-3 text-xs font-bold text-slate-500">
            Listed reference price: <span className="line-through">{getOriginalAmountLabel(service!)}</span>
          </p>
        )}
      </div>

      {!isCustomRequest && (
        <>
          <div className="grid border-t border-slate-200 lg:grid-cols-3">
            <section className="p-4 sm:p-5 lg:border-r lg:border-slate-200">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-black text-slate-950">Included</h3>
              </div>
              <ul className="space-y-2">
                {service!.features.map((feature) => (
                  <li key={feature} className="flex gap-2 text-xs font-semibold leading-5 text-slate-600">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-t border-slate-200 p-4 sm:p-5 lg:border-r lg:border-t-0 lg:border-slate-200">
              <div className="mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-950">Deliverables</h3>
              </div>
              <ul className="space-y-2">
                {service!.deliverables.map((deliverable) => (
                  <li key={deliverable} className="flex gap-2 text-xs font-semibold leading-5 text-slate-600">
                    <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {deliverable}
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-t border-slate-200 p-4 sm:p-5 lg:border-t-0">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-950">Required documents</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {service!.documents.map((document) => (
                  <Badge key={document} variant="outline" className="rounded-md border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700">
                    {document}
                  </Badge>
                ))}
              </div>
            </section>
          </div>

          {relatedTools.length > 0 && (
            <section className="border-t border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2">
                <Calculator className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-black text-slate-950">Related tools</h3>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {relatedTools.map((tool) => (
                  <Button
                    key={tool.href}
                    asChild
                    variant="outline"
                    className="h-auto w-full justify-between rounded-lg border-slate-200 bg-white p-3 text-left"
                  >
                    <Link href={tool.href}>
                      <span className="flex min-w-0 items-start gap-2.5">
                        <tool.icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                        <span className="min-w-0">
                          <span className="block text-xs font-black text-slate-900">{tool.title}</span>
                          <span className="mt-0.5 block whitespace-normal text-[11px] font-semibold leading-4 text-slate-500">
                            {tool.description}
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    </Link>
                  </Button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </m.section>
  );
}

export default function DashboardServicesPage() {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [requestDescription, setRequestDescription] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const selectedService = useMemo(
    () => requestableServices.find((service) => service.id === selectedServiceId),
    [selectedServiceId],
  );
  const isCustomRequest = selectedServiceId === CUSTOM_SERVICE_ID;
  const selectedRequestOption = selectedService ? toRequestOption(selectedService) : undefined;
  const selectedCategoryTools = selectedService ? getRelatedTools(selectedService) : [];

  const servicesByCategory = useMemo(
    () => SERVICE_CATEGORIES.map((category) => ({
      ...category,
      services: requestableServices.filter((service) => service.category === category.id),
    })).filter((category) => category.services.length > 0),
    [],
  );

  const requestMutation = useMutation({
    mutationFn: async () => {
      if (!selectedServiceId) throw new Error('Choose a service first.');
      const response = await apiRequest('/api/user-services', {
        method: 'POST',
        body: JSON.stringify(buildDashboardServiceRequestPayload(
          selectedServiceId,
          selectedRequestOption,
          requestDescription,
        )),
      });
      return response.json();
    },
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/user/dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/user-services'] }),
        data?.id ? queryClient.invalidateQueries({ queryKey: ['/api/user-services', data.id] }) : undefined,
      ]);
      toast({
        title: 'Request created',
        description: 'Your service case is ready. Continue from the case workspace.',
      });
      setRequestDescription('');
      if (data?.id) {
        setLocation(`/dashboard/services/${data.id}`);
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Could not create request',
        description: error?.message || 'Please try again in a moment.',
        variant: 'destructive',
      });
    },
  });

  const selectService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setRequestDescription('');
  };

  const handleRaiseRequest = () => {
    if (!selectedServiceId || requestMutation.isPending) return;
    requestMutation.mutate();
  };

  let rainfallIndex = 0;

  return (
    <Layout title="Services">
      <div className="space-y-5 bg-white pb-16 text-slate-950">
        <section className="border-b border-slate-100 pb-5">
          <div className="max-w-4xl">
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Choose a service
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
              Select a service and review scope, documents, pricing, and next steps in one place.
            </p>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <section
              aria-label="Rainfall service selector"
              className="space-y-4"
            >
              {servicesByCategory.map((category) => {
                const CategoryIcon = CATEGORY_ICONS[category.id] || FileText;

                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <CategoryIcon className="h-4 w-4 text-slate-400" />
                      <h2 className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                        {category.name}
                      </h2>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      {category.services.map((service) => {
                        const isSelected = selectedServiceId === service.id;
                        const itemDelay = rainfallIndex * 0.025;
                        rainfallIndex += 1;

                        return (
                          <Fragment key={service.id}>
                          <m.button
                            type="button"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: itemDelay, duration: 0.22, ease: 'easeOut' }}
                            onClick={() => selectService(service.id)}
                            className={cn(
                              'group flex min-h-[58px] w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-left transition-colors',
                              isSelected
                                ? 'border-blue-300 bg-blue-50 text-blue-950'
                                : 'border-slate-200 text-slate-800 hover:border-blue-200 hover:bg-slate-50',
                            )}
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-black leading-5">
                                {service.name}
                              </span>
                              <span className="mt-0.5 block text-xs font-semibold leading-5 text-slate-500">
                                {getServicePriceLabel(service)} - {service.timeline}
                              </span>
                            </span>
                            <span className={cn(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                              isSelected ? 'border-blue-300 bg-white text-blue-700' : 'border-slate-200 text-transparent',
                            )}>
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          </m.button>
                          {isSelected && (
                            <SelectedServiceDetails
                              service={service}
                              isCustomRequest={false}
                              relatedTools={selectedCategoryTools}
                            />
                          )}
                          </Fragment>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <m.button
                type="button"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rainfallIndex * 0.025, duration: 0.22, ease: 'easeOut' }}
                onClick={() => selectService(CUSTOM_SERVICE_ID)}
                className={cn(
                  'flex min-h-[58px] w-full items-center justify-between gap-3 rounded-lg border border-dashed px-3 py-2 text-left transition-colors',
                  isCustomRequest
                    ? 'border-blue-300 bg-blue-50 text-blue-950'
                    : 'border-slate-300 bg-white text-slate-800 hover:border-blue-200 hover:bg-slate-50',
                )}
              >
                <span>
                  <span className="block text-sm font-black leading-5">Custom service request</span>
                  <span className="mt-0.5 block text-xs font-semibold leading-5 text-slate-500">
                    Share a requirement that is not listed above.
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </m.button>
              {isCustomRequest && (
                <SelectedServiceDetails
                  isCustomRequest
                  relatedTools={[]}
                />
              )}
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-950">Start request</h3>
                  <p className="text-xs font-bold text-slate-500">Creates a service case in your workspace.</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="request-description" className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                  Optional brief
                </Label>
                <Textarea
                  id="request-description"
                  value={requestDescription}
                  onChange={(event) => setRequestDescription(event.target.value)}
                  placeholder="Add business context, deadlines, income sources, GSTIN status, or any specific goal."
                  className="min-h-36 rounded-lg border-slate-200 bg-slate-50 text-sm font-medium"
                  disabled={!selectedServiceId || requestMutation.isPending}
                />
              </div>

              <Button
                className="mt-4 h-12 w-full justify-between rounded-lg bg-blue-700 font-black text-white hover:bg-blue-600"
                onClick={handleRaiseRequest}
                disabled={!selectedServiceId || requestMutation.isPending}
              >
                {requestMutation.isPending ? 'Creating case...' : 'Create service case'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </section>

            <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                <div>
                  <p className="text-sm font-black text-emerald-950">Workspace linked</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-emerald-800">
                    Requests created here continue into documents, payments, admin review, and CA assignment.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
