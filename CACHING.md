# 🚀 Smart Caching System

## Overview

The translation service now includes an intelligent caching system that dramatically reduces latency for repeated or similar translations.

## How It Works

### 1. **Cache Key Generation**
- Each file is hashed using SHA-256
- Cache key = `file_hash_16chars_sourceLang_targetLang`
- Same file + same language pair = instant cache hit

### 2. **LRU (Least Recently Used) Eviction**
- Maximum 100 cached translations
- When full, oldest/least-used entry is removed
- Keeps most frequently used translations in memory

### 3. **Automatic Expiration**
- Cached entries expire after 1 hour (configurable)
- Automatic cleanup every 10 minutes
- Ensures fresh translations

## Performance Impact

### First Translation (Cache Miss)
```
User uploads file → Hash generated → Cache checked
→ Cache miss → Gemini translation (4-10s)
→ Result cached → Sent to user
```

### Repeated Translation (Cache Hit)
```
User uploads same file → Hash generated → Cache checked
→ Cache HIT ⚡ → Instant response (~0.1s)
→ Sent to user
```

### Example Performance
| Scenario | Without Cache | With Cache | Improvement |
|----------|--------------|------------|-------------|
| First upload | 6.5s | 6.5s | - |
| Same file again | 6.5s | 0.1s | **98% faster** |
| 10 repeated uploads | 65s | 6.5s + 0.9s = 7.4s | **88% faster** |

## Cache Statistics

### View Cache Stats

**Via Health Endpoint:**
```bash
curl https://translatortool-1.onrender.com/api/health
```

**Response:**
```json
{
  "status": "ok",
  "cache": {
    "size": 23,
    "maxSize": 100,
    "hits": 47,
    "misses": 23,
    "hitRate": "67.1%",
    "evictions": 0,
    "totalTimeSaved": "245.3s",
    "avgTimeSaved": "5.22s"
  }
}
```

**Dedicated Cache Stats Endpoint:**
```bash
curl https://translatortool-1.onrender.com/api/cache/stats
```

### Understanding the Stats

- **size**: Current number of cached translations
- **maxSize**: Maximum cache capacity (100)
- **hits**: Number of times cache served a result instantly
- **misses**: Number of times translation was needed
- **hitRate**: Percentage of requests served from cache
- **evictions**: Number of entries removed due to space limits
- **totalTimeSaved**: Total seconds saved by cache hits
- **avgTimeSaved**: Average time saved per cache hit

## Configuration

Located in `backend/server.js`:

```javascript
// Initialize cache: 100 translations, 60 minutes TTL
const translationCache = new TranslationCache(100, 60);
```

### Adjustable Parameters

**Max Size** (default: 100)
- Increase for more cached documents
- Decrease to save memory on free tier
```javascript
new TranslationCache(200, 60); // Cache 200 documents
```

**TTL** (default: 60 minutes)
- Increase for longer cache retention
- Decrease for more frequent updates
```javascript
new TranslationCache(100, 120); // Cache for 2 hours
```

## API Endpoints

### 1. Health Check (includes cache stats)
```http
GET /api/health
```

### 2. Cache Statistics
```http
GET /api/cache/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "size": 23,
    "maxSize": 100,
    "hits": 47,
    "misses": 23,
    "hitRate": "67.1%",
    "totalTimeSaved": "245.3s"
  }
}
```

### 3. Clear Cache (Admin)
```http
POST /api/cache/clear
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared successfully",
  "previousStats": { ... }
}
```

## Cache Behavior Examples

### Example 1: Same Document, Different Languages
```
Upload test.jpg (Spanish → English) → Cache miss (6.5s)
Upload test.jpg (French → English)  → Cache miss (6.5s) [Different language pair]
Upload test.jpg (Spanish → English) → Cache HIT ⚡ (0.1s)
```

### Example 2: Modified Document
```
Upload document_v1.pdf → Cache miss (7.2s)
Edit document and save as document_v2.pdf → Cache miss (7.2s) [Different hash]
Upload document_v1.pdf again → Cache HIT ⚡ (0.1s)
```

### Example 3: Cache Expiration
```
Upload file1.jpg → Cached
[Wait 61 minutes]
Upload file1.jpg → Cache miss (expired) → Fresh translation
```

## Benefits

### 1. **User Experience**
- Instant results for repeated translations
- Consistent response times
- Better perceived performance

### 2. **Cost Savings**
- Reduces Gemini API calls
- Saves on API rate limits
- Lower operational costs

### 3. **Server Load**
- Less CPU usage for cached results
- Better resource utilization
- Can handle more concurrent users

### 4. **Reliability**
- Works even if API has issues (for cached documents)
- Graceful degradation
- Automatic memory management

## Monitoring Cache Performance

### Console Logs

**Cache Hit:**
```
✅ CACHE HIT! Saved 6.52s (Total saved: 245.3s)
⚡ INSTANT RESPONSE FROM CACHE
✅ TRANSLATION COMPLETE (FROM CACHE ⚡)
⚡ Time: 0.12s (instant)
💾 Cache: 47 hits, 23 misses (67.1% hit rate)
```

**Cache Miss:**
```
💾 Cache miss - performing fresh translation
🤖 PRIMARY METHOD: Google Gemini (FREE)...
✅ Gemini completed in 6.52s (2847 chars)
💾 Saved to cache (key: a3f2e9c1d8b7f6e5...)
```

### Response Metadata

Translation response now includes:
```json
{
  "metadata": {
    "model": "Cached Result (Instant)",  // or "Google Gemini Flash (Optimized)"
    "cached": true,
    "cacheStats": {
      "size": 23,
      "hits": 47,
      "hitRate": "67.1%"
    }
  }
}
```

## Troubleshooting

### Cache Not Working?

1. **Check if file is being uploaded correctly**
   - File must be identical (byte-for-byte)
   - Same source and target language

2. **Check cache stats**
   ```bash
   curl https://translatortool-1.onrender.com/api/cache/stats
   ```

3. **Check console logs**
   - Look for "CACHE HIT" or "Cache miss" messages

### Cache Full?

- LRU eviction automatically removes oldest entries
- Consider increasing `maxSize` if needed
- Or clear cache manually via `/api/cache/clear`

### Expired Entries?

- Default TTL is 60 minutes
- Automatic cleanup runs every 10 minutes
- Increase TTL if needed for your use case

## Best Practices

### 1. **For Development**
```javascript
// Shorter TTL for testing
new TranslationCache(50, 5); // 5 minutes
```

### 2. **For Production**
```javascript
// Longer TTL for better hit rate
new TranslationCache(200, 120); // 2 hours, 200 documents
```

### 3. **For Free Tier (Render)**
```javascript
// Conservative memory usage
new TranslationCache(100, 60); // Current default
```

### 4. **For Paid Tier**
```javascript
// Aggressive caching
new TranslationCache(500, 180); // 3 hours, 500 documents
```

## Memory Usage

Estimated memory per cached entry:
- Small image (100 KB): ~500 KB in cache
- Medium document (500 KB): ~1.5 MB in cache
- Large document (2 MB): ~5 MB in cache

**100 entries** ≈ 50-200 MB RAM (varies by file size)
**500 entries** ≈ 250-1000 MB RAM

**Render Free Tier**: 512 MB RAM → Stick with 100-150 entries

## Future Enhancements

Potential improvements:
- [ ] Redis-based distributed cache
- [ ] Persistent cache across server restarts
- [ ] Cache warming for common documents
- [ ] Smart cache prefetching
- [ ] Compression for larger documents
- [ ] Cache analytics dashboard

---

## Quick Reference

| Task | Endpoint | Method |
|------|----------|--------|
| View cache stats | `/api/cache/stats` | GET |
| Clear cache | `/api/cache/clear` | POST |
| Health check + cache | `/api/health` | GET |

**Cache Key Format**: `{fileHash}_{sourceLang}_{targetLang}`

**Default Config**: 100 entries, 60 min TTL, LRU eviction

**Performance**: ~0.1s for cache hits vs 4-10s for fresh translation
