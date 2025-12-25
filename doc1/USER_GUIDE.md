# Translatrix Pro - User Guide

**Product Name:** Translatrix Pro (Advanced Document Translator)
**Version:** 4.5
**Organization:** SPECTRA AI Pte. Ltd., Singapore
**Date:** December 24, 2025
**Document Type:** End-User Guide

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Installation Guide](#installation-guide)
4. [Getting Started](#getting-started)
5. [Using Translatrix Pro](#using-translatrix-pro)
6. [Features Guide](#features-guide)
7. [Export Options](#export-options)
8. [Troubleshooting](#troubleshooting)
9. [FAQ](#faq)
10. [Support](#support)

---

## 1. Introduction

### 1.1 Welcome to Translatrix Pro

Translatrix Pro is an enterprise-grade AI-powered document translation tool designed to help you translate documents quickly and accurately while preserving their original structure and formatting.

### 1.2 Key Features

- **Multi-Language Support**: Translate from Spanish, French, German, Mandarin, or Hindi to English
- **Multiple File Formats**: Support for JPG, PDF, DOCX, TXT, and JSON files
- **AI-Powered Translation**: Uses Google Gemini (FREE), GPT-4o-mini, and Claude AI
- **Structure Preservation**: Maintains document formatting, tables, and hierarchy
- **OCR Capability**: Automatically extracts text from images
- **Quality Metrics**: Real-time accuracy, latency, and performance indicators
- **Reverse Translation**: Verify translation accuracy
- **Multiple Export Formats**: Download results as TXT, JSON, or PDF

### 1.3 Who Should Use This Guide

- End users performing document translation
- Business professionals translating documents
- System administrators setting up the application
- Developers integrating with the translation API

---

## 2. System Requirements

### 2.1 Minimum Requirements

**For End Users (Web Interface):**
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Internet connection (stable, minimum 5 Mbps)
- JavaScript enabled
- Screen resolution: 1280x720 or higher

**For System Administrators (Installation):**
- Operating System: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- Node.js: Version 18.0 or higher
- npm: Version 8.0 or higher
- RAM: Minimum 4GB (8GB recommended)
- Disk Space: 2GB free space minimum
- Network: Internet connection for API access

### 2.2 Supported File Types

| File Type | Extension | Max Size | Notes |
|-----------|-----------|----------|-------|
| Image | .jpg, .jpeg | 50 MB | OCR will be applied |
| PDF | .pdf | 50 MB | Text and image PDFs supported |
| Word Document | .docx | 50 MB | Text extraction |
| Text File | .txt | 50 MB | Plain text |
| JSON | .json | 50 MB | Structured data |

### 2.3 Supported Languages

**Source Languages (Document Language):**
- Spanish (🇪🇸)
- French (🇫🇷)
- German (🇩🇪)
- Mandarin Chinese (🇨🇳)
- Hindi (🇮🇳)
- English (🇬🇧)

**Target Language:**
- English (🇬🇧) - Fixed

**Note:** For reverse translation, English → Source Language is also supported.

---

## 3. Installation Guide

### 3.1 For System Administrators

#### Step 1: Prerequisites

1. **Install Node.js**
   - Download from: https://nodejs.org/
   - Verify installation:
     ```bash
     node --version  # Should show v18.0 or higher
     npm --version   # Should show v8.0 or higher
     ```

2. **Obtain API Keys** (at least one is required)

   **Option 1: Google Gemini (FREE - Recommended)**
   - Visit: https://aistudio.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Copy the key (starts with "AIza...")
   - Free tier: 60 requests/minute

   **Option 2: OpenAI GPT-4o-mini (Paid)**
   - Visit: https://platform.openai.com/account/api-keys
   - Sign in or create account
   - Click "Create new secret key"
   - Copy the key (starts with "sk-...")
   - Requires payment method

   **Option 3: Anthropic Claude (Paid)**
   - Visit: https://console.anthropic.com/
   - Sign in or create account
   - Navigate to API Keys
   - Create new key
   - Copy the key

#### Step 2: Download the Application

```bash
# Clone or download the application
cd /path/to/installation/directory
```

#### Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
# Create a file named .env in the backend directory
```

**Edit .env file and add:**
```bash
# Required: At least ONE of these API keys
GEMINI_API_KEY=your_gemini_api_key_here          # FREE option
OPENAI_API_KEY=your_openai_api_key_here          # Paid option
ANTHROPIC_API_KEY=your_claude_api_key_here       # Paid option

# Optional
OCR_SPACE_API_KEY=your_ocr_space_key_here
OPENROUTER_API_KEY=your_openrouter_key_here

# Server Configuration
PORT=5000
NODE_ENV=development
```

**Start the backend server:**
```bash
npm start
```

You should see:
```
⚡ ADVANCED DOCUMENT TRANSLATOR - FREE TIER ENABLED
📍 Server: http://localhost:5000
🏥 Health: http://localhost:5000/api/health
```

#### Step 4: Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### Step 5: Access the Application

1. Open your web browser
2. Navigate to: `http://localhost:5173/`
3. You should see the Translatrix Pro interface

### 3.2 For Production Deployment

#### Option A: Build for Production

**Build Frontend:**
```bash
cd frontend
npm run build
# Creates 'dist' folder with optimized files
```

**Deploy Frontend:**
- Upload contents of `dist/` folder to:
  - AWS S3 + CloudFront
  - Azure Blob Storage + CDN
  - Netlify
  - Vercel
  - Any static hosting service

**Deploy Backend:**
```bash
cd backend
# Set environment variables on your hosting platform
# Deploy to:
# - AWS EC2 / Elastic Beanstalk
# - Azure App Service
# - Google Cloud Run
# - Heroku
# - DigitalOcean
```

#### Option B: Docker Deployment (Advanced)

**Create Dockerfile for Backend:**
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

**Build and run:**
```bash
docker build -t translatrix-backend .
docker run -p 5000:5000 --env-file .env translatrix-backend
```

### 3.3 Verification

**Check Backend Health:**
```bash
curl http://localhost:5000/api/health
```

Expected response:
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

## 4. Getting Started

### 4.1 First-Time Setup

1. **Open the Application**
   - Navigate to `http://localhost:5173/` (development)
   - Or your deployed URL (production)

2. **Understand the Interface**

   The main screen is divided into two sections:
   - **Left Panel**: Language selection, file upload, download options, KPI metrics
   - **Right Panel**: Processing status, translation results, document preview

### 4.2 Interface Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TRANSLATRIX PRO                           │
│         Real-Time AI Translation | OpenAI + Free APIs       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────────────────────────┐
│  LEFT PANEL      │  │  RIGHT PANEL                         │
│                  │  │                                      │
│  ┌────────────┐  │  │  ┌────────────────────────────────┐ │
│  │ Language   │  │  │  │                                │ │
│  │ Selection  │  │  │  │   Processing View /            │ │
│  └────────────┘  │  │  │   Translation Results          │ │
│                  │  │  │                                │ │
│  ┌────────────┐  │  │  │   - Side-by-side preview       │ │
│  │ Upload     │  │  │  │   - Document information       │ │
│  │ Document   │  │  │  │   - Segment analysis           │ │
│  └────────────┘  │  │  │                                │ │
│                  │  │  └────────────────────────────────┘ │
│  ┌────────────┐  │  │                                      │
│  │ Download   │  │  │                                      │
│  │ Options    │  │  │                                      │
│  └────────────┘  │  │                                      │
│                  │  │                                      │
│  ┌────────────┐  │  │                                      │
│  │ KPI        │  │  │                                      │
│  │ Dashboard  │  │  │                                      │
│  └────────────┘  │  │                                      │
└──────────────────┘  └──────────────────────────────────────┘
```

---

## 5. Using Translatrix Pro

### 5.1 Basic Translation Workflow

#### Step 1: Select Languages

1. **Select Source Language**
   - Click on the "Source Language" dropdown
   - Choose the language of your document:
     - 🇪🇸 Spanish
     - 🇫🇷 French
     - 🇩🇪 German
     - 🇨🇳 Mandarin Chinese
     - 🇮🇳 Hindi

2. **Target Language**
   - Target language is fixed to English (🇬🇧)
   - No selection needed

#### Step 2: Upload Document

**Method 1: Drag and Drop**
1. Drag your file from your file explorer
2. Drop it onto the upload area
3. File will be validated automatically

**Method 2: Click to Browse**
1. Click on the upload area
2. Browse and select your file
3. Click "Open"

**File Requirements:**
- Supported formats: JPG, JPEG, PDF, JSON, TXT
- Maximum size: 50 MB
- File must be in the selected source language

**Upload Confirmation:**
Once uploaded successfully, you'll see:
```
✓ [filename.ext]
  [file size] KB • Ready to translate
```

#### Step 3: Start Translation

1. Click the **"TRANSLATE NOW"** button
2. Button will show "TRANSLATING..." during processing
3. Watch the progress indicator

**Processing Stages:**
```
Extract (10-20%) → Parse (20-30%) → Translate (30-100%)
```

**Expected Time:**
- Small files (<100 KB): 2-5 seconds
- Medium files (100KB-1MB): 5-15 seconds
- Large files (1-5 MB): 15-45 seconds
- Very large files (5-50 MB): 30-60 seconds

#### Step 4: Review Results

Once translation is complete, you'll see:

1. **Side-by-Side Preview**
   - Left: Original document (in source language)
   - Right: Translated document (in English)
   - Image files show visual preview
   - Text files show formatted text

2. **Document Information**
   - File name, size, type
   - Word count, character count
   - Language pair
   - Processing timestamp

3. **Performance KPIs**
   - **Accuracy**: Translation accuracy percentage (>95% is excellent)
   - **Latency**: Processing time in seconds
   - **Throughput**: Words processed per second
   - **WER**: Word Error Rate (<2.5% is excellent)
   - **BLEU Score**: Translation quality metric (>92% is excellent)
   - **Semantic Similarity**: Meaning preservation (>95% is excellent)

4. **Segment Analysis**
   - Sentence-by-sentence breakdown
   - Confidence score for each segment
   - Token count and processing time

### 5.2 Advanced Features

#### Reverse Translation (Verification)

To verify translation accuracy:

1. Click **"Reverse Translation"** button (top right of preview area)
2. System translates English back to original language
3. Compare reverse translation with original
4. Differences indicate potential translation issues

**Interpretation:**
- High similarity = Accurate translation
- Low similarity = Review translation carefully

#### Re-Translate Document

To translate the same document again:

1. Click **"Re-Translate"** button
2. System processes the document again
3. Useful if first translation had errors

---

## 6. Features Guide

### 6.1 Language Selection

**Source Languages:**
All source languages are supported with native speakers' cultural context and idioms.

**Language Details:**

| Language | Code | Character Set | Special Features |
|----------|------|---------------|------------------|
| Spanish | spanish | Latin | Accents preserved |
| French | french | Latin | Diacritics preserved |
| German | german | Latin | Umlauts preserved |
| Mandarin | mandarin | Chinese | Traditional/Simplified |
| Hindi | hindi | Devanagari | Complex scripts |

### 6.2 File Format Support

#### Images (JPG, JPEG)

**Best Practices:**
- Use high-resolution images (minimum 300 DPI)
- Ensure text is clearly visible
- Avoid handwritten text (OCR accuracy lower)
- Straight, well-lit photos work best
- Remove shadows and glare

**Processing:**
- AI directly reads text from image
- OCR used as fallback
- Preserves visual structure

**Example Use Cases:**
- Scanned documents
- Photos of documents
- Screenshots
- Digital images with text

#### PDF Files

**Supported Types:**
- Text-based PDFs (preferred)
- Image-based PDFs (using OCR)
- Mixed content PDFs

**Best Practices:**
- Use searchable PDFs when possible
- Ensure good scan quality for image PDFs
- Avoid password-protected PDFs
- Single or multi-page documents supported

**Processing:**
- Text extraction from PDF
- AI vision for complex layouts
- Structure preservation

**Example Use Cases:**
- Legal documents
- Business contracts
- Technical manuals
- Reports and forms

#### Word Documents (DOCX)

**Processing:**
- Direct text extraction
- Formatting preserved
- Tables and lists maintained

**Best Practices:**
- Use standard fonts
- Avoid complex embedded objects
- Save as .docx (not .doc)

**Example Use Cases:**
- Business documents
- Letters and correspondence
- Reports
- Templates

#### Text Files (TXT)

**Processing:**
- Simple text extraction
- Fast processing
- No formatting

**Best Practices:**
- Use UTF-8 encoding
- Plain text only
- No special formatting

**Example Use Cases:**
- Simple documents
- Notes
- Scripts
- Code comments

#### JSON Files

**Processing:**
- Text extraction from JSON values
- Structure maintained
- Keys and values translated

**Best Practices:**
- Valid JSON format
- UTF-8 encoding
- Reasonable nesting depth

**Example Use Cases:**
- Configuration files
- Data exports
- API responses
- Structured data

### 6.3 Translation Quality

#### Understanding Accuracy Metrics

**Accuracy Score (%):**
- 95-100%: Excellent - Professional quality
- 90-94%: Good - Minor improvements needed
- 85-89%: Fair - Review recommended
- <85%: Poor - Manual review required

**Latency (seconds):**
- <2s: Excellent
- 2-5s: Good
- 5-10s: Fair
- >10s: Slow (check file size)

**BLEU Score:**
- >95: Excellent translation quality
- 90-95: Good translation quality
- 85-90: Acceptable quality
- <85: Review needed

**WER (Word Error Rate):**
- <1%: Excellent
- 1-2%: Good
- 2-5%: Fair
- >5%: Poor

### 6.4 Document Preview

**Side-by-Side View:**
- Original document on left
- Translated document on right
- Synchronized scrolling (where applicable)
- Visual comparison

**Image Preview:**
- Shows original image
- Translated text in formatted view
- Preserves visual context

**Text Preview:**
- Monospace font for accuracy
- Line-by-line comparison
- Whitespace preserved

### 6.5 Segment Analysis

**What are Segments?**
Segments are individual sentences or logical text units in your document.

**Segment Details:**
- **ID**: Sequential number
- **Source**: Original text in source language
- **Target**: Translated text in English
- **Confidence**: AI confidence score (0-100%)
- **Tokens**: Number of words processed
- **Processing Time**: Seconds taken for this segment

**Color Coding:**
- **Green**: High confidence (>98%)
- **Yellow**: Medium confidence (95-98%)
- **Orange**: Low confidence (<95%)

**Using Segment Analysis:**
1. Review low-confidence segments carefully
2. Compare source and target for accuracy
3. Manual review for critical segments

---

## 7. Export Options

### 7.1 Download TXT (Text Report)

**Contents:**
- Complete translation report
- File information
- Translation details
- Performance metrics
- Original text (full)
- Translated text (full)
- Metadata

**Format:**
```
TRANSLATRIX PRO - TRANSLATION DOCUMENT
===============================================

FILE INFORMATION:
File Name: document.pdf
File Type: application/pdf
...

ORIGINAL TEXT (Spanish):
Este es el texto original...

TRANSLATED TEXT (English):
This is the original text...
```

**Use Cases:**
- Archive and record keeping
- Simple text review
- Email sharing
- Text processing

**How to Download:**
1. Click **"Download TXT"** button
2. File saves as: `translated_[filename]_[timestamp].txt`
3. Open with any text editor

### 7.2 Download JSON (Structured Data)

**Contents:**
- Structured data format
- Complete translation data
- All segments
- Performance metrics
- Metadata

**Format:**
```json
{
  "translation": {
    "source": {
      "language": "Spanish",
      "text": "...",
      "wordCount": 150
    },
    "target": {
      "language": "English",
      "text": "...",
      "wordCount": 155
    }
  },
  "segments": [...],
  "performance": {...},
  "metadata": {...}
}
```

**Use Cases:**
- API integration
- Database import
- Programmatic processing
- Data analysis
- Machine learning training

**How to Download:**
1. Click **"Download JSON"** button
2. File saves as: `translation_[timestamp].json`
3. Open with JSON viewer or text editor

### 7.3 Download PDF Report

**Contents:**
- Professional formatted report
- Document information
- Translation details
- Performance metrics
- Original text
- Translated text
- Segment analysis (if applicable)
- Headers and footers
- Page numbers

**Format:**
- A4 size paper
- Professional layout
- Formatted headings
- Tables preserved
- Markdown formatting support

**Features:**
- Multi-page support
- Page breaks
- Headers on each page
- Footer with branding

**Use Cases:**
- Professional presentations
- Client deliverables
- Legal documentation
- Archive printing
- Formal reports

**How to Download:**
1. Click **"Download PDF Report"** button
2. Server generates PDF (may take a few seconds)
3. File downloads as: `translation_report_[timestamp].pdf`
4. Open with PDF reader

---

## 8. Troubleshooting

### 8.1 Common Issues and Solutions

#### Issue: "No file uploaded" error

**Cause:** No file selected before clicking translate

**Solution:**
1. Click on upload area or drag file
2. Wait for green checkmark confirmation
3. Then click "TRANSLATE NOW"

---

#### Issue: "Unsupported file type" error

**Cause:** File format not supported

**Solution:**
1. Check file extension (.jpg, .pdf, .docx, .txt, .json only)
2. Convert file to supported format
3. Re-upload

**Supported conversions:**
- .doc → .docx (use Microsoft Word)
- .png → .jpg (use image editor)
- .rtf → .txt (use text editor)

---

#### Issue: "Translation failed" error

**Possible Causes:**
1. Backend server not running
2. API key missing or invalid
3. Network connectivity issue
4. API quota exceeded

**Solutions:**

**1. Check Backend Server:**
```bash
# Open terminal and check if server is running
curl http://localhost:5000/api/health

# If not running, start it:
cd backend
npm start
```

**2. Verify API Keys:**
```bash
# Check .env file in backend directory
# Ensure at least one API key is set
GEMINI_API_KEY=your_key_here
```

**3. Check Network:**
- Ensure internet connection is stable
- Check firewall settings
- Verify proxy settings if applicable

**4. API Quota:**
- Gemini free tier: 60 requests/minute
- Wait 1 minute and try again
- Or add payment method for higher quota

---

#### Issue: Translation takes too long (>1 minute)

**Possible Causes:**
1. Large file size
2. Slow internet connection
3. API service slow response
4. High server load

**Solutions:**
1. **Reduce file size:**
   - Compress images before upload
   - Split large documents
   - Reduce PDF resolution

2. **Check connection:**
   - Test internet speed
   - Close other bandwidth-heavy applications

3. **Try again:**
   - Click "Re-Translate" button
   - May use different API engine

---

#### Issue: Poor translation quality

**Possible Causes:**
1. Low-quality source document
2. Handwritten text (OCR struggle)
3. Complex technical jargon
4. Fallback API used (lower quality)

**Solutions:**
1. **Improve source:**
   - Use higher resolution images
   - Use text-based PDFs instead of scanned
   - Clear, legible fonts

2. **Verify API:**
   - Check which API was used (shown in metadata)
   - Ensure Gemini or GPT-4 API key is set
   - Fallback APIs have lower quality

3. **Use reverse translation:**
   - Click "Reverse Translation"
   - Compare with original
   - Manually fix discrepancies

---

#### Issue: PDF download fails

**Possible Causes:**
1. Server error during PDF generation
2. Browser blocking download
3. Network interruption

**Solutions:**
1. **Check browser:**
   - Allow popups for the site
   - Check download folder permissions

2. **Try again:**
   - Click "Download PDF Report" again
   - Wait for completion

3. **Alternative:**
   - Download TXT or JSON instead
   - Convert manually to PDF

---

#### Issue: Reverse translation button not working

**Possible Causes:**
1. No translation completed yet
2. Processing in progress
3. Network error

**Solutions:**
1. **Complete initial translation first:**
   - Must have translation results before reverse

2. **Wait for processing:**
   - Reverse translation takes 5-10 seconds
   - Wait for completion

3. **Refresh and retry:**
   - Reload page
   - Re-translate document
   - Try reverse translation again

---

### 8.2 Error Messages Reference

| Error Message | Meaning | Solution |
|---------------|---------|----------|
| "No file uploaded" | No file selected | Upload a file first |
| "Unsupported file type" | Wrong file format | Use JPG, PDF, DOCX, TXT, or JSON |
| "Translation failed" | Backend error | Check server and API keys |
| "Translation timeout" | Processing too slow | Reduce file size or retry |
| "PDF generation failed" | PDF export error | Try TXT or JSON export |
| "Invalid file format" | Corrupted file | Re-save file and try again |
| "File too large" | Exceeds 50MB limit | Compress or split file |

---

### 8.3 Performance Optimization

#### For Large Files

**Strategy 1: Pre-process Documents**
- Split multi-page PDFs into smaller chunks
- Process 5-10 pages at a time
- Merge results manually

**Strategy 2: Optimize Images**
- Compress images to 1-2 MB
- Use JPEG format (smaller than PNG)
- Reduce resolution to 150-300 DPI

**Strategy 3: Convert to Text**
- For PDF: Extract text first, save as TXT
- Upload TXT for faster processing
- Use OCR offline for images

#### For Multiple Documents

**Batch Processing:**
1. Process documents one by one
2. Download results for each
3. Organize in folders

**Tips:**
- Name files clearly before upload
- Keep track of translations
- Use JSON export for database import

---

## 9. FAQ

### General Questions

**Q: How much does Translatrix Pro cost?**

A: The application is free to use with your own API keys. Google Gemini offers a free tier (60 requests/minute). Paid options (GPT-4, Claude) require your own API subscription.

---

**Q: What languages are supported?**

A: Currently supports translation from Spanish, French, German, Mandarin, and Hindi to English. Reverse translation (English → source language) is also available for verification.

---

**Q: Can I translate English to other languages?**

A: Yes, use the reverse translation feature. Upload an English document and select the target language as the "source language," then use reverse translation.

---

**Q: Is my data secure?**

A: Documents are processed temporarily and deleted immediately after translation. No data is stored permanently on the server. API communications use HTTPS encryption.

---

**Q: Can I use this offline?**

A: No, an internet connection is required to access AI translation APIs (Gemini, GPT-4, Claude).

---

### Technical Questions

**Q: Which translation engine is best?**

A: Recommended priority:
1. **Google Gemini** - FREE, excellent quality for images
2. **GPT-4o-mini** - Paid, very good for all formats
3. **Claude** - Paid, excellent for complex documents
4. **Free APIs** - Fallback, lower quality

---

**Q: Why is OCR accuracy low?**

A: OCR accuracy depends on:
- Image resolution (higher is better)
- Text clarity (printed better than handwritten)
- Font type (standard fonts better than decorative)
- Lighting and angle

**Tips for better OCR:**
- Use 300+ DPI scans
- Ensure good lighting
- Straighten document before scanning
- Use black text on white background

---

**Q: Can I process handwritten documents?**

A: Handwritten text has lower accuracy. For best results:
- Use clear, legible handwriting
- Dark ink on white paper
- Large, well-spaced letters
- Consider typing text first

---

**Q: What happens if all APIs fail?**

A: The system uses a fallback chain:
1. Google Gemini (if image)
2. GPT-4 Vision (if configured)
3. Claude API (if configured)
4. Free APIs (Google Translate, MyMemory, LibreTranslate)

If all fail, an error message is shown. Ensure at least one API key is configured.

---

**Q: Can I batch process multiple files?**

A: Current version processes one file at a time. For multiple files:
1. Process each individually
2. Download results
3. Repeat for next file

Future versions may support batch processing.

---

**Q: How accurate is the translation?**

A: Accuracy varies by:
- **Source quality**: Clear documents = higher accuracy
- **Language pair**: Common languages = better
- **API used**: Gemini/GPT-4/Claude = 95-99% accuracy
- **Content type**: Simple text > technical jargon

Typical accuracy: 95-98% for good quality documents.

---

**Q: Can I edit translations?**

A: Current version doesn't support inline editing. To edit:
1. Download TXT or JSON export
2. Edit in text editor or word processor
3. Save modified version

---

**Q: What is segment analysis?**

A: Segment analysis breaks translation into sentences, showing:
- Source sentence (original language)
- Target sentence (English)
- Confidence score
- Token count
- Processing time

Helps identify potential issues in translation.

---

### Account & Billing

**Q: Do I need to create an account?**

A: No account required to use the application. You only need API keys for the translation services.

---

**Q: How do I get API keys?**

A:
- **Google Gemini (FREE)**: https://aistudio.google.com/app/apikey
- **OpenAI (Paid)**: https://platform.openai.com/account/api-keys
- **Anthropic Claude (Paid)**: https://console.anthropic.com/

---

**Q: What are the API costs?**

A:
- **Google Gemini**: FREE tier available (60 req/min)
- **OpenAI GPT-4o-mini**: ~$0.15 per million input tokens
- **Anthropic Claude**: ~$3 per million input tokens

Check providers' websites for current pricing.

---

## 10. Support

### 10.1 Contact Information

**SPECTRA AI Pte. Ltd.**
Singapore 650152

**Email:**
- General Inquiries: info@spectrai.sg
- Direct Support: nirupamsd@spectrai.sg

**Phone:**
- +65 9382-0672
- +65 6405-2565

**Website:**
https://spectrai.sg

### 10.2 Business Hours

Monday - Friday: 9:00 AM - 6:00 PM (Singapore Time, GMT+8)
Saturday: 9:00 AM - 1:00 PM
Sunday: Closed

### 10.3 Support Resources

**Documentation:**
- Design Document: `doc1/DESIGN_DOCUMENT.md`
- User Guide: `doc1/USER_GUIDE.md` (this document)

**Online Resources:**
- Google Gemini API Docs: https://ai.google.dev/docs
- OpenAI API Docs: https://platform.openai.com/docs
- Anthropic API Docs: https://docs.anthropic.com/

**GitHub Issues:**
For bug reports and feature requests, contact support team.

### 10.4 Response Times

| Priority | Description | Response Time |
|----------|-------------|---------------|
| Critical | System down, data loss | 4 hours |
| High | Major feature broken | 24 hours |
| Medium | Minor issues, questions | 48 hours |
| Low | Feature requests, enhancements | 5 business days |

### 10.5 Feedback

We welcome your feedback! Please email:
- Bug reports: info@spectrai.sg
- Feature suggestions: nirupamsd@spectrai.sg
- General feedback: info@spectrai.sg

---

## Appendix A: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + O | Open file upload dialog |
| Ctrl + Enter | Start translation (if file uploaded) |
| Ctrl + S | Download TXT (if results available) |
| Esc | Close preview/cancel upload |

*Note: Shortcuts may vary by browser*

---

## Appendix B: Quick Start Checklist

**For System Administrators:**

- [ ] Install Node.js 18+
- [ ] Download application
- [ ] Install backend dependencies (`npm install`)
- [ ] Create `.env` file with at least one API key
- [ ] Start backend server (`npm start`)
- [ ] Install frontend dependencies (`npm install`)
- [ ] Start frontend server (`npm run dev`)
- [ ] Verify health endpoint (`http://localhost:5000/api/health`)
- [ ] Access application (`http://localhost:5173/`)

**For End Users:**

- [ ] Access application URL
- [ ] Select source language
- [ ] Upload document (JPG, PDF, DOCX, TXT, JSON)
- [ ] Click "TRANSLATE NOW"
- [ ] Review translation results
- [ ] Download desired format (TXT, JSON, or PDF)

---

## Appendix C: File Format Specifications

### Image Files (JPG/JPEG)

**Recommended Settings:**
```
Format: JPEG
Resolution: 300 DPI minimum
Color Mode: RGB or Grayscale
Quality: 80-100%
Max Size: 50 MB
```

### PDF Files

**Recommended Settings:**
```
Format: PDF 1.4 or higher
Type: Text-based (preferred) or Image-based
Compression: Flate/ZIP
Max Size: 50 MB
Pages: Any (all processed)
```

### Word Documents (DOCX)

**Recommended Settings:**
```
Format: Office Open XML (.docx)
Word Version: 2007 or newer
Compatibility: Standard
Max Size: 50 MB
```

### Text Files (TXT)

**Recommended Settings:**
```
Encoding: UTF-8
Line Endings: LF or CRLF
Format: Plain text
Max Size: 50 MB
```

### JSON Files

**Recommended Settings:**
```
Format: Valid JSON
Encoding: UTF-8
Indentation: Optional
Max Size: 50 MB
Max Nesting: 10 levels
```

---

## Appendix D: Glossary

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface - allows communication with translation services |
| **BLEU Score** | Bilingual Evaluation Understudy - measures translation quality |
| **Confidence Score** | AI's certainty about translation accuracy (0-100%) |
| **Latency** | Time taken to complete translation |
| **OCR** | Optical Character Recognition - extracts text from images |
| **Segment** | Individual sentence or text unit in translation |
| **Source Language** | Original language of the document |
| **Target Language** | Desired output language (English) |
| **Throughput** | Translation speed (words per second) |
| **Token** | Unit of text processed by AI (roughly 4 characters) |
| **WER** | Word Error Rate - percentage of incorrect words |

---

## Document Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-12-24 | Initial user guide | SPECTRA AI Team |

---

## License and Copyright

© 2025 SPECTRA AI Pte. Ltd. All Rights Reserved.

This document and the Translatrix Pro application are proprietary products of SPECTRA AI Pte. Ltd.

**Restrictions:**
- This software is provided for authorized use only
- Redistribution requires written permission
- Modification of source code prohibited without authorization
- Reverse engineering prohibited

**Disclaimer:**
- Translation accuracy not guaranteed for critical documents
- Users responsible for verifying translation quality
- SPECTRA AI not liable for translation errors or data loss
- Use at your own risk for legal and medical documents

---

**End of User Guide**

For additional assistance, contact SPECTRA AI support:
📧 info@spectrai.sg | 📞 +65 9382-0672
