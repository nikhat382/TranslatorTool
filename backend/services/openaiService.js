const OpenAI = require('openai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Extract text from different file types
async function extractText(file) {
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  const mimeType = file.mimetype || '';

  try {
    // Text files
    if (fileExtension === 'txt' || mimeType === 'text/plain') {
      return file.buffer.toString('utf-8');
    }

    // PDF files
    else if (fileExtension === 'pdf' || mimeType === 'application/pdf') {
      const data = await pdf(file.buffer);
      return data.text;
    }

    // Word documents
    else if (fileExtension === 'docx' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }

    // JSON files
    else if (fileExtension === 'json' || mimeType === 'application/json') {
      const jsonContent = file.buffer.toString('utf-8');
      const parsed = JSON.parse(jsonContent);
      return JSON.stringify(parsed, null, 2);
    }

    // Image files - use OpenAI Vision API
    else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension) ||
             mimeType.startsWith('image/')) {
      return await extractTextFromImage(file);
    }

    // HTML/XML files
    else if (['html', 'htm', 'xml'].includes(fileExtension) ||
             mimeType === 'text/html' || mimeType === 'text/xml' || mimeType === 'application/xml') {
      return file.buffer.toString('utf-8');
    }

    // Code files (common extensions)
    else if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rb', 'php',
              'swift', 'kt', 'rs', 'css', 'scss', 'less', 'sql', 'sh', 'bash', 'yaml', 'yml',
              'md', 'markdown', 'csv'].includes(fileExtension)) {
      return file.buffer.toString('utf-8');
    }

    // Default: Try to read as UTF-8 text
    else {
      try {
        const textContent = file.buffer.toString('utf-8');
        // Check if it's readable text (not binary gibberish)
        if (textContent.length > 0 && !isBinaryContent(textContent)) {
          return textContent;
        }
        // If binary, provide a message
        return `[Binary file detected: ${file.originalname}. File type: ${fileExtension || 'unknown'}. ` +
               `This file cannot be directly translated as text. Please convert it to a text-based format first.]`;
      } catch (err) {
        return `[Unable to extract text from file: ${file.originalname}. ` +
               `File type may not contain readable text content.]`;
      }
    }
  } catch (error) {
    throw new Error(`Text extraction failed: ${error.message}`);
  }
}

// Extract text from images using OpenAI Vision API
async function extractTextFromImage(file) {
  try {
    const base64Image = file.buffer.toString('base64');
    const mimeType = file.mimetype || 'image/jpeg';

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extract all text from this image. Return only the text content, nothing else. If there's no text, say 'No text found in image'."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 4000
    });

    // Clean up the extracted text by removing common AI response prefixes
    let extractedText = response.choices[0].message.content.trim();

    // Remove common prefixes that AI adds
    const prefixesToRemove = [
      /^Sure[.!]?\s*/i,
      /^Here'?s?\s+the\s+text:?\s*/i,
      /^Here\s+is\s+the\s+text:?\s*/i,
      /^Extracted\s+text:?\s*/i,
      /^Text:?\s*/i,
      /^The\s+text\s+in\s+the\s+image\s+is:?\s*/i,
      /^---+\s*/,
      /^\*\*[^*]+\*\*\s*/,
    ];

    for (const pattern of prefixesToRemove) {
      extractedText = extractedText.replace(pattern, '');
    }

    // Remove leading dashes and extra whitespace
    extractedText = extractedText.replace(/^[-\s]+/, '').trim();

    return extractedText;
  } catch (error) {
    throw new Error(`Image text extraction failed: ${error.message}`);
  }
}

// Check if content is binary (contains non-printable characters)
function isBinaryContent(text) {
  const sample = text.substring(0, 1000); // Check first 1000 chars
  let nonPrintableCount = 0;

  for (let i = 0; i < sample.length; i++) {
    const charCode = sample.charCodeAt(i);
    // Count non-printable characters (excluding common whitespace)
    if (charCode < 32 && charCode !== 9 && charCode !== 10 && charCode !== 13) {
      nonPrintableCount++;
    }
  }

  // If more than 10% non-printable, consider it binary
  return (nonPrintableCount / sample.length) > 0.1;
}

// Translate text using OpenAI
async function translateText(text, targetLanguage = 'English') {
  const startTime = Date.now();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLanguage}. Maintain the original meaning, tone, and structure. Only provide the translation without any explanations or additional text.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    const endTime = Date.now();
    const latency = endTime - startTime;

    // Clean up the translated text by removing common AI response prefixes
    let translatedText = response.choices[0].message.content.trim();

    // Remove the entire first line if it contains common AI prefixes
    const lines = translatedText.split('\n');
    const firstLine = lines[0].trim();

    // Check if first line is an AI response prefix
    const prefixPatterns = [
      /^Sure[.!,]?\s+/i,
      /^Here(?:'s|s)?\s+/i,
      /^(?:The\s+)?translated\s+text:?\s*/i,
      /^Translation:?\s*/i,
      /^---+\s*/,
      /^\*\*[^*]+\*\*\s*/,
    ];

    let shouldRemoveFirstLine = false;
    for (const pattern of prefixPatterns) {
      if (pattern.test(firstLine)) {
        shouldRemoveFirstLine = true;
        break;
      }
    }

    if (shouldRemoveFirstLine) {
      lines.shift(); // Remove first line
      translatedText = lines.join('\n').trim();
    }

    // Additional cleanup for any remaining prefixes
    const additionalCleanup = [
      /^---+\s*/,
      /^\*\*[^*]+\*\*\s*/,
    ];

    for (const pattern of additionalCleanup) {
      translatedText = translatedText.replace(pattern, '');
    }

    // Remove leading dashes and extra whitespace
    translatedText = translatedText.replace(/^[-\s]+/, '').trim();

    return {
      translatedText: translatedText,
      usage: {
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      },
      latency: latency,
      model: response.model || 'gpt-3.5-turbo'
    };
  } catch (error) {
    throw new Error(`Translation failed: ${error.message}`);
  }
}

// Split text into sentences for segment analysis
function splitIntoSentences(text) {
  return text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
}

// Calculate metadata
function calculateMetadata(text) {
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const sentences = splitIntoSentences(text);
  
  return {
    wordCount: words.length,
    characterCount: text.length,
    sentenceCount: sentences.length
  };
}

// Generate segments with mock confidence scores
async function generateSegments(originalText, translatedText) {
  const originalSentences = splitIntoSentences(originalText);
  const translatedSentences = splitIntoSentences(translatedText);
  
  const segments = [];
  const maxLength = Math.min(originalSentences.length, translatedSentences.length);
  
  for (let i = 0; i < maxLength; i++) {
    const originalSentence = originalSentences[i].trim();
    const translatedSentence = translatedSentences[i].trim();
    const tokens = originalSentence.split(/\s+/).length;
    
    segments.push({
      id: i + 1,
      spanish: originalSentence,
      english: translatedSentence,
      tokens: tokens,
      processingTime: (tokens * 0.01 + Math.random() * 0.05).toFixed(2)
    });
  }
  
  return segments;
}

// Main translation service
async function performTranslation(file, targetLanguage = 'English') {
  const startTime = Date.now();
  
  try {
    // Extract text
    const originalText = await extractText(file);
    
    if (!originalText || originalText.trim().length === 0) {
      throw new Error('No text found in the document');
    }
    
    // Translate
    const translationResult = await translateText(originalText, targetLanguage);
    const translatedText = translationResult.translatedText;

    // Calculate metadata
    const originalMetadata = calculateMetadata(originalText);
    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    // Generate segments
    const segments = await generateSegments(originalText, translatedText);

    // Calculate KPIs
    const totalTokens = segments.reduce((sum, seg) => sum + seg.tokens, 0);
    const throughput = Math.round(originalMetadata.wordCount / processingTime);

    return {
      originalText,
      translatedText,
      segments,
      kpis: {
        latency: processingTime,
        throughput: throughput,
        wer: (Math.random() * 2 + 0.5).toFixed(1), // Mock WER between 0.5-2.5%
        bleuScore: (92 + Math.random() * 6).toFixed(1), // Mock BLEU 92-98%
        semanticSimilarity: (95 + Math.random() * 4).toFixed(1) // Mock similarity 95-99%
      },
      metadata: {
        fileName: file.originalname,
        fileSize: (file.size / 1024).toFixed(2),
        wordCount: originalMetadata.wordCount,
        characterCount: originalMetadata.characterCount,
        sentenceCount: originalMetadata.sentenceCount,
        processedAt: new Date().toLocaleString(),
        model: 'GPT-3.5-turbo',
        language: `Auto-detected → ${targetLanguage}`
      },
      // API usage information for cost tracking
      apiUsage: {
        inputTokens: translationResult.usage.inputTokens,
        outputTokens: translationResult.usage.outputTokens,
        totalTokens: translationResult.usage.totalTokens,
        latencyMs: translationResult.latency,
        model: translationResult.model
      }
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  performTranslation,
  extractText,
  translateText,
  extractTextFromImage,
  isBinaryContent
};