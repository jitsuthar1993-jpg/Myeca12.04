import { Layout } from '@/components/admin/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, LockKeyhole, ReceiptText, ShieldCheck } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <Layout title="Payments">
      <div className="mx-auto max-w-5xl space-y-8 pb-20">
        <div className="rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Badge className="border-none bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-700">
                Gateway Pending
              </Badge>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">Payments</h1>
                <p className="mt-2 max-w-2xl text-base font-medium leading-relaxed text-slate-500">
                  This area is ready for the payment gateway integration. No transaction data is shown until the gateway API is connected.
                </p>
              </div>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-200">
              <CreditCard className="h-8 w-8" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: 'Checkout API', detail: 'Gateway session creation will attach here.', icon: ReceiptText },
            { title: 'Secure Redirect', detail: 'Payment handoff will stay protected.', icon: LockKeyhole },
            { title: 'Verification', detail: 'Webhook confirmation will update service status.', icon: ShieldCheck },
          ].map((item) => (
            <Card key={item.title} className="rounded-[28px] border-slate-100 shadow-sm">
              <CardHeader className="p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-base font-black text-slate-900">{item.title}</CardTitle>
                <CardDescription className="text-sm font-medium leading-relaxed text-slate-500">{item.detail}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="rounded-[32px] border-slate-100 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-50 text-slate-300">
              <ReceiptText className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">No payment gateway connected</h2>
            <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-500">
              Payment history, invoices, and service receipts will appear here after the gateway API is linked.
            </p>
            <Button disabled className="mt-8 h-12 rounded-2xl bg-slate-100 px-8 text-xs font-black uppercase tracking-widest text-slate-400">
              Awaiting Gateway
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
