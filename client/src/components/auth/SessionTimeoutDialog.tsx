import { AlertTriangle, Clock, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SessionTimeoutDialogProps {
  open: boolean;
  countdownSeconds: number;
  onStaySignedIn: () => void;
  onLogout: () => void;
}

export function SessionTimeoutDialog({
  open,
  countdownSeconds,
  onStaySignedIn,
  onLogout,
}: SessionTimeoutDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md rounded-[28px]"
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <DialogTitle className="text-2xl font-black text-slate-950">
            Your session is about to end
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            For your security, MyeCA automatically signs you out after 15 minutes of inactivity.
            Drafts and local filing progress are preserved before logout.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5" />
            <div>
              <p className="font-black">Auto logout in {countdownSeconds}s</p>
              <p className="text-sm">Choose “Stay signed in” to refresh your Clerk session.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button onClick={onStaySignedIn} className="bg-[#315efb] text-white hover:bg-[#082a5c]">
            <RefreshCw className="h-4 w-4" />
            Stay signed in
          </Button>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
            Logout now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
