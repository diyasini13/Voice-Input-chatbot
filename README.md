# Voice-Input-chatbot

This is a demo of a chatbot created using dialogflow CX for a fantasy cricket app. The main features of the chatbot is that it can use voice input and support multilingual understanding. I have used Web to Speech API for the voice input and created this demo in simple html, js and css . 

Architecture:
![SST-_Translate-_TTS](https://github.com/diyasini13/Voice-Input-chatbot/assets/168017701/c7c16d60-7b38-4816-8df6-9eb0e388cdfd)


To run the code:
1. clone the github repository
2. In the calldialogflowapi function give your own project ID, agent id and location to the api to connect to your own dialogflow chatbot.You can get these DialogFlow CX API details by selecting "COPY NAME" (https://i.stack.imgur.com/QTZxm.png ) option of the agent.
3. Get the access token from Google cloud using (gcloud auth print-access-token) - this is temporary and is valid for 1 hr
4. Enter this access token in TOKEN variable in the index.js file.
5. You can run the files using (python3 -m http.server 8000) in the cloud shell


 Github hosted page:
https://diyasini13.github.io/Voice-Input-chatbot/
