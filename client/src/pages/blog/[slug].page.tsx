import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "wouter";
import { Calendar, ArrowLeft, Clock, Eye, Printer, BookOpen, ArrowRight, ChevronRight, Home, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ShareButtons from "@/components/ShareButtons";
import { Loader2 } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

// Parse inline bold **text**
const formatInline = (text: string, keyPrefix: string = '') => {
  return text.split('**').map((part, i) =>
    i % 2 === 1
      ? <strong key={`${keyPrefix}-b${i}`} style={{ fontWeight: 600, color: '#111827' }}>{part}</strong>
      : part
  );
};

const formatContent = (content: string, title?: string) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentTableRows: React.ReactNode[] = [];
  let currentBlockquoteLines: string[] = [];
  let skippedFirstH1 = false;

  const flushTable = (index: number) => {
    if (currentTableRows.length > 0) {
      elements.push(
        <div key={`table-${index}`} className="my-6 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            <tbody>{currentTableRows}</tbody>
          </table>
        </div>
      );
      currentTableRows = [];
    }
  };

  const flushBlockquote = (index: number) => {
    if (currentBlockquoteLines.length > 0) {
      const bqElements: React.ReactNode[] = [];
      currentBlockquoteLines.forEach((bqLine, bi) => {
        const text = bqLine.replace(/^>\s?/, '');
        if (text.startsWith('- ') || text.startsWith('* ')) {
          bqElements.push(
            <li key={`bq-${index}-${bi}`} className="flex gap-3" style={{ marginBottom: '12px' }}>
              <span style={{ color: '#0066ff', fontSize: '20px', lineHeight: 1, marginTop: '2px', flexShrink: 0 }}>•</span>
              <span style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#374151' }}>{formatInline(text.substring(2), `bq-${index}-${bi}`)}</span>
            </li>
          );
        } else if (text.trim() === '') {
          // skip empty blockquote lines
        } else {
          bqElements.push(
            <p key={`bq-${index}-${bi}`} style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#374151', marginBottom: '12px' }}>
              {formatInline(text, `bq-${index}-${bi}`)}
            </p>
          );
        }
      });
      elements.push(
        <div key={`blockquote-${index}`} style={{ background: '#f8f9ff', borderLeft: '5px solid #0066ff', padding: '1.5rem', margin: '2rem 0' }}>
          {bqElements}
        </div>
      );
      currentBlockquoteLines = [];
    }
  };

  lines.forEach((line, index) => {
    const isTableLine = line.includes('|') && line.split('|').length > 2;
    const isBlockquote = line.startsWith('> ') || line === '>';

    if (!isBlockquote && currentBlockquoteLines.length > 0) flushBlockquote(index);

    if (isBlockquote) {
      flushTable(index);
      currentBlockquoteLines.push(line);
    } else if (isTableLine) {
      const nextLineIsSeparator = index < lines.length - 1 && lines[index + 1].includes('---');
      const isSeparatorRow = line.includes('---');
      if (!isSeparatorRow) {
        const cells = line.split('|').map(c => c.trim()).filter((c, i) => !(i === 0 && line.startsWith('|') && c === "") && !(i === line.split('|').length - 1 && line.endsWith('|') && c === ""));
        const isHeader = nextLineIsSeparator;
        currentTableRows.push(
          <tr key={`row-${index}`} className={isHeader ? 'bg-gray-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
            {cells.map((cell, i) => (
              isHeader ? (
                <th key={i} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">{cell}</th>
              ) : (
                <td key={i} className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{formatInline(cell, `td-${index}-${i}`)}</td>
              )
            ))}
          </tr>
        );
      }
    } else {
      flushTable(index);

      if (line.startsWith('# ')) {
        const headerText = line.substring(2).trim();
        if (!skippedFirstH1 && (headerText === title || index < 5)) { skippedFirstH1 = true; return; }
        elements.push(<h1 key={index} id={`h-${index}`} className="scroll-mt-28" style={{ fontSize: '2.25rem', lineHeight: 1.2, fontWeight: 700, color: '#111827', marginTop: '3rem', marginBottom: '1rem' }}>{headerText}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={index} id={`h-${index}`} className="scroll-mt-28" style={{ fontSize: '1.75rem', lineHeight: 1.3, fontWeight: 600, color: '#111827', marginTop: '3rem', marginBottom: '1rem' }}>{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={index} id={`h-${index}`} className="scroll-mt-28" style={{ fontSize: '1.35rem', lineHeight: 1.4, fontWeight: 600, color: '#111827', marginTop: '2rem', marginBottom: '0.75rem' }}>{line.substring(4)}</h3>);
      }
      // Unordered lists
      else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#374151', marginBottom: '8px', marginLeft: '1.5rem', listStyleType: 'disc' }}>
            {formatInline(line.substring(2), `li-${index}`)}
          </li>
        );
      }
      // Ordered lists
      else if (/^\d+\.\s/.test(line)) {
        elements.push(
          <li key={index} style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#374151', marginBottom: '8px', marginLeft: '1.5rem', listStyleType: 'decimal' }}>
            {formatInline(line.replace(/^\d+\.\s/, ""), `ol-${index}`)}
          </li>
        );
      }
      else if (line.trim() === '') {
        if (elements.length > 0) elements.push(<div key={index} style={{ height: '8px' }} />);
      }
      // Paragraphs
      else {
        elements.push(<p key={index} style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#374151', marginBottom: '1.25rem' }}>{formatInline(line, `p-${index}`)}</p>);
      }
    }
  });

  flushBlockquote(lines.length);
  flushTable(lines.length);
  return <div>{elements}</div>;
};

export default function BlogPostPage() {
  const { slug } = useParams();
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeTocId, setActiveTocId] = useState<string>("");

  const { data: postData, isLoading } = useQuery({
    queryKey: ["public-blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/public/blogs/${slug}`);
      if (!res.ok) { if (res.status === 404) return null; throw new Error("Failed to fetch blog post"); }
      const data = await res.json() as { post: any };
      return data.post;
    },
  });

  const post = postData;

  const { data: allPostsData } = useQuery({
    queryKey: ["public-blogs"],
    queryFn: async () => {
      const res = await fetch("/api/public/blogs");
      if (!res.ok) return { posts: [] };
      return await res.json() as { posts: any[] };
    },
    enabled: !!post,
  });

  const relatedPosts = allPostsData?.posts
    ? allPostsData.posts.filter((p: any) => p.slug !== slug && p.category === post?.category).slice(0, 3)
    : [];

  useEffect(() => {
    if (post && contentRef.current) {
      const headers = contentRef.current.querySelectorAll("h2, h3");
      const tocItems: TocItem[] = Array.from(headers).map((header, index) => {
        const text = header.textContent || "";
        const id = text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-") + "-" + index;
        header.id = id;
        return { id, text, level: parseInt(header.tagName.substring(1)) };
      });
      setToc(tocItems);
    }
  }, [post]);

  // IntersectionObserver to highlight active TOC item on scroll
  useEffect(() => {
    if (toc.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
    );
    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  const formatDate = (dateObj: any) => {
    try {
      let date: Date;
      if (dateObj?._seconds) date = new Date(dateObj._seconds * 1000);
      else if (dateObj?.toDate) date = dateObj.toDate();
      else date = new Date(dateObj);
      return isNaN(date.getTime()) ? "No Date" : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return "No Date"; }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 text-[#0066ff] animate-spin mb-3" />
        <p className="text-gray-500 text-sm">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center p-12 max-w-md">
          <BookOpen className="w-12 h-12 mx-auto mb-5 text-gray-300" />
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">Article Not Found</h1>
          <p className="text-gray-500 mb-6">This article might have been moved or removed.</p>
          <Link href="/blog">
            <button className="text-white font-semibold px-8 py-3 rounded-2xl text-sm" style={{ background: 'linear-gradient(90deg, #0066ff, #0052cc)' }}>
              Back to Knowledge Hub
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const tagsArray = post.tags ? (typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags) : [];

  // Browse by topics — static list of popular topics
  const browseTopics = [
    { label: "Income Tax e-Filing", href: "/blog" },
    { label: "Income Tax Slabs FY 2025-26", href: "/blog" },
    { label: "How To File ITR", href: "/blog" },
    { label: "Which ITR Should I File", href: "/blog" },
    { label: "Last Date To File ITR For 2025-26", href: "/blog" },
    { label: "Old vs New Tax Regime", href: "/blog" },
    { label: "HRA Exemption Guide", href: "/blog" },
    { label: "Section 80C Deductions", href: "/blog" },
    { label: "Capital Gains Tax", href: "/blog" },
    { label: "GST Registration", href: "/blog" },
    { label: "TDS on Salary", href: "/blog" },
    { label: "Tax Saving Tips", href: "/blog" },
  ];

  // All posts for "Browse by topics" (use actual posts if available)
  const allPosts = allPostsData?.posts || [];
  const topicLinks = allPosts.length > 0
    ? allPosts.filter((p: any) => p.slug !== slug).slice(0, 12).map((p: any) => ({ label: p.title, href: `/blog/${p.slug}` }))
    : browseTopics;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
      <MetaSEO
        title={`${post.title} | MyeCA.in Knowledge Hub`}
        description={post.excerpt}
        keywords={tagsArray}
        type="article"
      />

      {/* Print Header — only visible when printing */}
      <div className="print-header" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #0066ff', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/myeca_logo.png" alt="MyeCA" style={{ height: '32px', filter: 'none' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <div>
            <p style={{ fontSize: '16pt', fontWeight: 700, color: '#000', margin: 0, lineHeight: 1.2 }}>MyeCA.in</p>
            <p style={{ fontSize: '8pt', color: '#666', margin: 0 }}>Smart Tax Solutions</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '8pt', color: '#666', margin: 0 }}>www.myeca.in</p>
          <p style={{ fontSize: '8pt', color: '#666', margin: 0 }}>support@myeca.in</p>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="blog-layout max-w-[1400px] mx-auto px-4 pt-6 pb-16">
        <div className="flex gap-0">

          {/* LEFT SIDEBAR — Sticky TOC (ClearTax "Index") */}
          <aside className="blog-sidebar hidden xl:block shrink-0" style={{ width: '240px' }}>
            <div className="sticky" style={{ top: '80px' }}>
              <h3 className="text-[#0066ff] font-semibold text-base mb-4 px-3">Index</h3>
              <nav className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 140px)', scrollbarWidth: 'thin' }}>
                {toc.length > 0 ? toc.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const el = document.getElementById(item.id);
                      if (el) window.scrollTo({ top: el.offsetTop - 90, behavior: "smooth" });
                    }}
                    className="w-full text-left block transition-all text-sm hover:text-[#0066ff]"
                    style={{
                      padding: '10px 12px',
                      paddingLeft: item.level === 3 ? '28px' : '12px',
                      color: activeTocId === item.id ? '#0066ff' : '#374151',
                      fontWeight: activeTocId === item.id ? 600 : 400,
                      backgroundColor: activeTocId === item.id ? '#EBF4FF' : 'transparent',
                      borderLeft: activeTocId === item.id ? '3px solid #0066ff' : '3px solid transparent',
                      lineHeight: 1.4,
                      fontSize: item.level === 3 ? '13px' : '14px',
                    }}
                  >
                    {item.text}
                  </button>
                )) : (
                  <p className="text-sm text-gray-400 px-3">Loading...</p>
                )}
              </nav>
            </div>
          </aside>

          {/* CENTER — Main Article Content */}
          <div className="blog-content-center flex-1 min-w-0 max-w-[860px] mx-auto px-4 lg:px-8">

            {/* Breadcrumbs */}
            <nav className="blog-breadcrumbs flex items-center gap-1.5 text-sm flex-wrap mb-6">
              <Link href="/" className="text-[#0066ff] hover:underline font-medium">Home</Link>
              <span className="text-gray-400 mx-1">&gt;</span>
              <Link href="/blog" className="text-[#0066ff] hover:underline font-medium">{post.category}</Link>
              <span className="text-gray-400 mx-1">&gt;</span>
              <span className="text-gray-500 truncate max-w-[300px]">{post.title}</span>
            </nav>

            {/* Article Title */}
            <h1 style={{ fontSize: '2.25rem', lineHeight: 1.2, fontWeight: 700, color: '#111827' }}>
              {post.title}
            </h1>

            {/* Meta / Byline — compact */}
            <div className="blog-byline mt-4 flex flex-wrap items-center justify-between border-b border-gray-200 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#0066ff] flex items-center justify-center text-white font-semibold text-xs shrink-0 overflow-hidden">
                  <img
                    src="/contributor_logo.png"
                    alt="Author"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.textContent = (post.author?.firstName?.charAt(0) || 'M') + (post.author?.lastName?.charAt(0) || '');
                    }}
                  />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{post.author?.firstName || "Team"} {post.author?.lastName || "MyeCA"}</span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>·</span>
                <span className="flex items-center gap-1" style={{ fontSize: '12px', color: '#6b7280' }}>
                  <Calendar className="w-3 h-3" /> {formatDate(post.createdAt)}
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>·</span>
                <span className="flex items-center gap-1" style={{ fontSize: '12px', color: '#6b7280' }}>
                  <Clock className="w-3 h-3" /> {post.readTime || "5 min read"}
                </span>
              </div>
              <div className="blog-share-actions flex items-center gap-2">
                <ShareButtons title={post.title} />
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                  style={{ borderRadius: '5px' }}
                >
                  <Printer className="w-3 h-3" /> Print
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div ref={contentRef} className="mt-8">
              {formatContent(post.content, post.title)}
            </div>

            {/* Inline CTA */}
            <div className="blog-cta-inline my-10 flex justify-center">
              <Link href="/itr/filing">
                <button
                  className="text-white font-semibold px-8 py-4 rounded-2xl text-lg flex items-center gap-3 shadow-lg transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(90deg, #0066ff, #0052cc)' }}
                >
                  Talk to a CA About This Topic
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>

            {/* Author Section */}
            <div className="blog-author-card mt-10 rounded-2xl border border-gray-200 bg-gray-50/50 p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-[#0066ff] font-bold text-lg shrink-0 overflow-hidden">
                  <img
                    src="/contributor_logo.png"
                    alt="Author"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.textContent = (post.author?.firstName?.charAt(0) || 'A') + (post.author?.lastName?.charAt(0) || '');
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">{post.author?.firstName || "Team"} {post.author?.lastName || "MyeCA"}</p>
                  <p className="text-gray-500 text-sm mb-2">Chartered Accountant</p>
                  <p className="text-gray-600 text-base leading-relaxed">
                    Expert CA specializing in Indian taxation, corporate strategy, and financial planning.
                  </p>
                </div>
              </div>
            </div>

            {/* Related Articles */}
            {relatedPosts.length > 0 && (
              <div className="blog-related-articles mt-12">
                <h3 className="text-xl font-semibold text-gray-900 mb-5">Related Articles</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {relatedPosts.map((rp: any) => (
                    <Link key={rp.id} href={`/blog/${rp.slug}`}>
                      <div className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                        <p className="text-xs font-semibold text-[#0066ff] mb-2">{rp.category}</p>
                        <h4 className="text-base font-semibold text-gray-900 leading-snug mb-3 line-clamp-2 group-hover:text-[#0066ff] transition-colors">
                          {rp.title}
                        </h4>
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {rp.readTime || "5 min read"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Final CTA Banner */}
            <div className="blog-cta-banner mt-14 rounded-3xl p-10 text-center text-white" style={{ background: 'linear-gradient(90deg, #0066ff, #0044aa)' }}>
              <p className="mb-3 text-2xl font-semibold">Need expert help on this topic?</p>
              <p className="text-blue-100 mb-6 text-base">Our Chartered Accountants can help you navigate the complexities.</p>
              <Link href="/contact">
                <button className="inline-block bg-white text-[#0066ff] px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition-all hover:-translate-y-0.5 shadow-lg">
                  Talk to an Expert
                </button>
              </Link>
            </div>

            {/* Print Footer — only visible when printing */}
            <div className="print-footer" style={{ display: 'none', borderTop: '2px solid #0066ff', paddingTop: '10px', marginTop: '24px', fontSize: '9pt', color: '#666', textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px' }}>
                <strong style={{ color: '#000' }}>MyeCA.in</strong> — Smart Tax Solutions | India's Trusted CA Platform
              </p>
              <p style={{ margin: 0 }}>
                www.myeca.in | support@myeca.in | +91-XXXX-XXXXXX
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '7pt', color: '#999' }}>
                This article is for informational purposes only. Consult a qualified CA for personalized advice.
              </p>
            </div>

            {/* Back Button */}
            <div className="blog-back-button mt-10 text-center">
              <Link href="/blog">
                <button className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors group">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Knowledge Hub
                </button>
              </Link>
            </div>
          </div>

          {/* RIGHT SIDEBAR — "Browse by topics" (sticky) */}
          <aside className="blog-sidebar hidden xl:block shrink-0" style={{ width: '240px' }}>
            <div className="sticky" style={{ top: '80px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid #0066ff' }}>Browse by topics</h3>
              <nav className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)', scrollbarWidth: 'thin' }}>
                {topicLinks.map((topic, i) => (
                  <Link key={i} href={topic.href}>
                    <div
                      className="group cursor-pointer"
                      style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}
                    >
                      <p
                        className="hover:text-[#0066ff] transition-colors"
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#374151',
                          lineHeight: 1.4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {topic.label}
                      </p>
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
