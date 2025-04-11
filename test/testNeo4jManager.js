const Neo4jManager = require('../db/neo4jManager');
require('dotenv').config({ path: '../.env' });

/**
 * Test Neo4jManager with a small dataset
 */
async function testNeo4jManager() {
  let manager;
  
  try {
    // Initialize the Neo4j manager
    console.log('Initializing Neo4j connection...', process.env.NEO4J_URI);
    manager = new Neo4jManager({
      uri: process.env.NEO4J_URI || "neo4j://localhost:7687",
      username: process.env.NEO4J_USERNAME || "neo4j",
      password: process.env.NEO4J_PASSWORD || "knowledgegraphpass"
    });
    
    // Test connection
    // manager.initializeDatabase();
    
    // Sample data from LlmExtractionService
    const sampleData1 = {
      "events": [
        {
          "name": "Research Meeting",
          "date": "2025-04-15",
          "location": "Physics Department"
        }
      ],
      "people": [
        {
          "name": "Jan-Baptist Lemaire",
          "organization": "Yale University",
          "role": "Researcher"
        },
        {
          "name": "Paul Meosky",
          "organization": "Yale University",
          "role": "Professor"
        },
        {
          "name": "Gregory Antill",
          "organization": "Yale University",
          "role": "null"
        }
      ],
      "places": [
        {
          "name": "Yale University",
          "type": "University"
        },
        {
          "name": "Physics Department",
          "type": "Department"
        }
      ],
      "relationships": [
        {
          "relationship": "works_for",
          "source": "Jan-Baptist Lemaire",
          "sourceType": "person",
          "target": "Yale University",
          "targetType": "place",
          "context": "Researcher at Yale University"
        },
        {
          "relationship": "works_for",
          "source": "Paul Meosky",
          "sourceType": "person",
          "target": "Yale University",
          "targetType": "place",
          "context": "null"
        },
        {
          "relationship": "works_for",
          "source": "Gregory Antill",
          "sourceType": "person",
          "target": "Yale University",
          "targetType": "place",
          "context": "Associate Professor at Yale University"
        },
        {
          "relationship": "part_of",
          "source": "Physics Department",
          "sourceType": "place",
          "target": "Yale University",
          "targetType": "place",
          "context": "Department within Yale University"
        }
      ]
    };
    
    const sampleData = {
        "events": [
          {
            "name": "Send edits to Prof. Lamoreaux",
            "date": null,
            "location": null
          },
          {
            "name": "Sending edits tonight",
            "date": "October 25, 2021",
            "location": null
          }
        ],
        "people": [
          {
            "name": "Lemaire, Jan-Baptist",
            "organization": "Yale University",
            "role": null
          },
          {
            "name": "Meosky, Paul",
            "organization": "Yale University",
            "role": null
          },
          {
            "name": "Antill, Gregory",
            "organization": "Yale University",
            "role": null
          },
          {
            "name": "Prof. Lamoreaux",
            "organization": null,
            "role": "Professor"
          }
        ],
        "places": [
          {
            "name": "Yale",
            "type": "University"
          }
        ],
        "relationships": [
          {
            "relationship": "works_for",
            "source": "Lemaire, Jan-Baptist",
            "sourceType": "person",
            "target": "Yale",
            "targetType": "place",
            "context": null
          },
          {
            "relationship": "works_for",
            "source": "Meosky, Paul",
            "sourceType": "person",
            "target": "Yale",
            "targetType": "place",
            "context": null
          },
          {
            "relationship": "works_for",
            "source": "Antill, Gregory",
            "sourceType": "person",
            "target": "Yale",
            "targetType": "place",
            "context": null
          },
          {
            "relationship": "send_to",
            "source": "Send edits to Prof. Lamoreaux",
            "sourceType": "event",
            "target": "Prof. Lamoreaux",
            "targetType": "person",
            "context": null
          },
          {
            "relationship": "asked_of",
            "source": "Send edits to Prof. Lamoreaux",
            "sourceType": "event",
            "target": "Lemaire, Jan-Baptist",
            "targetType": "person",
            "context": null
          },
          {
            "relationship": "related_to",
            "source": "Sending edits tonight",
            "sourceType": "event",
            "target": "YJLH account",
            "targetType": "place",
            "context": "CC the YJLH account"
          }
        ]
      }


    // Test entity creation
    console.log('\nTesting entity creation...');
    
    // Create people
    console.log('Creating people nodes...');
    for (const person of sampleData.people) {
      await manager.createOrUpdatePerson(person);
    }
    console.log(`Created ${sampleData.people.length} people nodes`);
    
    // Create places
    console.log('Creating place nodes...');
    for (const place of sampleData.places) {
      await manager.createOrUpdatePlace(place);
    }
    console.log(`Created ${sampleData.places.length} place nodes`);
    
    // Create events
    console.log('Creating event nodes...');
    for (const event of sampleData.events) {
      await manager.createOrUpdateEvent(event);
    }
    console.log(`Created ${sampleData.events.length} event nodes`);
    
    // Create relationships
    console.log('\nTesting relationship creation...');
    for (const rel of sampleData.relationships) {
      await manager.createRelationship(rel);
    }
    console.log(`Created ${sampleData.relationships.length} relationships`);
    
    // Test querying
    console.log('\nTesting node querying...');
    const personCount = await manager.getNodeCount('Person');
    const placeCount = await manager.getNodeCount('Place');
    const eventCount = await manager.getNodeCount('Event');
    
    console.log(`Number of Person nodes: ${personCount}`);
    console.log(`Number of Place nodes: ${placeCount}`);
    console.log(`Number of Event nodes: ${eventCount}`);
    
    // Test relationship querying
    console.log('\nTesting relationship querying...');
    const relCount = await manager.getRelationshipCount();
    console.log(`Total number of relationships: ${relCount}`);
    
    // Query a specific person and their relationships
    console.log('\nTesting person query with relationships...');
    const personData = await manager.getPersonWithRelationships('Jan-Baptist Lemaire');
    console.log('Query results for Jan-Baptist Lemaire:');
    console.log(JSON.stringify(personData, null, 2));
    
    console.log('\nAll tests completed successfully!');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    // Close the Neo4j connection
    if (manager) {
      console.log('\nClosing Neo4j connection...');
      await manager.close();
      console.log('Connection closed');
    }
  }
}

// Run the test
testNeo4jManager()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });