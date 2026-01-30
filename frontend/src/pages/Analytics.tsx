import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Users,
  Settings,
  ArrowLeft,
  Download,
  RefreshCw,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Zap,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const platformColors = {
  instagram: "#E4405F",
  youtube: "#FF0000",
  twitter: "#1DA1F2",
  linkedin: "#0A66C2",
};

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [refreshCooldown, setRefreshCooldown] = useState<string | null>(null);
  const [realYoutubeData, setRealYoutubeData] = useState<any>(null);
  const [youtubeLoading, setYoutubeLoading] = useState(false);

  // Fetch real YouTube data when YouTube is selected
  useEffect(() => {
    if (selectedPlatform === "youtube" && !realYoutubeData) {
      fetchRealYoutubeData();
    }
  }, [selectedPlatform]);

  const fetchRealYoutubeData = async () => {
    setYoutubeLoading(true);
    try {
      // Fetch MrBeast channel data as example
      const response = await fetch("http://localhost:8000/api/youtube/channel/UCX6OQ3DkcsbYNE6H8uQQuVA");
      if (response.ok) {
        const data = await response.json();
        setRealYoutubeData(data);
      }
    } catch (error) {
      console.error("Failed to fetch YouTube data:", error);
    } finally {
      setYoutubeLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(true); // Initial load bypasses cooldown
  }, []);

  // Get settings from localStorage
  const getSettings = () => {
    try {
      const saved = localStorage.getItem("socialleaf_settings");
      if (saved) return JSON.parse(saved);
    } catch { }
    return { refreshFrequency: "6h", lastRefresh: 0 };
  };

  // Check if refresh is allowed
  const canRefresh = () => {
    const settings = getSettings();
    const freqHours = parseInt(settings.refreshFrequency?.replace("h", "") || "6");
    const nextRefresh = (settings.lastRefresh || 0) + freqHours * 60 * 60 * 1000;
    const now = Date.now();

    if (now >= nextRefresh) return { allowed: true, message: "" };

    const remaining = nextRefresh - now;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    return { allowed: false, message: `Please wait ${hours}h ${minutes}m before refreshing (based on your settings)` };
  };

  const fetchAnalyticsData = async (initial = false) => {
    // Check cooldown (skip for initial load)
    if (!initial) {
      const refreshStatus = canRefresh();
      if (!refreshStatus.allowed) {
        setRefreshCooldown(refreshStatus.message);
        setTimeout(() => setRefreshCooldown(null), 3000);
        return;
      }
    }

    setIsLoading(true);
    try {
      const [dashboard, comparison] = await Promise.all([
        fetch("http://localhost:8000/demo/full-dashboard").then((r) => r.json()),
        fetch("http://localhost:8000/demo/content-comparison").then((r) => r.json()),
      ]);
      setAnalyticsData(dashboard);
      setComparisonData(comparison);

      // Always refresh real YouTube data on refresh button click
      // This fetches fresh data from YouTube API
      await fetchRealYoutubeData();

      // Update last refresh timestamp
      if (!initial) {
        const settings = JSON.parse(localStorage.getItem("socialleaf_settings") || "{}");
        settings.lastRefresh = Date.now();
        localStorage.setItem("socialleaf_settings", JSON.stringify(settings));
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  // Calculate engagement metrics from real YouTube data
  const getYoutubeMetrics = () => {
    if (!realYoutubeData?.channel || !realYoutubeData?.recent_videos) {
      return null;
    }

    const channel = realYoutubeData.channel;
    const videos = realYoutubeData.recent_videos;

    // Calculate totals from recent videos
    const totalViews = videos.reduce((sum: number, v: any) => sum + (v.statistics?.views || 0), 0);
    const totalLikes = videos.reduce((sum: number, v: any) => sum + (v.statistics?.likes || 0), 0);
    const totalComments = videos.reduce((sum: number, v: any) => sum + (v.statistics?.comments || 0), 0);

    // Calculate engagement rate (likes + comments / views * 100)
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews * 100) : 0;

    return {
      channelName: channel.title,
      subscribers: channel.statistics?.subscribers || 0,
      totalViews: channel.statistics?.views || 0,
      videoCount: channel.statistics?.videos || 0,
      recentViews: totalViews,
      recentLikes: totalLikes,
      recentComments: totalComments,
      engagementRate: engagementRate.toFixed(2),
      videos: videos,
    };
  };

  // Parse ISO 8601 duration (PT1H2M3S) to seconds
  const parseDuration = (duration: string): number => {
    if (!duration) return 0;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Get real engagement data from videos for chart
  const getRealEngagementData = () => {
    if (!realYoutubeData?.recent_videos) return null;

    const videos = realYoutubeData.recent_videos;

    // Create engagement data based on each video (as if each video is a day)
    return videos.slice(0, 6).map((video: any, index: number) => {
      const views = video.statistics?.views || 0;
      const likes = video.statistics?.likes || 0;
      const comments = video.statistics?.comments || 0;
      const engagement = views > 0 ? ((likes + comments) / views * 100) : 0;

      return {
        day: `Vid ${index + 1}`,
        engagement: parseFloat(engagement.toFixed(2)),
        reach: views,
        title: video.title?.slice(0, 20) + "...",
      };
    });
  };

  // Get real content type performance from videos
  const getRealContentTypePerformance = () => {
    if (!realYoutubeData?.recent_videos) return null;

    const videos = realYoutubeData.recent_videos;

    // Categorize videos by duration
    const categories: Record<string, { views: number; likes: number; comments: number; count: number }> = {
      "Short (<1m)": { views: 0, likes: 0, comments: 0, count: 0 },
      "Medium (1-10m)": { views: 0, likes: 0, comments: 0, count: 0 },
      "Long (10-30m)": { views: 0, likes: 0, comments: 0, count: 0 },
      "Extended (30m+)": { views: 0, likes: 0, comments: 0, count: 0 },
    };

    videos.forEach((video: any) => {
      const duration = parseDuration(video.duration);
      const views = video.statistics?.views || 0;
      const likes = video.statistics?.likes || 0;
      const comments = video.statistics?.comments || 0;

      let category: string;
      if (duration < 60) category = "Short (<1m)";
      else if (duration < 600) category = "Medium (1-10m)";
      else if (duration < 1800) category = "Long (10-30m)";
      else category = "Extended (30m+)";

      categories[category].views += views;
      categories[category].likes += likes;
      categories[category].comments += comments;
      categories[category].count += 1;
    });

    // Calculate average engagement rate for each category
    return Object.entries(categories)
      .filter(([_, data]) => data.count > 0)
      .map(([name, data]) => ({
        name,
        engagement: data.views > 0 ? parseFloat(((data.likes + data.comments) / data.views * 100).toFixed(2)) : 0,
        avgViews: Math.round(data.views / data.count),
        count: data.count,
      }));
  };

  const engagementByPlatform: Record<string, { day: string; engagement: number; reach: number }[]> = {
    all: [
      { day: "Mon", engagement: 8.2, reach: 45000 },
      { day: "Tue", engagement: 9.1, reach: 52000 },
      { day: "Wed", engagement: 7.8, reach: 48000 },
      { day: "Thu", engagement: 11.2, reach: 67000 },
      { day: "Fri", engagement: 10.5, reach: 61000 },
      { day: "Sat", engagement: 6.3, reach: 38000 },
      { day: "Sun", engagement: 5.9, reach: 35000 },
    ],
    instagram: [
      { day: "Mon", engagement: 9.5, reach: 62000 },
      { day: "Tue", engagement: 10.2, reach: 71000 },
      { day: "Wed", engagement: 8.8, reach: 58000 },
      { day: "Thu", engagement: 12.5, reach: 89000 },
      { day: "Fri", engagement: 11.8, reach: 82000 },
      { day: "Sat", engagement: 7.2, reach: 45000 },
      { day: "Sun", engagement: 6.8, reach: 42000 },
    ],
    youtube: [
      { day: "Mon", engagement: 5.2, reach: 32000 },
      { day: "Tue", engagement: 5.8, reach: 38000 },
      { day: "Wed", engagement: 6.1, reach: 41000 },
      { day: "Thu", engagement: 7.2, reach: 52000 },
      { day: "Fri", engagement: 6.5, reach: 45000 },
      { day: "Sat", engagement: 8.9, reach: 78000 },
      { day: "Sun", engagement: 8.2, reach: 71000 },
    ],
    twitter: [
      { day: "Mon", engagement: 4.1, reach: 18000 },
      { day: "Tue", engagement: 5.2, reach: 25000 },
      { day: "Wed", engagement: 4.8, reach: 22000 },
      { day: "Thu", engagement: 6.1, reach: 31000 },
      { day: "Fri", engagement: 5.5, reach: 27000 },
      { day: "Sat", engagement: 3.2, reach: 14000 },
      { day: "Sun", engagement: 2.8, reach: 12000 },
    ],
    linkedin: [
      { day: "Mon", engagement: 5.5, reach: 15000 },
      { day: "Tue", engagement: 6.8, reach: 21000 },
      { day: "Wed", engagement: 7.2, reach: 24000 },
      { day: "Thu", engagement: 6.5, reach: 19000 },
      { day: "Fri", engagement: 5.8, reach: 17000 },
      { day: "Sat", engagement: 2.1, reach: 5000 },
      { day: "Sun", engagement: 1.8, reach: 4000 },
    ],
  };

  // Use real engagement data for YouTube, fallback to mock for others
  const realEngagement = getRealEngagementData();
  const engagementTrend = selectedPlatform === "youtube" && realEngagement
    ? realEngagement
    : (engagementByPlatform[selectedPlatform] || engagementByPlatform.all);

  // Comprehensive platform-specific data
  const platformData: Record<string, {
    impressions: number;
    engagement: number;
    comments: number;
    shares: number;
    growth: number;
    uniqueMetric: { label: string; value: string; icon: string };
    contentTypes: { name: string; engagement: number }[];
    trendingNiches: { name: string; growth: string }[];
    bestPostingTimes: string[];
    audienceAge: string;
    topHashtags: string[];
  }> = {
    all: {
      impressions: 2547831,
      engagement: 11.7,
      comments: 45678,
      shares: 18234,
      growth: 23.8,
      uniqueMetric: { label: "Total Reach", value: "4.2M", icon: "👥" },
      contentTypes: [
        { name: "Reel", engagement: 9.2 },
        { name: "Carousel", engagement: 6.2 },
        { name: "Image", engagement: 4.1 },
        { name: "Video", engagement: 7.8 },
        { name: "Story", engagement: 3.5 },
      ],
      trendingNiches: [
        { name: "AI & Tech", growth: "+45%" },
        { name: "Health & Wellness", growth: "+32%" },
        { name: "Personal Finance", growth: "+28%" },
      ],
      bestPostingTimes: ["7 PM - 9 PM", "12 PM - 1 PM"],
      audienceAge: "25-34 (42%)",
      topHashtags: ["#contentcreator", "#growth", "#business"],
    },
    instagram: {
      impressions: 1250000,
      engagement: 12.5,
      comments: 28000,
      shares: 12000,
      growth: 28.5,
      uniqueMetric: { label: "Followers", value: "125.4K", icon: "👤" },
      contentTypes: [
        { name: "Reel", engagement: 14.2 },
        { name: "Carousel", engagement: 9.8 },
        { name: "Story", engagement: 6.5 },
        { name: "Image", engagement: 4.2 },
        { name: "Live", engagement: 8.1 },
      ],
      trendingNiches: [
        { name: "Aesthetic/Lifestyle", growth: "+52%" },
        { name: "Fitness Reels", growth: "+41%" },
        { name: "Food Content", growth: "+35%" },
        { name: "Travel", growth: "+28%" },
      ],
      bestPostingTimes: ["7 PM - 9 PM (Thu/Fri)", "12 PM (Lunch)"],
      audienceAge: "18-24 (38%), 25-34 (35%)",
      topHashtags: ["#reels", "#instagood", "#explorepage", "#trending"],
    },
    youtube: {
      impressions: 820000,
      engagement: 5.2,
      comments: 9500,
      shares: 3200,
      growth: 15.2,
      uniqueMetric: { label: "Subscribers", value: "48.2K", icon: "🔔" },
      contentTypes: [
        { name: "Short", engagement: 8.5 },
        { name: "Tutorial", engagement: 6.2 },
        { name: "Vlog", engagement: 4.8 },
        { name: "Review", engagement: 5.5 },
        { name: "Podcast", engagement: 3.2 },
      ],
      trendingNiches: [
        { name: "AI Tutorials", growth: "+68%" },
        { name: "Tech Reviews", growth: "+42%" },
        { name: "Productivity", growth: "+35%" },
        { name: "Gaming", growth: "+25%" },
      ],
      bestPostingTimes: ["5 PM - 8 PM (Sat/Sun)", "3 PM (Weekdays)"],
      audienceAge: "25-34 (45%), 35-44 (28%)",
      topHashtags: ["#youtube", "#shorts", "#tutorial", "#howto"],
    },
    twitter: {
      impressions: 350000,
      engagement: 3.8,
      comments: 5200,
      shares: 1800,
      growth: 8.5,
      uniqueMetric: { label: "Followers", value: "32.1K", icon: "🐦" },
      contentTypes: [
        { name: "Thread", engagement: 6.8 },
        { name: "Quote", engagement: 4.2 },
        { name: "Image", engagement: 3.5 },
        { name: "Poll", engagement: 5.1 },
        { name: "Link", engagement: 2.1 },
      ],
      trendingNiches: [
        { name: "Tech News", growth: "+55%" },
        { name: "Crypto/Web3", growth: "+38%" },
        { name: "Startup Tips", growth: "+32%" },
        { name: "Hot Takes", growth: "+45%" },
      ],
      bestPostingTimes: ["9 AM - 11 AM (Tue/Wed)", "4 PM (Breaking news)"],
      audienceAge: "25-34 (48%), 35-44 (32%)",
      topHashtags: ["#tech", "#startup", "#thread", "#buildinpublic"],
    },
    linkedin: {
      impressions: 127831,
      engagement: 4.5,
      comments: 2978,
      shares: 1234,
      growth: 12.1,
      uniqueMetric: { label: "Connections", value: "8.5K", icon: "💼" },
      contentTypes: [
        { name: "Document", engagement: 8.2 },
        { name: "Poll", engagement: 6.5 },
        { name: "Article", engagement: 4.8 },
        { name: "Video", engagement: 5.2 },
        { name: "Post", engagement: 3.8 },
      ],
      trendingNiches: [
        { name: "AI in Business", growth: "+72%" },
        { name: "Remote Work", growth: "+45%" },
        { name: "Leadership", growth: "+38%" },
        { name: "Career Growth", growth: "+52%" },
      ],
      bestPostingTimes: ["8 AM - 10 AM (Tue-Thu)", "5 PM (End of work)"],
      audienceAge: "25-34 (42%), 35-44 (38%)",
      topHashtags: ["#leadership", "#career", "#hiring", "#business"],
    },
  };

  const currentPlatform = platformData[selectedPlatform] || platformData.all;

  // Use real YouTube data when available
  const youtubeMetrics = getYoutubeMetrics();
  const currentMetrics = selectedPlatform === "youtube" && youtubeMetrics ? {
    impressions: youtubeMetrics.recentViews,
    engagement: parseFloat(youtubeMetrics.engagementRate),
    comments: youtubeMetrics.recentComments,
    shares: youtubeMetrics.recentLikes, // Using likes as shares equivalent for YouTube
    growth: 15.2, // Would need historical data to calculate real growth
    subscribers: youtubeMetrics.subscribers,
    channelName: youtubeMetrics.channelName,
    totalViews: youtubeMetrics.totalViews,
    videoCount: youtubeMetrics.videoCount,
  } : {
    impressions: currentPlatform.impressions,
    engagement: currentPlatform.engagement,
    comments: currentPlatform.comments,
    shares: currentPlatform.shares,
    growth: currentPlatform.growth,
  };

  // Use real content type performance for YouTube, fallback to mock for others
  const realContentPerformance = getRealContentTypePerformance();
  const contentPerformance = selectedPlatform === "youtube" && realContentPerformance
    ? realContentPerformance
    : currentPlatform.contentTypes;

  const platformMetrics = analyticsData?.platforms || [
    { platform: "instagram", engagement_rate: 8.5, impressions: 450000 },
    { platform: "youtube", engagement_rate: 5.2, impressions: 320000 },
    { platform: "twitter", engagement_rate: 3.8, impressions: 180000 },
    { platform: "linkedin", engagement_rate: 4.5, impressions: 120000 },
  ];

  // Calculate real YouTube radar metrics from video data
  const getYoutubeRadarScore = () => {
    if (!youtubeMetrics) return { engagement: 72, reach: 88, growth: 82, consistency: 65, virality: 90 };

    // Engagement: Based on engagement rate (scale to 0-100)
    const engagementScore = Math.min(100, parseFloat(youtubeMetrics.engagementRate) * 20);

    // Reach: Based on subscriber count (logarithmic scale)
    const subscribers = youtubeMetrics.subscribers || 0;
    const reachScore = Math.min(100, Math.log10(subscribers + 1) * 12);

    // Virality: Based on avg views per video vs subscriber count
    const avgViews = youtubeMetrics.recentViews / 6;
    const viralityRatio = subscribers > 0 ? (avgViews / subscribers) * 100 : 0;
    const viralityScore = Math.min(100, viralityRatio * 10);

    // Growth: Based on views to subscriber ratio
    const growthScore = Math.min(100, (youtubeMetrics.totalViews / (subscribers * 100)) * 50);

    // Consistency: Based on video count
    const consistencyScore = Math.min(100, youtubeMetrics.videoCount / 10);

    return {
      engagement: Math.round(engagementScore),
      reach: Math.round(reachScore),
      growth: Math.round(growthScore),
      consistency: Math.round(consistencyScore),
      virality: Math.round(viralityScore),
    };
  };

  const ytScores = getYoutubeRadarScore();

  const radarData = [
    { metric: "Engagement", instagram: 85, youtube: ytScores.engagement, twitter: 45, linkedin: 58 },
    { metric: "Reach", instagram: 90, youtube: ytScores.reach, twitter: 55, linkedin: 42 },
    { metric: "Growth", instagram: 75, youtube: ytScores.growth, twitter: 60, linkedin: 70 },
    { metric: "Consistency", instagram: 80, youtube: ytScores.consistency, twitter: 70, linkedin: 85 },
    { metric: "Virality", instagram: 70, youtube: ytScores.virality, twitter: 80, linkedin: 35 },
  ];

  const handleExport = () => {
    const csvData = `Platform,Engagement Rate,Impressions,Likes,Comments
Instagram,${platformMetrics[0]?.engagement_rate}%,${platformMetrics[0]?.impressions},45000,2300
YouTube,${platformMetrics[1]?.engagement_rate}%,${platformMetrics[1]?.impressions},32000,1800
Twitter,${platformMetrics[2]?.engagement_rate}%,${platformMetrics[2]?.impressions},18000,950
LinkedIn,${platformMetrics[3]?.engagement_rate}%,${platformMetrics[3]?.impressions},12000,680`;

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `social_leaf_analytics_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-soft">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">Analytics</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {refreshCooldown && (
              <span className="text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                {refreshCooldown}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => fetchAnalyticsData(false)}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleExport} className="bg-primary">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Platform Filter */}
        <div className="flex gap-2">
          {["all", "instagram", "youtube", "twitter", "linkedin"].map((platform) => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPlatform(platform)}
              className="capitalize"
            >
              {platform === "all" ? "All Platforms" : platform}
            </Button>
          ))}
        </div>

        {/* YouTube Channel Banner - Shows which channel's analytics we're viewing */}
        {selectedPlatform === "youtube" && youtubeMetrics && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent rounded-xl p-4 border border-red-500/20 flex items-center gap-4"
          >
            <img
              src={realYoutubeData?.channel?.thumbnail}
              alt={youtubeMetrics.channelName}
              className="h-14 w-14 rounded-full border-2 border-red-500/30"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-500" />
                <h3 className="font-semibold text-lg">{youtubeMetrics.channelName}</h3>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  Live Data
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatNumber(youtubeMetrics.subscribers)} subscribers • {formatNumber(youtubeMetrics.totalViews)} total views • {youtubeMetrics.videoCount} videos
              </p>
            </div>
            <a
              href={`https://youtube.com/${realYoutubeData?.channel?.customUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-red-500 hover:text-red-400 font-medium"
            >
              View Channel →
            </a>
          </motion.div>
        )}

        {/* Key Metrics - Platform-specific */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: selectedPlatform === "all" ? "Total Impressions" : `${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Impressions`,
              value: currentMetrics.impressions >= 1000000
                ? `${(currentMetrics.impressions / 1000000).toFixed(1)}M`
                : `${(currentMetrics.impressions / 1000).toFixed(0)}K`,
              icon: Eye,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              label: "Engagement Rate",
              value: `${currentMetrics.engagement}%`,
              icon: Zap,
              color: "text-amber-500",
              bg: "bg-amber-500/10",
            },
            {
              label: "Growth Rate",
              value: `+${currentMetrics.growth}%`,
              icon: TrendingUp,
              color: "text-green-500",
              bg: "bg-green-500/10",
            },
            {
              label: "Total Engagement",
              value: `${((currentMetrics.comments + currentMetrics.shares) / 1000).toFixed(1)}K`,
              icon: Target,
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-5 border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{isLoading ? "..." : stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Platform-Specific Insights Row */}
        {selectedPlatform !== "all" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-4"
          >
            {/* Unique Platform Metric */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-5 border border-primary/20 relative">
              {/* Live Data Indicator for YouTube */}
              {selectedPlatform === "youtube" && youtubeMetrics && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                  </span>
                  Live
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{currentPlatform.uniqueMetric.icon}</span>
                <span className="text-sm text-muted-foreground">{currentPlatform.uniqueMetric.label}</span>
              </div>
              <p className="text-3xl font-bold text-primary">
                {selectedPlatform === "youtube" && youtubeMetrics
                  ? formatNumber(youtubeMetrics.subscribers)
                  : currentPlatform.uniqueMetric.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedPlatform === "youtube" && youtubeMetrics
                  ? `${youtubeMetrics.channelName} • Real Data`
                  : `on ${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}`}
              </p>
            </div>

            {/* Trending Niches */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">🔥 Trending on {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}</h4>
              <div className="space-y-2">
                {currentPlatform.trendingNiches.slice(0, 3).map((niche, i) => (
                  <div key={niche.name} className="flex items-center justify-between">
                    <span className="text-sm">{niche.name}</span>
                    <span className="text-xs text-green-500 font-medium">{niche.growth}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Hashtags */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">🏷️ Top Hashtags</h4>
              <div className="flex flex-wrap gap-2">
                {currentPlatform.topHashtags.map((tag) => (
                  <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Audience: {currentPlatform.audienceAge}</p>
            </div>
          </motion.div>
        )}

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Engagement Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h3 className="font-semibold text-lg mb-4">Weekly Engagement Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={engagementTrend}>
                <defs>
                  <linearGradient id="engGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="engagement"
                  stroke="hsl(142, 71%, 45%)"
                  fill="url(#engGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Content Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h3 className="font-semibold text-lg mb-4">Content Type Performance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={contentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="engagement" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Platform Comparison Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <h3 className="font-semibold text-lg mb-4">
            {selectedPlatform === "all"
              ? "Cross-Platform Performance Radar"
              : `${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Performance Radar`}
            {selectedPlatform === "youtube" && youtubeMetrics && (
              <span className="ml-2 text-xs font-normal text-green-500">(Real Data)</span>
            )}
          </h3>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                {(selectedPlatform === "all" || selectedPlatform === "instagram") && (
                  <Radar name="Instagram" dataKey="instagram" stroke={platformColors.instagram} fill={platformColors.instagram} fillOpacity={selectedPlatform === "instagram" ? 0.5 : 0.3} />
                )}
                {(selectedPlatform === "all" || selectedPlatform === "youtube") && (
                  <Radar name="YouTube" dataKey="youtube" stroke={platformColors.youtube} fill={platformColors.youtube} fillOpacity={selectedPlatform === "youtube" ? 0.5 : 0.3} />
                )}
                {(selectedPlatform === "all" || selectedPlatform === "twitter") && (
                  <Radar name="Twitter" dataKey="twitter" stroke={platformColors.twitter} fill={platformColors.twitter} fillOpacity={selectedPlatform === "twitter" ? 0.5 : 0.3} />
                )}
                {(selectedPlatform === "all" || selectedPlatform === "linkedin") && (
                  <Radar name="LinkedIn" dataKey="linkedin" stroke={platformColors.linkedin} fill={platformColors.linkedin} fillOpacity={selectedPlatform === "linkedin" ? 0.5 : 0.3} />
                )}
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 justify-center">
              {Object.entries(platformColors).map(([platform, color]) => (
                <div key={platform} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm capitalize">{platform}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Best Time to Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Best Times to Post</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { platform: "Instagram", times: ["7:00 PM", "9:00 PM", "12:00 PM"], best: "Thursday" },
              { platform: "YouTube", times: ["5:00 PM", "8:00 PM"], best: "Saturday" },
              { platform: "Twitter", times: ["9:00 AM", "12:00 PM"], best: "Tuesday" },
              { platform: "LinkedIn", times: ["8:00 AM", "5:00 PM"], best: "Wednesday" },
            ].map((item) => (
              <div key={item.platform} className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2">{item.platform}</h4>
                <p className="text-sm text-muted-foreground mb-2">Best day: <span className="text-foreground font-medium">{item.best}</span></p>
                <div className="flex flex-wrap gap-1">
                  {item.times.map((time) => (
                    <span key={time} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {time}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
