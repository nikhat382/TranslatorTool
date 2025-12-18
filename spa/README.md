# Translatrix Pro - SPA

AI-Powered Document Translation Single Page Application

## 📍 Location

```
C:\Users\Administrator\Desktop\Advance  Document  Translator\spa\
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd "C:\Users\Administrator\Desktop\Advance  Document  Translator\spa"
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The SPA will open automatically at: **http://localhost:3000**

### 3. Start Backend Server

In a **separate terminal**, start the backend:

```bash
cd "C:\Users\Administrator\Desktop\Advance  Document  Translator\backend"
npm start
```

Backend runs at: **http://localhost:5000**

## 🎯 Features

- ✅ **Drag & Drop Upload** - Easy file uploads
- ✅ **Multi-Language Support** - Spanish, French, German, Mandarin, Hindi → English
- ✅ **Real-time Translation** - AI-powered translation
- ✅ **Performance Metrics** - Accuracy, latency, throughput
- ✅ **Multiple Export Formats** - TXT, JSON downloads
- ✅ **Responsive Design** - Works on desktop & mobile
- ✅ **Modern UI** - Beautiful gradient design with Tailwind CSS

## 📦 Tech Stack

- **React 18** - UI Framework
- **Vite 5** - Build tool (ultra-fast)
- **Tailwind CSS** - Styling
- **Axios** - API calls
- **Lucide React** - Icons

## 📁 Project Structure

```
spa/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   └── Translator.jsx   # Main translator component
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
└── tailwind.config.js       # Tailwind configuration
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🌐 Supported File Formats

- **Images**: JPG, JPEG
- **Documents**: PDF, TXT
- **Data**: JSON

## 🌍 Supported Languages

- Spanish → English 🇪🇸 → 🇬🇧
- French → English 🇫🇷 → 🇬🇧
- German → English 🇩🇪 → 🇬🇧
- Mandarin Chinese → English 🇨🇳 → 🇬🇧
- Hindi → English 🇮🇳 → 🇬🇧

## 📊 Performance

- **Accuracy**: >95%
- **Speed**: Real-time processing
- **File Size**: Up to 50MB

## 🏗️ Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

## 📝 Notes

- Make sure the backend server is running on port 5000
- The SPA will run on port 3000 by default
- All translations require an internet connection for AI processing

## 📧 Support

**SPECTRA AI Pte. Ltd.**
- Email: info@spectrai.sg
- Location: Singapore

---

© 2024 SPECTRA AI Pte. Ltd. - All Rights Reserved
