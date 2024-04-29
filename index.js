const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const messagesList = document.getElementById("messages");
const listenButton = document.getElementById("listen");
listenButton.style.backgroundColor = "#e6e6e6";
const sendButton = document.getElementById("send");

recognition.continuous = false; // Listen for a single phrase
recognition.interimResults = true; // Show interim results



TOKEN = "ya29.a0Ad52N39zz7l_TLzSgvFC9TSXIx8BTnUW8un2-NrANCiRr-3EjTASXh2xacTEU-I9M4wtHRyiWInt9kl_YtDSLyg5sDqnMM4yBBmGa32iB-brgkMWQon4N4wHhceU-KTgdcUhBXs-zGLbrR4odZHAh3FhVTye2pthflxUDrIlwL1x2yjRKdYHqmlhCMZKgEJJ6nncIMGvSa3beTr1hqS7hCqmPiavV7j4alpdgBND_3CYqb3rbvUbOSBRfLT7ud6810wTReWvTLUWxZCiNskBZ-xki3AIMdkATgeo4SoFkZvSsFqngKX4J8_xiKHOqw-unAseaRdrf9JQlQqtHTExfHFBAR5vPxKtTkleJqfronb4GowUSysJk4h3nfJDAu_xXflAldReOAt3158ToKehuSs98gtNmQwXaCgYKARESARASFQHGX2Mi-IKBztlSUoz3BOdYfCBrvA0423"




function generateSessionId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let sessionId = '';
    for (let i = 0; i < length; i++) {
        sessionId += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return sessionId;
}

SESSION_ID = generateSessionId(6)

listenButton.addEventListener("click", () => {
    listenButton.style.backgroundColor = "#4CAF50";
    recognition.start();
    messageInput.value = ""; // Clear input
    messageInput.disabled = true; // Disable input while listening
});

recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join("");

    messageInput.value = transcript; // Show transcript in input
    messageInput.disabled = false; // Re-enable input
};

recognition.onend = () => {
    listenButton.disabled = false; // Re-enable listen button
};

sendButton.addEventListener("click", () => {
    sendMessage();
    listenButton.style.backgroundColor = "#e6e6e6";
});

function sendMessage() {
    const message = messageInput.value;
    // if (message.trim() !== "") { // Don't send empty messages
    // }
    addMessage("You: " + message, false);
    // Call Dialogflow API to get bot's reply
    callDialogflowAPI(message);
    messageInput.value = ""; // Clear input after sending
}

function callDialogflowAPI(userMessage) {
    // Dialogflow API endpoint
    const apiUrl = `https://global-dialogflow.googleapis.com/v3/projects/search-conversation/locations/global/agents/db219c9f-e50e-4e1e-850c-e7a4f738f88f/sessions/${SESSION_ID}:detectIntent`;

    // API request data
    const requestData = {
        queryInput: {
            text: {
                text: userMessage
            },
            languageCode: "en"
        },
        queryParams: {
            timeZone: "America/Los_Angeles"
        }
    };

    // API request headers
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'x-goog-user-project': 'search-conversation',
        'Authorization': 'Bearer ' + TOKEN
    };

    // Fetch API call to Dialogflow
    fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestData)
    })
        .then(response => response.json())
        .then(data => {
            const botResponse = data["queryResult"]["responseMessages"]
            for (let i = 0; i < botResponse.length; i++) {
                console.log(botResponse[i])
                addMessage("Fantasy AI: " + botResponse[i]["text"]["text"][0], true); // Add bot's response to messages list
            }
            

        })
        .catch((error) => {
            alert("Please enter valid API token")
            return console.error('Error calling Dialogflow API:', error)
            
        });
}

function addMessage(message, fromBot, isTyping = false) {
    const newMessageItem = document.createElement("li");
    if (fromBot == false) {
        newMessageItem.style.textAlign = "right";
    }
 

    newMessageItem.textContent = message;
    messagesList.appendChild(newMessageItem);
    
}
