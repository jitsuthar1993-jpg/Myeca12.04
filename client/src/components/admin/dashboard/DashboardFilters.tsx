// Dashboard Filters Component - Date Range and Filters

import { Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DATE_RANGES } from '@/lib/admin/constants';

interface DashboardFiltersProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  onRefresh?: () => void;
}

export function DashboardFilters({ dateRange, onDateRangeChange, onRefresh }: DashboardFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-md">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Filter className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          <p className="text-xs text-gray-500">Adjust time period and view options</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Select value={dateRange} onValueChange={onDateRangeChange}>
          <SelectTrigger className="w-[180px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DATE_RANGES.TODAY}>Today</SelectItem>
            <SelectItem value={DATE_RANGES.YESTERDAY}>Yesterday</SelectItem>
            <SelectItem value={DATE_RANGES.LAST_7_DAYS}>Last 7 Days</SelectItem>
            <SelectItem value={DATE_RANGES.LAST_30_DAYS}>Last 30 Days</SelectItem>
            <SelectItem value={DATE_RANGES.LAST_90_DAYS}>Last 90 Days</SelectItem>
            <SelectItem value={DATE_RANGES.THIS_MONTH}>This Month</SelectItem>
            <SelectItem value={DATE_RANGES.LAST_MONTH}>Last Month</SelectItem>
            <SelectItem value={DATE_RANGES.THIS_YEAR}>This Year</SelectItem>
            <SelectItem value={DATE_RANGES.CUSTOM}>Custom Range</SelectItem>
          </SelectContent>
        </Select>
        
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Refresh
          </Button>
        )}
      </div>
    </div>
  );
}

