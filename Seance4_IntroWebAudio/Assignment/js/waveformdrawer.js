/**
 * WaveformDrawer - Visualizes audio waveform on canvas
 * 
 * This class efficiently renders audio waveforms by:
 * - Computing peak values for efficient rendering
 * - Drawing waveform with customizable colors
 * - Handling canvas dimensions
 * 
 * Reused and adapted from Exercise 3
 */

export default class WaveformDrawer {
    constructor() {
        this.decodedAudioBuffer = null;
        this.peaks = null;
        this.canvas = null;
        this.displayWidth = 0;
        this.displayHeight = 0;
        this.color = 'lightblue';
        this.sampleStep = 1;
    }

    /**
     * Initialize the waveform drawer with audio data
     * @param {AudioBuffer} decodedAudioBuffer - Decoded audio buffer
     * @param {HTMLCanvasElement} canvas - Canvas element to draw on
     * @param {string} color - Color for waveform
     * @param {number} sampleStep - Step size for peak calculation (higher = faster but less detail)
     */
    init(decodedAudioBuffer, canvas, color = 'lightblue', sampleStep = 1) {
        this.decodedAudioBuffer = decodedAudioBuffer;
        this.canvas = canvas;
        this.displayWidth = canvas.width;
        this.displayHeight = canvas.height;
        this.color = color;
        this.sampleStep = sampleStep;

        this.getPeaks();
    }

    /**
     * Find maximum value in an array
     * @param {Float32Array} values - Array of values
     * @returns {number} Maximum value
     */
    max(values) {
        let max = -Infinity;
        for (let i = 0, len = values.length; i < len; i++) {
            let val = Math.abs(values[i]); // Use absolute value for peaks
            if (val > max) { 
                max = val; 
            }
        }
        return max;
    }

    /**
     * Calculate peak values for efficient waveform rendering
     * Divides audio into segments matching canvas width
     */
    getPeaks() {
        const soundData = this.decodedAudioBuffer.getChannelData(0); // Use first channel
        const sampleSize = Math.floor(soundData.length / this.displayWidth);
        
        this.peaks = [];
        
        for (let i = 0; i < this.displayWidth; i++) {
            const start = i * sampleSize;
            const end = start + sampleSize;
            const segment = soundData.slice(start, end);
            
            // Find peak in this segment
            this.peaks[i] = this.max(segment);
        }
    }

    /**
     * Draw the waveform on the canvas
     * @param {number} startY - Y position to start drawing
     * @param {number} height - Height of the waveform
     */
    drawWave(startY = 0, height = this.displayHeight) {
        if (!this.peaks || !this.canvas) {
            console.warn('WaveformDrawer not initialized');
            return;
        }

        const ctx = this.canvas.getContext('2d');
        ctx.save();
        ctx.translate(0, startY);

        // Clear canvas
        ctx.clearRect(0, 0, this.displayWidth, height);

        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;

        const width = this.displayWidth;
        const coef = height / (2 * this.max(this.peaks));
        const halfH = height / 2;

        // Draw horizontal center line
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.moveTo(0, halfH);
        ctx.lineTo(width, halfH);
        ctx.stroke();

        // Draw waveform
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.moveTo(0, halfH);

        // Draw top half of waveform
        for (let i = 0; i < this.peaks.length; i++) {
            const x = i;
            const y = halfH - (this.peaks[i] * coef);
            ctx.lineTo(x, y);
        }

        // Draw bottom half (mirrored)
        for (let i = this.peaks.length - 1; i >= 0; i--) {
            const x = i;
            const y = halfH + (this.peaks[i] * coef);
            ctx.lineTo(x, y);
        }

        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    /**
     * Clear the canvas
     */
    clear() {
        if (this.canvas) {
            const ctx = this.canvas.getContext('2d');
            ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
        }
    }

    /**
     * Update color and redraw
     * @param {string} newColor - New color for waveform
     */
    setColor(newColor) {
        this.color = newColor;
        if (this.peaks) {
            this.drawWave();
        }
    }

    /**
     * Get the audio buffer duration
     * @returns {number} Duration in seconds
     */
    getDuration() {
        return this.decodedAudioBuffer ? this.decodedAudioBuffer.duration : 0;
    }

    /**
     * Check if waveform is initialized
     * @returns {boolean} True if initialized
     */
    isInitialized() {
        return this.peaks !== null && this.canvas !== null;
    }
}
