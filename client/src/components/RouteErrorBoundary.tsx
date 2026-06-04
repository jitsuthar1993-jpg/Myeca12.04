import { type ReactNode } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorBoundary from "@/components/ErrorBoundary";

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

function RouteErrorFallback() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
          <CardTitle>This page hit an error</CardTitle>
          <CardDescription>
            The rest of the app is still working. You can try this page again, head back,
            or pick another destination from the navigation above.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-slate-600">
          If this keeps happening, please contact support so the team can take a look.
        </CardContent>
        <CardFooter className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button onClick={() => setLocation("/")}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

/**
 * A per-route error boundary that:
 *   - Replaces only the page content (not the surrounding header/footer/chrome).
 *   - Resets automatically when the URL changes — re-keyed by `useLocation()` so
 *     navigating away from a broken route lets the boundary remount cleanly without
 *     needing the user to retry inside the error UI.
 *   - Delegates the actual error capture + Sentry reporting + offline detection to
 *     the existing ErrorBoundary component; only the fallback UI is route-shaped.
 *
 * Place this inside the route Switch, not outside it, so the app chrome stays alive
 * when one route's render throws.
 */
export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  const [location] = useLocation();

  return (
    <ErrorBoundary key={location} fallback={<RouteErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}

export default RouteErrorBoundary;
