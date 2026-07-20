'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PLATFORM_NAME } from '@/lib/brand';

// Platform details are surface-level configuration for the admin console.
// Persist via a dedicated settings endpoint when the backend exposes one.
export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState(PLATFORM_NAME);
  const [supportEmail, setSupportEmail] = useState('support@sicodihub.ac.ke');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Platform details</CardTitle>
        </CardHeader>
        <form onSubmit={save} className="flex flex-col gap-4">
          <Input label="Platform name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          <Input label="Support email" type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={saving}>
              Save changes
            </Button>
            {saved && <span className="text-sm text-success">Saved</span>}
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course departments</CardTitle>
        </CardHeader>
        <p className="text-sm text-ink-500">
          Basic ICT Skills, Design Courses, Marketing Courses, Computer Science, and Data Science and AI are fixed
          platform categories and cannot be renamed or removed here.
        </p>
      </Card>
    </div>
  );
}
