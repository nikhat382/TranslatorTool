# Advanced Document Translator - Design Document

**Product Name:** Translatrix Pro
**Version:** 4.5
**Organization:** SPECTRA AI Pte. Ltd., Singapore
**Date:** December 24, 2025
**Document Type:** Technical Design Document

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture Design](#architecture-design)
4. [Component Specifications](#component-specifications)
5. [Translation Engine Strategy](#translation-engine-strategy)
6. [Data Flow](#data-flow)
7. [API Specifications](#api-specifications)
8. [Technology Stack](#technology-stack)
9. [Security & Performance](#security--performance)
10. [Deployment Architecture](#deployment-architecture)

---

## 1. Executive Summary

### 1.1 Purpose
The Advanced Document Translator (Translatrix Pro) is an enterprise-grade AI-powered translation system designed to provide accurate, structure-preserving document translation across multiple languages and formats.

### 1.2 Key Features
- Multi-format document support (PDF, DOCX, images, text files)
- AI-powered translation using multiple engine fallback strategy
- Real-time translation with performance metrics
- OCR capability for image-based documents
- Structure and formatting preservation
- Reverse translation for verification
- Multiple export formats (TXT, JSON, PDF)

### 1.3 Target Use Cases
- Legal and business document translation
- Technical documentation translation
- Shipping and logistics document processing
- Multi-language content localization
- Document verification and quality assurance

---

## 2. System Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   React Frontend (Vite)                              │   │
│  │   - File Upload Component                            │   │
│  │   - Translation Dashboard                            │   │
│  │   - Results Viewer                                   │   │
│  │   - Export Manager                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    SERVER LAYER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Express.js Backend                                 │   │
│  │   - REST API Endpoints                               │   │
│  │   - File Processing Service                          │   │
│  │   - Translation Orchestrator                         │   │
│  │   - PDF Generation Service                           │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  TRANSLATION ENGINE LAYER                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Gemini  │  │   GPT-4  │  │  Claude  │  │   Free   │   │
│  │  Vision  │  │  Vision  │  │   API    │  │   APIs   │   │
│  │ (Primary)│  │(Fallback)│  │(Fallback)│  │(Fallback)│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 SUPPORT SERVICES LAYER                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   OCR    │  │   Text   │  │  Format  │  │   PDF    │   │
│  │Tesseract │  │Extraction│  │ Preserve │  │Generator │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 System Components

1. **Frontend Application** - React-based user interface
2. **Backend API Server** - Express.js REST API
3. **Translation Services** - Multiple AI translation engines
4. **Document Processing** - Text extraction and OCR
5. **Export Services** - PDF, JSON, TXT generation

---

## 3. Architecture Design

### 3.1 Frontend Architecture

**Technology:** React 18 + Vite
**Styling:** TailwindCSS with custom gradient design
**State Management:** React Hooks (useState)

#### 3.1.1 Component Structure

```
src/
├── App.jsx                 # Main application wrapper
├── TranslatorTool.jsx      # Core translation component
├── main.jsx                # Application entry point
├── App.css                 # Global styles
└── index.css               # TailwindCSS imports
```

#### 3.1.2 Key Frontend Components

**TranslatorTool Component:**
- File upload handler with drag-and-drop
- Language selection (source/target)
- Real-time translation progress tracking
- Results display with side-by-side comparison
- KPI dashboard
- Export functionality (TXT, JSON, PDF)
- Reverse translation feature

**State Management:**
```javascript
- file: Selected file object
- processing: Boolean translation status
- translationResults: Complete translation data
- sourceLanguage: Selected source language
- targetLanguage: Fixed to English
- error: Error messages
- isReversed: Reverse translation view toggle
```

### 3.2 Backend Architecture

**Technology:** Node.js + Express.js
**File Upload:** Multer middleware
**Document Processing:** Various libraries per format

#### 3.2.1 Directory Structure

```
backend/
├── server.js                    # Main server file
├── routes/
│   └── translate.js             # Translation routes
├── services/
│   └── openaiService.js         # Translation service
└── uploads/                     # Temporary file storage
```

#### 3.2.2 Core Modules

**server.js** (1124 lines)
- Express server setup
- API endpoint definitions
- Translation orchestration logic
- Multi-engine translation strategy
- OCR processing
- Text extraction
- PDF generation
- Health check endpoint

**Main Functions:**
- `translateWithGemini()` - Google Gemini Vision translation
- `translateWithGPT4Vision()` - OpenAI GPT-4o-mini translation
- `translateWithClaude()` - Anthropic Claude API translation
- `ocrWithTesseract()` - Tesseract.js OCR
- `ocrWithOCRSpace()` - OCR.space API
- `extractText()` - Multi-format text extraction
- `translateFallback()` - Free API fallback translation
- `translateDocument()` - Main orchestrator

---

## 4. Component Specifications

### 4.1 File Upload System

**Supported File Types:**
- Images: JPG, JPEG, PNG
- Documents: PDF, DOCX
- Text: TXT, JSON

**File Validation:**
- Extension check: `['.jpg', '.jpeg', '.pdf', '.json', '.txt']`
- MIME type validation
- Size limit: 50MB
- File type matching with source language

**Upload Flow:**
```
User selects file
    ↓
Validate file type and size
    ↓
Store in temporary directory (multer)
    ↓
Send to backend via FormData
    ↓
Backend processes and deletes temp file
```

### 4.2 Text Extraction System

**Extraction Methods by Format:**

| Format | Library | Method |
|--------|---------|--------|
| PDF | pdf-parse | Buffer parsing |
| DOCX | mammoth | Raw text extraction |
| TXT | fs | UTF-8 read |
| JSON | fs | UTF-8 read |
| Images | Tesseract.js | OCR processing |

**Code Reference:** server.js:453-493

### 4.3 Translation Engine System

#### 4.3.1 Priority Order

**1. Google Gemini (FREE - Primary)**
- Model: `gemini-1.5-flash`
- Supports: Images
- Max tokens: 2048
- Temperature: 0.3
- Free tier: 60 requests/minute
- Code: server.js:26-107

**2. GPT-4o-mini Vision (Secondary)**
- Model: `gpt-4o-mini`
- Supports: Images
- Max tokens: 3000
- Temperature: 0.3
- Requires: OpenAI API key
- Code: server.js:246-353

**3. Claude API (Tertiary)**
- Model: `claude-sonnet-4-20250514`
- Supports: PDFs, Images
- Max tokens: 16000
- Temperature: 0.3
- Requires: Anthropic API key
- Code: server.js:111-242

**4. Free APIs (Fallback)**
- Google Translate API
- MyMemory API
- LibreTranslate API
- OpenRouter API
- Code: server.js:515-629

#### 4.3.2 Translation Strategy

```javascript
async function translateDocument(filePath, mimetype, filename, sourceLang, targetLang, extractedText) {
  // Priority 1: Google Gemini (for images)
  if (mimetype.startsWith('image/')) {
    result = await translateWithGemini();
    if (valid) return result;
  }

  // Priority 2: GPT-4 Vision
  if (mimetype === 'application/pdf' || mimetype.startsWith('image/')) {
    result = await translateWithGPT4Vision();
    if (valid) return result;
  }

  // Priority 3: Claude API
  if (mimetype === 'application/pdf' || mimetype.startsWith('image/')) {
    result = await translateWithClaude();
    if (valid) return result;
  }

  // Priority 4: Fallback to free APIs
  result = await translateFallback(extractedText);
  return result;
}
```

### 4.4 OCR System

**OCR Engines:**

**1. Tesseract.js**
- Open-source OCR
- Multi-language support
- Language mapping: Spanish→spa, English→eng, etc.
- Used for local processing
- Code: server.js:357-388

**2. OCR.space API**
- Cloud-based OCR
- File size limit: 1MB
- Free API key included
- Fallback option
- Code: server.js:390-441

### 4.5 Export System

**Export Formats:**

**1. TXT Export**
- Full translation report
- Metadata and KPIs included
- Performance metrics
- Original and translated text
- Code: TranslatorTool.jsx:307-361

**2. JSON Export**
- Structured data format
- Segments with metadata
- Performance metrics
- Machine-readable
- Code: TranslatorTool.jsx:364-409

**3. PDF Export**
- Server-side generation using PDFKit
- Professional report layout
- Markdown formatting support
- Headers, tables, and formatting preserved
- Multi-page support with page numbers
- Code: server.js:855-1030

---

## 5. Translation Engine Strategy

### 5.1 Prompt Engineering

**Claude API Prompt Structure:**
```
You are a professional document translator. Translate this COMPLETE [filename] document from [sourceLang] to [targetLang].

CRITICAL TRANSLATION REQUIREMENTS - FOLLOW EXACTLY:
``1
1. COMPLETENESS: Translate EVERY single word, sentence, heading...
2. STRUCTURE PRESERVATION: Maintain EXACT document structure...
3. FORMATTING: Preserve ALL formatting elements...
4. SPECIAL CONTENT: Keep unchanged...
5. TABLES: For tables, maintain...
6. OUTPUT FORMAT: Present the translation maintaining visual hierarchy...

YOUR TASK: Provide a COMPLETE, WORD-FOR-WORD translation...
```

**Key Features:**
- Explicit completeness requirements
- Structure preservation instructions
- Formatting guidelines
- Special content handling
- Output format specifications

### 5.2 Quality Validation

**Translation Quality Checks:**
1. Length validation: Translated text > 30% of original
2. Content verification: Non-null results
3. Error handling: Detailed error logging
4. Fallback chain: Multiple engine attempts

---

## 6. Data Flow

### 6.1 Complete Translation Flow

```-
┌─────────────────────────────────────────────────────────────┐
│ 1. USER UPLOADS FILE                                         │
│    - Select source language                                  │
│    - Upload document (JPG, PDF, DOCX, TXT)                   │
│    - Click "TRANSLATE NOW"                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND PROCESSING                                       │
│    - Validate file type and size                             │
│    - Create FormData with file, sourceLang, targetLang       │
│    - POST to /api/translate                                  │
│    - Show progress animation                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND RECEIVES REQUEST                                  │
│    - Multer saves file to uploads/                           │
│    - Extract file metadata                                   │
│    - Log request details                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4-. TEXT EXTRACTION                                           │
│    - Identify file type (PDF/DOCX/TXT/Image)                 │
│    - Extract text using appropriate method                   │
│    - For images: Skip extraction (AI will read directly)     │
│    - For PDFs: Use pdf-parse                                 │
│    - For DOCX: Use mammoth                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. TRANSLATION ORCHESTRATION                                 │
│    ┌──────────────────────────────────────────────────┐     │
│    │ TRY: Google Gemini (FREE)                        │     │
│    │   - For images only                              │     │
│    │   - Model: gemini-1.5-flash                      │     │
│    │   - Send file as base64                          │     │
│    │   - Get complete translation                     │     │
│    └──────────────────────────────────────────────────┘     │
│                         ↓ (if fails)                         │
│    ┌──────────────────────────────────────────────────┐     │
│    │ TRY: GPT-4o-mini Vision                          │     │
│    │   - For PDFs and images                          │     │
│    │   - Send with detailed prompt                    │     │
│    │   - Request complete translation                 │     │
│    └──────────────────────────────────────────────────┘     │
│                         ↓ (if fails)                         │
│    ┌──────────────────────────────────────────────────┐     │
│    │ TRY: Claude API                                  │     │
│    │   - For PDFs and images                          │     │
│    │   - Document/image understanding                 │     │
│    │   - Max 16000 tokens                             │     │
│    └──────────────────────────────────────────────────┘     │
│                         ↓ (if fails)                         │
│    ┌──────────────────────────────────────────────────┐     │
│    │ FALLBACK: Free Translation APIs                  │     │
│    │   - Extract text first (OCR if needed)           │     │
│    │   - Chunk text (1500 chars/chunk)                │     │
│    │   - Try Google Translate API                     │     │
│    │   - Try MyMemory API                             │     │
│    │   - Try LibreTranslate                           │     │
│    │   - Parallel chunk processing                    │     │
│    │   - Merge results                                │     │
│    └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. POST-PROCESSING                                           │
│    - Calculate KPIs (accuracy, latency, throughput)          │
│    - Generate segments for display                           │
│    - Create file preview (base64 for images)                 │
│    - Calculate metadata (word count, sentences)              │
│    - Delete temporary uploaded file                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. RESPONSE TO FRONTEND                                      │
│    {                                                         │
│      success: true,                                          │
│      data: {                                                 │
│        originalText, translatedText,                         │
│        originalFilePreview,                                  │
│        segments, kpis, metadata                              │
│      }                                                       │
│    }                                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. FRONTEND DISPLAYS RESULTS                                 │
│    - Side-by-side preview (original vs translated)           │
│    - KPI dashboard (accuracy, latency, throughput, WER)      │
│    - Segment-by-segment analysis                             │
│    - Document information                                    │
│    - Export options (TXT, JSON, PDF)                         │
│    - Reverse translation option                              │
└─────────────────────────────────────────────────────────────┘
```### 6.2 Reverse Translation Flow

```
User clicks "Reverse Translation"
    ↓
Create text blob from English translation
    ↓
POST to /api/translate with reversed languages
    ↓
Backend translates English → Original Language
    ↓
Frontend displays comparison
    ↓
User can verify translation accuracy
```

---

## 7. API Specifications

### 7.1 Main Translation Endpoint

**Endpoint:** `POST /api/translate`

**Request:**
```
Content-Type: multipart/form-data

Fields:
  - file: File (JPG, PDF, DOCX, TXT, JSON)
  - sourceLang: String (spanish, french, german, mandarin, hindi, english)
  - targetLang: String (english, spanish, french, german, mandarin, hindi)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalText": "string",
    "translatedText": "string",
    "originalFilePreview": "data:image/jpeg;base64,...",
    "fileName": "string",
    "fileSize": "number",
    "fileType": "string",
    "wordCount": "number",
    "translatedWordCount": "number",
    "characterCount": "number",
    "sentenceCount": "number",
    "segments": [
      {
        "id": 1,
        "source": "string",
        "target": "string",
        "confidence": 0.98,
        "tokens": 15,
        "processingTime": "0.12"
      }
    ],
    "kpis": {
      "accuracy": 97.5,
      "latency": 2.34,
      "throughput": 450,
      "wer": 1.2,
      "bleuScore": 95.8,
      "semanticSimilarity": 98.2
    },
    "metadata": {
      "fileName": "string",
      "fileSize": "string",
      "fileType": "string",
      "wordCount": "number",
      "characterCount": "number",
      "sentenceCount": "number",
      "processedAt": "string",
      "model": "string",
      "sourceLanguage": "string",
      "targetLanguage": "string",
      "languagePair": "string",
      "preservedElements": ["array"]
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional details"
}
```

### 7.2 PDF Generation Endpoint

**Endpoint:** `POST /api/generate-pdf`

**Request:**
```json
{
  "translatedText": "string",
  "fileName": "string",
  "sourceLang": "string",
  "targetLang": "string",
  "metadata": {
    "model": "string",
    "wordCount": "number"
  }
}
```

**Response:**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="translation_report_[timestamp].pdf"

[PDF Binary Data]
```

### 7.3 Health Check Endpoint

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-24T10:30:00.000Z",
  "services": {
    "gemini": true,
    "claude": false,
    "openai": true,
    "openrouter": false
  }
}
```

---

## 8. Technology Stack

### 8.1 Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool and dev server |
| TailwindCSS | 3.4.x | Styling framework |
| Lucide React | Latest | Icon library |
| JavaScript | ES6+ | Programming language |

### 8.2 Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.x | Web framework |
| Multer | 1.4.x | File upload handling |
| Tesseract.js | 6.0.x | OCR processing |
| pdf-parse | Latest | PDF text extraction |
| mammoth | Latest | DOCX text extraction |
| PDFKit | Latest | PDF generation |
| dotenv | Latest | Environment configuration |

### 8.3 AI/ML Services

| Service | Model | Purpose |
|---------|-------|---------|
| Google Gemini | gemini-1.5-flash | Primary translation (FREE) |
| OpenAI | gpt-4o-mini | Secondary translation |
| Anthropic | claude-sonnet-4 | Tertiary translation |
| Google Translate | - | Fallback translation |
| MyMemory API | - | Fallback translation |
| LibreTranslate | - | Fallback translation |
| OCR.space | - | Fallback OCR |

---

## 9. Security & Performance

### 9.1 Security Measures

**API Key Management:**
- Environment variables (.env file)
- Keys never exposed to frontend
- .gitignore protection

**File Upload Security:**
- File type validation (whitelist)
- File size limits (50MB)
- Temporary file storage with auto-cleanup
- MIME type verification

**CORS Configuration:**
- Enabled for cross-origin requests
- Configurable allowed origins

**Input Validation:**
- File extension checking
- Language code validation
- Request body size limits (50MB)

### 9.2 Performance Optimizations

**Frontend:**
- Lazy loading
- Progress tracking
- Parallel API calls for exports
- Optimized re-renders with React hooks
- Debounced file validation

**Backend:**
- Parallel chunk translation for large texts
- Efficient buffer handling
- Streaming for large files
- Connection pooling
- Response compression

**Translation Strategy:**
- Engine fallback for reliability
- Timeout handling (45s frontend, configurable backend)
- Chunk-based processing for large documents
- Parallel processing where possible

### 9.3 Performance Metrics

**Target KPIs:**
- Translation accuracy: >95%
- Latency: <5 seconds for small files (<1MB)
- Throughput: 400+ words/second
- WER (Word Error Rate): <2.5%
- BLEU Score: >92%
- Semantic Similarity: >95%

---

## 10. Deployment Architecture

### 10.1 Development Environment

```
Development Machine
├── Backend Server: http://localhost:5000
├── Frontend Dev Server: http://localhost:3000 (Vite)
└── Environment: .env file with API keys
```

**Start Commands:**
```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

### 10.2 Production Deployment

**Recommended Architecture:**

```
┌────────────────────────────────────────────────┐
│         Cloud Provider (AWS/Azure/GCP)         │
│                                                │
│  ┌──────────────────────────────────────────┐ │
│  │  Load Balancer / CDN                     │ │
│  └──────────────────────────────────────────┘ │
│                    ↓                           │
│  ┌──────────────────────────────────────────┐ │
│  │  Frontend (Static Hosting)               │ │
│  │  - S3 / Azure Blob / Cloud Storage       │ │
│  │  - CloudFront / Azure CDN                │ │
│  └──────────────────────────────────────────┘ │
│                    ↓                           │
│  ┌──────────────────────────────────────────┐ │
│  │  Backend (Container/VM)                  │ │
│  │  - EC2 / App Service / Compute Engine    │ │
│  │  - Auto-scaling enabled                  │ │
│  │  - Environment variables configured      │ │
│  └──────────────────────────────────────────┘ │
│                    ↓                           │
│  ┌──────────────────────────────────────────┐ │
│  │  File Storage (Temporary)                │ │
│  │  - EFS / Azure Files                     │ │
│  │  - Auto-cleanup policy                   │ │
│  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

**Environment Variables Required:**
```bash
# API Keys (at least one translation service)
GEMINI_API_KEY=your_gemini_api_key          # Primary (FREE)
OPENAI_API_KEY=your_openai_api_key          # Optional
ANTHROPIC_API_KEY=your_claude_api_key       # Optional
OPENROUTER_API_KEY=your_openrouter_key      # Optional

# OCR (optional)
OCR_SPACE_API_KEY=your_ocr_space_key

# Server Configuration
PORT=5000
NODE_ENV=production
```

### 10.3 Scalability Considerations

**Horizontal Scaling:**
- Stateless backend design
- Load balancer distribution
- Multiple backend instances

**Vertical Scaling:**
- Increased memory for large file processing
- CPU optimization for OCR operations

**Caching Strategy:**
- Static assets cached at CDN
- API response caching for identical requests
- Translation result caching (optional)

---

## 11. Error Handling & Logging

### 11.1 Error Categories

**1. File Upload Errors:**
- Invalid file type
- File size exceeded
- Upload timeout
- Network errors

**2. Translation Errors:**
- API key missing/invalid
- API quota exceeded
- API timeout
- Network failures
- Model not available

**3. Processing Errors:**
- Text extraction failure
- OCR failure
- Corrupted file
- Unsupported format

### 11.2 Logging Strategy

**Backend Logging:**
```javascript
console.log('🚀 NEW TRANSLATION REQUEST')
console.log('📄 File: filename')
console.log('📊 Size: size KB')
console.log('🌐 Language: source → target')
console.log('✅ Translation complete')
console.error('❌ Error: message')
```

**Frontend Error Display:**
- User-friendly error messages
- Actionable suggestions
- Backend status indicators
- Retry options

---

## 12. Future Enhancements

### 12.1 Planned Features

1. **Additional Language Support**
   - Add more source/target languages
   - Bi-directional translation

2. **Batch Processing**
   - Multiple file upload
   - Bulk translation queue

3. **Translation Memory**
   - Store previous translations
   - Reuse common phrases
   - Consistency across documents

4. **Advanced OCR**
   - Table structure recognition
   - Handwriting recognition
   - Image preprocessing

5. **Real-time Collaboration**
   - Multi-user editing
   - Translation suggestions
   - Version control

6. **API Access**
   - RESTful API for integration
   - API key management
   - Usage analytics

### 12.2 Technical Improvements

1. **Database Integration**
   - Store translation history
   - User accounts
   - Usage analytics

2. **WebSocket Support**
   - Real-time progress updates
   - Live collaboration

3. **Caching Layer**
   - Redis for translation cache
   - Reduce API costs

4. **Microservices Architecture**
   - Separate OCR service
   - Separate translation service
   - Separate export service

---

## Appendix A: File Structure

```
Advance Document Translator/
├── backend/
│   ├── node_modules/
│   ├── routes/
│   │   └── translate.js
│   ├── services/
│   │   └── openaiService.js
│   ├── uploads/                # Temporary storage
│   ├── package.json
│   ├── server.js               # Main backend file (1124 lines)
│   └── .env                    # Environment variables
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── TranslatorTool.jsx  # Main component (1136 lines)
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── doc1/                       # Documentation folder
│   ├── DESIGN_DOCUMENT.md      # This document
│   └── USER_GUIDE.md           # User guide
│
├── node_modules/
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## Appendix B: API Response Examples

### Successful Translation Response

```json
{
  "success": true,
  "data": {
    "originalText": "Este es un documento de prueba para traducir del español al inglés.",
    "translatedText": "This is a test document to translate from Spanish to English.",
    "originalFilePreview": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "fileName": "test_document.jpg",
    "fileSize": "245.67",
    "fileType": "image/jpeg",
    "wordCount": 12,
    "translatedWordCount": 13,
    "characterCount": 68,
    "sentenceCount": 1,
    "segments": [
      {
        "id": 1,
        "source": "Este es un documento de prueba para traducir del español al inglés.",
        "target": "This is a test document to translate from Spanish to English.",
        "confidence": 0.982,
        "tokens": 12,
        "processingTime": "0.15"
      }
    ],
    "kpis": {
      "accuracy": 97.5,
      "latency": 2.34,
      "throughput": 450,
      "wer": 1.2,
      "bleuScore": 95.8,
      "semanticSimilarity": 98.2
    },
    "metadata": {
      "fileName": "test_document.jpg",
      "fileSize": "245.67",
      "fileType": "image/jpeg",
      "wordCount": 12,
      "characterCount": 68,
      "sentenceCount": 1,
      "processedAt": "12/24/2025, 10:30:45 AM",
      "model": "Google gemini-1.5-flash (Free Tier)",
      "sourceLanguage": "Spanish",
      "targetLanguage": "English",
      "languagePair": "Spanish → English",
      "preservedElements": ["Structure", "Format", "Tables", "Hierarchy"]
    }
  }
}
```

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-24 | SPECTRA AI Team | Initial design document |

---

**End of Design Document**

© 2025 SPECTRA AI Pte. Ltd. All Rights Reserved.
