import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_FILE = path.join(__dirname, '../data/translator-data.json');

console.log('💉 Injecting sample cost data directly into JSON database...\n');

// Read current database
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// User ID for demo user
const userId = 5;

// Clear existing api_calls
db.api_calls = [];

// Sample API calls with proper cost data
const sampleApiCalls = [
  // Document 8 - business_proposal.pdf
  {
    id: 1,
    document_id: 8,
    user_id: userId,
    service_name: 'gemini',
    model_name: 'gemini-1.5-flash',
    input_tokens: 8750,
    output_tokens: 9500,
    total_tokens: 18250,
    cost: 0.003525,  // Calculated: (8750 * 0.075/1M) + (9500 * 0.30/1M)
    latency_ms: 3200,
    cache_hit: 0,
    success: 1,
    error_message: null,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    document_id: 8,
    user_id: userId,
    service_name: 'gpt',
    model_name: 'gpt-4-vision-preview',
    input_tokens: 9500,
    output_tokens: 10200,
    total_tokens: 19700,
    cost: 0.401,  // Calculated: (9500 * 10/1M) + (10200 * 30/1M)
    latency_ms: 4500,
    cache_hit: 0,
    success: 1,
    error_message: null,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    document_id: 8,
    user_id: userId,
    service_name: 'gemini',
    model_name: 'gemini-1.5-flash-8b',
    input_tokens: 8750,
    output_tokens: 9500,
    total_tokens: 18250,
    cost: 0.001753,  // Calculated: (8750 * 0.0375/1M) + (9500 * 0.15/1M)
    latency_ms: 1800,
    cache_hit: 1,  // Cache hit
    success: 1,
    error_message: null,
    created_at: new Date().toISOString()
  },

  // Document 9 - technical_manual.docx
  {
    id: 4,
    document_id: 9,
    user_id: userId,
    service_name: 'gemini',
    model_name: 'gemini-1.5-pro',
    input_tokens: 22400,
    output_tokens: 24800,
    total_tokens: 47200,
    cost: 0.152,  // Calculated: (22400 * 1.25/1M) + (24800 * 5.00/1M)
    latency_ms: 8500,
    cache_hit: 0,
    success: 1,
    error_message: null,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    document_id: 9,
    user_id: userId,
    service_name: 'claude',
    model_name: 'claude-3-5-sonnet',
    input_tokens: 24800,
    output_tokens: 26500,
    total_tokens: 51300,
    cost: 0.47190,  // Calculated: (24800 * 3/1M) + (26500 * 15/1M)
    latency_ms: 6200,
    cache_hit: 0,
    success: 1,
    error_message: null,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    document_id: 9,
    user_id: userId,
    service_name: 'gemini',
    model_name: 'gemini-1.5-flash',
    input_tokens: 22400,
    output_tokens: 24800,
    total_tokens: 47200,
    cost: 0.00912,  // Calculated: (22400 * 0.075/1M) + (24800 * 0.30/1M)
    latency_ms: 4100,
    cache_hit: 1,  // Cache hit
    success: 1,
    error_message: null,
    created_at: new Date().toISOString()
  },
  {
    id: 7,
    document_id: 9,
    user_id: userId,
    service_name: 'gemini',
    model_name: 'gemini-1.5-flash',
    input_tokens: 22400,
    output_tokens: 24800,
    total_tokens: 47200,
    cost: 0.00912,  // Calculated: (22400 * 0.075/1M) + (24800 * 0.30/1M)
    latency_ms: 2800,
    cache_hit: 1,  // Cache hit
    success: 1,
    error_message: null,
    created_at: new Date().toISOString()
  },

  // Document 10 - marketing_content.txt
  {
    id: 8,
    document_id: 10,
    user_id: userId,
    service_name: 'gpt',
    model_name: 'gpt-4-vision-preview',
    input_tokens: 5950,
    output_tokens: 6450,
    total_tokens: 12400,
    cost: 0.253,  // Calculated: (5950 * 10/1M) + (6450 * 30/1M)
    latency_ms: 3800,
    cache_hit: 0,
    success: 1,
    error_message: null,
    created_at: new Date().toISOString()
  },
  {
    id: 9,
    document_id: 10,
    user_id: userId,
    service_name: 'gemini',
    model_name: 'gemini-1.5-flash-8b',
    input_tokens: 5950,
    output_tokens: 6450,
    total_tokens: 12400,
    cost: 0.001191,  // Calculated: (5950 * 0.0375/1M) + (6450 * 0.15/1M)
    latency_ms: 1500,
    cache_hit: 0,
    success: 1,
    error_message: null,
    created_at: new Date().toISOString()
  },
  {
    id: 10,
    document_id: 10,
    user_id: userId,
    service_name: 'gemini',
    model_name: 'gemini-1.5-flash',
    input_tokens: 5950,
    output_tokens: 6450,
    total_tokens: 12400,
    cost: 0.002381,  // Calculated: (5950 * 0.075/1M) + (6450 * 0.30/1M)
    latency_ms: 2200,
    cache_hit: 1,  // Cache hit
    success: 1,
    error_message: null,
    created_at: new Date().toISOString()
  }
];

// Add to database
db.api_calls = sampleApiCalls;
db._counters.api_calls = sampleApiCalls.length;

// Calculate total cost
const totalCost = sampleApiCalls.reduce((sum, call) => sum + call.cost, 0);

// Update user's total cost
const user = db.users.find(u => u.id === userId);
if (user) {
  user.total_cost = totalCost;
  user.updated_at = new Date().toISOString();
}

// Save database
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

console.log('✅ Successfully injected cost data!');
console.log(`📊 Total API calls: ${sampleApiCalls.length}`);
console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
console.log(`\n📋 Breakdown:`);
console.log(`  - Gemini API: $${sampleApiCalls.filter(c => c.service_name === 'gemini').reduce((s, c) => s + c.cost, 0).toFixed(4)}`);
console.log(`  - GPT API: $${sampleApiCalls.filter(c => c.service_name === 'gpt').reduce((s, c) => s + c.cost, 0).toFixed(4)}`);
console.log(`  - Claude API: $${sampleApiCalls.filter(c => c.service_name === 'claude').reduce((s, c) => s + c.cost, 0).toFixed(4)}`);
console.log(`  - Cache hits: ${sampleApiCalls.filter(c => c.cache_hit === 1).length}/${sampleApiCalls.length}`);
console.log(`\n🎉 Cost monitoring dashboard is now active!`);
console.log(`🔗 Login at http://localhost:5173 and click "View Cost Dashboard"`);
