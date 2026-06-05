import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { CreditCard, FileText, Link as LinkIcon, Loader2, ReceiptText, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/admin/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { buildPaymentLinkRequestPayload, serviceNeedsPayment } from '@/lib/service-workflow';
import { invalidatePaymentCaches } from '@/lib/workspace-cache';

type UserService = {
  id: string;
  serviceId?: string;
  serviceTitle?: string;
  serviceCategory?: string;
  paymentAmount?: number | string | null;
  paymentStatus?: string | null;
  status?: string | null;
  metadata?: Record<string, any>;
};

function statusLabel(value?: string | null) {
  return (value || 'pending').replace(/_/g, ' ');
}

function amountLabel(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return 'Quote pending';
  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  }
  return String(value).replace(/\u00e2\u201a\u00b9/g, 'Rs ');
}

function needsPayment(service: UserService) {
  return serviceNeedsPayment(service.paymentStatus);
}

export default function PaymentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery<UserService[]>({
    queryKey: ['/api/user-services'],
  });

  const paymentMutation = useMutation({
    mutationFn: async (userServiceId: string) => {
      const response = await apiRequest('/api/payments/request-link', {
        method: 'POST',
        body: JSON.stringify(buildPaymentLinkRequestPayload(userServiceId)),
      });
      return response.json();
    },
    onSuccess: async () => {
      await invalidatePaymentCaches(queryClient);
      toast({ title: 'Payment link requested', description: 'The team will share a secure payment link after review.' });
    },
    onError: (error: any) => {
      toast({ title: 'Could not request payment link', description: error?.message || 'Please try again.', variant: 'destructive' });
    },
  });

  const payableServices = services.filter(needsPayment);
  const paidServices = services.filter((service) => service.paymentStatus === 'paid');

  return (
    <Layout title="Payments">
      <div className="space-y-5 pb-20 md:space-y-8">
        <section className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm md:rounded-[32px] md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-6">
            <div>
              <Badge className="border-none bg-blue-50 px-3 py-1 type-meta font-black uppercase tracking-widest text-blue-700">
                Service-linked payments
              </Badge>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Payments</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Track pending service fees, request secure payment links, and see receipts once a gateway or manual confirmation is connected.
              </p>
            </div>
            <div className="hidden h-16 w-16 items-center justify-center rounded-3xl bg-blue-700 text-white shadow-xl shadow-slate-200 md:flex">
              <CreditCard className="h-8 w-8" />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {[
            { title: 'Pending', value: payableServices.length, icon: ReceiptText },
            { title: 'Paid', value: paidServices.length, icon: ShieldCheck },
            { title: 'Total Services', value: services.length, icon: FileText },
          ].map((item) => (
            <Card key={item.title} className="rounded-lg border-slate-100 shadow-sm md:rounded-[24px]">
              <CardContent className="flex min-h-[104px] flex-col items-start gap-3 p-3 md:min-h-0 md:flex-row md:items-center md:gap-4 md:p-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 md:h-12 md:w-12 md:rounded-2xl">
                  <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div>
                  <p className="type-meta font-black uppercase tracking-widest text-slate-400">{item.title}</p>
                  <p className="mt-1 text-xl font-black text-slate-900 md:text-2xl">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-lg border-slate-100 shadow-sm md:rounded-[28px]">
          <CardHeader className="border-b border-slate-50 p-4 md:p-6">
            <CardTitle className="text-lg font-black">Service Payment Queue</CardTitle>
            <CardDescription>Payment links are requested per service case until a live gateway is configured.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-16 text-slate-400">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading payment state...
              </div>
            ) : services.length ? (
              <div className="divide-y divide-slate-50">
                {services.map((service) => (
                  <div key={service.id} className="grid gap-3 p-4 md:gap-4 md:p-6 lg:grid-cols-[1fr_160px_180px_220px] lg:items-center">
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-slate-900">{service.serviceTitle || service.serviceId || 'Service request'}</p>
                      <p className="mt-1 type-meta font-black uppercase tracking-widest text-slate-400">{service.serviceCategory || 'General service'}</p>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      <span className="type-meta mr-2 font-black uppercase text-slate-400 lg:hidden">Amount</span>
                      {amountLabel(service.paymentAmount)}
                    </p>
                    <Badge variant="outline" className="w-fit border-none bg-slate-50 px-3 py-1 type-meta font-black uppercase tracking-widest text-slate-600">
                      {statusLabel(service.paymentStatus)}
                    </Badge>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
                      <Link href={`/dashboard/services/${service.id}`} className="min-w-0">
                        <Button variant="outline" className="h-10 w-full rounded-lg border-slate-200 text-xs font-black sm:w-auto sm:rounded-xl">
                          View Case
                        </Button>
                      </Link>
                      {needsPayment(service) && (
                        <Button
                          disabled={paymentMutation.isPending}
                          onClick={() => paymentMutation.mutate(service.id)}
                          className="h-10 w-full rounded-lg bg-blue-600 text-xs font-black text-white hover:bg-blue-700 sm:w-auto sm:rounded-xl"
                        >
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Request Link
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center">
                <ReceiptText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <h2 className="text-xl font-black text-slate-900">No service payments yet</h2>
                <p className="mt-2 text-sm font-medium text-slate-500">Start a filing or compliance service to see payment status here.</p>
                <Link href="/dashboard/services">
                  <Button className="mt-6 rounded-xl bg-blue-700 text-white hover:bg-blue-600">Browse Services</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
