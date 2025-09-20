import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = join(__dirname, '../../database/sachivji.db');

// Ensure database directory exists
const dbDir = dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize SQLite database
const db = new sqlite3.Database(dbPath);

// Promisify database methods for async/await
db.runAsync = promisify(db.run.bind(db));
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    console.log('Initializing database schema...');

    // Users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        total_quiz_points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )
    `;

    // Chat conversations table
    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    // Chat messages table
    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'assistant')),
        message_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT, -- JSON field for additional data
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations (id) ON DELETE CASCADE
      )
    `;

    // Quiz questions table
    const createQuizQuestionsTable = `
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id TEXT PRIMARY KEY,
        question TEXT NOT NULL,
        options TEXT NOT NULL, -- JSON array of options
        correct_answer INTEGER NOT NULL,
        difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
        category TEXT NOT NULL,
        explanation TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT 1
      )
    `;

    // Quiz attempts table
    const createQuizAttemptsTable = `
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        time_elapsed INTEGER NOT NULL, -- in seconds
        answers TEXT NOT NULL, -- JSON array of user answers
        question_ids TEXT NOT NULL, -- JSON array of question IDs
        points_earned INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `;

    // Quiz achievements table
    const createQuizAchievementsTable = `
      CREATE TABLE IF NOT EXISTS quiz_achievements (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT,
        points_threshold INTEGER,
        quiz_count_threshold INTEGER,
        score_threshold INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User achievements table
    const createUserAchievementsTable = `
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        achievement_id TEXT NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES quiz_achievements (id) ON DELETE CASCADE,
        UNIQUE(user_id, achievement_id)
      )
    `;

    // Create indexes for performance
    const createEmailIndex = `
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `;

    const createConversationUserIndex = `
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON chat_conversations(user_id)
    `;

    const createMessagesConversationIndex = `
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON chat_messages(conversation_id)
    `;

    const createMessagesCreatedAtIndex = `
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON chat_messages(created_at)
    `;

    const createQuizAttemptsUserIndex = `
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id)
    `;

    const createQuizAttemptsCompletedAtIndex = `
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON quiz_attempts(completed_at)
    `;

    const createUserAchievementsUserIndex = `
      CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id)
    `;

    db.serialize(() => {
      db.run(createUsersTable, (err) => {
        if (err) {
          console.error('❌ Error creating users table:', err);
          return reject(err);
        }
      });

      db.run(createConversationsTable, (err) => {
        if (err) {
          console.error('❌ Error creating conversations table:', err);
          return reject(err);
        }
      });

      db.run(createMessagesTable, (err) => {
        if (err) {
          console.error('❌ Error creating messages table:', err);
          return reject(err);
        }
      });

      db.run(createQuizQuestionsTable, (err) => {
        if (err) {
          console.error('❌ Error creating quiz questions table:', err);
          return reject(err);
        }
      });

      db.run(createQuizAttemptsTable, (err) => {
        if (err) {
          console.error('❌ Error creating quiz attempts table:', err);
          return reject(err);
        }
      });

      db.run(createQuizAchievementsTable, (err) => {
        if (err) {
          console.error('❌ Error creating quiz achievements table:', err);
          return reject(err);
        }
      });

      db.run(createUserAchievementsTable, (err) => {
        if (err) {
          console.error('❌ Error creating user achievements table:', err);
          return reject(err);
        }
      });

      db.run(createEmailIndex, (err) => {
        if (err) {
          console.error('❌ Error creating email index:', err);
          return reject(err);
        }
      });

      db.run(createConversationUserIndex, (err) => {
        if (err) {
          console.error('❌ Error creating conversation user index:', err);
          return reject(err);
        }
      });

      db.run(createMessagesConversationIndex, (err) => {
        if (err) {
          console.error('❌ Error creating messages conversation index:', err);
          return reject(err);
        }
      });

      db.run(createMessagesCreatedAtIndex, (err) => {
        if (err) {
          console.error('❌ Error creating messages created_at index:', err);
          return reject(err);
        }
      });

      db.run(createQuizAttemptsUserIndex, (err) => {
        if (err) {
          console.error('❌ Error creating quiz attempts user index:', err);
          return reject(err);
        }
      });

      db.run(createQuizAttemptsCompletedAtIndex, (err) => {
        if (err) {
          console.error('❌ Error creating quiz attempts completed_at index:', err);
          return reject(err);
        }
      });

      db.run(createUserAchievementsUserIndex, (err) => {
        if (err) {
          console.error('❌ Error creating user achievements user index:', err);
          return reject(err);
        }
        console.log('✅ Database schema initialized successfully');
        resolve();
      });
    });
  });
}

// Initialize schema on first import
await initializeDatabase();

export default db;