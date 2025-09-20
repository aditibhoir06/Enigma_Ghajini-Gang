import Chat from '../models/Chat.js';
import geminiService from '../services/geminiService.js';

const chatController = {
  // Send a message and get AI response
  async sendMessage(req, res) {
    try {
      const { message, conversationId, mode: clientMode } = req.body;
      const userId = req.user.id;

      if (!message || !message.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      // Heuristic to detect "final" vs "probe" if client didn't specify
      const detectMode = (text) => {
        const finalRe = /(generate|give|show|create|prepare|make).*(report|solution|plan|summary|recommendation|final|analysis)|\b(final(ise|ize)?|full|detailed)\b/i;
        return finalRe.test(text) ? 'final' : 'probe';
      };
      const mode = (clientMode === 'final' || clientMode === 'probe')
        ? clientMode
        : detectMode(message);

      let currentConversationId = conversationId;

      // Create new conversation if none provided
      if (!currentConversationId) {
        const conversation = await Chat.createConversation(
          userId,
          message.substring(0, 50) + (message.length > 50 ? '...' : '')
        );
        currentConversationId = conversation.id;
      } else {
        // Verify user owns this conversation
        const conversation = await Chat.getConversation(currentConversationId, userId);
        if (!conversation) {
          return res.status(404).json({
            success: false,
            message: 'Conversation not found'
          });
        }
      }

      // Save user message to database
      const userMessage = await Chat.addMessage(
        currentConversationId,
        'user',
        message.trim()
      );

      // Get AI response from Gemini (pass mode)
      const aiResponse = await geminiService.sendMessage(
        userId,
        message.trim(),
        currentConversationId,
        { mode } // 'probe' => short 1–2 lines; 'final' => long/full
      );

      if (!aiResponse.success) {
        // Save error info but still return fallback response
        await Chat.addMessage(
          currentConversationId,
          'assistant',
          aiResponse.response,
          { error: true, fallback: true }
        );
      } else {
        // Save successful AI response
        await Chat.addMessage(
          currentConversationId,
          'assistant',
          aiResponse.response
        );
      }

      res.json({
        success: true,
        data: {
          conversationId: currentConversationId,
          userMessage: {
            id: userMessage.id,
            text: message.trim(),
            timestamp: new Date().toISOString()
          },
          aiResponse: {
            text: aiResponse.response,
            timestamp: new Date().toISOString(),
            isError: !aiResponse.success,
            mode // echo effective mode used
          }
        }
      });

    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process message'
      });
    }
  },

  // Get dynamic shortcuts
  async getShortcuts(req, res) {
    try {
      const { conversationId, context } = req.query;
      const userId = req.user.id;

      let currentContext = context || '';

      // Get recent messages for context if conversation ID provided
      if (conversationId) {
        const conversation = await Chat.getConversation(conversationId, userId);
        if (conversation) {
          const recentMessages = await Chat.getConversationMessages(conversationId, 5);
          currentContext = recentMessages
            .map(msg => `${msg.sender_type}: ${msg.message_text}`)
            .join('\n');
        }
      }

      // Generate dynamic shortcuts (force terse output)
      const shortcutsResponse = await geminiService.generateShortcuts(
        userId,
        conversationId,
        currentContext,
        { style: 'short' } // keep each suggestion tiny (button-ready)
      );

      res.json({
        success: true,
        data: {
          shortcuts: shortcutsResponse.shortcuts,
          context: currentContext.substring(0, 200) // Limit context size in response
        }
      });

    } catch (error) {
      console.error('Get shortcuts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate shortcuts'
      });
    }
  },

  // Get conversation history
  async getConversations(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;

      const conversations = await Chat.getUserConversations(userId, limit);

      res.json({
        success: true,
        data: conversations
      });

    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversations'
      });
    }
  },

  // Get specific conversation with messages
  async getConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      const conversationWithMessages = await Chat.getConversationWithMessages(
        conversationId,
        userId
      );

      if (!conversationWithMessages) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      res.json({
        success: true,
        data: conversationWithMessages
      });

    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation'
      });
    }
  },

  // Update conversation title
  async updateConversationTitle(req, res) {
    try {
      const { conversationId } = req.params;
      const { title } = req.body;
      const userId = req.user.id;

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title is required'
        });
      }

      const updated = await Chat.updateConversationTitle(
        conversationId,
        userId,
        title.trim()
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      res.json({
        success: true,
        message: 'Conversation title updated'
      });

    } catch (error) {
      console.error('Update conversation title error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update conversation title'
      });
    }
  },

  // Delete conversation
  async deleteConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;

      const deleted = await Chat.deleteConversation(conversationId, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Clear conversation from memory
      geminiService.clearConversation(userId, conversationId);

      res.json({
        success: true,
        message: 'Conversation deleted'
      });

    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete conversation'
      });
    }
  },

  // Clear conversation (start fresh)
  async clearConversation(req, res) {
    try {
      const { conversationId } = req.body;
      const userId = req.user.id;

      if (conversationId) {
        // Verify user owns this conversation
        const conversation = await Chat.getConversation(conversationId, userId);
        if (!conversation) {
          return res.status(404).json({
            success: false,
            message: 'Conversation not found'
          });
        }
      }

      // Clear from Gemini service memory
      geminiService.clearConversation(userId, conversationId);

      res.json({
        success: true,
        message: 'Conversation context cleared'
      });

    } catch (error) {
      console.error('Clear conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear conversation'
      });
    }
  },

  // Search messages
  async searchMessages(req, res) {
    try {
      const { query } = req.query;
      const userId = req.user.id;

      if (!query || !query.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const messages = await Chat.searchMessages(userId, query.trim());

      res.json({
        success: true,
        data: messages
      });

    } catch (error) {
      console.error('Search messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search messages'
      });
    }
  },

  // Get user chat statistics
  async getUserStats(req, res) {
    try {
      const userId = req.user.id;

      const stats = await Chat.getUserMessageStats(userId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics'
      });
    }
  }
};

export default chatController;
