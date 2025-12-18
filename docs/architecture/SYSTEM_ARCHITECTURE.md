# System Architecture

**Translatrix Pro - AI Document Translation System**

---

## 🏗️ High-Level Architecture

Translatrix Pro follows a **client-server architecture** with a **microservices-inspired** approach for AI translation.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          React SPA (Port 3000)                           │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │   Upload   │  │  Language  │  │  Results   │        │   │
│  │  │   Module   │  │  Selector  │  │  Viewer    │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        Express.js API Server (Port 5000)                 │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │   Upload   │  │ Translation│  │    PDF     │        │   │
│  │  │  Handler   │  │ Orchestrator│ │ Generator  │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/API
┌─────────────────────────────────────────────────────────────────┐
│                      AI SERVICES LAYER                           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐           │
│  │   Google    │  │    OpenAI    │  │   Anthropic │           │
│  │   Gemini    │  │  GPT-4o-mini │  │   Claude    │           │
│  │ (Primary)   │  │  (Backup)    │  │  (Fallback) │           │
│  └─────────────┘  └──────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### 1. **Frontend (SPA)**

**Technology**: React 18 + Vite

**Components**:
- `App.jsx` - Root component
- `Translator.jsx` - Main translator interface
- `index.css` - Global styles (Tailwind)

**Responsibilities**:
- User interface rendering
- File upload handling
- API communication
- Results display
- State management

### 2. **Backend (API Server)**

**Technology**: Node.js + Express.js

**Main Modules**:
- `server.js` - Main server file
- Text extraction (PDF, DOCX, TXT, JSON)
- OCR processing (Tesseract.js)
- Translation orchestration
- PDF generation (PDFKit)

**Responsibilities**:
- API endpoint handling
- File processing
- AI service integration
- Error handling
- Response formatting

### 3. **AI Translation Layer**

**Multi-Engine Architecture**:

```
Translation Request
       ↓
┌──────────────────────┐
│  Language Detection  │ (Gemini)
└──────────────────────┘
       ↓
┌──────────────────────┐
│  Format Detection    │
└──────────────────────┘
       ↓
   ┌─────────┐
   │  Image? │
   └─────────┘
    Yes ↓     ↓ No
    ┌────┐    ┌────┐
    │Vision   Text│
    │APIs    APIs│
    └────┘    └────┘
       ↓         ↓
┌──────────────────────┐
│ Priority Engine      │
│ 1. Gemini (Free)     │
│ 2. GPT-4o-mini       │
│ 3. Claude            │
│ 4. Free APIs         │
└──────────────────────┘
       ↓
  Translation Result
```

---

## 🔄 Data Flow

### Translation Workflow

```
1. User uploads file
       ↓
2. Frontend validates file type
       ↓
3. Send to backend (/api/translate)
       ↓
4. Backend extracts text
   - PDF: pdf-parse
   - Image: Tesseract OCR
   - Text: fs.readFile
       ↓
5. Language detection & validation (Gemini)
       ↓
6. Translation orchestration
   - Try Gemini (Primary)
   - Fallback to GPT-4o
   - Fallback to Claude
   - Last resort: Free APIs
       ↓
7. Calculate KPIs
   - Accuracy
   - Latency
   - Throughput
   - BLEU score
       ↓
8. Return translation result
       ↓
9. Frontend displays results
       ↓
10. User can download (TXT/JSON/PDF)
    or perform reverse translation
```

---

## 🗄️ Data Models

### Translation Request

```typescript
interface TranslationRequest {
  file: File                  // Uploaded file
  sourceLang: string          // Source language code
  targetLang: string          // Target language code (always 'english')
}
```

### Translation Response

```typescript
interface TranslationResponse {
  success: boolean
  data: {
    originalText: string
    translatedText: string
    originalFilePreview: string  // Base64 data URL
    fileName: string
    fileSize: string             // In KB
    fileType: string
    wordCount: number
    characterCount: number
    sentenceCount: number
    segments: Segment[]
    kpis: KPIMetrics
    metadata: TranslationMetadata
  }
  error?: string
}
```

### KPI Metrics

```typescript
interface KPIMetrics {
  accuracy: number           // 0-100
  latency: number           // seconds
  throughput: number        // words/sec
  wer: number              // Word Error Rate
  bleuScore: number        // 0-100
  semanticSimilarity: number  // 0-100
}
```

---

## 🔌 API Architecture

### RESTful Endpoints

**Base URL**: `http://localhost:5000/api`

```
POST   /translate          - Translate document
POST   /generate-pdf       - Generate PDF report
GET    /health            - Health check
POST   /test-translate    - Test translation
```

### Request/Response Flow

```
Client Request
     ↓
┌─────────────────┐
│  CORS Middleware│
└─────────────────┘
     ↓
┌─────────────────┐
│  Multer Upload  │
└─────────────────┘
     ↓
┌─────────────────┐
│ Request Handler │
└─────────────────┘
     ↓
┌─────────────────┐
│  File Extract   │
└─────────────────┘
     ↓
┌─────────────────┐
│  Translation    │
└─────────────────┘
     ↓
┌─────────────────┐
│  KPI Calculate  │
└─────────────────┘
     ↓
┌─────────────────┐
│ Response Format │
└─────────────────┘
     ↓
  JSON Response
```

---

## 🔐 Security Architecture

### Security Layers

1. **Input Validation**
   - File type checking
   - File size limits (50MB)
   - MIME type validation
   - Extension verification

2. **CORS Configuration**
   - Allowed origins
   - Allowed methods
   - Credentials handling

3. **API Protection**
   - Rate limiting (configurable)
   - Timeout limits
   - Error sanitization

4. **Environment Security**
   - API keys in .env
   - No secrets in code
   - Gitignore protection

---

## 📈 Scalability Considerations

### Current Architecture

- **Single Server**: Monolithic Express.js server
- **In-Memory**: No database (stateless)
- **File System**: Temporary file storage

### Scaling Options

1. **Horizontal Scaling**
   - Load balancer (Nginx, AWS ALB)
   - Multiple API server instances
   - Shared file storage (S3, Azure Blob)

2. **Database Integration**
   - Store translation history
   - User management
   - Analytics tracking

3. **Caching Layer**
   - Redis for translated content
   - Reduce redundant API calls
   - Faster response times

4. **Queue System**
   - RabbitMQ / AWS SQS
   - Async processing
   - Handle large files

---

## 🛠️ Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | 5.3.3 | Build tool |
| Tailwind CSS | 3.4.4 | Styling |
| Axios | 1.7.2 | HTTP client |
| Lucide React | 0.400.0 | Icons |

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime |
| Express | 4.x | Web framework |
| Multer | 2.0.2 | File upload |
| Tesseract.js | 6.0.1 | OCR |
| PDFKit | 0.x | PDF generation |
| pdf-parse | 2.4.5 | PDF text extraction |

### AI Services

| Service | Model | Purpose |
|---------|-------|---------|
| Google Gemini | 1.5 Flash | Primary translation |
| OpenAI | GPT-4o-mini | Backup translation |
| Anthropic | Claude Sonnet 4 | Fallback translation |
| Free APIs | Various | Last resort |

---

## 🔄 State Management

### Frontend State

**React useState hooks**:
- `file` - Uploaded file
- `sourceLanguage` - Selected source language
- `translating` - Translation in progress
- `result` - Translation result
- `error` - Error messages
- `progress` - Upload/translation progress
- `reverseTranslation` - Reverse translation result
- `isReversed` - Reverse view toggle

### Backend State

**Stateless Design**:
- No session storage
- No user state
- Each request independent
- Temporary files cleaned after response

---

## 🚦 Error Handling

### Error Propagation

```
Error Occurs
     ↓
┌─────────────────┐
│  Try/Catch      │
│  Block          │
└─────────────────┘
     ↓
┌─────────────────┐
│  Log Error      │
│  (console.error)│
└─────────────────┘
     ↓
┌─────────────────┐
│  Clean Resources│
│  (delete files) │
└─────────────────┘
     ↓
┌─────────────────┐
│  Return Error   │
│  Response       │
└─────────────────┘
     ↓
  Frontend Display
```

### Error Types

1. **Validation Errors**
   - Invalid file type
   - File too large
   - Missing parameters

2. **Processing Errors**
   - OCR failure
   - Text extraction failure
   - Language detection failure

3. **Translation Errors**
   - All AI services failed
   - API key invalid
   - Network timeout

4. **System Errors**
   - File system errors
   - Memory errors
   - Server errors

---

## 📊 Monitoring & Logging

### Current Logging

- Console logging for all operations
- Error stack traces
- API response times
- Translation success/failure

### Production Recommendations

- **Winston** or **Pino** for structured logging
- **Application Performance Monitoring** (APM)
- **Error tracking** (Sentry, Rollbar)
- **Analytics** (Google Analytics, Mixpanel)

---

## 🎯 Design Patterns

### Used Patterns

1. **Strategy Pattern**
   - Multiple translation engines
   - Fallback mechanism

2. **Factory Pattern**
   - Translation service selection
   - Response formatting

3. **Middleware Pattern**
   - Express middleware chain
   - CORS, file upload, error handling

4. **Singleton Pattern**
   - Express app instance
   - AI service clients

---

## 🔮 Future Enhancements

### Planned Features

1. **User Authentication**
   - JWT tokens
   - User accounts
   - Translation history

2. **Database Integration**
   - PostgreSQL / MongoDB
   - Store translations
   - Analytics data

3. **Real-time Updates**
   - WebSocket support
   - Live progress updates
   - Multi-user support

4. **Advanced Features**
   - Batch translation
   - Custom dictionaries
   - Translation memory
   - Quality scoring

---

## 📚 Related Documentation

- [Component Architecture](./COMPONENT_ARCHITECTURE.md)
- [Data Flow](./DATA_FLOW.md)
- [API Reference](../api/API_REFERENCE.md)
- [Developer Guide](../guides/DEVELOPER_GUIDE.md)
