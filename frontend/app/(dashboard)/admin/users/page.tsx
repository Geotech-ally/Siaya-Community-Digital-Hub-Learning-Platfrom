'use client';

import { useEffect, useState } from 'react';
import { Search, UserPlus, UserX, UserCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Thead, Tr, Th, Td } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { usersService } from '@/lib/services/users.service';
import { useDebounce } from '@/common/hooks/useDebounce';
import type { Role, User } from '@/types';
import { formatDate } from '@/common/utils/format';

const roleTone: Record<Role, 'brand' | 'success' | 'default'> = {
  ADMIN: 'brand',
  TRAINER: 'success',
  LEARNER: 'default',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 350);

  async function load() {
    setLoading(true);
    try {
      const res = await usersService.list({
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        page: 1,
        pageSize: 50,
      });
      setUsers(res.data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, roleFilter]);

  async function toggleActive(user: User) {
    const updated = user.isActive
      ? await usersService.deactivate(user.id)
      : await usersService.activate(user.id);
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
            <Input
              placeholder="Search by name or email"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | '')} className="w-40">
            <option value="">All roles</option>
            <option value="ADMIN">Admin</option>
            <option value="TRAINER">Trainer</option>
            <option value="LEARNER">Learner</option>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <UserPlus className="h-4 w-4" /> Add user
        </Button>
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="space-y-2 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={UserPlus} title="No users found" description="Try adjusting filters or add a new user." />
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Joined</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <tbody>
              {users.map((u) => (
                <Tr key={u.id}>
                  <Td className="font-medium text-ink-900">{u.fullName}</Td>
                  <Td>{u.email}</Td>
                  <Td>
                    <Badge tone={roleTone[u.role]}>{u.role}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Deactivated'}</Badge>
                  </Td>
                  <Td>{formatDate(u.createdAt)}</Td>
                  <Td>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(u)}>
                      {u.isActive ? (
                        <>
                          <UserX className="h-4 w-4" /> Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-4 w-4" /> Activate
                        </>
                      )}
                    </Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(user) => {
          setUsers((prev) => [user, ...prev]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function CreateUserModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (user: User) => void;
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('LEARNER');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await usersService.create({ fullName, email, password, role });
      onCreated(user);
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('LEARNER');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Could not create the user.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add user">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          label="Temporary password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="LEARNER">Learner</option>
          <option value="TRAINER">Trainer</option>
          <option value="ADMIN">Admin</option>
        </Select>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" isLoading={submitting} className="mt-2">
          Create user
        </Button>
      </form>
    </Modal>
  );
}
