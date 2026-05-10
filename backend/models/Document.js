import db from '../config/database.js';

class Document {
  // Create a new document record
  static create({
    userId,
    fileHash,
    originalFilename,
    fileSize,
    fileType,
    sourceLang,
    targetLang,
    wordCount,
    characterCount
  }) {
    const stmt = db.prepare(`
      INSERT INTO documents (
        user_id, file_hash, original_filename, file_size, file_type,
        source_lang, target_lang, word_count, character_count
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      const result = stmt.run(
        userId || null,
        fileHash,
        originalFilename,
        fileSize,
        fileType,
        sourceLang,
        targetLang,
        wordCount || 0,
        characterCount || 0
      );
      return this.findById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Document creation failed: ${error.message}`);
    }
  }

  // Find document by ID
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM documents WHERE id = ?');
    return stmt.get(id);
  }

  // Find document by file hash (for cache lookup)
  static findByHash(fileHash, sourceLang, targetLang) {
    const stmt = db.prepare(`
      SELECT * FROM documents
      WHERE file_hash = ? AND source_lang = ? AND target_lang = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);
    return stmt.get(fileHash, sourceLang, targetLang);
  }

  // Get all documents for a user
  static findByUserId(userId, limit = 50, offset = 0) {
    const stmt = db.prepare(`
      SELECT * FROM documents
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `);
    return stmt.all(userId, limit, offset);
  }

  // Get document with associated API calls and costs
  static getWithCosts(documentId) {
    const stmt = db.prepare(`
      SELECT
        d.*,
        COUNT(ac.id) as api_call_count,
        SUM(ac.cost) as total_cost,
        SUM(CASE WHEN ac.service_name = 'gemini' THEN ac.cost ELSE 0 END) as gemini_cost,
        SUM(CASE WHEN ac.service_name = 'claude' THEN ac.cost ELSE 0 END) as claude_cost,
        SUM(CASE WHEN ac.service_name = 'gpt' THEN ac.cost ELSE 0 END) as gpt_cost,
        SUM(CASE WHEN ac.cache_hit = 1 THEN 1 ELSE 0 END) as cache_hits,
        AVG(ac.latency_ms) as avg_latency_ms,
        SUM(ac.total_tokens) as total_tokens
      FROM documents d
      LEFT JOIN api_calls ac ON d.id = ac.document_id
      WHERE d.id = ?
      GROUP BY d.id
    `);
    return stmt.get(documentId);
  }

  // Get documents with cost breakdown for a user
  static getUserDocumentsWithCosts(userId, startDate = null, endDate = null) {
    let query = `
      SELECT
        d.id,
        d.original_filename,
        d.file_type,
        d.source_lang,
        d.target_lang,
        d.word_count,
        d.created_at,
        COUNT(ac.id) as api_call_count,
        SUM(ac.cost) as total_cost,
        SUM(CASE WHEN ac.service_name = 'gemini' THEN ac.cost ELSE 0 END) as gemini_cost,
        SUM(CASE WHEN ac.service_name = 'claude' THEN ac.cost ELSE 0 END) as claude_cost,
        SUM(CASE WHEN ac.service_name = 'gpt' THEN ac.cost ELSE 0 END) as gpt_cost,
        SUM(CASE WHEN ac.cache_hit = 1 THEN 1 ELSE 0 END) as cache_hits,
        SUM(CASE WHEN ac.cache_hit = 0 THEN 1 ELSE 0 END) as cache_misses
      FROM documents d
      LEFT JOIN api_calls ac ON d.id = ac.document_id
      WHERE d.user_id = ?
    `;

    const params = [userId];

    if (startDate) {
      query += ` AND d.created_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND d.created_at <= ?`;
      params.push(endDate);
    }

    query += ` GROUP BY d.id ORDER BY d.created_at DESC`;

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  // Get total count for a user
  static countByUserId(userId) {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM documents WHERE user_id = ?');
    const result = stmt.get(userId);
    return result.count;
  }
}

export default Document;
