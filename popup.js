// Function to make an API call to GPT-3.5 with exponential backoff
async function getSupportFromAI(userInput, apiKey, retryCount = 0) {
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    // The system message context is changed to reflect mental health support
    const systemMessage = 'You are an AI assistant on an extension: This is your role - if you deem the users question to be unrelated, do not answer the question. Mental Health Buddy Purpose: Promote mental well-being. Features:Offer mindfulness exercises or guided meditations.Provide an empathetic ear for journaling or venting.Suggest resources based on mood (e.g., uplifting videos or articles).Schedule reminders for self-care practices. Make sure to elborate heavily on any advice you give and be as specific as possible, Give sources of your advice';

    const messages = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userInput }
    ];

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages
            })
        });

        if (response.status === 429) {
            const initialDelay = 5000; // 5 seconds initial delay for exponential backoff
            const delay = initialDelay * Math.pow(2, retryCount);
            console.log(`Retrying after ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return getSupportFromAI(userInput, apiKey, retryCount + 1); // Retry the request
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch AI response. Status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content; // Return the AI response
    } catch (error) {
        console.error('Error during API call:', error);
        return 'An error occurred while fetching support. Please try again.';
    }
}

// Function to format and display the AI response on the UI
function displayResponseOnUI(response) {
    const resultDiv = document.getElementById('aiResponse');
    resultDiv.innerHTML = ''; // Clear previous content

    const formattedResponse = response.split('\n').map(line => {
        if (line.startsWith('-') || line.startsWith('*')) {
            return `<li>${line.slice(1).trim()}</li>`; // Format bullet points
        }
        return `<p>${line.trim()}</p>`; // Format regular paragraphs
    });

    const responseHTML = `<ul>${formattedResponse.join('')}</ul>`;
    resultDiv.innerHTML = responseHTML;
}

// Main function to handle user input and provide AI support
function getSupport() {
    const userInput = document.getElementById('userInput').value.trim();
    const solveButton = document.getElementById('solveButton');

    if (!userInput) {
        alert('Please share your thoughts or concerns.');
        return;
    }

    const apiKey = ''
    const startTime = Date.now();

    getSupportFromAI(userInput, apiKey)
        .then(response => {
            displayResponseOnUI(response);
        })
        .catch(error => {
            console.error('Error:', error);
            displayResponseOnUI('An error occurred. Please try again.');
        })
        .finally(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
            const remainingTime = Math.max(60 - elapsedTime, 0);
            updateCounter(remainingTime);

            solveButton.classList.add('clicked');
            setTimeout(() => {
                solveButton.classList.remove('clicked');
            }, 300);
        });
}



// Set the initial state and add event listeners
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('solveButton').addEventListener('click', getSupport);
});
