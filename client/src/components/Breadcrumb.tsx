import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'wouter';
import StructuredData from '@/components/StructuredData';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbData = {
    items: [
      { name: 'Home', url: 'https://myeca.in' },
      ...items.map((item, index) => ({
        name: item.name,
        url: item.href ? `https://myeca.in${item.href}` : `https://myeca.in${window.location.pathname}`
      }))
    ]
  };

  return (
    <>
      <StructuredData type="BreadcrumbList" data={breadcrumbData} />
    </>
  );
}