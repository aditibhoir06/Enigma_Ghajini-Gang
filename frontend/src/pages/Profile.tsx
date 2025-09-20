import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, MapPin, Calendar, LogOut, Settings, FileText, MessageCircle, Star, Brain, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";

export default function Profile() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [quizStats, setQuizStats] = useState({
    totalPoints: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    bestScore: 0,
    currentStreak: 0,
    achievements: []
  });

  useEffect(() => {
    loadQuizStats();
  }, []);

  const loadQuizStats = async () => {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await apiClient.getUserQuizStats();
      // if (response.success && response.data) {
      //   setQuizStats(response.data);
      // }

      // Mock data for now
      setQuizStats({
        totalPoints: 150,
        quizzesCompleted: 5,
        averageScore: 85,
        bestScore: 95,
        currentStreak: 3,
        achievements: []
      });
    } catch (error) {
      console.error("Failed to load quiz stats:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Profile Header */}
      <Card className="shadow-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <User className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">{user?.email || "User"}</CardTitle>
          <CardDescription className="flex items-center justify-center space-x-1">
            <Mail className="h-4 w-4" />
            <span>{user?.email || "No email"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>Bihar, India</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>
                Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric'
                }) : 'Recently'}
              </span>
            </div>
          </div>
          <div className="flex justify-center">
            <Badge variant="secondary">Active User</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Your Activity</CardTitle>
          <CardDescription>Summary of your engagement with government services</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
              <FileText className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-xs text-muted-foreground">Schemes Found</p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-financial rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="h-6 w-6 text-financial-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-xs text-muted-foreground">Chat Sessions</p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{quizStats.totalPoints}</p>
              <p className="text-xs text-muted-foreground">Quiz Points</p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-gradient-success rounded-full flex items-center justify-center mx-auto">
              <Star className="h-6 w-6 text-success-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-xs text-muted-foreground">Reviews Posted</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Performance */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
            Quiz Performance
          </CardTitle>
          <CardDescription>Your financial literacy progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center space-y-1">
              <p className="text-xl font-bold text-primary">{quizStats.quizzesCompleted}</p>
              <p className="text-sm text-muted-foreground">Quizzes Done</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xl font-bold text-success">{quizStats.averageScore}%</p>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xl font-bold text-yellow-600">{quizStats.bestScore}%</p>
              <p className="text-sm text-muted-foreground">Best Score</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-muted-foreground">Current Streak: {quizStats.currentStreak} quizzes</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/quiz")}
            >
              <Brain className="h-4 w-4 mr-2" />
              Take Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Account Settings
          </Button>

          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            My Applications
          </Button>

          <Button variant="outline" className="w-full justify-start">
            <Brain className="h-4 w-4 mr-2" />
            Quiz History
          </Button>

          <Button variant="outline" className="w-full justify-start">
            <Star className="h-4 w-4 mr-2" />
            My Reviews
          </Button>
        </CardContent>
      </Card>

      {/* Help & Support */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Help & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact Support
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <FileText className="h-4 w-4 mr-2" />
            FAQ & Guidelines
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="shadow-card border-destructive/20">
        <CardContent className="pt-6">
          <Button
            onClick={handleLogout}
            variant="destructive"
            className="w-full"
            disabled={isLoading}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isLoading ? "Signing Out..." : "Sign Out"}
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center text-xs text-muted-foreground pb-4">
        <p>Government Services Helper v1.0</p>
        <p>Made for rural India 🇮🇳</p>
      </div>
    </div>
  );
}