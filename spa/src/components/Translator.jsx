import { useState, useRef } from 'react'
import axios from 'axios'
import {
  Upload, FileText, Download, RefreshCw, Languages,
  CheckCircle, AlertCircle, Loader2, BarChart3,
  ArrowRight, Eye, X
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const LANGUAGES = [
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { code: 'french', name: 'French', flag: '🇫🇷' },
  { code: 'german', name: 'German', flag: '🇩🇪' },
  { code: 'mandarin', name: 'Mandarin Chinese', flag: '🇨🇳' },
  { code: 'hindi', name: 'Hindi', flag: '🇮🇳' },
]

const TARGET_LANGUAGE = { code: 'english', name: 'English', flag: '🇬🇧' }

export default function Translator() {
  const [file, setFile] = useState(null)
  const [sourceLanguage, setSourceLanguage] = useState('spanish')
  const [translating, setTranslating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  const [reverseTranslation, setReverseTranslation] = useState(null)
  const [reversingTranslation, setReversingTranslation] = useState(false)
  const [isReversed, setIsReversed] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setError(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      setResult(null)
      setError(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleTranslate = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setTranslating(true)
    setError(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sourceLang', sourceLanguage)
      formData.append('targetLang', 'english')

      const progressInterval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : 90))
      }, 400)

      const response = await axios.post(`${API_URL}/translate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (response.data.success) {
        setResult(response.data.data)
      } else {
        throw new Error(response.data.error || 'Translation failed')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Translation failed')
    } finally {
      setTranslating(false)
      setProgress(0)
    }
  }

  const downloadTXT = () => {
    if (!result) return

    const content = `TRANSLATRIX PRO - TRANSLATION REPORT
${'='.repeat(80)}

FILE: ${result.fileName}
SIZE: ${result.fileSize} KB
PROCESSED: ${result.metadata?.processedAt || new Date().toLocaleString()}

TRANSLATION:
${result.metadata?.sourceLanguage || sourceLanguage} → ${result.metadata?.targetLanguage || 'English'}

ORIGINAL TEXT:
${'-'.repeat(80)}
${result.originalText}

TRANSLATED TEXT:
${'-'.repeat(80)}
${result.translatedText}

${'='.repeat(80)}
© 2024 Translatrix Pro - AI Document Translation
Generated: ${new Date().toLocaleString()}
`

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `translation_${result.fileName}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadJSON = () => {
    if (!result) return

    const data = {
      translation: {
        source: {
          language: result.metadata?.sourceLanguage || sourceLanguage,
          text: result.originalText
        },
        target: {
          language: result.metadata?.targetLanguage || 'English',
          text: result.translatedText
        }
      },
      document: {
        fileName: result.fileName,
        fileType: result.fileType,
        fileSize: result.fileSize + ' KB'
      },
      performance: result.kpis,
      metadata: result.metadata,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `translation_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPDF = async () => {
    if (!result) return

    try {
      const response = await axios.post(`${API_URL}/generate-pdf`, {
        translatedText: result.translatedText,
        fileName: result.fileName,
        sourceLang: result.metadata?.sourceLanguage || sourceLanguage,
        targetLang: result.metadata?.targetLanguage || 'English',
        metadata: result.metadata
      }, {
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `translation_report_${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('PDF download failed:', error)
      setError('Failed to download PDF. Please try again.')
    }
  }

  const handleReverseTranslation = async () => {
    if (!result) return

    setReversingTranslation(true)
    setError(null)

    try {
      const blob = new Blob([result.translatedText], { type: 'text/plain' })
      const formData = new FormData()
      formData.append('file', blob, 'translated_english.txt')
      formData.append('sourceLang', 'english')
      formData.append('targetLang', sourceLanguage)

      const response = await axios.post(`${API_URL}/translate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      })

      if (response.data.success) {
        setReverseTranslation(response.data.data.translatedText)
        setIsReversed(true)
      } else {
        throw new Error(response.data.error || 'Reverse translation failed')
      }
    } catch (error) {
      console.error('Reverse translation error:', error)
      setError(error.response?.data?.error || error.message || 'Reverse translation failed')
    } finally {
      setReversingTranslation(false)
    }
  }

  const toggleReverseView = () => {
    if (isReversed) {
      setIsReversed(false)
    } else {
      if (reverseTranslation) {
        setIsReversed(true)
      } else {
        handleReverseTranslation()
      }
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Languages className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">TRANSLATRIX PRO</h1>
              <p className="text-purple-100 font-medium mt-1">AI-Powered Document Translation</p>
              <p className="text-purple-200 text-sm mt-1">SPECTRA AI Pte. Ltd. - Singapore</p>
            </div>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 font-bold">Error</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Language Selection */}
            <div className="bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Languages className="w-5 h-5 text-purple-400" />
                Select Language
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">
                    Source Language
                  </label>
                  <select
                    value={sourceLanguage}
                    onChange={(e) => setSourceLanguage(e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-purple-400 rotate-90" />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-300 mb-2 block">
                    Target Language
                  </label>
                  <div className="w-full bg-green-900/30 border-2 border-green-500/50 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-between">
                    <span>{TARGET_LANGUAGE.flag} {TARGET_LANGUAGE.name}</span>
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">FIXED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
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
                <p className="text-white font-semibold mb-1">Drop file or click to browse</p>
                <p className="text-slate-400 text-sm">JPG, PDF, JSON, TXT</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".jpg,.jpeg,.pdf,.json,.txt"
                />
              </div>

              {file && (
                <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{file.name}</p>
                    <p className="text-slate-400 text-xs">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Translate Button */}
            <button
              onClick={handleTranslate}
              disabled={!file || translating}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white text-lg transition-all shadow-lg ${
                file && !translating
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer'
                  : 'bg-slate-700 cursor-not-allowed opacity-50'
              }`}
            >
              {translating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-6 h-6" />
                  Translate Now
                </>
              )}
            </button>

            {/* KPIs */}
            {result?.kpis && (
              <div className="bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Performance
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                    <p className="text-xs text-green-300 font-semibold mb-1">Accuracy</p>
                    <p className="text-2xl font-black text-white">{result.kpis.accuracy}%</p>
                  </div>

                  <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                    <p className="text-xs text-blue-300 font-semibold mb-1">Latency</p>
                    <p className="text-2xl font-black text-white">{result.kpis.latency}s</p>
                  </div>

                  <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
                    <p className="text-xs text-purple-300 font-semibold mb-1">Words/sec</p>
                    <p className="text-2xl font-black text-white">{result.kpis.throughput}</p>
                  </div>

                  <div className="bg-orange-500/20 rounded-lg p-3 border border-orange-500/30">
                    <p className="text-xs text-orange-300 font-semibold mb-1">BLEU</p>
                    <p className="text-2xl font-black text-white">{result.kpis.bleuScore}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Processing */}
            {translating && (
              <div className="bg-slate-800 rounded-xl shadow-xl p-8 border border-slate-700">
                <div className="text-center">
                  <div className="inline-block relative mb-6">
                    <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <Languages className="absolute inset-0 m-auto w-8 h-8 text-purple-400" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">Translating...</h3>
                  <p className="text-slate-400 mb-6">Processing your document with AI</p>

                  <div className="max-w-md mx-auto">
                    <div className="bg-slate-700/50 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-slate-400 text-sm mt-2">{progress}% Complete</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {!translating && result && (
              <>
                {/* Preview */}
                <div className="bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple-400" />
                      Translation Result
                    </h3>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={downloadTXT}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold transition-all text-sm"
                      >
                        <Download className="w-4 h-4" />
                        TXT
                      </button>

                      <button
                        onClick={downloadPDF}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-all text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </button>

                      <button
                        onClick={downloadJSON}
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-semibold transition-all text-sm"
                      >
                        <Download className="w-4 h-4" />
                        JSON
                      </button>

                      <button
                        onClick={toggleReverseView}
                        disabled={reversingTranslation}
                        className={`flex items-center gap-2 ${
                          isReversed
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : 'bg-purple-600 hover:bg-purple-700'
                        } text-white px-3 py-2 rounded-lg font-semibold transition-all text-sm`}
                      >
                        <RefreshCw className={`w-4 h-4 ${reversingTranslation ? 'animate-spin' : ''}`} />
                        {reversingTranslation ? 'Reversing...' : isReversed ? 'Show Original' : 'Reverse'}
                      </button>

                      <button
                        onClick={() => {
                          setResult(null)
                          setFile(null)
                          setReverseTranslation(null)
                          setIsReversed(false)
                        }}
                        className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg font-semibold transition-all text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        New
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!isReversed ? (
                      <>
                        <div>
                          <h4 className="font-bold text-blue-300 text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            Original ({result.metadata?.sourceLanguage || sourceLanguage})
                          </h4>
                          <div className="bg-slate-900 rounded-lg p-4 border-2 border-blue-500/30 h-96 overflow-auto">
                            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                              {result.originalText}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-purple-300 text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                            Translated (English)
                          </h4>
                          <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-4 border-2 border-purple-500/30 h-96 overflow-auto">
                            <pre className="text-white text-sm whitespace-pre-wrap font-mono font-medium">
                              {result.translatedText}
                            </pre>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <h4 className="font-bold text-green-300 text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            English Translation
                          </h4>
                          <div className="bg-slate-900 rounded-lg p-4 border-2 border-green-500/30 h-96 overflow-auto">
                            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                              {result.translatedText}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-orange-300 text-sm mb-3 uppercase tracking-wide flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            Reverse Translation ({result.metadata?.sourceLanguage || sourceLanguage})
                          </h4>
                          <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 rounded-lg p-4 border-2 border-orange-500/30 h-96 overflow-auto">
                            <pre className="text-white text-sm whitespace-pre-wrap font-mono font-medium">
                              {reverseTranslation || 'Click "Reverse" to generate reverse translation...'}
                            </pre>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className={`mt-4 ${
                    isReversed
                      ? 'bg-orange-500/10 border border-orange-500/30'
                      : 'bg-green-500/10 border border-green-500/30'
                  } rounded-lg p-4`}>
                    <div className="flex items-start gap-3">
                      <CheckCircle className={`w-5 h-5 ${isReversed ? 'text-orange-400' : 'text-green-400'} mt-0.5`} />
                      <div>
                        {!isReversed ? (
                          <>
                            <p className="text-green-300 font-bold text-sm">Translation Complete</p>
                            <p className="text-slate-300 text-xs mt-1">
                              Translated {result.wordCount} words using {result.metadata?.model || 'AI Translation'}.
                              Click "Reverse" to verify accuracy.
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-orange-300 font-bold text-sm">Reverse Translation for Verification</p>
                            <p className="text-slate-300 text-xs mt-1">
                              English translation has been translated back to {result.metadata?.sourceLanguage || sourceLanguage} to verify translation accuracy.
                              Compare with original to check quality.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-700">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    Document Info
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-slate-400 text-xs mb-1">File Name</p>
                      <p className="text-white font-bold text-xs truncate">{result.fileName}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-slate-400 text-xs mb-1">Words</p>
                      <p className="text-white font-bold">{result.wordCount}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-slate-400 text-xs mb-1">Characters</p>
                      <p className="text-white font-bold">{result.characterCount}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                      <p className="text-slate-400 text-xs mb-1">Size</p>
                      <p className="text-white font-bold">{result.fileSize} KB</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Initial State */}
            {!translating && !result && (
              <div className="bg-slate-800 rounded-xl shadow-xl p-12 border border-slate-700 text-center">
                <div className="max-w-md mx-auto">
                  <div className="bg-purple-500/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Languages className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Ready to Translate</h3>
                  <p className="text-slate-400 mb-6">
                    1. Select source language<br/>
                    2. Upload your document<br/>
                    3. Click Translate Now<br/>
                    4. Download your translation
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <p className="text-slate-300 font-semibold">&gt;95% Accurate</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <Loader2 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-slate-300 font-semibold">Fast AI</p>
                    </div>
                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <FileText className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-slate-300 font-semibold">Any Format</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 bg-slate-800 rounded-xl shadow-xl p-6 border border-slate-700 text-center">
          <p className="text-slate-400 text-sm">
            © 2024 SPECTRA AI Pte. Ltd. - All Rights Reserved
          </p>
          <p className="text-slate-500 text-xs mt-2">
            AI-Powered Translation Technology - Singapore
          </p>
        </footer>
      </div>
    </div>
  )
}
