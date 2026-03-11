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

  const users = (usersResponse?.data?.users as User[]) || [];
  const pagination = usersResponse?.data?.pagination;

  const columns = [
    {
      key: 'username',
      header: 'User',
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{user.username}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
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
          {user.first_name} {user.last_name}
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (user: User) => (
        <Badge className={user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
          {user.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'is_admin',
      header: 'Role',
      render: (user: User) => (
        <Badge variant="outline">{user.is_admin ? 'Admin' : 'User'}</Badge>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      render: (user: User) => (
        <div className="text-sm text-gray-500">{formatTimeAgo(user.created_at)}</div>
      ),
    },
  ];

  return (
    <Layout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            <p className="text-sm text-gray-500 mt-1">Manage platform users</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
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
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.is_active).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter((u) => u.is_admin).length}
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

