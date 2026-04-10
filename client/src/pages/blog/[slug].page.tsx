import { useState, useEffect, useRef } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Link, useParams } from "wouter";
import { Calendar, User, ArrowLeft, Clock, Sparkles, ArrowRight, List, ChevronRight, Share2, Twitter, Facebook, Linkedin, Link as LinkIcon, BookOpen, Zap, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import ShareButtons from "@/components/ShareButtons";
import { Loader2 } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const formatContent = (content: string, title?: string) => {
  if (!content) return null;
  
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentTableRows: React.ReactNode[] = [];
  let skippedFirstH1 = false;

  const flushTable = (index: number) => {
    if (currentTableRows.length > 0) {
      elements.push(
        <div key={`table-${index}`} className="mb-10 overflow-hidden rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody>{currentTableRows}</tbody>
          </table>
        </div>
      );
      currentTableRows = [];
    }
  };

  lines.forEach((line, index) => {
    const isTableLine = line.includes('|') && line.split('|').length > 2;

    if (isTableLine) {
      const isHeaderRow = index < lines.length - 1 && lines[index + 1].includes('---');
      const isSeparatorRow = line.includes('---');
      
      if (!isSeparatorRow) {
        const cells = line.split('|').map(c => c.trim()).filter((c, i) => !(i === 0 && line.startsWith('|') && c === "") && !(i === line.split('|').length - 1 && line.endsWith('|') && c === ""));
        
        currentTableRows.push(
          <tr key={`row-${index}`} className={cn(isHeaderRow ? "bg-slate-50 border-b border-slate-100" : "border-b border-slate-50")}>
            {cells.map((cell, i) => (
              isHeaderRow ? (
                <th key={i} className="px-5 py-4 text-left text-[11px] font-black text-slate-900 uppercase tracking-widest">{cell}</th>
              ) : (
                <td key={i} className="px-5 py-5 text-sm font-black text-slate-800">{cell}</td>
              )
            ))}
          </tr>
        );
      }
    } else {
      flushTable(index);

      // Headers
      if (line.startsWith('# ')) {
        const headerText = line.substring(2).trim();
        // Skip first H1 if it matches title or is just redundant
        if (!skippedFirstH1 && (headerText === title || index < 5)) {
          skippedFirstH1 = true;
          return;
        }
        elements.push(<h1 key={index} className="text-3xl md:text-5xl font-black text-slate-900 mb-8 mt-12 scroll-mt-32 leading-tight">{headerText}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={index} className="text-2xl md:text-3xl font-black text-slate-900 mb-6 mt-10 scroll-mt-32">{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={index} className="text-xl md:text-2xl font-black text-slate-900 mb-4 mt-8 scroll-mt-32">{line.substring(4)}</h3>);
      } 
      // Lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(<li key={index} className="text-slate-600 mb-2 ml-6 list-disc font-medium">{line.substring(2)}</li>);
      }
      else if (/^\d+\.\s/.test(line)) {
        elements.push(<li key={index} className="text-slate-600 mb-2 ml-6 list-decimal font-medium">{line.replace(/^\d+\.\s/, "")}</li>);
      }
      // Empty lines
      else if (line.trim() === '') {
        if (elements.length > 0) {
          elements.push(<div key={index} className="h-2" />);
        }
      }
      // Regular Paragraphs
      else {
        const formattedLine = line.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-slate-900 font-extrabold">{part}</strong> : part);
        elements.push(<p key={index} className="text-[18px] text-slate-800/90 mb-6 leading-[1.8] font-medium tracking-tight">{formattedLine}</p>);
      }
    }
  });

  flushTable(lines.length);
  return <div className="space-y-4">{elements}</div>;
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const [activeTocId, setActiveTocId] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { data: postData, isLoading, error } = useQuery({
    queryKey: ["public-blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/public/blogs/${slug}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch blog post");
      }
      const data = await res.json() as { post: any };
      return data.post;
    },
  });

  const post = postData;

  const { data: relatedPostsData } = useQuery({
    queryKey: ["public-blog-related", slug],
    queryFn: async () => {
      const res = await fetch(`/api/public/blogs/${slug}/related`);
      if (!res.ok) return { posts: [] };
      return await res.json() as { posts: any[] };
    },
    enabled: !!post,
  });

  const relatedPosts = relatedPostsData?.posts || [];

  useEffect(() => {
    if (post && contentRef.current) {
      const headers = contentRef.current.querySelectorAll("h2, h3");
      const tocItems: TocItem[] = Array.from(headers).map((header, index) => {
        const text = header.textContent || "";
        const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") + "-" + index;
        header.id = id;
        return {
          id,
          text,
          level: parseInt(header.tagName.substring(1))
        };
      });
      setToc(tocItems);

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveTocId(entry.target.id);
            }
          });
        },
        { rootMargin: "-100px 0px -60% 0px" }
      );

      headers.forEach((header) => observer.observe(header));
      return () => observer.disconnect();
    }
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 text-slate-200 animate-spin mb-4" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Preparing Expert Analysis...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center p-12 max-w-md">
          <BookOpen className="w-12 h-12 text-slate-100 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Article Not Found</h1>
          <p className="text-slate-500 mb-8 font-medium">This resource might have been moved or removed.</p>
          <Link href="/blog">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-8 h-12 font-black text-xs uppercase tracking-widest">
              Back to Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tagsArray = post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : [];

  return (
    <div className="min-h-screen bg-white pb-24">
      <MetaSEO
        title={`${post.title} | MyeCA.in Expert Hub`}
        description={post.excerpt}
        keywords={tagsArray}
        type="article"
      />

      {/* Ultra-Compact High-Fidelity Header */}
      <header className="pt-4 pb-2 border-b border-slate-50 bg-white sticky top-[74px] z-40 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <Link href="/blog">
                  <button className="text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg border border-slate-100 transition-all active:scale-90">
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <div className="h-4 w-px bg-slate-200" />
                <span className="text-blue-600 text-[9px] font-black uppercase tracking-[0.2em]">{post.category}</span>
                <span className="text-slate-300 text-[10px]">•</span>
                <span className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Expert Analysis</span>
              </div>
              
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                {post.title}
              </h1>
              
              <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-300" /> 
                  {(() => {
                    try {
                      const dateObj = post.createdAt;
                      let date: Date;
                      if (dateObj?._seconds) {
                        date = new Date(dateObj._seconds * 1000);
                      } else if (dateObj?.toDate) {
                        date = dateObj.toDate();
                      } else {
                        date = new Date(dateObj);
                      }
                      return isNaN(date.getTime()) ? "No Date" : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    } catch (e) {
                      return "No Date";
                    }
                  })()}
                </span>
                <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-300" /> {post.readTime || 5} min read</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0 self-stretch md:self-center">
               <div className="bg-white border border-slate-100 p-3 rounded-[1.5rem] flex items-center gap-4 shadow-xl shadow-slate-200/10 relative overflow-hidden group w-full md:w-auto min-w-[200px]">
                  {/* Background Aura */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-[30px] -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-all duration-700" />
                  
                  <div className="relative z-10 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white p-0.5 shadow-md border border-slate-100 group-hover:scale-105 transition-transform duration-500 overflow-hidden shrink-0">
                      <img 
                        src="/contributor_logo.png" 
                        alt="Expert Contributor"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-900 leading-none mb-1">
                        {post.author?.firstName || "Admin"}
                      </p>
                      <p className="text-blue-600 text-[8px] font-black uppercase tracking-[0.1em] leading-none mb-2">
                        Lead Contributor
                      </p>
                      <div className="flex items-center gap-1.5 opacity-80">
                         <m.div 
                           animate={{ opacity: [0.4, 1, 0.4] }}
                           transition={{ duration: 2, repeat: Infinity }}
                           className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                         />
                         <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Online</span>
                      </div>
                    </div>
                  </div>
               </div>
               <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center w-full mr-1">Contributor Profile</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <div className="grid lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8">
            <article ref={contentRef} className="article-content max-w-none">
              {formatContent(post.content, post.title)}
            </article>

            {/* Expert Reviewer / Author Footer */}
            <div className="mt-20 p-8 md:p-12 bg-slate-50 rounded-[3rem] border border-slate-100 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl border border-slate-100 flex items-center justify-center text-4xl font-black text-blue-600">
                  {post.author?.firstName?.charAt(0) || "A"}
                </div>
                <div className="text-center md:text-left flex-1">
                  <Badge variant="outline" className="bg-white border-blue-100 text-blue-600 px-3 py-1 mb-4 rounded-full text-[9px] font-black uppercase tracking-widest">
                    Primary Contributor
                  </Badge>
                  <h3 className="text-2xl font-black text-slate-900 mb-3">{post.author?.firstName || "Admin"}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed mb-6 max-w-xl">
                    Expert Chartered Accountant specializing in Indian taxation, corporate strategy, and financial planning. Dedicated to making complex financial laws accessible to everyone.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <Button className="rounded-xl px-8 h-12 bg-slate-900 text-white hover:bg-slate-800 font-black text-sm transition-transform active:scale-95 shadow-xl">
                      Consult Author
                    </Button>
                    <Button variant="ghost" className="rounded-xl px-4 h-12 text-slate-600 hover:text-blue-600 font-black text-sm">
                      View Portfolio <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Lightened Tax Strategies CTA at the end of article */}
            <div className="mt-12 p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 opacity-5 rounded-full blur-[80px] -mr-32 -mt-32" />
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="max-w-xl text-center md:text-left">
                  <h4 className="text-2xl font-black text-slate-900 mb-2 leading-tight">Implement these <span className="text-blue-600">Tax Strategies?</span></h4>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">Our AI-powered optimizer helps you calculate exact benefits instantly based on the latest 2025-26 guidelines.</p>
                </div>
                
                <div className="flex flex-col gap-3 min-w-[240px]">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 font-black text-sm shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                    Launch Tax Optimizer
                  </Button>
                  <Link href="/contact">
                    <Button variant="ghost" className="w-full text-blue-600 hover:bg-blue-50 font-black text-xs h-10 uppercase tracking-widest">
                      Questions? Talk to a CA
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Back Button for Easy Navigation */}
            <div className="mt-12 pt-12 border-t border-slate-100 flex justify-center">
              <Link href="/blog">
                <Button variant="outline" className="rounded-full px-8 h-12 border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all group">
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Knowledge Hub
                </Button>
              </Link>
            </div>
          </div>

          {/* Robust Sticky Sidebar - Fixed to aside for grid stability */}
          <aside className="lg:col-span-4 sticky top-28 h-fit self-start space-y-8 pb-20">
            <div className="space-y-8">
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <div className="h-px bg-slate-200 flex-1" />
                    Insight Navigation
                    <div className="h-px bg-slate-200 flex-1" />
                  </h4>
                  
                  <div className="space-y-3 border-l border-slate-100 pl-6">
                    {toc.length > 0 ? toc.map((item, idx) => {
                      const hasChildren = toc[idx + 1]?.level > item.level;
                      const isExpanded = expandedIds.has(item.id);
                      const isChild = item.level > 2;
                      
                      if (isChild && !expandedIds.has(toc.find((p, i) => i < idx && p.level === 2)?.id || "")) {
                        return null;
                      }

                      return (
                        <div key={item.id} className="space-y-1">
                          <div
                            className={cn(
                              "w-full text-left py-2 text-[10px] font-black uppercase tracking-widest transition-all block relative group/nav cursor-pointer",
                              activeTocId === item.id 
                                ? "text-blue-600" 
                                : "text-slate-400 hover:text-slate-600",
                              item.level === 3 && "pl-4 normal-case tracking-normal font-bold text-[11px]"
                            )}
                            onClick={() => {
                              const element = document.getElementById(item.id);
                              if (element) {
                                window.scrollTo({
                                  top: element.offsetTop - 120,
                                  behavior: "smooth"
                                });
                              }
                            }}
                          >
                            {activeTocId === item.id && (
                              <m.div 
                                layoutId="activeToc"
                                className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-0.5 h-3 bg-blue-600 rounded-full"
                              />
                            )}
                            <div className="flex items-center gap-2">
                              {item.level === 2 && hasChildren ? (
                                <button 
                                  onClick={(e) => toggleExpand(item.id, e)}
                                  className="p-1 -ml-1 hover:bg-slate-100 rounded-md transition-colors"
                                >
                                  <ChevronRight className={cn(
                                    "w-3 h-3 transition-transform duration-300",
                                    isExpanded ? "rotate-90 text-blue-600" : "text-slate-300"
                                  )} />
                                </button>
                              ) : (
                                <ChevronRight className={cn(
                                  "w-2.5 h-2.5 transition-transform duration-300 opacity-50",
                                  activeTocId === item.id ? "text-blue-600 translate-x-0.5" : "text-slate-300"
                                )} />
                              )}
                              <span>{item.text}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }) : (
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Generating Outline...</p>
                    )}
                  </div>
                </div>

                {/* Nano Banana Quick Tools */}
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#FDE047]/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-[#FDE047]/20 transition-all duration-700" />
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                    <Zap className="w-3 h-3 text-[#FDE047] fill-[#FDE047]" />
                    Quick Tools
                  </h4>
                  <div className="space-y-4">
                    <Link href="/calculators/income-tax">
                      <m.div whileHover={{ x: 5 }} className="flex items-center gap-4 cursor-pointer group/tool p-2 -ml-2 rounded-xl transition-all">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/tool:bg-[#FDE047] group-hover/tool:text-black transition-all">
                          <Calculator className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-900 leading-none mb-1">Tax Calculator</p>
                          <p className="text-[9px] font-medium text-slate-400">New vs Old Regime</p>
                        </div>
                        <ChevronRight className="w-3 h-3 ml-auto text-slate-200 group-hover/tool:text-black transition-colors" />
                      </m.div>
                    </Link>
                    <Link href="/tax-assistant">
                      <m.div whileHover={{ x: 5 }} className="flex items-center gap-4 cursor-pointer group/tool p-2 -ml-2 rounded-xl transition-all">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover/tool:bg-[#FDE047] group-hover/tool:text-black transition-all">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-900 leading-none mb-1">AI Refund Estimator</p>
                          <p className="text-[9px] font-medium text-slate-400">Instant AI Check</p>
                        </div>
                        <ChevronRight className="w-3 h-3 ml-auto text-slate-200 group-hover/tool:text-black transition-colors" />
                      </m.div>
                    </Link>
                  </div>
                </div>

                {/* Upgraded Nano Banana Filing CTA */}
                <div className="p-8 bg-[#FDE047] rounded-[2.5rem] border-2 border-white/50 shadow-[0_20px_50px_-10px_rgba(253,224,71,0.3)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-[40px] -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
                      <h4 className="text-[10px] font-black text-black uppercase tracking-widest">ITR DEADLINE: 31 JULY</h4>
                    </div>
                    <p className="text-black/80 text-[11px] font-black mb-8 leading-tight">2,847 people used MyeCA to file their ITR today. Ready to join them?</p>
                    <Link href="/itr/filing">
                      <Button className="w-full bg-black text-[#FDE047] hover:bg-slate-900 rounded-xl h-14 font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl group flex items-center justify-center gap-3">
                        File Your ITR Now
                        <div className="w-6 h-6 rounded-full bg-[#FDE047] text-black flex items-center justify-center group-hover:translate-x-1 transition-transform">
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </Button>
                    </Link>
                    <p className="text-black/40 text-[8px] font-black text-center mt-6 uppercase tracking-widest">Takes less than 4 minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}