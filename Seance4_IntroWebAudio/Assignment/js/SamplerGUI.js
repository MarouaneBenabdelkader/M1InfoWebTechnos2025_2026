/**
 * SamplerGUI - Visual interface for the sampler
 * 
 * This class handles all GUI-related operations:
 * - Creating and managing pad visual elements
 * - Keyboard input handling
 * - Visual feedback (loading, playing, selection)
 * - User interaction events
 * 
 * Design principle: Delegates all audio operations to SamplerEngine
 */

export default class SamplerGUI {
    constructor(containerElement, engine) {
        this.container = containerElement;
        this.engine = engine;
        this.pads = [];
        this.selectedPadIndex = null;
        this.keyMapping = this.createKeyMapping();
        this.onPadSelected = null; // Callback when pad is selected (for waveform display)
        this.onPadPlayed = null;   // Callback when pad is played
        
        this.initializePads();
        this.setupKeyboardListeners();
    }

    /**
     * Create keyboard to pad index mapping
     * Layout:
     * 1 2 3 4  (Pads 0-3)
     * Q W E R  (Pads 4-7)
     * Z X C V  (Pads 8-11)
     * A S D F  (Pads 12-15)
     */
    createKeyMapping() {
        return {
            // Top row
            '1': 0, '2': 1, '3': 2, '4': 3,
            // Second row
            'q': 4, 'w': 5, 'e': 6, 'r': 7,
            // Third row
            'z': 8, 'x': 9, 'c': 10, 'v': 11,
            // Bottom row
            'a': 12, 's': 13, 'd': 14, 'f': 15
        };
    }

    /**
     * Initialize 16 pads in a 4x4 grid
     */
    initializePads() {
        // Create 16 pads
        for (let i = 0; i < 16; i++) {
            const pad = this.createPad(i);
            this.pads.push(pad);
            this.container.appendChild(pad.element);
        }
    }

    /**
     * Create a single pad element
     * @param {number} index - Pad index (0-15)
     * @returns {object} Pad data object
     */
    createPad(index) {
        const element = document.createElement('div');
        element.className = 'pad disabled';
        element.dataset.index = index;

        // Pad number label
        const padNumber = document.createElement('div');
        padNumber.className = 'pad-number';
        padNumber.textContent = `Pad ${index + 1}`;

        // Keyboard shortcut label
        const padKey = document.createElement('div');
        padKey.className = 'pad-key';
        padKey.textContent = this.getKeyForPad(index);

        // Status label
        const padStatus = document.createElement('div');
        padStatus.className = 'pad-status';
        padStatus.textContent = 'Empty';

        // Progress bar for loading
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';

        // Assemble pad
        element.appendChild(padNumber);
        element.appendChild(padKey);
        element.appendChild(padStatus);
        element.appendChild(progressBar);

        // Click handler
        element.addEventListener('click', () => this.handlePadClick(index));

        return {
            element,
            index,
            progressBar,
            padStatus,
            padNumber
        };
    }

    /**
     * Get keyboard key for a pad
     * @param {number} index - Pad index
     * @returns {string} Key character
     */
    getKeyForPad(index) {
        for (const [key, padIndex] of Object.entries(this.keyMapping)) {
            if (padIndex === index) {
                return key.toUpperCase();
            }
        }
        return '?';
    }

    /**
     * Handle pad click event
     * @param {number} index - Pad index
     */
    handlePadClick(index) {
        if (this.engine.isPadLoaded(index)) {
            // Select pad for waveform viewing
            this.selectPad(index);
            
            // Play the pad
            this.playPad(index);
        }
    }

    /**
     * Select a pad (for waveform display)
     * @param {number} index - Pad index
     */
    selectPad(index) {
        // Deselect all pads
        this.pads.forEach(pad => {
            pad.element.classList.remove('selected');
        });

        // Select this pad
        this.selectedPadIndex = index;
        this.pads[index].element.classList.add('selected');

        // Trigger callback for waveform display
        if (this.onPadSelected) {
            this.onPadSelected(index);
        }
    }

    /**
     * Play a pad and show visual feedback
     * @param {number} index - Pad index
     */
    playPad(index) {
        if (!this.engine.isPadLoaded(index)) {
            console.warn(`Cannot play pad ${index}: no sound loaded`);
            return;
        }

        // Visual feedback
        const pad = this.pads[index];
        pad.element.classList.add('active');
        
        setTimeout(() => {
            pad.element.classList.remove('active');
        }, 200);

        // Play through engine
        const source = this.engine.playPad(index);

        // Trigger callback
        if (this.onPadPlayed) {
            this.onPadPlayed(index, source);
        }
    }

    /**
     * Setup keyboard event listeners
     */
    setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            
            if (this.keyMapping.hasOwnProperty(key)) {
                event.preventDefault();
                const padIndex = this.keyMapping[key];
                
                if (this.engine.isPadLoaded(padIndex)) {
                    // Select pad to update waveform
                    this.selectPad(padIndex);
                    // Then play it
                    this.playPad(padIndex);
                }
            }
        });
    }

    /**
     * Update pad loading progress
     * @param {number} index - Pad index
     * @param {number} progress - Progress percentage (0-100)
     */
    updateLoadingProgress(index, progress) {
        const pad = this.pads[index];
        pad.progressBar.style.width = `${progress}%`;
        pad.padStatus.textContent = `${Math.round(progress)}%`;
    }

    /**
     * Mark a pad as loaded
     * @param {number} index - Pad index
     * @param {string} name - Optional sound name
     */
    markPadLoaded(index, name = null) {
        const pad = this.pads[index];
        pad.element.classList.remove('disabled');
        pad.element.classList.add('loaded');
        pad.progressBar.style.width = '0%';
        pad.padStatus.textContent = name || 'Loaded';
    }

    /**
     * Mark a pad as empty
     * @param {number} index - Pad index
     */
    markPadEmpty(index) {
        const pad = this.pads[index];
        pad.element.classList.remove('loaded', 'selected');
        pad.element.classList.add('disabled');
        pad.progressBar.style.width = '0%';
        pad.padStatus.textContent = 'Empty';
    }

    /**
     * Clear all pads visually
     */
    clearAll() {
        for (let i = 0; i < 16; i++) {
            this.markPadEmpty(i);
        }
        this.selectedPadIndex = null;
    }

    /**
     * Get currently selected pad index
     * @returns {number|null} Selected pad index or null
     */
    getSelectedPad() {
        return this.selectedPadIndex;
    }

    /**
     * Highlight a pad temporarily (for MIDI/external trigger)
     * @param {number} index - Pad index
     */
    highlightPad(index) {
        const pad = this.pads[index];
        pad.element.classList.add('active');
        
        setTimeout(() => {
            pad.element.classList.remove('active');
        }, 150);
    }
}
