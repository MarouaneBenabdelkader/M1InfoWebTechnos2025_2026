import { loadAndDecodeSound, playSound } from './soundutils.js';

// The AudioContext object is the main "entry point" into the Web Audio API
let ctx;

// Array of sound URLs
const soundURLs = [
    'https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3'
];

// Array to store decoded sounds
let decodedSounds = [];

// Get the container where we'll add buttons
const buttonContainer = document.querySelector("#buttonContainer");

window.onload = async function init() {
    ctx = new AudioContext();

    // Clear the loading message
    buttonContainer.innerHTML = '';

    try {
        // Use Promise.all to load all sounds in parallel
        const loadPromises = soundURLs.map(url => loadAndDecodeSound(url, ctx));
        decodedSounds = await Promise.all(loadPromises);

        console.log("All sounds loaded and decoded!");

        // Generate a play button for each sound
        decodedSounds.forEach((sound, index) => {
            const button = document.createElement('button');
            button.textContent = `Play Sound ${index + 1}`;
            button.onclick = () => {
                playSound(ctx, sound, 0, sound.duration);
            };
            buttonContainer.appendChild(button);
        });

    } catch (error) {
        console.error("Error loading sounds:", error);
        buttonContainer.innerHTML = '<p style="color: red;">Error loading sounds. Check console for details.</p>';
    }
}
