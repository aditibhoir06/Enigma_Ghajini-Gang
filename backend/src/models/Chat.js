import db from '../config/database.js';

class Chat {
  // Create a new conversation
  static async createConversation(userId, title = 'New Chat') {
    try {
      const result = await new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO chat_conversations (user_id, title)
          VALUES (?, ?)
        `;

        db.run(sql, [userId, title], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, userId, title });
          }
        });
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Add a message to a conversation
  static async addMessage(conversationId, senderType, messageText, metadata = null) {
    try {
      const result = await new Promise((resolve, reject) => {
        const sql = `
          INSERT INTO chat_messages (conversation_id, sender_type, message_text, metadata)
          VALUES (?, ?, ?, ?)
        `;

        const metadataJson = metadata ? JSON.stringify(metadata) : null;

        db.run(sql, [conversationId, senderType, messageText, metadataJson], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              conversationId,
              senderType,
              messageText,
              metadata: metadataJson
            });
          }
        });
      });

      // Update conversation's updated_at timestamp
      await this.updateConversationTimestamp(conversationId);

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get user's conversations
  static async getUserConversations(userId, limit = 20) {
    try {
      const sql = `
        SELECT
          cc.*,
          (SELECT message_text
           FROM chat_messages cm
           WHERE cm.conversation_id = cc.id
           ORDER BY cm.created_at DESC
           LIMIT 1) as last_message,
          (SELECT COUNT(*)
           FROM chat_messages cm
           WHERE cm.conversation_id = cc.id) as message_count
        FROM chat_conversations cc
        WHERE cc.user_id = ? AND cc.is_active = 1
        ORDER BY cc.updated_at DESC
        LIMIT ?
      `;

      return await db.allAsync(sql, [userId, limit]);
    } catch (error) {
      throw error;
    }
  }

  // Get conversation messages
  static async getConversationMessages(conversationId, limit = 100) {
    try {
      const sql = `
        SELECT
          id,
          sender_type,
          message_text,
          metadata,
          created_at
        FROM chat_messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
        LIMIT ?
      `;

      const messages = await db.allAsync(sql, [conversationId, limit]);

      // Parse metadata JSON
      return messages.map(msg => ({
        ...msg,
        metadata: msg.metadata ? JSON.parse(msg.metadata) : null
      }));
    } catch (error) {
      throw error;
    }
  }

  // Get a specific conversation
  static async getConversation(conversationId, userId) {
    try {
      const sql = `
        SELECT * FROM chat_conversations
        WHERE id = ? AND user_id = ? AND is_active = 1
      `;

      return await db.getAsync(sql, [conversationId, userId]);
    } catch (error) {
      throw error;
    }
  }

  // Update conversation timestamp
  static async updateConversationTimestamp(conversationId) {
    try {
      const sql = `
        UPDATE chat_conversations
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await db.runAsync(sql, [conversationId]);
    } catch (error) {
      throw error;
    }
  }

  // Update conversation title
  static async updateConversationTitle(conversationId, userId, title) {
    try {
      const sql = `
        UPDATE chat_conversations
        SET title = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;

      const result = await new Promise((resolve, reject) => {
        db.run(sql, [title, conversationId, userId], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        });
      });

      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }

  // Delete a conversation (soft delete)
  static async deleteConversation(conversationId, userId) {
    try {
      const sql = `
        UPDATE chat_conversations
        SET is_active = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `;

      const result = await new Promise((resolve, reject) => {
        db.run(sql, [conversationId, userId], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ changes: this.changes });
          }
        });
      });

      return result.changes > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get conversation with recent messages
  static async getConversationWithMessages(conversationId, userId, messageLimit = 50) {
    try {
      const conversation = await this.getConversation(conversationId, userId);
      if (!conversation) {
        return null;
      }

      const messages = await this.getConversationMessages(conversationId, messageLimit);

      return {
        ...conversation,
        messages
      };
    } catch (error) {
      throw error;
    }
  }

  // Search messages
  static async searchMessages(userId, query, limit = 50) {
    try {
      const sql = `
        SELECT
          cm.*,
          cc.title as conversation_title
        FROM chat_messages cm
        JOIN chat_conversations cc ON cm.conversation_id = cc.id
        WHERE cc.user_id = ?
          AND cc.is_active = 1
          AND cm.message_text LIKE ?
        ORDER BY cm.created_at DESC
        LIMIT ?
      `;

      return await db.allAsync(sql, [userId, `%${query}%`, limit]);
    } catch (error) {
      throw error;
    }
  }

  // Get message statistics for a user
  static async getUserMessageStats(userId) {
    try {
      const sql = `
        SELECT
          COUNT(DISTINCT cc.id) as total_conversations,
          COUNT(cm.id) as total_messages,
          COUNT(CASE WHEN cm.sender_type = 'user' THEN 1 END) as user_messages,
          COUNT(CASE WHEN cm.sender_type = 'assistant' THEN 1 END) as assistant_messages
        FROM chat_conversations cc
        LEFT JOIN chat_messages cm ON cc.id = cm.conversation_id
        WHERE cc.user_id = ? AND cc.is_active = 1
      `;

      return await db.getAsync(sql, [userId]);
    } catch (error) {
      throw error;
    }
  }
}

export default Chat;