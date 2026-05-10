import db from '../config/database.js';

class Translation {
  // Create a new translation record
  static create({
    documentId,
    userId,
    translatedText,
    segments,
    metadata,
    kpiData,
    confidenceScore
  }) {
    const stmt = db.prepare(`
      INSERT INTO translations (
        document_id, user_id, translated_text, segments,
        metadata, kpi_data, confidence_score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      const result = stmt.run(
        documentId,
        userId || null,
        translatedText,
        JSON.stringify(segments || []),
        JSON.stringify(metadata || {}),
        JSON.stringify(kpiData || {}),
        confidenceScore || null
      );
      return this.findById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Translation creation failed: ${error.message}`);
    }
  }

  // Find translation by ID
  static findById(id) {
    const stmt = db.prepare('SELECT * FROM translations WHERE id = ?');
    const row = stmt.get(id);
    if (row) {
      return this._parseJsonFields(row);
    }
    return null;
  }

  // Find translation by document ID
  static findByDocumentId(documentId) {
    const stmt = db.prepare(`
      SELECT * FROM translations
      WHERE document_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);
    const row = stmt.get(documentId);
    if (row) {
      return this._parseJsonFields(row);
    }
    return null;
  }

  // Get translation with document and cost information
  static getWithDetails(translationId) {
    const stmt = db.prepare(`
      SELECT
        t.*,
        d.original_filename,
        d.file_type,
        d.source_lang,
        d.target_lang,
        d.word_count,
        SUM(ac.cost) as total_cost,
        COUNT(ac.id) as api_call_count
      FROM translations t
      JOIN documents d ON t.document_id = d.id
      LEFT JOIN api_calls ac ON d.id = ac.document_id
      WHERE t.id = ?
      GROUP BY t.id
    `);
    const row = stmt.get(translationId);
    if (row) {
      return this._parseJsonFields(row);
    }
    return null;
  }

  // Get all translations for a user
  static findByUserId(userId, limit = 50, offset = 0) {
    const stmt = db.prepare(`
      SELECT
        t.*,
        d.original_filename,
        d.file_type,
        d.source_lang,
        d.target_lang
      FROM translations t
      JOIN documents d ON t.document_id = d.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `);
    const rows = stmt.all(userId, limit, offset);
    return rows.map(row => this._parseJsonFields(row));
  }

  // Parse JSON fields from database row
  static _parseJsonFields(row) {
    if (!row) return null;

    return {
      ...row,
      segments: row.segments ? JSON.parse(row.segments) : [],
      metadata: row.metadata ? JSON.parse(row.metadata) : {},
      kpi_data: row.kpi_data ? JSON.parse(row.kpi_data) : {}
    };
  }

  // Get translation preview (first N characters)
  static getPreview(translationId, maxLength = 500) {
    const translation = this.findById(translationId);
    if (!translation) return null;

    return {
      id: translation.id,
      document_id: translation.document_id,
      preview: translation.translated_text.substring(0, maxLength),
      is_truncated: translation.translated_text.length > maxLength,
      full_length: translation.translated_text.length,
      segments: translation.segments,
      metadata: translation.metadata,
      kpi_data: translation.kpi_data,
      confidence_score: translation.confidence_score,
      created_at: translation.created_at
    };
  }

  // Search translations by text
  static search(userId, searchTerm, limit = 20) {
    const stmt = db.prepare(`
      SELECT
        t.*,
        d.original_filename,
        d.file_type
      FROM translations t
      JOIN documents d ON t.document_id = d.id
      WHERE t.user_id = ?
        AND (t.translated_text LIKE ? OR d.original_filename LIKE ?)
      ORDER BY t.created_at DESC
      LIMIT ?
    `);
    const searchPattern = `%${searchTerm}%`;
    const rows = stmt.all(userId, searchPattern, searchPattern, limit);
    return rows.map(row => this._parseJsonFields(row));
  }
}

export default Translation;
