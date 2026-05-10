import express from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth/jwt.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import ApiCall from '../models/ApiCall.js';
import Translation from '../models/Translation.js';
import UsageLog from '../models/UsageLog.js';

const router = express.Router();

// Get overall cost summary for the user
router.get('/costs/summary', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    // Get cost summary
    const costSummary = ApiCall.getUserCostSummary(userId, startDate, endDate);

    // Get user info
    const user = User.findById(userId);

    // Calculate cache savings
    const cacheSavings = costSummary.cache_hits > 0
      ? (costSummary.total_cost / (costSummary.cache_misses || 1)) * costSummary.cache_hits
      : 0;

    res.json({
      success: true,
      data: {
        user_id: userId,
        total_cost: (costSummary.total_cost || 0).toFixed(4),
        user_total_cost: (user.total_cost || 0).toFixed(4),
        quota_limit: user.quota_limit,
        remaining_quota: (user.quota_limit - user.total_cost).toFixed(4),
        quota_used_percentage: ((user.total_cost / user.quota_limit) * 100).toFixed(2),
        period: {
          start_date: startDate || 'all time',
          end_date: endDate || 'now'
        },
        breakdown: {
          gemini: {
            cost: (costSummary.gemini_cost || 0).toFixed(4),
            percentage: costSummary.total_cost > 0
              ? ((costSummary.gemini_cost / costSummary.total_cost) * 100).toFixed(2)
              : 0
          },
          claude: {
            cost: (costSummary.claude_cost || 0).toFixed(4),
            percentage: costSummary.total_cost > 0
              ? ((costSummary.claude_cost / costSummary.total_cost) * 100).toFixed(2)
              : 0
          },
          gpt: {
            cost: (costSummary.gpt_cost || 0).toFixed(4),
            percentage: costSummary.total_cost > 0
              ? ((costSummary.gpt_cost / costSummary.total_cost) * 100).toFixed(2)
              : 0
          }
        },
        cache: {
          hits: costSummary.cache_hits || 0,
          misses: costSummary.cache_misses || 0,
          hit_rate: costSummary.total_calls > 0
            ? ((costSummary.cache_hits / costSummary.total_calls) * 100).toFixed(2)
            : 0,
          estimated_savings: cacheSavings.toFixed(4)
        },
        statistics: {
          total_calls: costSummary.total_calls || 0,
          total_tokens: costSummary.total_tokens || 0,
          avg_latency_ms: costSummary.avg_latency_ms ? Math.round(costSummary.avg_latency_ms) : 0,
          failed_calls: costSummary.failed_calls || 0
        }
      }
    });
  } catch (error) {
    console.error('Cost summary error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch cost summary'
    });
  }
});

// Get document-wise cost breakdown
router.get('/costs/by-document', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, offset = 0 } = req.query;
    const userId = req.user.userId;

    const documents = Document.getUserDocumentsWithCosts(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        documents: documents.map(doc => ({
          id: doc.id,
          filename: doc.original_filename,
          file_type: doc.file_type,
          source_lang: doc.source_lang,
          target_lang: doc.target_lang,
          word_count: doc.word_count,
          created_at: doc.created_at,
          costs: {
            total: (doc.total_cost || 0).toFixed(4),
            gemini: (doc.gemini_cost || 0).toFixed(4),
            claude: (doc.claude_cost || 0).toFixed(4),
            gpt: (doc.gpt_cost || 0).toFixed(4)
          },
          api_calls: doc.api_call_count || 0,
          cache: {
            hits: doc.cache_hits || 0,
            misses: doc.cache_misses || 0
          }
        })),
        total_documents: documents.length
      }
    });
  } catch (error) {
    console.error('Document costs error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch document costs'
    });
  }
});

// Get service-wise breakdown
router.get('/costs/by-service', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    const breakdown = ApiCall.getServiceBreakdown(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        services: breakdown.map(service => ({
          name: service.service_name,
          model: service.model_name,
          call_count: service.call_count,
          cost: parseFloat(service.total_cost).toFixed(4),
          tokens: {
            input: service.total_input_tokens,
            output: service.total_output_tokens,
            total: service.total_tokens
          },
          avg_latency_ms: service.avg_latency_ms ? Math.round(service.avg_latency_ms) : 0,
          cache_hits: service.cache_hits
        }))
      }
    });
  } catch (error) {
    console.error('Service breakdown error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch service breakdown'
    });
  }
});

// Get cache statistics
router.get('/cache/stats', optionalAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user?.userId || null;

    const stats = ApiCall.getCacheStats(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        total_requests: stats.total_requests || 0,
        cache_hits: stats.cache_hits || 0,
        cache_misses: stats.cache_misses || 0,
        hit_rate: (stats.hit_rate || 0) + '%',
        cost_saved: (stats.cost_saved || 0).toFixed(4),
        actual_cost: (stats.actual_cost || 0).toFixed(4),
        total_cost_if_no_cache: ((stats.cost_saved || 0) + (stats.actual_cost || 0)).toFixed(4),
        savings_percentage: (stats.total_requests > 0 && stats.cost_saved > 0)
          ? ((stats.cost_saved / (stats.cost_saved + stats.actual_cost)) * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch cache statistics'
    });
  }
});

// Get daily cost trends
router.get('/costs/trends', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.userId;

    const trends = ApiCall.getDailyCostTrend(userId, parseInt(days));

    res.json({
      success: true,
      data: {
        trends: trends.map(day => ({
          date: day.date,
          call_count: day.call_count,
          daily_cost: parseFloat(day.daily_cost).toFixed(4),
          gemini_cost: parseFloat(day.gemini_cost).toFixed(4),
          claude_cost: parseFloat(day.claude_cost).toFixed(4),
          gpt_cost: parseFloat(day.gpt_cost).toFixed(4),
          cache_hits: day.cache_hits
        })),
        period_days: parseInt(days)
      }
    });
  } catch (error) {
    console.error('Cost trends error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch cost trends'
    });
  }
});

// Get usage logs summary
router.get('/usage/summary', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.userId;

    const summary = UsageLog.getSummary(userId, startDate, endDate);

    res.json({
      success: true,
      data: {
        total_api_calls: summary.total_api_calls || 0,
        total_cost: (summary.total_cost || 0).toFixed(4),
        services: {
          gemini: {
            calls: summary.gemini_calls || 0,
            cost: (summary.gemini_cost || 0).toFixed(4)
          },
          claude: {
            calls: summary.claude_calls || 0,
            cost: (summary.claude_cost || 0).toFixed(4)
          },
          gpt: {
            calls: summary.gpt_calls || 0,
            cost: (summary.gpt_cost || 0).toFixed(4)
          }
        },
        cache: {
          hits: summary.cache_hits || 0,
          misses: summary.cache_misses || 0,
          hit_rate: (summary.total_api_calls > 0)
            ? ((summary.cache_hits / summary.total_api_calls) * 100).toFixed(2)
            : 0
        },
        documents_processed: summary.documents_processed || 0,
        total_tokens: summary.total_tokens || 0,
        days_active: summary.days_active || 0
      }
    });
  } catch (error) {
    console.error('Usage summary error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch usage summary'
    });
  }
});

// Get document details with drill-down
router.get('/documents/:documentId', authenticateToken, async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.userId;

    // Get document with costs
    const document = Document.getWithCosts(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Verify ownership
    if (document.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get API calls for this document
    const apiCalls = ApiCall.findByDocumentId(documentId);

    // Get translation
    const translation = Translation.findByDocumentId(documentId);

    res.json({
      success: true,
      data: {
        document: {
          id: document.id,
          filename: document.original_filename,
          file_type: document.file_type,
          file_size: document.file_size,
          source_lang: document.source_lang,
          target_lang: document.target_lang,
          word_count: document.word_count,
          character_count: document.character_count,
          created_at: document.created_at
        },
        costs: {
          total: (document.total_cost || 0).toFixed(4),
          gemini: (document.gemini_cost || 0).toFixed(4),
          claude: (document.claude_cost || 0).toFixed(4),
          gpt: (document.gpt_cost || 0).toFixed(4)
        },
        api_calls: apiCalls.map(call => ({
          id: call.id,
          service: call.service_name,
          model: call.model_name,
          tokens: {
            input: call.input_tokens,
            output: call.output_tokens,
            total: call.total_tokens
          },
          cost: parseFloat(call.cost).toFixed(4),
          latency_ms: call.latency_ms,
          cache_hit: call.cache_hit === 1,
          success: call.success === 1,
          error: call.error_message,
          created_at: call.created_at
        })),
        translation: translation ? {
          id: translation.id,
          confidence_score: translation.confidence_score,
          kpi_data: translation.kpi_data,
          metadata: translation.metadata,
          segments_count: translation.segments ? translation.segments.length : 0
        } : null,
        statistics: {
          api_call_count: document.api_call_count || 0,
          cache_hits: document.cache_hits || 0,
          avg_latency_ms: document.avg_latency_ms ? Math.round(document.avg_latency_ms) : 0,
          total_tokens: document.total_tokens || 0
        }
      }
    });
  } catch (error) {
    console.error('Document details error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch document details'
    });
  }
});

export default router;
