import { Quiz } from '../models/Quiz.js';
import { validationResult } from 'express-validator';
import quizAIService from '../services/quizAIService.js';

// Get quiz questions
export const getQuizQuestions = async (req, res) => {
  try {
    const { difficulty, category, limit = 5, useAI = 'false' } = req.query;
    const limitNum = parseInt(limit);

    let questions = [];

    // Try to get questions from database first
    if (useAI !== 'true') {
      questions = await Quiz.getQuestions(difficulty, category, limitNum);
    }

    // If no questions found in database or AI is requested, generate with AI
    if (questions.length === 0 || useAI === 'true') {
      try {
        console.log('Generating AI questions...');
        const aiQuestions = await quizAIService.generateQuizQuestions({
          count: limitNum,
          difficulty: difficulty || 'beginner',
          category: category || 'general'
        });

        questions = aiQuestions;

        // Optionally save AI-generated questions to database for future use
        if (aiQuestions.length > 0) {
          console.log(`Generated ${aiQuestions.length} AI questions`);
        }
      } catch (aiError) {
        console.error('AI question generation failed:', aiError);

        // Fallback to any available database questions
        if (questions.length === 0) {
          questions = await Quiz.getQuestions(null, null, limitNum);
        }
      }
    }

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions available. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'Quiz questions retrieved successfully',
      data: {
        questions: questions.slice(0, limitNum), // Ensure we don't exceed requested limit
        source: useAI === 'true' ? 'ai' : 'database'
      }
    });
  } catch (error) {
    console.error('Error in getQuizQuestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz questions',
      errors: [error.message]
    });
  }
};

// Submit quiz results
export const submitQuizResults = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => error.msg)
      });
    }

    const userId = req.user.id;
    const { score, timeElapsed, answers, questionIds } = req.body;

    const result = await Quiz.submitAttempt(userId, {
      score,
      totalQuestions: questionIds.length,
      timeElapsed,
      answers,
      questionIds
    });

    res.json({
      success: true,
      message: 'Quiz results submitted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in submitQuizResults:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz results',
      errors: [error.message]
    });
  }
};

// Get user's quiz history
export const getQuizHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const history = await Quiz.getUserHistory(userId, parseInt(limit));

    res.json({
      success: true,
      message: 'Quiz history retrieved successfully',
      data: history
    });
  } catch (error) {
    console.error('Error in getQuizHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz history',
      errors: [error.message]
    });
  }
};

// Get user's quiz statistics
export const getUserQuizStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Quiz.getUserStats(userId);

    res.json({
      success: true,
      message: 'Quiz statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error in getUserQuizStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz statistics',
      errors: [error.message]
    });
  }
};

// Get quiz leaderboard
export const getQuizLeaderboard = async (req, res) => {
  try {
    const { period = 'all', limit = 10 } = req.query;

    const validPeriods = ['week', 'month', 'all'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period. Must be one of: week, month, all'
      });
    }

    const leaderboard = await Quiz.getLeaderboard(period, parseInt(limit));

    res.json({
      success: true,
      message: 'Leaderboard retrieved successfully',
      data: leaderboard
    });
  } catch (error) {
    console.error('Error in getQuizLeaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard',
      errors: [error.message]
    });
  }
};

// Get user's current rank
export const getUserRank = async (req, res) => {
  try {
    const userId = req.user.id;

    const rankData = await Quiz.getUserRank(userId);

    res.json({
      success: true,
      message: 'User rank retrieved successfully',
      data: rankData
    });
  } catch (error) {
    console.error('Error in getUserRank:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user rank',
      errors: [error.message]
    });
  }
};

// Admin endpoint to seed sample questions
export const seedSampleQuestions = async (req, res) => {
  try {
    await Quiz.seedQuestions();

    res.json({
      success: true,
      message: 'Sample questions seeded successfully'
    });
  } catch (error) {
    console.error('Error in seedSampleQuestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed sample questions',
      errors: [error.message]
    });
  }
};