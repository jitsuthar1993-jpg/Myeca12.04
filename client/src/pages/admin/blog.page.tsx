import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarDays, Edit, Eye, ImagePlus, Plus, Search, Trash2, Upload, WandSparkles } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import BlogArticle from "@/components/blog/BlogArticle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getAuthToken } from "@/lib/authToken";
import { cn } from "@/lib/utils";
import {
  type BlogCategory,
  type BlogFaqItem,
  type BlogSourceLink,
  type BlogPostEditorInput,
  estimateReadingTimeMinutes,
  normalizeBlogContent,
  normalizeStringArray,
} from "@shared/blog";

type CmsPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string;
  status: "draft" | "published";
  categoryId: string | null;
  category: BlogCategory | null;
  coverImage: string | null;
  authorName: string;
  authorRole: string | null;
  authorBio?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  keyHighlights?: string[];
  faqItems?: BlogFaqItem[];
  relatedPostIds?: string[];
  ctaLabel?: string | null;
  ctaHref?: string | null;
  isFeatured: boolean;
  readingTimeMinutes: number;
  publishedAt: string | null;
  updatedAt: string | null;
  createdAt?: string | null;
  tags: string[];
  audience?: "individuals" | "businesses" | "both" | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  sourceLinks?: BlogSourceLink[];
  serviceSlug?: string | null;
  calculatorSlug?: string | null;
  canonicalUrl?: string | null;
};

type EditorState = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published";
  categoryId: string;
  coverImage: string;
  authorName: string;
  authorRole: string;
  authorBio: string;
  seoTitle: string;
  seoDescription: string;
  keyHighlights: string[];
  faqItems: BlogFaqItem[];
  relatedPostIds: string[];
  ctaLabel: string;
  ctaHref: string;
  isFeatured: boolean;
  readingTimeMinutes: string;
  publishedAt: string;
  tags: string[];
  audience: "individuals" | "businesses" | "both";
  reviewedBy: string;
  reviewedAt: string;
  sourceLinks: BlogSourceLink[];
  serviceSlug: string;
  calculatorSlug: string;
  canonicalUrl: string;
};

const emptyFaq = (): BlogFaqItem => ({ question: "", answer: "" });
const emptySource = (): BlogSourceLink => ({ label: "", url: "" });
const toDateInput = (value?: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : "");
const formatDate = (value?: string | null) => {
  if (!value) return "Draft";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Draft" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

function makeState(post: Partial<CmsPost> | null, user: any): EditorState {
  const author = [user?.firstName ?? "", user?.lastName ?? ""].filter(Boolean).join(" ").trim();
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    status: post?.status === "published" ? "published" : "draft",
    categoryId: post?.categoryId ?? "",
    coverImage: post?.coverImage ?? "",
    authorName: post?.authorName ?? author,
    authorRole: post?.authorRole ?? "",
    authorBio: post?.authorBio ?? "",
    seoTitle: post?.seoTitle ?? "",
    seoDescription: post?.seoDescription ?? "",
    keyHighlights: post?.keyHighlights?.length ? post.keyHighlights : [""],
    faqItems: post?.faqItems?.length ? post.faqItems : [emptyFaq()],
    relatedPostIds: post?.relatedPostIds ?? [],
    ctaLabel: post?.ctaLabel ?? "",
    ctaHref: post?.ctaHref ?? "",
    isFeatured: Boolean(post?.isFeatured),
    readingTimeMinutes: post?.readingTimeMinutes ? String(post.readingTimeMinutes) : "",
    publishedAt: toDateInput(post?.publishedAt),
    tags: post?.tags?.length ? post.tags : [],
    audience: post?.audience ?? "both",
    reviewedBy: post?.reviewedBy ?? "",
    reviewedAt: toDateInput(post?.reviewedAt),
    sourceLinks: post?.sourceLinks?.length ? post.sourceLinks : [emptySource()],
    serviceSlug: post?.serviceSlug ?? "",
    calculatorSlug: post?.calculatorSlug ?? "",
    canonicalUrl: post?.canonicalUrl ?? "",
  };
}

function toPayload(state: EditorState): BlogPostEditorInput {
  return {
    title: state.title.trim(),
    slug: state.slug.trim(),
    excerpt: state.excerpt.trim() || null,
    content: state.content,
    status: state.status,
    categoryId: state.categoryId || null,
    coverImage: state.coverImage.trim() || null,
    authorName: state.authorName.trim() || null,
    authorRole: state.authorRole.trim() || null,
    authorBio: state.authorBio.trim() || null,
    seoTitle: state.seoTitle.trim() || null,
    seoDescription: state.seoDescription.trim() || null,
    keyHighlights: normalizeStringArray(state.keyHighlights),
    faqItems: state.faqItems.map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() })).filter((faq) => faq.question && faq.answer),
    relatedPostIds: normalizeStringArray(state.relatedPostIds),
    ctaLabel: state.ctaLabel.trim() || null,
    ctaHref: state.ctaHref.trim() || null,
    isFeatured: state.isFeatured,
    readingTimeMinutes: state.readingTimeMinutes ? Number(state.readingTimeMinutes) : null,
    publishedAt: state.publishedAt || null,
    tags: normalizeStringArray(state.tags),
    audience: state.audience,
    reviewedBy: state.reviewedBy.trim() || null,
    reviewedAt: state.reviewedAt || null,
    sourceLinks: state.sourceLinks.map((source) => ({ label: source.label.trim(), url: source.url.trim() })).filter((source) => source.label && source.url),
    serviceSlug: state.serviceSlug.trim() || null,
    calculatorSlug: state.calculatorSlug.trim() || null,
    canonicalUrl: state.canonicalUrl.trim() || null,
  };
}

function Editor({ post, posts, categories, onClose, onSave }: { post: CmsPost | null; posts: CmsPost[]; categories: BlogCategory[]; onClose: () => void; onSave: (payload: BlogPostEditorInput) => void; }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<EditorState>(() => makeState(post, user));
  const [tagInput, setTagInput] = useState("");
  const [relatedQuery, setRelatedQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const setField = <K extends keyof EditorState>(key: K, value: EditorState[K]) => setState((current) => ({ ...current, [key]: value }));
  const readingTime = state.readingTimeMinutes ? Number(state.readingTimeMinutes) : estimateReadingTimeMinutes(state.content);
  const related = posts.filter((item) => state.relatedPostIds.includes(item.id)).slice(0, 3);
  const toc = useMemo(() => normalizeBlogContent(state.content).toc, [state.content]);
  const filteredRelated = posts.filter((item) => item.id !== post?.id && (!relatedQuery.trim() || [item.title, item.authorName, item.category?.name ?? ""].join(" ").toLowerCase().includes(relatedQuery.toLowerCase())));

  const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const token = await getAuthToken();
      const response = await fetch("/api/cms/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setField("coverImage", data.url);
      toast({ title: "Cover uploaded", description: "The uploaded image is now linked to the article." });
    } catch {
      toast({ title: "Upload failed", description: "Try again or paste an existing media URL.", variant: "destructive" });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-blue-700">Blog CMS</p>
            <h2 className="text-2xl font-semibold text-slate-900">{post ? "Edit article" : "Create article"}</h2>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-full" onClick={onClose}>Close</Button>
            <Button className="rounded-full bg-blue-600 text-white hover:bg-blue-700" onClick={() => onSave(toPayload(state))}>Save article</Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="editor" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-slate-200 bg-white px-6 py-3">
          <TabsList className="grid w-full max-w-sm grid-cols-2 rounded-full bg-slate-100">
            <TabsTrigger value="editor" className="rounded-full">Editor</TabsTrigger>
            <TabsTrigger value="preview" className="rounded-full">Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="editor" className="min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden">
          <ScrollArea className="h-full">
            <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <Card className="rounded-3xl border-slate-200"><CardHeader><CardTitle>Basics</CardTitle></CardHeader><CardContent className="space-y-4">
                  <Input value={state.title} onChange={(e) => setField("title", e.target.value)} placeholder="Article title" />
                  <div className="flex gap-3"><Input value={state.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="article-slug" /><Button variant="outline" className="rounded-full" onClick={() => setField("slug", slugify(state.title))}><WandSparkles className="mr-2 h-4 w-4" />Generate</Button></div>
                  <Textarea value={state.excerpt} onChange={(e) => setField("excerpt", e.target.value)} rows={4} placeholder="Short summary for the listing page and SEO" />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Select value={state.categoryId || undefined} onValueChange={(value) => setField("categoryId", value)}><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select>
                    <Input type="date" value={state.publishedAt} onChange={(e) => setField("publishedAt", e.target.value)} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Select value={state.status} onValueChange={(value: "draft" | "published") => setField("status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem></SelectContent></Select>
                    <Input value={state.readingTimeMinutes} onChange={(e) => setField("readingTimeMinutes", e.target.value.replace(/[^\d]/g, ""))} placeholder={String(readingTime)} />
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><div><p className="font-medium text-slate-900">Featured</p><p className="text-sm text-slate-500">Prioritize on the blog landing page.</p></div><Switch checked={state.isFeatured} onCheckedChange={(checked) => setField("isFeatured", checked)} /></div>
                </CardContent></Card>

                <Card className="rounded-3xl border-slate-200"><CardHeader><CardTitle>Author and SEO</CardTitle></CardHeader><CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2"><Input value={state.authorName} onChange={(e) => setField("authorName", e.target.value)} placeholder="Author name" /><Input value={state.authorRole} onChange={(e) => setField("authorRole", e.target.value)} placeholder="Author role" /></div>
                  <Textarea value={state.authorBio} onChange={(e) => setField("authorBio", e.target.value)} rows={3} placeholder="Author bio" />
                  <Separator />
                  <Input value={state.seoTitle} onChange={(e) => setField("seoTitle", e.target.value)} placeholder="SEO title" />
                  <Textarea value={state.seoDescription} onChange={(e) => setField("seoDescription", e.target.value)} rows={3} placeholder="SEO description" />
                </CardContent></Card>

                <Card className="rounded-3xl border-slate-200"><CardHeader><CardTitle>Body, highlights, FAQs</CardTitle></CardHeader><CardContent className="space-y-4">
                  <Textarea value={state.content} onChange={(e) => setField("content", e.target.value)} rows={18} className="font-mono text-sm" placeholder="<h2>Heading</h2><p>Write the article body here...</p>" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><Label>Key highlights</Label><Button variant="outline" className="rounded-full" onClick={() => setField("keyHighlights", [...state.keyHighlights, ""])}><Plus className="mr-2 h-4 w-4" />Add</Button></div>
                    {state.keyHighlights.map((item, index) => <div key={`highlight-${index}`} className="flex gap-3"><Input value={item} onChange={(e) => { const next = [...state.keyHighlights]; next[index] = e.target.value; setField("keyHighlights", next); }} placeholder="Key takeaway" /><Button variant="outline" className="rounded-full" onClick={() => setField("keyHighlights", state.keyHighlights.filter((_, i) => i !== index))}>Remove</Button></div>)}
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><Label>FAQ items</Label><Button variant="outline" className="rounded-full" onClick={() => setField("faqItems", [...state.faqItems, emptyFaq()])}><Plus className="mr-2 h-4 w-4" />Add</Button></div>
                    {state.faqItems.map((faq, index) => <div key={`faq-${index}`} className="space-y-3 rounded-2xl border border-slate-200 p-4"><Input value={faq.question} onChange={(e) => { const next = [...state.faqItems]; next[index] = { ...next[index], question: e.target.value }; setField("faqItems", next); }} placeholder="Question" /><Textarea value={faq.answer} onChange={(e) => { const next = [...state.faqItems]; next[index] = { ...next[index], answer: e.target.value }; setField("faqItems", next); }} rows={3} placeholder="Answer" /><Button variant="outline" className="rounded-full" onClick={() => setField("faqItems", state.faqItems.filter((_, i) => i !== index))}>Remove FAQ</Button></div>)}
                  </div>
                </CardContent></Card>
              </div>

              <div className="space-y-6">
                <Card className="rounded-3xl border-slate-200"><CardHeader><CardTitle>Cover image and tags</CardTitle></CardHeader><CardContent className="space-y-4">
                  <div className="overflow-hidden rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50">{state.coverImage ? <img src={state.coverImage} alt="Cover" className="h-56 w-full object-cover" /> : <div className="flex h-56 flex-col items-center justify-center gap-3 text-slate-400"><ImagePlus className="h-8 w-8" /><p className="text-sm">No cover image selected</p></div>}</div>
                  <Input value={state.coverImage} onChange={(e) => setField("coverImage", e.target.value)} placeholder="/uploads/blog/example.webp" />
                  <Label htmlFor="cover-upload" className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-700"><Upload className="mr-2 h-4 w-4" />{uploading ? "Uploading..." : "Upload image"}</Label>
                  <input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={uploadImage} />
                  <Separator />
                  <div className="space-y-3"><div className="flex gap-3"><Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const next = tagInput.trim(); if (next && !state.tags.includes(next)) { setField("tags", [...state.tags, next]); setTagInput(""); } } }} /><Button variant="outline" className="rounded-full" onClick={() => { const next = tagInput.trim(); if (next && !state.tags.includes(next)) { setField("tags", [...state.tags, next]); setTagInput(""); } }}>Add</Button></div><div className="flex flex-wrap gap-2">{state.tags.map((tag) => <Badge key={tag} variant="secondary" className="cursor-pointer rounded-full px-3 py-1" onClick={() => setField("tags", state.tags.filter((item) => item !== tag))}>{tag}</Badge>)}</div></div>
                </CardContent></Card>

                <Card className="rounded-3xl border-slate-200"><CardHeader><CardTitle>Growth metadata</CardTitle></CardHeader><CardContent className="space-y-4">
                  <Select value={state.audience} onValueChange={(value: "individuals" | "businesses" | "both") => setField("audience", value)}>
                    <SelectTrigger><SelectValue placeholder="Audience" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Taxpayers and businesses</SelectItem>
                      <SelectItem value="individuals">Individual taxpayers</SelectItem>
                      <SelectItem value="businesses">Businesses and MSMEs</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input value={state.reviewedBy} onChange={(e) => setField("reviewedBy", e.target.value)} placeholder="Reviewed by" />
                    <Input type="date" value={state.reviewedAt} onChange={(e) => setField("reviewedAt", e.target.value)} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input value={state.serviceSlug} onChange={(e) => setField("serviceSlug", e.target.value)} placeholder="Related service slug" />
                    <Input value={state.calculatorSlug} onChange={(e) => setField("calculatorSlug", e.target.value)} placeholder="Related calculator slug" />
                  </div>
                  <Input value={state.canonicalUrl} onChange={(e) => setField("canonicalUrl", e.target.value)} placeholder="Canonical URL, if different" />
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between"><Label>Source links</Label><Button variant="outline" className="rounded-full" onClick={() => setField("sourceLinks", [...state.sourceLinks, emptySource()])}><Plus className="mr-2 h-4 w-4" />Add</Button></div>
                    {state.sourceLinks.map((source, index) => <div key={`source-${index}`} className="space-y-3 rounded-2xl border border-slate-200 p-3"><Input value={source.label} onChange={(e) => { const next = [...state.sourceLinks]; next[index] = { ...next[index], label: e.target.value }; setField("sourceLinks", next); }} placeholder="Source label" /><Input value={source.url} onChange={(e) => { const next = [...state.sourceLinks]; next[index] = { ...next[index], url: e.target.value }; setField("sourceLinks", next); }} placeholder="https://..." /><Button variant="outline" className="rounded-full" onClick={() => setField("sourceLinks", state.sourceLinks.filter((_, i) => i !== index))}>Remove source</Button></div>)}
                  </div>
                </CardContent></Card>

                <Card className="rounded-3xl border-slate-200"><CardHeader><CardTitle>Related posts and CTA</CardTitle></CardHeader><CardContent className="space-y-4">
                  <Input value={relatedQuery} onChange={(e) => setRelatedQuery(e.target.value)} placeholder="Search published articles" />
                  <div className="max-h-64 space-y-3 overflow-y-auto">{filteredRelated.map((item) => <label key={item.id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-blue-200 hover:bg-blue-50/40"><Checkbox checked={state.relatedPostIds.includes(item.id)} onCheckedChange={() => setField("relatedPostIds", state.relatedPostIds.includes(item.id) ? state.relatedPostIds.filter((id) => id !== item.id) : [...state.relatedPostIds, item.id])} /><div><p className="font-medium text-slate-900">{item.title}</p><p className="text-sm text-slate-500">{item.category?.name || "Uncategorized"} · {item.authorName}</p></div></label>)}</div>
                  <Separator />
                  <Input value={state.ctaLabel} onChange={(e) => setField("ctaLabel", e.target.value)} placeholder="CTA label" />
                  <Input value={state.ctaHref} onChange={(e) => setField("ctaHref", e.target.value)} placeholder="/expert-consultation" />
                </CardContent></Card>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="preview" className="min-h-0 flex-1 overflow-auto bg-white data-[state=inactive]:hidden">
          <BlogArticle post={{ title: state.title || "Untitled article", slug: state.slug || "preview", excerpt: state.excerpt || null, category: categories.find((category) => category.id === state.categoryId) ?? null, coverImage: state.coverImage || null, authorName: state.authorName || "MyeCA Editorial Team", authorRole: state.authorRole || null, authorBio: state.authorBio || null, publishedAt: state.publishedAt || null, readingTimeMinutes: readingTime, content: state.content, keyHighlights: normalizeStringArray(state.keyHighlights), faqItems: state.faqItems.filter((faq) => faq.question.trim() && faq.answer.trim()), relatedPosts: related, toc, ctaLabel: state.ctaLabel || undefined, ctaHref: state.ctaHref || undefined, audience: state.audience, reviewedBy: state.reviewedBy || null, reviewedAt: state.reviewedAt || null, sourceLinks: state.sourceLinks.filter((source) => source.label.trim() && source.url.trim()), serviceSlug: state.serviceSlug || null, calculatorSlug: state.calculatorSlug || null, canonicalUrl: state.canonicalUrl || null }} isPreview />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminBlog() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: postsData, isLoading } = useQuery<{ posts: CmsPost[] }>({ queryKey: ["/api/cms/posts"], queryFn: async () => (await apiRequest("/api/cms/posts")).json() });
  const { data: categoriesData } = useQuery<{ categories: BlogCategory[] }>({ queryKey: ["/api/cms/categories"], queryFn: async () => (await apiRequest("/api/cms/categories")).json() });
  const { data: detailData } = useQuery<{ post: CmsPost }>({ queryKey: ["/api/cms/posts", editingId], enabled: Boolean(dialogOpen && editingId), queryFn: async () => (await apiRequest(`/api/cms/posts/${editingId}`)).json() });

  const createMutation = useMutation({ mutationFn: (payload: BlogPostEditorInput) => apiRequest("/api/cms/posts", { method: "POST", body: JSON.stringify(payload) }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["/api/cms/posts"] }); toast({ title: "Article created", description: "The article was saved to Neon." }); setDialogOpen(false); setEditingId(null); } });
  const updateMutation = useMutation({ mutationFn: (payload: BlogPostEditorInput) => apiRequest(`/api/cms/posts/${editingId}`, { method: "PUT", body: JSON.stringify(payload) }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["/api/cms/posts"] }); if (editingId) await queryClient.invalidateQueries({ queryKey: ["/api/cms/posts", editingId] }); toast({ title: "Article updated", description: "The article changes were saved." }); setDialogOpen(false); setEditingId(null); } });
  const deleteMutation = useMutation({ mutationFn: (id: string) => apiRequest(`/api/cms/posts/${id}`, { method: "DELETE" }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["/api/cms/posts"] }); toast({ title: "Article deleted", description: "The article was removed from Neon." }); } });

  const posts = postsData?.posts ?? [];
  const categories = categoriesData?.categories ?? [];
  const filtered = posts.filter((post) => {
    const matchesStatus = status === "all" || post.status === status;
    const matchesCategory = category === "all" || post.category?.id === category;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [post.title, post.slug, post.authorName, post.category?.name ?? ""].join(" ").toLowerCase().includes(query);
    return matchesStatus && matchesCategory && matchesSearch;
  });
  const stats = { total: posts.length, published: posts.filter((post) => post.status === "published").length, drafts: posts.filter((post) => post.status === "draft").length, featured: posts.filter((post) => post.isFeatured).length };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-sm font-medium text-blue-700">Editorial CMS</p><h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Blog articles</h1><p className="mt-3 text-slate-600">Manage the Neon-backed editorial system, metadata, and preview flow.</p></div>
          <Button className="rounded-full bg-blue-600 px-5 text-white hover:bg-blue-700" onClick={() => { setEditingId(null); setDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />New article</Button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-4">{[{ label: "Total", value: stats.total }, { label: "Published", value: stats.published }, { label: "Drafts", value: stats.drafts }, { label: "Featured", value: stats.featured }].map((stat) => <Card key={stat.label} className="rounded-3xl border-slate-200"><CardContent className="p-6"><p className="text-sm text-slate-500">{stat.label}</p><p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p></CardContent></Card>)}</div>

        <Card className="mb-8 rounded-3xl border-slate-200"><CardContent className="grid gap-4 p-6 md:grid-cols-[1fr_180px_180px]"><div className="relative"><Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input className="pl-11" placeholder="Search articles" value={search} onChange={(e) => setSearch(e.target.value)} /></div><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></CardContent></Card>

        <Card className="rounded-3xl border-slate-200"><CardHeader><CardTitle>Article inventory</CardTitle></CardHeader><CardContent>{isLoading ? <p className="py-12 text-center text-slate-500">Loading articles...</p> : filtered.length === 0 ? <p className="py-12 text-center text-slate-500">No articles match the current filters.</p> : <div className="space-y-4">{filtered.map((post) => <div key={post.id} className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-blue-50/30 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><h2 className="text-xl font-semibold text-slate-900">{post.title}</h2><Badge className={cn("rounded-full px-3 py-1 text-xs", post.status === "published" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700")}>{post.status}</Badge>{post.isFeatured && <Badge className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800">Featured</Badge>}</div><p className="mt-2 text-sm text-slate-600">{post.excerpt || "No excerpt provided."}</p><div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500"><span>{post.category?.name || "Uncategorized"}</span><span>{post.authorName}</span><span>{post.readingTimeMinutes} min read</span><span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" />{formatDate(post.publishedAt)}</span></div></div><div className="flex flex-wrap gap-3"><Button variant="outline" className="rounded-full" onClick={() => { setEditingId(post.id); setDialogOpen(true); }}><Edit className="mr-2 h-4 w-4" />Edit</Button><Button variant="outline" className="rounded-full" onClick={() => window.open(`/blog/${post.slug}`, "_blank")}><Eye className="mr-2 h-4 w-4" />View</Button><Button variant="outline" className="rounded-full border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={() => { if (window.confirm("Delete this article?")) deleteMutation.mutate(post.id); }}><Trash2 className="mr-2 h-4 w-4" />Delete</Button></div></div>)}</div>}</CardContent></Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingId(null); }}>
        <DialogContent className="h-screen max-w-none rounded-none border-none p-0">
          <Editor key={editingId ?? "new"} post={detailData?.post ?? null} posts={posts} categories={categories} onClose={() => { setDialogOpen(false); setEditingId(null); }} onSave={(payload) => editingId ? updateMutation.mutate(payload) : createMutation.mutate(payload)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
