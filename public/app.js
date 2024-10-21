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
            await addMessageAndRunThread(threadId, message);
            console.log('message added to thread ' + threadId);
            
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

document.querySelector('.send-btn').addEventListener('click', async function() {
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

        // Add the message to the thread using the add-message API
        const threadId = localStorage.getItem('thread_id');
        await addMessageAndRunThread(threadId, message);
        console.log('message added to thread ' + threadId);
        
    }
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
            await addMessageAndRunThread(thread.id, "hi there");
        } else {
            console.error('Failed to create thread:', response.statusText);
        }
    } catch (error) {
        console.error('Error creating thread:', error);
    }
}

// Function to add a message to a thread and run it in one go
async function addMessageAndRunThread(threadId, messageContent) {
    try {
        // Change the text of the .share-button to "THINKING"
        document.querySelector('.thinktext').textContent = 'CHECKING KNOWLEDGEBASE';
        
        // Hide the SVG and show the loading image
        const mainSvg = document.querySelector('.main-svg');
        if (mainSvg) {
            mainSvg.classList.add('hide');
        }
        
        // Create and show the loading image
        let loadingImage = document.querySelector('.loading-image');
        if (!loadingImage) {
            loadingImage = document.createElement('img');
            loadingImage.src = './assets/loading.png';
            loadingImage.className = 'loading-image';
            loadingImage.style.width = '20px'; // Adjust size as needed
            loadingImage.style.height = '20px'; // Adjust size as needed
            mainSvg.parentNode.insertBefore(loadingImage, mainSvg);
        } else {
            loadingImage.classList.remove('hide');
        }
        console.log('hitting core api');
        
        const response = await fetch('https://coreapi.inovasolutions.ai/v1/workflows/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer app-7c6N4rFkAVCfG819M4bzfdjI'
            },
            body: JSON.stringify({
                inputs: {
                    thread_id: threadId,
                    user_message: messageContent
                },
                response_mode: 'blocking',
                user: 'abc-123'
            })
        });

        if (response.ok) {
            console.log('response recieved');
            
            const result = await response.json();
            const aiResponseText = result.data.outputs.text;

            // Check for an image URL in the response
            const imageUrlMatch = aiResponseText.match(/(.*\.(?:png|jpg|jpeg|gif))/i);
            const imageUrl = imageUrlMatch ? imageUrlMatch[0].replace(/.*(?=\.\/assets)/, '') : null;
            console.log(imageUrl);

            // Create a new message div for the AI response
            const chatSection = document.querySelector('.chat-section');
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'message';
            const messageLength = aiResponseText.length; // Calculate the length of the message
            aiMessageDiv.innerHTML = `
                <img src="/placeholder.svg?height=40&width=40" alt="AI" class="avatar-icon">
                <div class="message-content">${aiResponseText}</div>
            `;
            chatSection.appendChild(aiMessageDiv);
            $('.tlt').textillate();
            chatSection.scrollTop = chatSection.scrollHeight; // Scroll to the bottom

            // If an image URL is found, display the image
            if (imageUrl) {
                displayImage(imageUrl);
            }

            // return svg and text to normal
            const loadingImage = document.querySelector('.loading-image');
            if (loadingImage) {
                loadingImage.classList.add('hide');
            }
            if (mainSvg) {
                mainSvg.classList.remove('hide');
            }

            document.querySelector('.thinktext').textContent = 'READY';

    
        } else {
            console.error('Failed to run workflow:', response.statusText);
        }
    } catch (error) {
        console.error('Error running workflow:', error);
    }
}

// Function to display an image
function displayImage(imageUrl) {
    const modelViewer = document.getElementById('model');
    modelViewer.classList.add('hide');

    // Check if an image element with the class 'model-image' already exists
    let imageElement = document.querySelector('.model-image');
    if (imageElement) {
        // If it exists, just update the src attribute
        imageElement.src = imageUrl;
    } else {
        // Create a new image element to display the image
        imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.style.width = modelViewer.style.width;
        imageElement.style.height = modelViewer.style.height;
        imageElement.className = 'model-image';

        // Add click event to open the image in a modal
        imageElement.addEventListener('click', function() {
            const modal = document.createElement('div');
            modal.className = 'image-modal';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100vw';
            modal.style.height = '100vh';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
            modal.style.zIndex = '1000';

            const modalImage = document.createElement('img');
            modalImage.src = imageUrl;
            modalImage.style.width = '80vw';
            modalImage.style.height = '80vh';
            modalImage.classList.add('fs-image');

            modal.appendChild(modalImage);
            document.body.appendChild(modal);

            console.log('image display function complete');
            

            // Close the modal when clicked
            modal.addEventListener('click', function() {
                document.body.removeChild(modal);
            });
        });

        // Insert the image in place of the model viewer
        modelViewer.parentNode.insertBefore(imageElement, modelViewer.nextSibling);
    }
}

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

// Add event listeners to FAQ items
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', async function() {
        const threadId = localStorage.getItem('thread_id');
        const messageContent = this.textContent.trim();
        
        if (threadId && messageContent) {
            // Add the message to the chat section
            const chatSection = document.querySelector('.chat-section');
            const newMessage = document.createElement('div');
            newMessage.className = 'message user';
            newMessage.innerHTML = `<div class="message-content">${messageContent}</div>`;
            chatSection.appendChild(newMessage);
            chatSection.scrollTop = chatSection.scrollHeight;

            await addMessageAndRunThread(threadId, messageContent);
        } else {
            console.error('Thread ID or message content is missing.');
        }
    });
});





// Call the function on page load
window.addEventListener('load', createThreadOnLoad);













//old functions
// async function addMessageToThread(threadId, messageContent) {
//     try {
//         const response = await fetch('/api/add-message', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 thread_id: threadId,
//                 user_message: messageContent
//             })
//         });

//         if (response.ok) {
//             const message = await response.json();
//             console.log('Message added:', message);

//             // Start the initial run of the thread
//             runThread(threadId);
//         } else {
//             console.error('Failed to add message:', response.statusText);
//         }
//     } catch (error) {
//         console.error('Error adding message:', error);
//     }
// }

// // Function to run the thread using EventSource
// function runThread(threadId) {
//     const eventSource = new EventSource(`/api/run-thread?thread_id=${threadId}`);

//     // Create a new message div for the AI response
//     const chatSection = document.querySelector('.chat-section');
//     const aiMessageDiv = document.createElement('div');
//     aiMessageDiv.className = 'message';
//     aiMessageDiv.innerHTML = `
//         <img src="/placeholder.svg?height=40&width=40" alt="AI" class="avatar-icon">
//         <div class="message-content"></div>
//     `;
//     chatSection.appendChild(aiMessageDiv);

//     const messageContentDiv = aiMessageDiv.querySelector('.message-content');
//     let messageBuffer = ''; // Buffer to accumulate message data
//     let messageTimeout;

//     eventSource.onmessage = function(event) {
//         // Accumulate the received data
//         messageBuffer += event.data;

//         // Clear the previous timeout
//         clearTimeout(messageTimeout);

//         // Set a timeout to append the message after a short delay
//         messageTimeout = setTimeout(() => {
//             messageContentDiv.innerHTML += messageBuffer; // Use innerHTML to ensure HTML is parsed
//             chatSection.scrollTop = chatSection.scrollHeight; // Scroll to the bottom

//             // Check for specific keywords in the message
//             if (messageBuffer.includes('Propeller')) {
//                 prop.click();
//                 console.log('prop available');
                
//             } else if (messageBuffer.includes('engine')) {
//                 engine.click();
//             }

//             messageBuffer = ''; // Clear the buffer
//         }, 100); // Adjust the delay as needed
//     };

//     eventSource.onerror = function(error) {
//         console.error('Error with EventSource:', error);
//         eventSource.close();
//     };
// }
