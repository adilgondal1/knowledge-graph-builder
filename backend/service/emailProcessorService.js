const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * Processes a CSV file containing email data where emails are separated by a row of dashes
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<Array>} - Array of processed emails
 */
async function processEmailFile(filePath) {
  try {
    // Read the entire file
    const data = await fs.promises.readFile(filePath, 'utf8');
    
    // Define the delimiter pattern that separates emails
    const emailDelimiter = '________________________________';
    
    // Split the file content by the delimiter to get individual emails
    const rawEmails = data.split(emailDelimiter).filter(email => email.trim() !== '');
    
    // Process each raw email chunk
    const processedEmails = rawEmails.map(rawEmail => parseEmail(rawEmail.trim()));
    
    console.log(`Successfully processed ${processedEmails.length} emails`);
    // saveProcessedEmails(processedEmails, "./proccessedEmails.txt")
    return processedEmails;
  } catch (error) {
    console.error('Error processing email file:', error);
    throw error;
  }
}

/**
 * Parses a raw email string into a structured format
 * @param {string} rawEmail - The raw email content
 * @returns {Object} - Structured email object
 */
function parseEmail(rawEmail) {
    // Generate a unique ID for the email
    const emailId = uuidv4();
    
    // Extract the subject line and other headers
    const lines = rawEmail.split('\n').map(line => line.trim());
    let subject = '';
    let fromLine = '';
    let toLine = '';
    let ccLine = '';
    let dateLine = '';
    let body = '';
    let bodyStartIndex = -1;
    
    // Parse headers first
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('Subject:')) {
        subject = line.substring('Subject:'.length).trim();
      } else if (line.startsWith('From:')) {
        fromLine = line.substring('From:'.length).trim();
      } else if (line.startsWith('To:')) {
        toLine = line.substring('To:'.length).trim();
      } else if (line.startsWith('Cc:')) {
        ccLine = line.substring('Cc:'.length).trim();
      } else if (line.startsWith('Sent:') || line.startsWith('Date:')) {
        dateLine = line.substring(line.indexOf(':') + 1).trim();
      } else if (line === '' && i < lines.length - 1 && bodyStartIndex === -1) {
        // First empty line after headers marks start of body
        bodyStartIndex = i + 1;
        break;
      }
    }
    
    // Extract body (everything after the headers)
    if (bodyStartIndex !== -1) {
      body = lines.slice(bodyStartIndex).join('\n');
    }
    
    // Extract sender information
    let sender = {
      name: '',
      email: ''
    };
    
    // Parse sender
    if (fromLine) {
      const emailMatch = fromLine.match(/<([^>]+)>/);
      if (emailMatch) {
        sender.email = emailMatch[1];
        sender.name = fromLine.substring(0, fromLine.indexOf('<')).trim();
      } else {
        sender.name = fromLine;
      }
    }
    
    // Process recipients
    const recipients = [];
    
    // Process TO recipients
    if (toLine) {
      // Split by semicolons to get individual recipients
      const toParts = toLine.split(';').map(part => part.trim()).filter(part => part.length > 0);
      
      for (const part of toParts) {
        const emailMatch = part.match(/<([^>]+)>/);
        if (emailMatch) {
          // Get everything before the email as the name
          const nameEnd = part.indexOf('<');
          const name = nameEnd > 0 ? part.substring(0, nameEnd).trim() : '';
          
          recipients.push({
            name: name,
            email: emailMatch[1],
            type: 'to'
          });
        } else {
          // No email found, just use the whole part as name
          recipients.push({
            name: part,
            email: '',
            type: 'to'
          });
        }
      }
    }
    
    // Process CC recipients
    if (ccLine) {
      // Split by semicolons to get individual recipients
      const ccParts = ccLine.split(';').map(part => part.trim()).filter(part => part.length > 0);
      
      for (const part of ccParts) {
        const emailMatch = part.match(/<([^>]+)>/);
        if (emailMatch) {
          // Get everything before the email as the name
          const nameEnd = part.indexOf('<');
          const name = nameEnd > 0 ? part.substring(0, nameEnd).trim() : '';
          
          recipients.push({
            name: name,
            email: emailMatch[1],
            type: 'cc'
          });
        } else {
          // No email found, just use the whole part as name
          recipients.push({
            name: part,
            email: '',
            type: 'cc'
          });
        }
      }
    }
    
    return {
      id: emailId,
      subject,
      sender,
      recipients,
      date: dateLine,
      body,
      rawContent: rawEmail
    };
  }

/**
 * Save processed emails to a JSON file for debugging/backup
 * @param {Array} emails - Processed email objects
 * @param {string} outputPath - Path for the output JSON file
 */
async function saveProcessedEmails(emails, outputPath) {
  try {
    await fs.promises.writeFile(
      outputPath, 
      JSON.stringify(emails, null, 2),
      'utf8'
    );
    console.log(`Saved ${emails.length} processed emails to ${outputPath}`);
  } catch (error) {
    console.error('Error saving processed emails:', error);
    throw error;
  }
}

module.exports = {
  processEmailFile,
  parseEmail,
  saveProcessedEmails
};