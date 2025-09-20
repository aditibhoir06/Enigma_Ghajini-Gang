import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  BookOpen,
  PiggyBank,
  CreditCard,
  Building2,
  Calculator,
  Target,
  Shield,
  Users,
  ArrowRight,
  Play,
  CheckCircle,
  IndianRupee,
  Lightbulb,
  Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoiceNavigationContext } from '@/components/VoiceNavigationProvider';
import { useVoiceShortcuts } from '@/hooks/useVoiceShortcuts';

const Index = () => {
  const navigate = useNavigate();
  const { speak } = useVoiceNavigationContext();
  const { user } = useAuth();

  // Helper function to handle navigation to protected routes
  const handleProtectedNavigation = (route: string) => {
    if (user) {
      navigate(route);
    } else {
      navigate('/login', { state: { from: route } });
    }
  };
  const [activeSection, setActiveSection] = useState('hero');

  // Financial goal calculator state
  const [goalAmount, setGoalAmount] = useState('');
  const [timeFrame, setTimeFrame] = useState('');
  const [monthlyInvestment, setMonthlyInvestment] = useState(0);

  // SWP calculator state
  const [swpAmount, setSwpAmount] = useState('');
  const [swpPeriod, setSwpPeriod] = useState('');
  const [expectedReturns, setExpectedReturns] = useState(0);

  // Voice shortcuts for landing page
  const { isListening, isSupported, startListening, stopListening } = useVoiceShortcuts({
    enabled: true,
    speak,
    shortcuts: [
      {
        patterns: ['learn financial freedom', 'what is financial freedom', 'financial freedom'],
        action: () => {
          document.getElementById('financial-freedom')?.scrollIntoView({ behavior: 'smooth' });
          speak('Showing financial freedom section');
        },
        description: 'Go to financial freedom section'
      },
      {
        patterns: ['prior knowledge', 'basic knowledge', 'learn basics'],
        action: () => {
          document.getElementById('prior-knowledge')?.scrollIntoView({ behavior: 'smooth' });
          speak('Showing prior knowledge section');
        },
        description: 'Go to prior knowledge section'
      },
      {
        patterns: ['mutual fund', 'swp', 'systematic withdrawal'],
        action: () => {
          document.getElementById('swp-section')?.scrollIntoView({ behavior: 'smooth' });
          speak('Showing systematic withdrawal plan section');
        },
        description: 'Go to SWP section'
      },
      {
        patterns: ['credit score', 'emergency fund', 'credit'],
        action: () => {
          document.getElementById('credit-emergency')?.scrollIntoView({ behavior: 'smooth' });
          speak('Showing credit score and emergency funds section');
        },
        description: 'Go to credit score section'
      },
      {
        patterns: ['government schemes', 'finance schemes', 'government benefits'],
        action: () => {
          document.getElementById('government-schemes')?.scrollIntoView({ behavior: 'smooth' });
          speak('Showing government finance schemes section');
        },
        description: 'Go to government schemes section'
      }
    ]
  });

  // Calculate monthly investment needed
  const calculateMonthlyInvestment = () => {
    if (goalAmount && timeFrame) {
      const goal = parseFloat(goalAmount);
      const years = parseFloat(timeFrame);
      const months = years * 12;
      const rate = 0.12; // Assuming 12% annual return
      const monthlyRate = rate / 12;

      // PMT formula for monthly investment
      const monthly = (goal * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1);
      setMonthlyInvestment(Math.round(monthly));
      speak(`You need to invest ${Math.round(monthly)} rupees monthly to reach your goal`);
    }
  };

  // Calculate SWP returns
  const calculateSWP = () => {
    if (swpAmount && swpPeriod) {
      const amount = parseFloat(swpAmount);
      const years = parseFloat(swpPeriod);
      const rate = 0.10; // Assuming 10% annual return

      const totalWithdrawal = amount * 12 * years;
      const requiredCorpus = totalWithdrawal / (rate * 0.8); // Conservative calculation
      setExpectedReturns(Math.round(requiredCorpus));
      speak(`You need approximately ${Math.round(requiredCorpus)} rupees as initial investment`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <section id="hero" className="relative py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg">
              <IndianRupee className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
              Welcome to <span className="text-transparent bg-gradient-primary bg-clip-text">SachivJi</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Your trusted companion for financial freedom in rural India. Learn, grow, and secure your future with government schemes and smart financial planning.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card className="p-4 text-center">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Government Schemes</div>
              </CardContent>
            </Card>
            <Card className="p-4 text-center">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-financial">100%</div>
                <div className="text-sm text-muted-foreground">Voice Enabled</div>
              </CardContent>
            </Card>
            <Card className="p-4 text-center">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-success">Free</div>
                <div className="text-sm text-muted-foreground">Financial Advice</div>
              </CardContent>
            </Card>
            <Card className="p-4 text-center">
              <CardContent className="p-0">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">AI Support</div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 px-8 py-3 text-lg"
              onClick={() => handleProtectedNavigation('/app/schemes')}
            >
              Find Government Schemes
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 text-lg"
              onClick={() => handleProtectedNavigation('/app/chatbot')}
            >
              Get Financial Advice
              <Play className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Authentication Section for Non-logged Users */}
          {!user && (
            <div className="mt-8 p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 max-w-md mx-auto">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Join SachivJi Today</h3>
                <p className="text-sm text-muted-foreground">Create your free account to access all features</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button
                  className="flex-1 bg-gradient-financial hover:opacity-90"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up Free
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Financial Education Sections */}
      <div className="max-w-6xl mx-auto px-4 space-y-16">

        {/* Section 1: Financial Freedom */}
        <section id="financial-freedom" className="scroll-mt-16">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">Financial Freedom 🎯</CardTitle>
              <CardDescription className="text-lg">
                Your journey to complete financial independence starts here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* What is Financial Freedom */}
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                    What is Financial Freedom?
                  </h3>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Financial freedom means having enough savings, investments, and cash to live the life you want
                    without depending on others. It's about making money work for you, not the other way around.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">No financial stress or worry</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Freedom to make life choices</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Security for your family's future</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Steps to Achieve Financial Freedom</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Badge className="mr-3 mt-1">1</Badge>
                      <div>
                        <div className="font-medium">Track Your Money</div>
                        <div className="text-sm text-muted-foreground">Know where every rupee goes</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge className="mr-3 mt-1">2</Badge>
                      <div>
                        <div className="font-medium">Build Emergency Fund</div>
                        <div className="text-sm text-muted-foreground">Save 6 months of expenses</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge className="mr-3 mt-1">3</Badge>
                      <div>
                        <div className="font-medium">Invest Regularly</div>
                        <div className="text-sm text-muted-foreground">Start with small amounts</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge className="mr-3 mt-1">4</Badge>
                      <div>
                        <div className="font-medium">Increase Income</div>
                        <div className="text-sm text-muted-foreground">Skills, side business, government schemes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Goal Calculator */}
              <div className="bg-primary/5 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-primary" />
                  Financial Goal Calculator
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="goalAmount">Target Amount (₹)</Label>
                    <Input
                      id="goalAmount"
                      type="number"
                      placeholder="e.g., 1000000"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeFrame">Time Frame (Years)</Label>
                    <Input
                      id="timeFrame"
                      type="number"
                      placeholder="e.g., 10"
                      value={timeFrame}
                      onChange={(e) => setTimeFrame(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={calculateMonthlyInvestment} className="w-full">
                      Calculate
                    </Button>
                  </div>
                </div>
                {monthlyInvestment > 0 && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-lg font-semibold text-center">
                      Monthly Investment Needed: <span className="text-primary">₹{monthlyInvestment.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-muted-foreground text-center mt-2">
                      *Assuming 12% annual returns
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 2: Prior Knowledge */}
        <section id="prior-knowledge" className="scroll-mt-16">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">Prior Knowledge 📚</CardTitle>
              <CardDescription className="text-lg">
                Build your financial foundation with essential concepts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Financial Terms */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Essential Financial Terms</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="font-medium text-primary">Interest Rate</div>
                      <div className="text-sm text-muted-foreground">Money you earn on savings or pay on loans (percentage)</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="font-medium text-primary">Inflation</div>
                      <div className="text-sm text-muted-foreground">Why things become more expensive over time</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="font-medium text-primary">Compound Interest</div>
                      <div className="text-sm text-muted-foreground">Earning interest on your interest - wealth building magic!</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="font-medium text-primary">Risk vs Return</div>
                      <div className="text-sm text-muted-foreground">Higher potential gains usually mean higher risk</div>
                    </div>
                  </div>
                </div>

                {/* Money Management Basics */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Money Management Basics</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-600 font-semibold">1</span>
                      </div>
                      <div>
                        <div className="font-medium">Income & Expenses</div>
                        <div className="text-sm text-muted-foreground">Track what comes in and what goes out</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold">2</span>
                      </div>
                      <div>
                        <div className="font-medium">Budgeting (50/30/20 Rule)</div>
                        <div className="text-sm text-muted-foreground">50% needs, 30% wants, 20% savings</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-purple-600 font-semibold">3</span>
                      </div>
                      <div>
                        <div className="font-medium">Emergency Fund First</div>
                        <div className="text-sm text-muted-foreground">Your financial safety net for unexpected events</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-600 font-semibold">4</span>
                      </div>
                      <div>
                        <div className="font-medium">Invest for Long Term</div>
                        <div className="text-sm text-muted-foreground">Time in market beats timing the market</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Quiz */}
              <div className="bg-success/5 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-success" />
                  Test Your Knowledge
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="font-medium mb-2">If you invest ₹1000 at 10% annual interest, how much will you have after 1 year?</div>
                    <div className="text-sm text-success">Answer: ₹1,100 (₹1000 + ₹100 interest)</div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleProtectedNavigation('/app/quiz')}
                    className="w-full"
                  >
                    Take Full Financial Quiz
                    <Play className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Systematic Mutual Fund Withdrawal */}
        <section id="swp-section" className="scroll-mt-16">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">Systematic Withdrawal Plan (SWP) 💰</CardTitle>
              <CardDescription className="text-lg">
                Create regular income from your investments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">What is SWP?</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    SWP allows you to withdraw a fixed amount from your mutual fund investments regularly (monthly/quarterly).
                    It's like creating your own pension from your investments!
                  </p>

                  <h4 className="font-semibold mb-3">Benefits of SWP:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Regular monthly income</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Tax efficient compared to FDs</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Flexible withdrawal amounts</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Your money keeps growing</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">How to Start SWP</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Badge variant="outline" className="mr-3 mt-1">Step 1</Badge>
                      <div>
                        <div className="font-medium">Build Your Corpus</div>
                        <div className="text-sm text-muted-foreground">Invest in equity mutual funds for 5+ years</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge variant="outline" className="mr-3 mt-1">Step 2</Badge>
                      <div>
                        <div className="font-medium">Choose SWP Amount</div>
                        <div className="text-sm text-muted-foreground">Usually 6-8% of corpus annually</div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Badge variant="outline" className="mr-3 mt-1">Step 3</Badge>
                      <div>
                        <div className="font-medium">Set Up Auto-Withdrawal</div>
                        <div className="text-sm text-muted-foreground">Monthly transfer to your bank account</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SWP Calculator */}
              <div className="bg-purple/5 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Calculator className="h-5 w-5 mr-2 text-purple-600" />
                  SWP Calculator
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label htmlFor="swpAmount">Monthly Withdrawal (₹)</Label>
                    <Input
                      id="swpAmount"
                      type="number"
                      placeholder="e.g., 25000"
                      value={swpAmount}
                      onChange={(e) => setSwpAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="swpPeriod">Period (Years)</Label>
                    <Input
                      id="swpPeriod"
                      type="number"
                      placeholder="e.g., 20"
                      value={swpPeriod}
                      onChange={(e) => setSwpPeriod(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={calculateSWP} className="w-full bg-purple-600 hover:bg-purple-700">
                      Calculate
                    </Button>
                  </div>
                </div>
                {expectedReturns > 0 && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="text-lg font-semibold text-center">
                      Required Initial Investment: <span className="text-purple-600">₹{expectedReturns.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-muted-foreground text-center mt-2">
                      *Assuming 10% annual returns and 80% withdrawal rate
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 4: Credit Score & Emergency Funds */}
        <section id="credit-emergency" className="scroll-mt-16">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">Credit Score & Emergency Funds 🛡️</CardTitle>
              <CardDescription className="text-lg">
                Your financial safety and credibility foundation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Credit Score */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
                    Credit Score (CIBIL Score)
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Your credit score (300-900) shows banks how reliable you are with money.
                    Higher scores = better loan rates and easier approvals.
                  </p>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Poor (300-549)</span>
                      <span className="text-red-600 font-bold">Loan Rejected</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">Fair (550-649)</span>
                      <span className="text-yellow-600 font-bold">High Interest</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Good (650-749)</span>
                      <span className="text-blue-600 font-bold">Standard Rates</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Excellent (750+)</span>
                      <span className="text-green-600 font-bold">Best Rates</span>
                    </div>
                  </div>

                  <h4 className="font-semibold mt-6 mb-3">How to Build Good Credit:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Pay all bills on time (35% of score)</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Keep credit utilization under 30%</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Don't close old credit cards</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">Check credit report annually</span>
                    </div>
                  </div>
                </div>

                {/* Emergency Fund */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <PiggyBank className="h-5 w-5 mr-2 text-green-500" />
                    Emergency Fund
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Money set aside for unexpected expenses like medical bills, job loss,
                    or family emergencies. This prevents you from taking expensive loans.
                  </p>

                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <div className="font-semibold text-green-800 mb-2">Emergency Fund Size:</div>
                    <div className="text-green-700">
                      <div>• Salaried: 6 months of expenses</div>
                      <div>• Business: 12 months of expenses</div>
                      <div>• Single income family: 9 months</div>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-3">Where to Keep Emergency Fund:</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-800">Savings Account (50%)</div>
                      <div className="text-sm text-blue-600">Instant access, low returns</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-800">Liquid Mutual Funds (30%)</div>
                      <div className="text-sm text-purple-600">1-2 days access, better returns</div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="font-medium text-orange-800">Fixed Deposits (20%)</div>
                      <div className="text-sm text-orange-600">Some penalty, highest safety</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="text-sm font-medium text-yellow-800">💡 Pro Tip:</div>
                    <div className="text-sm text-yellow-700">Start with ₹1000/month emergency fund SIP. Reach your target in 2-3 years.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 5: Government Finance Schemes */}
        <section id="government-schemes" className="scroll-mt-16">
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold">Government Finance Schemes 🏛️</CardTitle>
              <CardDescription className="text-lg">
                Free money and benefits from the government for your financial security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Popular Schemes Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-700">PM Kisan Samman Nidhi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 mb-2">₹6,000/year</div>
                    <div className="text-sm text-muted-foreground mb-3">For small farmers with land up to 2 hectares</div>
                    <div className="text-xs text-green-600">✓ Direct bank transfer</div>
                    <div className="text-xs text-green-600">✓ No paperwork after registration</div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-700">Pradhan Mantri Ujjwala Yojana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 mb-2">Free LPG</div>
                    <div className="text-sm text-muted-foreground mb-3">For women from BPL households</div>
                    <div className="text-xs text-blue-600">✓ Free gas connection</div>
                    <div className="text-xs text-blue-600">✓ ₹1,600 advance for stove</div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-purple-700">Ayushman Bharat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600 mb-2">₹5 Lakh</div>
                    <div className="text-sm text-muted-foreground mb-3">Health insurance per family per year</div>
                    <div className="text-xs text-purple-600">✓ Cashless treatment</div>
                    <div className="text-xs text-purple-600">✓ 1,400+ procedures covered</div>
                  </CardContent>
                </Card>
              </div>

              {/* How to Apply */}
              <div className="bg-primary/5 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  How to Apply for Government Schemes
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Online Process:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Badge className="mr-2">1</Badge>
                        <span className="text-sm">Visit official scheme website</span>
                      </div>
                      <div className="flex items-center">
                        <Badge className="mr-2">2</Badge>
                        <span className="text-sm">Check eligibility criteria</span>
                      </div>
                      <div className="flex items-center">
                        <Badge className="mr-2">3</Badge>
                        <span className="text-sm">Upload required documents</span>
                      </div>
                      <div className="flex items-center">
                        <Badge className="mr-2">4</Badge>
                        <span className="text-sm">Submit application & track status</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Required Documents:</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>• Aadhaar Card (mandatory)</div>
                      <div>• Bank Account Details</div>
                      <div>• Income Certificate</div>
                      <div>• Caste Certificate (if applicable)</div>
                      <div>• Land Records (for farmer schemes)</div>
                      <div>• Ration Card</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <Button
                  size="lg"
                  onClick={() => handleProtectedNavigation('/app/schemes')}
                  className="bg-gradient-primary hover:opacity-90 px-8 py-3"
                >
                  Check Your Eligibility Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Navigation to App Features */}
        <section className="scroll-mt-16">
          <Card className="shadow-lg bg-gradient-to-r from-primary/10 to-financial/10">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">Ready to Start Your Financial Journey?</CardTitle>
              <CardDescription className="text-lg">
                Use SachivJi's powerful tools to secure your financial future
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center space-y-2"
                  onClick={() => handleProtectedNavigation('/app/schemes')}
                >
                  <Building2 className="h-8 w-8 text-primary" />
                  <div className="font-semibold">Find Schemes</div>
                  <div className="text-xs text-muted-foreground text-center">Get personalized government scheme recommendations</div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center space-y-2"
                  onClick={() => handleProtectedNavigation('/app/chatbot')}
                >
                  <Users className="h-8 w-8 text-financial" />
                  <div className="font-semibold">Financial Advisor</div>
                  <div className="text-xs text-muted-foreground text-center">Get personalized financial advice from AI</div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center space-y-2"
                  onClick={() => handleProtectedNavigation('/app/quiz')}
                >
                  <Award className="h-8 w-8 text-purple-600" />
                  <div className="font-semibold">Financial Quiz</div>
                  <div className="text-xs text-muted-foreground text-center">Test and improve your financial knowledge</div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center space-y-2"
                  onClick={() => handleProtectedNavigation('/app/reviews')}
                >
                  <CheckCircle className="h-8 w-8 text-success" />
                  <div className="font-semibold">Service Reviews</div>
                  <div className="text-xs text-muted-foreground text-center">Share and read government service experiences</div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-muted/30 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-gradient-primary rounded-full flex items-center justify-center">
              <IndianRupee className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold">SachivJi</h3>
            <p className="text-muted-foreground">Empowering rural India with financial freedom</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>🎤 Voice-enabled • 🌍 Available in Hindi & English • 📱 Mobile-first design</p>
            <p className="mt-2">Made with ❤️ for the people of India</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;