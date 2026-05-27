import { useRef, useState } from 'react';
import { Link, useParams } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  FileText,
  HelpCircle,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { Layout } from '@/components/admin/Layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { getAuthToken } from '@/lib/authToken';
import { ALLOWED_FILE_TYPES, formatFileSize, prepareDocumentForUpload } from '@/lib/file_utils';
import { cn } from '@/lib/utils';

type ServiceCase = {
  id: string;
  serviceId?: string;
  serviceTitle?: string;
  serviceCategory?: string;
  paymentAmount?: number | string | null;
  paymentStatus?: string | null;
  status?: string | null;
  assignedCaName?: string | null;
  assignedCaEmail?: string | null;
  metadata?: Record<string, any>;
  createdAt?: string;
};

type LinkedDocument = {
  id: string;
  name?: string;
  originalName?: string;
  category?: string;
  size?: number;
  status?: string;
  createdAt?: string;
};

type ServiceCaseResponse = {
  success: boolean;
  service: ServiceCase;
  documents: LinkedDocument[];
};

function statusLabel(value?: string | null) {
  return (value || 'pending').replace(/_/g, ' ');
}

function nextAction(service?: ServiceCase, documents: LinkedDocument[] = []) {
  if (!service) return 'Open your service request to see the next step.';
  if (!documents.length) return 'Upload the first document so the team can review your case.';
  if (!service.assignedCaName) return 'Your request is waiting for CA assignment.';
  if ((service.paymentStatus || '').includes('pending')) return 'Complete payment or request a payment link to continue.';
  return 'Track review progress here and respond to any expert notes.';
}

export default function ServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const serviceId = params.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('other');
  const [note, setNote] = useState('');

  const { data, isLoading, isError } = useQuery<ServiceCaseResponse>({
    queryKey: ['/api/user-services', serviceId],
    queryFn: async () => {
      const response = await apiRequest(`/api/user-services/${serviceId}`);
      return response.json();
    },
    enabled: Boolean(serviceId),
  });

  const service = data?.service;
  const documents = data?.documents || [];
  const requestDescription = service?.metadata?.requestDescription || '';

  const noteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/user-services/${serviceId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          metadata: {
            userNote: note.trim(),
          },
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-services', serviceId] });
      toast({ title: 'Case note saved', description: 'Your update is now attached to this service case.' });
    },
    onError: (error: any) => {
      toast({ title: 'Could not save note', description: error?.message || 'Please try again.', variant: 'destructive' });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const preparedFile = await prepareDocumentForUpload(file);
      const token = await getAuthToken();
      const formData = new FormData();
      formData.append('file', preparedFile);
      formData.append('name', uploadName || preparedFile.name);
      formData.append('category', uploadCategory);
      formData.append('userServiceId', serviceId);
      formData.append('description', `Uploaded for ${service?.serviceTitle || 'service case'}`);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to upload document');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-services', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/dashboard'] });
      setUploadName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast({ title: 'Document linked', description: 'The file is attached to this service case.' });
    },
    onError: (error: any) => {
      toast({ title: 'Upload failed', description: error?.message || 'Please try again.', variant: 'destructive' });
    },
  });

  const handleDownload = async (doc: LinkedDocument) => {
    const token = await getAuthToken();
    const response = await fetch(`/api/documents/${doc.id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      toast({ title: 'Download failed', description: 'The file could not be downloaded right now.', variant: 'destructive' });
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.originalName || doc.name || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex min-h-[420px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  if (isError || !service) {
    return (
      <Layout>
        <div className="mx-auto max-w-xl rounded-[28px] border border-slate-100 bg-white p-10 text-center shadow-sm">
          <Briefcase className="mx-auto mb-4 h-10 w-10 text-slate-300" />
          <h1 className="type-page-title font-black text-slate-900">Service case not found</h1>
          <p className="mt-2 type-support font-medium text-slate-500">The case may have been removed or you may not have access.</p>
          <Link href="/dashboard">
            <Button className="mt-6 rounded-xl bg-blue-700 text-white">Back to dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const timeline = [
    { label: 'Request created', active: true },
    { label: 'Documents linked', active: documents.length > 0 },
    { label: 'CA assignment', active: Boolean(service.assignedCaName) },
    { label: 'Payment ready', active: Boolean(service.paymentStatus && service.paymentStatus !== 'pending') },
    { label: 'Review in progress', active: ['in_progress', 'active', 'review'].includes(service.status || '') },
  ];

  return (
    <Layout title="Service Case">
      <div className="space-y-5 pb-20 md:space-y-8">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="ghost" className="h-10 w-full justify-start rounded-lg px-3 text-slate-500 hover:text-slate-900 sm:w-auto sm:rounded-xl">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link href="/payments">
              <Button variant="outline" className="h-10 w-full rounded-lg border-slate-200 sm:w-auto sm:rounded-xl">
                <CreditCard className="mr-2 h-4 w-4" />
                Payments
              </Button>
            </Link>
            <Link href="/help">
              <Button className="h-10 w-full rounded-lg bg-blue-700 text-white hover:bg-blue-600 sm:w-auto sm:rounded-xl">
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </Button>
            </Link>
          </div>
        </div>

        <section className="rounded-lg border border-slate-100 bg-white p-4 shadow-sm md:rounded-[32px] md:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:gap-8">
            <div>
              <Badge className="border-none bg-blue-50 px-3 py-1 type-meta font-black uppercase tracking-widest text-blue-700">
                {statusLabel(service.status)}
              </Badge>
              <h1 className="type-page-title mt-4 font-black text-slate-900">{service.serviceTitle || 'Service request'}</h1>
              <p className="mt-3 max-w-2xl type-support font-medium text-slate-500">
                {service.serviceCategory || 'General service'} case workspace for documents, payment state, expert handoff, and next action.
              </p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-4 md:rounded-2xl md:p-5">
              <p className="type-meta font-black uppercase tracking-widest text-amber-700">Next action</p>
              <p className="mt-2 type-support font-bold text-amber-950">{nextAction(service, documents)}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-3 md:grid-cols-3 md:gap-6">
          {[
            { label: 'Assigned CA', value: service.assignedCaName || 'Not assigned yet', icon: ShieldCheck },
            { label: 'Payment', value: statusLabel(service.paymentStatus || 'pending'), icon: CreditCard },
            { label: 'Documents', value: `${documents.length} linked`, icon: FileText },
          ].map((item) => (
            <Card key={item.label} className="rounded-lg border-slate-100 shadow-sm md:rounded-[24px]">
              <CardContent className="flex items-center gap-4 p-4 md:p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="type-meta font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                  <p className="mt-1 truncate type-support font-black text-slate-900">{item.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_420px] xl:gap-8">
          <div className="space-y-5 md:space-y-8">
            <Card className="rounded-lg border-slate-100 shadow-sm md:rounded-[28px]">
              <CardHeader className="border-b border-slate-50 p-4 md:p-6">
                <CardTitle className="type-card-title font-black">Case Timeline</CardTitle>
                <CardDescription className="type-support">What has happened and what still needs attention.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 p-4 sm:grid-cols-2 md:p-6 lg:grid-cols-5">
                {timeline.map((stage, index) => (
                  <div key={stage.label} className={cn('rounded-2xl border p-4', stage.active ? 'border-blue-100 bg-blue-50 text-blue-900' : 'border-slate-100 bg-slate-50 text-slate-500')}>
                    <div className="flex items-center gap-2">
                      {stage.active ? <CheckCircle2 className="h-4 w-4 text-blue-600" /> : <Clock className="h-4 w-4 text-slate-400" />}
                      <p className="type-meta font-black uppercase tracking-widest">Step {index + 1}</p>
                    </div>
                    <p className="mt-2 type-support font-black">{stage.label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-100 shadow-sm md:rounded-[28px]">
              <CardHeader className="border-b border-slate-50 p-4 md:p-6">
                <CardTitle className="type-card-title font-black">Linked Documents</CardTitle>
                <CardDescription className="type-support">Files uploaded here stay attached to this service case.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {documents.length ? (
                  <div className="divide-y divide-slate-50">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between gap-3 p-4 md:gap-4 md:p-5">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-blue-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate type-support font-black text-slate-900">{doc.name || doc.originalName || 'Document'}</p>
                            <p className="type-meta font-bold uppercase tracking-widest text-slate-400">
                              {doc.category || 'Other'} - {formatFileSize(doc.size || 0)}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-600" onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="type-support font-black text-slate-900">No documents linked yet</p>
                    <p className="mt-1 type-meta font-medium text-slate-500">Upload Form 16, AIS, GST files, invoices, or proofs for this case.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5 md:space-y-8">
            <Card className="rounded-lg border-slate-100 shadow-sm md:rounded-[28px]">
              <CardHeader className="border-b border-slate-50 p-4 md:p-6">
                <CardTitle className="type-card-title font-black">Case Upload</CardTitle>
                <CardDescription className="type-support">Attach a document directly to this service.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-4 md:p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadMutation.mutate(file);
                  }}
                />
                <div className="space-y-2">
                  <Label className="type-meta font-black uppercase tracking-widest text-slate-400">Document name</Label>
                  <Input value={uploadName} onChange={(event) => setUploadName(event.target.value)} placeholder="e.g. Form 16 FY 2025-26" className="h-11 rounded-xl border-slate-100" />
                </div>
                <div className="space-y-2">
                  <Label className="type-meta font-black uppercase tracking-widest text-slate-400">Category</Label>
                  <Input value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value)} placeholder="form16, ais, invoice..." className="h-11 rounded-xl border-slate-100" />
                </div>
                <Button disabled={uploadMutation.isPending} onClick={() => fileInputRef.current?.click()} className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                  {uploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Upload to Case
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-slate-100 shadow-sm md:rounded-[28px]">
              <CardHeader className="border-b border-slate-50 p-4 md:p-6">
                <CardTitle className="type-card-title font-black">Request Notes</CardTitle>
                <CardDescription className="type-support">Original brief and your latest update.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 p-4 md:p-6">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="type-meta font-black uppercase tracking-widest text-slate-400">Original request</p>
                  <p className="mt-2 type-support font-medium text-slate-700">{requestDescription || 'No detailed brief was added.'}</p>
                </div>
                <Textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder={service.metadata?.userNote || 'Add an update for the team...'}
                  className="min-h-28 rounded-2xl border-slate-100"
                />
                <Button disabled={noteMutation.isPending || !note.trim()} onClick={() => noteMutation.mutate()} variant="outline" className="h-11 w-full rounded-xl">
                  {noteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                  Save Case Note
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
