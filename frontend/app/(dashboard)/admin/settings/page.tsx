'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// System-level settings placeholder. Wire each field to a corresponding
// backend endpoint (e.g. PATCH /settings) once available.
export default function AdminSettingsPage() {
  const [platformName, setPlatformName] = useState('Community LMS');
  const [supportEmail, setSupportEmail] = useState('support@communitylms.org');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // TODO: replace with settingsService.update(...)
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 500);
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
