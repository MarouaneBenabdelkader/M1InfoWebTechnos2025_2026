import WaveformDrawer from './waveformdrawer.js';
import TrimbarsDrawer from './trimbarsdrawer.js';
import { loadAndDecodeSound, playSound } from './soundutils.js';
import { pixelToSeconds } from './utils.js';

// Class to encapsulate each sound's data
class Sound {
    constructor(url, decodedBuffer, index) {
        this.url = url;
        this.decodedBuffer = decodedBuffer;
        this.index = index;
        this.leftTrimBarX = 100;
        this.rightTrimBarX = 700;
    }
}

let ctx;
let sounds = [];
let currentSound = null;
let canvas, canvasOverlay;
let waveformDrawer, trimbarsDrawer;
let mousePos = { x: 0, y: 0 };
let buttons = [];
let presets = [];

const buttonContainer = document.querySelector("#buttonContainer");
const presetSelect = document.querySelector("#presetSelect");

window.onload = async function init() {
    ctx = new AudioContext();

    canvas = document.querySelector("#myCanvas");
    canvasOverlay = document.querySelector("#myCanvasOverlay");

    waveformDrawer = new WaveformDrawer();
    trimbarsDrawer = new TrimbarsDrawer(canvasOverlay, 100, 700);

    // Setup mouse events
    setupMouseEvents();

    // Start animation loop
    requestAnimationFrame(animate);

    // Fetch presets from server
    await fetchPresets();

    // Setup preset select event
    presetSelect.onchange = async (evt) => {
        const presetId = evt.target.value;
        if (presetId) {
            await loadPreset(presetId);
        }
    };
};

async function fetchPresets() {
    try {
        const response = await fetch('http://localhost:3000/api/presets');
        
        if (!response.ok) {
            throw new Error('Server not responding. Make sure server is running on localhost:3000');
        }

        presets = await response.json();
        
        console.log("Presets loaded from server:", presets);

        // Populate dropdown
        presetSelect.innerHTML = '<option value="">-- Select a Preset --</option>';
        presets.forEach(preset => {
            const option = document.createElement('option');
            option.value = preset.id || preset._id || preset.name;
            option.textContent = preset.name;
            presetSelect.appendChild(option);
        });

    } catch (error) {
        console.warn("Server not available, using fallback presets:", error.message);
        
        // Use fallback presets when server is not available
        useFallbackPresets();
    }
}

function useFallbackPresets() {
    // Fallback presets with hardcoded sound URLs
    presets = [
        {
            id: "drums1",
            name: "Drum Kit 1",
            samples: [
                { path: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav" },
                { path: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3" },
                { path: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3" },
                { path: "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3" }
            ]
        },
        {
            id: "drums2",
            name: "Drum Kit 2",
            samples: [
                { path: "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3" },
                { path: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3" },
                { path: "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3" },
                { path: "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3" }
            ]
        },
        {
            id: "drums3",
            name: "Percussion",
            samples: [
                { path: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3" },
                { path: "https://mainline.i3s.unice.fr/mooc/shoot2.mp3" },
                { path: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav" }
            ]
        }
    ];

    // Populate dropdown with fallback data
    presetSelect.innerHTML = '<option value="">-- Select a Preset (Fallback Mode) --</option>';
    presets.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        presetSelect.appendChild(option);
    });

    buttonContainer.innerHTML = '<p style="color: orange;">⚠️ Server not available. Using fallback presets. Select a preset to load sounds.</p>';
    console.log("Fallback presets loaded:", presets);
}

async function loadPreset(presetId) {
    // Find the preset
    const preset = presets.find(p => (p.id || p._id || p.name) == presetId);
    
    if (!preset) {
        console.error("Preset not found");
        return;
    }

    console.log("Loading preset:", preset);

    buttonContainer.innerHTML = '<p>Loading sounds...</p>';

    // Build sound URLs from preset
    const soundURLs = [];
    
    if (preset.samples && Array.isArray(preset.samples)) {
        preset.samples.forEach(sample => {
            // Check if it's already a full URL or needs server prefix
            let url;
            if (typeof sample === 'string') {
                // Simple string format
                url = sample.startsWith('http') ? sample : `http://localhost:3000/${sample}`;
            } else if (sample.path) {
                // Object with path property
                url = sample.path.startsWith('http') ? sample.path : `http://localhost:3000/${sample.path}`;
            } else if (sample.file) {
                // Object with file property
                url = sample.file.startsWith('http') ? sample.file : `http://localhost:3000/${sample.file}`;
            }
            if (url) soundURLs.push(url);
        });
    } else if (preset.files && Array.isArray(preset.files)) {
        preset.files.forEach(file => {
            const url = file.startsWith('http') ? file : `http://localhost:3000/${file}`;
            soundURLs.push(url);
        });
    }

    if (soundURLs.length === 0) {
        buttonContainer.innerHTML = '<p style="color: orange;">No sounds found in this preset.</p>';
        return;
    }

    console.log("Sound URLs:", soundURLs);

    try {
        // Load all sounds
        const loadPromises = soundURLs.map(url => loadAndDecodeSound(url, ctx));
        const decodedSounds = await Promise.all(loadPromises);

        // Clear previous sounds
        sounds = [];
        buttons = [];
        buttonContainer.innerHTML = '';

        // Create Sound objects
        decodedSounds.forEach((decodedBuffer, index) => {
            sounds.push(new Sound(soundURLs[index], decodedBuffer, index));
        });

        console.log("All sounds loaded!");

        // Generate buttons
        sounds.forEach((sound, index) => {
            const button = document.createElement('button');
            button.textContent = `Sound ${index + 1}`;
            button.onclick = () => selectAndPlaySound(sound, button);
            buttonContainer.appendChild(button);
            buttons.push(button);
        });

    } catch (error) {
        console.error("Error loading sounds:", error);
        buttonContainer.innerHTML = '<p style="color: red;">Error loading sounds. Check console.</p>';
    }
}

function selectAndPlaySound(sound, button) {
    // Save current trim bar positions
    if (currentSound) {
        currentSound.leftTrimBarX = trimbarsDrawer.leftTrimBar.x;
        currentSound.rightTrimBarX = trimbarsDrawer.rightTrimBar.x;
    }

    currentSound = sound;

    // Update button styles
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Clear and draw waveform
    const ctx2d = canvas.getContext('2d');
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);

    waveformDrawer.init(sound.decodedBuffer, canvas, '#83E83E');
    waveformDrawer.drawWave(0, canvas.height);

    // Restore trim bars
    trimbarsDrawer.leftTrimBar.x = sound.leftTrimBarX;
    trimbarsDrawer.rightTrimBar.x = sound.rightTrimBarX;

    // Play sound
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
