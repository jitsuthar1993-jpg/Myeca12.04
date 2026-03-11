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
      <nav aria-label="Breadcrumb" className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <ol className="flex items-center space-x-2 py-3 text-sm">
            <li>
              <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                <Home className="w-4 h-4" />
                <span className="sr-only">Home</span>
              </Link>
            </li>
            {items.map((item, index) => (
              <li key={index} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                {item.href ? (
                  <Link href={item.href} className="text-gray-600 hover:text-blue-600 transition-colors">
                    {item.name}
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium">{item.name}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </nav>
    </>
  );
}