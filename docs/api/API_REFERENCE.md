# API Reference

**Translatrix Pro REST API**

Base URL: `http://localhost:5000/api`

---

## 📋 Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [POST /translate](#post-translate)
  - [POST /generate-pdf](#post-generate-pdf)
  - [GET /health](#get-health)
  - [POST /test-translate](#post-test-translate)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

Currently, **no authentication** is required. The API is open for development purposes.

**Production Recommendation**: Implement JWT or API key authentication.

---

## 🌐 Endpoints

### POST /translate

Translates a document from a source language to English.

**Endpoint**: `POST /api/translate`

**Content-Type**: `multipart/form-data`

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Document to translate (JPG, PDF, JSON, TXT) |
| `sourceLang` | String | Yes | Source language (`spanish`, `french`, `german`, `mandarin`, `hindi`, `english`) |
| `targetLang` | String | Yes | Target language (always `english`) |

#### Request Example

```javascript
const formData = new FormData()
formData.append('file', fileObject)
formData.append('sourceLang', 'spanish')
formData.append('targetLang', 'english')

const response = await fetch('http://localhost:5000/api/translate', {
  method: 'POST',
  body: formData
})

const data = await response.json()
```

#### Response (Success)

**Status**: `200 OK`

```json
{
  "success": true,
  "data": {
    "originalText": "Hola mundo",
    "translatedText": "Hello world",
    "originalFilePreview": "data:image/jpeg;base64,...",
    "fileName": "document.pdf",
    "fileSize": "125.45",
    "fileType": "application/pdf",
    "wordCount": 245,
    "characterCount": 1534,
    "sentenceCount": 15,
    "segments": [
      {
        "id": 1,
        "source": "Hola mundo.",
        "target": "Hello world.",
        "confidence": 0.98,
        "tokens": 2,
        "processingTime": "0.15"
      }
    ],
    "kpis": {
      "accuracy": 96.5,
      "latency": 3.2,
      "throughput": 76,
      "wer": 1.2,
      "bleuScore": 95.0,
      "semanticSimilarity": 97.3
    },
    "metadata": {
      "fileName": "document.pdf",
      "fileSize": "125.45",
      "fileType": "application/pdf",
      "wordCount": 245,
      "characterCount": 1534,
      "sentenceCount": 15,
      "processedAt": "12/17/2024, 2:30:45 PM",
      "model": "Google Gemini 1.5 Flash (Free Tier)",
      "sourceLanguage": "spanish",
      "targetLanguage": "english",
      "languagePair": "spanish → english",
      "preservedElements": ["Structure", "Format", "Tables", "Hierarchy"]
    }
  }
}
```

#### Response (Error)

**Status**: `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Translation failed",
  "details": "All translation methods failed"
}
```

#### Error Codes

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid parameters or file type |
| 500 | Internal Server Error - Translation failed |
| 413 | Payload Too Large - File exceeds 50MB |
| 408 | Request Timeout - Translation took too long |

---

### POST /generate-pdf

Generates a PDF report of the translation.

**Endpoint**: `POST /api/generate-pdf`

**Content-Type**: `application/json`

#### Request Parameters

```json
{
  "translatedText": "The translated document text...",
  "fileName": "original.pdf",
  "sourceLang": "spanish",
  "targetLang": "english",
  "metadata": {
    "model": "Google Gemini 1.5 Flash",
    "wordCount": 245,
    "accuracy": 96.5
  }
}
```

#### Request Example

```javascript
const response = await axios.post('http://localhost:5000/api/generate-pdf', {
  translatedText: result.translatedText,
  fileName: result.fileName,
  sourceLang: 'spanish',
  targetLang: 'english',
  metadata: result.metadata
}, {
  responseType: 'blob'
})

// Download PDF
const blob = new Blob([response.data], { type: 'application/pdf' })
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `translation_report_${Date.now()}.pdf`
a.click()
```

#### Response (Success)

**Status**: `200 OK`

**Content-Type**: `application/pdf`

Binary PDF file download

#### Response (Error)

**Status**: `500 Internal Server Error`

```json
{
  "success": false,
  "error": "PDF generation failed",
  "details": "Error message"
}
```

---

### GET /health

Health check endpoint to verify server status.

**Endpoint**: `GET /api/health`

#### Request Example

```javascript
const response = await fetch('http://localhost:5000/api/health')
const data = await response.json()
```

#### Response

**Status**: `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2024-12-17T06:30:45.123Z",
  "services": {
    "gemini": true,
    "claude": false,
    "openai": true,
    "openrouter": false
  }
}
```

---

### POST /test-translate

Simple text translation endpoint for testing.

**Endpoint**: `POST /api/test-translate`

**Content-Type**: `application/json`

#### Request Parameters

```json
{
  "text": "Hola mundo",
  "sourceLang": "spanish",
  "targetLang": "english"
}
```

#### Request Example

```javascript
const response = await fetch('http://localhost:5000/api/test-translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Hola mundo',
    sourceLang: 'spanish',
    targetLang: 'english'
  })
})

const data = await response.json()
```

#### Response (Success)

```json
{
  "success": true,
  "original": "Hola mundo",
  "translated": "Hello world",
  "model": "claude-sonnet-4"
}
```

---

## 📊 Data Models

### Supported Languages

```javascript
const LANGUAGES = {
  SPANISH: 'spanish',
  FRENCH: 'french',
  GERMAN: 'german',
  MANDARIN: 'mandarin',
  HINDI: 'hindi',
  ENGLISH: 'english'
}
```

### Supported File Types

```javascript
const FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/jpg': ['.jpg'],
  'application/pdf': ['.pdf'],
  'application/json': ['.json'],
  'text/plain': ['.txt']
}
```

### Translation Segment

```typescript
interface Segment {
  id: number
  source: string
  target: string
  confidence: number  // 0.0 - 1.0
  tokens: number
  processingTime: string  // in seconds
}
```

### KPI Metrics

```typescript
interface KPIMetrics {
  accuracy: number           // 0-100
  latency: number           // seconds
  throughput: number        // words/second
  wer: number              // Word Error Rate (0-100)
  bleuScore: number        // 0-100
  semanticSimilarity: number  // 0-100
}
```

### Metadata

```typescript
interface TranslationMetadata {
  fileName: string
  fileSize: string           // in KB
  fileType: string           // MIME type
  wordCount: number
  characterCount: number
  sentenceCount: number
  processedAt: string        // datetime
  model: string              // AI model used
  sourceLanguage: string
  targetLanguage: string
  languagePair: string       // "spanish → english"
  preservedElements: string[]
}
```

---

## ❌ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Common Errors

#### Invalid File Type

```json
{
  "success": false,
  "error": "Unsupported file type. Please upload only JPG, PDF, JSON, or TXT files."
}
```

#### Language Mismatch

```json
{
  "success": false,
  "error": "Language mismatch detected! Your document appears to be in French, but you selected Spanish as the source language."
}
```

#### Translation Failure

```json
{
  "success": false,
  "error": "Translation failed",
  "details": "All translation methods failed"
}
```

#### File Too Large

```json
{
  "success": false,
  "error": "File too large. Maximum size is 50MB."
}
```

---

## ⚡ Rate Limiting

**Current**: No rate limiting implemented

**Recommended for Production**:
- 100 requests per minute per IP
- 1000 requests per hour per IP
- Configurable per user tier

---

## 🔒 CORS Configuration

### Allowed Origins

```javascript
const corsOptions = {
  origin: '*',  // Allow all origins (development)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: false
}
```

**Production**: Restrict to specific domains

---

## 📝 Usage Examples

### Complete Translation Flow

```javascript
// 1. Create FormData
const formData = new FormData()
formData.append('file', document.getElementById('file').files[0])
formData.append('sourceLang', 'spanish')
formData.append('targetLang', 'english')

// 2. Send Request
try {
  const response = await fetch('http://localhost:5000/api/translate', {
    method: 'POST',
    body: formData
  })

  const data = await response.json()

  if (data.success) {
    console.log('Translation:', data.data.translatedText)
    console.log('Accuracy:', data.data.kpis.accuracy)
  } else {
    console.error('Error:', data.error)
  }
} catch (error) {
  console.error('Network error:', error)
}
```

### Download PDF

```javascript
const response = await axios.post(
  'http://localhost:5000/api/generate-pdf',
  {
    translatedText: result.translatedText,
    fileName: result.fileName,
    sourceLang: 'spanish',
    targetLang: 'english',
    metadata: result.metadata
  },
  {
    responseType: 'blob'
  }
)

const url = window.URL.createObjectURL(new Blob([response.data]))
const link = document.createElement('a')
link.href = url
link.download = `translation_${Date.now()}.pdf`
link.click()
```

---

## 🛡️ Best Practices

### 1. File Validation

Always validate files on both client and server:
- Check file type
- Check file size
- Verify MIME type

### 2. Error Handling

Always handle errors gracefully:
```javascript
try {
  const response = await fetch('/api/translate', {...})
  if (!response.ok) throw new Error('Translation failed')
  const data = await response.json()
} catch (error) {
  // Show user-friendly error message
  console.error(error)
}
```

### 3. Timeout Handling

Set appropriate timeouts for long translations:
```javascript
const response = await axios.post('/api/translate', formData, {
  timeout: 60000  // 60 seconds
})
```

### 4. Progress Tracking

Implement progress indicators for better UX:
```javascript
const progressInterval = setInterval(() => {
  setProgress(prev => prev < 90 ? prev + 10 : 90)
}, 400)
```

---

## 📞 Support

For API issues or questions:
- **Email**: info@spectrai.sg
- **Technical Support**: nirupamsd@spectrai.sg

---

## 📚 Related Documentation

- [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)
- [User Guide](../guides/USER_GUIDE.md)
- [Developer Guide](../guides/DEVELOPER_GUIDE.md)
