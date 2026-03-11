// Admin Layout Component - Main wrapper for all admin pages

import { ReactNode, useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 lg:flex">
      <AdminSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Main content area */}
      <div className="flex-1 lg:ml-64">
        <AdminHeader 
          title={title}
          description={description}
          onMenuClick={() => setSidebarOpen(true)}
        />
        
        {/* Page content */}
        <main className="p-4 lg:p-8 pt-24 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

