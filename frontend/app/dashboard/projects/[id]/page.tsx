'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Project, File, Review } from '@/types';
import { Upload, FileText, Play, ChevronRight, ChevronDown, Eye, Trash2, ArrowLeft } from 'lucide-react';

const TEMPLATES = [
  { value: 'security', label: 'Security Review', color: 'text-red-400' },
  { value: 'performance', label: 'Performance Review', color: 'text-yellow-400' },
  { value: 'quality', label: 'Code Quality', color: 'text-green-400' },
  { value: 'documentation', label: 'Documentation Generator', color: 'text-blue-400' },
  { value: 'techdebt', label: 'Tech Debt Scanner', color: 'text-purple-400' },
];

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

function FileTree({ tree, onSelect, selectedId }: { tree: any; onSelect: (file: any) => void; selectedId?: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const renderNode = (node: any, prefix = '') => {
    return Object.entries(node).map(([key, value]: [string, any]) => {
      if (key === '__files') {
        return value.map((file: any) => (
          <div
            key={file.id}
            onClick={() => onSelect(file)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-sm ${selectedId === file.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            <FileText size={14} />
            {file.name}
          </div>
        ));
      }
      const fullKey = prefix + key;
      return (
        <div key={fullKey}>
          <div
            onClick={() => setExpanded(p => ({ ...p, [fullKey]: !p[fullKey] }))}
            className="flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-gray-300 hover:bg-gray-800 text-sm"
          >
            {expanded[fullKey] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            📁 {key}
          </div>
          {expanded[fullKey] && (
            <div className="ml-4">{renderNode(value, fullKey + '/')}</div>
          )}
        </div>
      );
    });
  };

  return <div className="space-y-0.5">{renderNode(tree)}</div>;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [fileTree, setFileTree] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [uploading, setUploading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [template, setTemplate] = useState('quality');
  const [activeTab, setActiveTab] = useState<'files' | 'reviews'>('files');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const fetchAll = useCallback(async () => {
    const [proj, tree, revs] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/files/tree`),
      api.get(`/reviews?projectId=${id}`),
    ]);
    setProject(proj.data);
    setFileTree(tree.data);
    setReviews(revs.data);
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleFileSelect = async (file: any) => {
    const res = await api.get(`/projects/${id}/files/${file.id}`);
    setSelectedFile(res.data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      await api.post(`/projects/${id}/files/upload`, form);
      fetchAll();
    } finally {
      setUploading(false);
    }
  };

  const runReview = async () => {
    setReviewing(true);
    try {
      const res = await api.post('/reviews', { projectId: id, template });
      setSelectedReview(res.data);
      setActiveTab('reviews');
      fetchAll();
    } finally {
      setReviewing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-gray-800 px-6 py-4 flex items-center gap-4 bg-gray-900">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-white font-semibold">{project?.name}</h1>
          {project?.description && <p className="text-gray-400 text-xs">{project.description}</p>}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <select
            value={template}
            onChange={e => setTemplate(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            {TEMPLATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button
            onClick={runReview}
            disabled={reviewing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Play size={16} /> {reviewing ? 'Reviewing...' : 'Run Review'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File tree */}
        <div className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Files</span>
            <label className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors">
              <Upload size={16} />
              <input type="file" accept=".zip" onChange={handleUpload} className="hidden" />
            </label>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {uploading ? (
              <div className="text-gray-400 text-sm text-center py-4">Uploading...</div>
            ) : Object.keys(fileTree).length === 0 ? (
              <div className="text-gray-500 text-xs text-center py-8">Upload a ZIP to get started</div>
            ) : (
              <FileTree tree={fileTree} onSelect={handleFileSelect} selectedId={selectedFile?.id} />
            )}
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b border-gray-800 flex">
            {['files', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
              >
                {tab} {tab === 'reviews' && `(${reviews.length})`}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'files' ? (
              selectedFile ? (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText size={16} className="text-blue-400" />
                    <span className="text-gray-300 text-sm">{selectedFile.path}</span>
                  </div>
                  <pre className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-300 overflow-auto max-h-[calc(100vh-300px)] font-mono">
                    {selectedFile.content}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">Select a file to preview</div>
              )
            ) : (
              <div className="space-y-4">
                {selectedReview && (
                  <ReviewCard review={selectedReview} />
                )}
                {reviews.filter(r => r.id !== selectedReview?.id).map(review => (
                  <div key={review.id} onClick={() => setSelectedReview(review)} className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium text-sm">{review.title}</span>
                      <span className={`text-xs px-2 py-1 rounded border ${SEVERITY_COLORS[review.severity] || SEVERITY_COLORS.medium}`}>{review.severity}</span>
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
                {reviews.length === 0 && !selectedReview && (
                  <div className="text-center py-12 text-gray-500">No reviews yet. Run your first review!</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const issues = Array.isArray(review.issues) ? review.issues : [];
  const recommendations = Array.isArray(review.recommendations) ? review.recommendations : [];

  return (
    <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold">{review.title}</h3>
        <span className={`text-xs px-2 py-1 rounded border ${SEVERITY_COLORS[review.severity] || SEVERITY_COLORS.medium}`}>{review.severity}</span>
      </div>
      <p className="text-gray-300 text-sm">{review.summary}</p>
      {issues.length > 0 && (
        <div>
          <h4 className="text-white text-sm font-medium mb-2">Issues ({issues.length})</h4>
          <div className="space-y-2">
            {issues.map((issue: any, i: number) => (
              <div key={i} className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${SEVERITY_COLORS[issue.severity] || SEVERITY_COLORS.medium}`}>{issue.severity}</span>
                  <span className="text-white text-sm font-medium">{issue.title}</span>
                </div>
                <p className="text-gray-400 text-xs">{issue.description}</p>
                {issue.file && <p className="text-gray-500 text-xs mt-1">📄 {issue.file}{issue.line ? `:${issue.line}` : ''}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {recommendations.length > 0 && (
        <div>
          <h4 className="text-white text-sm font-medium mb-2">Recommendations</h4>
          <div className="space-y-2">
            {recommendations.map((rec: any, i: number) => (
              <div key={i} className="bg-gray-800 rounded-lg p-3">
                <p className="text-white text-sm font-medium">{rec.title}</p>
                <p className="text-gray-400 text-xs mt-1">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}