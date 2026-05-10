import db from '../config/database.js';

class UsageLog {
  // Update or create daily usage log
  static upsertDailyLog(userId, date, updates) {
    const {
      apiCalls = 0,
      cost = 0,
      geminiCalls = 0,
      geminiCost = 0,
      claudeCalls = 0,
      claudeCost = 0,
      gptCalls = 0,
      gptCost = 0,
      cacheHits = 0,
      cacheMisses = 0,
      documentsProcessed = 0,
      tokens = 0
    } = updates;

    const stmt = db.prepare(`
      INSERT INTO usage_logs (
        user_id, date, total_api_calls, total_cost,
        gemini_calls, gemini_cost, claude_calls, claude_cost,
        gpt_calls, gpt_cost, cache_hits, cache_misses,
        documents_processed, total_tokens
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, date) DO UPDATE SET
        total_api_calls = total_api_calls + excluded.total_api_calls,
        total_cost = total_cost + excluded.total_cost,
        gemini_calls = gemini_calls + excluded.gemini_calls,
        gemini_cost = gemini_cost + excluded.gemini_cost,
        claude_calls = claude_calls + excluded.claude_calls,
        claude_cost = claude_cost + excluded.claude_cost,
        gpt_calls = gpt_calls + excluded.gpt_calls,
        gpt_cost = gpt_cost + excluded.gpt_cost,
        cache_hits = cache_hits + excluded.cache_hits,
        cache_misses = cache_misses + excluded.cache_misses,
        documents_processed = documents_processed + excluded.documents_processed,
        total_tokens = total_tokens + excluded.total_tokens
    `);

    return stmt.run(
      userId,
      date,
      apiCalls,
      cost,
      geminiCalls,
      geminiCost,
      claudeCalls,
      claudeCost,
      gptCalls,
      gptCost,
      cacheHits,
      cacheMisses,
      documentsProcessed,
      tokens
    );
  }

  // Log API call to daily usage
  static logApiCall(userId, serviceName, cost, tokens, cacheHit) {
    const today = new Date().toISOString().split('T')[0];

    const updates = {
      apiCalls: 1,
      cost: cost,
      tokens: tokens,
      cacheHits: cacheHit ? 1 : 0,
      cacheMisses: cacheHit ? 0 : 1
    };

    const service = serviceName.toLowerCase();
    if (service === 'gemini') {
      updates.geminiCalls = 1;
      updates.geminiCost = cost;
    } else if (service === 'claude') {
      updates.claudeCalls = 1;
      updates.claudeCost = cost;
    } else if (service === 'gpt') {
      updates.gptCalls = 1;
      updates.gptCost = cost;
    }

    return this.upsertDailyLog(userId, today, updates);
  }

  // Log document processing
  static logDocumentProcessed(userId) {
    const today = new Date().toISOString().split('T')[0];
    return this.upsertDailyLog(userId, today, { documentsProcessed: 1 });
  }

  // Get usage logs for a user
  static findByUserId(userId, startDate = null, endDate = null) {
    let query = `
      SELECT * FROM usage_logs
      WHERE user_id = ?
    `;

    const params = [userId];

    if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND date <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY date DESC`;

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  // Get usage summary for a date range
  static getSummary(userId, startDate = null, endDate = null) {
    let query = `
      SELECT
        SUM(total_api_calls) as total_api_calls,
        SUM(total_cost) as total_cost,
        SUM(gemini_calls) as gemini_calls,
        SUM(gemini_cost) as gemini_cost,
        SUM(claude_calls) as claude_calls,
        SUM(claude_cost) as claude_cost,
        SUM(gpt_calls) as gpt_calls,
        SUM(gpt_cost) as gpt_cost,
        SUM(cache_hits) as cache_hits,
        SUM(cache_misses) as cache_misses,
        SUM(documents_processed) as documents_processed,
        SUM(total_tokens) as total_tokens,
        COUNT(DISTINCT date) as days_active
      FROM usage_logs
      WHERE user_id = ?
    `;

    const params = [userId];

    if (startDate) {
      query += ` AND date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND date <= ?`;
      params.push(endDate);
    }

    const stmt = db.prepare(query);
    return stmt.get(...params);
  }

  // Get monthly usage breakdown
  static getMonthlyBreakdown(userId, year) {
    const stmt = db.prepare(`
      SELECT
        strftime('%m', date) as month,
        SUM(total_api_calls) as total_api_calls,
        SUM(total_cost) as total_cost,
        SUM(gemini_cost) as gemini_cost,
        SUM(claude_cost) as claude_cost,
        SUM(gpt_cost) as gpt_cost,
        SUM(documents_processed) as documents_processed
      FROM usage_logs
      WHERE user_id = ?
        AND strftime('%Y', date) = ?
      GROUP BY strftime('%m', date)
      ORDER BY month
    `);
    return stmt.all(userId, year.toString());
  }

  // Get top users by cost
  static getTopUsersByCost(limit = 10, startDate = null, endDate = null) {
    let query = `
      SELECT
        ul.user_id,
        u.email,
        u.username,
        SUM(ul.total_cost) as total_cost,
        SUM(ul.total_api_calls) as total_api_calls,
        SUM(ul.documents_processed) as documents_processed
      FROM usage_logs ul
      JOIN users u ON ul.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ` AND ul.date >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND ul.date <= ?`;
      params.push(endDate);
    }

    query += `
      GROUP BY ul.user_id, u.email, u.username
      ORDER BY total_cost DESC
      LIMIT ?
    `;
    params.push(limit);

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  // Get cache performance over time
  static getCachePerformance(userId, days = 30) {
    const stmt = db.prepare(`
      SELECT
        date,
        cache_hits,
        cache_misses,
        ROUND(CAST(cache_hits AS FLOAT) / (cache_hits + cache_misses) * 100, 2) as hit_rate
      FROM usage_logs
      WHERE user_id = ?
        AND date >= date('now', '-' || ? || ' days')
      ORDER BY date DESC
    `);
    return stmt.all(userId, days);
  }
}

export default UsageLog;
