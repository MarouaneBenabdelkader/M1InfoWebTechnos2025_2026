// Sampler Engine - Handles audio processing (no GUI dependency)
// This can work independently without any GUI (headless mode)

export default class SamplerEngine {
    constructor(audioContext) {
        this.ctx = audioContext;
        this.sounds = new Array(16).fill(null); // 16 pads
        this.trimPositions = new Array(16).fill(null).map(() => ({
            start: 0,
            end: 1
        }));
    }

    // Load a sound into a specific pad
    async loadSound(padIndex, url, onProgress) {
        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentLength = response.headers.get('content-length');
            const total = parseInt(contentLength, 10);
            
            let loaded = 0;
            const reader = response.body.getReader();
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                loaded += value.length;
                
                if (onProgress && total) {
                    const progress = (loaded / total) * 100;
                    onProgress(progress);
                }
            }

            // Combine chunks
            const arrayBuffer = new Uint8Array(loaded);
            let position = 0;
            for (const chunk of chunks) {
                arrayBuffer.set(chunk, position);
                position += chunk.length;
            }

            // Decode audio
            const decodedBuffer = await this.ctx.decodeAudioData(arrayBuffer.buffer);
            
            this.sounds[padIndex] = decodedBuffer;
            this.trimPositions[padIndex] = { start: 0, end: 1 };
            
            return decodedBuffer;

        } catch (error) {
            console.error(`Error loading sound for pad ${padIndex}:`, error);
            throw error;
        }
    }

    // Play a sound from a specific pad
    playPad(padIndex) {
        const buffer = this.sounds[padIndex];
        
        if (!buffer) {
            console.warn(`No sound loaded on pad ${padIndex}`);
            return null;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);

        const trim = this.trimPositions[padIndex];
        const startTime = trim.start * buffer.duration;
        const duration = (trim.end - trim.start) * buffer.duration;

        source.start(0, startTime, duration);
        
        return source;
    }

    // Set trim positions for a pad (0 to 1 range)
    setTrimPositions(padIndex, start, end) {
        if (padIndex >= 0 && padIndex < 16) {
            this.trimPositions[padIndex] = { start, end };
        }
    }

    // Get trim positions for a pad
    getTrimPositions(padIndex) {
        return this.trimPositions[padIndex];
    }

    // Check if a pad has a sound loaded
    isPadLoaded(padIndex) {
        return this.sounds[padIndex] !== null;
    }

    // Get the sound buffer for a pad
    getSound(padIndex) {
        return this.sounds[padIndex];
    }

    // Stop all playing sounds (not implemented in basic version)
    stopAll() {
        // In a real implementation, we'd track active sources
        console.log("Stop all sounds");
    }
}
