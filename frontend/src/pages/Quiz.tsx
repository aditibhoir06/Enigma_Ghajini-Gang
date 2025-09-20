import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Brain, Trophy, Clock, Target, ChevronRight, RotateCcw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  explanation?: string;
}

interface QuizState {
  questions: Question[];
  currentQuestion: number;
  selectedAnswers: (number | null)[];
  score: number;
  isCompleted: boolean;
  timeElapsed: number;
  isLoading: boolean;
}

export default function Quiz() {
  const { user } = useAuth();
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestion: 0,
    selectedAnswers: [],
    score: 0,
    isCompleted: false,
    timeElapsed: 0,
    isLoading: false,
  });

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    quizzesCompleted: 0,
    averageScore: 0
  });

  // Mock questions for development - will be replaced with AI-generated ones
  const mockQuestions: Question[] = [
    {
      id: "1",
      question: "What percentage of your monthly income should you save?",
      options: ["5-10%", "20-30%", "50-60%", "70-80%"],
      correctAnswer: 1,
      difficulty: "beginner",
      category: "savings",
      explanation: "Financial experts recommend saving 20-30% of your income for a secure financial future."
    },
    {
      id: "2",
      question: "How many months of expenses should you keep in an emergency fund?",
      options: ["1-2 months", "3-6 months", "12 months", "24 months"],
      correctAnswer: 1,
      difficulty: "beginner",
      category: "emergency fund",
      explanation: "An emergency fund should cover at least 3-6 months of your living expenses."
    },
    {
      id: "3",
      question: "How much money do farmers receive annually under the PM-KISAN scheme?",
      options: ["₹4,000", "₹6,000", "₹8,000", "₹10,000"],
      correctAnswer: 1,
      difficulty: "intermediate",
      category: "government schemes",
      explanation: "Under the PM-KISAN scheme, farmers receive ₹6,000 per year in three installments."
    }
  ];

  useEffect(() => {
    loadQuiz();
    loadUserStats();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!quizState.isCompleted && quizState.questions.length > 0) {
      interval = setInterval(() => {
        setQuizState(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizState.isCompleted, quizState.questions.length]);

  const loadQuiz = async () => {
    setQuizState(prev => ({ ...prev, isLoading: true }));
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.getQuizQuestions();
      setQuizState(prev => ({
        ...prev,
        questions: mockQuestions,
        selectedAnswers: new Array(mockQuestions.length).fill(null),
        isLoading: false
      }));
    } catch (error) {
      toast.error("Failed to load quiz questions");
      setQuizState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadUserStats = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.getUserQuizStats();
      setUserStats({
        totalPoints: 150,
        quizzesCompleted: 5,
        averageScore: 85
      });
    } catch (error) {
      console.error("Failed to load user stats:", error);
    }
  };

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedOption === null) return;

    const currentQ = quizState.questions[quizState.currentQuestion];
    const isCorrect = selectedOption === currentQ.correctAnswer;

    const newSelectedAnswers = [...quizState.selectedAnswers];
    newSelectedAnswers[quizState.currentQuestion] = selectedOption;

    const newScore = quizState.score + (isCorrect ? 10 : 0);

    if (quizState.currentQuestion === quizState.questions.length - 1) {
      // Quiz completed
      setQuizState(prev => ({
        ...prev,
        selectedAnswers: newSelectedAnswers,
        score: newScore,
        isCompleted: true
      }));

      // Submit quiz results
      try {
        // TODO: Replace with actual API call
        // await apiClient.submitQuizResults({
        //   score: newScore,
        //   timeElapsed: quizState.timeElapsed,
        //   answers: newSelectedAnswers
        // });
        toast.success(`Quiz completed! You scored ${newScore} points.`);
      } catch (error) {
        toast.error("Failed to submit quiz results");
      }
    } else {
      // Move to next question
      setQuizState(prev => ({
        ...prev,
        selectedAnswers: newSelectedAnswers,
        score: newScore,
        currentQuestion: prev.currentQuestion + 1
      }));
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const showAnswerExplanation = () => {
    setShowExplanation(true);
  };

  const restartQuiz = () => {
    setQuizState({
      questions: mockQuestions,
      currentQuestion: 0,
      selectedAnswers: new Array(mockQuestions.length).fill(null),
      score: 0,
      isCompleted: false,
      timeElapsed: 0,
      isLoading: false
    });
    setSelectedOption(null);
    setShowExplanation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quizState.isLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
            <p>Loading quiz questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizState.isCompleted) {
    const percentage = Math.round((quizState.score / (quizState.questions.length * 10)) * 100);

    return (
      <div className="min-h-screen p-4 space-y-6">
        {/* Results Summary */}
        <Card className="shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
            <CardDescription>Great job on completing the financial literacy quiz</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-3xl font-bold text-primary">{quizState.score} Points</p>
              <p className="text-lg text-muted-foreground">{percentage}% Score</p>
              <Progress value={percentage} className="w-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold">{quizState.questions.length}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-success">
                  {quizState.selectedAnswers.filter((answer, index) =>
                    answer === quizState.questions[index].correctAnswer
                  ).length}
                </p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold">{formatTime(quizState.timeElapsed)}</p>
                <p className="text-sm text-muted-foreground">Time</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-2xl font-bold text-primary">+{quizState.score}</p>
                <p className="text-sm text-muted-foreground">Points</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={restartQuiz} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Take Another Quiz
              </Button>
              <Button variant="outline" className="flex-1">
                View Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-primary">{userStats.totalPoints}</p>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">{userStats.quizzesCompleted}</p>
              <p className="text-sm text-muted-foreground">Quizzes Done</p>
            </div>
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold">{userStats.averageScore}%</p>
              <p className="text-sm text-muted-foreground">Avg Score</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quizState.questions[quizState.currentQuestion];
  const progress = ((quizState.currentQuestion + 1) / quizState.questions.length) * 100;

  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Quiz Header */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-medium">Financial Quiz</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(quizState.timeElapsed)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>{quizState.score} pts</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Question {quizState.currentQuestion + 1} of {quizState.questions.length}</span>
              <Badge variant={currentQuestion?.difficulty === 'beginner' ? 'secondary' :
                             currentQuestion?.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                {currentQuestion?.difficulty}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion?.question}
          </CardTitle>
          <CardDescription>
            Choose the best answer from the options below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={selectedOption?.toString()}
            onValueChange={(value) => handleOptionSelect(parseInt(value))}
          >
            {currentQuestion?.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer py-2 text-base leading-relaxed"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {showExplanation && currentQuestion?.explanation && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Explanation:</p>
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {!showExplanation && selectedOption !== null && (
              <Button variant="outline" onClick={showAnswerExplanation}>
                Show Explanation
              </Button>
            )}
            <Button
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
              className="flex-1"
            >
              {quizState.currentQuestion === quizState.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-primary">{userStats.totalPoints}</p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
            <div>
              <p className="text-lg font-bold">{userStats.quizzesCompleted}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div>
              <p className="text-lg font-bold">{userStats.averageScore}%</p>
              <p className="text-xs text-muted-foreground">Avg Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}