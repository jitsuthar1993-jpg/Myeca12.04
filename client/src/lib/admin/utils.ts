// Admin Dashboard Utilities

import { format, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';

/**
 * Format currency in Indian Rupees
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with locale-specific formatting
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatStr: string = 'dd MMM yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch {
    return date.toString();
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(dateObj);
  } catch {
    return date.toString();
  }
}

/**
 * Get date range from preset
 */
export function getDateRange(range: string): { from: Date; to: Date } | null {
  const now = new Date();
  const today = startOfDay(now);
  
  switch (range) {
    case 'today':
      return { from: today, to: endOfDay(now) };
    case 'yesterday':
      const yesterday = subDays(today, 1);
      return { from: yesterday, to: endOfDay(yesterday) };
    case '7d':
      return { from: subDays(today, 7), to: endOfDay(now) };
    case '30d':
      return { from: subDays(today, 30), to: endOfDay(now) };
    case '90d':
      return { from: subDays(today, 90), to: endOfDay(now) };
    case 'this_month':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) };
    case 'last_month':
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { from: lastMonth, to: endOfDay(lastMonthEnd) };
    case 'this_year':
      return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(now) };
    default:
      return null;
  }
}

/**
 * Calculate growth percentage
 */
export function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'healthy':
    case 'success':
      return 'text-green-600 bg-green-100';
    case 'inactive':
    case 'warning':
      return 'text-yellow-600 bg-yellow-100';
    case 'critical':
    case 'error':
    case 'suspended':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string = 'export.csv'): void {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  if (link.parentNode) link.remove();
}

