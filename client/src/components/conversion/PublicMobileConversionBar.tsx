import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { trackPublicCtaClick } from "@/lib/public-conversion-events";

export default function PublicMobileConversionBar() {
  return (
    <nav
      aria-label="Public conversion actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_-18px_rgba(15,23,42,0.45)] backdrop-blur md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-[1fr_1fr] gap-2">
        <Link
          href="/itr/start?source=public_mobile_sticky_bar"
          onClick={() => trackPublicCtaClick("Start ITR Filing", "public_mobile_sticky_bar")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-black text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
        >
          Start ITR
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/expert-consultation?service=itr-filing&source=public_mobile_sticky_bar"
          onClick={() => trackPublicCtaClick("Talk to Expert", "public_mobile_sticky_bar")}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-black text-blue-700 transition hover:bg-blue-100"
        >
          <MessageCircle className="h-4 w-4" />
          Talk to Expert
        </Link>
      </div>
    </nav>
  );
}
