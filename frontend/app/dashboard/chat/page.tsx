'use client';
import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { Project, ChatSession, Message } from '@/types';
import { Send, Plus, MessageSquare, Trash2 } from 'lucide-react';

export default function ChatPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data));
    fetchSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSessions = async () => {
    const res = await api.get('/chat/sessions');
    setSessions(res.data);
  };

  const createSession = async () => {
    if (!selectedProject) return;
    const res = await api.post('/chat/sessions', { projectId: selectedProject });
    await fetchSessions();
    selectSession(res.data);
  };

  const selectSession = async (session: any) => {
    const res = await api.get(`/chat/sessions/${session.id}`);
    setSelectedSession(res.data);
    setMessages(res.data.messages || []);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedSession) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMsg, createdAt: new Date().toISOString() }]);
    setSending(true);
    try {
      const res = await api.post(`/chat/sessions/${selectedSession.id}/messages`, { message: userMsg });
      setMessages(prev => [...prev, res.data.message]);
    } finally {
      setSending(false);
    }
  };

  const deleteSession = async (id: string) => {
    await api.delete(`/chat/sessions/${id}`);
    if (selectedSession?.id === id) { setSelectedSession(null); setMessages([]); }
    fetchSessions();
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-gray-800 px-6 py-4 bg-gray-900">
        <h1 className="text-white font-semibold">AI Chat with Code</h1>
        <p className="text-gray-400 text-xs mt-0.5">Ask questions about your uploaded code</p>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Sessions sidebar */}
        <div className="w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
          <div className="p-3 border-b border-gray-800 space-y-2">
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              <option value="">Select project</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button
              onClick={createSession}
              disabled={!selectedProject}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm transition-colors"
            >
              <Plus size={16} /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {sessions.map(session => (
              <div
                key={session.id}
                onClick={() => selectSession(session)}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${selectedSession?.id === session.id ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare size={14} />
                  <span className="truncate">{new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
                <button onClick={e => { e.stopPropagation(); deleteSession(session.id); }} className="text-gray-600 hover:text-red-400 ml-1 flex-shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedSession ? (
            <>
              <div className="flex-1 overflow-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare size={48} className="mx-auto mb-4 text-gray-700" />
                    <p>Ask anything about your code!</p>
                    <p className="text-xs mt-2">e.g. "How does authentication work?" or "Which file handles the database?"</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl px-4 py-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                      <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-800 px-4 py-3 rounded-xl text-gray-400 text-sm">Thinking...</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="border-t border-gray-800 p-4 flex gap-3">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about your code..."
                  className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <button type="submit" disabled={sending || !input.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg transition-colors">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-700" />
                <p>Select a chat session or create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}