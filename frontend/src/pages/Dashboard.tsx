import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSocialData } from "@/contexts/SocialDataContext";
import {
  Leaf,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  MessageSquare,
  Send,
  Sparkles,
  Calendar,
  Download,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Megaphone,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Sidebar, MobileNav } from "@/components/layout/Sidebar";
import { useAuth } from "@/components/auth/AuthContext";
import api from "@/services/api";
import { generateDashboardPDF } from "@/lib/pdfGenerator";
import { toast } from "sonner";

const engagementData = [
  { name: "Jan", instagram: 4000, twitter: 2400, linkedin: 1800 },
  { name: "Feb", instagram: 3000, twitter: 1398, linkedin: 2200 },
  { name: "Mar", instagram: 5000, twitter: 4800, linkedin: 2900 },
  { name: "Apr", instagram: 2780, twitter: 3908, linkedin: 2000 },
  { name: "May", instagram: 6890, twitter: 4800, linkedin: 3181 },
  { name: "Jun", instagram: 8390, twitter: 3800, linkedin: 2500 },
  { name: "Jul", instagram: 7490, twitter: 4300, linkedin: 3100 },
];

const contentTypeData = [
  { name: "Reels", value: 45, color: "hsl(142, 71%, 45%)" },
  { name: "Carousels", value: 30, color: "hsl(200, 80%, 50%)" },
  { name: "Static", value: 15, color: "hsl(280, 60%, 50%)" },
  { name: "Stories", value: 10, color: "hsl(35, 90%, 55%)" },
];

const recentPosts = [
  { id: 1, platform: "instagram", title: "Product Launch Carousel", likes: 2847, comments: 234, shares: 156 },
  { id: 2, platform: "twitter", title: "Industry Insights Thread", likes: 1234, comments: 89, shares: 456 },
  { id: 3, platform: "linkedin", title: "Company Culture Post", likes: 892, comments: 67, shares: 123 },
  { id: 4, platform: "instagram", title: "Behind the Scenes Reel", likes: 3456, comments: 345, shares: 234 },
];

const aiInsights = [
  {
    type: "tip",
    message: "Your Reels perform 3.2x better than static posts due to higher algorithm priority and watch time.",
    reason: "Based on 45 posts analyzed",
    confidence: 92,
    action: "View Reel Analytics",
  },
  {
    type: "alert",
    message: "Engagement dropped 15% on Twitter due to lower posting frequency and off-peak posting times.",
    reason: "Compared to last 30 days",
    confidence: 88,
    action: "Optimize Schedule",
  },
  {
    type: "success",
    message: "Your carousel about 'Industry Trends' had highest reach (45K) because of strong hook and trending topic.",
    reason: "Top 1% of your content",
    confidence: 95,
    action: "Create Similar",
  },
];

import { ConnectAccountsModal } from "@/components/dashboard/ConnectAccountsModal";
import { FeaturedChannels } from "@/components/dashboard/FeaturedChannels";

const Dashboard = () => {
  const navigate = useNavigate();
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showTomorrowTip, setShowTomorrowTip] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);

  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");
  const { profile } = useAuth();

  // Dashboard data from API
  const [dashboardData, setDashboardData] = useState<{
    overview: { total_impressions: number; engagement_rate: number; total_comments: number; total_shares: number; growth_rate: number };
    insights: Array<{ type: string; summary: string }>;
    recommendations: Array<{ type: string; content: string; priority: number }>;
  } | null>(null);

  // Use shared social data context instead of local fetching
  const {
    youtubeData: realYoutubeData,
    instagramData: realInstagramData,
    connections,
    isLoading: contextLoading,
    formatNumber,
    unifiedMetrics,
    engagementTrends,
    isYoutubeLoading,
    isInstagramLoading
  } = useSocialData();

  const isLoading = contextLoading;

  useEffect(() => {
    const hasConnected = localStorage.getItem("hasConnectedAccounts");
    if (!hasConnected) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setShowConnectModal(true), 500);
      return () => clearTimeout(timer);
    }

    if (profile?.role === 'admin') {
      navigate('/admin/analytics');
      return;
    }


    // Get user data from profile (source of truth) or fallback to localStorage
    if (profile?.name) {
      setUserName(profile.name);
      const initials = profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
      setUserInitials(initials);
    } else {
      const userStr = localStorage.getItem("currentUser");
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserName(user.name || "John Doe");

        // Generate initials
        if (user.name) {
          const initials = user.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
          setUserInitials(initials);
        }
      }
    }

    // Fetch demo dashboard for fallback insights (separate from context-managed data)
    const fetchDemoInsights = async () => {
      try {
        const response = await fetch('http://localhost:8000/demo/full-dashboard');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (e) {
        console.error("Failed to fetch demo dashboard", e);
      }
    };
    fetchDemoInsights();
  }, [profile, navigate]);

  // Platform list

  // Get list of connected platforms
  const getConnectedPlatforms = () => {
    const platforms: { key: string; name: string; color: string; gradient: string }[] = [];

    if (connections.youtube?.connected || realYoutubeData) {
      platforms.push({
        key: "youtube",
        name: "YouTube",
        color: "#ff0000",
        gradient: "colorYoutube"
      });
    }
    if (connections.instagram?.connected || realInstagramData) {
      platforms.push({
        key: "instagram",
        name: "Instagram",
        color: "#ec4899",
        gradient: "colorInstagram"
      });
    }
    if (connections.twitter?.connected) {
      platforms.push({
        key: "twitter",
        name: "Twitter",
        color: "#60a5fa",
        gradient: "colorTwitter"
      });
    }
    if (connections.linkedin?.connected) {
      platforms.push({
        key: "linkedin",
        name: "LinkedIn",
        color: "#1d4ed8",
        gradient: "colorLinkedin"
      });
    }

    return platforms;
  };

  const connectedPlatforms = getConnectedPlatforms();

  // Generate dynamic engagement data based on connected platforms
  const getDynamicEngagementData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

    // If we have real YouTube video data and Instagram analytics, use them
    if (realYoutubeData?.recent_videos || realInstagramData?.analytics) {
      const videos = realYoutubeData?.recent_videos || [];
      const igTrend = realInstagramData?.analytics || [];

      const maxLen = Math.max(videos.length, igTrend.length, 7);
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

      return Array.from({ length: Math.min(maxLen, 7) }).map((_, i) => {
        const dataPoint: any = { name: days[i] || `Day ${i + 1}` };

        if (videos[i]) {
          dataPoint.youtube = (videos[i].statistics?.views || 0) / 1000;
        } else if (realYoutubeData) {
          dataPoint.youtube = Math.random() * 5000;
        }

        if (igTrend[i]) {
          dataPoint.instagram = (igTrend[i].reach || 0) / 1000;
        } else if (realInstagramData) {
          dataPoint.instagram = Math.random() * 4000;
        }

        // Mock others if connected
        if (connections.twitter?.connected) dataPoint.twitter = 1000 + Math.random() * 2000;
        if (connections.linkedin?.connected) dataPoint.linkedin = 500 + Math.random() * 1000;

        return dataPoint;
      });
    }

    // Fallback to monthly data for connected platforms only
    return months.map((month, i) => {
      const baseValue = 3000 + Math.random() * 5000;
      const dataPoint: any = { name: month };

      if (connections.youtube?.connected || realYoutubeData) {
        dataPoint.youtube = baseValue * 1.5;
      }
      if (connections.instagram?.connected || realInstagramData) {
        dataPoint.instagram = baseValue * 1.2;
      }
      if (connections.twitter?.connected) {
        dataPoint.twitter = baseValue * 0.8;
      }
      if (connections.linkedin?.connected) {
        dataPoint.linkedin = baseValue * 0.5;
      }

      return dataPoint;
    });
  };

  const dynamicEngagementData = engagementTrends;

  // Generate dynamic content type data
  const getDynamicContentTypeData = () => {
    // If we have YouTube data, categorize by video duration
    if (realYoutubeData?.recent_videos) {
      const videos = realYoutubeData.recent_videos;

      const categories: Record<string, number> = {
        "Short (<1m)": 0,
        "Medium (1-10m)": 0,
        "Long (10-30m)": 0,
        "Extended (30m+)": 0,
      };

      videos.forEach((video: any) => {
        const duration = video.duration || "";
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (match) {
          const hours = parseInt(match[1] || "0");
          const minutes = parseInt(match[2] || "0");
          const seconds = parseInt(match[3] || "0");
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;

          if (totalSeconds < 60) categories["Short (<1m)"]++;
          else if (totalSeconds < 600) categories["Medium (1-10m)"]++;
          else if (totalSeconds < 1800) categories["Long (10-30m)"]++;
          else categories["Extended (30m+)"]++;
        }
      });

      const total = Object.values(categories).reduce((a, b) => a + b, 0) || 1;

      return [
        { name: "Short (<1m)", value: Math.round((categories["Short (<1m)"] / total) * 100), color: "hsl(142, 71%, 45%)" },
        { name: "Medium (1-10m)", value: Math.round((categories["Medium (1-10m)"] / total) * 100), color: "hsl(200, 80%, 50%)" },
        { name: "Long (10-30m)", value: Math.round((categories["Long (10-30m)"] / total) * 100), color: "hsl(280, 60%, 50%)" },
        { name: "Extended (30m+)", value: Math.round((categories["Extended (30m+)"] / total) * 100), color: "hsl(35, 90%, 55%)" },
      ].filter(item => item.value > 0);
    }

    // Fallback for Instagram-only mode
    if (realInstagramData && !realYoutubeData) {
      return [
        { name: "Reels", value: 45, color: "hsl(142, 71%, 45%)" },
        { name: "Carousels", value: 30, color: "hsl(200, 80%, 50%)" },
        { name: "Static", value: 15, color: "hsl(280, 60%, 50%)" },
        { name: "Stories", value: 10, color: "hsl(35, 90%, 55%)" },
      ];
    }

    // Default fallback
    return contentTypeData;
  };

  const dynamicContentTypeData = getDynamicContentTypeData();

  // Generate dynamic recent posts from real data
  const getDynamicRecentPosts = () => {
    const posts: Array<{
      id: string | number;
      platform: string;
      title: string;
      likes: number;
      comments: number;
      shares: number;
      thumbnail?: string;
      url?: string;
    }> = [];

    // Add real YouTube videos
    if (realYoutubeData?.recent_videos) {
      realYoutubeData.recent_videos.slice(0, 4).forEach((video: any, i: number) => {
        posts.push({
          id: video.id || `yt-${i}`,
          platform: "youtube",
          title: video.title || "Untitled Video",
          likes: video.statistics?.likes || 0,
          comments: video.statistics?.comments || 0,
          shares: Math.round((video.statistics?.likes || 0) * 0.1), // Estimate shares
          thumbnail: video.thumbnails?.medium || video.thumbnails?.default,
          url: video.id ? `https://youtube.com/watch?v=${video.id}` : undefined,
        });
      });
    }

    // Add Instagram placeholder posts (since we can't get real post data without API)
    if (connections.instagram?.connected || realInstagramData) {
      const igHandle = connections.instagram?.publicHandle || realInstagramData?.profile?.username || "mrbeast";
      // These are estimated/placeholder - real data needs Instagram Graph API
      posts.push({
        id: `ig-placeholder-1`,
        platform: "instagram",
        title: `Latest Post from @${igHandle}`,
        likes: realInstagramData?.metrics?.impressions ? Math.round(realInstagramData.metrics.impressions * 0.05) : 50000,
        comments: realInstagramData?.metrics?.posts ? realInstagramData.metrics.posts * 20 : 1200,
        shares: realInstagramData?.metrics?.posts ? realInstagramData.metrics.posts * 10 : 600,
      });
    }

    // Add Twitter/LinkedIn only if connected
    if (connections.twitter?.connected) {
      posts.push({
        id: "tw-placeholder",
        platform: "twitter",
        title: "Recent Tweet",
        likes: 1234,
        comments: 89,
        shares: 456,
      });
    }

    if (connections.linkedin?.connected) {
      posts.push({
        id: "li-placeholder",
        platform: "linkedin",
        title: "Recent LinkedIn Post",
        likes: 892,
        comments: 67,
        shares: 123,
      });
    }

    // If no data, return empty to show "No posts yet" message
    return posts;
  };

  const dynamicRecentPosts = getDynamicRecentPosts();

  const handleExport = () => {
    const data = dashboardData?.overview || { total_impressions: 2547831, engagement_rate: 11.7, total_comments: 45678, total_shares: 18234, growth_rate: 23.8 };
    const csvContent = `Social Leaf Analytics Report
Generated: ${new Date().toLocaleString()}

OVERVIEW METRICS
Metric,Value
Total Impressions,${data.total_impressions}
Engagement Rate,${data.engagement_rate}%
Total Comments,${data.total_comments}
Total Shares,${data.total_shares}
Growth Rate,${data.growth_rate || 23.8}%

PLATFORM BREAKDOWN
Platform,Engagement Rate,Status
Instagram,8.5%,Active
YouTube,5.2%,Active
Twitter,3.8%,Active
LinkedIn,4.5%,Active

RECOMMENDATIONS
1. Create more Reels/Shorts content
2. Post during peak hours (7-9 PM)
3. Use carousel posts for educational content
4. Increase posting frequency to 4-5x/week
`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `social_leaf_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePdfExport = async () => {
    const toastId = toast.loading('Starting AI Analysis for Report...');

    try {
      let analysisData: any = undefined;

      // Attempt to get AI analysis if logged in
      if (session?.access_token) {
        try {
          const response = await api.getReportAnalysis(session.access_token, unifiedMetrics);
          analysisData = response;
          toast.dismiss(toastId);
          toast.info('AI Analysis added. Generating PDF...');
        } catch (err) {
          console.error("AI Analysis failed", err);
          toast.dismiss(toastId);
          toast.warning('Generating PDF without AI analysis (Service Unavailable)');
        }
      } else {
        toast.dismiss(toastId);
        toast.info('Generating PDF (Login for AI insights)...');
      }

      const charts = [
        { id: "engagement-chart", title: "Engagement Overview" },
        { id: "content-type-chart", title: "Content Performance" }
      ];

      await generateDashboardPDF("Social Leaf Analytics Report", unifiedMetrics, charts, analysisData);

      // Cleanup running toasts
      toast.dismiss(toastId);

    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error('Export failed');
    }
  };

  const { session } = useAuth();

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    if (!session?.access_token) {
      setAiResponse("Please log in to use AI insights.");
      return;
    }

    setAiResponse(""); // Clear previous
    setIsAiTyping(true);

    try {
      const response = await api.queryAI(session.access_token, aiQuery);

      // Typing animation for the real response
      const answer = response.answer || "I couldn't generate an answer at this time.";
      setAiQuery("");

      for (let i = 0; i <= answer.length; i++) {
        // Speed up typing for longer responses
        await new Promise((resolve) => setTimeout(resolve, 5));
        setAiResponse(answer.slice(0, i));
      }

    } catch (error) {
      console.error("AI Query failed:", error);
      setAiResponse("Sorry, I encountered an error connecting to the AI brain. Please try again.");
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleTomorrowTip = () => {
    setShowTomorrowTip(!showTomorrowTip);
  };

  const handleInsightAction = (action: string) => {
    switch (action) {
      case "View Reel Analytics":
        navigate("/analytics");
        break;
      case "Optimize Schedule":
        navigate("/performance");
        break;
      case "Create Similar":
        setShowIdeas(true);
        break;
      default:
        navigate("/analytics");
    }
  };


  // System Status State
  const [systemStatus, setSystemStatus] = useState({
    announcement: "",
    announcement_active: false,
    maintenance_mode: false,
    maintenance_start: "",
    maintenance_end: ""
  });

  useEffect(() => {
    fetchSystemStatus();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/system/status`);
      if (res.ok) {
        setSystemStatus(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch system status");
    }
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* System Announcement Banner */}
        {/* System Announcement Floating Card */}
        {systemStatus.announcement_active && systemStatus.announcement && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-indigo-600 text-white p-4 rounded-xl shadow-2xl flex items-start gap-4 border border-indigo-500/50 backdrop-blur-sm"
          >
            <div className="p-2 bg-white/20 rounded-lg shrink-0">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="flex-1 pt-0.5">
              <h4 className="font-semibold text-sm mb-1">System Update</h4>
              <p className="text-sm text-indigo-50 leading-relaxed mb-1">{systemStatus.announcement}</p>
              {systemStatus.maintenance_start && (
                <p className="text-[10px] text-indigo-200 font-medium">
                  Maintenance: {new Date(systemStatus.maintenance_start).toLocaleString()} - {new Date(systemStatus.maintenance_end).toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 h-[65px] flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <MobileNav />
              <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
              {/* Live Data Indicator - inline */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Live Data from API
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handlePdfExport}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="hero" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
                CSV
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div id="dashboard-content" className="p-6 space-y-6">
          {/* Welcome Message */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl font-display font-bold text-foreground line-clamp-1">
                Welcome back, {userName.split(' ')[0]}! 👋
              </h2>
              <p className="text-muted-foreground">
                Here's what's happening across your connected platforms today.
              </p>
            </motion.div>

            {/* Quick Refresh Button for Unified Data */}
            <Button
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Unified Account Banner & Get Started */}
          <div className="flex flex-col gap-4">
            {/* NO ACCOUNTS CONNECTED BANNER */}
            {!connections.youtube?.connected && !connections.instagram?.connected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/5 rounded-2xl p-8 border border-primary/20 flex flex-col items-center text-center gap-4"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Start Your Unified Dashboard</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Connect your YouTube and Instagram accounts to see real-time engagement and AI growth tips.
                  </p>
                </div>
                <Button variant="hero" onClick={() => setShowConnectModal(true)}>
                  Connect My Accounts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            )}

            {/* Unified Account Summary Banner (If connected) */}
            {(connections.youtube?.connected || connections.instagram?.connected) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-6 border border-border flex flex-wrap items-center justify-between gap-6 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {connections.youtube?.connected && (
                      <div className="h-10 w-10 rounded-full bg-red-500 border-2 border-card flex items-center justify-center z-20">
                        <Youtube className="h-5 w-5 text-white" />
                      </div>
                    )}
                    {connections.instagram?.connected && (
                      <div className="h-10 w-10 rounded-full bg-pink-500 border-2 border-card flex items-center justify-center z-10">
                        <Instagram className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">Unified Performance</h3>
                      {(isYoutubeLoading || isInstagramLoading) && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold animate-pulse">
                          <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                          SYNCING
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {Object.values(connections).filter(c => c?.connected).length} platforms connected
                    </p>
                  </div>
                </div>

                <div className="flex gap-8">
                  <div className="hidden sm:block">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Avg. Engagement</p>
                    <p className="text-xl font-bold text-primary">{unifiedMetrics.engagementRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Total Reach</p>
                    <p className="text-xl font-bold">{formatNumber(unifiedMetrics.totalImpressions)}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Platform Specific Banners Row */}
            {/* YouTube Banner */}
            {realYoutubeData?.channel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent rounded-xl p-4 border border-red-500/20 flex items-center gap-4"
              >
                <img
                  src={realYoutubeData.channel.thumbnail}
                  alt={realYoutubeData.channel.title}
                  className="h-12 w-12 rounded-full border-2 border-red-500/30"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold">{realYoutubeData.channel.title}</h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      Live Data
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(realYoutubeData.channel.statistics?.subscribers || 0)} subscribers •
                    {formatNumber(realYoutubeData.channel.statistics?.views || 0)} total views •
                    {realYoutubeData.channel.statistics?.videos || 0} videos
                  </p>
                </div>
                <a
                  href={`https://youtube.com/${realYoutubeData.channel.customUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-red-500 hover:text-red-400 font-medium"
                >
                </a>
              </motion.div>
            )}
            {/* Instagram Banner */}
            {connections.instagram?.connected && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-transparent rounded-xl p-4 border border-pink-500/20 flex items-center gap-4"
              >
                <div className="h-12 w-12 rounded-full border-2 border-pink-500/30 bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center">
                  <Instagram className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <h3 className="font-semibold">@{(connections.instagram.publicHandle || realInstagramData?.profile?.username || "instagram_user").replace(/^@+/, '')}</h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                      </span>
                      {realInstagramData ? "Live Data" : "Connected"}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {realInstagramData?.profile?.followers ? `${formatNumber(realInstagramData.profile.followers)} followers • ` : ""}
                    Managing audience and engagement strategies
                  </p>
                </div>
                <Link to="/analytics" className="text-sm text-pink-500 hover:text-pink-400 font-medium">
                  Detailed Insights →
                </Link>
              </motion.div>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Total Impressions",
                value: formatNumber(unifiedMetrics.totalImpressions),
                change: `+${unifiedMetrics.growthRate}%`,
                icon: Eye,
                color: "text-blue-500"
              },
              {
                label: "Engagement Rate",
                value: `${unifiedMetrics.engagementRate}%`,
                change: "+2.1%",
                icon: Heart,
                color: "text-rose-500"
              },
              {
                label: "Total Comments",
                value: formatNumber(unifiedMetrics.totalComments),
                change: "+18.2%",
                icon: MessageCircle,
                color: "text-amber-500"
              },
              {
                label: "Total Shares",
                value: formatNumber(unifiedMetrics.totalShares),
                change: "+5.3%",
                icon: Share2,
                color: "text-primary"
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">{isLoading ? "..." : stat.value}</p>
                <p className="text-sm text-primary font-medium">{stat.change} vs last month</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Engagement Chart */}
            <motion.div
              id="engagement-chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-foreground">Engagement Overview</h3>
                <div className="flex items-center gap-4 text-sm">
                  {/* Dynamic legend based on connected platforms */}
                  {connectedPlatforms.map((platform) => (
                    <div key={platform.key} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: platform.color }} />
                      <span className="text-muted-foreground">{platform.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dynamicEngagementData}>
                    <defs>
                      <linearGradient id="colorYoutube" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff0000" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ff0000" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorInstagram" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTwitter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorLinkedin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    {/* Render Area for each connected platform */}
                    {connectedPlatforms.map((platform) => (
                      <Area
                        key={platform.key}
                        type="monotone"
                        dataKey={platform.key}
                        stroke={platform.color}
                        fill={`url(#${platform.gradient})`}
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Content Type Chart */}
            <motion.div
              id="content-type-chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <h3 className="font-display text-lg font-semibold text-foreground mb-6">Content Performance</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dynamicContentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dynamicContentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {dynamicContentTypeData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Featured YouTube Channels - Real Data */}
          <FeaturedChannels />

          {/* AI Insights & Recent Posts */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* AI Query Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-dark rounded-2xl p-6 text-white"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold">AI Insights</h3>
              </div>

              {/* AI Insights List - Enhanced with confidence and actions */}
              <div className="space-y-3 mb-6">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-white/90 flex-1">{insight.message}</p>
                      <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full ml-2 shrink-0">
                        {insight.confidence}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-white/40">{insight.reason}</span>
                      <button
                        onClick={() => handleInsightAction(insight.action)}
                        className="text-xs text-primary hover:text-primary/80 font-medium"
                      >
                        {insight.action} →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Query Input */}
              <form onSubmit={handleAiQuery} className="relative">
                <Input
                  type="text"
                  placeholder="Ask about your analytics..."
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-12"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>

              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-primary/20 border border-primary/30"
                >
                  <p className="text-sm text-white/90 whitespace-pre-line">{aiResponse}</p>
                </motion.div>
              )}

              {/* What Should I Post Tomorrow - KILLER FEATURE */}
              <Button
                onClick={handleTomorrowTip}
                className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                What Should I Post Tomorrow?
              </Button>

              {showTomorrowTip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    <span className="font-semibold text-white">AI Recommendation</span>
                    <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full ml-auto">
                      Confidence: 94%
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-white/80">📱 <strong>Platform:</strong> Instagram</p>
                    <p className="text-white/80">🎬 <strong>Format:</strong> Reel (15-30 seconds)</p>
                    <p className="text-white/80">⏰ <strong>Best Time:</strong> 7:00 PM IST (Thursday)</p>
                    <p className="text-white/80">📝 <strong>Caption Style:</strong> Educational with hook</p>
                    <p className="text-white/80">🏷️ <strong>Topic:</strong> Behind-the-scenes or Tutorial</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-white border-white/30 hover:bg-white/10"
                      onClick={() => {
                        // Get next Thursday at 7 PM IST
                        const now = new Date();
                        const daysUntilThursday = (4 - now.getDay() + 7) % 7 || 7;
                        const nextThursday = new Date(now);
                        nextThursday.setDate(now.getDate() + daysUntilThursday);
                        nextThursday.setHours(19, 0, 0, 0);

                        const endTime = new Date(nextThursday);
                        endTime.setHours(20, 0, 0, 0);

                        // Format for Google Calendar
                        const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, '').slice(0, 15) + 'Z';

                        const title = encodeURIComponent('📱 Post Instagram Reel - Social Leaf');
                        const details = encodeURIComponent(`AI-Recommended Post

🎬 Format: Reel (15-30 seconds)
📝 Caption Style: Educational with hook
🏷️ Topic: Behind-the-scenes or Tutorial

Tips:
• Use trending audio
• Strong hook in first 3 seconds
• Add call-to-action at end

Generated by Social Leaf AI (94% confidence)`);
                        const location = encodeURIComponent('Instagram');

                        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(nextThursday)}/${formatDate(endTime)}&details=${details}&location=${location}`;

                        window.open(calendarUrl, '_blank');
                      }}
                    >
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      Schedule in Google Calendar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-white border-white/30 hover:bg-white/10"
                      onClick={() => setShowIdeas(true)}
                    >
                      Get Ideas
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Ideas Modal */}
              {showIdeas && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-400" />
                      <span className="font-semibold text-white">Content Ideas for You</span>
                    </div>
                    <button onClick={() => setShowIdeas(false)} className="text-white/60 hover:text-white">×</button>
                  </div>
                  <div className="space-y-2">
                    {[
                      "🎬 \"5 Tips for [Your Niche]\" - Reel format, educational hook",
                      "📸 Before/After transformation carousel",
                      "🎤 Day in the life behind-the-scenes",
                      "💡 Common mistakes in [Your Niche] thread",
                      "🔥 React to trending topic in your industry",
                    ].map((idea, i) => (
                      <div key={i} className="p-2 rounded-lg bg-white/5 text-sm text-white/80">
                        {idea}
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-blue-500 hover:bg-blue-600"
                    onClick={() => setShowIdeas(false)}
                  >
                    Use These Ideas
                  </Button>
                </motion.div>
              )}
            </motion.div>

            {/* Recent Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-foreground">Recent Posts</h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  Real Data
                </div>
              </div>

              <div className="space-y-4">
                {dynamicRecentPosts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No posts yet. Connect your accounts to see real data.</p>
                  </div>
                ) : (
                  dynamicRecentPosts.map((post) => {
                    const PlatformIcon = post.platform === "instagram" ? Instagram
                      : post.platform === "twitter" ? Twitter
                        : post.platform === "youtube" ? Youtube
                          : Linkedin;

                    const PostContent = (
                      <div key={post.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                        {/* Show thumbnail for YouTube videos */}
                        {post.thumbnail ? (
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="h-16 w-24 object-cover rounded-lg"
                          />
                        ) : (
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${post.platform === "instagram" ? "bg-gradient-to-br from-pink-500 to-purple-500"
                            : post.platform === "twitter" ? "bg-blue-400"
                              : post.platform === "youtube" ? "bg-red-500"
                                : "bg-blue-700"
                            }`}>
                            <PlatformIcon className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {post.thumbnail && (
                              <div className={`h-5 w-5 rounded flex items-center justify-center shrink-0 ${post.platform === "youtube" ? "bg-red-500" : "bg-pink-500"
                                }`}>
                                <PlatformIcon className="h-3 w-3 text-white" />
                              </div>
                            )}
                            <p className="font-medium text-foreground truncate">{post.title}</p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" /> {post.likes.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" /> {post.comments.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Share2 className="h-3 w-3" /> {post.shares.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );

                    // Wrap in link if URL exists
                    return post.url ? (
                      <a
                        key={post.id}
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        {PostContent}
                      </a>
                    ) : (
                      PostContent
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <ConnectAccountsModal open={showConnectModal} onOpenChange={setShowConnectModal} />
    </div>
  );
};

export default Dashboard;
