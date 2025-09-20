import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { VoiceNavigationProvider } from "./components/VoiceNavigationProvider";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Schemes from "./pages/Schemes";
import Chatbot from "./pages/Chatbot";
import Quiz from "./pages/Quiz";
import Reviews from "./pages/Reviews";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <VoiceNavigationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected App Routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route path="schemes" element={<Schemes />} />
                <Route path="chatbot" element={<Chatbot />} />
                <Route path="quiz" element={<Quiz />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Legacy redirects for protected routes */}
              <Route path="/schemes" element={<Navigate to="/app/schemes" replace />} />
              <Route path="/chatbot" element={<Navigate to="/app/chatbot" replace />} />
              <Route path="/quiz" element={<Navigate to="/app/quiz" replace />} />
              <Route path="/reviews" element={<Navigate to="/app/reviews" replace />} />
              <Route path="/profile" element={<Navigate to="/app/profile" replace />} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </VoiceNavigationProvider>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
