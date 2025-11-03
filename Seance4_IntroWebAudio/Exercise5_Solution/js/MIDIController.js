// MIDI Controller for the Sampler
// Handles MIDI input and maps it to pad triggers

export default class MIDIController {
    constructor(engine, gui) {
        this.engine = engine;
        this.gui = gui;
        this.midiAccess = null;
        this.selectedInput = null;
        this.onDevicesChanged = null;
    }

    async initialize() {
        try {
            if (navigator.requestMIDIAccess) {
                this.midiAccess = await navigator.requestMIDIAccess();
                this.setupMIDIListeners();
                return true;
            } else {
                console.warn('Web MIDI API not supported in this browser');
                return false;
            }
        } catch (error) {
            console.error('Failed to get MIDI access:', error);
            return false;
        }
    }

    setupMIDIListeners() {
        // Listen for MIDI device changes
        this.midiAccess.onstatechange = (e) => {
            console.log('MIDI device state changed:', e);
            if (this.onDevicesChanged) {
                this.onDevicesChanged(this.getDevices());
            }
        };
    }

    getDevices() {
        if (!this.midiAccess) return [];
        
        const devices = [];
        for (const input of this.midiAccess.inputs.values()) {
            devices.push({
                id: input.id,
                name: input.name,
                manufacturer: input.manufacturer
            });
        }
        return devices;
    }

    selectDevice(deviceId) {
        if (!this.midiAccess) return false;

        // Remove listener from previous device
        if (this.selectedInput) {
            this.selectedInput.onmidimessage = null;
        }

        // Find and set new device
        const input = this.midiAccess.inputs.get(deviceId);
        if (input) {
            this.selectedInput = input;
            this.selectedInput.onmidimessage = (msg) => this.handleMIDIMessage(msg);
            console.log('MIDI device selected:', input.name);
            return true;
        }

        return false;
    }

    handleMIDIMessage(message) {
        const [command, note, velocity] = message.data;
        
        // Note On message (144-159) or Note Off (128-143)
        const isNoteOn = command >= 144 && command <= 159 && velocity > 0;
        
        if (isNoteOn) {
            // Map MIDI notes to pads (C3 = 48 maps to pad 0)
            // Each note triggers a pad
            const padIndex = (note - 48) % 16;
            
            if (padIndex >= 0 && padIndex < 16 && this.engine.isPadLoaded(padIndex)) {
                this.engine.playPad(padIndex);
                this.gui.flashPad(padIndex);
                console.log(`MIDI triggered pad ${padIndex} (note ${note})`);
            }
        }
    }

    disconnect() {
        if (this.selectedInput) {
            this.selectedInput.onmidimessage = null;
            this.selectedInput = null;
        }
    }
}
