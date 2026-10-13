'use client';

import { useEffect, useState } from 'react';

interface Setting {
  key: string; value: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Debounce: POST on blur, not on every keystroke (the old code fired one
  // request per character).
  const updateSetting = async (key: string, value: string) => {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) {
      setSettings(settings.map((s) => s.key === key ? { ...s, value } : s));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-extrabold text-white mb-6">Settings</h1>
      {loading ? <div className="text-center py-12 text-content-muted">Loading...</div> : (
        <div className="space-y-4 max-w-2xl">
           {settings.map((setting) => (
             <SettingRow key={setting.key} setting={setting} onSave={updateSetting} />
           ))}
        </div>
      )}
    </div>
  );
}

function SettingRow({ setting, onSave }: { setting: Setting; onSave: (key: string, value: string) => void }) {
  const [draft, setDraft] = useState(setting.value);
  return (
    <div className="rounded-2xl border border-line bg-card p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-bold text-content text-sm">{setting.key}</p>
        <p className="text-xs text-content-muted">{setting.value || 'Not set'}</p>
      </div>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { if (draft !== setting.value) onSave(setting.key, draft); }}
        className="px-3 py-2 border border-border rounded-lg text-sm bg-card text-content w-96"
      />
    </div>
  );
}
