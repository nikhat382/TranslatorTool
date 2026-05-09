# API Cost Monitoring & Analytics - Implementation Guide

## 🎉 What's Been Implemented

This implementation adds comprehensive API cost monitoring, user authentication, and analytics to your Advanced Document Translator. Here's everything that's been added:

### ✅ Database Schema
- **SQLite database** with the following tables:
  - `users` - User accounts with cost tracking
  - `documents` - Document upload records
  - `api_calls` - Detailed API call logs with token counts and costs
  - `translations` - Translation results with KPIs
  - `usage_logs` - Aggregated daily usage statistics

### ✅ User Authentication (JWT-based)
- User registration and login
- JWT token-based authentication
- Optional authentication (works with or without login)
- Password hashing with SHA-256

### ✅ Cost Tracking
- **Automatic cost calculation** for:
  - Google Gemini API (FREE tier tracking)
  - Claude Sonnet 4 API ($3/MTok input, $15/MTok output)
  - GPT-4 Vision API ($10/MTok input, $30/MTok output)
- Real-time token counting and cost calculation
- Cache hit/miss tracking with cost savings
- Failed API call tracking

### ✅ Analytics Endpoints
- User-wise cost summaries
- Document-wise cost breakdowns
- Service-wise cost analysis (Gemini vs Claude vs GPT)
- Cache performance statistics
- Daily cost trends
- Drill-down capabilities for detailed analysis

---

## 📡 API Endpoints

### Authentication Endpoints

#### 1. Register a New User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "total_cost": 0,
      "quota_limit": 100.00
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "total_cost": 2.5432,
      "quota_limit": 100.00
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Get User Profile
```bash
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "total_cost": 2.5432,
      "quota_limit": 100.00,
      "created_at": "2024-01-15 10:30:00",
      "statistics": {
        "total_documents": 45,
        "total_api_calls": 125,
        "cache_hits": 38,
        "cache_misses": 87,
        "cache_hit_rate": "30.40"
      }
    }
  }
}
```

---

### Analytics Endpoints

#### 4. Overall Cost Summary
```bash
GET /api/analytics/costs/summary?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "total_cost": "2.5432",
    "user_total_cost": "2.5432",
    "quota_limit": 100.00,
    "remaining_quota": "97.4568",
    "quota_used_percentage": "2.54",
    "period": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "breakdown": {
      "gemini": {
        "cost": "0.0012",
        "percentage": "0.05"
      },
      "claude": {
        "cost": "1.2340",
        "percentage": "48.52"
      },
      "gpt": {
        "cost": "1.3080",
        "percentage": "51.43"
      }
    },
    "cache": {
      "hits": 38,
      "misses": 87,
      "hit_rate": "30.40",
      "estimated_savings": "0.8765"
    },
    "statistics": {
      "total_calls": 125,
      "total_tokens": 245000,
      "avg_latency_ms": 1543,
      "failed_calls": 3
    }
  }
}
```

#### 5. Document-wise Cost Breakdown
```bash
GET /api/analytics/costs/by-document
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": 45,
        "filename": "medical_report.pdf",
        "file_type": "application/pdf",
        "source_lang": "spanish",
        "target_lang": "english",
        "word_count": 1543,
        "created_at": "2024-01-20 14:23:45",
        "costs": {
          "total": "0.0234",
          "gemini": "0.0000",
          "claude": "0.0234",
          "gpt": "0.0000"
        },
        "api_calls": 1,
        "cache": {
          "hits": 0,
          "misses": 1
        }
      },
      // ... more documents
    ],
    "total_documents": 45
  }
}
```

#### 6. Service-wise Breakdown
```bash
GET /api/analytics/costs/by-service
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "name": "claude",
        "model": "claude-sonnet-4-20250514",
        "call_count": 67,
        "cost": "1.2340",
        "tokens": {
          "input": 45000,
          "output": 28000,
          "total": 73000
        },
        "avg_latency_ms": 2341,
        "cache_hits": 12
      },
      {
        "name": "gemini",
        "model": "gemini-1.5-flash-8b",
        "call_count": 45,
        "cost": "0.0012",
        "tokens": {
          "input": 23000,
          "output": 15000,
          "total": 38000
        },
        "avg_latency_ms": 876,
        "cache_hits": 20
      },
      {
        "name": "gpt",
        "model": "gpt-4o-mini",
        "call_count": 13,
        "cost": "1.3080",
        "tokens": {
          "input": 67000,
          "output": 67000,
          "total": 134000
        },
        "avg_latency_ms": 3210,
        "cache_hits": 6
      }
    ]
  }
}
```

#### 7. Cache Statistics
```bash
GET /api/analytics/cache/stats
Authorization: Bearer YOUR_JWT_TOKEN (Optional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_requests": 125,
    "cache_hits": 38,
    "cache_misses": 87,
    "hit_rate": "30.40%",
    "cost_saved": "0.8765",
    "actual_cost": "2.5432",
    "total_cost_if_no_cache": "3.4197",
    "savings_percentage": "25.63"
  }
}
```

#### 8. Daily Cost Trends
```bash
GET /api/analytics/costs/trends?days=30
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": [
      {
        "date": "2024-01-20",
        "call_count": 12,
        "daily_cost": "0.2341",
        "gemini_cost": "0.0001",
        "claude_cost": "0.1234",
        "gpt_cost": "0.1106",
        "cache_hits": 3
      },
      // ... more days
    ],
    "period_days": 30
  }
}
```

#### 9. Document Drill-down
```bash
GET /api/analytics/documents/45
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "id": 45,
      "filename": "medical_report.pdf",
      "file_type": "application/pdf",
      "file_size": 245678,
      "source_lang": "spanish",
      "target_lang": "english",
      "word_count": 1543,
      "character_count": 8976,
      "created_at": "2024-01-20 14:23:45"
    },
    "costs": {
      "total": "0.0234",
      "gemini": "0.0000",
      "claude": "0.0234",
      "gpt": "0.0000"
    },
    "api_calls": [
      {
        "id": 234,
        "service": "claude",
        "model": "claude-sonnet-4-20250514",
        "tokens": {
          "input": 1234,
          "output": 567,
          "total": 1801
        },
        "cost": "0.0234",
        "latency_ms": 2341,
        "cache_hit": false,
        "success": true,
        "error": null,
        "created_at": "2024-01-20 14:23:47"
      }
    ],
    "translation": {
      "id": 98,
      "confidence_score": 0.978,
      "kpi_data": {
        "accuracy": 97.8,
        "latency": 2.45,
        "throughput": 629,
        "wer": "1.1",
        "bleuScore": "96.3",
        "semanticSimilarity": "98.6"
      },
      "metadata": {
        "model": "Google Gemini Flash (Optimized)",
        "cached": false
      },
      "segments_count": 23
    },
    "statistics": {
      "api_call_count": 1,
      "cache_hits": 0,
      "avg_latency_ms": 2341,
      "total_tokens": 1801
    }
  }
}
```

---

### Enhanced Translation Endpoint

#### 10. Translate Document (Now with Cost Tracking)
```bash
POST /api/translate
Authorization: Bearer YOUR_JWT_TOKEN (Optional)
Content-Type: multipart/form-data

file: [your file]
sourceLang: spanish
targetLang: english
```

**Response (now includes cost info if logged in):**
```json
{
  "success": true,
  "data": {
    "translatedText": "Translated content here...",
    "fileName": "document.pdf",
    "fileSize": "245.67",
    "fileType": "application/pdf",
    "wordCount": 1543,
    "segments": [...],
    "kpis": {
      "accuracy": 97.8,
      "latency": 2.45,
      "throughput": 629
    },
    "metadata": {...},
    "document_id": 45,
    "cost": {
      "total": "0.0234",
      "gemini": "0.0000",
      "claude": "0.0234",
      "gpt": "0.0000",
      "api_calls": 1
    }
  }
}
```

---

## 💾 Database Structure

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  total_cost REAL DEFAULT 0,
  quota_limit REAL DEFAULT 100.00,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Documents Table
```sql
CREATE TABLE documents (
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
```

### API Calls Table
```sql
CREATE TABLE api_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  user_id INTEGER,
  service_name TEXT NOT NULL,  -- 'gemini', 'claude', 'gpt'
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
```

### Translations Table
```sql
CREATE TABLE translations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  user_id INTEGER,
  translated_text TEXT NOT NULL,
  segments TEXT,  -- JSON
  metadata TEXT,  -- JSON
  kpi_data TEXT,  -- JSON
  confidence_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
)
```

### Usage Logs Table
```sql
CREATE TABLE usage_logs (
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
```

---

## 💰 Cost Calculation

### API Pricing (Per 1 Million Tokens)

| Service | Model | Input Cost | Output Cost |
|---------|-------|------------|-------------|
| **Gemini** | gemini-1.5-flash-8b | $0.0375 | $0.15 |
| **Gemini** | gemini-1.5-flash | $0.075 | $0.30 |
| **Gemini** | gemini-1.5-pro | $1.25 | $5.00 |
| **Claude** | claude-sonnet-4 | $3.00 | $15.00 |
| **Claude** | claude-3-opus | $15.00 | $75.00 |
| **GPT** | gpt-4o-mini | $0.15 | $0.60 |
| **GPT** | gpt-4-vision | $10.00 | $30.00 |

### Token Estimation
If the API doesn't return token counts, we estimate:
- **1 token ≈ 4 characters** (for English text)
- Adjust for other languages as needed

---

## 🚀 Getting Started

### 1. Environment Variables
Add to your `.env` file:
```env
# Existing API keys
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# JWT Secret (for authentication)
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 2. Start the Backend
```bash
cd backend
npm install
npm start
```

The database will be automatically created at `backend/data/translator.db`.

### 3. Test the API

#### Register a user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

#### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

#### Get cost summary:
```bash
curl -X GET http://localhost:5000/api/analytics/costs/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Features Summary

### ✅ What Works Now

1. **User Authentication**
   - Register new users
   - Login with email/password
   - JWT token authentication
   - Optional auth (works without login too)

2. **Cost Tracking**
   - Automatic token counting for all APIs
   - Real-time cost calculation
   - Track Gemini, Claude, and GPT costs separately
   - Failed API call tracking

3. **Analytics**
   - Overall cost summary
   - Document-wise breakdown
   - Service-wise breakdown
   - Cache performance stats
   - Daily trends
   - Drill-down for detailed analysis

4. **Database**
   - SQLite for easy deployment
   - Automatic schema creation
   - Indexes for fast queries
   - Foreign key constraints

5. **Backward Compatibility**
   - Translation works WITHOUT login
   - Existing frontend continues to work
   - Costs only tracked if user is logged in

---

## 🔄 Next Steps

To complete the implementation, you'll need to:

1. **Update the Frontend**
   - Add login/register forms
   - Display user's total cost in header
   - Show cost breakdown after translation
   - Add analytics dashboard page

2. **Add Admin Features** (Optional)
   - View all users and costs
   - Set quota limits per user
   - Generate usage reports

3. **Production Deployment**
   - Change JWT_SECRET to a strong random value
   - Set up proper CORS (not '*')
   - Add rate limiting
   - Set up backup for SQLite database
   - Consider PostgreSQL for production

---

## 📝 Notes

- The translation endpoint now accepts an **optional** Authorization header
- If no token is provided, translation works but no cost tracking occurs
- All costs are calculated in USD
- Cache hits are tracked but cost $0 (since no API call is made)
- Failed API calls are tracked with their error messages

---

## 🐛 Troubleshooting

### Database not created?
Check that the `backend/data/` directory exists and is writable.

### "Cost tracking error" in logs?
This is non-fatal. Translation will succeed even if cost tracking fails.

### Token not recognized?
Make sure the Authorization header format is: `Bearer YOUR_TOKEN`

### Costs seem wrong?
Check the `API_COSTS` object in `backend/models/ApiCall.js` to verify pricing.

---

## 📞 Support

If you encounter issues:
1. Check the backend logs for error messages
2. Verify database was created: `ls -la backend/data/translator.db`
3. Test authentication endpoints first before testing analytics
4. Use `node --check server.js` to verify no syntax errors

---

**Implementation Complete! 🎉**

Your document translator now has full cost monitoring and analytics capabilities!
