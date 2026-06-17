'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Review } from '@/types';
import { FileSearch, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const TEMPLATE_LABELS: Record<string, string> = {
  security: 'Security', performance: 'Performance', quality: 'Code Quality',
  documentation: 'Documentation', techdebt: 'Tech Debt',
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { fetchReviews(); }, []);

  const fetchReviews = async (q = '', t = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.append('query', q);
      if (t) params.append('template', t);
      const res = await api.get(`/reviews?${params}`);
      setReviews(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviews(search, templateFilter);
  };

  const deleteReview = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/reviews/${id}`);
    fetchReviews(search, templateFilter);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Review History</h1>
        <p className="text-gray-400 mt-1">Browse and search all your AI code reviews</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={templateFilter}
          onChange={e => { setTemplateFilter(e.target.value); fetchReviews(search, e.target.value); }}
          className="bg-gray-900 border border-gray-800 text-white rounded-lg px-3 py-2.5 focus:outline-none"
        >
          <option value="">All Templates</option>
          {Object.entries(TEMPLATE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm transition-colors">Search</button>
      </form>

      {loading ? (
        <div className="text-gray-400 text-center py-12">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <FileSearch size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setExpanded(expanded === review.id ? null : review.id)} className="text-gray-400 hover:text-white">
                    {expanded === review.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  <div>
                    <p className="text-white font-medium text-sm">{review.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {review.project?.name} · {TEMPLATE_LABELS[review.template]} · {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded border ${SEVERITY_COLORS[review.severity] || SEVERITY_COLORS.medium}`}>{review.severity}</span>
                  <button onClick={() => deleteReview(review.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
              {expanded === review.id && (
                <div className="border-t border-gray-800 p-4 space-y-3">
                  <p className="text-gray-300 text-sm">{review.summary}</p>
                  {Array.isArray(review.issues) && review.issues.length > 0 && (
                    <div>
                      <p className="text-white text-xs font-medium mb-2">Issues ({review.issues.length})</p>
                      <div className="space-y-2">
                        {review.issues.map((issue: any, i: number) => (
                          <div key={i} className="bg-gray-800 rounded-lg p-3 text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-1.5 py-0.5 rounded border ${SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.medium}`}>{issue.severity}</span>
                              <span className="text-white font-medium">{issue.title}</span>
                            </div>
                            <p className="text-gray-400">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}