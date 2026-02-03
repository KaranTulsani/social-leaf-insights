import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface YouTubeChannel {
  title: string;
  thumbnail: string;
  customUrl?: string;
  statistics?: {
    subscribers: number;
    views: number;
    videos: number;
  };
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnails?: {
    default?: string;
    medium?: string;
    high?: string;
  };
  statistics?: {
    views: number;
    likes: number;
    comments: number;
  };
  duration?: string;
}

interface YouTubeData {
  channel: YouTubeChannel;
  recent_videos: YouTubeVideo[];
}

interface InstagramData {
  profile?: {
    username: string;
    followers: number;
    following: number;
    posts: number;
  };
  metrics?: {
    impressions: number;
    posts: number;
  };
}

interface ConnectionStatus {
  connected: boolean;
  publicHandle?: string;
  dataType?: string;
}

interface Connections {
  youtube?: ConnectionStatus;
  instagram?: ConnectionStatus;
  twitter?: ConnectionStatus;
  linkedin?: ConnectionStatus;
}

interface SocialDataContextType {
  // Data
  youtubeData: YouTubeData | null;
  instagramData: InstagramData | null;
  connections: Connections;

  // Loading states
  isLoading: boolean;
  isYoutubeLoading: boolean;
  isInstagramLoading: boolean;

  // Last fetch time
  lastFetchTime: number | null;

  // Actions
  refreshData: () => Promise<void>;
  refreshYoutubeData: () => Promise<void>;
  refreshInstagramData: () => Promise<void>;

  // Helpers
  formatNumber: (num: number) => string;
}

const SocialDataContext = createContext<SocialDataContextType | undefined>(undefined);

const API_BASE = 'http://localhost:8000';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export const SocialDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(null);
  const [instagramData, setInstagramData] = useState<InstagramData | null>(null);
  const [connections, setConnections] = useState<Connections>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isYoutubeLoading, setIsYoutubeLoading] = useState(false);
  const [isInstagramLoading, setIsInstagramLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Load connections from localStorage
  const loadConnections = (): Connections => {
    try {
      const saved = localStorage.getItem('socialleaf_connections');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load connections:', e);
    }
    return {};
  };

  // Fetch YouTube data
  const fetchYoutubeData = async () => {
    setIsYoutubeLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/youtube/featured`);
      if (response.ok) {
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          // Find MrBeast or use first channel
          const mrBeast = data.find((c: any) =>
            c.channel?.title?.toLowerCase().includes('mrbeast') ||
            c.channel?.customUrl?.toLowerCase().includes('mrbeast')
          );
          setYoutubeData(mrBeast || data[0]);
        } else if (data.channel) {
          setYoutubeData(data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch YouTube data:', error);
    } finally {
      setIsYoutubeLoading(false);
    }
  };

  // Fetch Instagram data
  const fetchInstagramData = async (conns: Connections) => {
    if (!conns.instagram?.connected) return;

    setIsInstagramLoading(true);
    try {
      let url = `${API_BASE}/api/real/instagram`;
      if (conns.instagram.publicHandle) {
        url += `?handle=${conns.instagram.publicHandle}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setInstagramData(data);
      }
    } catch (error) {
      console.error('Failed to fetch Instagram data:', error);
    } finally {
      setIsInstagramLoading(false);
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setIsLoading(true);
    const conns = loadConnections();
    setConnections(conns);

    // Fetch in parallel
    await Promise.all([
      fetchYoutubeData(),
      fetchInstagramData(conns),
    ]);

    setLastFetchTime(Date.now());
    setIsLoading(false);
  };

  // Refresh YouTube data only
  const refreshYoutubeData = async () => {
    await fetchYoutubeData();
    setLastFetchTime(Date.now());
  };

  // Refresh Instagram data only
  const refreshInstagramData = async () => {
    const conns = loadConnections();
    await fetchInstagramData(conns);
    setLastFetchTime(Date.now());
  };

  // Initial fetch on mount
  useEffect(() => {
    // Check if we have cached data that's still fresh
    const cached = sessionStorage.getItem('socialleaf_cached_data');
    if (cached) {
      try {
        const { youtube, instagram, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          // Use cached data
          setYoutubeData(youtube);
          setInstagramData(instagram);
          setLastFetchTime(timestamp);
          setConnections(loadConnections());
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.error('Failed to parse cached data:', e);
      }
    }

    // No valid cache, fetch fresh
    refreshData();
  }, []);

  // Cache data when it changes
  useEffect(() => {
    if (youtubeData || instagramData) {
      sessionStorage.setItem('socialleaf_cached_data', JSON.stringify({
        youtube: youtubeData,
        instagram: instagramData,
        timestamp: Date.now(),
      }));
    }
  }, [youtubeData, instagramData]);

  // Listen for connection changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'socialleaf_connections') {
        const newConns = loadConnections();
        setConnections(newConns);
        // Refresh data if connections changed
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <SocialDataContext.Provider
      value={{
        youtubeData,
        instagramData,
        connections,
        isLoading,
        isYoutubeLoading,
        isInstagramLoading,
        lastFetchTime,
        refreshData,
        refreshYoutubeData,
        refreshInstagramData,
        formatNumber,
      }}
    >
      {children}
    </SocialDataContext.Provider>
  );
};

export const useSocialData = (): SocialDataContextType => {
  const context = useContext(SocialDataContext);
  if (!context) {
    throw new Error('useSocialData must be used within a SocialDataProvider');
  }
  return context;
};

export default SocialDataContext;
