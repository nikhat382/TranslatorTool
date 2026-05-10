// Database module with automatic fallback to JSON-based implementation
// Tries better-sqlite3 first, falls back to JSON if native module fails

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db;
let usingJsonFallback = false;

try {
  // Try to use better-sqlite3 (native SQLite)
  const Database = (await import('better-sqlite3')).default;
  db = new Database(join(__dirname, '../data/translator.db'), { verbose: console.log });

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tables
  const createTables = () => {
    // Users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        total_cost REAL DEFAULT 0,
        quota_limit REAL DEFAULT 100.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Documents table
    db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        file_hash TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        file_type TEXT NOT NULL,
        source_lang TEXT NOT NULL,
        target_lang TEXT NOT NULL,
        word_count INTEGER,
        character_count INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // API calls table
    db.exec(`
      CREATE TABLE IF NOT EXISTS api_calls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        user_id INTEGER,
        service_name TEXT NOT NULL,
        model_name TEXT,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        cost REAL DEFAULT 0,
        latency_ms INTEGER,
        cache_hit BOOLEAN DEFAULT 0,
        success BOOLEAN DEFAULT 1,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Translation results table
    db.exec(`
      CREATE TABLE IF NOT EXISTS translations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id INTEGER NOT NULL,
        user_id INTEGER,
        translated_text TEXT NOT NULL,
        segments TEXT,
        metadata TEXT,
        kpi_data TEXT,
        confidence_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Usage logs table for aggregated daily statistics
    db.exec(`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date DATE NOT NULL,
        total_api_calls INTEGER DEFAULT 0,
        total_cost REAL DEFAULT 0,
        gemini_calls INTEGER DEFAULT 0,
        gemini_cost REAL DEFAULT 0,
        claude_calls INTEGER DEFAULT 0,
        claude_cost REAL DEFAULT 0,
        gpt_calls INTEGER DEFAULT 0,
        gpt_cost REAL DEFAULT 0,
        cache_hits INTEGER DEFAULT 0,
        cache_misses INTEGER DEFAULT 0,
        documents_processed INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, date)
      )
    `);

    // Create indexes for better query performance
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
      CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON documents(file_hash);
      CREATE INDEX IF NOT EXISTS idx_api_calls_document_id ON api_calls(document_id);
      CREATE INDEX IF NOT EXISTS idx_api_calls_user_id ON api_calls(user_id);
      CREATE INDEX IF NOT EXISTS idx_api_calls_service ON api_calls(service_name);
      CREATE INDEX IF NOT EXISTS idx_api_calls_created_at ON api_calls(created_at);
      CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON usage_logs(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_translations_document_id ON translations(document_id);
    `);

    console.log('✅ Database tables created successfully (SQLite)');
  };

  createTables();
  console.log('✅ Using better-sqlite3 (native SQLite)');

} catch (error) {
  // If better-sqlite3 fails, fall back to JSON-based implementation
  console.log('⚠️  better-sqlite3 not available:', error.message);
  console.log('📋 Falling back to JSON-based database (no native compilation required)');

  // Import the alternative JSON-based implementation
  const alternativeDb = await import('./database-alternative.js');
  db = alternativeDb.default;
  usingJsonFallback = true;

  console.log('✅ Using JSON-based database (platform-independent)');
}

export default db;
export { usingJsonFallback };
