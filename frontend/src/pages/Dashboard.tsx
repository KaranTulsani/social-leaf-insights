import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Youtube
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
import { Sidebar } from "@/components/layout/Sidebar";

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
  const [isLoading, setIsLoading] = useState(true);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showTomorrowTip, setShowTomorrowTip] = useState(false);
  const [showIdeas, setShowIdeas] = useState(false);

  const [userName, setUserName] = useState("John Doe");
  const [userInitials, setUserInitials] = useState("JD");

  // Dashboard data from API
  const [dashboardData, setDashboardData] = useState<{
    overview: { total_impressions: number; engagement_rate: number; total_comments: number; total_shares: number; growth_rate: number };
    insights: Array<{ type: string; summary: string }>;
    recommendations: Array<{ type: string; content: string; priority: number }>;
  } | null>(null);

  useEffect(() => {
    const hasConnected = localStorage.getItem("hasConnectedAccounts");
    if (!hasConnected) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => setShowConnectModal(true), 500);
      return () => clearTimeout(timer);
    }

    // Get user data
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

    // Fetch dashboard data from backend
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8000/demo/full-dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const data = dashboardData?.overview || { total_impressions: 2547831, engagement_rate: 11.7, total_comments: 45678, total_shares: 18234 };
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

  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiResponse(""); // Clear previous
    setIsAiTyping(true);

    // Get smart response based on query
    const query = aiQuery.toLowerCase();
    let response = "";

    if (query.includes("best") && query.includes("post")) {
      response = `📊 Your top performing content this month:\n\n🥇 "Product Launch Carousel" - 12.4% engagement (3.2x above average)\n🥈 "Behind the Scenes Reel" - 9.8% engagement\n🥉 "Industry Tips Thread" - 7.2% engagement\n\n💡 Key insight: Carousel posts with 5-7 slides perform 40% better than single images.`;
    } else if (query.includes("time") || query.includes("when")) {
      response = `⏰ Best times to post for YOUR audience:\n\n📱 Instagram: 7-9 PM (Thu/Fri)\n🎬 YouTube: 5-8 PM (Sat)\n🐦 Twitter: 9-11 AM (Tue/Wed)\n💼 LinkedIn: 8-10 AM (Tue-Thu)\n\n📈 Posts during these times get 45% more engagement!`;
    } else if (query.includes("grow") || query.includes("improve") || query.includes("increase")) {
      response = `🚀 Growth Strategy Recommendations:\n\n1. Create more Reels/Shorts (3.2x higher reach)\n2. Post consistently at peak hours\n3. Use carousel posts for educational content\n4. Engage with comments within first hour\n5. Use 5-7 niche hashtags per post\n\n📊 Following these could increase engagement by 40-60%!`;
    } else if (query.includes("drop") || query.includes("decrease") || query.includes("why")) {
      response = `🔍 Analysis of recent engagement drop:\n\n⚠️ Possible causes:\n• Algorithm changes on Instagram (detected Jan 15)\n• Lower posting frequency this week\n• Less video content than usual\n\n✅ Recommendations:\n• Increase Reels production\n• Post at 7 PM instead of 3 PM\n• Add more call-to-actions in captions`;
    } else {
      response = `📊 Based on your analytics (${(dashboardData?.overview?.total_impressions || 2500000) > 1000000 ? '2.5M+' : '~1M'} impressions, ${dashboardData?.overview?.engagement_rate || 11.7}% engagement):\n\n✨ Key Insights:\n• Your Reels outperform images by 3.2x\n• Best engagement day: Thursday\n• Top hashtag: #ContentCreator\n\n💡 Tip: Try asking "When should I post?" or "How to grow my engagement?"`;
    }

    // Typing animation - character by character
    setAiQuery("");
    for (let i = 0; i <= response.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 15));
      setAiResponse(response.slice(0, i));
    }
    setIsAiTyping(false);
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

  return (
    <div className="min-h-screen bg-muted flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border px-6 py-4 h-[65px] flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
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
              <Button variant="hero" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: "Total Impressions",
                value: dashboardData?.overview?.total_impressions
                  ? `${(dashboardData.overview.total_impressions / 1000000).toFixed(1)}M`
                  : "1.2M",
                change: `+${dashboardData?.overview?.growth_rate || 12.5}%`,
                icon: Eye,
                color: "text-blue-500"
              },
              {
                label: "Engagement Rate",
                value: `${dashboardData?.overview?.engagement_rate || 8.4}%`,
                change: "+2.1%",
                icon: Heart,
                color: "text-rose-500"
              },
              {
                label: "Total Comments",
                value: dashboardData?.overview?.total_comments
                  ? `${(dashboardData.overview.total_comments / 1000).toFixed(1)}K`
                  : "23.4K",
                change: "+18.2%",
                icon: MessageCircle,
                color: "text-amber-500"
              },
              {
                label: "Total Shares",
                value: dashboardData?.overview?.total_shares
                  ? `${(dashboardData.overview.total_shares / 1000).toFixed(1)}K`
                  : "8.9K",
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-lg font-semibold text-foreground">Engagement Overview</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-pink-500" />
                    <span className="text-muted-foreground">Instagram</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-400" />
                    <span className="text-muted-foreground">Twitter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-700" />
                    <span className="text-muted-foreground">LinkedIn</span>
                  </div>
                </div>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementData}>
                    <defs>
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
                    <Area type="monotone" dataKey="instagram" stroke="#ec4899" fill="url(#colorInstagram)" strokeWidth={2} />
                    <Area type="monotone" dataKey="twitter" stroke="#60a5fa" fill="url(#colorTwitter)" strokeWidth={2} />
                    <Area type="monotone" dataKey="linkedin" stroke="#1d4ed8" fill="url(#colorLinkedin)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Content Type Chart */}
            <motion.div
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
                      data={contentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {contentTypeData.map((entry, index) => (
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
                {contentTypeData.map((item) => (
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
                <Button variant="ghost" size="sm">View all</Button>
              </div>

              <div className="space-y-4">
                {recentPosts.map((post) => {
                  const PlatformIcon = post.platform === "instagram" ? Instagram
                    : post.platform === "twitter" ? Twitter
                      : post.platform === "youtube" ? Youtube
                        : Linkedin;

                  return (
                    <div key={post.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${post.platform === "instagram" ? "bg-gradient-to-br from-pink-500 to-purple-500"
                        : post.platform === "twitter" ? "bg-blue-400"
                          : post.platform === "youtube" ? "bg-red-500"
                            : "bg-blue-700"
                        }`}>
                        <PlatformIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{post.title}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {post.likes.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" /> {post.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" /> {post.shares}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
