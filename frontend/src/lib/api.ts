const API_BASE_URL = 'http://localhost:5001/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if token exists
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async signup(email: string, password: string) {
    return this.makeRequest<{
      user: { id: number; email: string; created_at: string };
      token: string;
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async login(email: string, password: string) {
    return this.makeRequest<{
      user: { id: number; email: string; created_at: string };
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.makeRequest<{
      user: { id: number; email: string; created_at: string; updated_at: string };
    }>('/auth/me');
  }

  // Health check
  async healthCheck() {
    return this.makeRequest('/health');
  }

  // Chat endpoints
  async sendMessage(message: string, conversationId?: number) {
    return this.makeRequest<{
      conversationId: number;
      userMessage: {
        id: number;
        text: string;
        timestamp: string;
      };
      aiResponse: {
        text: string;
        timestamp: string;
        isError: boolean;
      };
    }>('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId }),
    });
  }

  async getShortcuts(conversationId?: number, context?: string) {
    const params = new URLSearchParams();
    if (conversationId) params.append('conversationId', conversationId.toString());
    if (context) params.append('context', context);

    return this.makeRequest<{
      shortcuts: string[];
      context: string;
    }>(`/chat/shortcuts?${params.toString()}`);
  }

  async getConversations(limit?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    return this.makeRequest<Array<{
      id: number;
      user_id: number;
      title: string;
      created_at: string;
      updated_at: string;
      is_active: number;
      last_message: string;
      message_count: number;
    }>>(`/chat/conversations?${params.toString()}`);
  }

  async getConversation(conversationId: number) {
    return this.makeRequest<{
      id: number;
      user_id: number;
      title: string;
      created_at: string;
      updated_at: string;
      is_active: number;
      messages: Array<{
        id: number;
        sender_type: 'user' | 'assistant';
        message_text: string;
        metadata: any;
        created_at: string;
      }>;
    }>(`/chat/conversations/${conversationId}`);
  }

  async updateConversationTitle(conversationId: number, title: string) {
    return this.makeRequest(`/chat/conversations/${conversationId}/title`, {
      method: 'PUT',
      body: JSON.stringify({ title }),
    });
  }

  async deleteConversation(conversationId: number) {
    return this.makeRequest(`/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  }

  async clearConversation(conversationId?: number) {
    return this.makeRequest('/chat/clear', {
      method: 'POST',
      body: JSON.stringify({ conversationId }),
    });
  }

  async searchMessages(query: string) {
    const params = new URLSearchParams();
    params.append('query', query);

    return this.makeRequest<Array<{
      id: number;
      conversation_id: number;
      sender_type: 'user' | 'assistant';
      message_text: string;
      metadata: any;
      created_at: string;
      conversation_title: string;
    }>>(`/chat/search?${params.toString()}`);
  }

  async getChatStats() {
    return this.makeRequest<{
      total_conversations: number;
      total_messages: number;
      user_messages: number;
      assistant_messages: number;
    }>('/chat/stats');
  }

  // Quiz endpoints
  async getQuizQuestions(difficulty?: string, category?: string) {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    if (category) params.append('category', category);

    return this.makeRequest<{
      questions: Array<{
        id: string;
        question: string;
        options: string[];
        correctAnswer: number;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        category: string;
        explanation?: string;
      }>;
    }>(`/quiz/questions?${params.toString()}`);
  }

  async submitQuizResults(data: {
    score: number;
    timeElapsed: number;
    answers: (number | null)[];
    questionIds: string[];
  }) {
    return this.makeRequest<{
      pointsEarned: number;
      totalPoints: number;
      rank: number;
      achievements: string[];
    }>('/quiz/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getQuizHistory(limit?: number) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    return this.makeRequest<Array<{
      id: number;
      score: number;
      total_questions: number;
      time_elapsed: number;
      completed_at: string;
      points_earned: number;
      percentage: number;
    }>>(`/quiz/history?${params.toString()}`);
  }

  async getUserQuizStats() {
    return this.makeRequest<{
      totalPoints: number;
      quizzesCompleted: number;
      averageScore: number;
      bestScore: number;
      totalTimeSpent: number;
      currentStreak: number;
      achievements: Array<{
        id: string;
        name: string;
        description: string;
        earned_at: string;
      }>;
    }>('/quiz/stats');
  }

  async getQuizLeaderboard(period?: 'week' | 'month' | 'all', limit?: number) {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (limit) params.append('limit', limit.toString());

    return this.makeRequest<Array<{
      user_id: number;
      username: string;
      total_points: number;
      quizzes_completed: number;
      average_score: number;
      rank: number;
    }>>(`/quiz/leaderboard?${params.toString()}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse };