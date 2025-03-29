document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const modelList = document.getElementById('model-list');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const selectedModelSpan = document.getElementById('selected-model');

    // State
    let selectedModel = null;
    let isGenerating = false;

    // Ollama API endpoints
    const OLLAMA_BASE_URL = 'http://localhost:11434'; // Default Ollama API URL
    const MODELS_ENDPOINT = `${OLLAMA_BASE_URL}/api/tags`;
    const GENERATE_ENDPOINT = `${OLLAMA_BASE_URL}/api/generate`;

    // Fetch available models
    async function fetchModels() {
        try {
            const response = await fetch(MODELS_ENDPOINT);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            return data.models || [];
        } catch (error) {
            console.error('Error fetching models:', error);
            return [];
        }
    }

    // Display models in the UI
    function displayModels(models) {
        if (models.length === 0) {
            modelList.innerHTML = '<p class="error">No models found or couldn\'t connect to Ollama server. Make sure Ollama is running.</p>';
            return;
        }

        modelList.innerHTML = '';

        models.forEach(model => {
            const modelCard = document.createElement('div');
            modelCard.className = 'model-card';
            modelCard.textContent = model.name;
            modelCard.dataset.model = model.name;

            modelCard.addEventListener('click', () => {
                // Remove selected class from all models
                document.querySelectorAll('.model-card').forEach(card => {
                    card.classList.remove('selected');
                });

                // Add selected class to clicked model
                modelCard.classList.add('selected');

                // Update selected model
                selectedModel = model.name;
                selectedModelSpan.textContent = selectedModel;

                // Enable send button
                sendButton.disabled = false;

                // Add system message
                addMessage(`Model switched to ${selectedModel}`, 'bot');
            });

            modelList.appendChild(modelCard);
        });
    }

    // Add a message to the chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        // If it's a bot message, check for code blocks and format them
        if (sender === 'bot') {
            // Format code blocks (text between triple backticks)
            const formattedText = formatCodeBlocks(text);
            messageDiv.innerHTML = formattedText;
        } else {
            // For user messages, just use text content
            messageDiv.textContent = text;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Format code blocks and bullet points in text
    function formatCodeBlocks(text) {
        // First, escape any HTML to prevent XSS
        let escapedText = escapeHTML(text);

        // 1. Replace code blocks with formatted HTML
        // This regex matches code blocks with or without language specification
        const codeBlockRegex = /```(?:([\w-]+)\n)?([\s\S]*?)```/g;
        escapedText = escapedText.replace(codeBlockRegex, (match, language, code) => {
            // Trim the code to remove extra whitespace
            const trimmedCode = code.trim();
            const languageClass = language ? `language-${language}` : '';
            const languageLabel = language ? `<div class="code-language">${language}</div>` : '';

            return `<div class="code-container">${languageLabel}<pre class="code-block"><code class="${languageClass}">${trimmedCode}</code></pre></div>`;
        });

        // 2. Format bullet points (lines starting with - or *)
        // Convert bullet points to list items
        escapedText = escapedText.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');

        // Wrap consecutive list items with a proper list
        escapedText = escapedText.replace(/(<li>.+<\/li>\n)+/g, (match) => {
            return `<ul class="response-list">${match}</ul>`;
        });

        // 3. Format numbered lists (lines starting with numbers)
        escapedText = escapedText.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

        // Wrap consecutive numbered list items with a proper ordered list
        escapedText = escapedText.replace(/(<li>.+<\/li>\n)+/g, (match) => {
            // Only wrap in <ol> if not already wrapped in <ul>
            if (!match.startsWith('<ul>')) {
                return `<ol class="response-list">${match}</ol>`;
            }
            return match;
        });

        return escapedText;
    }

    // Escape HTML to prevent XSS attacks
    function escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Generate response from Ollama
    async function generateResponse(prompt) {
        if (!selectedModel) {
            addMessage('Please select a model first', 'bot');
            return;
        }

        try {
            isGenerating = true;

            // Create a temporary div for the bot's response
            const responseDiv = document.createElement('div');
            responseDiv.className = 'message bot-message';
            responseDiv.textContent = '...';
            chatMessages.appendChild(responseDiv);

            const response = await fetch(GENERATE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: selectedModel,
                    prompt: prompt,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            // Remove the temporary response div
            chatMessages.removeChild(responseDiv);

            // Add the formatted message
            addMessage(data.response, 'bot');
        } catch (error) {
            console.error('Error generating response:', error);
            // Remove the temporary response div if it exists
            if (responseDiv.parentNode === chatMessages) {
                chatMessages.removeChild(responseDiv);
            }
            addMessage('Error generating response. Please try again.', 'bot');
        } finally {
            isGenerating = false;
        }
    }

    // Handle send button click
    sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();

        if (message && !isGenerating) {
            // Add user message to chat
            addMessage(message, 'user');

            // Clear input
            userInput.value = '';

            // Generate response
            generateResponse(message);
        }
    });

    // Handle Enter key press
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });

    // Initialize
    async function init() {
        modelList.innerHTML = '<div class="loading"></div> Loading models...';

        const models = await fetchModels();
        displayModels(models);

        // Add welcome message
        addMessage('Welcome to Ollama Chat! Please select a model to start chatting.', 'bot');
    }

    init();
});