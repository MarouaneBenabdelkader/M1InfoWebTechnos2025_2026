import WaveformDrawer from './waveformdrawer.js';
import TrimbarsDrawer from './trimbarsdrawer.js';
import { loadAndDecodeSound, playSound } from './soundutils.js';
import { pixelToSeconds } from './utils.js';

// Class to encapsulate each sound's data and trim bar positions
class Sound {
    constructor(url, decodedBuffer, index) {
        this.url = url;
        this.decodedBuffer = decodedBuffer;
        this.index = index;
        // Store trim bar positions for this sound
        this.leftTrimBarX = 100;
        this.rightTrimBarX = 700;
    }
}

let ctx;

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

let sounds = [];
let currentSound = null;
let canvas, canvasOverlay;
let waveformDrawer, trimbarsDrawer;
let mousePos = { x: 0, y: 0 };
let buttons = [];

const buttonContainer = document.querySelector("#buttonContainer");

window.onload = async function init() {
    ctx = new AudioContext();

    canvas = document.querySelector("#myCanvas");
    canvasOverlay = document.querySelector("#myCanvasOverlay");

    waveformDrawer = new WaveformDrawer();
    trimbarsDrawer = new TrimbarsDrawer(canvasOverlay, 100, 700);

    buttonContainer.innerHTML = '';

    try {
        // Load all sounds using Promise.all
        const loadPromises = soundURLs.map(url => loadAndDecodeSound(url, ctx));
        const decodedSounds = await Promise.all(loadPromises);

        // Create Sound objects
        decodedSounds.forEach((decodedBuffer, index) => {
            sounds.push(new Sound(soundURLs[index], decodedBuffer, index));
        });

        console.log("All sounds loaded!");

        // Generate buttons for each sound
        sounds.forEach((sound, index) => {
            const button = document.createElement('button');
            button.textContent = `Sound ${index + 1}`;
            button.onclick = () => selectAndPlaySound(sound, button);
            buttonContainer.appendChild(button);
            buttons.push(button);
        });

        // Setup mouse event listeners
        setupMouseEvents();

        // Start animation loop
        requestAnimationFrame(animate);

    } catch (error) {
        console.error("Error loading sounds:", error);
        buttonContainer.innerHTML = '<p style="color: red;">Error loading sounds.</p>';
    }
};

function selectAndPlaySound(sound, button) {
    // Save current trim bar positions if there's a current sound
    if (currentSound) {
        currentSound.leftTrimBarX = trimbarsDrawer.leftTrimBar.x;
        currentSound.rightTrimBarX = trimbarsDrawer.rightTrimBar.x;
    }

    // Set new current sound
    currentSound = sound;

    // Update button styles
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Clear canvas
    const ctx2d = canvas.getContext('2d');
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);

    // Draw waveform for selected sound
    waveformDrawer.init(sound.decodedBuffer, canvas, '#83E83E');
    waveformDrawer.drawWave(0, canvas.height);

    // Restore trim bar positions for this sound
    trimbarsDrawer.leftTrimBar.x = sound.leftTrimBarX;
    trimbarsDrawer.rightTrimBar.x = sound.rightTrimBarX;

    // Play the sound
    let start = pixelToSeconds(trimbarsDrawer.leftTrimBar.x, sound.decodedBuffer.duration, canvas.width);
    let end = pixelToSeconds(trimbarsDrawer.rightTrimBar.x, sound.decodedBuffer.duration, canvas.width);
    playSound(ctx, sound.decodedBuffer, start, end);
}

function setupMouseEvents() {
    canvasOverlay.onmousemove = (evt) => {
        let rect = canvas.getBoundingClientRect();
        mousePos.x = (evt.clientX - rect.left);
        mousePos.y = (evt.clientY - rect.top);
        trimbarsDrawer.moveTrimBars(mousePos);
    };

    canvasOverlay.onmousedown = (evt) => {
        trimbarsDrawer.startDrag();
    };

    canvasOverlay.onmouseup = (evt) => {
        trimbarsDrawer.stopDrag();
        // Save trim bar positions when user releases mouse
        if (currentSound) {
            currentSound.leftTrimBarX = trimbarsDrawer.leftTrimBar.x;
            currentSound.rightTrimBarX = trimbarsDrawer.rightTrimBar.x;
        }
    };
}

function animate() {
    trimbarsDrawer.clear();
    trimbarsDrawer.draw();
    requestAnimationFrame(animate);
}
