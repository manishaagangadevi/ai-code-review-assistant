'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { AiProvider } from '@/types';
import { Plus, Trash2, Star, Settings } from 'lucide-react';

const PRESET_PROVIDERS = [
  { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', modelName: 'gpt-4o' },
  { name: 'LM Studio', baseUrl: 'http://localhost:1234/v1', modelName: 'local-model' },
  { name: 'Ollama', baseUrl: 'http://localhost:11434/v1', modelName: 'codellama' },
  { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', modelName: 'openai/gpt-4o' },
];

export default function SettingsPage() {
  const [providers, setProviders] = useState<AiProvider[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', baseUrl: '', apiKey: '', modelName: '', isDefault: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProviders(); }, []);

  const fetchProviders = async () => {
    const res = await api.get('/ai-providers');
    setProviders(res.data);
  };

  const applyPreset = (preset: any) => {
    setForm(f => ({ ...f, ...preset }));
  };

  const saveProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/ai-providers', form);
      setForm({ name: '', baseUrl: '', apiKey: '', modelName: '', isDefault: false });
      setShowAdd(false);
      fetchProviders();
    } finally {
      setSaving(false);
    }
  };

  const deleteProvider = async (id: string) => {
    if (!confirm('Delete this provider?')) return;
    await api.delete(`/ai-providers/${id}`);
    fetchProviders();
  };

  const setDefault = async (id: string) => {
    await api.patch(`/ai-providers/${id}`, { isDefault: true });
    fetchProviders();
  };

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Configure your AI providers</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2"><Settings size={18} /> AI Providers</h2>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
            <Plus size={16} /> Add Provider
          </button>
        </div>

        {showAdd && (
          <form onSubmit={saveProvider} className="bg-gray-800 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex gap-2 flex-wrap mb-2">
              {PRESET_PROVIDERS.map(p => (
                <button key={p.name} type="button" onClick={() => applyPreset(p)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                  {p.name}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" placeholder="OpenAI" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Model Name</label>
                <input value={form.modelName} onChange={e => setForm(f => ({ ...f, modelName: e.target.value }))} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" placeholder="gpt-4o" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Base URL</label>
              <input value={form.baseUrl} onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))} required className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" placeholder="https://api.openai.com/v1" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">API Key (optional for local models)</label>
              <input value={form.apiKey} onChange={e => setForm(f => ({ ...f, apiKey: e.target.value }))} type="password" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" placeholder="sk-..." />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="rounded" />
              <label htmlFor="isDefault" className="text-gray-300 text-sm">Set as default provider</label>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAdd(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm transition-colors">{saving ? 'Saving...' : 'Save Provider'}</button>
            </div>
          </form>
        )}

        {providers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">No providers configured. Add one to get started.</div>
        ) : (
          <div className="space-y-3">
            {providers.map(provider => (
              <div key={provider.id} className={`flex items-center justify-between p-4 rounded-xl border ${provider.isDefault ? 'border-blue-500/50 bg-blue-500/5' : 'border-gray-700 bg-gray-800'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{provider.name}</span>
                    {provider.isDefault && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{provider.baseUrl} · {provider.modelName}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!provider.isDefault && (
                    <button onClick={() => setDefault(provider.id)} className="text-gray-400 hover:text-yellow-400 transition-colors" title="Set as default">
                      <Star size={16} />
                    </button>
                  )}
                  <button onClick={() => deleteProvider(provider.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}