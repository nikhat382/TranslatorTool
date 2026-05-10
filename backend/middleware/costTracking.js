import ApiCall from '../models/ApiCall.js';
import User from '../models/User.js';
import UsageLog from '../models/UsageLog.js';

// Cost tracking wrapper for API calls
export const trackApiCall = async ({
  documentId,
  userId,
  serviceName,
  modelName,
  inputTokens,
  outputTokens,
  inputText,
  outputText,
  latencyMs,
  cacheHit = false,
  success = true,
  errorMessage = null
}) => {
  try {
    // Estimate tokens if not provided
    if (!inputTokens && inputText) {
      inputTokens = ApiCall.estimateTokens(inputText);
    }

    if (!outputTokens && outputText) {
      outputTokens = ApiCall.estimateTokens(outputText);
    }

    // Create API call record
    const apiCall = ApiCall.create({
      documentId,
      userId,
      serviceName,
      modelName,
      inputTokens,
      outputTokens,
      latencyMs,
      cacheHit,
      success,
      errorMessage
    });

    // Update user's total cost if userId exists
    if (userId && apiCall.cost > 0) {
      User.updateTotalCost(userId, apiCall.cost);
    }

    // Update daily usage log if userId exists
    if (userId) {
      UsageLog.logApiCall(
        userId,
        serviceName,
        apiCall.cost,
        apiCall.total_tokens,
        cacheHit
      );
    }

    return apiCall;
  } catch (error) {
    console.error('Failed to track API call:', error);
    // Don't throw error - cost tracking failure shouldn't break translation
    return null;
  }
};

// Middleware to track request timing
export const requestTimer = (req, res, next) => {
  req.startTime = Date.now();
  next();
};

// Get request duration
export const getRequestDuration = (req) => {
  if (req.startTime) {
    return Date.now() - req.startTime;
  }
  return 0;
};

// Helper to extract user ID from request (with optional auth)
export const getUserId = (req) => {
  return req.user?.userId || null;
};

// Gemini cost tracking helper
export const trackGeminiCall = async ({
  documentId,
  userId,
  modelName = 'gemini-1.5-flash-8b',
  inputText,
  outputText,
  response,
  latencyMs,
  cacheHit = false,
  success = true,
  errorMessage = null
}) => {
  let inputTokens = 0;
  let outputTokens = 0;

  // Try to get token count from response
  if (response?.usageMetadata) {
    inputTokens = response.usageMetadata.promptTokenCount || 0;
    outputTokens = response.usageMetadata.candidatesTokenCount || 0;
  } else {
    // Estimate if not available
    inputTokens = inputText ? ApiCall.estimateTokens(inputText) : 0;
    outputTokens = outputText ? ApiCall.estimateTokens(outputText) : 0;
  }

  return trackApiCall({
    documentId,
    userId,
    serviceName: 'gemini',
    modelName,
    inputTokens,
    outputTokens,
    latencyMs,
    cacheHit,
    success,
    errorMessage
  });
};

// Claude cost tracking helper
export const trackClaudeCall = async ({
  documentId,
  userId,
  modelName = 'claude-sonnet-4-20250514',
  response,
  inputText,
  outputText,
  latencyMs,
  cacheHit = false,
  success = true,
  errorMessage = null
}) => {
  let inputTokens = 0;
  let outputTokens = 0;

  // Claude SDK provides usage in response
  if (response?.usage) {
    inputTokens = response.usage.input_tokens || 0;
    outputTokens = response.usage.output_tokens || 0;
  } else {
    // Estimate if not available
    inputTokens = inputText ? ApiCall.estimateTokens(inputText) : 0;
    outputTokens = outputText ? ApiCall.estimateTokens(outputText) : 0;
  }

  return trackApiCall({
    documentId,
    userId,
    serviceName: 'claude',
    modelName,
    inputTokens,
    outputTokens,
    latencyMs,
    cacheHit,
    success,
    errorMessage
  });
};

// GPT cost tracking helper
export const trackGPTCall = async ({
  documentId,
  userId,
  modelName = 'gpt-4-vision-preview',
  response,
  inputText,
  outputText,
  latencyMs,
  cacheHit = false,
  success = true,
  errorMessage = null
}) => {
  let inputTokens = 0;
  let outputTokens = 0;

  // OpenAI provides usage in response
  if (response?.usage) {
    inputTokens = response.usage.prompt_tokens || 0;
    outputTokens = response.usage.completion_tokens || 0;
  } else {
    // Estimate if not available
    inputTokens = inputText ? ApiCall.estimateTokens(inputText) : 0;
    outputTokens = outputText ? ApiCall.estimateTokens(outputText) : 0;
  }

  return trackApiCall({
    documentId,
    userId,
    serviceName: 'gpt',
    modelName,
    inputTokens,
    outputTokens,
    latencyMs,
    cacheHit,
    success,
    errorMessage
  });
};

export default {
  trackApiCall,
  trackGeminiCall,
  trackClaudeCall,
  trackGPTCall,
  requestTimer,
  getRequestDuration,
  getUserId
};
