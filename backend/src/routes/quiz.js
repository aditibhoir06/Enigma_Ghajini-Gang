import express from 'express';
import { body, query } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import {
  getQuizQuestions,
  submitQuizResults,
  getQuizHistory,
  getUserQuizStats,
  getQuizLeaderboard,
  getUserRank,
  seedSampleQuestions
} from '../controllers/quizController.js';

const router = express.Router();

// Validation middleware
const validateQuizSubmission = [
  body('score')
    .isInt({ min: 0 })
    .withMessage('Score must be a non-negative integer'),
  body('timeElapsed')
    .isInt({ min: 1 })
    .withMessage('Time elapsed must be a positive integer'),
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('questionIds')
    .isArray()
    .withMessage('Question IDs must be an array')
    .custom((value, { req }) => {
      if (value.length !== req.body.answers.length) {
        throw new Error('Question IDs and answers arrays must have the same length');
      }
      return true;
    })
];

const validateQuestionQuery = [
  query('difficulty')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty must be beginner, intermediate, or advanced'),
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20'),
  query('useAI')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('useAI must be true or false')
];

const validateLeaderboardQuery = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'all'])
    .withMessage('Period must be week, month, or all'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

const validateHistoryQuery = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Routes

// GET /api/quiz/questions - Get quiz questions
router.get('/questions',
  authenticateToken,
  validateQuestionQuery,
  getQuizQuestions
);

// POST /api/quiz/submit - Submit quiz results
router.post('/submit',
  authenticateToken,
  validateQuizSubmission,
  submitQuizResults
);

// GET /api/quiz/history - Get user's quiz history
router.get('/history',
  authenticateToken,
  validateHistoryQuery,
  getQuizHistory
);

// GET /api/quiz/stats - Get user's quiz statistics
router.get('/stats',
  authenticateToken,
  getUserQuizStats
);

// GET /api/quiz/leaderboard - Get quiz leaderboard
router.get('/leaderboard',
  authenticateToken,
  validateLeaderboardQuery,
  getQuizLeaderboard
);

// GET /api/quiz/rank - Get user's current rank
router.get('/rank',
  authenticateToken,
  getUserRank
);

// POST /api/quiz/seed - Seed sample questions (development only)
router.post('/seed',
  authenticateToken,
  seedSampleQuestions
);

export default router;