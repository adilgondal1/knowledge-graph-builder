const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { processEmailFile } = require('./service/emailProcessorService');
const Neo4jManager = require('./db/neo4jManager');
const LlmExtractionService = require('./service/llmExtractionService');
require('dotenv').config();


const app = express();
const PORT = 6000;

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueFileName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueFileName);
  }
});

// File filter to accept only CSV files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// API endpoint for CSV upload
app.post('/api/upload-csv', upload.single('file'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded or file type is not CSV'
      });
    }

    // Return success response immediately
    res.status(200).json({
      success: true,
      message: 'CSV uploaded successfully. Processing started.'
    });

    // Process the file asynchronously
    processUploadedCSV(req.file.path)
      .then(() => {
        console.log('CSV processing completed successfully');
      })
      .catch(error => {
        console.error('Error processing CSV:', error);
      });
      
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred during upload'
    });
  }
});

// Function to process the uploaded CSV file
async function processUploadedCSV(filePath) {
  let neo4jManager;
  try {
    console.log('Starting Knowledge Graph Builder...');
    
    // Initialize Neo4j connection
    neo4jManager = new Neo4jManager({
        uri: process.env.NEO4J_URI,
        username: process.env.NEO4J_USERNAME,
        password: process.env.NEO4J_PASSWORD
      });
      
    
    // Initialize LLM service
    const llmService = new LlmExtractionService({
        apiKey: process.env.LLM_API_KEY,
        model: process.env.LLM_MODEL
      });
    
    // Process email file
    console.log(`Processing email file: ${filePath}`);
    const emails = await processEmailFile(filePath);
    console.log(`Found ${emails.length} emails to process`);
    
    // Process each email
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      console.log(`Processing email ${i+1}/${emails.length}: ${email.subject}`);
      
      try {
        
        // Extract entities and relationships using LLM
        const extractedData = await llmService.extractEntities(email);
        
        // Store extracted entities and relationships in Neo4j
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
    throw error;
  } finally {
    // Clean up resources
    if (neo4jManager) {
      await neo4jManager.close();
    }
  }
}

// Catch-all handler to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});