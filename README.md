# Ollama Chat Interface

A simple web-based interface for interacting with Ollama models. This application allows you to:

1. View all available Ollama models
2. Select a model to chat with
3. Send messages and receive responses from the selected model

## Prerequisites

- [Ollama](https://ollama.ai/) installed and running on your machine
- A web browser with JavaScript enabled
- Node.js (optional, for running the included server)

## Setup and Usage

### Method 1: Using the included Node.js server (Recommended)

1. Make sure Ollama is running on your machine. By default, Ollama runs on port 11434.

2. Open a terminal in the project directory and run:
   ```
   node server.js
   ```

3. Open your browser and navigate to `http://localhost:3000`

4. The application will connect to the Ollama API and fetch available models.

5. Select a model from the list by clicking on it.

6. Start chatting with the selected model using the text input at the bottom of the page.

### Method 2: Opening the HTML file directly

1. Make sure Ollama is running on your machine. By default, Ollama runs on port 11434.

2. Open the `index.html` file in a web browser. You can do this by:
   - Double-clicking the file
   - Dragging the file into a browser window

   Note: This method may encounter CORS issues when trying to connect to the Ollama API.

## Features

- **Model Selection**: View and select from all available Ollama models
- **Chat Interface**: Simple and intuitive chat interface
- **Dark Theme**: Modern dark color scheme for reduced eye strain and better readability
- **Enhanced Formatting**:
  - **Code Block Formatting**: Properly formats code blocks with language labels
  - **List Formatting**: Formats bullet points and numbered lists for better readability
- **Responsive Design**: Works on desktop and mobile devices

## Troubleshooting

- **No models showing up?** Make sure Ollama is running and accessible at `http://localhost:11434`
- **Error generating responses?** Check the browser console for more detailed error messages

## Customization

You can customize this application by:

- Modifying the CSS in `styles.css` to change the appearance
- Updating the JavaScript in `script.js` to add new features or change behavior
- Editing the HTML in `index.html` to modify the structure

## CORS Issues

If you encounter CORS (Cross-Origin Resource Sharing) issues when trying to connect to Ollama, you may need to:

1. Run Ollama with CORS headers enabled
2. Use a CORS proxy
3. Run this application from a local development server

## Security Note

This application is designed for local use only. It connects directly to your local Ollama instance and should not be deployed on a public server without proper security measures.