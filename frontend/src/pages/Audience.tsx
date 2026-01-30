import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Leaf,
  ArrowLeft,
  Users,
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  TrendingUp,
  Sparkles,
  Brain,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Audience = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Activity patterns
  const hourlyActivity = [
    { hour: "6AM", activity: 15 },
    { hour: "9AM", activity: 45 },
    { hour: "12PM", activity: 62 },
    { hour: "3PM", activity: 38 },
    { hour: "6PM", activity: 75 },
    { hour: "9PM", activity: 92 },
    { hour: "12AM", activity: 28 },
  ];

  const dailyActivity = [
    { day: "Mon", engagement: 68 },
    { day: "Tue", engagement: 82 },
    { day: "Wed", engagement: 79 },
    { day: "Thu", engagement: 95 },
    { day: "Fri", engagement: 88 },
    { day: "Sat", engagement: 45 },
    { day: "Sun", engagement: 38 },
  ];

  // Engagement behavior
  const engagementBreakdown = [
    { name: "Likes", value: 45, color: "#F43F5E" },
    { name: "Saves", value: 28, color: "#8B5CF6" },
    { name: "Comments", value: 15, color: "#3B82F6" },
    { name: "Shares", value: 12, color: "#10B981" },
  ];

  // Content preferences
  const contentPreferences = [
    { type: "Educational Carousels", engagement: 9.2, preference: 85 },
    { type: "Behind-the-Scenes Reels", engagement: 8.5, preference: 78 },
    { type: "Tutorial Videos", engagement: 7.8, preference: 72 },
    { type: "Product Showcases", engagement: 5.2, preference: 48 },
    { type: "Lifestyle Posts", engagement: 3.8, preference: 35 },
  ];

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
              <span className="font-display text-xl font-bold">Audience Insights</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-500 text-xs font-medium">
            <Brain className="h-3.5 w-3.5" />
            AI Persona Generated
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* AI Audience Persona - HACKATHON GOLD */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500/20 via-purple-500/10 to-transparent rounded-xl p-6 border border-purple-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">AI-Generated Audience Persona</h3>
                <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded-full">Confidence: 94%</span>
              </div>
              <div className="bg-card/50 rounded-lg p-4 border border-purple-500/10">
                <p className="text-foreground leading-relaxed">
                  <span className="font-semibold text-purple-500">Your audience consists of</span> working professionals aged 25-34,
                  predominantly in tech and creative industries. They engage most actively during <span className="font-semibold">evening hours (7-9 PM)</span> on weekdays,
                  suggesting they browse after work. They show a strong preference for <span className="font-semibold">educational content</span> and
                  are <span className="font-semibold">2.4x more likely to save</span> content than the average user, indicating high intent to
                  revisit and apply learnings.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {["🎯 Career-focused", "📚 Learners", "💼 Professionals", "🌙 Evening browsers", "💾 Savers"].map((tag) => (
                    <span key={tag} className="text-xs bg-purple-500/10 text-purple-600 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Activity Patterns */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Hourly Activity Pattern</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="activity" fill="hsl(200, 80%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-3">
              💡 <strong>Peak activity at 9 PM</strong> - Your audience is most active in the evening after work hours.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl p-6 border border-border"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold">Daily Engagement Pattern</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
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
            <p className="text-xs text-muted-foreground mt-3">
              💡 <strong>Thursday is your best day</strong> - Engagement peaks mid-week before the weekend slowdown.
            </p>
          </motion.div>
        </div>

        {/* Engagement Behavior */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-rose-500" />
            <h3 className="font-semibold">Engagement Behavior Analysis</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={engagementBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {engagementBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {engagementBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Key Insight:</strong> Your audience prefers saving content (28%)
                  over commenting (15%). This indicates high-intent users who want to revisit your content.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Preference Mapping */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-6 border border-border"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">Content Preference Mapping</h3>
          </div>
          <div className="space-y-4">
            {contentPreferences.map((item, i) => (
              <div key={item.type} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.type}</span>
                  <span className="text-muted-foreground">{item.engagement}% engagement</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.preference}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                    className="absolute h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, hsl(142, 71%, 45%) 0%, hsl(${142 - i * 20}, 71%, 45%) 100%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <p className="text-sm">
              <Zap className="inline h-4 w-4 text-amber-500 mr-1" />
              <strong>AI Recommendation:</strong> Educational carousels outperform lifestyle posts by <strong>142%</strong>.
              Double down on tutorial and educational content for maximum engagement.
            </p>
          </div>
        </motion.div>

        {/* Audience Behavior Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid md:grid-cols-3 gap-4"
        >
          {[
            {
              icon: Bookmark,
              label: "Save Rate",
              value: "2.4x",
              desc: "higher than average",
              color: "text-purple-500",
              bg: "bg-purple-500/10",
            },
            {
              icon: MessageCircle,
              label: "Comment Quality",
              value: "High",
              desc: "avg 12 words/comment",
              color: "text-blue-500",
              bg: "bg-blue-500/10",
            },
            {
              icon: Share2,
              label: "Share Propensity",
              value: "18%",
              desc: "of engagers share",
              color: "text-green-500",
              bg: "bg-green-500/10",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Audience;
