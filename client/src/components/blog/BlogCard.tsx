import { Link } from "wouter";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PublicBlogSummary } from "@shared/blog";

function isImageUrl(value: string | null | undefined) {
  if (!value) return false;
  return /^(https?:\/\/|\/)/.test(value);
}

function isGeneratedBlogCover(value: string | null | undefined) {
  return Boolean(value?.includes("/assets/blog/text-covers/"));
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Draft";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Draft";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export interface BlogCardProps {
  post: PublicBlogSummary;
  variant?: "featured" | "default" | "compact";
  className?: string;
}

export default function BlogCard({ post, variant = "default", className }: BlogCardProps) {
  const featured = variant === "featured";
  const compact = variant === "compact";

  return (
    <Link href={`/blog/${post.slug}`}>
      <article
        className={cn(
          "group h-full overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1",
          featured ? "grid lg:grid-cols-[1.2fr_0.8fr] rounded-2xl" : "rounded-2xl flex flex-col",
          className,
        )}
      >
        {/* Thumbnail */}
        <div
          className={cn(
            "relative overflow-hidden shrink-0",
            featured ? "min-h-[320px] lg:min-h-[380px]" : compact ? "h-44" : "h-52",
          )}
        >
          {isImageUrl(post.coverImage) ? (
            <img
              src={post.coverImage ?? ""}
              alt={post.title}
              className={cn(
                "h-full w-full transition-transform duration-500",
                isGeneratedBlogCover(post.coverImage)
                  ? "bg-white object-contain p-2"
                  : "object-cover group-hover:scale-105",
              )}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-amber-50">
              <span className="text-5xl opacity-50">{post.coverImage || "📝"}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent pointer-events-none" />

          {/* Category badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <Badge className="rounded-full border border-white/50 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 type-meta font-semibold text-slate-700 shadow-sm">
              {post.category?.name || "Insights"}
            </Badge>
            {post.isFeatured && (
              <Badge className="rounded-full bg-blue-600/90 backdrop-blur-sm px-2.5 py-0.5 type-meta font-semibold text-white shadow-sm">
                Featured
              </Badge>
            )}
          </div>

          {/* Read time badge bottom-right */}
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-900/50 backdrop-blur-sm px-2.5 py-1 type-meta font-medium text-white">
              <Clock3 className="h-3 w-3" />
              {post.readingTimeMinutes} min
            </span>
          </div>
        </div>

        {/* Content */}
        <div className={cn(
          "flex flex-col flex-1",
          featured ? "p-7 lg:p-10" : compact ? "p-4" : "p-5",
        )}>
          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>

          {/* Title */}
          <h3
            className={cn(
              "font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700 leading-snug",
              featured ? "text-2xl lg:text-3xl" : compact ? "text-base" : "text-xl",
            )}
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && !compact && (
            <p className={cn(
              "mt-3 text-slate-500 leading-relaxed",
              featured ? "text-base" : "text-sm line-clamp-2",
            )}>
              {post.excerpt}
            </p>
          )}

          {/* Tags */}
          {!compact && post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 type-meta font-medium text-slate-500">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Author + CTA */}
          <div className={cn(
            "mt-auto flex items-center justify-between pt-4",
            !compact && "border-t border-slate-100 mt-5",
          )}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center text-white type-meta font-bold shrink-0">
                {getInitials(post.authorName)}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">{post.authorName}</p>
                {post.authorRole && !compact && (
                  <p className="type-meta text-slate-400 hidden sm:block">{post.authorRole}</p>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:gap-2 transition-all">
              Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
