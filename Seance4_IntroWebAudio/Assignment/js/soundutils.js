/**
 * Sound utility functions for loading and playing audio
 * 
 * Simple wrappers around Web Audio API operations
 * Reused from Exercise 3
 */

/**
 * Load and decode a sound file
 * @param {string} url - URL of the sound file
 * @param {AudioContext} ctx - Audio context
 * @returns {Promise<AudioBuffer>} Decoded audio buffer
 */
async function loadAndDecodeSound(url, ctx) {
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const sound = await response.arrayBuffer();
        console.log("Sound loaded as arrayBuffer: " + url);
        
        const decodedSound = await ctx.decodeAudioData(sound);
        console.log("Sound decoded: " + url);
        
        return decodedSound;
    } catch (error) {
        console.error("Error loading sound:", error);
        throw error;
    }
}

/**
 * Build audio graph with source connected to destination
 * @param {AudioContext} ctx - Audio context
 * @param {AudioBuffer} buffer - Audio buffer
 * @returns {AudioBufferSourceNode} Buffer source node
 */
function buildAudioGraph(ctx, buffer) {
    let bufferSource = ctx.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(ctx.destination);
    return bufferSource;
}

/**
 * Play a sound with optional trim
 * @param {AudioContext} ctx - Audio context
 * @param {AudioBuffer} buffer - Audio buffer
 * @param {number} startTime - Start time in seconds (default: 0)
 * @param {number} duration - Duration in seconds (default: full buffer)
 * @returns {AudioBufferSourceNode} The playing source node
 */
function playSound(ctx, buffer, startTime = 0, duration = null) {
    // Validate and constrain times
    if (startTime < 0) startTime = 0;
    if (startTime > buffer.duration) startTime = buffer.duration;
    
    if (duration === null) {
        duration = buffer.duration - startTime;
    }
    
    const maxDuration = buffer.duration - startTime;
    if (duration > maxDuration) {
        duration = maxDuration;
    }
    
    // Build and play
    let bufferSource = buildAudioGraph(ctx, buffer);
    bufferSource.start(0, startTime, duration);
    
    return bufferSource;
}

/**
 * Play a sound with normalized trim positions (0-1 range)
 * @param {AudioContext} ctx - Audio context
 * @param {AudioBuffer} buffer - Audio buffer
 * @param {number} normalizedStart - Start position (0-1)
 * @param {number} normalizedEnd - End position (0-1)
 * @returns {AudioBufferSourceNode} The playing source node
 */
function playSoundWithTrim(ctx, buffer, normalizedStart = 0, normalizedEnd = 1) {
    const startTime = normalizedStart * buffer.duration;
    const endTime = normalizedEnd * buffer.duration;
    const duration = endTime - startTime;
    
    return playSound(ctx, buffer, startTime, duration);
}

export { 
    loadAndDecodeSound, 
    buildAudioGraph, 
    playSound,
    playSoundWithTrim
};
