'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Project } from '@/types';
import { Plus, FolderOpen, Trash2, FileText, GitBranch } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/projects', { name, description });
      setName(''); setDescription(''); setShowCreate(false);
      fetchProjects();
    } finally {
      setCreating(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-1">Manage your code projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">Create Project</h2>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Project Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                  placeholder="My Awesome Project"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description (optional)</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="What is this project about?"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm transition-colors">{creating ? 'Creating...' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <Link href={`/dashboard/projects/${project.id}`} className="text-white font-semibold hover:text-blue-400 transition-colors">
                  {project.name}
                </Link>
                <button onClick={() => deleteProject(project.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              {project.description && <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><FileText size={12} /> {project._count?.files || 0} files</span>
                <span className="flex items-center gap-1"><GitBranch size={12} /> {project._count?.reviews || 0} reviews</span>
              </div>
              <Link href={`/dashboard/projects/${project.id}`} className="mt-4 block text-center bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-sm transition-colors">
                Open Project →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}