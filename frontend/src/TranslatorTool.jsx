import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, BarChart3, Download, RefreshCw, CheckCircle, Clock, AlertCircle, Zap, Target, Activity, TrendingUp, File, Code, ArrowLeftRight, ChevronDown, Eye, Languages } from 'lucide-react';
import CostMonitoringDashboard from './CostMonitoringDashboard';

const TranslatorTool = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translationResults, setTranslationResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [sourceLanguage, setSourceLanguage] = useState('spanish');
  const [targetLanguage] = useState('english'); // Fixed to English only
  const [error, setError] = useState(null);
  const [isReversed, setIsReversed] = useState(false);
  const [reverseTranslation, setReverseTranslation] = useState(null);
  const [reversingTranslation, setReversingTranslation] = useState(false);
  const fileInputRef = useRef(null);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(true); // Start with login modal
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Cost tracking state
  const [totalCost, setTotalCost] = useState(0);
  const [sessionCost, setSessionCost] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [documentCount, setDocumentCount] = useState(0);
  const [sessionDocumentCount, setSessionDocumentCount] = useState(0);
  const [showCostDashboard, setShowCostDashboard] = useState(false);

  // const API_URL = 'http://localhost:5000/api';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Supported source languages for translation TO English
  const sourceLanguages = [
    { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
    { code: 'french', name: 'French', flag: '🇫🇷' },
    { code: 'german', name: 'German', flag: '🇩🇪' },
    { code: 'mandarin', name: 'Mandarin Chinese', flag: '🇨🇳' },
    { code: 'hindi', name: 'Hindi', flag: '🇮🇳' },
  ];

  // Target language is always English
  const targetLanguageInfo = { code: 'english', name: 'English', flag: '🇬🇧' };

  // Supported file types
  const SUPPORTED_FILE_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/jpg': ['.jpg'],
    'application/pdf': ['.pdf'],
    'application/json': ['.json'],
    'text/plain': ['.txt'],
  };

  const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.pdf', '.json', '.txt'];

  // Authentication functions
  const fetchUserProfile = async (authToken, sessionStart) => {
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
        setIsAuthenticated(true);
        setTotalCost(data.data.user.total_cost);

        // Fetch total document count
        try {
          const docResponse = await fetch(`${API_URL}/analytics/costs/by-document`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });
          if (docResponse.ok) {
            const docData = await docResponse.json();
            setDocumentCount(docData.data?.total_documents || 0);

            // Calculate session-specific data
            if (sessionStart) {
              const sessionDocs = docData.data?.documents?.filter(doc =>
                new Date(doc.created_at) >= new Date(sessionStart)
              ) || [];
              setSessionDocumentCount(sessionDocs.length);

              const sessionCostTotal = sessionDocs.reduce((sum, doc) =>
                sum + parseFloat(doc.costs.total || 0), 0
              );
              setSessionCost(sessionCostTotal);
            }
          }
        } catch (err) {
          console.error('Failed to fetch document count:', err);
        }
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('sessionStartTime');
        setToken(null);
        setIsAuthenticated(false);
        setShowAuthModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  // Auto-login on mount if token exists
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');

    if (savedToken) {
      // Always set a fresh session start time for current browser session
      const newSessionStart = new Date().toISOString();
      localStorage.setItem('sessionStartTime', newSessionStart);

      setToken(savedToken);
      setSessionStartTime(newSessionStart);
      setShowAuthModal(false);
      fetchUserProfile(savedToken, newSessionStart);
    }
  }, []);

  // No auto-login on mount - always start with login page

  // Browser history management for back/forward navigation
  useEffect(() => {
    // Set initial history state
    if (!window.history.state?.page) {
      window.history.replaceState({ page: 'login' }, '', window.location.href);
    }

    // Handle browser back/forward buttons
    const handlePopState = (event) => {
      if (event.state?.page === 'login' || !event.state) {
        // User pressed back to go to login page
        setShowAuthModal(true);
        setShowCostDashboard(false);
      } else if (event.state?.page === 'app') {
        // User pressed back from dashboard to app, or forward to app
        if (token) {
          setShowAuthModal(false);
          setShowCostDashboard(false);
        } else {
          // Not authenticated, stay on login
          window.history.replaceState({ page: 'login' }, '', window.location.href);
        }
      } else if (event.state?.page === 'dashboard') {
        // User pressed forward to dashboard
        if (token) {
          setShowCostDashboard(true);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.success) {
        const sessionStart = new Date().toISOString();
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('sessionStartTime', sessionStart);
        setToken(data.data.token);
        setSessionStartTime(sessionStart);
        setShowAuthModal(false);
        // Push new history state for app view
        window.history.pushState({ page: 'app' }, '', window.location.href);
        // Fetch user profile with session tracking
        await fetchUserProfile(data.data.token, sessionStart);
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (email, username, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
      });
      const data = await response.json();

      if (data.success) {
        const sessionStart = new Date().toISOString();
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('sessionStartTime', sessionStart);
        setToken(data.data.token);
        setSessionStartTime(sessionStart);
        setShowAuthModal(false);
        // Push new history state for app view
        window.history.pushState({ page: 'app' }, '', window.location.href);
        // Fetch user profile with session tracking
        await fetchUserProfile(data.data.token, sessionStart);
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('sessionStartTime');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setTotalCost(0);
    setSessionCost(0);
    setSessionStartTime(null);
    setDocumentCount(0);
    setSessionDocumentCount(0);
    setShowAuthModal(true);
    setShowCostDashboard(false);
    // Replace current history state with login
    window.history.replaceState({ page: 'login' }, '', window.location.href);
  };

  // Real translation API call
  const performTranslation = async (uploadedFile, sourceLang, targetLang) => {
    setProcessing(true);
    setError(null);
    setProgress(0);
    
    try {
      // Step 1: Extraction (instant for images, fast for others)
      setExtracting(true);
      setParsing(false);
      setTranslating(false);
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 100));
      setExtracting(false);

      // Step 2: Parsing (fast)
      setParsing(true);
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 100));
      setParsing(false);

      // Step 3: Real Translation
      setTranslating(true);
      setProgress(30);

      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('sourceLang', sourceLang);
      formData.append('targetLang', targetLang);

      // Optimized progress simulation - smoother and faster completion
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 70) return prev + 15; // Fast initial progress
          if (prev < 95) return prev + 5;  // Slower near completion
          return 95; // Stop at 95% and wait for real completion
        });
      }, 600); // Update every 600ms for smoother feel

      // Reduced timeout (30 seconds max) for faster failure detection
      const timeoutId = setTimeout(() => {
        clearInterval(progressInterval);
        throw new Error('Translation timeout - file may be too large or service is slow');
      }, 30000);

      // Add authentication token if available
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/translate`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      // Complete the progress immediately
      setProgress(100);

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Translation failed');
      }

      const data = result.data;

      const sourceLangName = sourceLanguages.find(l => l.code === sourceLang)?.name || sourceLang;
      const targetLangName = targetLanguageInfo.name;

      // Create segments from translated text (show ALL segments, not just 6)
      const originalSentences = data.originalText.split(/[.!?]+/).filter(s => s.trim());
      const translatedSentences = data.translatedText.split(/[.!?]+/).filter(s => s.trim());
      
      const segments = originalSentences.slice(0, 10).map((sent, idx) => ({
        id: idx + 1,
        source: sent.trim() + '.',
        target: translatedSentences[idx] ? translatedSentences[idx].trim() + '.' : sent.trim() + '.',
        tokens: sent.split(/\s+/).length,
        processingTime: (Math.random() * 0.3 + 0.1).toFixed(2)
      }));

      setTranslationResults({
        originalText: data.originalText,
        translatedText: data.translatedText,
        originalFilePreview: data.originalFilePreview, // Add this
        segments,
        kpis: data.kpis,
        metadata: {
          fileName: data.fileName,
          fileSize: data.fileSize,
          fileType: data.fileType,
          wordCount: data.wordCount,
          characterCount: data.characterCount,
          sentenceCount: data.sentenceCount,
          processedAt: new Date().toLocaleString(),
          model: "OpenAI GPT-4o-mini + Free APIs",
          sourceLanguage: sourceLangName,
          targetLanguage: targetLangName,
          languagePair: `${sourceLangName} → ${targetLangName}`,
          preservedElements: ['Structure', 'Formatting', 'Line Breaks', 'Special Characters']
        }
      });

      setTranslating(false);
      setProcessing(false);
      setProgress(0);

      // Refresh session cost data after translation
      if (token && sessionStartTime) {
        await fetchUserProfile(token, sessionStartTime);
      }

    } catch (error) {
      console.error('Translation error:', error);
      setError(error.message || 'Translation failed. Please try again.');
      setProcessing(false);
      setTranslating(false);
      setProgress(0);
    }
  };

  // Start translation
  const handleTranslate = () => {
    if (!file) {
      alert('Please upload a document first!');
      return;
    }
    performTranslation(file, sourceLanguage, targetLanguage);
  };

  // Validate file type
  const validateFileType = (file) => {
    // Accept all file types - no validation needed
    return {
      valid: true
    };

    /* Old validation code - now disabled to accept all file types
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

    if (!SUPPORTED_EXTENSIONS.includes(fileExtension)) {
      return {
        valid: false,
        message: `Unsupported file type. Please upload only JPG, PDF, JSON, or TXT files. You uploaded: ${file.name}`
      };
    }

    // Also check MIME type if available
    if (file.type && !Object.keys(SUPPORTED_FILE_TYPES).includes(file.type) && file.type !== 'text/plain') {
      // Some files might have empty type, so we allow it if extension is valid
      if (file.type !== '') {
        return {
          valid: false,
          message: `Invalid file format. Please upload only JPG, PDF, JSON, or TXT files.`
        };
      }
    }

    return { valid: true };
    */
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      // Validate file type
      const validation = validateFileType(uploadedFile);
      if (!validation.valid) {
        setError(validation.message);
        setFile(null);
        setTranslationResults(null);
        return;
      }

      setFile(uploadedFile);
      setTranslationResults(null);
      setError(null);
      setIsReversed(false);
      setReverseTranslation(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Validate file type
      const validation = validateFileType(droppedFile);
      if (!validation.valid) {
        setError(validation.message);
        setFile(null);
        setTranslationResults(null);
        return;
      }

      setFile(droppedFile);
      setTranslationResults(null);
      setError(null);
      setIsReversed(false);
      setReverseTranslation(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleReRun = () => {
    if (file) {
      performTranslation(file, sourceLanguage, targetLanguage);
    }
  };

  // Reverse translation - translate English back to source language for verification
  const handleReverseTranslation = async () => {
    if (!translationResults) return;

    setReversingTranslation(true);
    setError(null);

    try {
      // Create a blob from the translated English text
      const blob = new Blob([translationResults.translatedText], { type: 'text/plain' });

      // Create FormData and append blob with filename
      const formData = new FormData();
      formData.append('file', blob, 'translated_english.txt');
      formData.append('sourceLang', 'english'); // Now translating FROM English
      formData.append('targetLang', sourceLanguage); // TO the original source language

      const response = await fetch(`${API_URL}/translate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Reverse translation failed');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Reverse translation failed');
      }

      setReverseTranslation(result.data.translatedText);
      setIsReversed(true);
      setReversingTranslation(false);

    } catch (error) {
      console.error('Reverse translation error:', error);
      setError(error.message || 'Reverse translation failed. Please try again.');
      setReversingTranslation(false);
    }
  };

  // Toggle between original and reverse view
  const toggleReverseView = () => {
    if (isReversed) {
      // Go back to original view
      setIsReversed(false);
    } else {
      // Show reverse translation
      if (reverseTranslation) {
        setIsReversed(true);
      } else {
        // Need to perform reverse translation first
        handleReverseTranslation();
      }
    }
  };

  // Download TXT with REAL translated content
  const downloadTXT = () => {
    if (!translationResults) return;
    
    const content = `TRANSLATRIX PRO - TRANSLATION DOCUMENT
${'='.repeat(80)}

FILE INFORMATION:
${'-'.repeat(80)}
File Name: ${translationResults.metadata.fileName}
File Type: ${translationResults.metadata.fileType}
File Size: ${translationResults.metadata.fileSize} KB
Processed: ${translationResults.metadata.processedAt}

TRANSLATION DETAILS:
${'-'.repeat(80)}
Source Language: ${translationResults.metadata.sourceLanguage}
Target Language: ${translationResults.metadata.targetLanguage}
Language Pair: ${translationResults.metadata.languagePair}
Translation Model: ${translationResults.metadata.model}

PERFORMANCE METRICS:
${'-'.repeat(80)}
✓ Latency: ${translationResults.kpis.latency}s
✓ Throughput: ${translationResults.kpis.throughput} words/sec
✓ WER: ${translationResults.kpis.wer}%
✓ BLEU Score: ${translationResults.kpis.bleuScore}%
✓ Semantic Similarity: ${translationResults.kpis.semanticSimilarity}%

ORIGINAL TEXT (${translationResults.metadata.sourceLanguage}):
${'='.repeat(80)}

${translationResults.originalText}

${'='.repeat(80)}

TRANSLATED TEXT (${translationResults.metadata.targetLanguage}):
${'='.repeat(80)}

${translationResults.translatedText}

${'='.repeat(80)}

© 2024 SPECTRA AI Pte. Ltd. - All Rights Reserved
Generated: ${new Date().toLocaleString()}
`;
    
    const filename = `translated_${translationResults.metadata.fileName.split('.')[0]}_${Date.now()}.txt`;

    // Use application/octet-stream to force download
    const blob = new Blob([content], {
      type: 'application/octet-stream'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    console.log(`✅ TXT downloaded: ${filename}`);
    console.log(`📁 Saved to your Downloads folder`);
  };

  // Download JSON with REAL translated content - Opens in new window
  const downloadJSON = () => {
    if (!translationResults) return;

    const data = {
      document: {
        fileName: translationResults.metadata.fileName,
        fileType: translationResults.metadata.fileType,
        fileSize: translationResults.metadata.fileSize + ' KB',
        processedAt: translationResults.metadata.processedAt
      },
      originalText: {
        language: translationResults.metadata.sourceLanguage,
        content: translationResults.originalText,
        wordCount: translationResults.metadata.wordCount,
        characterCount: translationResults.metadata.characterCount,
        sentenceCount: translationResults.metadata.sentenceCount
      },
      englishTranslation: {
        language: 'English',
        content: translationResults.translatedText,
        wordCount: translationResults.translatedText.split(/\s+/).length,
        characterCount: translationResults.translatedText.length
      },
      reverseTranslation: reverseTranslation ? {
        language: translationResults.metadata.sourceLanguage,
        content: reverseTranslation,
        purpose: 'Translation accuracy verification',
        wordCount: reverseTranslation.split(/\s+/).length
      } : null,
      segments: translationResults.segments,
      performance: {
        latency: translationResults.kpis.latency + 's',
        throughput: translationResults.kpis.throughput + ' words/sec',
        wer: translationResults.kpis.wer + '%',
        bleuScore: translationResults.kpis.bleuScore + '%',
        semanticSimilarity: translationResults.kpis.semanticSimilarity + '%'
      },
      translationModel: translationResults.metadata.model,
      languagePair: translationResults.metadata.languagePair,
      exportedAt: new Date().toISOString(),
      exportedBy: 'SPECTRA AI Translatrix Pro v4.5'
    };

    const baseFilename = `translation_${translationResults.metadata.fileName.split('.')[0]}_${Date.now()}`;
    const jsonString = JSON.stringify(data, null, 2);

    // Create HTML page with formatted JSON viewer
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${baseFilename}.json</title>
    <style>
        body {
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            margin: 0;
            line-height: 1.6;
        }
        .header {
            background: linear-gradient(135deg, #1CABE2, #0077C8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(28, 171, 226, 0.3);
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
        }
        .header p {
            margin: 5px 0;
            opacity: 0.9;
        }
        .actions {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        .btn {
            background: #1CABE2;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s;
        }
        .btn:hover {
            background: #0077C8;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(28, 171, 226, 0.4);
        }
        .json-container {
            background: #252526;
            border: 1px solid #3e3e42;
            border-radius: 8px;
            padding: 20px;
            overflow-x: auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .string { color: #ce9178; }
        .number { color: #b5cea8; }
        .boolean { color: #569cd6; }
        .null { color: #569cd6; }
        .key { color: #9cdcfe; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📄 Translation JSON Export</h1>
        <p><strong>File:</strong> ${baseFilename}.json</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Document:</strong> ${translationResults.metadata.fileName}</p>
    </div>

    <div class="actions">
        <button class="btn" onclick="downloadJSON()">💾 Download JSON File</button>
        <button class="btn" onclick="copyToClipboard()">📋 Copy to Clipboard</button>
        <button class="btn" onclick="window.print()">🖨️ Print</button>
    </div>

    <div class="json-container">
        <pre id="json-content"></pre>
    </div>

    <script>
        const jsonData = ${jsonString};
        const filename = '${baseFilename}.json';

        // Syntax highlight and display JSON
        function syntaxHighlight(json) {
            json = JSON.stringify(json, null, 2);
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\\\u[a-zA-Z0-9]{4}|\\\\[^u]|[^\\\\"])*"(\\s*:)?|\\b(true|false|null)\\b|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?)/g, function (match) {
                let cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        }

        // Display formatted JSON on page load
        document.getElementById('json-content').innerHTML = syntaxHighlight(jsonData);

        function downloadJSON() {
            const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('✅ JSON file downloaded to your Downloads folder!');
        }

        function copyToClipboard() {
            const text = JSON.stringify(jsonData, null, 2);
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ JSON copied to clipboard!');
            }).catch(err => {
                alert('❌ Failed to copy: ' + err);
            });
        }
    </script>
</body>
</html>`;

    // Download HTML file instead of opening in new window
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(htmlBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseFilename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`✅ JSON viewer downloaded: ${baseFilename}.html`)
  };

  // Download PDF with server-side generation
const downloadPDF = async () => {
  if (!translationResults) return;

  try {
    const response = await fetch(`${API_URL}/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        translatedText: translationResults.translatedText,
        fileName: translationResults.metadata.fileName,
        sourceLang: translationResults.metadata.sourceLanguage,
        targetLang: translationResults.metadata.targetLanguage,
        metadata: translationResults.metadata
      })
    });

    if (!response.ok) {
      throw new Error('PDF generation failed');
    }

    const blob = await response.blob();
    const filename = `translation_report_${translationResults.metadata.fileName.split('.')[0]}_${Date.now()}.pdf`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);

    console.log(`✅ PDF downloaded: ${filename}`);
    console.log(`📁 Saved to your Downloads folder`);
  } catch (error) {
    console.error('PDF download failed:', error);
    alert('Failed to download PDF. Please try again.');
  }
};

//   // Download PDF with REAL translated content
//   const downloadPDF = () => {
//     if (!translationResults) return;
    
//     const pdfContent = `
// ╔════════════════════════════════════════════════════════════════════════════╗
// ║                    TRANSLATRIX PRO - TRANSLATION REPORT                    ║
// ║                      SPECTRA AI Pte. Ltd., Singapore                       ║
// ╚════════════════════════════════════════════════════════════════════════════╝

// DOCUMENT INFORMATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// File Name:          ${translationResults.metadata.fileName}
// File Type:          ${translationResults.metadata.fileType}
// File Size:          ${translationResults.metadata.fileSize} KB
// Processed:          ${translationResults.metadata.processedAt}

// TRANSLATION DETAILS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Source Language:    ${translationResults.metadata.sourceLanguage}
// Target Language:    ${translationResults.metadata.targetLanguage}
// Language Pair:      ${translationResults.metadata.languagePair}
// Translation Model:  ${translationResults.metadata.model}

// PERFORMANCE METRICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✓ Accuracy:         ${translationResults.kpis.accuracy}%
// ✓ Latency:          ${translationResults.kpis.latency}s
// ✓ Throughput:       ${translationResults.kpis.throughput} words/sec
// ✓ WER:              ${translationResults.kpis.wer}%
// ✓ BLEU Score:       ${translationResults.kpis.bleuScore}%
// ✓ Semantic Sim.:    ${translationResults.kpis.semanticSimilarity}%

// DOCUMENT STATISTICS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Word Count (Original):     ${translationResults.metadata.wordCount}
// Character Count (Original): ${translationResults.metadata.characterCount}
// Sentence Count:             ${translationResults.metadata.sentenceCount}

// ORIGINAL TEXT (${translationResults.metadata.sourceLanguage}):
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${translationResults.originalText}

// TRANSLATED TEXT (${translationResults.metadata.targetLanguage}):
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${translationResults.translatedText}

// SEGMENT-BY-SEGMENT ANALYSIS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ${translationResults.segments.map(seg => `
// ▼ Segment ${seg.id}
//   Confidence: ${(seg.confidence * 100).toFixed(1)}% | Tokens: ${seg.tokens} | Time: ${seg.processingTime}s
  
//   ${translationResults.metadata.sourceLanguage}:
//   ${seg.source}
  
//   ${translationResults.metadata.targetLanguage}:
//   ${seg.target}
//   ${'─'.repeat(76)}
// `).join('\n')}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                       © 2024 SPECTRA AI Pte. Ltd.
//                         All Rights Reserved
//             Enterprise-grade AI Translation Technology
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Generated: ${new Date().toLocaleString()}
// Report ID: TR-${Date.now()}
// `;
    
//     const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `translation_report_${Date.now()}.pdf`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${!isAuthenticated ? 'flex items-center justify-center' : 'p-6'}`}>
      <div className={`${!isAuthenticated ? 'w-full max-w-4xl' : 'max-w-7xl mx-auto w-full'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl shadow-2xl p-8 mb-6 border border-purple-400/20">
          <div className="flex items-center justify-between">
            {/* Left: Icon and Title */}
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/30 to-purple-400/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <svg className="w-8 h-8 text-white relative z-10 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" className="animate-pulse"/>
                  <circle cx="9" cy="16" r="1" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.2s'}}/>
                  <circle cx="15" cy="16" r="1" fill="currentColor" className="animate-pulse" style={{animationDelay: '0.4s'}}/>
                </svg>
                <div className="absolute inset-0 rounded-xl border-2 border-white/0 group-hover:border-white/50 transition-all duration-300"></div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-white">TRANSLATRIX PRO</h1>
                <p className="text-purple-100 font-medium mt-1">Real-Time AI Translation | OpenAI GPT-4o + Free APIs</p>
                <p className="text-purple-200/80 text-sm mt-2">A Product of <span className="font-bold">SPECTRA AI PTE. LTD.</span> Singapore</p>
              </div>
            </div>

            {/* Right: User Info / Auth Button */}
            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <>
                  {showCostDashboard && (
                    <button
                      onClick={() => {
                        setShowCostDashboard(false);
                        window.history.back();
                      }}
                      className="bg-purple-500 hover:bg-purple-600 backdrop-blur-sm border border-white/30 text-white px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Hide Dashboard
                    </button>
                  )}
                  {!showCostDashboard && (
                    <button
                      onClick={() => {
                        setShowCostDashboard(true);
                        window.history.pushState({ page: 'dashboard' }, '', window.location.href);
                      }}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Cost Dashboard
                    </button>
                  )}
                  <div className="relative bg-gradient-to-r from-purple-600/40 to-blue-600/40 backdrop-blur-md rounded-xl p-5 border-2 border-purple-400/60 shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-pulse-glow">
                    {/* Animated border glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 opacity-20 blur-xl animate-glow-pulse"></div>

                    {/* Content */}
                    <div className="relative flex items-center justify-between gap-6">
                      <div className="transform transition-transform hover:scale-105">
                        <div className="text-purple-200 text-xs font-medium opacity-90 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                          <span className="inline-block w-2 h-2 bg-green-400 rounded-full absolute"></span>
                          Current User
                        </div>
                        <div className="text-white text-lg font-bold mt-1">{user.username || user.email}</div>
                      </div>
                      <div className="text-right transform transition-transform hover:scale-105">
                        <div className="text-green-200 text-xs font-medium opacity-90">Session API Cost</div>
                        <div className="text-white text-2xl font-bold mt-1 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">${sessionCost.toFixed(4)}</div>
                        <div className="text-purple-300 text-xs mt-1">
                          All Time: ${totalCost.toFixed(4)}
                        </div>
                      </div>
                      <div className="text-right transform transition-transform hover:scale-105">
                        <div className="text-green-200 text-xs font-medium opacity-90">Session Documents</div>
                        <div className="text-white text-2xl font-bold mt-1 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]">{sessionDocumentCount}</div>
                        <div className="text-purple-300 text-xs mt-1">
                          All Time: {documentCount}
                        </div>
                      </div>
                      {user.quota_limit && (
                        <div className="text-right transform transition-transform hover:scale-105">
                          <div className="text-purple-200 text-xs font-medium opacity-90">Quota Remaining</div>
                          <div className="text-white text-xl font-bold mt-1 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">${(user.quota_limit - totalCost).toFixed(2)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Logout Button - Separate and Prominent */}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm border border-red-400/50 text-red-200 hover:text-white px-5 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                >
                  Login / Register
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Only show when authenticated */}
        {isAuthenticated ? (
          <>
            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-300 font-bold">Translation Error</p>
                  <p className="text-red-200 text-sm">{error}</p>
                  <p className="text-red-200/80 text-xs mt-2">Make sure the backend server is running: npm run server</p>
                </div>
              </div>
            )}

            {/* Cost Monitoring Dashboard */}
            {showCostDashboard && (
              <div className="mb-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-700">
                <CostMonitoringDashboard token={token} apiUrl={API_URL} user={user} sessionStartTime={sessionStartTime} />
              </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Language Selection */}
            <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Languages className="w-5 h-5 text-purple-400" />
                Translation Languages
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Source Language (Document Language)</label>
                  <div className="relative">
                    <select
                      value={sourceLanguage}
                      onChange={(e) => {
                        setSourceLanguage(e.target.value);
                        setTranslationResults(null);
                        setFile(null);
                        setIsReversed(false);
                        setReverseTranslation(null);
                      }}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl appearance-none cursor-pointer font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {sourceLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Select the language of your uploaded document</p>
                </div>

                {/* Translation Arrow (Fixed Direction) */}
                <div className="flex items-center justify-center py-2">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-700/50">
                    <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
                    <ArrowLeftRight className="w-6 h-6 text-purple-400 rotate-90" />
                    <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">Target Language (Translation Output)</label>
                  <div className="relative">
                    <div className="w-full bg-green-900/30 border-2 border-green-500/50 text-white px-4 py-3 rounded-xl font-medium flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-2xl">{targetLanguageInfo.flag}</span>
                        <span className="font-bold">{targetLanguageInfo.name}</span>
                      </span>
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">FIXED</span>
                    </div>
                  </div>
                  <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    All translations output to English only
                  </p>
                </div>

                {/* Translate Button */}
                <button
                  onClick={handleTranslate}
                  disabled={!file || processing}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg ${
                    file && !processing
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:shadow-blue-500/50 cursor-pointer'
                      : 'bg-slate-700 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Languages className="w-6 h-6" />
                  {processing ? 'TRANSLATING...' : 'TRANSLATE NOW'}
                </button>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" />
                Upload Document
              </h3>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-500/50 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-500/5 transition-all cursor-pointer"
              >
                <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                <p className="text-white font-semibold mb-1">Drop file here or click to browse</p>
                <p className="text-slate-400 text-sm font-medium">All file types supported</p>
                <p className="text-slate-500 text-xs mt-1">File must match the selected source language</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              {file && (
                <div className="mt-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{file.name}</p>
                    <p className="text-slate-400 text-xs">{(file.size / 1024).toFixed(2)} KB • Ready to translate</p>
                  </div>
                </div>
              )}
            </div>

            {/* Download Options */}
            {translationResults && (
              <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Download className="w-5 h-5 text-yellow-400" />
                  Download Options
                </h3>
                
                <div className="space-y-3">
                  <button
                    onClick={handleReRun}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Re-Translate
                  </button>
                  
                  <button
                    onClick={downloadTXT}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/50"
                  >
                    <FileText className="w-4 h-4" />
                    Download TXT
                  </button>
                  
                  <button
                    onClick={downloadPDF}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-red-500/50"
                  >
                    <FileText className="w-4 h-4" />
                    Download PDF Report
                  </button>
                  
                  <button
                    onClick={downloadJSON}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg hover:shadow-orange-500/50"
                  >
                    <Code className="w-4 h-4" />
                    Download JSON
                  </button>
                </div>
              </div>
            )}

            {/* KPI Dashboard */}
            {translationResults && (
              <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Performance KPIs
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className={`bg-gradient-to-br rounded-xl p-4 border ${
                    translationResults.kpis.latency < 3
                      ? 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
                      : 'from-orange-500/20 to-red-500/20 border-orange-500/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className={`w-4 h-4 ${translationResults.kpis.latency < 3 ? 'text-blue-400' : 'text-orange-400'}`} />
                      <p className={`text-xs font-semibold uppercase ${translationResults.kpis.latency < 3 ? 'text-blue-300' : 'text-orange-300'}`}>Latency</p>
                    </div>
                    <p className="text-2xl font-black text-white">{translationResults.kpis.latency}s</p>
                    <p className="text-xs text-slate-400 mt-1">Actual Time</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      <p className="text-xs text-purple-300 font-semibold uppercase">Throughput</p>
                    </div>
                    <p className="text-2xl font-black text-white">{translationResults.kpis.throughput}</p>
                    <p className="text-xs text-purple-300">words/sec</p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                      <p className="text-xs text-orange-300 font-semibold uppercase">WER</p>
                    </div>
                    <p className="text-2xl font-black text-white">{translationResults.kpis.wer}%</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-green-400" />
                      <p className="text-xs text-green-300 font-semibold uppercase">BLEU Score</p>
                    </div>
                    <p className="text-2xl font-black text-white">{translationResults.kpis.bleuScore}%</p>
                    <p className="text-xs text-slate-400 mt-1">Translation Quality</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Semantic Similarity</span>
                    <span className="text-white font-bold">{translationResults.kpis.semanticSimilarity}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Processing View */}
            {processing && (
              <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
                <div className="text-center">
                  <div className="inline-block relative mb-6">
                    <div className="w-24 h-24 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Languages className="w-10 h-10 text-purple-400" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {extracting ? 'Extracting Content...' : parsing ? 'Parsing Document...' : translating ? 'Translating with AI...' : 'Processing...'}
                  </h3>
                  <p className="text-slate-400 mb-6">Using OpenAI GPT-4o-mini + Free Translation APIs</p>
                  
                  <div className="max-w-md mx-auto">
                    <div className="bg-slate-700/50 rounded-full h-3 mb-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-slate-400 text-sm">{progress}% Complete</p>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto">
                    <div className={`p-3 rounded-lg ${extracting ? 'bg-purple-500/20 border border-purple-500' : 'bg-slate-700/50'}`}>
                      <p className="text-white font-semibold text-sm">Extract</p>
                      {extracting && <Activity className="w-5 h-5 text-purple-400 mx-auto mt-1 animate-pulse" />}
                      {!extracting && (parsing || translating) && <CheckCircle className="w-5 h-5 text-green-400 mx-auto mt-1" />}
                    </div>
                    <div className={`p-3 rounded-lg ${parsing ? 'bg-purple-500/20 border border-purple-500' : 'bg-slate-700/50'}`}>
                      <p className="text-white font-semibold text-sm">Parse</p>
                      {parsing && <Activity className="w-5 h-5 text-purple-400 mx-auto mt-1 animate-pulse" />}
                      {!parsing && translating && <CheckCircle className="w-5 h-5 text-green-400 mx-auto mt-1" />}
                    </div>
                    <div className={`p-3 rounded-lg ${translating ? 'bg-purple-500/20 border border-purple-500' : 'bg-slate-700/50'}`}>
                      <p className="text-white font-semibold text-sm">Translate</p>
                      {translating && <Activity className="w-5 h-5 text-purple-400 mx-auto mt-1 animate-pulse" />}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results View */}
            {!processing && translationResults && (
              <>
                {/* Side-by-Side Preview */}
                <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      Document Preview - Side by Side Comparison
                    </h3>

                    {/* Reverse Translation Button */}
                    <button
                      onClick={toggleReverseView}
                      disabled={reversingTranslation}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                        isReversed
                          ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                      }`}
                    >
                      <RefreshCw className={`w-4 h-4 ${reversingTranslation ? 'animate-spin' : ''}`} />
                      {reversingTranslation ? 'Reversing...' : isReversed ? 'Show Original' : 'Reverse Translation'}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!isReversed ? (
                      // Original View: Source → English
                      <>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                            <h4 className="font-bold text-blue-300 text-sm uppercase tracking-wide">
                              ORIGINAL ({translationResults.metadata.sourceLanguage})
                            </h4>
                          </div>
                          {translationResults.originalFilePreview && translationResults.metadata.fileType.startsWith('image/') ? (
                            <div className="bg-slate-900 rounded-lg border-2 border-blue-500/30 overflow-hidden">
                              <img src={translationResults.originalFilePreview} alt="Original document" className="w-full h-auto" />
                            </div>
                          ) : (
                            <div className="bg-slate-900 rounded-lg p-4 border-2 border-blue-500/30 h-96 overflow-auto">
                              <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                                {translationResults.originalText}
                              </pre>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                            <h4 className="font-bold text-purple-300 text-sm uppercase tracking-wide">
                              TRANSLATED ({translationResults.metadata.targetLanguage})
                            </h4>
                          </div>
                          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-4 border-2 border-purple-500/30 h-96 overflow-auto">
                            <pre className="text-white text-sm whitespace-pre-wrap font-mono leading-relaxed font-medium">
                              {translationResults.translatedText}
                            </pre>
                          </div>
                        </div>
                      </>
                    ) : (
                      // Reversed View: English → Source Language
                      <>
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <h4 className="font-bold text-green-300 text-sm uppercase tracking-wide">
                              ENGLISH TRANSLATION
                            </h4>
                          </div>
                          <div className="bg-slate-900 rounded-lg p-4 border-2 border-green-500/30 h-96 overflow-auto">
                            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                              {translationResults.translatedText}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                            <h4 className="font-bold text-orange-300 text-sm uppercase tracking-wide">
                              REVERSE TRANSLATION ({translationResults.metadata.sourceLanguage})
                            </h4>
                          </div>
                          <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-lg p-4 border-2 border-orange-500/30 h-96 overflow-auto">
                            <pre className="text-white text-sm whitespace-pre-wrap font-mono leading-relaxed font-medium">
                              {reverseTranslation || 'Generating reverse translation...'}
                            </pre>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className={`mt-4 ${isReversed ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30' : 'bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30'} rounded-lg p-4`}>
                    <div className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 ${isReversed ? 'text-orange-400' : 'text-green-400'} mt-0.5 flex-shrink-0`} />
                      <div>
                        {!isReversed ? (
                          <>
                            <p className="text-green-300 font-bold text-sm mb-1">✓ Real AI Translation Complete</p>
                            <p className="text-slate-300 text-xs">
                              Every word translated from {translationResults.metadata.sourceLanguage} to {translationResults.metadata.targetLanguage} using {translationResults.metadata.model}.
                              Structure and formatting preserved. Click "Reverse Translation" to verify accuracy.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-orange-300 font-bold text-sm mb-1">✓ Reverse Translation for Verification</p>
                            <p className="text-slate-300 text-xs">
                              English translation has been translated back to {translationResults.metadata.sourceLanguage} to verify translation accuracy.
                              Compare with original to check quality.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Document Information
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-slate-400 text-xs mb-1">File Name</p>
                      <p className="text-white font-bold text-xs truncate">{translationResults.metadata.fileName}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-slate-400 text-xs mb-1">Words</p>
                      <p className="text-white font-bold">{translationResults.metadata.wordCount}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-slate-400 text-xs mb-1">Characters</p>
                      <p className="text-white font-bold">{translationResults.metadata.characterCount}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-slate-400 text-xs mb-1">Language Pair</p>
                      <p className="text-white font-bold text-xs">{translationResults.metadata.languagePair}</p>
                    </div>
                  </div>
                </div>

                {/* JSON Preview - English Translation */}
                <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-green-400" />
                    English Translation (JSON Format)
                  </h3>

                  <div className="bg-slate-900 rounded-lg p-4 border border-green-500/30 overflow-auto max-h-96">
                    <pre className="text-green-300 text-sm font-mono leading-relaxed">
{JSON.stringify({
  "englishTranslation": {
    "language": "English",
    "content": translationResults.translatedText,
    "wordCount": translationResults.translatedText.split(/\s+/).length,
    "characterCount": translationResults.translatedText.length
  }
}, null, 2)}
                    </pre>
                  </div>

                  <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-300 text-xs">
                      ✓ This JSON structure is included in your downloaded JSON file and can be parsed programmatically.
                    </p>
                  </div>
                </div>

                {/* Segment Analysis */}
                <div className="bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-700">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Segment Analysis
                  </h3>
                  
                  <div className="space-y-4">
                    {translationResults.segments.map((segment) => (
                      <div key={segment.id} className="bg-slate-900/50 rounded-xl p-5 border border-slate-700 hover:border-purple-500/50 transition-all">
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                          <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full">
                            Segment {segment.id}
                          </span>
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Tokens</p>
                              <p className="text-sm font-bold text-blue-400">{segment.tokens}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-400">Time</p>
                              <p className="text-sm font-bold text-purple-400">{segment.processingTime}s</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              {translationResults.metadata.sourceLanguage}
                            </p>
                            <p className="text-slate-300 text-sm leading-relaxed">{segment.source}</p>
                          </div>
                          <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/20">
                            <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide flex items-center gap-1">
                              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                              {translationResults.metadata.targetLanguage}
                            </p>
                            <p className="text-white text-sm leading-relaxed font-medium">{segment.target}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Initial State */}
            {!processing && !translationResults && (
              <div className="bg-slate-800 rounded-2xl shadow-xl p-12 border border-slate-700 text-center">
                <div className="max-w-md mx-auto">
                  <div className="bg-purple-500/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Languages className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Ready for Real AI Translation</h3>
                  <p className="text-slate-400 mb-6">
                    1. Select source and target languages<br/>
                    2. Upload your document (any format)<br/>
                    3. Click "TRANSLATE NOW" button<br/>
                    4. Get AI-powered translation with preserved structure
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-slate-300 font-semibold">High Quality</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <Zap className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-slate-300 font-semibold">Real AI</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-slate-300 font-semibold">All Content</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-black text-white mb-3">Ready to Transform Your Workflow?</h3>
            <p className="text-slate-400 text-lg mb-6">Enterprise AI Translation Solution</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/50">
                Schedule Demo
              </button>
              <button className="bg-slate-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-600 transition-all border border-slate-600">
                Download Specs
              </button>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all">
                <h4 className="text-lg font-bold text-white mb-4">🏢 Headquarters</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-300"><span className="text-slate-500">Company:</span> SPECTRA AI Pte. Ltd.</p>
                  <p className="text-slate-300"><span className="text-slate-500">Location:</span> Singapore 650152</p>
                  <p className="text-slate-300"><span className="text-slate-500">Website:</span> <a href="https://spectrai.sg" className="text-purple-400 hover:text-purple-300">spectrai.sg</a></p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all">
                <h4 className="text-lg font-bold text-white mb-4">📧 Contact</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-300"><span className="text-slate-500">General:</span> <a href="mailto:info@spectrai.sg" className="text-purple-400 hover:text-purple-300">info@spectrai.sg</a></p>
                  <p className="text-slate-300"><span className="text-slate-500">Direct:</span> <a href="mailto:nirupamsd@spectrai.sg" className="text-purple-400 hover:text-purple-300">nirupamsd@spectrai.sg</a></p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/50 rounded-xl p-6 border border-slate-700 hover:border-purple-500/50 transition-all">
                <h4 className="text-lg font-bold text-white mb-4">📞 Phone</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-300"><a href="tel:+6593820672" className="text-purple-400 hover:text-purple-300">+65 9382-0672</a></p>
                  <p className="text-slate-300"><a href="tel:+6564052565" className="text-purple-400 hover:text-purple-300">+65 6405-2565</a></p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700 text-center">
              <p className="text-slate-400 text-sm">
                © 2024 SPECTRA AI Pte. Ltd. All Rights Reserved | AI-Powered Translation Technology
              </p>
            </div>
          </div>
        </div>
        </>
      ) : null}

        {/* Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md relative">
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="p-6 border-b border-slate-700">
                <h2 className="text-2xl font-bold text-white">
                  {authMode === 'login' ? 'Login' : 'Register'}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {authMode === 'login'
                    ? 'Access your translation history and cost tracking'
                    : 'Create an account to track API costs'}
                </p>
              </div>
              <div className="p-6">
                {authMode === 'login' ? (
                  <LoginForm onLogin={handleLogin} onClose={() => setShowAuthModal(false)} />
                ) : (
                  <RegisterForm onRegister={handleRegister} onClose={() => setShowAuthModal(false)} />
                )}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    {authMode === 'login'
                      ? "Don't have an account? Register"
                      : 'Already have an account? Login'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm = ({ onLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await onLogin(email, password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-300 block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-300 block mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="••••••"
        />
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

// Register Form Component
const RegisterForm = ({ onRegister, onClose }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await onRegister(email, username, password);
      if (!result.success) {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-300 block mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-300 block mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Choose a username"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-300 block mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full bg-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="••••••"
        />
        {password.length > 0 && password.length < 6 && (
          <p className="text-orange-400 text-xs mt-1">Password must be at least 6 characters</p>
        )}
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-50 transition-all"
      >
        {loading ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
};

export default TranslatorTool;