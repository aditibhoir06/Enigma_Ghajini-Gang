import { Router } from 'express';
import authRoutes from './auth.js';
import chatRoutes from './chat.js';
import quizRoutes from './quiz.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SachivJi API is running',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
router.use('/auth', authRoutes);

// Chat routes
router.use('/chat', chatRoutes);

// Quiz routes
router.use('/quiz', quizRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SachivJi API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout'
      },
      chat: {
        send: 'POST /api/chat/send',
        shortcuts: 'GET /api/chat/shortcuts',
        conversations: 'GET /api/chat/conversations',
        conversation: 'GET /api/chat/conversations/:id',
        updateTitle: 'PUT /api/chat/conversations/:id/title',
        deleteConversation: 'DELETE /api/chat/conversations/:id',
        clear: 'POST /api/chat/clear',
        search: 'GET /api/chat/search',
        stats: 'GET /api/chat/stats'
      },
      quiz: {
        questions: 'GET /api/quiz/questions',
        submit: 'POST /api/quiz/submit',
        history: 'GET /api/quiz/history',
        stats: 'GET /api/quiz/stats',
        leaderboard: 'GET /api/quiz/leaderboard',
        rank: 'GET /api/quiz/rank',
        seed: 'POST /api/quiz/seed'
      }
    }
  });
});

export default router;