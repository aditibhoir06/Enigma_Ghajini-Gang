import db from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';

class User {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.password - Plain text password
   * @returns {Object} - Created user (without password)
   */
  static async create({ email, password }) {
    return new Promise(async (resolve, reject) => {
      try {
        // Hash the password
        const passwordHash = await hashPassword(password);

        // Insert user into database
        const query = `
          INSERT INTO users (email, password_hash)
          VALUES (?, ?)
        `;

        db.run(query, [email, passwordHash], async function(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT' || err.message.includes('UNIQUE constraint failed')) {
              return reject(new Error('User with this email already exists'));
            }
            return reject(new Error('Error creating user: ' + err.message));
          }

          try {
            // this.lastID contains the ID of the inserted row
            const user = await User.findById(this.lastID);
            resolve(user);
          } catch (findError) {
            reject(new Error('Error finding created user: ' + findError.message));
          }
        });
      } catch (error) {
        reject(new Error('Error hashing password: ' + error.message));
      }
    });
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Object|null} - User object or null
   */
  static async findById(id) {
    try {
      const query = `
        SELECT id, email, created_at, updated_at, is_active
        FROM users
        WHERE id = ? AND is_active = 1
      `;

      return await db.getAsync(query, [id]);
    } catch (error) {
      throw new Error('Error finding user by ID: ' + error.message);
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Object|null} - User object or null
   */
  static async findByEmail(email) {
    try {
      const query = `
        SELECT id, email, created_at, updated_at, is_active
        FROM users
        WHERE email = ? AND is_active = 1
      `;

      return await db.getAsync(query, [email]);
    } catch (error) {
      throw new Error('Error finding user by email: ' + error.message);
    }
  }

  /**
   * Find user by email with password hash (for authentication)
   * @param {string} email - User email
   * @returns {Object|null} - User object with password hash or null
   */
  static async findByEmailWithPassword(email) {
    try {
      const query = `
        SELECT id, email, password_hash, created_at, updated_at, is_active
        FROM users
        WHERE email = ? AND is_active = 1
      `;

      return await db.getAsync(query, [email]);
    } catch (error) {
      throw new Error('Error finding user by email: ' + error.message);
    }
  }

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - Plain text password
   * @returns {Object|null} - User object (without password) or null
   */
  static async authenticate(email, password) {
    try {
      const user = await this.findByEmailWithPassword(email);

      if (!user) {
        return null;
      }

      const isPasswordValid = await comparePassword(password, user.password_hash);

      if (!isPasswordValid) {
        return null;
      }

      // Return user without password hash
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error('Error authenticating user: ' + error.message);
    }
  }

  /**
   * Update user's last updated timestamp
   * @param {number} id - User ID
   */
  static async updateTimestamp(id) {
    try {
      const query = `
        UPDATE users
        SET updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await db.runAsync(query, [id]);
    } catch (error) {
      throw new Error('Error updating user timestamp: ' + error.message);
    }
  }

  /**
   * Get total user count
   * @returns {number} - Total number of active users
   */
  static async getCount() {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM users
        WHERE is_active = 1
      `;

      const result = await db.getAsync(query);
      return result.count;
    } catch (error) {
      throw new Error('Error getting user count: ' + error.message);
    }
  }
}

export default User;