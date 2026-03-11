// Advanced Data Filters Component

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { FilterParams } from '@/lib/admin/types';

interface DataFiltersProps {
  filters: FilterParams;
  onFiltersChange: (filters: FilterParams) => void;
  searchPlaceholder?: string;
  showDateRange?: boolean;
  showStatusFilter?: boolean;
  showRoleFilter?: boolean;
}

export function DataFilters({
  filters,
  onFiltersChange,
  searchPlaceholder = 'Search...',
  showDateRange = true,
  showStatusFilter = false,
  showRoleFilter = false,
}: DataFiltersProps) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.date_from ? new Date(filters.date_from) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.date_to ? new Date(filters.date_to) : undefined
  );

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value || undefined });
  };

  const handleRoleChange = (value: string) => {
    onFiltersChange({ ...filters, role: value || undefined });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    onFiltersChange({
      ...filters,
      date_from: date ? format(date, 'yyyy-MM-dd') : undefined,
    });
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    onFiltersChange({
      ...filters,
      date_to: date ? format(date, 'yyyy-MM-dd') : undefined,
    });
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    onFiltersChange({
      page: 1,
      limit: filters.limit || 10,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.date_from ||
    filters.date_to ||
    filters.status ||
    filters.role;

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-md">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-indigo-600" />
        <span className="text-sm font-semibold text-gray-900">Filters</span>
      </div>

      {/* Search */}
      <Input
        placeholder={searchPlaceholder}
        value={filters.search || ''}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="w-full sm:w-[200px]"
      />

      {/* Status Filter */}
      {showStatusFilter && (
        <Select value={filters.status || ''} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Role Filter */}
      {showRoleFilter && (
        <Select value={filters.role || ''} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="ca">CA</SelectItem>
          </SelectContent>
        </Select>
      )}

      {/* Date Range */}
      {showDateRange && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[200px] justify-start text-left font-normal',
                  !dateFrom && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'PPP') : <span>From Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={handleDateFromChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[200px] justify-start text-left font-normal',
                  !dateTo && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, 'PPP') : <span>To Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={handleDateToChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleSearchChange('')}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleStatusChange('')}
              />
            </Badge>
          )}
          {filters.role && (
            <Badge variant="secondary" className="gap-1">
              Role: {filters.role}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleRoleChange('')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

