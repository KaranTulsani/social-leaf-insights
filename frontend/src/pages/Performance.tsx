import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  BarChart3,
  Calendar,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const Performance = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/demo/full-dashboard");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Growth data
  const weeklyGrowth = [
    { week: "Week 1", engagement: 7.2, followers: 12300, reach: 45000 },
    { week: "Week 2", engagement: 8.1, followers: 12580, reach: 52000 },
    { week: "Week 3", engagement: 7.8, followers: 12890, reach: 48000 },
    { week: "Week 4", engagement: 11.7, followers: 13450, reach: 67000 },
  ];

  const monthlyGrowth = [
    { month: "Oct", engagement: 6.5, growth: 8 },
    { month: "Nov", engagement: 7.2, growth: 12 },
    { month: "Dec", engagement: 8.8, growth: 18 },
    { month: "Jan", engagement: 11.7, growth: 23.8 },
  ];

  // Best & Worst Posts
  const bestPosts = [
    {
      id: 1,
      title: "Product Launch Carousel",
      platform: "Instagram",
      engagement: "12.4%",
      reason: "Posted at peak hours (7 PM) with trending hashtags and strong CTA",
      type: "carousel",
    },
    {
      id: 2,
      title: "Behind the Scenes Reel",
      platform: "Instagram",
      engagement: "9.8%",
      reason: "Authentic content resonates well; first 3 seconds had strong hook",
      type: "reel",
    },
    {
      id: 3,
      title: "Industry Tips Thread",
      platform: "Twitter",
      engagement: "7.2%",
      reason: "Educational content with numbered format drives saves and shares",
      type: "thread",
    },
  ];

  const worstPosts = [
    {
      id: 1,
      title: "Monday Motivation Quote",
      platform: "Instagram",
      engagement: "1.2%",
      reason: "Generic content posted at low-engagement hours (2 PM); no unique value",
      type: "image",
    },
    {
      id: 2,
      title: "Product Update",
      platform: "LinkedIn",
      engagement: "0.8%",
      reason: "Promotional content without storytelling; posted on weekend",
      type: "post",
    },
  ];

  // Consistency Score
  const consistencyScore = 78;
  const postsThisMonth = 24;
  const postsLastMonth = 18;

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
              <span className="font-display text-xl font-bold">Performance</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            AI-Powered Analysis
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* AI Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl p-5 border border-primary/20"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">AI Performance Summary</h3>
              <p className="text-muted-foreground">
                Your engagement grew <span className="text-primary font-semibold">+23.8%</span> this month.
                Reels contributed <span className="text-primary font-semibold">45%</span> of total engagement.
                Peak performance occurred between <span className="text-primary font-semibold">7–9 PM on Thursday</span>.
                Consistency score improved by 12 points.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Growth Metrics Row */}
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { label: "Week-over-Week", value: "+18.2%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Month-over-Month", value: "+23.8%", icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Avg Engagement", value: "11.7%", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Consistency Score", value: `${consistencyScore}/100`, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl p-4 border border-border"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Growth Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h3 className="font-semibold mb-4">Engagement Growth (Monthly)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyGrowth}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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
                  fill="url(#growthGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <h3 className="font-semibold mb-4">Growth Rate Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke="hsl(200, 80%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(200, 80%, 50%)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Consistency Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold">Posting Consistency Score</h3>
            <span className="ml-auto text-xs bg-orange-500/10 text-orange-500 px-2 py-1 rounded">Unique Metric</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="hsl(var(--border))" strokeWidth="8" fill="none" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="hsl(25, 95%, 53%)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(consistencyScore / 100) * 352} 352`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{consistencyScore}</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Posts this month</span>
                <span className="font-medium">{postsThisMonth} posts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Posts last month</span>
                <span className="font-medium">{postsLastMonth} posts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Improvement</span>
                <span className="font-medium text-green-500">+33%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                💡 Consistent posting correlates with 40% higher reach. You're on track!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Best & Worst Posts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Best Posts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Top Performing Posts</h3>
            </div>
            <div className="space-y-4">
              {bestPosts.map((post, i) => (
                <div key={post.id} className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs text-green-600 font-medium">#{i + 1}</span>
                      <h4 className="font-medium">{post.title}</h4>
                      <p className="text-xs text-muted-foreground">{post.platform} • {post.type}</p>
                    </div>
                    <span className="text-lg font-bold text-green-500">{post.engagement}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-card/50 rounded p-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                    <span><strong>Why it worked:</strong> {post.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Worst Posts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Posts to Learn From</h3>
            </div>
            <div className="space-y-4">
              {worstPosts.map((post, i) => (
                <div key={post.id} className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{post.title}</h4>
                      <p className="text-xs text-muted-foreground">{post.platform} • {post.type}</p>
                    </div>
                    <span className="text-lg font-bold text-amber-500">{post.engagement}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-card/50 rounded p-2">
                    <XCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span><strong>Why it underperformed:</strong> {post.reason}</span>
                  </div>
                </div>
              ))}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                <p className="text-primary font-medium">💡 AI Recommendation</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Avoid generic quotes and promotional content. Focus on educational Reels and carousels posted during peak hours.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
