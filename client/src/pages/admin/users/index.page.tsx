// User Management Page - Simple and Clean

import { useState } from 'react';
import { Layout } from '@/components/admin/Layout';
import { DataTable } from '@/components/admin/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUsers } from '@/hooks/admin/useUsers';
import type { User } from '@/lib/admin/types';
import { formatTimeAgo } from '@/lib/admin/utils';
import { Mail, User as UserIcon } from 'lucide-react';

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { data: usersResponse, isLoading } = useUsers({ page, limit: 10, search });

  const users = usersResponse?.users || [];
  const pagination = usersResponse?.pagination;

  const columns = [
    {
      key: 'username',
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {(user.username || user.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-slate-900">{user.username || 'System User'}</div>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email || 'no-email@myeca.in'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (user: User) => (
        <div>
          {user.firstName} {user.lastName}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => (
        <Badge className={user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
          {user.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <Badge variant="outline">{user.role}</Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user: User) => (
        <div className="text-sm text-slate-500">{formatTimeAgo(user.createdAt)}</div>
      ),
    },
  ];

  return (
    <Layout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Users</h2>
            <p className="text-sm text-slate-500 mt-1">Manage platform users</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {pagination?.total || users.length}
                  </p>
                </div>
                <UserIcon className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.status === 'active').length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-slate-600">Admins</p>
                <p className="text-2xl font-bold text-slate-900">
                  {users.filter((u) => u.role === 'admin').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={users}
              columns={columns}
              isLoading={isLoading}
              searchable
              pagination={
                pagination
                  ? {
                      page: pagination.page,
                      limit: pagination.limit,
                      total: pagination.total,
                      onPageChange: setPage,
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

