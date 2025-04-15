const neo4j = require('neo4j-driver');

/**
 * Manages connections and operations with Neo4j database
 */
class Neo4jManager {
  /**
   * Creates a Neo4j manager instance
   * @param {Object} config - Configuration object with Neo4j connection details
   */
  constructor(config) {
    this.config = config;
    this.driver = neo4j.driver(
      config.uri, 
      neo4j.auth.basic(config.username, config.password),
      { maxConnectionLifetime: 3 * 60 * 60 * 1000 } // 3 hours
    );
  }

  /**
   * Initializes the database with constraints and indexes
   */
  async initializeDatabase() {
    const session = this.driver.session();
    try {
      // Create constraints to ensure uniqueness
      await session.run('CREATE CONSTRAINT person_name IF NOT EXISTS FOR (p:Person) REQUIRE p.name IS UNIQUE');
      await session.run('CREATE CONSTRAINT place_name IF NOT EXISTS FOR (p:Place) REQUIRE p.name IS UNIQUE');
      await session.run('CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE');
      
      // Create indexes for better performance
      await session.run('CREATE INDEX person_org IF NOT EXISTS FOR (p:Person) ON (p.organization)');
      await session.run('CREATE INDEX place_type IF NOT EXISTS FOR (p:Place) ON (p.type)');
      await session.run('CREATE INDEX event_date IF NOT EXISTS FOR (e:Event) ON (e.date)');
      
      console.log('Successfully initialized Neo4j database with constraints and indexes');
    } catch (error) {
      console.error('Error initializing Neo4j database:', error);
      throw error;
    } finally {
      await session.close();
    }
  }


    /**
     * Stores entities and relationships extracted from an email
     * @param {string} emailId - ID of the email
     * @param {Object} extractedData - Data extracted by the LLM
     */
    async storeEntities(emailId, extractedData) {
      // console.log("storing entities")
        const parsedData = JSON.parse(extractedData);
        const session = this.driver.session();
        try {
        // Process each entity type
        // console.log("EMAILID", emailId)
        await session.writeTransaction(async tx => {
            for (const person of parsedData.people || []) {
              await this.createOrUpdatePerson(person);
            }
            
            for (const place of parsedData.places || []) {
              await this.createOrUpdatePlace(place);
            }
            
            for (const event of parsedData.events || []) {
              await this.createOrUpdateEvent(event);
            }
            
            for (const rel of parsedData.relationships || []) {
              await this.createRelationship(rel);
            }
        });
        
        console.log(`Successfully stored entities from email ${emailId} in Neo4j`);
        } catch (error) {
        console.error(`Error storing entities from email ${emailId}:`, error);
        throw error;
        } finally {
        await session.close();
        }
    }

  /**
   * Creates or updates a Person node
   * @param {Object} person - Person data {name, role, organization}
   * @returns {Promise<Object>} The created/updated node data
   */
  async createOrUpdatePerson(person) {
    const session = this.driver.session();
    try {
      const result = await session.writeTransaction(async tx => {
        const query = `
        MERGE (p:Person {name: $name})
        ON CREATE SET p.role = $role, 
                     p.organization = $organization
        ON MATCH SET p.role = COALESCE(p.role, $role),
                    p.organization = COALESCE(p.organization, $organization)
        RETURN p
      `;
      
        const params = {
          name: person.name,
          role: person.role || null,
          organization: person.organization || null,
        };
        
        const txResult = await tx.run(query, params);
        return txResult.records.length > 0 ? txResult.records[0].get('p').properties : null;
      });
      
      return result;
    } catch (error) {
      console.error(`Error creating/updating person ${person.name}:`, error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Creates or updates a Place node
   * @param {Object} place - Place data {name, type}
   * @returns {Promise<Object>} The created/updated node data
   */
  async createOrUpdatePlace(place) {
    const session = this.driver.session();
    try {
      const result = await session.writeTransaction(async tx => {
        const query = `
          MERGE (p:Place {name: $name})
          ON CREATE SET p.type = $type
          ON MATCH SET p.type = COALESCE(p.type, $type)
          RETURN p
        `;
        
        const params = {
          name: place.name,
          type: place.type || null,
        };
        
        const txResult = await tx.run(query, params);
        return txResult.records.length > 0 ? txResult.records[0].get('p').properties : null;
      });
      
      return result;
    } catch (error) {
      console.error(`Error creating/updating place ${place.name}:`, error);
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Creates or updates an Event node
   * @param {Object} event - Event data {name, date, location}
   * @returns {Promise<Object>} The created/updated node data
   */
  async createOrUpdateEvent(event) {
    // console.log(`Creating/updating event: ${event.name}`);
    
    const session = this.driver.session();
    try {
      // Generate a unique ID for the event based on its properties
      const eventId = `${event.name}-${event.date || 'unknown'}-${event.location || 'unknown'}`;
      
      // Execute the query directly on the session without nested transaction
      const query = `
        MERGE (e:Event {id: $id})
        ON CREATE SET e.name = $name,
                    e.date = $date,
                    e.location = $location
        ON MATCH SET e.date = COALESCE(e.date, $date),
                    e.location = COALESCE(e.location, $location)
        RETURN e
      `;
      
      const params = {
        id: eventId,
        name: event.name,
        date: event.date || null,
        location: event.location || null,
      };
      
      // console.log('Executing event creation query with params:', JSON.stringify(params));
      
      const result = await session.run(query, params);
      
      // Safely extract properties
      let eventData = null;
      if (result.records && result.records.length > 0) {
        const node = result.records[0].get('e');
        eventData = node.properties || {};
        // console.log(`Successfully created/updated event with ID: ${eventId}`);
      } else {
        console.log('Query executed but no records returned');
      }
      
      return eventData;
    } catch (error) {
      console.error(`Error creating/updating event ${event.name}:`, error);
      // Return null instead of throwing to avoid stopping execution
      return null;
    } finally {
      await session.close();
    }
  }

    /**
   * Creates a relationship between two entities
   * @param {Object} relationshipData - {source, sourceType, relationship, target, targetType, context}
   * @returns {Promise<boolean>} Success indicator
   */
  async createRelationship(relationshipData) {
    // console.log("starting to create relationships inside")

    const session = this.driver.session();
    try {
      // Determine labels based on source and target types
      const sourceLabel = this.getNodeLabel(relationshipData.sourceType);
      const targetLabel = this.getNodeLabel(relationshipData.targetType);
      const relType = relationshipData.relationship.toUpperCase();
      
      // Use standard Cypher for creating relationships without relying on APOC
      const query = `
        MATCH (source:${sourceLabel} {name: $sourceName})
        MATCH (target:${targetLabel} {name: $targetName})
        MERGE (source)-[r:${relType}]->(target)
        ON CREATE SET r.context = $context
        ON MATCH SET r.context = COALESCE(r.context, $context)
        RETURN r
      `;
      
      const params = {
        sourceName: relationshipData.source,
        targetName: relationshipData.target,
        context: relationshipData.context || null
      };
      
      const result = await session.writeTransaction(async tx => {
        const txResult = await tx.run(query, params);
        return txResult.records.length > 0;
      });

      // console.log("finsished relationships inside", result)
      return result;
    } catch (error) {
      console.error(`Error creating relationship from ${relationshipData.source} to ${relationshipData.target}:`, error);
      throw error;
    } finally {
      await session.close();
    }
  }
  
  /**
   * Maps entity types to Neo4j node labels
   * @param {string} type - The entity type
   * @returns {string} - The corresponding Neo4j label
   */
  getNodeLabel(type) {
    const typeLower = (type || '').toLowerCase();
    switch (typeLower) {
      case 'person':
        return 'Person';
      case 'place':
        return 'Place';
      case 'event':
        return 'Event';
      default:
        return 'Entity';
    }
  }

  /**
   * Closes the Neo4j driver connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.driver) {
      await this.driver.close();
    }
  }
}

module.exports = Neo4jManager;
