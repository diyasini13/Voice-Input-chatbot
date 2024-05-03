
const chatbox = document.getElementById("chatbox");
const messageInput = document.getElementById("messageInput");
const messagesList = document.getElementById("messages");
const listenButton = document.getElementById("listen");
listenButton.style.backgroundColor = "#e6e6e6";
const sendButton = document.getElementById("send");
let recordingStatus = { isRecording: false, mediaRecorder: null }; // Define recordingStatus variable

// API_KEY = 'AIzaSyDHmK5lKzxWGWO-rMKnec5n0Qm7edE5ESo'
// CLIENT_ID = '<846492264424-6bpkek70bnv1kuou9um4da1bqf0sjdd4.apps.googleusercontent.com'

TOKEN = "[TOKEN]";
let DETECTED_LANGUAGE = "en"


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


//Start Recording using browser mic
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then((stream) => {
            const options = {
                mimeType: "audio/webm;codecs=opus",
            };
            const mediaRecorder = new MediaRecorder(stream, options);

            // mediaRecorder.ondataavailable = function (event) {
            //     const blob = event.data;

            //     const encoding = blob.type;

            //     console.log("ENCODING: ", encoding);
            // };
            recordingStatus.mediaRecorder = mediaRecorder;

            const audioChunks = [];

            mediaRecorder.addEventListener('dataavailable', event => {
                audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener('stop', () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();

                reader.readAsDataURL(audioBlob);

                reader.onloadend = () => {
                    let base64data = reader.result;
                    base64data = base64data.replace('data:audio/webm;base64,', '');
                    convertAudioToText(base64data);
                };
            });

            mediaRecorder.start();
            recordingStatus.isRecording = true;
            listenButton.style.backgroundColor = "#4CAF50";
            messageInput.disabled = true;
        })
        .catch((err) => {
            console.error('Error starting recording:', err);
        });
}

function stopRecording() {
    if (recordingStatus.mediaRecorder && recordingStatus.isRecording) {
        recordingStatus.mediaRecorder.stop();
        recordingStatus.isRecording = false;
        listenButton.style.backgroundColor = "#e6e6e6";
        messageInput.disabled = false;
    }
}

listenButton.addEventListener("click", () => {
    if (!recordingStatus.isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
});

//--------------------------------------------------------------------------------------------------------//

async function convertAudioToText(audioData) {
    const apiUrl = `https://speech.googleapis.com/v1/speech:recognize`;
  
    const requestData = {
        config: {
            encoding: 'WEBM_OPUS', 
            languageCode: 'en-IN', 
            enableAutomaticPunctuation: true,
            model: "default"
        },
        audio: {
            content: audioData
        },
    };
    const headers = {
        "Content-Type": "application/json",
        'x-goog-user-project': 'search-conversation',
        'Authorization': 'Bearer ' + TOKEN
    };
    try {
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData),
        });
         
        if (response.ok) {
            const data = await response.json();
            if (response.ok) {
                if (data.results && data.results.length > 0) {
                    const transcript = data.results[0].alternatives[0].transcript;
                    messageInput.value = transcript;
                    let NEW_DETECTED_LANGUAGE = await detectLanguageFromText(transcript)
                   
                    if (NEW_DETECTED_LANGUAGE != "und"){
                        DETECTED_LANGUAGE = NEW_DETECTED_LANGUAGE
                    }
                    messageInput.disabled = false;
                }
            }
        } else {
            throw new Error('Failed to transcribe audio');
        }
    } catch (error) {
        console.error('Error in transcribeAudio:', error);
    }
}



// Detect the language from the user audio
let detectedLanguage = ""
let languageCode = ""
async function detectLanguageFromText(text) {
    const apiUrl = `https://translation.googleapis.com/language/translate/v2/detect`;

    const requestData = {
        q: text
    };

    const headers = {
        "Content-Type": "application/json",
        'x-goog-user-project': 'search-conversation',
        'Authorization': 'Bearer ' + TOKEN
    };
    let detectedLanguage = "en"
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData),
        });
        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.detections && data.data.detections.length > 0) {
                detectedLanguage = data.data.detections[0][0].language;
                console.log(data)
                console.log("Detected Language:", detectedLanguage);
                if (detectedLanguage.includes('Latn')) {
                    detectedLanguage = detectedLanguage.replace("-Latn", "-IN")
                    
                }
                if (detectedLanguage == "en"){
                    detectedLanguage = "en-IN"
                }
                console.log("Updated Language Code:", detectedLanguage);
            }
        } else {
            throw new Error('Failed to detect language');
        }
    } catch (error) {
        console.error('Error in detectLanguage:', error);
    }
    return detectedLanguage
}



//Traanslate the output from the audio using the detected language
async function translateText(text, toLanguage) {
    const apiUrl = `https://translation.googleapis.com/language/translate/v2/`;

    const requestData = {
        q: text,
        target: toLanguage
    };

    const headers = {
        "Content-Type": "application/json",
        'x-goog-user-project': 'search-conversation',
        'Authorization': 'Bearer ' + TOKEN
    };
    let translatedTextOutput = ""
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestData),
        });
        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.translations && data.data.translations.length > 0) {
                const translations = data.data.translations;

                for (const translation of translations) {
                    const translatedText = translation.translatedText;
                    const detectedSourceLanguage = translation.detectedSourceLanguage;

                    console.log("Detected Source Language:", detectedSourceLanguage);
                    translatedTextOutput = translatedText

                }
            }
        } else {
            console.log("failed to translate: ", text)
            return text
            // throw new Error('Failed to translate language');
        }
    } catch (error) {
        console.log("error in translate language: ", text)
        return text
    }
    return translatedTextOutput
}



// // Function to handle sending user message
async function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        addMessage('You: ' + message, false);
        // Call Dialogflow API to get bot's reply
        callDialogflowAPI(message);
        messageInput.value = ''; // Clear input after sending
    }
}

sendButton.addEventListener("click", () => {
    sendMessage();
    listenButton.style.backgroundColor = "#e6e6e6";
});




//convert the text output to speech using tts api
async function synthesizeSpeech(text, isSSMl = false) {
    const apiUrl = "https://texttospeech.googleapis.com/v1/text:synthesize";
    console.log("DETECTED_LANGUAGE", DETECTED_LANGUAGE)

    if (DETECTED_LANGUAGE.includes('-IN')) {
        // If 'Latn' is present, assume it's Hindi or Bengali
        DETECTED_LANGUAGE = DETECTED_LANGUAGE.replace("-IN", "")
        
        // detectedLanguage = detectedLanguage.includes('hi') ? 'hi-IN' : 'bn-IN';
    }
    
    const requestData = {
        input: {
            ssml: text,
        },
        voice: {
            languageCode: DETECTED_LANGUAGE, // Use Hindi language code
            name: DETECTED_LANGUAGE + "-IN-Wavenet-A", // Use Hindi Wavenet voice
        },
        audioConfig: {
            audioEncoding: "LINEAR16",
            "effectsProfileId": [
                "small-bluetooth-speaker-class-device"
            ],
            "pitch": 0,
            "speakingRate": 1
        },
    };

    const headers = {
        "Content-Type": "application/json",
        'x-goog-user-project': 'search-conversation',
        'Authorization': 'Bearer ' + TOKEN
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(requestData),
        });

        if (response.ok) {
            const data = await response.json();
            return data.audioContent;
        } else {
            throw new Error("Text-to-speech request failed.");
        }
    } catch (error) {
        console.error("Error in synthesizeSpeech:", error);
        return null;
    }
}





function callDialogflowAPI(userMessage) {
    // Dialogflow API endpoint
    const apiUrl = `https://global-dialogflow.googleapis.com/v3/projects/[PROJECT-ID]/locations/global/agents/[AGENT-ID]/sessions/${SESSION_ID}:detectIntent`;

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
        .then((response) => response.json())
        .then(async (data) => {

            const botResponse = data["queryResult"]["responseMessages"];
            for (const response of botResponse) {
                if (response.text) {
                    const textResponse = response.text.text[0];
                    let translatedText = await translateText(textResponse, DETECTED_LANGUAGE)
                    addMessage("Fantasy AI: " + translatedText, true);

                    const audioContent = await synthesizeSpeech(translatedText, response.ssml);
                    if (audioContent) {
                        await playAudioWithDelay(audioContent);
                    }
                }
            }
        })
        .catch((error) => {
            alert("Please enter a valid API token");
            return console.error("Error calling Dialogflow API:", error);
        });
}

function playAudioWithDelay(audioContent) {
    return new Promise(resolve => {
        const audio = new Audio(`data:audio/wav;base64,${audioContent}`);
        audio.addEventListener('ended', resolve);
        audio.play();
    });
}

function addMessage(message, fromBot) {
    const newMessageItem = document.createElement("li");
    if (fromBot == false) {
        newMessageItem.style.textAlign = "right";
    }
    newMessageItem.textContent = message;
    messagesList.appendChild(newMessageItem);
}








