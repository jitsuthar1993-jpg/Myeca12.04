import { useState } from 'react';
import { Link } from 'wouter';
import { MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';

type FeedbackValue = 'up' | 'down';

const FEEDBACK_STORAGE_PREFIX = 'myeca:blog-feedback:';

function readStoredFeedback(slug: string): FeedbackValue | null {
  try {
    const raw = localStorage.getItem(`${FEEDBACK_STORAGE_PREFIX}${slug}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { value?: string };
    return parsed.value === 'up' || parsed.value === 'down' ? parsed.value : null;
  } catch {
    return null;
  }
}

function storeFeedback(slug: string, value: FeedbackValue) {
  try {
    localStorage.setItem(
      `${FEEDBACK_STORAGE_PREFIX}${slug}`,
      JSON.stringify({ value, at: new Date().toISOString() })
    );
  } catch {
    // Storage unavailable (private mode) — feedback still records for this view.
  }
}

function trackBlogFeedback(slug: string, value: FeedbackValue) {
  if (typeof window === 'undefined') return;

  void import('@/telemetry/browser')
    .then(({ captureTelemetryEvent }) => {
      captureTelemetryEvent('blog_feedback', { slug, value });
    })
    .catch(() => undefined);
}

export function BlogFeedback({ slug, hasRelated = false }: { slug: string; hasRelated?: boolean }) {
  const [feedback, setFeedback] = useState<FeedbackValue | null>(() => readStoredFeedback(slug));

  const submitFeedback = (value: FeedbackValue) => {
    if (feedback) return;
    setFeedback(value);
    storeFeedback(slug, value);
    trackBlogFeedback(slug, value);
  };

  const scrollToRelated = () => {
    const el = document.getElementById('related-reading');
    if (!el) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - 108,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section
      aria-label="Article feedback"
      className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-base font-bold text-slate-950">Was this guide helpful?</p>
        <div className="flex items-center gap-2" role="group" aria-label="Rate this guide">
          <button
            type="button"
            onClick={() => submitFeedback('up')}
            disabled={Boolean(feedback)}
            aria-pressed={feedback === 'up'}
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              feedback === 'up'
                ? 'border-emerald-600 bg-emerald-600 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50'
            )}
          >
            <ThumbsUp className="h-4 w-4" aria-hidden="true" />
            Yes
          </button>
          <button
            type="button"
            onClick={() => submitFeedback('down')}
            disabled={Boolean(feedback)}
            aria-pressed={feedback === 'down'}
            className={cn(
              'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
              feedback === 'down'
                ? 'border-slate-700 bg-slate-700 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 disabled:opacity-50'
            )}
          >
            <ThumbsDown className="h-4 w-4" aria-hidden="true" />
            No
          </button>
        </div>
      </div>

      <div aria-live="polite">
        {feedback === 'up' && (
          <p className="mt-4 text-sm font-semibold text-emerald-700">
            Thanks for the feedback — it helps us keep these guides sharp.
          </p>
        )}
        {feedback === 'down' && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-700">
              Thanks — sorry this guide didn't fully answer your case. Two faster routes:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/expert-consultation?service=blog-feedback">
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  Ask a CA directly
                </span>
              </Link>
              {hasRelated ? (
                <button
                  type="button"
                  onClick={scrollToRelated}
                  className="inline-flex min-h-10 items-center rounded-full border border-blue-200 bg-white px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                >
                  See related guides
                </button>
              ) : (
                <Link href="/blog">
                  <span className="inline-flex min-h-10 items-center rounded-full border border-blue-200 bg-white px-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
                    Browse more guides
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default BlogFeedback;
