// User List Page - Advanced user management

import { useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminBreadcrumb } from '@/components/admin/layout/AdminBreadcrumb';
import { DataTable } from '@/components/admin/data/DataTable';
import { DataFilters } from '@/components/admin/data/DataFilters';
import { DataExport } from '@/components/admin/data/DataExport';
import { useUsers } from '@/hooks/admin/useUsers';
import type { User, FilterParams } from '@/lib/admin/types';
import type { Column } from '@/components/admin/data/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, User as UserIcon, Mail, Phone } from 'lucide-react';
import { formatDate, formatTimeAgo } from '@/lib/admin/utils';
import { Link } from 'wouter';

export default function UserListPage() {
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 10,
  });

  const { data: usersResponse, isLoading } = useUsers(filters);
  const users = usersResponse?.users || [];
  const pagination = usersResponse?.pagination;

  const handleRowClick = useCallback((user: User) => {
    // Navigate to user details page
    window.location.href = `/admin/users/${user.id}`;
  }, []);

  const handleEdit = useCallback((user: User) => {
    // Open edit dialog or navigate
    console.log('Edit user:', user);
  }, []);

  const handleDelete = useCallback((user: User) => {
    // Show delete confirmation and delete
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      console.log('Delete user:', user);
    }
  }, []);

  const handleExport = async (format: 'csv' | 'json' | 'xlsx') => {
    console.log(`Exporting users as ${format}`);
    // Implement export logic
  };

  const handleSelectionChange = (selected: User[]) => {
    console.log('Selected users:', selected);
  };

  const columns: Column<User>[] = [
    {
      id: 'username',
      header: 'Username',
      accessorKey: 'username',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {(row.username || row.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.username || 'System User'}</div>
            <div className="text-xs text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'name',
      header: 'Name',
      accessorKey: 'first_name',
      sortable: true,
      cell: (row) => (
        <div>
          {row.firstName || row.first_name} {row.lastName || row.last_name}
        </div>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      accessorKey: 'email',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'is_active',
      sortable: true,
      cell: (row) => (
        <Badge className={(row.is_active ?? row.status === 'active') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
          {(row.is_active ?? row.status === 'active') ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      accessorKey: 'is_admin',
      sortable: true,
      cell: (row) => (
        <Badge variant="outline">
          {row.is_admin || row.role === 'admin' ? 'Admin' : 'User'}
        </Badge>
      ),
    },
    {
      id: 'created_at',
      header: 'Created',
      accessorKey: 'created_at',
      sortable: true,
      cell: (row) => (
        <div className="text-sm text-gray-500">
          {formatTimeAgo(row.createdAt || row.created_at)}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout
      title="User Management"
      description="Manage users, roles, and permissions"
    >
      <div className="space-y-6">
        {/* Breadcrumb */}
        <AdminBreadcrumb
          items={[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Users', href: '/admin/users' },
          ]}
        />

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and monitor all platform users
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DataExport data={users} filename="users" onExport={handleExport} />
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Filters */}
        <DataFilters
          filters={filters}
          onFiltersChange={setFilters}
          searchPlaceholder="Search users..."
          showStatusFilter
          showRoleFilter
          showDateRange
        />

        {/* Users Table */}
        <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={columns}
              isLoading={isLoading}
              onRowClick={handleRowClick}
              onEdit={handleEdit}
              onDelete={handleDelete}
              pagination={
                pagination
                  ? {
                      ...pagination,
                      onPageChange: (page) => setFilters({ ...filters, page }),
                      onLimitChange: (limit) => setFilters({ ...filters, limit, page: 1 }),
                    }
                  : undefined
              }
              searchable
              selectable
              onSelectionChange={handleSelectionChange}
            />
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pagination?.total || users.length}
                  </p>
                </div>
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.is_active ?? u.status === 'active').length}
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-700">Active</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Admins</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.filter((u) => u.is_admin).length}
                  </p>
                </div>
                <Badge className="bg-purple-100 text-purple-700">Admin</Badge>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">New This Month</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">New</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
