const { Type } = require('@google/genai');

/**
 * Schema definition for entity extraction responses from Gemini API
 * @returns {Object} Schema object compatible with Gemini API
 */
const entityExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    'people': {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          'name': {
            type: Type.STRING,
            description: 'Full name of the person',
          },
          'role': {
            type: Type.STRING,
            description: 'Position/Role if mentioned',
            nullable: true,
          },
          'organization': {
            type: Type.STRING,
            description: 'Organization if mentioned',
            nullable: true,
          }
        },
        required: ['name']
      }
    },
    'places': {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          'name': {
            type: Type.STRING,
            description: 'Location name',
          },
          'type': {
            type: Type.STRING,
            description: 'Type of location (Office/City/Country/etc)',
            nullable: true,
          }
        },
        required: ['name']
      }
    },
    'events': {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          'name': {
            type: Type.STRING,
            description: 'Event description',
          },
          'date': {
            type: Type.STRING,
            description: 'Date if mentioned',
            nullable: true,
          },
          'location': {
            type: Type.STRING,
            description: 'Location if mentioned',
            nullable: true,
          }
        },
        required: ['name']
      }
    },
    'relationships': {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          'source': {
            type: Type.STRING,
            description: 'Entity1 Name',
          },
          'sourceType': {
            type: Type.STRING,
            description: 'Type of source entity (person/place/event)',
          },
          'relationship': {
            type: Type.STRING,
            description: 'Relationship type (works_for/located_in/attended/etc). Multiple words should be connected with an underscore.',
          },
          'target': {
            type: Type.STRING,
            description: 'Entity2 Name',
          },
          'targetType': {
            type: Type.STRING,
            description: 'Type of target entity (person/place/event)',
          },
          'context': {
            type: Type.STRING,
            description: 'Brief explanation from the email',
            nullable: true,
          }
        },
        required: ['source', 'sourceType', 'relationship', 'target', 'targetType']
      }
    }
  },
  required: ['people', 'places', 'events', 'relationships']
};

module.exports = entityExtractionSchema;