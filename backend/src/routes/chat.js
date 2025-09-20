import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import chatController from '../controllers/chatController.js';
import { body, query, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for chat endpoints
const chatRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each user to 30 requests per minute
  message: {
    success: false,
    message: 'Too many chat requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const shortcutRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each user to 10 shortcut requests per minute
  message: {
    success: false,
    message: 'Too many shortcut requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Send message to AI
router.post('/send',
  chatRateLimit,
  authenticateToken,
  [
    body('message')
      .trim()
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters'),
    body('conversationId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Conversation ID must be a positive integer')
  ],
  handleValidationErrors,
  chatController.sendMessage
);

// Get dynamic shortcuts
router.get('/shortcuts',
  shortcutRateLimit,
  authenticateToken,
  [
    query('conversationId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Conversation ID must be a positive integer'),
    query('context')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Context must be less than 500 characters')
  ],
  handleValidationErrors,
  chatController.getShortcuts
);

// Get user's conversations
router.get('/conversations',
  authenticateToken,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  handleValidationErrors,
  chatController.getConversations
);

// Get specific conversation with messages
router.get('/conversations/:conversationId',
  authenticateToken,
  [
    param('conversationId')
      .isInt({ min: 1 })
      .withMessage('Conversation ID must be a positive integer')
  ],
  handleValidationErrors,
  chatController.getConversation
);

// Update conversation title
router.put('/conversations/:conversationId/title',
  authenticateToken,
  [
    param('conversationId')
      .isInt({ min: 1 })
      .withMessage('Conversation ID must be a positive integer'),
    body('title')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters')
  ],
  handleValidationErrors,
  chatController.updateConversationTitle
);

// Delete conversation
router.delete('/conversations/:conversationId',
  authenticateToken,
  [
    param('conversationId')
      .isInt({ min: 1 })
      .withMessage('Conversation ID must be a positive integer')
  ],
  handleValidationErrors,
  chatController.deleteConversation
);

// Clear conversation context
router.post('/clear',
  authenticateToken,
  [
    body('conversationId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Conversation ID must be a positive integer')
  ],
  handleValidationErrors,
  chatController.clearConversation
);

// Search messages
router.get('/search',
  authenticateToken,
  [
    query('query')
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage('Search query must be between 1 and 200 characters')
  ],
  handleValidationErrors,
  chatController.searchMessages
);

// Get user chat statistics
router.get('/stats',
  authenticateToken,
  chatController.getUserStats
);

export default router;