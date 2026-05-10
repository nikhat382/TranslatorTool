import db from '../config/database-alternative.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_FILE = path.join(__dirname, '../data/translator-data.json');

console.log('🔄 Syncing user costs from API calls...\n');

try {
  // Read database
  const data = fs.readFileSync(DB_FILE, 'utf8');
  const database = JSON.parse(data);

  // Calculate total cost for each user
  const userCosts = {};

  database.api_calls.forEach(call => {
    if (!userCosts[call.user_id]) {
      userCosts[call.user_id] = 0;
    }
    userCosts[call.user_id] += call.cost;
  });

  // Update each user's total_cost
  let updatedCount = 0;
  database.users.forEach(user => {
    const actualCost = userCosts[user.id] || 0;
    if (user.total_cost !== actualCost) {
      console.log(`👤 User: ${user.username} (${user.email})`);
      console.log(`   Old cost: $${user.total_cost.toFixed(4)}`);
      console.log(`   New cost: $${actualCost.toFixed(4)}`);
      console.log(`   Difference: $${(actualCost - user.total_cost).toFixed(4)}\n`);

      user.total_cost = actualCost;
      user.updated_at = new Date().toISOString();
      updatedCount++;
    }
  });

  // Save updated database
  fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2));

  console.log(`\n✅ Successfully synced ${updatedCount} user(s)`);
  console.log(`📁 Database saved to: ${DB_FILE}`);

} catch (error) {
  console.error('❌ Error syncing user costs:', error);
  process.exit(1);
}
