import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_FILE = path.join(__dirname, '../data/translator-data.json');

console.log('🔧 Fixing document ownership...\n');

// Read current database
const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

// Update documents 8, 9, 10 to belong to user 1
db.documents.forEach(doc => {
  if ([8, 9, 10].includes(doc.id)) {
    doc.user_id = 1;
  }
});

// Save database
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

console.log('✅ Document ownership fixed!');
console.log(`📄 Documents 8, 9, 10 now belong to user 1`);
