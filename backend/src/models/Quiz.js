import db from '../config/database.js';

export class Quiz {

  // Get quiz questions based on difficulty and category
  static async getQuestions(difficulty = null, category = null, limit = 5) {
    try {
      let query = `
        SELECT id, question, options, correct_answer, difficulty, category, explanation
        FROM quiz_questions
        WHERE is_active = 1
      `;

      const params = [];

      if (difficulty) {
        query += ' AND difficulty = ?';
        params.push(difficulty);
      }

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      query += ' ORDER BY RANDOM() LIMIT ?';
      params.push(limit);

      const questions = await db.allAsync(query, params);

      // Parse JSON options for each question
      return questions.map(question => ({
        ...question,
        options: JSON.parse(question.options)
      }));
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      throw error;
    }
  }

  // Submit quiz attempt and calculate results
  static async submitAttempt(userId, { score, totalQuestions, timeElapsed, answers, questionIds }) {
    try {
      const pointsEarned = score; // 1 point per correct answer

      // Start transaction
      return new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          // Insert quiz attempt
          const insertAttempt = `
            INSERT INTO quiz_attempts (
              user_id, score, total_questions, time_elapsed,
              answers, question_ids, points_earned
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          db.run(
            insertAttempt,
            [
              userId,
              score,
              totalQuestions,
              timeElapsed,
              JSON.stringify(answers),
              JSON.stringify(questionIds),
              pointsEarned
            ],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                return reject(err);
              }

              const attemptId = this.lastID;

              // Update user's total points
              const updateUserPoints = `
                UPDATE users
                SET total_quiz_points = total_quiz_points + ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
              `;

              db.run(updateUserPoints, [pointsEarned, userId], (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject(err);
                }

                // Get updated user points and rank
                this.getUserRank(userId)
                  .then(({ totalPoints, rank }) => {
                    db.run('COMMIT');
                    resolve({
                      attemptId,
                      pointsEarned,
                      totalPoints,
                      rank,
                      achievements: [] // TODO: Implement achievement checking
                    });
                  })
                  .catch(err => {
                    db.run('ROLLBACK');
                    reject(err);
                  });
              });
            }
          );
        });
      });
    } catch (error) {
      console.error('Error submitting quiz attempt:', error);
      throw error;
    }
  }

  // Get user's quiz history
  static async getUserHistory(userId, limit = 10) {
    try {
      const query = `
        SELECT
          id,
          score,
          total_questions,
          time_elapsed,
          points_earned,
          completed_at,
          ROUND((CAST(score AS FLOAT) / total_questions) * 100, 2) as percentage
        FROM quiz_attempts
        WHERE user_id = ?
        ORDER BY completed_at DESC
        LIMIT ?
      `;

      return await db.allAsync(query, [userId, limit]);
    } catch (error) {
      console.error('Error fetching user quiz history:', error);
      throw error;
    }
  }

  // Get user's quiz statistics
  static async getUserStats(userId) {
    try {
      const statsQuery = `
        SELECT
          u.total_quiz_points as totalPoints,
          COUNT(qa.id) as quizzesCompleted,
          AVG(CAST(qa.score AS FLOAT) / qa.total_questions * 100) as averageScore,
          MAX(CAST(qa.score AS FLOAT) / qa.total_questions * 100) as bestScore,
          SUM(qa.time_elapsed) as totalTimeSpent
        FROM users u
        LEFT JOIN quiz_attempts qa ON u.id = qa.user_id
        WHERE u.id = ?
        GROUP BY u.id
      `;

      const stats = await db.getAsync(statsQuery, [userId]);

      if (!stats) {
        return {
          totalPoints: 0,
          quizzesCompleted: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
          currentStreak: 0,
          achievements: []
        };
      }

      // Calculate current streak
      const currentStreak = await this.getCurrentStreak(userId);

      // Get user achievements
      const achievements = await this.getUserAchievements(userId);

      return {
        totalPoints: stats.totalPoints || 0,
        quizzesCompleted: stats.quizzesCompleted || 0,
        averageScore: Math.round(stats.averageScore || 0),
        bestScore: Math.round(stats.bestScore || 0),
        totalTimeSpent: stats.totalTimeSpent || 0,
        currentStreak,
        achievements
      };
    } catch (error) {
      console.error('Error fetching user quiz stats:', error);
      throw error;
    }
  }

  // Get leaderboard
  static async getLeaderboard(period = 'all', limit = 10) {
    try {
      let dateFilter = '';
      const params = [];

      if (period === 'week') {
        dateFilter = "AND qa.completed_at >= date('now', '-7 days')";
      } else if (period === 'month') {
        dateFilter = "AND qa.completed_at >= date('now', '-30 days')";
      }

      const query = `
        SELECT
          u.id as user_id,
          u.email as username,
          SUM(qa.points_earned) as total_points,
          COUNT(qa.id) as quizzes_completed,
          AVG(CAST(qa.score AS FLOAT) / qa.total_questions * 100) as average_score,
          ROW_NUMBER() OVER (ORDER BY SUM(qa.points_earned) DESC) as rank
        FROM users u
        INNER JOIN quiz_attempts qa ON u.id = qa.user_id
        WHERE u.is_active = 1 ${dateFilter}
        GROUP BY u.id, u.email
        ORDER BY total_points DESC
        LIMIT ?
      `;

      params.push(limit);

      const leaderboard = await db.allAsync(query, params);

      return leaderboard.map(entry => ({
        ...entry,
        average_score: Math.round(entry.average_score || 0)
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  // Get user's current rank
  static async getUserRank(userId) {
    try {
      const rankQuery = `
        SELECT
          total_quiz_points,
          (
            SELECT COUNT(*) + 1
            FROM users
            WHERE total_quiz_points > u.total_quiz_points
            AND is_active = 1
          ) as rank
        FROM users u
        WHERE u.id = ? AND u.is_active = 1
      `;

      const result = await db.getAsync(rankQuery, [userId]);

      return {
        totalPoints: result?.total_quiz_points || 0,
        rank: result?.rank || 1
      };
    } catch (error) {
      console.error('Error fetching user rank:', error);
      throw error;
    }
  }

  // Calculate current streak (consecutive days with quizzes)
  static async getCurrentStreak(userId) {
    try {
      const streakQuery = `
        WITH daily_quizzes AS (
          SELECT DISTINCT date(completed_at) as quiz_date
          FROM quiz_attempts
          WHERE user_id = ?
          ORDER BY quiz_date DESC
        ),
        streak_calculation AS (
          SELECT
            quiz_date,
            julianday(quiz_date) - julianday(LAG(quiz_date) OVER (ORDER BY quiz_date DESC)) as day_diff
          FROM daily_quizzes
        )
        SELECT COUNT(*) as streak
        FROM streak_calculation
        WHERE day_diff = -1 OR day_diff IS NULL
      `;

      const result = await db.getAsync(streakQuery, [userId]);
      return result?.streak || 0;
    } catch (error) {
      console.error('Error calculating current streak:', error);
      return 0;
    }
  }

  // Get user achievements
  static async getUserAchievements(userId) {
    try {
      const query = `
        SELECT
          qa.id,
          qa.name,
          qa.description,
          qa.icon,
          ua.earned_at
        FROM quiz_achievements qa
        INNER JOIN user_achievements ua ON qa.id = ua.achievement_id
        WHERE ua.user_id = ?
        ORDER BY ua.earned_at DESC
      `;

      return await db.allAsync(query, [userId]);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }
  }

  // Seed initial quiz questions (for development)
  static async seedQuestions() {
    try {
      const sampleQuestions = [
        {
          id: 'q1',
          question: 'What percentage of your monthly income should you save?',
          options: ['5-10%', '20-30%', '50-60%', '70-80%'],
          correctAnswer: 1,
          difficulty: 'beginner',
          category: 'savings',
          explanation: 'Financial experts recommend saving 20-30% of your income for a secure financial future.'
        },
        {
          id: 'q2',
          question: 'How many months of expenses should you keep in an emergency fund?',
          options: ['1-2 months', '3-6 months', '12 months', '24 months'],
          correctAnswer: 1,
          difficulty: 'beginner',
          category: 'emergency fund',
          explanation: 'An emergency fund should cover at least 3-6 months of your living expenses.'
        },
        {
          id: 'q3',
          question: 'How much money do farmers receive annually under the PM-KISAN scheme?',
          options: ['₹4,000', '₹6,000', '₹8,000', '₹10,000'],
          correctAnswer: 1,
          difficulty: 'intermediate',
          category: 'government schemes',
          explanation: 'Under the PM-KISAN scheme, farmers receive ₹6,000 per year in three installments.'
        }
      ];

      for (const question of sampleQuestions) {
        const insertQuery = `
          INSERT OR IGNORE INTO quiz_questions
          (id, question, options, correct_answer, difficulty, category, explanation)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.runAsync(
          insertQuery,
          [
            question.id,
            question.question,
            JSON.stringify(question.options),
            question.correctAnswer,
            question.difficulty,
            question.category,
            question.explanation
          ]
        );
      }

      console.log('✅ Sample quiz questions seeded successfully');
    } catch (error) {
      console.error('Error seeding quiz questions:', error);
      throw error;
    }
  }
}