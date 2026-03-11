// Admin Breadcrumb Navigation Component

import { Link, useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface AdminBreadcrumbProps {
  items?: BreadcrumbItemType[];
}

export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  const [location] = useLocation();
  
  // Generate breadcrumb items from route if not provided
  const breadcrumbItems: BreadcrumbItemType[] = items || (() => {
    const paths = location.split('/').filter(Boolean);
    const result: BreadcrumbItemType[] = [{ label: 'Dashboard', href: '/admin' }];
    
    if (paths.length > 1 && paths[0] === 'admin') {
      paths.slice(1).forEach((path, index) => {
        const href = '/' + paths.slice(0, index + 2).join('/');
        const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
        result.push({ label, href });
      });
    }
    
    return result;
  })();

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/admin" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems.slice(1).map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 2 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href || '#'}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

