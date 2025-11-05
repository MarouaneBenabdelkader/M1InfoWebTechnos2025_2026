/**
 * Main application file
 * 
 * Integrates:
 * - SamplerEngine (audio processing)
 * - SamplerGUI (visual interface)
 * - WaveformDrawer (waveform visualization)
 * - TrimbarsDrawer (trim bar interaction)
 * 
 * This is the entry point that connects all components
 */

import SamplerEngine from './SamplerEngine.js';
import SamplerGUI from './SamplerGUI.js';
import WaveformDrawer from './waveformdrawer.js';
import TrimbarsDrawer from './trimbarsdrawer.js';
import { getMousePos, pixelToSeconds, formatTimeSimple } from './utils.js';

// Global application state
let ctx;
let samplerEngine;
let samplerGUI;
let waveformDrawer;
let trimbarsDrawer;

// Canvas elements
let canvas, canvasOverlay;

// UI elements
const presetSelect = document.querySelector("#presetSelect");
const loadPresetBtn = document.querySelector("#loadPresetBtn");
const padsContainer = document.querySelector("#padsContainer");
const currentSoundLabel = document.querySelector("#currentSound");
const trimStartInfo = document.querySelector("#trimStartInfo");
const trimEndInfo = document.querySelector("#trimEndInfo");
const trimDurationInfo = document.querySelector("#trimDurationInfo");

// Presets data
let presets = [];

/**
 * Initialize the application
 */
window.onload = async function init() {
    console.log("Initializing Professional Sampler...");
    
    // Create audio context
    ctx = new AudioContext();
    
    // Initialize canvas elements
    canvas = document.querySelector("#myCanvas");
    canvasOverlay = document.querySelector("#myCanvasOverlay");
    
    // Initialize core components
    samplerEngine = new SamplerEngine(ctx);
    samplerGUI = new SamplerGUI(padsContainer, samplerEngine);
    waveformDrawer = new WaveformDrawer();
    trimbarsDrawer = new TrimbarsDrawer(canvasOverlay, 0, canvas.width);
    
    // Setup GUI callbacks
    samplerGUI.onPadSelected = handlePadSelected;
    samplerGUI.onPadPlayed = handlePadPlayed;
    
    // Setup mouse events for trim bars
    setupMouseEvents();
    
    // Fetch presets from server
    await fetchPresets();
    
    // Setup UI event listeners
    setupUIListeners();
    
    console.log("Sampler initialized successfully!");
};

/**
 * Fetch presets from backend server
 */
async function fetchPresets() {
    try {
        const response = await fetch('http://localhost:3000/api/presets');
        
        if (!response.ok) {
            throw new Error('Server not responding');
        }

        presets = await response.json();
        console.log("Presets loaded from server:", presets);

        // Populate dropdown
        presetSelect.innerHTML = '<option value="">-- Select a Preset --</option>';
        presets.forEach((preset, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = preset.name;
            presetSelect.appendChild(option);
        });

    } catch (error) {
        console.warn("Server not available, using fallback presets:", error.message);
        useFallbackPresets();
    }
}

/**
 * Use fallback presets when server is not available
 * Each preset has 16 samples to fill all pads (as per Exercise 1 requirements)
 */
function useFallbackPresets() {
    presets = [
        {
            name: "Basic 9 Sounds ONLY",
            description: "Original 9 sounds from Exercise 1 - pads 10-16 will be empty",
            samples: [
                // Only 9 sounds - remaining pads will be disabled
                { name: "Kick", url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav" },
                { name: "Snare", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3" },
                { name: "Hi-Hat Closed", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3" },
                { name: "Hi-Hat Open", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3" },
                { name: "Tom High", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3" },
                { name: "Tom Mid", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3" },
                { name: "Tom Low", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3" },
                { name: "Crash", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3" },
                { name: "Ride", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3" }
            ]
        },
        {
            name: "Complete Drum Kit",
            description: "Full 16-pad drum kit with all essential sounds",
            samples: [
                // Pad 1-4 (Top row: Keys 1,2,3,4)
                { name: "Kick", url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav" },
                { name: "Snare", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3" },
                { name: "Hi-Hat Closed", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3" },
                { name: "Hi-Hat Open", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3" },
                
                // Pad 5-8 (Second row: Keys Q,W,E,R)
                { name: "Tom High", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3" },
                { name: "Tom Mid", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3" },
                { name: "Tom Low", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3" },
                { name: "Crash", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3" },
                
                // Pad 9-12 (Third row: Keys Z,X,C,V)
                { name: "Ride", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3" },
                { name: "Kick 2", url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav" },
                { name: "Snare 2", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3" },
                { name: "Hi-Hat 2", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3" },
                
                // Pad 13-16 (Bottom row: Keys A,S,D,F)
                { name: "Tom High 2", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3" },
                { name: "Tom Mid 2", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3" },
                { name: "Crash 2", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3" },
                { name: "Shoot", url: "https://mainline.i3s.unice.fr/mooc/shoot2.mp3" }
            ]
        },
        {
            name: "Basic 9 Sounds (Exercise 1)",
            description: "Original 9 sounds from Exercise 1, repeated to fill 16 pads",
            samples: [
                // Original 9 sounds from Exercise 1
                { name: "Kick", url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav" },
                { name: "Snare", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3" },
                { name: "Hi-Hat Closed", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3" },
                { name: "Hi-Hat Open", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3" },
                { name: "Tom High", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3" },
                { name: "Tom Mid", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3" },
                { name: "Tom Low", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3" },
                { name: "Crash", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3" },
                { name: "Ride", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3" },
                
                // Repeat some to fill remaining 7 pads
                { name: "Kick Var", url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav" },
                { name: "Snare Var", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3" },
                { name: "HH Closed Var", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3" },
                { name: "Tom High Var", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3" },
                { name: "Tom Mid Var", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3" },
                { name: "Tom Low Var", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3" },
                { name: "Ride Var", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3" }
            ]
        },
        {
            name: "Minimal Kit (4 Sounds)",
            description: "Simple 4-sound kit, repeated across pads",
            samples: [
                { name: "Kick 1", url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav" },
                { name: "Snare 1", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3" },
                { name: "Hi-Hat 1", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3" },
                { name: "Crash 1", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3" },
                
                { name: "Kick 2", url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav" },
                { name: "Snare 2", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3" },
                { name: "Hi-Hat 2", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3" },
                { name: "Crash 2", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3" },
                
                { name: "Kick 3", url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav" },
                { name: "Snare 3", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3" },
                { name: "Hi-Hat 3", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3" },
                { name: "Crash 3", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3" },
                
                { name: "Kick 4", url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav" },
                { name: "Snare 4", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3" },
                { name: "Hi-Hat 4", url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3" },
                { name: "Shoot", url: "https://mainline.i3s.unice.fr/mooc/shoot2.mp3" }
            ]
        }
    ];

    // Populate dropdown
    presetSelect.innerHTML = '<option value="">-- Select a Preset --</option>';
    presets.forEach((preset, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = preset.name + " (Fallback)";
        presetSelect.appendChild(option);
    });
}

/**
 * Setup UI event listeners
 */
function setupUIListeners() {
    // Preset selection
    presetSelect.onchange = (evt) => {
        const presetIndex = evt.target.value;
        if (presetIndex !== "") {
            loadPresetBtn.disabled = false;
        } else {
            loadPresetBtn.disabled = true;
        }
    };
    
    // Load preset button
    loadPresetBtn.onclick = async () => {
        const presetIndex = presetSelect.value;
        if (presetIndex !== "") {
            await loadPreset(parseInt(presetIndex));
        }
    };
}

/**
 * Load a preset into the sampler
 * @param {number} presetIndex - Index of the preset to load
 */
async function loadPreset(presetIndex) {
    const preset = presets[presetIndex];
    
    if (!preset) {
        console.error("Preset not found:", presetIndex);
        return;
    }
    
    console.log("Loading preset:", preset.name);
    
    // Disable button during loading
    loadPresetBtn.disabled = true;
    loadPresetBtn.textContent = "Loading...";
    
    // Clear previous sounds
    samplerEngine.clearAll();
    samplerGUI.clearAll();
    waveformDrawer.clear();
    trimbarsDrawer.clear();
    currentSoundLabel.textContent = "Loading preset...";
    
    // Load each sample
    const samples = preset.samples;
    const sampleCount = Math.min(samples.length, 16);
    
    for (let i = 0; i < sampleCount; i++) {
        const sample = samples[i];
        
        try {
            // Use 'url' property for actual sound loading (not 'path')
            // 'path' is for local server files, 'url' is for external sources
            const soundUrl = sample.url || sample.path;
            
            // Load with progress callback
            await samplerEngine.loadSound(i, soundUrl, (progress) => {
                samplerGUI.updateLoadingProgress(i, progress);
            });
            
            // Mark as loaded in GUI
            const name = sample.name || `Sample ${i + 1}`;
            samplerGUI.markPadLoaded(i, name);
            
        } catch (error) {
            console.error(`Failed to load sample ${i}:`, error);
            samplerGUI.markPadEmpty(i);
        }
    }
    
    // Mark remaining pads as empty (if preset has less than 16 samples)
    for (let i = sampleCount; i < 16; i++) {
        samplerGUI.markPadEmpty(i);
    }
    
    // Re-enable button
    loadPresetBtn.disabled = false;
    loadPresetBtn.textContent = "Load Preset";
    currentSoundLabel.textContent = `Preset "${preset.name}" loaded! Select a pad to view waveform.`;
    
    console.log("Preset loaded successfully!");
}

/**
 * Handle pad selection - display waveform and trim bars
 * @param {number} padIndex - Index of selected pad
 */
function handlePadSelected(padIndex) {
    const buffer = samplerEngine.getSound(padIndex);
    
    if (!buffer) {
        return;
    }
    
    console.log(`Pad ${padIndex} selected, displaying waveform`);
    
    // Initialize and draw waveform
    waveformDrawer.init(buffer, canvas, 'lightblue', 1);
    waveformDrawer.drawWave(0, canvas.height);
    
    // Get trim positions from engine
    const trimPos = samplerEngine.getTrimPositions(padIndex);
    
    // Set trim bars to match engine
    trimbarsDrawer.setNormalizedPositions(trimPos.start, trimPos.end);
    
    // Update label
    currentSoundLabel.textContent = `Pad ${padIndex + 1} - Duration: ${buffer.duration.toFixed(2)}s`;
    
    // Update trim info
    updateTrimInfo(padIndex);
}

/**
 * Handle pad played event
 * @param {number} padIndex - Index of played pad
 * @param {AudioBufferSourceNode} source - Audio source node
 */
function handlePadPlayed(padIndex, source) {
    console.log(`Pad ${padIndex} played`);
}

/**
 * Setup mouse event handlers for trim bar interaction
 */
function setupMouseEvents() {
    let isDragging = false;
    
    canvasOverlay.addEventListener('mousedown', (evt) => {
        const mousePos = getMousePos(canvasOverlay, evt);
        isDragging = trimbarsDrawer.onMouseDown(mousePos.x, mousePos.y);
    });
    
    canvasOverlay.addEventListener('mousemove', (evt) => {
        if (isDragging) {
            const mousePos = getMousePos(canvasOverlay, evt);
            trimbarsDrawer.onMouseMove(mousePos.x);
            
            // Update trim positions in engine
            updateEngineFromTrimBars();
        }
    });
    
    canvasOverlay.addEventListener('mouseup', (evt) => {
        if (isDragging) {
            trimbarsDrawer.onMouseUp();
            isDragging = false;
            
            // Final update
            updateEngineFromTrimBars();
        }
    });
    
    // Handle mouse leaving canvas
    canvasOverlay.addEventListener('mouseleave', (evt) => {
        if (isDragging) {
            trimbarsDrawer.onMouseUp();
            isDragging = false;
            updateEngineFromTrimBars();
        }
    });
}

/**
 * Update engine trim positions from trim bars
 */
function updateEngineFromTrimBars() {
    const selectedPad = samplerGUI.getSelectedPad();
    
    if (selectedPad !== null) {
        const trimPos = trimbarsDrawer.getNormalizedPositions();
        samplerEngine.setTrimPositions(selectedPad, trimPos.start, trimPos.end);
        
        // Update info display
        updateTrimInfo(selectedPad);
    }
}

/**
 * Update trim information display
 * @param {number} padIndex - Pad index
 */
function updateTrimInfo(padIndex) {
    const buffer = samplerEngine.getSound(padIndex);
    if (!buffer) return;
    
    const trimPos = samplerEngine.getTrimPositions(padIndex);
    const startTime = trimPos.start * buffer.duration;
    const endTime = trimPos.end * buffer.duration;
    const duration = endTime - startTime;
    
    trimStartInfo.textContent = `Start: ${formatTimeSimple(startTime)}`;
    trimEndInfo.textContent = `End: ${formatTimeSimple(endTime)}`;
    trimDurationInfo.textContent = `Duration: ${formatTimeSimple(duration)}`;
}

/**
 * Example of headless usage (without GUI)
 * Uncomment to test headless mode
 */
/*
async function headlessExample() {
    const headlessCtx = new AudioContext();
    const headlessEngine = new SamplerEngine(headlessCtx);
    
    // Load a sound
    await headlessEngine.loadSound(0, 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav');
    
    // Set trim
    headlessEngine.setTrimPositions(0, 0.2, 0.8);
    
    // Play
    headlessEngine.playPad(0);
    
    console.log("Headless mode works!");
}
*/
