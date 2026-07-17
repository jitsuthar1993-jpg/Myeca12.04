import { useState, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { sanitizeHTML } from '@/lib/sanitize';
import MetaSEO from "@/components/seo/MetaSEO";
import { useRoute, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  Save,
  Eye,
  EyeOff,
  RotateCcw,
  File,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  X,
  ChevronDown,
} from 'lucide-react';
import { getDocumentGeneratorPreviewData, loadDocumentGenerator } from './generators';
import { DocumentGeneratorConfig, type DocumentExportFormat } from './generators/types';
import { convertFinancialDocument, type FinancialDocumentKind } from './financial';
import { useToast } from '@/hooks/use-toast';
import { captureTelemetryEvent } from '@/telemetry/browser';
import { apiRequest } from '@/lib/queryClient';
import { wrapPrintableDocument } from './generators/document-print';

const A4_PAGE_HEIGHT_MM = 297;

const escapeHtmlText = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildWordDocumentHtml = (htmlContent: string, title: string) => `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtmlText(title)}</title>
</head>
<body>
${htmlContent}
</body>
</html>`;

function DocumentPreview({ htmlContent }: { htmlContent: string }) {
  const sanitizedHtml = useMemo(() => sanitizeHTML(htmlContent), [htmlContent]);
  const [pages, setPages] = useState<string[]>([]);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') return;

    const source = document.createElement('div');
    source.innerHTML = sanitizedHtml;

    const sourceRoot =
      source.children.length === 1
        ? (source.firstElementChild as HTMLElement)
        : source;
    const sourceChildren = Array.from(sourceRoot.childNodes).filter(
      (node) => node.nodeType !== Node.TEXT_NODE || Boolean(node.textContent?.trim())
    );

    if (sourceChildren.length === 0) {
      setPages([sanitizedHtml]);
      return;
    }

    const measurer = document.createElement('div');
    measurer.style.cssText = [
      'position:absolute',
      'left:-10000px',
      'top:0',
      'visibility:hidden',
      'pointer-events:none',
      'width:210mm',
      'box-sizing:border-box',
      'padding:20mm',
      'background:#fff',
    ].join(';');
    document.body.appendChild(measurer);

    const pageHeightPx = A4_PAGE_HEIGHT_MM * (96 / 25.4) + 4;
    const measuredPages: HTMLElement[] = [];

    const createPageRoot = () => {
      const pageRoot = sourceRoot.cloneNode(false) as HTMLElement;
      const page = document.createElement('div');
      page.style.cssText = [
        'width:210mm',
        'min-height:297mm',
        'box-sizing:border-box',
        'padding:20mm',
        'background:#fff',
      ].join(';');
      page.appendChild(pageRoot);
      measurer.appendChild(page);
      measuredPages.push(pageRoot);
      return pageRoot;
    };

    let activeRoot = createPageRoot();

    sourceChildren.forEach((child) => {
      const clonedChild = child.cloneNode(true);
      activeRoot.appendChild(clonedChild);

      const pageElement = activeRoot.parentElement;
      if (
        pageElement &&
        pageElement.scrollHeight > pageHeightPx &&
        activeRoot.childNodes.length > 1
      ) {
        activeRoot.removeChild(clonedChild);
        activeRoot = createPageRoot();
        activeRoot.appendChild(clonedChild);
      }
    });

    const nextPages = measuredPages
      .filter((pageRoot) => pageRoot.textContent?.trim() || pageRoot.children.length > 0)
      .map((pageRoot) => pageRoot.outerHTML);

    document.body.removeChild(measurer);
    setPages(nextPages.length > 0 ? nextPages : [sanitizedHtml]);
  }, [sanitizedHtml]);

  const pagesToRender = pages.length > 0 ? pages : [sanitizedHtml];

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {pagesToRender.map((pageHtml, index) => (
        <div
          key={`${index}-${pageHtml.length}`}
          className="bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10 print-exact origin-top transition-all duration-500 hover:scale-[1.01]"
          style={{
            width: '210mm',
            minHeight: '297mm',
            padding: '20mm',
            marginBottom: index === pagesToRender.length - 1 ? '40px' : 0,
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: pageHtml }}
            className="type-article-prose type-article-prose-sm text-slate-900"
          />
        </div>
      ))}
    </div>
  );
}

export default function DocumentGenerator() {
  const [, params] = useRoute<{ type: string }>('/documents/generator/:type');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [config, setConfig] = useState<DocumentGeneratorConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const formStartedRef = useRef(false);

  // Fallback to 'resume' if the document is not properly loaded yet in Phase 1
  const documentType = params?.type || 'resume';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    getValues,
    control,
  } = useForm({
    resolver: config ? zodResolver(config.schema) : undefined,
    defaultValues: config?.defaultValues,
  });

  const pendingDraftKey = `myeca_generator_pending_${documentType}`;
  const conversionDraftKey = `myeca_generator_conversion_${documentType}`;

  const requireAuthenticatedGeneratorAction = (action: 'save' | 'export' | 'convert') => {
    if (user) return true;

    sessionStorage.setItem(pendingDraftKey, JSON.stringify(getValues()));
    sessionStorage.setItem('myeca_generator_pending_action', action);
    captureTelemetryEvent('generator_login_gate_shown', { generator_type: documentType, action });
    toast({
      title: "Sign in to continue",
      description: "Your entered information is preserved in this browser session.",
    });
    setLocation(`/auth/login?next=${encodeURIComponent(`/documents/generator/${documentType}`)}`);
    return false;
  };

  useEffect(() => {
    let isActive = true;

    setIsConfigLoading(true);
    setConfig(null);

    loadDocumentGenerator(documentType)
      .then((loadedConfig) => {
        if (isActive) {
          if (loadedConfig) {
            reset(loadedConfig.defaultValues);
          }
          setConfig(loadedConfig);
        }
      })
      .catch((error) => {
        console.error(`Failed to load document generator '${documentType}':`, error);
        if (isActive) {
          setConfig(null);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsConfigLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [documentType, reset]);

  const formData = watch();
  const previewData = useMemo(
    () => (config ? getDocumentGeneratorPreviewData(config.defaultValues, formData) : formData),
    [config, formData],
  );

  useEffect(() => {
    if (!config) return;
    captureTelemetryEvent('generator_viewed', { generator_type: documentType });
  }, [config, documentType]);

  useEffect(() => {
    if (!config || formStartedRef.current) return;
    if (JSON.stringify(formData) !== JSON.stringify(config.defaultValues)) {
      formStartedRef.current = true;
      captureTelemetryEvent('generator_form_started', { generator_type: documentType });
    }
  }, [config, documentType, formData]);

  // Restore a guest draft, converted document, or signed-in saved draft.
  useEffect(() => {
    const loadDraft = async () => {
      if (!config) return;

      try {
        const convertedData = sessionStorage.getItem(conversionDraftKey);
        if (convertedData && config.applyFinancialDraft) {
          reset(config.applyFinancialDraft(JSON.parse(convertedData)));
          sessionStorage.removeItem(conversionDraftKey);
          return;
        }

        const pendingData = sessionStorage.getItem(pendingDraftKey);
        if (pendingData) {
          reset(JSON.parse(pendingData));
          if (user) sessionStorage.removeItem(pendingDraftKey);
          return;
        }

        if (!user) return;
        setSaveStatus('saving');
        const localData = localStorage.getItem(`myeca_doc_latest_${user.id}_${documentType}`)
          || localStorage.getItem(`myeca_doc_latest_${documentType}`);
        if (localData) {
          const parsed = JSON.parse(localData);
          reset(parsed.content || parsed);
          setDocumentId(parsed.id || null);
          setLastSaved(parsed.updatedAt ? new Date(parsed.updatedAt) : null);
          setSaveStatus('idle');
        }
      } catch (error) {
        console.error("Error loading local draft:", error);
        setSaveStatus('error');
      } finally {
        setSaveStatus('idle');
      }
    };

    loadDraft();
  }, [user, documentType, config, conversionDraftKey, pendingDraftKey, reset]);

  useEffect(() => {
    if (!autoSaveEnabled || !user || !config) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, autoSaveEnabled, user]);

  const handleAutoSave = async () => {
    if (!user || !config) return;

    try {
      setSaveStatus('saving');
      const content = getValues();

      const draftId = documentId || crypto.randomUUID();
      const draftData = {
        id: draftId,
        userId: user.id,
        type: documentType,
        title: config.title,
        content: content,
        updatedAt: new Date().toISOString(),
      };

      localStorage.setItem(`myeca_doc_latest_${user.id}_${documentType}`, JSON.stringify(draftData));
      setDocumentId(draftId);

      setSaveStatus('saved');
      setLastSaved(new Date());
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const onSubmit = async (data: any) => {
    if (!requireAuthenticatedGeneratorAction('save') || !user || !config) return;

    setIsSaving(true);
    try {
      const draftId = documentId || crypto.randomUUID();
      const htmlContent = sanitizeHTML(config.generateHTML(data));
      const draftData = {
        id: draftId,
        userId: user.id,
        type: documentType,
        title: config.title || "Untitled Document",
        content: data,
        updatedAt: new Date().toISOString(),
        isCertified: false // Future flag
      };

      localStorage.setItem(`myeca_doc_latest_${user.id}_${documentType}`, JSON.stringify(draftData));
      const response = await apiRequest("/api/documents/generated", {
        method: "POST",
        body: JSON.stringify({
          name: config.title || "Generated Document",
          generatorType: documentType,
          htmlContent,
          description: `Saved ${config.title || "document"} draft from the document generator.`,
        }),
      });
      const result = await response.json().catch(() => null);
      setDocumentId(result?.document?.id || draftId);

      setSaveStatus('saved');
      setLastSaved(new Date());
      captureTelemetryEvent('generator_draft_saved', { generator_type: documentType });
      toast({
        title: "Saved to My Documents",
        description: "Your generated document is now available in the document vault.",
      });
    } catch (error) {
      console.error('Failed to save document draft:', error);
      toast({
        title: "Save failed",
        description: "Failed to save document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async (format: DocumentExportFormat) => {
    if (!config) {
      toast({
        title: "Export unavailable",
        description: "Configuration is missing for this document.",
        variant: "destructive",
      });
      return;
    }
    if (!requireAuthenticatedGeneratorAction('export')) return;

    const data = getValues();
    const exportBlockReason = config.exportBlockReason?.(data);
    if (exportBlockReason) {
      toast({
        title: "Export blocked",
        description: exportBlockReason,
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const htmlContent = sanitizeHTML(config.generateHTML(data));

      // exportHistory table is not yet implemented in the backend.
      // Proceeding directly to local export formatting.

      switch (format) {
        case 'pdf':
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(wrapPrintableDocument(htmlContent, config.title, config.complianceNotice));
            printWindow.document.close();
            printWindow.onload = () => window.setTimeout(() => printWindow.print(), 150);
          } else {
            throw new Error('The browser blocked the print window. Allow pop-ups and try again.');
          }
          break;
        case 'word':
          downloadFile(
            buildWordDocumentHtml(wrapPrintableDocument(htmlContent, config.title, config.complianceNotice), config.title),
            `${documentType}_${Date.now()}.doc`,
            'application/msword',
          );
          break;
      }

      captureTelemetryEvent('generator_export_completed', {
        generator_type: documentType,
        export_format: format,
      });
      toast({
        title: "Document exported",
        description: `Exported as ${format === 'word' ? 'Word' : 'PDF'}.`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export failed",
        description: "Failed to export document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleConversion = (target: FinancialDocumentKind) => {
    if (!config?.buildFinancialDraft || !requireAuthenticatedGeneratorAction('convert')) return;

    try {
      const sourceDraft = config.buildFinancialDraft(getValues(), documentId);
      const convertedDraft = convertFinancialDocument(sourceDraft, target);
      sessionStorage.setItem(`myeca_generator_conversion_${target}`, JSON.stringify(convertedDraft));
      captureTelemetryEvent('generator_conversion_completed', {
        generator_type: documentType,
        target_type: target,
      });
      setLocation(`/documents/generator/${target}`);
    } catch (error) {
      toast({
        title: "Conversion unavailable",
        description: error instanceof Error ? error.message : "Unable to convert this document.",
        variant: "destructive",
      });
    }
  };

  const handleCaReview = () => {
    captureTelemetryEvent('generator_ca_review_clicked', { generator_type: documentType });
    setLocation(`/expert-consultation?source=${encodeURIComponent(documentType)}`);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Delay revocation to ensure the browser has time to start the download
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the form? All unsaved changes will be lost.')) {
      reset(config?.defaultValues);
      setDocumentId(null);
    }
  };

  if (isConfigLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          Loading document generator...
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>{documentType}</strong> is currently in development (Phase 2 rollout). Please
            check back soon or select an active document type from the registry.
          </AlertDescription>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => setLocation('/documents/generator')}
          >
            Return to Registry
          </Button>
        </Alert>
      </div>
    );
  }

  const FormComponent = config.FormComponent;
  const currentTitle = `${config.title} Generator | MyeCA.in`;
  const offersCaReview = ['msme-cash-flow', 'projected-balance-sheet', 'net-worth-statement'].includes(documentType);

  return (
    <div
      data-testid="focused-document-editor"
      className={`flex flex-col overflow-hidden bg-slate-50 font-sans text-slate-950 ${user ? 'h-[100dvh]' : 'h-[calc(100dvh-60px)] md:h-[calc(100dvh-74px)]'}`}
    >
      <MetaSEO
        title={currentTitle}
        description={config.description}
        keywords={config.seo?.keywords}
        faqPageData={config.seo?.faqs}
        type="calculator"
        calculatorData={{
          type: config.title,
          features: ["Guided Indian-market fields", "Live document preview", "Printable export after sign in"],
          accuracy: "Prepared from user-entered information",
          updates: "Reviewed for current document-generator requirements",
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Registry", url: "/documents/generator" },
          { name: config.title, url: `/documents/generator/${documentType}` }
        ]}
      />
      <header className="relative z-20 shrink-0 border-b border-slate-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur sm:px-5">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setLocation('/documents/generator')}
              className="h-9 shrink-0 rounded-lg px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden font-black sm:inline">Back to Document Generator</span>
              <span className="font-black sm:hidden">Back</span>
            </Button>
            <Separator orientation="vertical" className="hidden h-8 bg-slate-200 sm:block" />
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-700">
                {config.icon}
              </div>
              <div className="min-w-0 [&>p]:mb-0">
                <h1 className="truncate text-base font-black leading-tight text-slate-950 sm:text-lg">
                  {config.title}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
            <div className="mr-2 hidden shrink-0 items-center gap-2 text-xs font-bold text-slate-500 lg:flex">
              {saveStatus === 'saving' && (
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              )}
              {saveStatus === 'saved' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {saveStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              <span className="font-medium whitespace-nowrap">
                {saveStatus === 'saving' && 'Saving...'}
                {saveStatus === 'saved' && 'Saved automatically'}
                {saveStatus === 'error' && 'Failed to save'}
                {saveStatus === 'idle' &&
                  lastSaved &&
                  `Saved at ${new Date(lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              className="hidden h-9 shrink-0 items-center gap-2 rounded-lg border-slate-200 bg-white px-3 text-slate-700 shadow-none hover:bg-slate-50 lg:flex"
            >
              {isPreviewVisible ? (
                <EyeOff className="w-4 h-4 text-slate-500" />
              ) : (
                <Eye className="w-4 h-4 text-slate-500" />
              )}
              <span className="font-black">{isPreviewVisible ? 'Hide preview' : 'Show preview'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobilePreviewOpen(true)}
              className="h-9 shrink-0 rounded-lg border-slate-200 px-3 font-black lg:hidden"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 shrink-0 rounded-lg px-3 text-slate-600 hover:bg-red-50 hover:text-red-600"
              aria-label="Reset document"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden font-black sm:inline">Reset</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="h-9 shrink-0 rounded-lg bg-blue-700 px-3 font-black text-white shadow-none hover:bg-blue-800"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{user ? 'Save' : 'Sign in to Save'}</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  disabled={isExporting}
                  className="h-9 shrink-0 rounded-lg bg-slate-950 px-3 font-black text-white shadow-none hover:bg-slate-800"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{user ? 'Export' : 'Sign in to Export'}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-lg border-slate-200 shadow-xl">
                <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer gap-2 font-medium">
                  <File className="h-4 w-4 text-red-500" />
                  <span>Export as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('word')} className="cursor-pointer gap-2 font-medium">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span>Export as Word</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Form Panel */}
        <div
          className={`${isPreviewVisible ? 'w-full lg:w-[45%]' : 'w-full'} relative overflow-y-auto border-r border-slate-200 bg-slate-50 transition-all duration-300 ease-in-out`}
        >
          <div className="relative z-10 mx-auto max-w-4xl p-4 pb-32 sm:p-6 lg:p-8">
            {config.complianceNotice && (
              <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-950">
                <ShieldCheck className="h-4 w-4" />
                <AlertDescription className="font-semibold">{config.complianceNotice}</AlertDescription>
              </Alert>
            )}
            {(config.conversionTargets?.length || config.relatedLinks?.length || offersCaReview) && (
              <Card className="mb-4 border-blue-100 bg-blue-50/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Connected next steps</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {config.conversionTargets?.map((target) => (
                    <Button key={target.kind} type="button" variant="outline" onClick={() => handleConversion(target.kind)} className="bg-white">
                      {target.label}<ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ))}
                  {config.relatedLinks?.map((link) => (
                    <Button key={link.href} type="button" variant="outline" onClick={() => setLocation(link.href)} className="bg-white">
                      {link.label}<ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ))}
                  {offersCaReview && (
                    <Button type="button" variant="outline" onClick={handleCaReview} className="border-blue-200 bg-white text-blue-800">
                      Request optional CA review<ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
            {!user && config.seo && (
              <Card className="mb-4 border-slate-200 bg-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Prepare this Indian document draft</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-5 text-sm text-slate-700 md:grid-cols-2">
                  <section>
                    <h2 className="mb-2 font-black text-slate-950">Keep these details ready</h2>
                    <ul className="space-y-2">
                      {config.seo.requiredInputs.map((input) => (
                        <li key={input} className="flex gap-2">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{input}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h2 className="mb-2 font-black text-slate-950">Important limitations</h2>
                    <ul className="space-y-2">
                      {config.seo.limitations.map((limitation) => (
                        <li key={limitation} className="flex gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section className="md:col-span-2">
                    <h2 className="mb-2 font-black text-slate-950">Common questions</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                      {config.seo.faqs.map((faq) => (
                        <div key={faq.question} className="rounded-lg bg-slate-50 p-3">
                          <h3 className="font-bold text-slate-950">{faq.question}</h3>
                          <p className="mt-1 mb-0 text-slate-600">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </CardContent>
              </Card>
            )}
            <div className="mb-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormComponent register={register} errors={errors} control={control} watch={watch} />
              </form>
            </div>
          </div>
        </div>

        {/* Live Preview Panel (Dark Premium Theme) */}
        {isPreviewVisible && (
          <div className="relative hidden overflow-y-auto border-l border-slate-800 bg-slate-950 pb-24 pt-10 lg:flex lg:w-[55%] lg:justify-center">
            <div className="relative z-10 mx-auto flex w-full max-w-5xl justify-center">
              <DocumentPreview htmlContent={config.generateHTML(previewData)} />
            </div>
          </div>
        )}
      </div>

      {isMobilePreviewOpen && (
        <div
          data-testid="mobile-document-preview"
          className="fixed inset-0 z-50 flex flex-col bg-slate-950 lg:hidden"
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900 px-4 text-white">
            <div className="min-w-0 [&>p]:mb-0">
              <p className="truncate text-sm font-black">{config.title}</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-400">Document preview</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobilePreviewOpen(false)}
              className="h-9 w-9 rounded-lg text-white hover:bg-slate-800 hover:text-white"
              aria-label="Close document preview"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="min-w-[820px]">
              <DocumentPreview htmlContent={config.generateHTML(previewData)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
