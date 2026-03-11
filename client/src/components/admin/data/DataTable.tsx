// Advanced Data Table Component for Admin

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Download,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface Column<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
  };
  searchable?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selected: T[]) => void;
}

export function DataTable<T extends { id: number | string }>({
  data,
  columns,
  isLoading = false,
  onRowClick,
  onEdit,
  onDelete,
  pagination,
  searchable = true,
  selectable = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Search filter
    if (search && searchable) {
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          if (col.accessorKey) {
            const value = row[col.accessorKey];
            return value?.toString().toLowerCase().includes(search.toLowerCase());
          }
          return false;
        })
      );
    }

    // Sort
    if (sortColumn) {
      const column = columns.find((col) => col.id === sortColumn);
      if (column?.sortable && column.accessorKey) {
        filtered.sort((a, b) => {
          const aVal = a[column.accessorKey!];
          const bVal = b[column.accessorKey!];
          const compare = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return sortDirection === 'asc' ? compare : -compare;
        });
      }
    }

    return filtered;
  }, [data, search, sortColumn, sortDirection, columns, searchable]);

  // Handle sorting
  const handleSort = (columnId: string) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  // Handle row selection
  const handleSelectRow = (rowId: string | number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    if (onSelectionChange) {
      onSelectionChange(data.filter((row) => newSelected.has(row.id)));
    }
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    } else {
      const newSelected = new Set(filteredData.map((row) => row.id));
      setSelectedRows(newSelected);
      if (onSelectionChange) {
        onSelectionChange(filteredData);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === filteredData.length && filteredData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column.id}>
                  {column.sortable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 -ml-3 hover:bg-transparent"
                      onClick={() => handleSort(column.id)}
                    >
                      {column.header}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {(onEdit || onDelete) && (
                <TableHead className="w-12"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (onEdit || onDelete ? 1 : 0)}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (onEdit || onDelete ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow
                  key={row.id}
                  className={cn(
                    onRowClick && 'cursor-pointer hover:bg-gray-50',
                    selectedRows.has(row.id) && 'bg-blue-50'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(row.id)}
                        onCheckedChange={() => handleSelectRow(row.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {column.cell
                        ? column.cell(row)
                        : column.accessorKey
                        ? String(row[column.accessorKey] ?? '')
                        : '-'}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete) && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(row)}>
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(row)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => pagination.onLimitChange(Number(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}

