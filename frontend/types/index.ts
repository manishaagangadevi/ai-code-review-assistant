export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  _count?: { files: number; reviews: number };
}

export interface File {
  id: string;
  name: string;
  path: string;
  content?: string;
  mimeType?: string;
  size?: number;
  projectId: string;
}

export interface Review {
  id: string;
  title: string;
  template: string;
  summary: string;
  issues: Issue[];
  recommendations: Recommendation[];
  severity: string;
  createdAt: string;
  project?: { name: string };
  file?: { name: string; path: string };
}

export interface Issue {
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  file?: string;
  line?: number;
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface AiProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey?: string;
  modelName: string;
  isDefault: boolean;
}

export interface ChatSession {
  id: string;
  projectId: string;
  createdAt: string;
  messages: Message[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}