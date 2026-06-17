'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { FolderOpen, FileSearch, MessageSquare, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ projects: 0, reviews: 0 });

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/reviews')]).then(([p, r]) => {
      setStats({ projects: p.data.length, reviews: r.data.length });
    }).catch(() => {});
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name} 👋</h1>
        <p className="text-gray-400 mt-1">Here's an overview of your code review workspace</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="text-blue-400" size={24} />
            <span className="text-gray-400 text-sm">Total Projects</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.projects}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileSearch className="text-green-400" size={24} />
            <span className="text-gray-400 text-sm">Total Reviews</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.reviews}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="text-purple-400" size={24} />
            <span className="text-gray-400 text-sm">AI Chat</span>
          </div>
          <p className="text-3xl font-bold text-white">Active</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/dashboard/projects" className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Projects</h3>
            <Plus size={20} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
          </div>
          <p className="text-gray-400 text-sm">Upload code, manage files, and run AI reviews on your projects.</p>
        </Link>
        <Link href="/dashboard/reviews" className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-green-500 transition-colors group">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Review History</h3>
            <FileSearch size={20} className="text-gray-400 group-hover:text-green-400 transition-colors" />
          </div>
          <p className="text-gray-400 text-sm">Browse past AI reviews, search by template, and view detailed findings.</p>
        </Link>
      </div>
    </div>
  );
}