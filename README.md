# Advanced Document Translator

A powerful, full-stack document translation application with real-time cost monitoring, session tracking, and support for multiple file formats. Built with React, Node.js, and OpenAI's GPT API.

## Features

### Translation
- **Universal File Support**: Translate documents in any format including:
  - Documents: PDF, DOCX, TXT, RTF, ODT
  - Images (OCR): JPG, PNG, GIF, BMP, WEBP (uses OpenAI Vision API)
  - Code Files: JavaScript, Python, Java, C++, and more
  - Data Files: JSON, CSV, XML, YAML
  - Web Files: HTML, CSS, Markdown
- **Multi-language Support**: Spanish, French, German, Mandarin Chinese, Hindi → English
- **Smart Text Extraction**: Automatically detects file type and extracts text appropriately
- **Real-time Translation**: Powered by OpenAI GPT-3.5-turbo
- **Reverse Translation**: Verify accuracy by translating back to source language

### Cost Monitoring
- **Real-time API Cost Tracking**: Monitor costs per translation in real-time
- **Session vs Accumulated Data**: Separate tracking for current session and all-time totals
- **Comprehensive Dashboard**: Visualize costs by service, model, and document
- **Daily Cost Trends**: Track spending patterns over time
- **Cache Performance**: Monitor cache hit rates and cost savings
- **Service Breakdown**: Detailed analytics by AI service provider

### User Management
- **User Authentication**: Secure JWT-based authentication
- **Session-based Access**: Sessions clear on browser close/refresh
- **Cost Quota Management**: Set spending limits per user ($100 default)
- **Document History**: Track all translated documents per user

### User Experience
- **Animated UI**: Highlighted metrics with pulsating animations
- **Browser Navigation**: Full back/forward button support
- **Responsive Design**: Modern, gradient-based dark theme
- **Progress Tracking**: Real-time translation progress indicators

## Tech Stack

### Frontend
- **React** (Vite)
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Fetch API** for HTTP requests

### Backend
- **Node.js** with Express
- **JSON-based Database** (file-based, no compilation needed)
- **OpenAI API** (GPT-3.5-turbo, GPT-4o-mini Vision)
- **JWT Authentication**
- **Multer** for file uploads
- **Mammoth** (DOCX parsing)
- **PDF-Parse** (PDF text extraction)

## Installation

### Prerequisites
- Node.js 16+ and npm
- OpenAI API Key

### 1. Clone Repository
```bash
git clone <repository-url>
cd "Advance  Document  Translator"
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your-api-key-here
PORT=3000
JWT_SECRET=your-secret-key-here
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Run Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run server
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will open at `http://localhost:5173`

## Usage

1. **Register/Login**: Create an account or login
2. **Upload Document**: Drag & drop or click to browse any file
3. **Select Language**: Choose source language (auto-detect available)
4. **Translate**: Click "Translate Document" and wait for results
5. **Download**: Download translated text in your preferred format
6. **Monitor Costs**: View real-time costs in the dashboard

## API Cost Tracking

The application automatically tracks:
- Input/output tokens per translation
- Cost per API call (based on OpenAI pricing)
- Total accumulated costs per user
- Session-specific spending
- Cache performance metrics

View detailed analytics in the **API Cost Monitoring Dashboard**.

## Project Structure

```
Advance  Document  Translator/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth, upload middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # OpenAI service
│   ├── scripts/         # Utility scripts
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── TranslatorTool.jsx          # Main component
│   │   ├── CostMonitoringDashboard.jsx # Analytics dashboard
│   │   ├── index.css                    # Global styles
│   │   └── main.jsx                     # Entry point
│   └── index.html
└── README.md
```

## Documentation

Additional guides available in the root directory:
- `API_COST_MONITORING_GUIDE.md` - Cost tracking setup
- `QUICK_START_COST_TRACKING.md` - Quick start guide
- `DEPLOYMENT.md` - Deployment instructions
- `LATEST_UPDATES.md` - Recent changes and updates

## Security

- API keys stored in `.env` files (never committed)
- JWT-based authentication
- Session-based access control
- Database files excluded from version control
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the GitHub repository.
