import db from '../config/database.js';
import crypto from 'crypto';

class User {
  // Create a new user
  static create({ email, username, password }) {
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const stmt = db.prepare(`
      INSERT INTO users (email, username, password_hash)
      VALUES (?, ?, ?)
    `);

    try {
      const result = stmt.run(email, username, passwordHash);
      return this.findById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`User creation failed: ${error.message}`);
    }
  }

  // Find user by ID
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  // Find user by email
  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  // Find user by username
  static findByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  }

  // Verify password
  static verifyPassword(password, passwordHash) {
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    return hash === passwordHash;
  }

  // Update user's total cost
  static updateTotalCost(userId, additionalCost) {
    const stmt = db.prepare(`
      UPDATE users
      SET total_cost = total_cost + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(additionalCost, userId);
  }

  // Get user statistics
  static getStatistics(userId) {
    const stmt = db.prepare(`
      SELECT
        u.email,
        u.username,
        u.total_cost,
        u.quota_limit,
        COUNT(DISTINCT d.id) as total_documents,
        COUNT(DISTINCT ac.id) as total_api_calls,
        SUM(CASE WHEN ac.cache_hit = 1 THEN 1 ELSE 0 END) as cache_hits,
        SUM(CASE WHEN ac.cache_hit = 0 THEN 1 ELSE 0 END) as cache_misses,
        u.created_at
      FROM users u
      LEFT JOIN documents d ON u.id = d.user_id
      LEFT JOIN api_calls ac ON u.id = ac.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `);
    return stmt.get(userId);
  }

  // Get all users
  static findAll() {
    const stmt = db.prepare('SELECT id, email, username, total_cost, quota_limit, created_at FROM users');
    return stmt.all();
  }

  // Update quota limit
  static updateQuotaLimit(userId, newLimit) {
    const stmt = db.prepare(`
      UPDATE users
      SET quota_limit = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    return stmt.run(newLimit, userId);
  }
}

export default User;
