// processEmails.js
const { processEmailFile, saveProcessedEmails } = require('./emailProcessorService');

// Path to your email CSV file
const EMAIL_FILE_PATH = './email_data.csv';
// Output path for processed emails (for debugging/verification)
const OUTPUT_PATH = './processed_emails.json';

async function main() {
  try {
    console.log('Starting email processing...');
    
    // Process the email file
    const processedEmails = await processEmailFile(EMAIL_FILE_PATH);
    
    // Save processed emails to JSON for verification
    await saveProcessedEmails(processedEmails, OUTPUT_PATH);
    
    console.log(`Successfully processed ${processedEmails.length} emails`);
    
    // Sample output of the first email
    if (processedEmails.length > 0) {
      console.log('\nSample of first processed email:');
      const firstEmail = processedEmails[0];
      console.log(`ID: ${firstEmail.id}`);
      console.log(`Subject: ${firstEmail.subject}`);
      console.log(`From: ${firstEmail.sender.name} <${firstEmail.sender.email}>`);
      console.log(`Recipients: ${firstEmail.recipients.map(r => `${r.name} <${r.email}>`).join(', ')}`);
      console.log(`Date: ${firstEmail.date}`);
      console.log(`Body (first 150 chars): ${firstEmail.body.substring(0, 150)}...`);
    }
    
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

main();