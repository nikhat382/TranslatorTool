import db from '../config/database.js';
import User from '../models/User.js';
import Document from '../models/Document.js';
import ApiCall from '../models/ApiCall.js';

// Generate sample cost data for testing the cost monitoring dashboard
async function generateSampleCosts() {
  console.log('🎲 Generating sample cost data...\n');

  try {
    // Get demo user (ID 5)
    const userId = 5;
    const user = User.findById(userId);

    if (!user) {
      console.error('❌ User with ID 5 (demouser) not found');
      console.log('Please login first to create the demo user');
      return;
    }

    console.log(`✅ Found user: ${user.username} (${user.email})`);

    // Create 3 sample documents with user association
    const sampleDocuments = [
      {
        user_id: userId,
        file_hash: 'sample_hash_' + Date.now() + '_1',
        original_filename: 'business_proposal.pdf',
        file_size: 524288,
        file_type: 'application/pdf',
        source_lang: 'spanish',
        target_lang: 'english',
        word_count: 1250,
        character_count: 8750
      },
      {
        user_id: userId,
        file_hash: 'sample_hash_' + Date.now() + '_2',
        original_filename: 'technical_manual.docx',
        file_size: 1048576,
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        source_lang: 'french',
        target_lang: 'english',
        word_count: 3200,
        character_count: 22400
      },
      {
        user_id: userId,
        file_hash: 'sample_hash_' + Date.now() + '_3',
        original_filename: 'marketing_content.txt',
        file_size: 102400,
        file_type: 'text/plain',
        source_lang: 'german',
        target_lang: 'english',
        word_count: 850,
        character_count: 5950
      }
    ];

    const documentIds = [];

    for (const docData of sampleDocuments) {
      const doc = Document.create(docData);
      documentIds.push(doc.id);
      console.log(`📄 Created document: ${docData.original_filename} (ID: ${doc.id})`);
    }

    // Create API calls for each document
    const apiCallsData = [
      // Document 1 - business_proposal.pdf
      { documentId: documentIds[0], service: 'gemini', model: 'gemini-1.5-flash', inputTokens: 8750, outputTokens: 9500, latency: 3200, cacheHit: false },
      { documentId: documentIds[0], service: 'gpt', model: 'gpt-4-vision-preview', inputTokens: 9500, outputTokens: 10200, latency: 4500, cacheHit: false },
      { documentId: documentIds[0], service: 'gemini', model: 'gemini-1.5-flash-8b', inputTokens: 8750, outputTokens: 9500, latency: 1800, cacheHit: true },

      // Document 2 - technical_manual.docx
      { documentId: documentIds[1], service: 'gemini', model: 'gemini-1.5-pro', inputTokens: 22400, outputTokens: 24800, latency: 8500, cacheHit: false },
      { documentId: documentIds[1], service: 'claude', model: 'claude-3-5-sonnet', inputTokens: 24800, outputTokens: 26500, latency: 6200, cacheHit: false },
      { documentId: documentIds[1], service: 'gemini', model: 'gemini-1.5-flash', inputTokens: 22400, outputTokens: 24800, latency: 4100, cacheHit: true },
      { documentId: documentIds[1], service: 'gemini', model: 'gemini-1.5-flash', inputTokens: 22400, outputTokens: 24800, latency: 2800, cacheHit: true },

      // Document 3 - marketing_content.txt
      { documentId: documentIds[2], service: 'gpt', model: 'gpt-4-vision-preview', inputTokens: 5950, outputTokens: 6450, latency: 3800, cacheHit: false },
      { documentId: documentIds[2], service: 'gemini', model: 'gemini-1.5-flash-8b', inputTokens: 5950, outputTokens: 6450, latency: 1500, cacheHit: false },
      { documentId: documentIds[2], service: 'gemini', model: 'gemini-1.5-flash', inputTokens: 5950, outputTokens: 6450, latency: 2200, cacheHit: true },
    ];

    console.log('\n💰 Creating API calls with cost tracking...');

    let totalCost = 0;
    for (const callData of apiCallsData) {
      const cost = ApiCall.calculateCost(
        callData.service,
        callData.model,
        callData.inputTokens,
        callData.outputTokens
      );

      const apiCall = ApiCall.create({
        documentId: callData.documentId,
        userId: userId,
        serviceName: callData.service,
        modelName: callData.model,
        inputTokens: callData.inputTokens,
        outputTokens: callData.outputTokens,
        latencyMs: callData.latency,
        cacheHit: callData.cacheHit ? 1 : 0,
        success: 1
      });

      totalCost += cost;

      console.log(`  ✓ ${callData.service}/${callData.model}: $${cost.toFixed(4)} (${callData.cacheHit ? 'CACHE HIT' : 'API CALL'})`);
    }

    // Update user's total cost
    User.updateTotalCost(userId, totalCost);

    console.log(`\n✅ Successfully generated sample cost data!`);
    console.log(`📊 Total cost: $${totalCost.toFixed(4)}`);
    console.log(`📁 Documents created: ${documentIds.length}`);
    console.log(`📞 API calls recorded: ${apiCallsData.length}`);
    console.log(`\n🎉 Cost monitoring dashboard is now active!`);
    console.log(`🔗 Visit http://localhost:5173 and login to view the dashboard`);

  } catch (error) {
    console.error('❌ Error generating sample data:', error);
  }
}

// Run the script
generateSampleCosts();
