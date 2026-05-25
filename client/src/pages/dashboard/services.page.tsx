import { useMemo, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  Briefcase,
  Building2,
  Calculator,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  HelpCircle,
  Receipt,
  Rocket,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Layout } from '@/components/admin/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { SERVICES, SERVICE_CATEGORIES, type Service, type ServiceCategory } from '@/data/services-catalog';
import { apiRequest } from '@/lib/queryClient';
import { buildDashboardServiceRequestPayload, type DashboardServiceRequestOption } from '@/lib/service-workflow';
import { invalidateWorkspaceCaseCaches } from '@/lib/workspace-cache';

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
const popularServices = requestableServices.filter((service) => service.popular).slice(0, 4);

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
      await invalidateWorkspaceCaseCaches(queryClient, data?.id);
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

  return (
    <Layout title="Services">
      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div>
              <Badge className="mb-3 border border-blue-100 bg-blue-50 px-3 py-1 text-blue-700 shadow-none">
                Service workspace
              </Badge>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Choose a service
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                Select a requestable service to review scope, documents, pricing, and next steps in one place.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                Service
              </Label>
              <Select value={selectedServiceId ?? undefined} onValueChange={selectService}>
                <SelectTrigger className="h-12 rounded-lg border-slate-200 bg-slate-50 text-sm font-bold text-slate-900">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent className="max-h-[420px]">
                  {servicesByCategory.map((category) => (
                    <SelectGroup key={category.id}>
                      <SelectLabel>{category.name}</SelectLabel>
                      {category.services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                  <SelectSeparator />
                  <SelectItem value={CUSTOM_SERVICE_ID}>Custom service request</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {!selectedService && !isCustomRequest ? (
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-950">Popular starting points</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">Shortlist a service or use the dropdown above.</p>
                </div>
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {popularServices.map((service) => {
                  const Icon = CATEGORY_ICONS[service.category] || FileText;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => selectService(service.id)}
                      className="group rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700 ring-1 ring-slate-200">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-black text-slate-950 group-hover:text-blue-700">
                            {service.name}
                          </span>
                          <span className="mt-1 block text-xs font-bold text-slate-500">
                            {getCategoryLabel(service.category)} - {getServicePriceLabel(service)}
                          </span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Briefcase className="mb-4 h-8 w-8 text-slate-400" />
              <h2 className="text-lg font-black text-slate-950">Custom requirement</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                Use a custom request when the service is not listed or the scope needs review first.
              </p>
              <Button
                variant="outline"
                className="mt-5 h-11 w-full justify-between rounded-lg border-slate-200 font-bold"
                onClick={() => selectService(CUSTOM_SERVICE_ID)}
              >
                Start custom request
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Badge className="mb-3 border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700 shadow-none">
                      {isCustomRequest ? 'Custom Service' : getCategoryLabel(selectedService!.category)}
                    </Badge>
                    <h2 className="text-2xl font-black tracking-tight text-slate-950">
                      {isCustomRequest ? 'Custom service request' : selectedService!.name}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-600">
                      {isCustomRequest
                        ? 'Share the requirement and the team will review the right service path before assigning the case.'
                        : selectedService!.description}
                    </p>
                  </div>
                </div>

                <dl className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      label: 'Professional fee',
                      value: isCustomRequest ? 'Scope based' : getServicePriceLabel(selectedService!),
                      icon: CreditCard,
                    },
                    {
                      label: 'Timeline',
                      value: isCustomRequest ? 'After review' : selectedService!.timeline,
                      icon: Clock,
                    },
                    {
                      label: 'Documents',
                      value: isCustomRequest ? 'Shared after review' : `${selectedService!.documents.length} listed`,
                      icon: FileText,
                    },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <dt className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                        <item.icon className="h-4 w-4 text-blue-600" />
                        {item.label}
                      </dt>
                      <dd className="mt-2 text-sm font-black text-slate-950">{item.value}</dd>
                    </div>
                  ))}
                </dl>

                {!isCustomRequest && getOriginalAmountLabel(selectedService!) && (
                  <p className="mt-3 text-xs font-bold text-slate-500">
                    Listed reference price: <span className="line-through">{getOriginalAmountLabel(selectedService!)}</span>
                  </p>
                )}
              </section>

              {!isCustomRequest && (
                <section className="grid gap-6 lg:grid-cols-2">
                  <Card className="rounded-lg border-slate-200 shadow-sm">
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <h3 className="text-base font-black text-slate-950">Included</h3>
                      </div>
                      <ul className="space-y-3">
                        {selectedService!.features.map((feature) => (
                          <li key={feature} className="flex gap-3 text-sm font-medium leading-6 text-slate-600">
                            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="rounded-lg border-slate-200 shadow-sm">
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        <h3 className="text-base font-black text-slate-950">Deliverables</h3>
                      </div>
                      <ul className="space-y-3">
                        {selectedService!.deliverables.map((deliverable) => (
                          <li key={deliverable} className="flex gap-3 text-sm font-medium leading-6 text-slate-600">
                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </section>
              )}

              {!isCustomRequest && (
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base font-black text-slate-950">Required documents</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedService!.documents.map((document) => (
                      <Badge key={document} variant="outline" className="rounded-md border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                        {document}
                      </Badge>
                    ))}
                  </div>
                </section>
              )}

              {!isCustomRequest && selectedCategoryTools.length > 0 && (
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base font-black text-slate-950">Related tools</h3>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {selectedCategoryTools.map((tool) => (
                      <Link key={tool.href} href={tool.href}>
                        <Button variant="outline" className="h-auto w-full justify-between rounded-lg border-slate-200 p-4 text-left">
                          <span className="flex min-w-0 items-start gap-3">
                            <tool.icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                            <span className="min-w-0">
                              <span className="block text-sm font-black text-slate-900">{tool.title}</span>
                              <span className="mt-1 block whitespace-normal text-xs font-medium leading-5 text-slate-500">
                                {tool.description}
                              </span>
                            </span>
                          </span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
        )}
      </div>
    </Layout>
  );
}
