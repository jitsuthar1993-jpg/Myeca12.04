import { useState } from "react";
import { Layout } from "@/components/admin/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Activity, Search, Download, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditEntry {
  action: string;
  userId?: string;
  email?: string;
  timestamp?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

const PAGE_SIZE = 50;

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/audit/logs", search, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (search.trim()) params.set("q", search.trim());
      const res = await apiRequest(`/api/audit/logs?${params}`);
      return res.json();
    },
  });

  const logs: AuditEntry[] = data?.logs || [];
  const total: number = data?.total || 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDownload = async () => {
    try {
      const res = await apiRequest("/api/audit/download");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audit.jsonl";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silently fail
    }
  };

  const formatTimestamp = (ts?: string) => {
    if (!ts) return "-";
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  };

  const getActionColor = (action?: string) => {
    if (!action) return "secondary";
    const a = action.toLowerCase();
    if (a.includes("login") || a.includes("auth")) return "default";
    if (a.includes("delete") || a.includes("remove")) return "destructive";
    if (a.includes("create") || a.includes("add")) return "default";
    if (a.includes("update") || a.includes("edit")) return "secondary";
    return "outline";
  };

  return (
    <Layout title="Audit Logs">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-blue-600" />
              Activity Log
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {total} total entries
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-red-500 gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>Failed to load audit logs</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No activity logs found</p>
                {search && <p className="text-sm mt-1">Try a different search term</p>}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Timestamp</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Action</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-600">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                            {formatTimestamp(log.timestamp)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={getActionColor(log.action) as any}>
                              {log.action || "unknown"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {log.email || log.userId || "-"}
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                            {Object.entries(log)
                              .filter(([k]) => !["action", "userId", "email", "timestamp", "ip", "userAgent"].includes(k))
                              .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
                              .join(", ") || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-500">
                      Page {page + 1} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 0}
                        onClick={() => setPage(p => p - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage(p => p + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
