import { CalendarClock } from "lucide-react";
import { getItrDeadlineMessage, type ItrDeadlineCategory } from "./itr-deadline";

export function ItrDeadlineNotice({ category = "unknown" }: { category?: ItrDeadlineCategory }) {
  const message = getItrDeadlineMessage(category);

  return (
    <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-slate-800">
      <div className="flex items-start gap-3">
        <CalendarClock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <p className="text-sm font-black">{message.categoryLabel}: {message.dateLabel}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{message.disclaimer}</p>
        </div>
      </div>
    </aside>
  );
}
