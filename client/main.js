import bot from '/assets/bot.svg';
import user from '/assets/user.svg';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// Global variables
let loadInterval;

// Global constants
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const mic = document.querySelector('#microphone');
const micAnime = document.querySelector('#animation');

// Web speech api recognition constants
const speechRecognition = window.speechRecognition || window.webkitSpeechRecognition;
const recognition = new speechRecognition();

// Azure text-to-speech synthesis constants
const key = "61e679f7053340578387cb0899e09eb3";
const region = "centralindia";
// authorization for Speech service
const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
// new Speech object
let synthesizer = new sdk.SpeechSynthesizer(speechConfig);

//Microphone events
mic.addEventListener("click", () => {
  mic.style.display = "none";
  micAnime.style.display = "block";
  recognition.lang = "en-US";

  recognition.interimResults = false;
  recognition.start();
  recognition.onend = function () {
    mic.style.display = "block";
    micAnime.style.display = "none";
  };
  recognition.onresult = async (event) => {
    const last = event.results.length - 1;
    const text = event.results[last][0].transcript;

    chatContainer.innerHTML += chatStripe(false, text);

    //generate bots chatStripe
    let uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqueId);

    loader(messageDiv);

    //fetch data from server -> bots response
    const response = await fetch('https://codeion-server.onrender.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: text
      })
    });

    clearInterval(loadInterval);

    messageDiv.innerHTML = '';

    if (response.ok) {
      let data = await response.json();
      let phrase = data.bot.trim();

      typeText(messageDiv, phrase);

      let ssml = `<speak version='1.0' xml:lang='en-US' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xmlns:emo='http://www.w3.org/2009/10/emotionml'> \r\n \
                    <voice name='en-Us-AriaNeural'> \r\n \
                      <mstts:express-as style="whispering"><prosody rate="-7%" pitch="0%">${phrase}</prosody></mstts:express-as> \r\n \
                    </voice> \r\n \
                  </speak>`;

      if ('speechSynthesis' in window) {
        synthesizer.speakSsmlAsync(
          ssml,
          result => {
            // Success function
            // display status
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              // load client-side audio control from Azure response
              const blob = new Blob([result.audioData], { type: "audio/mpeg" });
              window.URL.createObjectURL(blob);
            } else if (result.reason === sdk.ResultReason.Canceled) {
              // display Error
              console.log(result.errorDetails);
            } 
            // clean up
            synthesizer.close();
            synthesizer = undefined;
          },
          error => {
            console.log(error);
            synthesizer.close();
          });
      } else {
        alert("Sorry, you're browser does not supports speechSynthesis");
      }
    } else {
      const err = await response.text();
      messageDiv.innerHTML = "Something went wrong";
      alert(err);
    }
  }
});

micAnime.addEventListener("click", () => {
  recognition.abort();

  mic.style.display = "block";
  micAnime.style.display = "none";
});

// Functions
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';

    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index)
      index++
    } else {
      clearInterval(interval)
    }
  }, 20)
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
    <div class = "wrapper ${isAi && 'ai'}">
      <div class = "chat">
        <div class = "profile">
          <img src=${isAi ? bot : user} alt="${isAi ? 'bot' : 'user'}"/>
        </div>
        <div class = "message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `
  );
}

const handleSubmit = async (event) => {
  event.preventDefault();

  const data = new FormData(form);

  //generate user's chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
  form.reset();

  //generate bot's chatStripe
  let uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data from server -> bots response
  const response = await fetch('https://codeion-server.onrender.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  });

  clearInterval(loadInterval);

  messageDiv.innerHTML = '';

  if (response.ok) {
    let data = await response.json();
    let phrase = data.bot.trim();

    typeText(messageDiv, phrase);

    let ssml = `<speak version='1.0' xml:lang='en-US' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xmlns:emo='http://www.w3.org/2009/10/emotionml'> \r\n \
                  <voice name='en-Us-AriaNeural'> \r\n \
                    <mstts:express-as style="whispering"><prosody rate="-7%" pitch="0%">${phrase}</prosody></mstts:express-as> \r\n \
                  </voice> \r\n \
                </speak>`;

    if ('speechSynthesis' in window) {
      synthesizer.speakSsmlAsync(
        ssml,
        function (result) {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const blob = new Blob([result.audioData], { type: audioType });
            window.URL.createObjectURL(blob);
          } else if (result.reason === sdk.ResultReason.Canceled) {
            console.log(result.errorDetails);
          }
          synthesizer.close();
          synthesizer = undefined;
        });
    } else {
      alert("Sorry, you're browser does not supports speechSynthesis");
    }
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong";
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);