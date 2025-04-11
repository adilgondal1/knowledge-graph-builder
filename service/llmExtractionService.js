const { GoogleGenAI, Type } = require('@google/genai');
const entityExtractionSchema = require('../types/entityExtractionSchema');

/**
 * Service to interact with Gemini API for entity extraction
 */
class LlmExtractionService {
  /**
   * Creates an LLM service instance
   * @param {Object} config - Configuration for the LLM API
   */
  constructor(config) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-2.0-flash';
    this.genAI = new GoogleGenAI({ apiKey: this.apiKey });
  }

  /**
   * Extracts entities and relationships from an email
   * @param {Object} email - The processed email object
   * @returns {Promise<Object>} - Extracted entities and relationships
   */
  async extractEntities(email) {
    try {
      const prompt = this.createEntityExtractionPrompt(email);
      const responseSchema = this.createResponseSchema();
      
      const response = await this.genAI.models.generateContent({
        model: this.model,
        contents: [
          prompt
        ],
        systemPrompt: 'You are an expert entity extractor for legal emails.',
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2000
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema
        }
      });

      return response.text;
    } catch (error) {
      console.error(`Error extracting entities from email ${email.id}:`, error);
      throw error;
    }
  }

  /**
   * Creates the prompt for entity extraction
   * @param {Object} email - The processed email object
   * @returns {string} - The formatted prompt
   */
  createEntityExtractionPrompt(email) {
    return `
Extract all people, places, events, and their relationships from the following email:

EMAIL SUBJECT: ${email.subject}
FROM: ${email.sender.name} <${email.sender.email}>
TO: ${email.recipients.map(r => `${r.name} <${r.email}>`).join(', ')}
DATE: ${email.date}
BODY:
${email.body}

Only extract entities that are explicitly mentioned. Format your response as JSON with the structure defined in the responseSchema.
Ensure all names and identifiers are consistent across the response. 
Extract events if they are tentative or if something is asked of someone, create an event for that, but clarify if something has occured or not.
Do your best to create relationships for events and you can use the "FROM" and "TO" fields to help identify the source and targets.
`;
  }

  /**
   * Gets the schema definition for the response
   * @returns {Object} - Schema definition for Gemini API
   */
  createResponseSchema() {
    return entityExtractionSchema;
  }
}

module.exports = LlmExtractionService;