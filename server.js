const express = require('express');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI(process.env.OPENAI_API_KEY);

// API endpoint to create an OpenAI thread
app.post('/api/create-thread', async (req, res) => {
    try {
        const thread = await openai.beta.threads.create({});
        res.status(200).json(thread);
    } catch (error) {
        console.error('Error creating thread:', error);
        res.status(500).json({ error: 'Failed to create thread' });
    }
});

// API endpoint to add a message to a thread
app.post('/api/add-message', async (req, res) => {
    const { thread_id, user_message } = req.body;

    if (!thread_id || !user_message) {
        return res.status(400).json({ error: 'thread_id and user_message are required' });
    }

    try {
        const message = await openai.beta.threads.messages.create(thread_id, {
            role: "user",
            content: user_message
        });
        res.status(200).json(message);
    } catch (error) {
        console.error('Error adding message to thread:', error);
        res.status(500).json({ error: 'Failed to add message to thread' });
    }
});

// API endpoint to run a thread with streaming
app.get('/api/run-thread', async (req, res) => {
    const { thread_id } = req.query;

    if (!thread_id) {
        return res.status(400).json({ error: 'thread_id is required' });
    }

    try {
        const run = openai.beta.threads.runs.stream(thread_id, {
            assistant_id: process.env.OPENAI_ASSISTANT_ID
        });

        run.on('textCreated', (text) => res.write('data: \n\n'))
           .on('textDelta', (textDelta, snapshot) => res.write(`data: ${textDelta.value}\n\n`))
           .on('end', () => res.end())
           .on('error', (error) => {
               console.error('Error during streaming:', error);
               res.status(500).json({ error: 'Failed to stream thread response' });
           });

        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
    } catch (error) {
        console.error('Error running thread:', error);
        res.status(500).json({ error: 'Failed to run thread' });
    }
});

app.post('/api/query-thread', async (req, res) => {
  const { thread_id } = req.body;
  const assistant_id = process.env.OPENAI_ASSISTANT_ID;

  try {
    let run = await openai.beta.threads.runs.createAndPoll(
      thread_id,
      { 
        assistant_id: assistant_id,
      }
    );

    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(
        run.thread_id
      );
      const responseMessages = messages.data.reverse().map(message => ({
        role: message.role,
        text: message.content[0].text.value
      }));
      res.json(responseMessages);
    } else {
      res.status(400).json({ status: run.status });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
