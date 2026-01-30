import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import BrandCampaigns from "./pages/BrandCampaigns";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ConnectAccounts from "./pages/ConnectAccounts";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Performance from "./pages/Performance";
import Audience from "./pages/Audience";
import Settings from "./pages/Settings";
import VoiceCoach from "./pages/VoiceCoach";
import HookDetector from "./pages/HookDetector";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/brand-campaigns" element={<BrandCampaigns />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/connect-accounts" element={<ConnectAccounts />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <ProtectedRoute>
                <Performance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audience"
            element={
              <ProtectedRoute>
                <Audience />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voice-coach"
            element={
              <ProtectedRoute>
                <VoiceCoach />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hook-detector"
            element={
              <ProtectedRoute>
                <HookDetector />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
