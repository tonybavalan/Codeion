import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// azure text-to-speech synthesis constants
const key = "61e679f7053340578387cb0899e09eb3";
const region = "centralindia";

// authorization for Speech service
const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
speechConfig.speechRecognitionLanguage = "en-US";
const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();

// global constants
const recordStopBtn = document.querySelector('.record-stop-track');
const playPauseBtn = document.querySelector('.play-pause-track');
const wave = document.getElementById('wave');
const musicList = [
    {
        img: 'assets/azure.png',
        name: 'Demo',
        // artist : 'The Kid LAROI, Justin Bieber',
        music: 'music/stay.mp3'
    },
    {
        img: 'images/fallingdown.jpg',
        name: 'Falling Down',
        // artist : 'Wid Cards',
        music: 'music/fallingdown.mp3'
    },
    {
        img: 'images/faded.png',
        name: 'Faded',
        // artist : 'Alan Walker',
        music: 'music/Faded.mp3'
    },
    {
        img: 'images/ratherbe.jpg',
        name: 'Rather Be',
        // artist : 'Clean Bandit',
        music: 'music/Rather Be.mp3'
    }
];

// variables
let isRecording = false;
let isPlaying = false;
let trackArt = document.querySelector('.track-art');
let trackName = document.querySelector('.track-name');
let trackArtist = document.querySelector('.track-artist');
let phrase;

// construct function
loadTrack(0);
randomBgColor();

function randomBgColor() {
    let hex = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e'];

    function populate(a) {
        for (let i = 0; i < 6; i++) {
            let x = Math.round(Math.random() * 14);
            let y = hex[x];
            a += y;
        }
        return a;
    }

    let Color1 = populate('#');
    let Color2 = populate('#');
    let angle = 'to right';

    document.body.style.background = 'linear-gradient(' + angle + ',' + Color1 + ', ' + Color2 + ")";
}

function loader(arg) {
    if (arg) {
        trackArt.classList.add('rotate');
        wave.classList.add('loader');
    } else {
        trackArt.classList.remove('rotate');
        wave.classList.remove('loader');
    }
}

function loadTrack(trackIndex) {
    trackArt.style.backgroundImage = "url(" + musicList[trackIndex].img + ")";
    trackName.textContent = musicList[trackIndex].name;
    trackArtist.textContent = musicList[trackIndex].artist;
    // now_playing.textContent = "Playing music " + (trackIndex + 1) + " of " + music_list.length;
}

recordStopBtn.addEventListener("click", () => {
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    isRecording ? stopTrack() : recordTrack();

    function recordTrack() {
        isRecording = true;
        loader(isRecording);
        recordStopBtn.innerHTML = '<i class="fa fa-stop fa-2x"></i>';

        recognizer.recognizeOnceAsync(
            function (result) {
                isRecording = false;
                loader(isRecording);
                recordStopBtn.innerHTML = '<i class="fa fa-microphone fa-2x"></i>';
                phrase = result.privText;
                recognizer.close();

                console.log("Audio captured successfully");
                console.log(result);
                console.log(result.privText);
            },
            function (err) {
                recognizer.close();
                console.log(err);
            });
    }

    function stopTrack() {
        isRecording = false;
        loader(isRecording);
        recordStopBtn.innerHTML = '<i class="fa fa-microphone fa-2x"></i>';
        recognizer.close();
        console.log("Audio capturing ended successfully");
    }
});

playPauseBtn.addEventListener("click", () => {
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

    isPlaying ? pauseTrack() : playTrack();

    function pauseTrack() {
        isPlaying = false;
        loader(isPlaying);
        trackArt.classList.remove('rotate');
        wave.classList.remove('loader');
        playPauseBtn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
        speechSynthesis.cancel();
    }

    function playTrack() {
        if (phrase) {
            isPlaying = true;
            loader(isPlaying);
            playPauseBtn.innerHTML = '<i class="fa fa-pause-circle fa-5x"></i>';

            let ssml = `<speak version='1.0' xml:lang='en-US' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts' xmlns:emo='http://www.w3.org/2009/10/emotionml'> \r\n \
                    <voice name='en-Us-AriaNeural'> \r\n \
                      <mstts:express-as style="whispering"><prosody rate="default" pitch="default" volume="+40.00%">${phrase}</prosody></mstts:express-as> \r\n \
                    </voice> \r\n \
                  </speak>`;

            if ('speechSynthesis' in window) {
                synthesizer.speakSsmlAsync(
                    ssml,
                    result => {
                        console.log(result);
                        // Success function
                        // display status
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            // load client-side audio control from Azure response
                            const blob = new Blob([result.audioData], {type: "audio/mpeg"});
                            window.URL.createObjectURL(blob);
                        } else if (result.reason === sdk.ResultReason.Canceled) {
                            // display Error
                            console.log(result.errorDetails);
                        }
                        // clean up
                        synthesizer.close();
                    },
                    error => {
                        console.log(error);
                        synthesizer.close();
                    });
                isPlaying = false;
                loader(isPlaying);
                playPauseBtn.innerHTML = '<i class="fa fa-play-circle fa-5x"></i>';
            } else {
                alert("Sorry, you're browser does not supports speechSynthesis");
            }
        } else {
            alert("Sorry, no data to play");
        }
    }
});
