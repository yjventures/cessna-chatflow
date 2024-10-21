const { Configuration, OpenAIApi } = require('openai');

// Initialize OpenAI API with your API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// IDs for the assistants
const PARTS_HANDLER = 'asst_SPAdphjA52rd1B5R6dmdMOba';
const SERVICING_ASSISTANT = 'asst_frt1tLrVxQEhZPQOvSW9RBpF';
const HTML_ASSISTANT = 'asst_cqnENXm2IwAEx7RKlqB9O139';
const CESSNA_ASSISTANT = 'asst_UHNluAWbjEIoWahVP6gy87eZ';

// Helper function to query an assistant
async function queryAssistant(assistantId, prompt) {
  try {
    const response = await  openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Assistant ID: ${assistantId}\n${prompt}`,
      max_tokens: 1000,
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error(`Error querying ${assistantId}:`, error);
    throw error;
  }
}

// Main function that connects and coordinates assistants
async function handleUserQuery(userQuery) {
  try {
    // Step 1: Query Parts Handler and Servicing Assistant
    const partsHandlerResponse = await queryAssistant(PARTS_HANDLER, userQuery);
    console.log('Parts Handler Response:', partsHandlerResponse);

    const servicingAssistantResponse = await queryAssistant(SERVICING_ASSISTANT, userQuery);
    console.log('Servicing Assistant Response:', servicingAssistantResponse);

    // Step 2: Combine responses and send to HTML Assistant for formatting
    const combinedResponse = `Parts Handler Response:\n${partsHandlerResponse}\n\nServicing Assistant Response:\n${servicingAssistantResponse}`;
    const htmlFormattedResponse = await queryAssistant(HTML_ASSISTANT, combinedResponse);
    console.log('HTML Assistant Response:', htmlFormattedResponse);

    // Step 3: Pass HTML formatted response to Cessna Assistant for expert advice
    const finalResponse = await queryAssistant(CESSNA_ASSISTANT, htmlFormattedResponse);
    console.log('Cessna Assistant Final Response:', finalResponse);

    return finalResponse;
  } catch (error) {
    console.error('Error handling user query:', error);
    return 'An error occurred while processing your request.';
  }
}
