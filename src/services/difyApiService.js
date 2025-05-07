// src/services/difyApiService.js
import axios from 'axios';

// !! ====================================================================== !!
// !! IMPORTANT: REPLACE THESE PLACEHOLDERS WITH YOUR ACTUAL DIFY API VALUES !!
// !! ====================================================================== !!
// You can get these from your Dify application settings.

// Option 1: Directly replace the string values here:
// const DIFY_API_BASE_URL = 'https://api.dify.ai/v1'; // Example if not using a proxy
const DIFY_API_BASE_URL = 'http://118.89.121.18/v1'; // Your existing proxy path
const DIFY_API_KEY = 'app-IyxsSI81vcY9OLfbOKDL4XkQ'; // Your Dify App API Key (MAKE SURE THIS IS CORRECT)

// Option 2: Or, use environment variables (recommended for security)
// Create a .env file in your project's root directory with:
// REACT_APP_DIFY_API_BASE_URL=/v1 (or your actual base URL)
// REACT_APP_DIFY_API_KEY=app-yourdifyapikey
// Then uncomment these lines and comment out the direct assignments above:
// const DIFY_API_BASE_URL = process.env.REACT_APP_DIFY_API_BASE_URL;
// const DIFY_API_KEY = process.env.REACT_APP_DIFY_API_KEY;
// !! ====================================================================== !!
// !! END OF IMPORTANT CONFIGURATION SECTION                                 !!
// !! ====================================================================== !!

// This function is for "blocking" mode as per your existing setup.
// Streaming will be handled directly in ChatWindow.js using fetch.
export const sendBlockingMessageToDify = async (message, conversationId, userId = 'react-chat-user-123') => {
    const DIFY_CHAT_MESSAGES_URL = `${DIFY_API_BASE_URL}/chat-messages`;

    if (!DIFY_API_BASE_URL || DIFY_API_BASE_URL === 'YOUR_DIFY_API_ENDPOINT_HERE' || DIFY_API_BASE_URL.length < 2 || // Adjusted length check
        !DIFY_API_KEY || DIFY_API_KEY === 'YOUR_DIFY_API_KEY_HERE' || DIFY_API_KEY.length < 15) {
        console.warn(
            "Dify API URL or Key is not configured or is still a placeholder in src/services/difyApiService.js. " +
            "Please update it with your actual Dify API credentials. Using a mock API response for blocking mode."
        );
        return new Promise(resolve => setTimeout(() => {
            resolve({
                reply: `Mock Blocking Response: You sent "${message}". API Key/URL not configured.`,
                newConversationId: conversationId || `conv_mock_blocking_${Date.now()}`
            });
        }, 800));
    }

    const payload = {
        query: message,
        user: userId,
        response_mode: "blocking",
        inputs: {},
    };

    if (conversationId) {
        payload.conversation_id = conversationId;
    }

    console.log('Sending blocking payload to Dify:', payload, "to URL:", DIFY_CHAT_MESSAGES_URL);

    try {
        const response = await axios.post(DIFY_CHAT_MESSAGES_URL, payload, {
            headers: {
                'Authorization': `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Received blocking response from Dify:', response.data);

        if (response.data && response.data.answer) {
            return {
                reply: response.data.answer,
                newConversationId: response.data.conversation_id || conversationId
            };
        } else {
            console.error('Dify blocking response did not contain an answer:', response.data);
            throw new Error('AI response format is incorrect (blocking).');
        }
    } catch (error) {
        console.error('Error calling Dify API (blocking):', error.response ? error.response.data : error.message);
        let errorMessage = 'Failed to get blocking response from AI.';
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = `AI Error (blocking): ${error.response.data.message}`;
        } else if (error.message) {
            errorMessage = `Network or AI Error (blocking): ${error.message}`;
        }
        throw new Error(errorMessage);
    }
};

// Export constants to be used by ChatWindow.js for streaming
export { DIFY_API_BASE_URL, DIFY_API_KEY };