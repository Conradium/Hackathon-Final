import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingScreen from "@/components/LoadingScreen";
import Layout from "@/components/Layout"; // 🌟 Centralized Layout for consistency

// 🚀 Lazy Load Pages for Better Performance
const Index = lazy(() => import("@/pages/Index").then(m => ({ default: m.default })));
const Chatbot = lazy(() => import("@/pages/Chatbot").then(m => ({ default: m.default })));
const NotFound = lazy(() => import("@/pages/NotFound").then(m => ({ default: m.default })));

// 🌟 Initialize Query Client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <Router>
        <ErrorBoundary>
          {/* 🚀 Suspense provides smooth loading experience */}
          <Suspense fallback={<LoadingScreen />}>
            <Layout> {/* 🌟 Wrap with Layout for Consistency */}
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/chatbot" element={<Chatbot />} />
                {/* 🚀 Catch-All Route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;