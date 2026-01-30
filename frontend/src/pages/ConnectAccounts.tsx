import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Facebook,
  CheckCircle2,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const platforms = [
  { 
    id: "instagram",
    name: "Instagram", 
    icon: Instagram, 
    color: "from-pink-500 to-purple-500",
    description: "Connect your Instagram Business or Creator account"
  },
  { 
    id: "twitter",
    name: "Twitter/X", 
    icon: Twitter, 
    color: "from-blue-400 to-blue-600",
    description: "Connect your Twitter account for analytics"
  },
  { 
    id: "linkedin",
    name: "LinkedIn", 
    icon: Linkedin, 
    color: "from-blue-600 to-blue-800",
    description: "Connect your LinkedIn Page for insights"
  },
  { 
    id: "youtube",
    name: "YouTube", 
    icon: Youtube, 
    color: "from-red-500 to-red-600",
    description: "Connect your YouTube channel"
  },
  { 
    id: "facebook",
    name: "Facebook", 
    icon: Facebook, 
    color: "from-blue-500 to-blue-700",
    description: "Connect your Facebook Page"
  },
];

const ConnectAccounts = () => {
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    // Simulate connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnectedPlatforms(prev => [...prev, platformId]);
    setConnecting(null);
  };

  const handleDisconnect = (platformId: string) => {
    setConnectedPlatforms(prev => prev.filter(id => id !== platformId));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="max-w-2xl mx-auto text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-leaf-100 text-leaf-700 text-sm font-medium mb-6"
            >
              Step 1 of 2
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Connect your social accounts
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-muted-foreground"
            >
              Link your accounts to start tracking analytics across all platforms.
              Your data is securely encrypted.
            </motion.p>
          </div>

          {/* Progress */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {connectedPlatforms.length} of {platforms.length} connected
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round((connectedPlatforms.length / platforms.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(connectedPlatforms.length / platforms.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Platform Cards */}
          <div className="max-w-2xl mx-auto space-y-4">
            {platforms.map((platform, index) => {
              const isConnected = connectedPlatforms.includes(platform.id);
              const isConnecting = connecting === platform.id;

              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className={`p-6 rounded-2xl border transition-all duration-300 ${
                    isConnected 
                      ? "bg-leaf-50 border-primary" 
                      : "bg-card border-border hover:shadow-card"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center`}>
                        <platform.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{platform.name}</h3>
                          {isConnected && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{platform.description}</p>
                      </div>
                    </div>

                    {isConnected ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDisconnect(platform.id)}
                      >
                        Disconnect
                      </Button>
                    ) : (
                      <Button 
                        variant="hero" 
                        size="sm"
                        onClick={() => handleConnect(platform.id)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="max-w-2xl mx-auto mt-12 flex justify-between items-center"
          >
            <Button variant="ghost" asChild>
              <Link to="/">Skip for now</Link>
            </Button>
            <Button 
              variant="hero" 
              size="lg" 
              asChild
              disabled={connectedPlatforms.length === 0}
            >
              <Link to="/dashboard">
                Continue to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ConnectAccounts;
