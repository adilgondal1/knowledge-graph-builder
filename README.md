# Knowledge Graph Builder

A tool to extract entities and relationships from emails and build a knowledge graph in Neo4j.

## Overview

This application processes CSV files containing email data, extracts entities (people, places, events) and their relationships using the Gemini API, and stores them in a Neo4j graph database. It provides a simple web interface for uploading CSV files and visualizing the resulting knowledge graph.

## Features

- CSV file upload via a drag-and-drop interface
- Email processing and entity extraction
- Storage of entities and relationships in Neo4j
- Tracking of entity mentions across emails
- Simple web interface for interacting with the knowledge graph

## Prerequisites

- Node.js
- Neo4j Database
- Google Gemini API key

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/knowledge-graph-builder.git
   cd knowledge-graph-builder
   ```

2. Install dependencies:

   ```
   npm install
   npm run client-install
   ```

3. Set up environment variables:
   Edit `.env` to add your Neo4j credentials and Gemini API key.

## Configuration

Edit the `.env` file to configure:

- Server port (default is 6000)
- Neo4j connection details
- Gemini API settings

## Usage

1. Start the server:

   ```
   cd backend
   npm run server
   ```

2. Start the client. In a new terminal:
   ```
   cd client
   npm run start
   ```
3. Start your local Neo4j database

4. Open your browser and navigate to:

   ```
   http://localhost:3000
   ```

5. Use the file upload area to upload a CSV file containing email data.

6. The application will process the CSV, extract entities and relationships, and store them in the Neo4j database.

## CSV Format

Your CSV file should contain email data with the following columns:

- id: Unique identifier for the email
- subject: Email subject
- sender_name: Name of the sender
- sender_email: Email address of the sender
- recipients: Comma-separated list of recipients
- date: Date the email was sent
- body: Content of the email

## Project Structure

- `client/`: React frontend
- `backend/`: Node backend
- `db/`: Neo4j database interaction
- `services/`: External API services (Gemini)
- `uploads/`: Directory for uploaded CSV files
- `server.js`: Main Express server

## Development

- Backend server runs on port 6000 by default
- Frontend development server runs on port 3000
- API endpoints are proxied from the frontend to the backend
