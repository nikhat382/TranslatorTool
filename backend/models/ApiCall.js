import db from '../config/database.js';

// API Cost constants (per 1M tokens or per request)
const API_COSTS = {
  gemini: {
    'gemini-1.5-flash-8b': {
      input: 0.0375 / 1_000_000,  // $0.0375 per 1M input tokens
      output: 0.15 / 1_000_000     // $0.15 per 1M output tokens
    },
    'gemini-1.5-flash': {
      input: 0.075 / 1_000_000,
      output: 0.30 / 1_000_000
    },
    'gemini-1.5-pro': {
      input: 1.25 / 1_000_000,
      output: 5.00 / 1_000_000
    }
  },
  claude: {
    'claude-sonnet-4-20250514': {
      input: 3.00 / 1_000_000,     // $3 per 1M input tokens
      output: 15.00 / 1_000_000    // $15 per 1M output tokens
    },
    'claude-3-5-sonnet': {
      input: 3.00 / 1_000_000,
      output: 15.00 / 1_000_000
    },
    'claude-3-opus': {
      input: 15.00 / 1_000_000,
      output: 75.00 / 1_000_000
    }
  },
  gpt: {
    'gpt-4-vision-preview': {
      input: 10.00 / 1_000_000,    // $10 per 1M tokens
      output: 30.00 / 1_000_000    // $30 per 1M tokens
    },
    'gpt-4': {
      input: 30.00 / 1_000_000,
      output: 60.00 / 1_000_000
    },
    'gpt-3.5-turbo': {
      input: 0.50 / 1_000_000,
      output: 1.50 / 1_000_000
    }
  }
};

class ApiCall {
  // Calculate cost based on service and tokens
  static calculateCost(serviceName, modelName, inputTokens, outputTokens) {
    const service = API_COSTS[serviceName?.toLowerCase()];
    if (!service) return 0;

    const model = service[modelName];
    if (!model) {
      // Use first model as default for the service
      const defaultModel = Object.values(service)[0];
      return (inputTokens * defaultModel.input) + (outputTokens * defaultModel.output);
    }

    return (inputTokens * model.input) + (outputTokens * model.output);
  }

  // Estimate tokens for Gemini (since it doesn't always return token count)
  static estimateTokens(text) {
    // Rough estimation: 1 token ≈ 4 characters for English
    // Adjust for other languages
    return Math.ceil(text.length / 4);
  }

  // Create a new API call record
  static create({
    documentId,
    userId,
    serviceName,
    modelName,
    inputTokens,
    outputTokens,
    latencyMs,
    cacheHit,
    success,
    errorMessage
  }) {
    const totalTokens = (inputTokens || 0) + (outputTokens || 0);
    const cost = this.calculateCost(serviceName, modelName, inputTokens || 0, outputTokens || 0);

    const stmt = db.prepare(`
      INSERT INTO api_calls (
        document_id, user_id, service_name, model_name,
        input_tokens, output_tokens, total_tokens, cost,
        latency_ms, cache_hit, success, error_message
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      const result = stmt.run(
        documentId,
        userId || null,
        serviceName,
        modelName || null,
        inputTokens || 0,
        outputTokens || 0,
        totalTokens,
        cost,
        latencyMs || null,
        cacheHit ? 1 : 0,
        success ? 1 : 0,
        errorMessage || null
      );
      return this.findById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`API call logging failed: ${error.message}`);
    }
  }

  // Find API call by ID
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM api_calls WHERE id = ?');
    return stmt.get(id);
  }

  // Get all API calls for a document
  static findByDocumentId(documentId) {
    const stmt = db.prepare(`
      SELECT * FROM api_calls
      WHERE document_id = ?
      ORDER BY created_at ASC
    `);
    return stmt.all(documentId);
  }

  // Get API calls for a user with filters
  static findByUserId(userId, options = {}) {
    const { startDate, endDate, serviceName, limit = 100, offset = 0 } = options;

    let query = `SELECT * FROM api_calls WHERE user_id = ?`;
    const params = [userId];

    if (startDate) {
      query += ` AND created_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= ?`;
      params.push(endDate);
    }

    if (serviceName) {
      query += ` AND service_name = ?`;
      params.push(serviceName);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  // Get cost summary for a user
  static getUserCostSummary(userId, startDate = null, endDate = null) {
    let query = `
      SELECT
        COUNT(*) as total_calls,
        SUM(cost) as total_cost,
        SUM(CASE WHEN service_name = 'gemini' THEN cost ELSE 0 END) as gemini_cost,
        SUM(CASE WHEN service_name = 'claude' THEN cost ELSE 0 END) as claude_cost,
        SUM(CASE WHEN service_name = 'gpt' THEN cost ELSE 0 END) as gpt_cost,
        SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END) as cache_hits,
        SUM(CASE WHEN cache_hit = 0 THEN 1 ELSE 0 END) as cache_misses,
        SUM(total_tokens) as total_tokens,
        AVG(latency_ms) as avg_latency_ms,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_calls
      FROM api_calls
      WHERE user_id = ?
    `;

    const params = [userId];

    if (startDate) {
      query += ` AND created_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= ?`;
      params.push(endDate);
    }

    const stmt = db.prepare(query);
    return stmt.get(...params);
  }

  // Get cost breakdown by service
  static getServiceBreakdown(userId, startDate = null, endDate = null) {
    let query = `
      SELECT
        service_name,
        model_name,
        COUNT(*) as call_count,
        SUM(cost) as total_cost,
        SUM(input_tokens) as total_input_tokens,
        SUM(output_tokens) as total_output_tokens,
        SUM(total_tokens) as total_tokens,
        AVG(latency_ms) as avg_latency_ms,
        SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END) as cache_hits
      FROM api_calls
      WHERE user_id = ?
    `;

    const params = [userId];

    if (startDate) {
      query += ` AND created_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= ?`;
      params.push(endDate);
    }

    query += ` GROUP BY service_name, model_name ORDER BY total_cost DESC`;

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  // Get cache performance statistics
  static getCacheStats(userId = null, startDate = null, endDate = null) {
    let query = `
      SELECT
        COUNT(*) as total_requests,
        SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END) as cache_hits,
        SUM(CASE WHEN cache_hit = 0 THEN 1 ELSE 0 END) as cache_misses,
        ROUND(CAST(SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2) as hit_rate,
        SUM(CASE WHEN cache_hit = 1 THEN cost ELSE 0 END) as cost_saved,
        SUM(CASE WHEN cache_hit = 0 THEN cost ELSE 0 END) as actual_cost
      FROM api_calls
      WHERE 1=1
    `;

    const params = [];

    if (userId) {
      query += ` AND user_id = ?`;
      params.push(userId);
    }

    if (startDate) {
      query += ` AND created_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at <= ?`;
      params.push(endDate);
    }

    const stmt = db.prepare(query);
    return stmt.get(...params);
  }

  // Get daily cost trends
  static getDailyCostTrend(userId, days = 30) {
    const stmt = db.prepare(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as call_count,
        SUM(cost) as daily_cost,
        SUM(CASE WHEN service_name = 'gemini' THEN cost ELSE 0 END) as gemini_cost,
        SUM(CASE WHEN service_name = 'claude' THEN cost ELSE 0 END) as claude_cost,
        SUM(CASE WHEN service_name = 'gpt' THEN cost ELSE 0 END) as gpt_cost,
        SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END) as cache_hits
      FROM api_calls
      WHERE user_id = ?
        AND created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
    return stmt.all(userId, days);
  }
}

export default ApiCall;
