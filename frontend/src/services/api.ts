/**
 * API Service for Social Leaf Backend
 * Connects frontend to FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface AnalyticsOverview {
  total_impressions: number;
  engagement_rate: number;
  total_comments: number;
  total_shares: number;
  growth_rate: number;
}

export interface PlatformMetrics {
  platform: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  engagement_rate: number;
}

export interface Insight {
  type: string;
  summary: string;
  title?: string;
}

export interface Recommendation {
  type: string;
  content: string;
  title?: string;
  priority: number;
}

export interface BestTimes {
  instagram: Record<string, string[]>;
  youtube: Record<string, string[]>;
  twitter: Record<string, string[]>;
  linkedin: Record<string, string[]>;
}

export interface DashboardData {
  overview: AnalyticsOverview;
  platforms: PlatformMetrics[];
  insights: Insight[];
  recommendations: Recommendation[];
  best_times: BestTimes;
}

// Helper function for API calls
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
}

// Demo endpoints (no auth required)
export const demoApi = {
  // Get full dashboard data
  getFullDashboard: () => fetchApi<DashboardData>('/demo/full-dashboard'),

  // Get analytics overview
  getAnalytics: () => fetchApi<AnalyticsOverview>('/demo/analytics'),

  // Get platform-specific metrics
  getPlatformMetrics: (platform: string) =>
    fetchApi<PlatformMetrics>(`/demo/platform/${platform}`),

  // Get AI insights
  getInsights: () => fetchApi<Insight[]>('/demo/insights'),

  // Get recommendations
  getRecommendations: () => fetchApi<Recommendation[]>('/demo/recommendations'),

  // Get best posting times
  getBestTimes: () => fetchApi<BestTimes>('/demo/best-times'),

  // Get content comparison
  getContentComparison: () => fetchApi<any>('/demo/content-comparison'),

  // Get report summary
  getReport: () => fetchApi<any>('/demo/report'),

  // Get best time for specific platform
  getBestTimeForPlatform: (platform: string) =>
    fetchApi<any>(`/demo/best-time/${platform}`),
};

// Authenticated endpoints
export const api = {
  // Analytics
  getAnalyticsOverview: (token: string, days = 30) =>
    fetchApi<AnalyticsOverview>(`/api/analytics/overview?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getPlatformAnalytics: (token: string, platform: string) =>
    fetchApi<PlatformMetrics>(`/api/analytics/platform/${platform}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  compareplatforms: (token: string) =>
    fetchApi<any>('/api/analytics/compare', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // AI
  queryAI: (token: string, question: string) =>
    fetchApi<{ answer: string }>('/api/ai/query', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ question }),
    }),

  getInsights: (token: string) =>
    fetchApi<Insight[]>('/api/ai/insights', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  generateInsights: (token: string) =>
    fetchApi<any>('/api/ai/generate-insights', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getRecommendations: (token: string) =>
    fetchApi<Recommendation[]>('/api/ai/recommendations', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Reports
  getReportSummary: (token: string, days = 30) =>
    fetchApi<any>(`/api/reports/summary?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getBestTimeToPost: (token: string, platform?: string) =>
    fetchApi<any>(`/api/reports/best-time${platform ? `?platform=${platform}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Platforms
  getConnectedPlatforms: (token: string) =>
    fetchApi<any[]>('/api/platforms/', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  connectPlatform: (token: string, platformName: string, accessToken: string) =>
    fetchApi<any>('/api/platforms/connect', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ platform_name: platformName, access_token: accessToken }),
    }),
};

export default api;
