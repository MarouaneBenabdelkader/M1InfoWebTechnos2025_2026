import SamplerEngine from './SamplerEngine.js';
import SamplerGUI from './SamplerGUI.js';
import MIDIController from './MIDIController.js';
import WaveformDrawer from './waveformdrawer.js';
import TrimbarsDrawer from './trimbarsdrawer.js';
import { pixelToSeconds } from './utils.js';

// Sound URLs - 16 drum sounds
const soundURLs = [
    'https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3',
    'https://mainline.i3s.unice.fr/mooc/shoot2.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3'
];

let ctx;
let samplerEngine;
let samplerGUI;
let midiController;
let waveformDrawer;
let trimbarsDrawer;
let canvas, canvasOverlay;
let mousePos = { x: 0, y: 0 };

const loadAllBtn = document.querySelector('#loadAllBtn');
const padsContainer = document.querySelector('#padsContainer');
const midiSelect = document.querySelector('#midiSelect');
const midiStatus = document.querySelector('#midiStatus');
const currentSoundLabel = document.querySelector('#currentSound');

window.onload = async function init() {
    ctx = new AudioContext();

    // Initialize components
    samplerEngine = new SamplerEngine(ctx);
    samplerGUI = new SamplerGUI(padsContainer, samplerEngine);
    midiController = new MIDIController(samplerEngine, samplerGUI);

    // Setup waveform visualization
    canvas = document.querySelector("#myCanvas");
    canvasOverlay = document.querySelector("#myCanvasOverlay");
    waveformDrawer = new WaveformDrawer();
    trimbarsDrawer = new TrimbarsDrawer(canvasOverlay, 100, 700);

    // Setup GUI callbacks
    samplerGUI.onPadClick = (padIndex) => {
        displayWaveform(padIndex);
    };

    // Setup mouse events for trim bars
    setupMouseEvents();

    // Start animation loop
    requestAnimationFrame(animate);

    // Load all sounds button
    loadAllBtn.addEventListener('click', loadAllSounds);

    // Initialize MIDI
    const midiAvailable = await midiController.initialize();
    if (midiAvailable) {
        updateMIDIDevices();
        midiController.onDevicesChanged = updateMIDIDevices;
        
        midiSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                midiController.selectDevice(e.target.value);
                midiStatus.textContent = 'MIDI: Connected';
                midiStatus.style.background = 'rgba(76, 175, 80, 0.3)';
            } else {
                midiController.disconnect();
                midiStatus.textContent = 'MIDI: Not connected';
                midiStatus.style.background = 'rgba(0,0,0,0.3)';
            }
        });
    } else {
        midiStatus.textContent = 'MIDI: Not available';
    }
};

async function loadAllSounds() {
    loadAllBtn.disabled = true;
    loadAllBtn.textContent = 'Loading...';

    // Use Promise.allSettled to load all sounds even if some fail
    const promises = soundURLs.map((url, index) => {
        samplerGUI.setPadLoading(index);
        
        return samplerEngine.loadSound(index, url, (progress) => {
            samplerGUI.updateProgress(index, progress);
        });
    });

    const results = await Promise.allSettled(promises);

    // Update GUI based on results
    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            samplerGUI.setPadLoaded(index);
            console.log(`Pad ${index} loaded successfully`);
        } else {
            samplerGUI.setPadError(index);
            console.error(`Pad ${index} failed to load:`, result.reason);
        }
    });

    loadAllBtn.textContent = 'Reload All Sounds';
    loadAllBtn.disabled = false;
}

function displayWaveform(padIndex) {
    const sound = samplerEngine.getSound(padIndex);
    
    if (!sound) return;

    currentSoundLabel.textContent = `Viewing: Pad ${padIndex + 1}`;

    // Clear canvas
    const ctx2d = canvas.getContext('2d');
    ctx2d.clearRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    waveformDrawer.init(sound, canvas, '#83E83E');
    waveformDrawer.drawWave(0, canvas.height);

    // Get saved trim positions
    const trim = samplerEngine.getTrimPositions(padIndex);
    trimbarsDrawer.leftTrimBar.x = trim.start * canvas.width;
    trimbarsDrawer.rightTrimBar.x = trim.end * canvas.width;
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
        
        // Save trim positions to engine
        const selectedPad = samplerGUI.getSelectedPad();
        if (selectedPad !== null) {
            const sound = samplerEngine.getSound(selectedPad);
            if (sound) {
                const start = trimbarsDrawer.leftTrimBar.x / canvas.width;
                const end = trimbarsDrawer.rightTrimBar.x / canvas.width;
                samplerEngine.setTrimPositions(selectedPad, start, end);
                console.log(`Trim updated for pad ${selectedPad}: ${start.toFixed(2)} - ${end.toFixed(2)}`);
            }
        }
    };
}

function animate() {
    trimbarsDrawer.clear();
    trimbarsDrawer.draw();
    requestAnimationFrame(animate);
}

function updateMIDIDevices() {
    const devices = midiController.getDevices();
    
    midiSelect.innerHTML = '<option value="">-- Select MIDI Device --</option>';
    
    devices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.id;
        option.textContent = `${device.name} (${device.manufacturer})`;
        midiSelect.appendChild(option);
    });

    if (devices.length > 0) {
        midiStatus.textContent = `MIDI: ${devices.length} device(s) available`;
    } else {
        midiStatus.textContent = 'MIDI: No devices found';
    }
}
