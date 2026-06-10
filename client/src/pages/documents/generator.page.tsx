import { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { sanitizeHTML } from '@/lib/sanitize';
import MetaSEO from "@/components/seo/MetaSEO";
import { useRoute, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  FileCode,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { getDocumentGeneratorPreviewData, loadDocumentGenerator } from './generators';
import { DocumentGeneratorConfig } from './generators/types';
import { useToast } from '@/hooks/use-toast';

const A4_PAGE_HEIGHT_MM = 297;

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
            className="prose prose-sm max-w-none text-gray-900"
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
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'html' | 'markdown'>('pdf');
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [config, setConfig] = useState<DocumentGeneratorConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

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

  // Load existing draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      if (!user || !config) return;
      
      try {
        setSaveStatus('saving'); // Show loading state
        
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
  }, [user, documentType, config, reset]);

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
    if (!user) {
      // Still save to local storage for guest
      localStorage.setItem(`myeca_doc_latest_${documentType}`, JSON.stringify(data));
      setSaveStatus('saved');
      toast({
        title: "Draft saved locally",
        description: "Sign in to sync document drafts securely to your account.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const draftId = documentId || crypto.randomUUID();
      const draftData = {
        id: draftId,
        userId: user.id,
        type: documentType,
        title: config?.title || "Untitled Document",
        content: data,
        updatedAt: new Date().toISOString(),
        isCertified: false // Future flag
      };

      localStorage.setItem(`myeca_doc_latest_${user.id}_${documentType}`, JSON.stringify(draftData));
      setDocumentId(draftId);

      setSaveStatus('saved');
      setLastSaved(new Date());
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

  const handleExport = async () => {
    if (!config) {
      toast({
        title: "Export unavailable",
        description: "Configuration is missing for this document.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      const data = getValues();
      const htmlContent = config.generateHTML(data);

      // exportHistory table is not yet implemented in the backend. 
      // Proceeding directly to local export formatting.

      switch (exportFormat) {
        case 'pdf':
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
          }
          break;
        case 'html':
          downloadFile(htmlContent, `${documentType}_${Date.now()}.html`, 'text/html');
          break;
        case 'markdown':
          const markdown = config.generateMarkdown(data);
          downloadFile(markdown, `${documentType}_${Date.now()}.md`, 'text/markdown');
          break;
        case 'docx':
          downloadFile(
            htmlContent,
            `${documentType}_${Date.now()}.docx`,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          );
          break;
      }

      toast({
        title: "Document exported",
        description: `Exported as ${exportFormat.toUpperCase()}.`,
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          Loading document generator...
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

  return (
    <div
      data-testid="focused-document-editor"
      className="flex h-[100dvh] flex-col overflow-hidden bg-slate-50 font-sans text-slate-950"
    >
      <MetaSEO 
        title={currentTitle}
        description={`Create and download your ${config.title} online with expert-approved clauses for the Indian legal system.`}
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
                <p className="mt-0.5 hidden truncate text-xs font-semibold text-slate-500 md:block">{config.description}</p>
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

            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger className="h-9 w-28 shrink-0 rounded-lg border-slate-200 bg-white text-xs font-black text-slate-700 shadow-none focus:ring-blue-500 sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-slate-200 shadow-xl">
                <SelectItem value="pdf" className="font-medium cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <File className="w-4 h-4 text-red-500" />
                    <span>PDF Document</span>
                  </div>
                </SelectItem>
                <SelectItem value="docx" className="font-medium cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                    <span>Word (DOCX)</span>
                  </div>
                </SelectItem>
                <SelectItem value="html" className="font-medium cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-green-500" />
                    <span>Raw HTML</span>
                  </div>
                </SelectItem>
                <SelectItem value="markdown" className="font-medium cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Markdown</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

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
              <span>Save</span>
            </Button>

            <Button
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="h-9 shrink-0 rounded-lg bg-slate-950 px-3 font-black text-white shadow-none hover:bg-slate-800"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>Export</span>
            </Button>
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
