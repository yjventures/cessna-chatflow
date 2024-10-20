// model assets
const aircraft = document.getElementById('aircraft');
const engine = document.getElementById('engine');
const prop = document.getElementById('prop');

document.querySelector('.message-input').addEventListener('keypress', async function(e) {
    if (e.key === 'Enter') {
        const message = this.value.trim();
        if (message) {
            const chatSection = document.querySelector('.chat-section');
            const newMessage = document.createElement('div');
            newMessage.className = 'message user';
            newMessage.innerHTML = `<div class="message-content">${message}</div>`;
            chatSection.appendChild(newMessage);
            chatSection.scrollTop = chatSection.scrollHeight;
            this.value = '';

            // Add the message to the thread using the add-message API
            const threadId = localStorage.getItem('thread_id');
            await addMessageToThread(threadId, message);
            // setTimeout(() => runThread(threadId), 1000);

            // if (threadId) {
            //     await addMessageToThread(threadId, message);

            //     // Run the thread with the thread_id
            //     runThread(threadId);
            // } else {
            //     console.error('No thread ID found in local storage.');
            // }
        }
    }
});

document.querySelector('.send-btn').addEventListener('click', function() {
    const input = document.querySelector('.message-input');
    const message = input.value.trim();
    if (message) {
        const chatSection = document.querySelector('.chat-section');
        const newMessage = document.createElement('div');
        newMessage.className = 'message user';
        newMessage.innerHTML = `<div class="message-content">${message}</div>`;
        chatSection.appendChild(newMessage);
        chatSection.scrollTop = chatSection.scrollHeight;
        input.value = '';
    }
});

// Add event listeners to the model selector images
document.querySelectorAll('.model-selector').forEach(img => {
    img.addEventListener('click', function() {
        const modelViewer = document.getElementById('model');
        modelViewer.src = this.dataset.src;
        
        // Update the avatar name and title
        const avatarName = document.querySelector('.avatar-name');
        const avatarTitle = document.querySelector('.avatar-title');
        
        switch(this.alt) {
            case 'Cessna 152':
                avatarName.textContent = 'CESSNA 152';
                avatarTitle.textContent = 'AI SUPPORT GENIUS';
                break;
            case 'Wasp Engine':
                avatarName.textContent = 'WASP ENGINE';
                avatarTitle.textContent = 'AI SUPPORT GENIUS';
                break;
            case '3BP':
                avatarName.textContent = 'THREE BLADE PROP';
                avatarTitle.textContent = 'AI SUPPORT GENIUS';
                break;
        }
    });
});

// Function to create a thread and save the ID to local storage
async function createThreadOnLoad() {
    try {
        const response = await fetch('/api/create-thread', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const thread = await response.json();
            localStorage.setItem('thread_id', thread.id);
            console.log('Thread created with ID:', thread.id);

            // Add a message to the thread
            await addMessageToThread(thread.id, "hi there");
        } else {
            console.error('Failed to create thread:', response.statusText);
        }
    } catch (error) {
        console.error('Error creating thread:', error);
    }
}

// Function to add a message to a thread
async function addMessageToThread(threadId, messageContent) {
    try {
        const response = await fetch('/api/add-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                thread_id: threadId,
                user_message: messageContent
            })
        });

        if (response.ok) {
            const message = await response.json();
            console.log('Message added:', message);

            // Start the initial run of the thread
            runThread(threadId);
        } else {
            console.error('Failed to add message:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding message:', error);
    }
}

// Function to run the thread using EventSource
function runThread(threadId) {
    const eventSource = new EventSource(`/api/run-thread?thread_id=${threadId}`);

    // Create a new message div for the AI response
    const chatSection = document.querySelector('.chat-section');
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'message';
    aiMessageDiv.innerHTML = `
        <img src="/placeholder.svg?height=40&width=40" alt="AI" class="avatar-icon">
        <div class="message-content"></div>
    `;
    chatSection.appendChild(aiMessageDiv);

    const messageContentDiv = aiMessageDiv.querySelector('.message-content');
    let messageBuffer = ''; // Buffer to accumulate message data
    let messageTimeout;

    eventSource.onmessage = function(event) {
        // Accumulate the received data
        messageBuffer += event.data;

        // Clear the previous timeout
        clearTimeout(messageTimeout);

        // Set a timeout to append the message after a short delay
        messageTimeout = setTimeout(() => {
            messageContentDiv.innerHTML += messageBuffer; // Use innerHTML to ensure HTML is parsed
            chatSection.scrollTop = chatSection.scrollHeight; // Scroll to the bottom

            // Check for specific keywords in the message
            if (messageBuffer.includes('Propeller')) {
                prop.click();
                console.log('prop available');
                
            } else if (messageBuffer.includes('engine')) {
                engine.click();
            }

            messageBuffer = ''; // Clear the buffer
        }, 100); // Adjust the delay as needed
    };

    eventSource.onerror = function(error) {
        console.error('Error with EventSource:', error);
        eventSource.close();
    };
}

// Call the function on page load
window.addEventListener('load', createThreadOnLoad);
