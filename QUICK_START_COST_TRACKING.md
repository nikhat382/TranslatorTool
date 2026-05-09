# Quick Start Guide - API Cost Tracking

## 🚀 Get Started in 5 Minutes

This guide will help you test the new API cost monitoring features.

---

## Step 1: Update Environment Variables

1. Open `backend/.env` file
2. Add these new variables (if not already present):

```env
# Add these to your existing .env file
ANTHROPIC_API_KEY=your_anthropic_key_if_you_have_one
JWT_SECRET=my-secret-key-for-development
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

> **Note:** The JWT_SECRET can be any string for development. For production, generate a secure random string.

---

## Step 2: Start the Backend

```bash
cd backend
npm start
```

You should see:
```
📊 Initializing database...
✅ Database initialized successfully
✅ Database tables created successfully
🚀 Server started on port 5000
```

---

## Step 3: Test the API

### Option A: Using cURL (Command Line)

#### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "test@example.com",
      "username": "testuser",
      "total_cost": 0,
      "quota_limit": 100
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Copy the token** from the response!

#### 2. Login (Alternative to Register)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

#### 3. Translate a Document (with Cost Tracking)
```bash
curl -X POST http://localhost:5000/api/translate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/your/image.jpg" \
  -F "sourceLang=spanish" \
  -F "targetLang=english"
```

**Now includes cost information in the response!**

#### 4. Get Your Cost Summary
```bash
curl -X GET http://localhost:5000/api/analytics/costs/summary \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 5. View Document-wise Costs
```bash
curl -X GET http://localhost:5000/api/analytics/costs/by-document \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 6. View Cache Statistics
```bash
curl -X GET http://localhost:5000/api/analytics/cache/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Option B: Using Postman or Insomnia

#### 1. Import Collection

Create a new request for each endpoint:

**Register User:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "password123"
}
```

**Get Cost Summary:**
- Method: `GET`
- URL: `http://localhost:5000/api/analytics/costs/summary`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

---

### Option C: Using the Web Interface

If your frontend is running:

1. Open: `http://localhost:5173`
2. You can still translate documents without logging in
3. Costs will NOT be tracked unless you implement the login UI

---

## Step 4: Check the Database

View the SQLite database to see the data:

```bash
cd backend/data
sqlite3 translator.db

# Inside SQLite:
.tables
SELECT * FROM users;
SELECT * FROM documents;
SELECT * FROM api_calls;
SELECT * FROM translations;
.exit
```

Or use a GUI tool like:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLite Viewer (VS Code Extension)](https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite)

---

## Step 5: Test Cost Tracking

### Scenario: Translate Multiple Documents

1. **Register/Login** to get a token
2. **Translate 3 different documents** using the token
3. **Check your cost summary:**
```bash
curl http://localhost:5000/api/analytics/costs/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

4. **View document breakdown:**
```bash
curl http://localhost:5000/api/analytics/costs/by-document \
  -H "Authorization: Bearer YOUR_TOKEN"
```

5. **Check which API was used most:**
```bash
curl http://localhost:5000/api/analytics/costs/by-service \
  -H "Authorization: Bearer YOUR_TOKEN"
```

6. **View daily trends:**
```bash
curl http://localhost:5000/api/analytics/costs/trends?days=7 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Step 6: Test Without Login (Backward Compatibility)

The translation endpoint still works WITHOUT authentication:

```bash
curl -X POST http://localhost:5000/api/translate \
  -F "file=@/path/to/image.jpg" \
  -F "sourceLang=spanish" \
  -F "targetLang=english"
```

**Note:** Without a token, costs are NOT tracked, but translation works fine!

---

## 📊 Understanding the Costs

### What Gets Tracked

For each translation:
- **Service used:** gemini, claude, or gpt
- **Model name:** e.g., gemini-1.5-flash-8b
- **Input tokens:** Text sent to the API
- **Output tokens:** Translation received
- **Cost:** Calculated based on API pricing
- **Latency:** How long the API took
- **Cache hit:** Whether the result was cached

### Current Pricing (Per 1M Tokens)

| Service | Input | Output |
|---------|-------|--------|
| Gemini Flash 8B | $0.0375 | $0.15 |
| Claude Sonnet 4 | $3.00 | $15.00 |
| GPT-4o Mini | $0.15 | $0.60 |

**Example:**
- Translating a 1000-word document (≈4000 tokens input, 4000 tokens output)
- Using Gemini: $0.0375 × 0.004 + $0.15 × 0.004 = **$0.00075**
- Using Claude: $3.00 × 0.004 + $15.00 × 0.004 = **$0.072**

---

## 🔍 Troubleshooting

### Problem: "Database error"
**Solution:** Make sure `backend/data/` directory exists:
```bash
mkdir -p backend/data
```

### Problem: "Invalid token"
**Solution:**
1. Check the Authorization header format: `Bearer YOUR_TOKEN`
2. Make sure JWT_SECRET is set in .env
3. Token expires after 7 days - login again to get a new one

### Problem: "Costs are $0.00 for all translations"
**Solution:**
- Check that you're using the Authorization header
- Verify the API actually returned token counts (check backend logs)
- Token estimation may result in very small costs ($0.0001)

### Problem: "Cannot connect to database"
**Solution:**
```bash
# Check if SQLite is accessible
cd backend/data
ls -la translator.db

# If file doesn't exist, restart the server
cd ..
npm start
```

---

## 📈 Next Steps

Now that cost tracking is working, you can:

1. **Build a Frontend Dashboard**
   - Show user's total cost in header
   - Display cost after each translation
   - Create analytics page with charts

2. **Add Admin Features**
   - View all users and their costs
   - Set custom quota limits
   - Generate CSV reports

3. **Enhance Analytics**
   - Add date range filters
   - Export data as CSV
   - Email weekly cost reports
   - Set up cost alerts (e.g., when user reaches 80% of quota)

4. **Production Deployment**
   - Change JWT_SECRET to a strong random value
   - Consider PostgreSQL instead of SQLite
   - Add rate limiting
   - Set up database backups

---

## 📝 Example Workflow

Here's a complete example workflow:

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","username":"demo","password":"demo123"}' \
  | jq -r '.data.token')

echo "Token: $TOKEN"

# 2. Translate a document
curl -X POST http://localhost:5000/api/translate \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_image.jpg" \
  -F "sourceLang=spanish" \
  -F "targetLang=english"

# 3. Check costs
curl -X GET http://localhost:5000/api/analytics/costs/summary \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# 4. View all documents
curl -X GET http://localhost:5000/api/analytics/costs/by-document \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data.documents[] | {filename, costs}'

# 5. Check cache performance
curl -X GET http://localhost:5000/api/analytics/cache/stats \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data | {hit_rate, cost_saved, actual_cost}'
```

---

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Database file created at `backend/data/translator.db`
- [ ] User registration works
- [ ] User login works
- [ ] Translation works WITHOUT token (backward compatible)
- [ ] Translation works WITH token
- [ ] Cost summary shows actual costs after translation
- [ ] Document list shows all translated documents
- [ ] Cache statistics are tracked
- [ ] Failed API calls are logged

---

## 🎉 Success!

If all the above works, your API cost monitoring system is fully functional!

Check `API_COST_MONITORING_GUIDE.md` for complete API documentation.

---

## 💡 Tips

1. **Use Gemini for most translations** - It's free and fast!
2. **Cache is your friend** - 30% hit rate = 30% cost savings
3. **Monitor your quota** - Set alerts at 80% usage
4. **Check failed calls** - They still count toward your costs
5. **Backup your database** - Contains all historical cost data

**Happy tracking! 📊💰**
