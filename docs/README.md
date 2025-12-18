# Translatrix Pro - Documentation

**AI-Powered Document Translation System**

**Version:** 1.0.0
**Company:** SPECTRA AI Pte. Ltd., Singapore
**Last Updated:** December 2024

---

## 📚 Documentation Index

This documentation provides comprehensive information about the Translatrix Pro AI Document Translation System.

### 📖 Quick Links

- [System Architecture](./architecture/SYSTEM_ARCHITECTURE.md)
- [Component Architecture](./architecture/COMPONENT_ARCHITECTURE.md)
- [Data Flow](./architecture/DATA_FLOW.md)
- [API Documentation](./api/API_REFERENCE.md)
- [User Guide](./guides/USER_GUIDE.md)
- [Developer Guide](./guides/DEVELOPER_GUIDE.md)
- [Deployment Guide](./guides/DEPLOYMENT_GUIDE.md)

---

## 🎯 What is Translatrix Pro?

Translatrix Pro is an enterprise-grade AI-powered document translation system that provides:

- **Multi-language Support**: Translates from Spanish, French, German, Mandarin Chinese, and Hindi to English
- **Multiple File Formats**: Supports JPG, PDF, JSON, and TXT files
- **AI-Powered**: Uses Google Gemini, OpenAI GPT-4o, and Claude AI for high-quality translations
- **High Accuracy**: Achieves >95% translation accuracy
- **Fast Processing**: Real-time translation with optimized performance
- **Verification**: Reverse translation feature for quality assurance

---

## 🏗️ System Overview

### Technology Stack

**Frontend (SPA):**
- React 18.3.1
- Vite 5.3.3
- Tailwind CSS 3.4.4
- Axios for API calls
- Lucide React for icons

**Backend (API):**
- Node.js v20+
- Express.js
- Multer for file uploads
- Tesseract.js for OCR
- PDFKit for PDF generation
- Multiple AI APIs (Gemini, OpenAI, Claude)

**AI Services:**
- Google Gemini 1.5 Flash (Primary - Free)
- OpenAI GPT-4o-mini (Backup)
- Claude Sonnet 4 (Fallback)
- Free translation APIs (Google Translate, MyMemory, LibreTranslate)

---

## 📂 Project Structure

```
Advance  Document  Translator/
├── backend/              # Express.js API server
│   ├── server.js         # Main server file
│   ├── middleware/       # Custom middleware
│   ├── uploads/          # Temporary file storage
│   └── package.json      # Backend dependencies
│
├── frontend/             # Original React frontend
│   ├── src/              # Source files
│   └── package.json      # Frontend dependencies
│
├── spa/                  # New clean SPA
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.jsx       # Root component
│   │   └── main.jsx      # Entry point
│   └── package.json      # SPA dependencies
│
└── docs/                 # Documentation (YOU ARE HERE)
    ├── architecture/     # System architecture docs
    ├── api/              # API documentation
    ├── guides/           # User & developer guides
    └── diagrams/         # System diagrams
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v20 or higher
- npm v10 or higher
- API keys for AI services (optional but recommended)

### Installation

1. **Clone the repository**
```bash
cd "C:\Users\Administrator\Desktop\Advance  Document  Translator"
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install SPA Dependencies**
```bash
cd ../spa
npm install
```

4. **Configure Environment Variables**
```bash
cd ../backend
# Copy .env.example to .env and add your API keys
```

5. **Start the System**

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd spa
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🔑 API Keys (Optional)

For best performance, obtain free API keys:

- **Google Gemini** (Recommended - Free): https://aistudio.google.com/app/apikey
- **OpenAI** (Backup): https://platform.openai.com/api-keys
- **Anthropic Claude** (Optional): https://console.anthropic.com/

Add to `backend/.env`:
```
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

---

## 📊 Features

### Core Features
✅ Multi-language translation (5 languages → English)
✅ Multiple file format support (JPG, PDF, JSON, TXT)
✅ AI-powered translation with fallback system
✅ Real-time progress tracking
✅ Performance metrics (KPIs)
✅ Reverse translation for verification
✅ Multiple export formats (TXT, JSON, PDF)

### Technical Features
✅ Responsive web interface
✅ Drag & drop file upload
✅ RESTful API architecture
✅ Error handling & validation
✅ Language detection & verification
✅ Hot module replacement (HMR)
✅ Production-ready build

---

## 📈 Performance Metrics

- **Accuracy**: >95%
- **Latency**: 2-5 seconds (varies by file size)
- **Throughput**: 100-500 words/second
- **Supported File Size**: Up to 50MB
- **Concurrent Users**: Scalable (depends on deployment)

---

## 🔒 Security

- Input validation & sanitization
- File type verification
- Size limits on uploads
- API rate limiting (configurable)
- CORS configuration
- Environment variable protection

---

## 📞 Support

**SPECTRA AI Pte. Ltd.**
- **Email**: info@spectrai.sg
- **Direct**: nirupamsd@spectrai.sg
- **Phone**: +65 9382-0672 / +65 6405-2565
- **Location**: Singapore 650152

---

## 📄 License

© 2024 SPECTRA AI Pte. Ltd. - All Rights Reserved

---

## 🗺️ Documentation Navigation

**Next Steps:**
- Read the [System Architecture](./architecture/SYSTEM_ARCHITECTURE.md)
- Explore the [API Documentation](./api/API_REFERENCE.md)
- Follow the [User Guide](./guides/USER_GUIDE.md)
