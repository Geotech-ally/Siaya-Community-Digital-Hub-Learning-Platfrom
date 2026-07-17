'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Toggle';
import { Skeleton } from '@/components/ui/Skeleton';
import { settingsService, type SettingsUpdate } from '@/lib/services/settings.service';
import type { UserSettings } from '@/types';

export function UserSettingsPanel() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    settingsService
      .getMine()
      .then(setSettings)
      .catch((e) => setError(e?.response?.data?.message ?? 'Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  async function update(patch: SettingsUpdate) {
    if (!settings) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const next = await settingsService.update(patch);
      setSettings(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex max-w-2xl flex-col gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (!settings) {
    return <p className="text-sm text-danger">{error ?? 'Settings unavailable'}</p>;
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          <Toggle
            label="Email notifications"
            description="Receive platform emails (certificates, messages, announcements)."
            checked={settings.emailNotifications}
            onChange={(v) => update({ emailNotifications: v })}
          />
          <Toggle
            label="Message notifications"
            description="Get notified when a trainer or admin messages you."
            checked={settings.messageNotifications}
            onChange={(v) => update({ messageNotifications: v })}
          />
          <Toggle
            label="Course announcements"
            description="Get notified about announcements for your enrolled courses."
            checked={settings.courseAnnouncements}
            onChange={(v) => update({ courseAnnouncements: v })}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile & sharing</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          <Toggle
            label="Public profile"
            description="Allow others to see your learner profile."
            checked={settings.publicProfile}
            onChange={(v) => update({ publicProfile: v })}
          />
          <Toggle
            label="Share certificates"
            description="Allow your earned certificates to be shared publicly via a verification link."
            checked={settings.shareCertificates}
            onChange={(v) => update({ shareCertificates: v })}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <Select
            label="Theme"
            value={settings.theme}
            onChange={(e) => update({ theme: e.target.value })}
            className="sm:w-48"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
          <Select
            label="Language"
            value={settings.language}
            onChange={(e) => update({ language: e.target.value })}
            className="sm:w-48"
          >
            <option value="en">English</option>
            <option value="sw">Swahili</option>
          </Select>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        {saving && <span className="text-sm text-ink-500">Saving…</span>}
        {saved && <span className="text-sm text-success">Saved</span>}
        {error && <span className="text-sm text-danger">{error}</span>}
      </div>
    </div>
  );
}
