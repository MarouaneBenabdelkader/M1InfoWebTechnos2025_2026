/**
 * Utility functions for the sampler application
 */

/**
 * Calculate Euclidean distance between two points
 * @param {number} x1 - X coordinate of first point
 * @param {number} y1 - Y coordinate of first point
 * @param {number} x2 - X coordinate of second point
 * @param {number} y2 - Y coordinate of second point
 * @returns {number} Distance between points
 */
function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert pixel position to time in seconds
 * @param {number} pixelX - X pixel position on canvas
 * @param {number} canvasWidth - Total canvas width
 * @param {number} duration - Total audio duration in seconds
 * @returns {number} Time in seconds
 */
function pixelToSeconds(pixelX, canvasWidth, duration) {
    return (pixelX / canvasWidth) * duration;
}

/**
 * Convert time in seconds to pixel position
 * @param {number} seconds - Time in seconds
 * @param {number} canvasWidth - Total canvas width
 * @param {number} duration - Total audio duration in seconds
 * @returns {number} Pixel position
 */
function secondsToPixel(seconds, canvasWidth, duration) {
    return (seconds / duration) * canvasWidth;
}

/**
 * Get mouse position relative to canvas
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {MouseEvent} event - Mouse event
 * @returns {{x: number, y: number}} Mouse position
 */
function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

/**
 * Format seconds to MM:SS.mmm format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

/**
 * Format seconds to simple S.mmm format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTimeSimple(seconds) {
    return seconds.toFixed(2) + 's';
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

export { 
    distance, 
    pixelToSeconds, 
    secondsToPixel, 
    getMousePos, 
    formatTime, 
    formatTimeSimple,
    clamp,
    lerp
};
