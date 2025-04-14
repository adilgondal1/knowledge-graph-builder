require('dotenv').config();
const { processEmailFile} = require('./service/emailProcessorService');
const Neo4jManager = require('./db/neo4jManager');
const LlmExtractionService = require('./service/llmExtractionService');

// Configuration
const NEO4J_CONFIG = {
  uri: process.env.NEO4J_URI || 'neo4j://localhost:7687',
  username: process.env.NEO4J_USERNAME || 'neo4j',
  password: process.env.NEO4J_PASSWORD || 'password'
};

const LLM_CONFIG = {
  apiKey: process.env.LLM_API_KEY,
  model: process.env.LLM_MODEL || 'gpt-4'
};

const EMAIL_FILE_PATH = process.env.EMAIL_FILE_PATH || 'resources/email_data.csv';

/**
 * Main application for building the knowledge graph
 */
async function main() {
  let neo4jManager;
  try {
    console.log('Starting Knowledge Graph Builder...');
    
    // Initialize Neo4j connection
    neo4jManager = new Neo4jManager(NEO4J_CONFIG);
    await neo4jManager.initializeDatabase();
    
    // Initialize LLM service
    const llmService = new LlmExtractionService(LLM_CONFIG);
    
    // Process email file
    console.log(`Processing email file: ${EMAIL_FILE_PATH}`);
    const emails = await processEmailFile(EMAIL_FILE_PATH);
    console.log(`Found ${emails.length} emails to process`);
    
    // Process each email
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      console.log(`Processing email ${i+1}/${emails.length}: ${email.subject}`);
      
      try {
        // Store the email in Neo4j
        // await neo4jManager.storeEmail(email);
        
        // Extract entities and relationships using LLM
        const extractedData = await llmService.extractEntities(email);
        // await saveProcessedEmails(extractedData, OUTPUT_PATH);
        // console.log(extractedData)
        
        // Store extracted entities and relationships in Neo4j
        // console.log("EMAIL ID FROM APP ", email.id)
        await neo4jManager.storeEntities(email.id, extractedData);
        
        console.log(`Successfully processed email ${i+1}/${emails.length}`);
      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error);
        // Continue with next email instead of stopping the whole process
      }
    }
    
    console.log('Knowledge graph building complete!');
    
  } catch (error) {
    console.error('Fatal error in knowledge graph builder:', error);
  } finally {
    // Clean up resources
    if (neo4jManager) {
      await neo4jManager.close();
    }
  }
}

// Run the application
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };