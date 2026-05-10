const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { performTranslation } = require('../services/openaiService');
const { optionalAuth } = require('../middleware/auth/jwt');
const crypto = require('crypto');

// Import models (using require since this file is CommonJS)
const Document = require('../models/Document').default;
const ApiCall = require('../models/ApiCall').default;
const User = require('../models/User').default;

// POST /api/translate - Main translation endpoint
router.post('/translate', optionalAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const targetLanguage = req.body.targetLanguage || 'English';
    const sourceLang = req.body.sourceLang || 'auto-detect';
    const userId = req.user?.userId || null;

    console.log(`📄 Processing file: ${req.file.originalname}`);
    console.log(`🌐 Target language: ${targetLanguage}`);
    if (userId) {
      console.log(`👤 User ID: ${userId}`);
    }

    const result = await performTranslation(req.file, targetLanguage);

    console.log(`✅ Translation completed successfully`);

    // Create document record
    const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');
    const document = Document.create({
      userId: userId,
      fileHash: fileHash,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      sourceLang: sourceLang,
      targetLang: targetLanguage.toLowerCase(),
      wordCount: result.metadata.wordCount,
      characterCount: result.metadata.characterCount
    });

    console.log(`📝 Document created with ID: ${document.id}`);

    // Record API call with cost tracking
    if (result.apiUsage) {
      const apiCall = ApiCall.create({
        documentId: document.id,
        userId: userId,
        serviceName: 'gpt',
        modelName: result.apiUsage.model,
        inputTokens: result.apiUsage.inputTokens,
        outputTokens: result.apiUsage.outputTokens,
        latencyMs: result.apiUsage.latencyMs,
        cacheHit: 0, // New translation, not from cache
        success: 1
      });

      console.log(`💰 API call recorded: $${apiCall.cost.toFixed(4)}`);

      // Update user's total cost if logged in
      if (userId) {
        User.updateTotalCost(userId, apiCall.cost);
        console.log(`📊 User cost updated`);
      }
    }

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Translation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;