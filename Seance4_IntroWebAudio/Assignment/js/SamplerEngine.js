/**
 * SamplerEngine - Core audio processing engine (headless, no GUI dependencies)
 * 
 * This class handles all audio-related operations:
 * - Loading and decoding audio files
 * - Managing 16 sample pads
 * - Playback with trim positions
 * - Can work independently without GUI
 * 
 * Design principle: Separation of concerns - pure audio logic only
 */

export default class SamplerEngine {
    constructor(audioContext) {
        this.ctx = audioContext;
        this.sounds = new Array(16).fill(null); // 16 pads for samples
        this.trimPositions = new Array(16).fill(null).map(() => ({
            start: 0,  // Normalized position (0-1)
            end: 1     // Normalized position (0-1)
        }));
        this.activeSources = []; // Track playing sources for stopping
    }

    /**
     * Load a sound into a specific pad
     * @param {number} padIndex - Index of the pad (0-15)
     * @param {string} url - URL of the sound file
     * @param {function} onProgress - Optional callback for loading progress (0-100)
     * @returns {Promise<AudioBuffer>} The decoded audio buffer
     */
    async loadSound(padIndex, url, onProgress) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Track download progress
            const contentLength = response.headers.get('content-length');
            const total = parseInt(contentLength, 10);
            
            let loaded = 0;
            const reader = response.body.getReader();
            const chunks = [];

            // Read response in chunks and track progress
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                loaded += value.length;
                
                // Report progress
                if (onProgress && total) {
                    const progress = (loaded / total) * 100;
                    onProgress(progress);
                }
            }

            // Combine all chunks into a single ArrayBuffer
            const arrayBuffer = new Uint8Array(loaded);
            let position = 0;
            for (const chunk of chunks) {
                arrayBuffer.set(chunk, position);
                position += chunk.length;
            }

            // Decode audio data
            const decodedBuffer = await this.ctx.decodeAudioData(arrayBuffer.buffer);
            
            // Store in pad
            this.sounds[padIndex] = decodedBuffer;
            
            // Reset trim positions for new sound
            this.trimPositions[padIndex] = { start: 0, end: 1 };
            
            console.log(`Sound loaded on pad ${padIndex}: ${url}`);
            
            return decodedBuffer;

        } catch (error) {
            console.error(`Error loading sound for pad ${padIndex}:`, error);
            throw error;
        }
    }

    /**
     * Play a sound from a specific pad
     * @param {number} padIndex - Index of the pad to play (0-15)
     * @returns {AudioBufferSourceNode|null} The source node (for stopping) or null
     */
    playPad(padIndex) {
        const buffer = this.sounds[padIndex];
        
        if (!buffer) {
            console.warn(`No sound loaded on pad ${padIndex}`);
            return null;
        }

        // Create audio source
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);

        // Apply trim positions
        const trim = this.trimPositions[padIndex];
        const startTime = trim.start * buffer.duration;
        const duration = (trim.end - trim.start) * buffer.duration;

        // Start playback with trim
        source.start(0, startTime, duration);
        
        // Track active source
        this.activeSources.push(source);
        
        // Remove from active sources when finished
        source.onended = () => {
            const index = this.activeSources.indexOf(source);
            if (index > -1) {
                this.activeSources.splice(index, 1);
            }
        };
        
        console.log(`Playing pad ${padIndex} from ${startTime.toFixed(2)}s to ${(startTime + duration).toFixed(2)}s`);
        
        return source;
    }

    /**
     * Set trim positions for a pad (normalized 0-1 range)
     * @param {number} padIndex - Index of the pad
     * @param {number} start - Start position (0-1)
     * @param {number} end - End position (0-1)
     */
    setTrimPositions(padIndex, start, end) {
        if (padIndex >= 0 && padIndex < 16) {
            // Ensure valid range
            start = Math.max(0, Math.min(1, start));
            end = Math.max(0, Math.min(1, end));
            
            // Ensure start < end
            if (start >= end) {
                [start, end] = [end, start];
            }
            
            this.trimPositions[padIndex] = { start, end };
            console.log(`Trim positions set for pad ${padIndex}: ${start.toFixed(3)} - ${end.toFixed(3)}`);
        }
    }

    /**
     * Get trim positions for a pad
     * @param {number} padIndex - Index of the pad
     * @returns {{start: number, end: number}} Trim positions
     */
    getTrimPositions(padIndex) {
        return this.trimPositions[padIndex];
    }

    /**
     * Check if a pad has a sound loaded
     * @param {number} padIndex - Index of the pad
     * @returns {boolean} True if sound is loaded
     */
    isPadLoaded(padIndex) {
        return this.sounds[padIndex] !== null;
    }

    /**
     * Get the sound buffer for a pad
     * @param {number} padIndex - Index of the pad
     * @returns {AudioBuffer|null} The audio buffer or null
     */
    getSound(padIndex) {
        return this.sounds[padIndex];
    }

    /**
     * Stop all currently playing sounds
     */
    stopAll() {
        this.activeSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Source might already be stopped
            }
        });
        this.activeSources = [];
        console.log("All sounds stopped");
    }

    /**
     * Clear a specific pad
     * @param {number} padIndex - Index of the pad to clear
     */
    clearPad(padIndex) {
        if (padIndex >= 0 && padIndex < 16) {
            this.sounds[padIndex] = null;
            this.trimPositions[padIndex] = { start: 0, end: 1 };
            console.log(`Pad ${padIndex} cleared`);
        }
    }

    /**
     * Clear all pads
     */
    clearAll() {
        for (let i = 0; i < 16; i++) {
            this.clearPad(i);
        }
        console.log("All pads cleared");
    }

    /**
     * Get duration of a sound in a pad (in seconds)
     * @param {number} padIndex - Index of the pad
     * @returns {number} Duration in seconds, or 0 if no sound
     */
    getPadDuration(padIndex) {
        const buffer = this.sounds[padIndex];
        return buffer ? buffer.duration : 0;
    }

    /**
     * Get trimmed duration of a sound in a pad (in seconds)
     * @param {number} padIndex - Index of the pad
     * @returns {number} Trimmed duration in seconds
     */
    getTrimmedDuration(padIndex) {
        const buffer = this.sounds[padIndex];
        if (!buffer) return 0;
        
        const trim = this.trimPositions[padIndex];
        return (trim.end - trim.start) * buffer.duration;
    }
}
