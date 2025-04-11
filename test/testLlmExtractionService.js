const LlmExtractionService = require('../service/llmExtractionService');
require('dotenv').config({ path: '../.env' });

/**
 * Test function to verify the LlmExtractionService with Gemini API
 */
async function testExtractionService() {
  try {
    // Create service instance with configuration
    console.log("API KEY", process.env.GEMINI_API_KEY)
    const service = new LlmExtractionService({
      apiKey: "AIzaSyASAaMGSn7JPmnsMSMi20rCHpnkqPps7qg", // Store your API key in .env file
      model: 'gemini-2.0-flash' // Or use another Gemini model
    });

    // Sample email object
    const sampleEmail = {
      id: 'email-123',
      subject: 'Meeting to discuss Smith v. Johnson case',
      sender: {
        name: 'Jane Doe',
        email: 'jane.doe@lawfirm.com'
      },
      recipients: [
        {
          name: 'John Smith',
          email: 'john.smith@client.com'
        },
        {
          name: 'Legal Team',
          email: 'legal@lawfirm.com'
        }
      ],
      date: '2025-04-05T10:30:00Z',
      body: `
Dear John and Legal Team,

I hope this email finds you well. I'd like to schedule a meeting to discuss the ongoing Smith v. Johnson case next Thursday at our New York office.

Our associate Sarah Williams has prepared a detailed analysis that she'll present during the meeting. Judge Roberts has set the court date for May 15th at the Downtown Courthouse.

Michael Thompson from Johnson Enterprises has indicated they're open to settlement discussions. Their legal counsel, Davis & Partners, will be represented by Robert Davis himself.

Please confirm your availability for the meeting. I've also invited our paralegal, Tom Brown, to help with the documentation.

Best regards,
Jane Doe
Senior Partner
Law Offices of Wilson & Associates
      `
    };

    const sampleEmail2 =   {
        id: "359bafd6-5f75-419e-a80e-77ce90e111c0",
        subject: "Re: Prof. Lamoreaux Comment",
        sender: {
          name: "Lemaire, Jan-Baptist",
          email: "jan-baptist.lemaire@yale.edu"
        },
        recipients: [
          {
            name: "Meosky, Paul",
            email: "paul.meosky@yale.edu",
            type: "to"
          },
          {
            name: "Yale Journal of Law and Humanities",
            email: "yjlh@yale.edu",
            type: "cc"
          },
          {
            name: "Antill, Gregory",
            email: "gregory.antill@yale.edu",
            type: "cc"
          }
        ],
        date: "Monday, October 25, 2021 11:10 PM",
        body: "Hi Paul,\n\nI am supposed to send my edits directly to prof. Lamoreaux? Would you have their e-mail address? Thank you!\n\nBest wishes,\n\nJan-Baptist\nOn 25 Oct 2021, 20:21 -0400, Meosky, Paul <paul.meosky@yale.edu>, wrote:\n\n\nHi Jan-Baptist,\n\nOh! That's fine. Please do send tonight, and cc the YJLH account.\n\nBest,\nPaul",
      }

    console.log('Testing LlmExtractionService with Gemini API...');
    console.log('Sample email:', JSON.stringify(sampleEmail2, null, 2));
    
    // Extract entities from the sample email
    const result = await service.extractEntities(sampleEmail2);
    console.log(result)
    return result;
  } catch (error) {
    console.error('Test failed with error:', error);
    if (error.response) {
      console.error('API response error:', error.response.data);
    }
  }
}

// Run the test
testExtractionService()
  .then(() => console.log('Test completed'))
  .catch(err => console.error('Unhandled error in test:', err));