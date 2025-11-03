// Sampler GUI - Handles visual representation and user interaction
// Communicates with SamplerEngine but doesn't handle audio directly

export default class SamplerGUI {
    constructor(containerElement, engine) {
        this.container = containerElement;
        this.engine = engine;
        this.pads = [];
        this.selectedPad = null;
        this.onPadClick = null; // Callback for pad clicks
        this.keyMapping = this.createKeyMapping();
        this.initializePads();
        this.setupKeyboardListeners();
    }

    createKeyMapping() {
        // Map keyboard keys to pads (bottom to top, left to right)
        // Row 4 (bottom): A S D F
        // Row 3: Q W E R
        // Row 2: Z X C V
        // Row 1 (top): 1 2 3 4
        return {
            'a': 12, 's': 13, 'd': 14, 'f': 15,
            'q': 8,  'w': 9,  'e': 10, 'r': 11,
            'z': 4,  'x': 5,  'c': 6,  'v': 7,
            '1': 0,  '2': 1,  '3': 2,  '4': 3
        };
    }

    initializePads() {
        // Create 16 pads (4x4 grid)
        // Pads are numbered from bottom-left to top-right
        for (let i = 0; i < 16; i++) {
            const pad = this.createPad(i);
            this.pads.push(pad);
            this.container.appendChild(pad.element);
        }

        // Reorder pads in grid (bottom to top)
        // We want pad 0 at bottom-left, pad 15 at top-right
        const reorderedPads = [];
        for (let row = 3; row >= 0; row--) {
            for (let col = 0; col < 4; col++) {
                const index = row * 4 + col;
                reorderedPads.push(this.pads[index].element);
            }
        }
        
        this.container.innerHTML = '';
        reorderedPads.forEach(pad => this.container.appendChild(pad));
    }

    createPad(index) {
        const element = document.createElement('div');
        element.className = 'pad disabled';
        element.dataset.index = index;

        const padNumber = document.createElement('div');
        padNumber.className = 'pad-number';
        padNumber.textContent = `Pad ${index + 1}`;

        const padKey = document.createElement('div');
        padKey.className = 'pad-key';
        padKey.textContent = this.getKeyForPad(index);

        const padStatus = document.createElement('div');
        padStatus.className = 'pad-status';
        padStatus.textContent = 'Empty';

        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';

        element.appendChild(padNumber);
        element.appendChild(padKey);
        element.appendChild(padStatus);
        element.appendChild(progressBar);

        element.addEventListener('click', () => this.handlePadClick(index));

        return {
            element,
            index,
            progressBar,
            padStatus
        };
    }

    getKeyForPad(index) {
        for (const [key, padIndex] of Object.entries(this.keyMapping)) {
            if (padIndex === index) {
                return key.toUpperCase();
            }
        }
        return '?';
    }

    handlePadClick(index) {
        if (this.engine.isPadLoaded(index)) {
            this.selectPad(index);
            this.engine.playPad(index);
            this.flashPad(index);
            
            if (this.onPadClick) {
                this.onPadClick(index);
            }
        }
    }

    selectPad(index) {
        // Remove selection from all pads
        this.pads.forEach(pad => {
            pad.element.classList.remove('selected');
        });

        // Select this pad
        this.pads[index].element.classList.add('selected');
        this.selectedPad = index;
    }

    flashPad(index) {
        const pad = this.pads[index].element;
        pad.classList.add('active');
        setTimeout(() => {
            pad.classList.remove('active');
        }, 100);
    }

    updateProgress(index, progress) {
        this.pads[index].progressBar.style.width = `${progress}%`;
    }

    setPadLoaded(index) {
        const pad = this.pads[index];
        pad.element.classList.remove('disabled');
        pad.padStatus.textContent = 'Ready';
        pad.progressBar.style.width = '0%';
    }

    setPadLoading(index) {
        this.pads[index].padStatus.textContent = 'Loading...';
    }

    setPadError(index) {
        this.pads[index].padStatus.textContent = 'Error';
        this.pads[index].element.classList.add('disabled');
    }

    setupKeyboardListeners() {
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            const padIndex = this.keyMapping[key];
            
            if (padIndex !== undefined && this.engine.isPadLoaded(padIndex)) {
                e.preventDefault();
                this.handlePadClick(padIndex);
            }
        });
    }

    getSelectedPad() {
        return this.selectedPad;
    }
}
