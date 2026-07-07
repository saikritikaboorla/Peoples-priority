const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getDashboard: (constituencyId?: string) =>
    fetchApi<DashboardOverview>(`/dashboard/overview${constituencyId ? `?constituencyId=${constituencyId}` : ''}`),

  getFeedback: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<{ items: FeedbackItem[]; total: number }>(`/feedback${qs}`);
  },

  submitFeedback: async (formData: FormData) => {
    const res = await fetch(`${API_URL}/feedback`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Submission failed');
    return res.json();
  },

  getConstituencies: () => fetchApi<Constituency[]>('/geo/constituencies'),
  getDistricts: (constituencyId?: string) =>
    fetchApi<District[]>(`/geo/districts${constituencyId ? `?constituencyId=${constituencyId}` : ''}`),
  getHeatmap: (constituencyId?: string) =>
    fetchApi<HeatmapPoint[]>(`/geo/heatmap${constituencyId ? `?constituencyId=${constituencyId}` : ''}`),
  getThemes: () => fetchApi<Theme[]>('/themes/stats'),
  generateRecommendations: (constituencyId: string) =>
    fetchApi<Recommendation[]>(`/recommendations/generate/${constituencyId}`, { method: 'POST' }),
};

export interface DashboardOverview {
  totalSubmissions: number;
  activeIssues: number;
  trendingTopics: { id: string; name: string; category: string; count: number; urgentCount: number }[];
  districtDemand: { districtId: string; districtName: string; totalFeedback: number; byTheme: Record<string, number> }[];
  topHotspot: { districtName: string; totalFeedback: number } | null;
  recommendations: Recommendation[];
  recentFeedback: FeedbackItem[];
  timeline: { date: string; count: number }[];
  aiSummary: string;
}

export interface FeedbackItem {
  id: string;
  rawContent: string;
  processedContent: string;
  detectedLanguage: string;
  sentiment: string;
  channel: string;
  locationName: string;
  aiSummary: string;
  createdAt: string;
  theme?: { name: string; category: string };
  district?: { name: string };
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  themeCategory: string;
  demandScore: number;
  impactScore: number;
  costScore: number;
  priorityScore: number;
  citizenRequestCount: number;
  estimatedCost: string;
  rationale: string;
  rank: number;
}

export interface Constituency {
  id: string;
  name: string;
  state: string;
  mpName: string;
  districts: District[];
}

export interface District {
  id: string;
  name: string;
  population: number;
  latitude: number;
  longitude: number;
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
  theme?: string;
  district?: string;
}

export interface Theme {
  id: string;
  name: string;
  category: string;
  count: number;
}
