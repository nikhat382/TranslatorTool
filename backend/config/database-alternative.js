// Alternative database implementation using JSON files (no native dependencies)
// This is a simple file-based database that works on all platforms without compilation

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DB_DIR, 'translator-data.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database structure
let database = {
  users: [],
  documents: [],
  api_calls: [],
  translations: [],
  usage_logs: [],
  _counters: {
    users: 0,
    documents: 0,
    api_calls: 0,
    translations: 0,
    usage_logs: 0
  }
};

// Load existing data if available
if (fs.existsSync(DB_FILE)) {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    database = JSON.parse(data);
    console.log('✅ Database loaded from file');
  } catch (error) {
    console.error('⚠️  Could not load database file, starting fresh:', error.message);
  }
} else {
  saveDatabase();
  console.log('✅ New database file created');
}

// Save database to file
function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));
  } catch (error) {
    console.error('❌ Failed to save database:', error.message);
  }
}

// Auto-save every 5 seconds if there are changes
let hasChanges = false;
setInterval(() => {
  if (hasChanges) {
    saveDatabase();
    hasChanges = false;
  }
}, 5000);

// Database wrapper that mimics SQLite API
const db = {
  // Prepare a statement (mimics better-sqlite3 API)
  prepare: (sql) => {
    return {
      run: (...params) => {
        hasChanges = true;

        // Parse SQL and execute
        if (sql.includes('INSERT INTO users')) {
          const [email, username, passwordHash] = params;
          const id = ++database._counters.users;
          const user = {
            id,
            email,
            username,
            password_hash: passwordHash,
            total_cost: 0,
            quota_limit: 100.00,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          database.users.push(user);
          saveDatabase();
          return { lastInsertRowid: id };
        }

        else if (sql.includes('INSERT INTO documents')) {
          const [userId, fileHash, originalFilename, fileSize, fileType, sourceLang, targetLang, wordCount, characterCount] = params;
          const id = ++database._counters.documents;
          const doc = {
            id,
            user_id: userId,
            file_hash: fileHash,
            original_filename: originalFilename,
            file_size: fileSize,
            file_type: fileType,
            source_lang: sourceLang,
            target_lang: targetLang,
            word_count: wordCount,
            character_count: characterCount,
            created_at: new Date().toISOString()
          };
          database.documents.push(doc);
          saveDatabase();
          return { lastInsertRowid: id };
        }

        else if (sql.includes('INSERT INTO api_calls')) {
          const [documentId, userId, serviceName, modelName, inputTokens, outputTokens, totalTokens, cost, latencyMs, cacheHit, success, errorMessage] = params;
          const id = ++database._counters.api_calls;
          const apiCall = {
            id,
            document_id: documentId,
            user_id: userId,
            service_name: serviceName,
            model_name: modelName,
            input_tokens: inputTokens,
            output_tokens: outputTokens,
            total_tokens: totalTokens,
            cost: cost,
            latency_ms: latencyMs,
            cache_hit: cacheHit ? 1 : 0,
            success: success ? 1 : 0,
            error_message: errorMessage,
            created_at: new Date().toISOString()
          };
          database.api_calls.push(apiCall);
          saveDatabase();
          return { lastInsertRowid: id };
        }

        else if (sql.includes('INSERT INTO translations')) {
          const [documentId, userId, translatedText, segments, metadata, kpiData, confidenceScore] = params;
          const id = ++database._counters.translations;
          const translation = {
            id,
            document_id: documentId,
            user_id: userId,
            translated_text: translatedText,
            segments: segments,
            metadata: metadata,
            kpi_data: kpiData,
            confidence_score: confidenceScore,
            created_at: new Date().toISOString()
          };
          database.translations.push(translation);
          saveDatabase();
          return { lastInsertRowid: id };
        }

        else if (sql.includes('UPDATE users') && sql.includes('total_cost')) {
          const [additionalCost, userId] = params;
          const user = database.users.find(u => u.id === userId);
          if (user) {
            user.total_cost += additionalCost;
            user.updated_at = new Date().toISOString();
            saveDatabase();
          }
          return { changes: user ? 1 : 0 };
        }

        return { lastInsertRowid: 0, changes: 0 };
      },

      get: (...params) => {
        // Parse SQL and execute
        if (sql.includes('SELECT * FROM users WHERE id')) {
          const [id] = params;
          return database.users.find(u => u.id === id) || null;
        }

        else if (sql.includes('SELECT * FROM users WHERE email')) {
          const [email] = params;
          return database.users.find(u => u.email === email) || null;
        }

        else if (sql.includes('SELECT * FROM users WHERE username')) {
          const [username] = params;
          return database.users.find(u => u.username === username) || null;
        }

        else if (sql.includes('SELECT * FROM documents WHERE id')) {
          const [id] = params;
          return database.documents.find(d => d.id === id) || null;
        }

        else if (sql.includes('SELECT * FROM api_calls WHERE id')) {
          const [id] = params;
          return database.api_calls.find(a => a.id === id) || null;
        }

        else if (sql.includes('SELECT * FROM translations WHERE id')) {
          const [id] = params;
          return database.translations.find(t => t.id === id) || null;
        }

        else if (sql.includes('SELECT * FROM translations WHERE document_id')) {
          const [documentId] = params;
          const translations = database.translations.filter(t => t.document_id === documentId);
          return translations.length > 0 ? translations[translations.length - 1] : null;
        }

        // Cost summary query
        else if (sql.includes('SELECT') && sql.includes('total_calls') && sql.includes('FROM api_calls')) {
          const [userId, startDate, endDate] = params;
          let calls = database.api_calls.filter(c => c.user_id === userId);

          if (startDate) {
            calls = calls.filter(c => c.created_at >= startDate);
          }
          if (endDate) {
            calls = calls.filter(c => c.created_at <= endDate);
          }

          const total_cost = calls.reduce((sum, c) => sum + c.cost, 0);
          const gemini_cost = calls.filter(c => c.service_name === 'gemini').reduce((sum, c) => sum + c.cost, 0);
          const claude_cost = calls.filter(c => c.service_name === 'claude').reduce((sum, c) => sum + c.cost, 0);
          const gpt_cost = calls.filter(c => c.service_name === 'gpt').reduce((sum, c) => sum + c.cost, 0);
          const cache_hits = calls.filter(c => c.cache_hit === 1).length;
          const cache_misses = calls.filter(c => c.cache_hit === 0).length;

          return {
            total_calls: calls.length,
            total_cost,
            gemini_cost,
            claude_cost,
            gpt_cost,
            cache_hits,
            cache_misses,
            total_tokens: calls.reduce((sum, c) => sum + c.total_tokens, 0),
            avg_latency_ms: calls.length > 0 ? calls.reduce((sum, c) => sum + (c.latency_ms || 0), 0) / calls.length : 0,
            failed_calls: calls.filter(c => c.success === 0).length
          };
        }

        // Cache statistics query
        else if (sql.includes('as hit_rate') && sql.includes('as cost_saved')) {
          const [userId, startDate, endDate] = params.filter(p => p !== undefined);
          let calls = database.api_calls;

          if (userId) {
            calls = calls.filter(c => c.user_id === userId);
          }
          if (startDate) {
            calls = calls.filter(c => c.created_at >= startDate);
          }
          if (endDate) {
            calls = calls.filter(c => c.created_at <= endDate);
          }

          const total_requests = calls.length;
          const cache_hits = calls.filter(c => c.cache_hit === 1).length;
          const cache_misses = calls.filter(c => c.cache_hit === 0).length;
          const cost_saved = calls.filter(c => c.cache_hit === 1).reduce((sum, c) => sum + c.cost, 0);
          const actual_cost = calls.filter(c => c.cache_hit === 0).reduce((sum, c) => sum + c.cost, 0);
          const hit_rate = total_requests > 0 ? (cache_hits / total_requests * 100).toFixed(2) : 0;

          return {
            total_requests,
            cache_hits,
            cache_misses,
            hit_rate: parseFloat(hit_rate),
            cost_saved,
            actual_cost
          };
        }

        return null;
      },

      all: (...params) => {
        // Parse SQL and execute
        if (sql.includes('SELECT * FROM documents WHERE user_id')) {
          const [userId, limit, offset] = params;
          let docs = database.documents.filter(d => d.user_id === userId);
          docs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          return docs.slice(offset || 0, (offset || 0) + (limit || 50));
        }

        else if (sql.includes('SELECT * FROM api_calls WHERE document_id')) {
          const [documentId] = params;
          return database.api_calls.filter(c => c.document_id === documentId);
        }

        // Document cost breakdown query (LEFT JOIN with api_calls, GROUP BY d.id)
        else if (sql.includes('LEFT JOIN api_calls ac ON d.id = ac.document_id') && sql.includes('GROUP BY d.id')) {
          const [userId, startDate, endDate] = params.filter(p => p !== undefined);
          let docs = database.documents.filter(d => d.user_id === userId);

          if (startDate) {
            docs = docs.filter(d => d.created_at >= startDate);
          }
          if (endDate) {
            docs = docs.filter(d => d.created_at <= endDate);
          }

          return docs.map(doc => {
            const calls = database.api_calls.filter(c => c.document_id === doc.id);
            const total_cost = calls.reduce((sum, c) => sum + c.cost, 0);
            const gemini_cost = calls.filter(c => c.service_name === 'gemini').reduce((sum, c) => sum + c.cost, 0);
            const claude_cost = calls.filter(c => c.service_name === 'claude').reduce((sum, c) => sum + c.cost, 0);
            const gpt_cost = calls.filter(c => c.service_name === 'gpt').reduce((sum, c) => sum + c.cost, 0);

            return {
              ...doc,
              api_call_count: calls.length,
              total_cost,
              gemini_cost,
              claude_cost,
              gpt_cost,
              cache_hits: calls.filter(c => c.cache_hit === 1).length,
              cache_misses: calls.filter(c => c.cache_hit === 0).length
            };
          });
        }

        // Service breakdown query (GROUP BY service_name, model_name)
        else if (sql.includes('GROUP BY service_name, model_name')) {
          const [userId, startDate, endDate] = params.filter(p => p !== undefined);
          let calls = database.api_calls.filter(c => c.user_id === userId);

          if (startDate) {
            calls = calls.filter(c => c.created_at >= startDate);
          }
          if (endDate) {
            calls = calls.filter(c => c.created_at <= endDate);
          }

          // Group by service_name and model_name
          const groups = {};
          calls.forEach(call => {
            const key = `${call.service_name}::${call.model_name}`;
            if (!groups[key]) {
              groups[key] = {
                service_name: call.service_name,
                model_name: call.model_name,
                call_count: 0,
                total_cost: 0,
                total_input_tokens: 0,
                total_output_tokens: 0,
                total_tokens: 0,
                total_latency: 0,
                cache_hits: 0
              };
            }
            groups[key].call_count++;
            groups[key].total_cost += call.cost;
            groups[key].total_input_tokens += call.input_tokens;
            groups[key].total_output_tokens += call.output_tokens;
            groups[key].total_tokens += call.total_tokens;
            groups[key].total_latency += (call.latency_ms || 0);
            if (call.cache_hit === 1) groups[key].cache_hits++;
          });

          return Object.values(groups).map(g => ({
            ...g,
            avg_latency_ms: g.call_count > 0 ? g.total_latency / g.call_count : 0
          })).sort((a, b) => b.total_cost - a.total_cost);
        }

        // Daily cost trend query (GROUP BY DATE)
        else if (sql.includes('GROUP BY DATE(created_at)')) {
          const [userId, days] = params;
          const calls = database.api_calls.filter(c => c.user_id === userId);

          // Group by date
          const dateGroups = {};
          calls.forEach(call => {
            const date = call.created_at.split('T')[0]; // Extract date part
            if (!dateGroups[date]) {
              dateGroups[date] = {
                date,
                call_count: 0,
                daily_cost: 0,
                gemini_cost: 0,
                claude_cost: 0,
                gpt_cost: 0,
                cache_hits: 0
              };
            }
            dateGroups[date].call_count++;
            dateGroups[date].daily_cost += call.cost;
            if (call.service_name === 'gemini') dateGroups[date].gemini_cost += call.cost;
            if (call.service_name === 'claude') dateGroups[date].claude_cost += call.cost;
            if (call.service_name === 'gpt') dateGroups[date].gpt_cost += call.cost;
            if (call.cache_hit === 1) dateGroups[date].cache_hits++;
          });

          return Object.values(dateGroups).sort((a, b) => b.date.localeCompare(a.date));
        }

        return [];
      }
    };
  },

  // Execute SQL directly (for CREATE TABLE statements)
  exec: (sql) => {
    // Ignore CREATE TABLE statements (structure is fixed in JSON)
    console.log('📋 Database structure initialized (JSON-based)');
  },

  // Enable pragmas (no-op for JSON database)
  pragma: (pragma) => {
    // No-op
  }
};

console.log('✅ JSON-based database initialized successfully');
console.log(`📁 Database location: ${DB_FILE}`);

export default db;
