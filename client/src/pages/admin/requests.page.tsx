import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import {
  Briefcase,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  MessageSquare,
  Phone,
  ReceiptText,
  RefreshCw,
} from "lucide-react";
import { TableRowsSkeleton } from "@/components/ui/page-skeleton";
import { Layout } from "@/components/admin/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

type ConsultationRequest = {
  id: string;
  name?: string;
  phone?: string;
  email?: string | null;
  company?: string | null;
  service?: string;
  preferredTime?: string;
  message?: string;
  status?: "new" | "contacted" | "converted" | "closed";
  internalNote?: string;
  createdAt?: string;
};

type PaymentLinkRequest = {
  id: string;
  userServiceId?: string;
  serviceTitle?: string;
  paymentAmount?: number | string | null;
  note?: string | null;
  status?: "requested" | "link_sent" | "paid" | "cancelled";
  adminNote?: string;
  paymentLink?: string;
  netCollectedRevenue?: number | null;
  hasStackedDiscount?: boolean;
  createdAt?: string;
};

type ServiceCase = {
  id: string;
  serviceTitle?: string;
  serviceCategory?: string;
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  paymentStatus?: string;
  paymentAmount?: number | string | null;
  userName?: string;
  userEmail?: string | null;
  assignedCaId?: string | null;
  metadata?: { requestDescription?: string; adminNote?: string };
  createdAt?: string;
};

const consultationStatuses = ["all", "new", "contacted", "converted", "closed"];
const paymentStatuses = ["all", "requested", "link_sent", "paid", "cancelled"];
const caseStatuses = ["all", "pending", "in_progress", "completed", "cancelled"];

function dateLabel(value?: string) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return format(date, "MMM d, yyyy h:mm a");
}

function amountLabel(value?: number | string | null) {
  if (value === null || value === undefined || value === "") return "Quote pending";
  if (typeof value === "number") {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
  }
  return String(value).replace(/\u00e2\u201a\u00b9/g, "Rs ");
}

function statusBadgeClass(status?: string) {
  switch (status) {
    case "new":
    case "requested":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "contacted":
    case "link_sent":
      return "bg-blue-50 text-blue-700 border-blue-100";
    case "converted":
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "closed":
    case "cancelled":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-100";
  }
}

function label(value?: string) {
  return (value || "new").replace(/_/g, " ");
}

export default function AdminRequestsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"cases" | "consultations" | "payments">("cases");
  const [consultationStatus, setConsultationStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [caseStatus, setCaseStatus] = useState("all");
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationRequest | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentLinkRequest | null>(null);
  const [selectedCase, setSelectedCase] = useState<ServiceCase | null>(null);
  const [consultationNote, setConsultationNote] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [netCollectedRevenue, setNetCollectedRevenue] = useState("");
  const [hasStackedDiscount, setHasStackedDiscount] = useState(false);
  const [caseNote, setCaseNote] = useState("");

  const consultationQuery = useQuery<{ requests: ConsultationRequest[]; total: number }>({
    queryKey: ["/api/admin/requests/consultations", consultationStatus],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (consultationStatus !== "all") params.set("status", consultationStatus);
      const response = await apiRequest(`/api/admin/requests/consultations?${params}`);
      return response.json();
    },
  });

  const paymentQuery = useQuery<{ requests: PaymentLinkRequest[]; total: number }>({
    queryKey: ["/api/admin/requests/payment-links", paymentStatus],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (paymentStatus !== "all") params.set("status", paymentStatus);
      const response = await apiRequest(`/api/admin/requests/payment-links?${params}`);
      return response.json();
    },
  });

  const casesQuery = useQuery<{ cases: ServiceCase[]; total: number }>({
    queryKey: ["/api/admin/user-services", caseStatus],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (caseStatus !== "all") params.set("status", caseStatus);
      const response = await apiRequest(`/api/admin/user-services?${params}`);
      return response.json();
    },
  });

  const updateCase = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; status?: string; adminNote?: string }) => {
      const response = await apiRequest(`/api/admin/user-services/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/user-services"] });
      setSelectedCase(null);
      setCaseNote("");
      toast({ title: "Case updated", description: "Service case status has been saved." });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error?.message || "Please try again.", variant: "destructive" });
    },
  });

  const consultationRequests = consultationQuery.data?.requests ?? [];
  const paymentRequests = paymentQuery.data?.requests ?? [];
  const serviceCases = casesQuery.data?.cases ?? [];
  const openConsultations = useMemo(
    () => consultationRequests.filter((request) => !["converted", "closed"].includes(request.status || "")).length,
    [consultationRequests],
  );
  const openPayments = useMemo(
    () => paymentRequests.filter((request) => !["paid", "cancelled"].includes(request.status || "")).length,
    [paymentRequests],
  );
  const pendingCases = useMemo(
    () => serviceCases.filter((c) => !["completed", "cancelled"].includes(c.status || "")).length,
    [serviceCases],
  );

  const updateConsultation = useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; status?: string; internalNote?: string }) => {
      const response = await apiRequest(`/api/admin/requests/consultations/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/requests/consultations"] });
      setSelectedConsultation(null);
      setConsultationNote("");
      toast({ title: "Consultation updated", description: "The request is ready for the next team action." });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error?.message || "Please try again.", variant: "destructive" });
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, ...payload }: {
      id: string;
      status?: string;
      adminNote?: string;
      paymentLink?: string;
      netCollectedRevenue?: number;
      hasStackedDiscount?: boolean;
    }) => {
      const response = await apiRequest(`/api/admin/requests/payment-links/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/requests/payment-links"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedPayment(null);
      setPaymentLink("");
      setPaymentNote("");
      setNetCollectedRevenue("");
      setHasStackedDiscount(false);
      toast({ title: "Payment request updated", description: "The linked service payment status was refreshed." });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error?.message || "Please try again.", variant: "destructive" });
    },
  });

  return (
    <Layout title="Requests">
      <div className="space-y-5 pb-12">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-none">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge className="border-none bg-blue-700 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                Operations inbox
              </Badge>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Customer Requests</h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                Service cases, consultation callbacks, and payment-link requests from the customer workspace.
              </p>
            </div>
            <Button
              variant="outline"
              className="h-11 rounded-xl border-slate-200 text-xs font-black"
              onClick={() => {
                casesQuery.refetch();
                consultationQuery.refetch();
                paymentQuery.refetch();
              }}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", (casesQuery.isFetching || consultationQuery.isFetching || paymentQuery.isFetching) && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            { label: "Pending Cases", value: pendingCases, icon: Briefcase, color: "text-blue-600 bg-blue-50" },
            { label: "Open Consultations", value: openConsultations, icon: MessageSquare, color: "text-amber-600 bg-amber-50" },
            { label: "Open Payments", value: openPayments, icon: CreditCard, color: "text-emerald-600 bg-emerald-50" },
            { label: "Total Cases", value: serviceCases.length, icon: ReceiptText, color: "text-slate-700 bg-slate-100" },
          ].map((item) => (
            <Card key={item.label} className="rounded-lg border-slate-200 shadow-none">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 w-fit">
          {(["cases", "consultations", "payments"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-lg px-4 py-2 text-xs font-black capitalize transition-colors",
                activeTab === tab ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
              )}
            >
              {tab === "cases" ? "Service Cases" : tab === "consultations" ? "Consultations" : "Payment Links"}
            </button>
          ))}
        </div>

        {activeTab === "cases" && (
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-50 p-5">
              <CardTitle className="text-base font-black">Service Cases</CardTitle>
              <Select value={caseStatus} onValueChange={setCaseStatus}>
                <SelectTrigger className="h-9 w-40 rounded-xl border-slate-200 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {caseStatuses.map((s) => (
                    <SelectItem key={s} value={s}>{label(s)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {casesQuery.isLoading ? (
                    <TableRowsSkeleton rows={5} columns={6} />
                  ) : serviceCases.length ? (
                    serviceCases.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <p className="font-black text-slate-900">{c.userName || "Customer"}</p>
                          <p className="mt-1 text-xs text-slate-400">{c.userEmail || ""}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-black text-slate-900">{c.serviceTitle || "Service"}</p>
                          <p className="mt-1 text-xs text-slate-500">{c.serviceCategory || ""}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("border px-2 py-1 text-[10px] font-black uppercase tracking-widest", statusBadgeClass(c.status))}>
                            {label(c.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-black text-slate-900">{amountLabel(c.paymentAmount)}</TableCell>
                        <TableCell className="text-xs text-slate-500">{dateLabel(c.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/services/${c.id}`}>
                              <Button variant="outline" size="sm" className="rounded-xl border-slate-200 text-xs font-black">
                                <ExternalLink className="mr-1 h-3 w-3" />
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl border-slate-200 text-xs font-black"
                              onClick={() => {
                                setSelectedCase(c);
                                setCaseNote(c.metadata?.adminNote || "");
                              }}
                            >
                              Update
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-sm font-medium text-slate-500">
                        No service cases match this filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {activeTab !== "cases" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-50 p-5">
              <CardTitle className="text-base font-black">Consultation Queue</CardTitle>
              <Select value={consultationStatus} onValueChange={setConsultationStatus}>
                <SelectTrigger className="h-9 w-40 rounded-xl border-slate-200 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {consultationStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {label(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consultationQuery.isLoading ? (
                    <TableRowsSkeleton rows={5} columns={4} />
                  ) : consultationRequests.length ? (
                    consultationRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <p className="font-black text-slate-900">{request.name || "Customer"}</p>
                          <p className="mt-1 text-xs text-slate-500">{request.service || "General consultation"}</p>
                          <p className="mt-1 text-xs text-slate-400">{request.phone || request.email || "No contact captured"}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("border px-2 py-1 text-[10px] font-black uppercase tracking-widest", statusBadgeClass(request.status))}>
                            {label(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">{dateLabel(request.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-slate-200 text-xs font-black"
                            onClick={() => {
                              setSelectedConsultation(request);
                              setConsultationNote(request.internalNote || "");
                            }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-sm font-medium text-slate-500">
                        No consultation requests match this filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-slate-50 p-5">
              <CardTitle className="text-base font-black">Payment Link Queue</CardTitle>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger className="h-9 w-40 rounded-xl border-slate-200 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {label(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentQuery.isLoading ? (
                    <TableRowsSkeleton rows={5} columns={4} />
                  ) : paymentRequests.length ? (
                    paymentRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <p className="font-black text-slate-900">{request.serviceTitle || "Service payment"}</p>
                          <p className="mt-1 text-xs text-slate-400">{dateLabel(request.createdAt)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("border px-2 py-1 text-[10px] font-black uppercase tracking-widest", statusBadgeClass(request.status))}>
                            {label(request.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-black text-slate-900">{amountLabel(request.paymentAmount)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-slate-200 text-xs font-black"
                            onClick={() => {
                              setSelectedPayment(request);
                              setPaymentLink(request.paymentLink || "");
                              setPaymentNote(request.adminNote || "");
                              setNetCollectedRevenue(request.netCollectedRevenue ? String(request.netCollectedRevenue) : "");
                              setHasStackedDiscount(request.hasStackedDiscount === true);
                            }}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-sm font-medium text-slate-500">
                        No payment-link requests match this filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        )}
      </div>

      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Service Case</DialogTitle>
            <DialogDescription>Change the case status or add an internal admin note.</DialogDescription>
          </DialogHeader>
          {selectedCase && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service</p>
                <p className="mt-1 font-black text-slate-900">{selectedCase.serviceTitle || "Service"}</p>
                <p className="text-sm text-slate-500">{selectedCase.userName} · {amountLabel(selectedCase.paymentAmount)}</p>
                {selectedCase.metadata?.requestDescription && (
                  <p className="mt-2 text-sm leading-6 text-slate-600">{selectedCase.metadata.requestDescription}</p>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                <Select
                  value={selectedCase.status || "pending"}
                  onValueChange={(s) => setSelectedCase({ ...selectedCase, status: s as ServiceCase["status"] })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {caseStatuses.filter((s) => s !== "all").map((s) => (
                      <SelectItem key={s} value={s}>{label(s)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  value={caseNote}
                  onChange={(e) => setCaseNote(e.target.value)}
                  placeholder="Internal note for the team..."
                  className="min-h-24 rounded-xl border-slate-200"
                />
              </div>
              <Button
                className="w-full rounded-xl bg-blue-700 font-black text-white hover:bg-blue-600"
                disabled={updateCase.isPending}
                onClick={() => updateCase.mutate({ id: selectedCase.id, status: selectedCase.status || "pending", adminNote: caseNote })}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save Case State
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedConsultation} onOpenChange={() => setSelectedConsultation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Consultation Request</DialogTitle>
            <DialogDescription>Update the team state after contact or conversion.</DialogDescription>
          </DialogHeader>
          {selectedConsultation && (
            <div className="space-y-5">
              <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</p>
                  <p className="mt-1 font-black text-slate-900">{selectedConsultation.name || "Customer"}</p>
                  <p className="text-sm text-slate-500">{selectedConsultation.phone || selectedConsultation.email || "No contact captured"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Preferred Time</p>
                  <p className="mt-1 font-black text-slate-900">{selectedConsultation.preferredTime || "Not specified"}</p>
                  <p className="text-sm text-slate-500">{dateLabel(selectedConsultation.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{selectedConsultation.service || "General consultation"}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selectedConsultation.message || "No message recorded."}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-[190px_1fr]">
                <Select
                  value={selectedConsultation.status || "new"}
                  onValueChange={(status) => setSelectedConsultation({ ...selectedConsultation, status: status as ConsultationRequest["status"] })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {consultationStatuses.filter((status) => status !== "all").map((status) => (
                      <SelectItem key={status} value={status}>
                        {label(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  value={consultationNote}
                  onChange={(event) => setConsultationNote(event.target.value)}
                  placeholder="Internal note for the team..."
                  className="min-h-24 rounded-xl border-slate-200"
                />
              </div>
              <Button
                className="w-full rounded-xl bg-blue-700 font-black text-white hover:bg-blue-700"
                disabled={updateConsultation.isPending}
                onClick={() =>
                  updateConsultation.mutate({
                    id: selectedConsultation.id,
                    status: selectedConsultation.status || "new",
                    internalNote: consultationNote,
                  })
                }
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Save Consultation State
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Link Request</DialogTitle>
            <DialogDescription>Record link sharing or payment confirmation for the linked service.</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-5">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service</p>
                <p className="mt-1 font-black text-slate-900">{selectedPayment.serviceTitle || "Service payment"}</p>
                <p className="text-sm text-slate-500">{amountLabel(selectedPayment.paymentAmount)} / {dateLabel(selectedPayment.createdAt)}</p>
              </div>
              {selectedPayment.note && (
                <p className="rounded-2xl border border-slate-100 p-4 text-sm leading-6 text-slate-600">{selectedPayment.note}</p>
              )}
              <div className="grid gap-3 sm:grid-cols-[190px_1fr]">
                <Select
                  value={selectedPayment.status || "requested"}
                  onValueChange={(status) => setSelectedPayment({ ...selectedPayment, status: status as PaymentLinkRequest["status"] })}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentStatuses.filter((status) => status !== "all").map((status) => (
                      <SelectItem key={status} value={status}>
                        {label(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={paymentLink}
                  onChange={(event) => setPaymentLink(event.target.value)}
                  placeholder="Optional secure payment link"
                  className="rounded-xl border-slate-200"
                />
              </div>
              <Textarea
                value={paymentNote}
                onChange={(event) => setPaymentNote(event.target.value)}
                placeholder="Internal payment note..."
                className="min-h-24 rounded-xl border-slate-200"
              />
              <div className="grid gap-3 sm:grid-cols-[1fr_190px]">
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={netCollectedRevenue}
                  onChange={(event) => setNetCollectedRevenue(event.target.value)}
                  placeholder="Net collected revenue"
                  className="rounded-xl border-slate-200"
                />
                <Select
                  value={hasStackedDiscount ? "yes" : "no"}
                  onValueChange={(value) => setHasStackedDiscount(value === "yes")}
                >
                  <SelectTrigger className="rounded-xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No stacked discount</SelectItem>
                    <SelectItem value="yes">Discount stacked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                {selectedPayment.userServiceId && (
                  <Link href={`/dashboard/services/${selectedPayment.userServiceId}`}>
                    <Button variant="outline" className="w-full rounded-xl border-slate-200 font-black sm:w-auto">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Service Case
                    </Button>
                  </Link>
                )}
                <Button
                  className="flex-1 rounded-xl bg-blue-700 font-black text-white hover:bg-blue-700"
                  disabled={updatePayment.isPending}
                  onClick={() =>
                    updatePayment.mutate({
                      id: selectedPayment.id,
                      status: selectedPayment.status || "requested",
                      paymentLink: paymentLink || undefined,
                      adminNote: paymentNote,
                      netCollectedRevenue: netCollectedRevenue ? Number(netCollectedRevenue) : undefined,
                      hasStackedDiscount,
                    })
                  }
                >
                  <CalendarClock className="mr-2 h-4 w-4" />
                  Save Payment State
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
