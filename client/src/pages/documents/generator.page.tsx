import { useState, useEffect } from 'react';
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
} from 'lucide-react';
// Import modular configurations
import { DOCUMENT_GENERATORS } from './generators';
import { DocumentGeneratorConfig } from './generators/types';

export default function DocumentGenerator() {
  const [match, params] = useRoute<{ type: string }>('/documents/generator/:type');
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'html' | 'markdown'>('pdf');
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Fallback to 'resume' if the document is not properly loaded yet in Phase 1
  const documentType = params?.type || 'resume';
  const config: DocumentGeneratorConfig | undefined = DOCUMENT_GENERATORS[documentType];

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

  const formData = watch();

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
      alert("Please login to save your drafts securely in the cloud.");
      // Still save to local storage for guest
      localStorage.setItem(`myeca_doc_latest_${documentType}`, JSON.stringify(data));
      setSaveStatus('saved');
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
      alert('Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    if (!config) {
      alert('Configuration missing for this document.');
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

      alert(`Document exported successfully as ${exportFormat.toUpperCase()}!`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export document. Please try again.');
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
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      <MetaSEO 
        title={currentTitle}
        description={`Create and download your ${config.title} online with expert-approved clauses for the Indian legal system.`}
        breadcrumbs={[
          { name: "Home", url: "/" }, 
          { name: "Registry", url: "/documents/generator" },
          { name: config.title, url: `/documents/generator/${documentType}` }
        ]}
      />
      {/* Premium Header Pipeline */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 px-4 md:px-6 py-3 shrink-0 shadow-sm z-20 relative">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/documents/generator')}
              className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full px-4"
            >
              <FileText className="w-4 h-4" />
              <span className="font-semibold">Back to Hub</span>
            </Button>
            <Separator orientation="vertical" className="h-8 bg-slate-200" />
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-xl shrink-0 ring-1 ring-blue-100 shadow-inner">
                {config.icon}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight tracking-tight">
                  {config.title}
                </h1>
                <p className="text-xs text-slate-500 font-medium">{config.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-slate-500 mr-4">
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
              className="flex items-center space-x-2 bg-white hover:bg-slate-50 border-slate-200 text-slate-700 rounded-full px-4 h-9 shadow-sm"
            >
              {isPreviewVisible ? (
                <EyeOff className="w-4 h-4 text-slate-500" />
              ) : (
                <Eye className="w-4 h-4 text-slate-500" />
              )}
              <span className="font-medium">{isPreviewVisible ? 'Hide View' : 'Show View'}</span>
            </Button>

            <Separator orientation="vertical" className="h-6 mx-2 bg-slate-200" />

            <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
              <SelectTrigger className="w-32 bg-white h-9 shadow-sm rounded-full border-slate-200 font-medium text-slate-700 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
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
              className="flex items-center space-x-2 h-9 rounded-full px-4 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="font-medium">Reset</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-600/20 rounded-full px-5 h-9 border-0 transition-all duration-300"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="font-semibold">Save Draft</span>
            </Button>

            <Button
              size="sm"
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md rounded-full px-5 h-9 transition-all duration-300"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span className="font-semibold">Export Now</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Form Panel */}
        <div
          className={`${isPreviewVisible ? 'w-full lg:w-[45%]' : 'w-full'} bg-slate-50/50 overflow-y-auto no-scrollbar border-r border-slate-200/60 transition-all duration-300 ease-in-out relative`}
        >
          {/* Subtle background gradient for form panel */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none"></div>

          <div className="p-6 md:p-8 max-w-4xl mx-auto relative z-10 pb-32">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 md:p-10 mb-8">
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormComponent register={register} errors={errors} control={control} watch={watch} />
              </form>
            </div>
          </div>
        </div>

        {/* Live Preview Panel (Dark Premium Theme) */}
        {isPreviewVisible && (
          <div className="hidden lg:flex lg:w-[55%] bg-[#0f172a] overflow-y-auto relative no-scrollbar transition-all duration-300 ease-in-out border-l border-slate-800 justify-center pt-12 pb-24">
            
            {/* Premium Dark Background Radial Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/40 via-[#0f172a] to-[#0f172a] pointer-events-none"></div>

            <div className="max-w-5xl mx-auto relative z-10 w-full flex justify-center">
              {/* Floating Paper Layout */}
              <div
                className="bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/10 print-exact origin-top transition-all duration-500 hover:scale-[1.01]"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  padding: '20mm',
                  marginBottom: '40px',
                }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(config.generateHTML(formData)) }}
                  className="prose prose-sm max-w-none text-gray-900"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
