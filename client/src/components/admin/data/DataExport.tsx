// Data Export Component - CSV, PDF, Excel export functionality

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, File, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { exportToCSV } from '@/lib/admin/utils';

interface DataExportProps<T> {
  data: T[];
  filename?: string;
  onExport?: (format: 'csv' | 'json' | 'xlsx') => Promise<void>;
}

export function DataExport<T>({ data, filename = 'export', onExport }: DataExportProps<T>) {
  const [isExporting, setIsExporting] = useState(false);

  const handleCSVExport = async () => {
    if (onExport) {
      setIsExporting(true);
      try {
        await onExport('csv');
      } finally {
        setIsExporting(false);
      }
    } else {
      exportToCSV(data as any[], `${filename}.csv`);
    }
  };

  const handleJSONExport = () => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    if (link.parentNode) link.remove();
    URL.revokeObjectURL(url);
  };

  const handleExcelExport = async () => {
    if (onExport) {
      setIsExporting(true);
      try {
        await onExport('xlsx');
      } finally {
        setIsExporting(false);
      }
    } else {
      // Basic CSV export as fallback (Excel can open CSV)
      exportToCSV(data as any[], `${filename}.csv`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting || data.length === 0} className="gap-2">
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCSVExport}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExcelExport}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleJSONExport}>
          <File className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

