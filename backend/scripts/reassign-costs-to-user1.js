import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_FILE = path.join(__dirname, '../data/translator-data.json');

console.log('🔄 Reassigning cost data from user 5 to user 1...\n');

// Read current database
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Calculate total cost from api_calls
const totalCost = db.api_calls.reduce((sum, call) => sum + call.cost, 0);

// Update all api_calls to user_id 1
db.api_calls.forEach(call => {
  call.user_id = 1;
});

// Update user 1's total cost
const user1 = db.users.find(u => u.id === 1);
if (user1) {
  user1.total_cost = totalCost;
  user1.updated_at = new Date().toISOString();
}

// Reset user 5's total cost
const user5 = db.users.find(u => u.id === 5);
if (user5) {
  user5.total_cost = 0;
  user5.updated_at = new Date().toISOString();
}

// Save database
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

console.log('✅ Successfully reassigned cost data!');
console.log(`💰 User 1 total cost: $${totalCost.toFixed(4)}`);
console.log(`📊 API calls reassigned: ${db.api_calls.length}`);
