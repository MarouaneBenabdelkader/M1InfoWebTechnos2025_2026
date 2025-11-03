# Exercise 5 Solution - Professional Sampler

## Overview

This is a complete, professional-grade sampler application that demonstrates all the concepts from Exercise 5:

- 4x4 pad matrix with visual feedback
- Progress bars during sound loading
- Separated Engine and GUI (can work headless)
- MIDI controller support
- Waveform visualization with trim bars
- Keyboard control

## Architecture

### 🎛️ Three Main Components:

```
┌─────────────────┐
│  SamplerEngine  │  ← Pure audio processing (no GUI)
└────────┬────────┘
         │
         │ uses
         ↓
┌─────────────────┐
│   SamplerGUI    │  ← Visual interface
└────────┬────────┘
         │
         │ triggers
         ↓
┌─────────────────┐
│ MIDIController  │  ← MIDI input handling
└─────────────────┘
```

### Component Details:

#### 1. **SamplerEngine.js**
**Purpose:** Handle all audio processing without any GUI dependency

**Key Methods:**
```javascript
loadSound(padIndex, url, onProgress)  // Load sound with progress callback
playPad(padIndex)                     // Trigger a pad sound
setTrimPositions(padIndex, start, end) // Save trim settings
getTrimPositions(padIndex)            // Get trim settings
isPadLoaded(padIndex)                 // Check if sound is loaded
getSound(padIndex)                    // Get audio buffer
```

**Why separate from GUI?**
- Can be tested independently
- Can run in Web Worker
- Can be used headless (no visual interface)
- Reusable in different contexts

#### 2. **SamplerGUI.js**
**Purpose:** Create and manage visual interface

**Key Methods:**
```javascript
flashPad(index)          // Visual feedback when pad is triggered
updateProgress(index, %) // Update loading progress bar
setPadLoaded(index)      // Mark pad as ready to play
selectPad(index)         // Highlight selected pad
```

**Features:**
- Creates 4x4 grid of pads
- Keyboard mapping (1234, QWER, ZXCV, ASDF)
- Visual states (loading, loaded, active, selected)
- Progress bars on each pad

#### 3. **MIDIController.js**
**Purpose:** Handle MIDI device input

**Key Methods:**
```javascript
initialize()             // Request MIDI access
getDevices()            // List available MIDI devices
selectDevice(deviceId)  // Connect to a device
handleMIDIMessage(msg)  // Process MIDI input
```

**MIDI Mapping:**
- Notes C3-D#4 (48-63) → Pads 0-15
- Note On triggers pad
- Works with any MIDI controller

## File Structure

```
Exercise5_Solution/
├── index.html                 # Main HTML page
├── css/
│   └── styles.css            # Beautiful gradient design
└── js/
    ├── main.js               # Application initialization
    ├── SamplerEngine.js      # Audio engine (no GUI)
    ├── SamplerGUI.js         # Visual interface
    ├── MIDIController.js     # MIDI support
    ├── waveformdrawer.js     # Waveform visualization
    ├── trimbarsdrawer.js     # Trim bar controls
    ├── soundutils.js         # Audio utilities
    └── utils.js              # Helper functions
```

## How It Works

### 1. Loading Sounds with Progress

```javascript
// In SamplerEngine.js
async loadSound(padIndex, url, onProgress) {
    const response = await fetch(url);
    const reader = response.body.getReader();
    
    // Read chunks and report progress
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        // Call progress callback
        if (onProgress && total) {
            onProgress((loaded / total) * 100);
        }
    }
    
    // Decode audio from chunks
    const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
    this.sounds[padIndex] = decodedBuffer;
}
```

### 2. Pad Grid Layout

Pads are numbered from **bottom-left to top-right** (like Akai MPC):

```
┌────┬────┬────┬────┐
│  0 │  1 │  2 │  3 │  ← Top row
├────┼────┼────┼────┤
│  4 │  5 │  6 │  7 │
├────┼────┼────┼────┤
│  8 │  9 │ 10 │ 11 │
├────┼────┼────┼────┤
│ 12 │ 13 │ 14 │ 15 │  ← Bottom row
└────┴────┴────┴────┘
```

### 3. Loading All Sounds

```javascript
// Using Promise.allSettled (doesn't fail on errors)
const results = await Promise.allSettled(
    soundURLs.map((url, i) => 
        samplerEngine.loadSound(i, url, (progress) => {
            samplerGUI.updateProgress(i, progress);
        })
    )
);

// Check which loaded successfully
results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
        samplerGUI.setPadLoaded(index);
    } else {
        samplerGUI.setPadError(index);
    }
});
```

## User Interactions

### Mouse
- **Click pad** → Play sound and show waveform
- **Drag trim bars** → Adjust playback region

### Keyboard
```
1 2 3 4     → Pads 0-3  (top row)
Z X C V     → Pads 4-7
Q W E R     → Pads 8-11
A S D F     → Pads 12-15 (bottom row)
```

### MIDI
- Connect MIDI controller via dropdown
- Notes 48-63 trigger pads 0-15
- Any velocity triggers pad

## Usage Instructions

### Basic Usage:

1. **Open** `index.html` in a modern browser
2. **Click** "Load All Sounds" button
3. **Wait** for progress bars to complete
4. **Play** using mouse, keyboard, or MIDI

### With MIDI Controller:

1. **Connect** MIDI device to computer
2. **Refresh** page (or wait for device detection)
3. **Select** device from dropdown
4. **Play** notes C3-D#4 to trigger pads

### Adjusting Sounds:

1. **Click** a pad to select it
2. **View** waveform below
3. **Drag** trim bars to select region
4. **Click** pad again to hear trimmed sound

## Features Demonstrated

### ✅ From Exercise 5 Examples:

1. **Progress Bars** (Example 1 & 2)
   - Chunked download with fetch
   - Real-time progress updates
   - Per-pad progress visualization

2. **4x4 Pad Matrix** (Example 3)
   - Bottom-to-top, left-to-right ordering
   - Promise.allSettled for parallel loading
   - Visual feedback on trigger

3. **Engine/GUI Separation** (Example 4)
   - SamplerEngine works without GUI
   - Can be tested independently
   - Clean separation of concerns

4. **MIDI Control** (Example 4)
   - Web MIDI API integration
   - Device selection
   - Note-to-pad mapping

### ✅ Additional Features:

- Waveform visualization
- Trim bar controls
- State persistence per pad
- Visual feedback (flash on trigger)
- Error handling for failed loads
- Beautiful gradient UI

## Design Patterns Used

### 1. **Separation of Concerns**
- Engine: Audio logic only
- GUI: Visual representation only
- MIDI: Input handling only

### 2. **Observer Pattern**
- GUI observes Engine through callbacks
- `onPadClick` callback in GUI
- `onProgress` callback in loading

### 3. **State Pattern**
- Pad states: disabled, loading, loaded, active, selected
- Visual representation changes with state

### 4. **Factory Pattern**
- `createPad()` method generates pad elements
- Consistent pad creation

## Testing the Separation

### Test Engine Without GUI:

```javascript
// Can use SamplerEngine independently
const ctx = new AudioContext();
const engine = new SamplerEngine(ctx);

// Load and play without any visual interface
await engine.loadSound(0, 'sound.wav');
engine.playPad(0);  // Works!
```

### Test GUI Without Real Sounds:

```javascript
// Mock engine for testing
const mockEngine = {
    isPadLoaded: () => true,
    playPad: (i) => console.log(`Play pad ${i}`),
    getSound: () => null
};

const gui = new SamplerGUI(container, mockEngine);
// GUI works with mock!
```

## Browser Compatibility

### Requirements:
- **Web Audio API** (all modern browsers)
- **Fetch API** with streaming (Chrome 43+, Firefox 57+, Safari 10.1+)
- **Web MIDI API** (Chrome 43+, Edge 79+) - MIDI optional
- **ES6 Modules** (all modern browsers)

### Fallbacks:
- MIDI gracefully degrades if not available
- Progress bars work even without content-length header
- Error handling for failed sound loads

## Performance Considerations

### Optimizations:
1. **Parallel loading** with Promise.allSettled
2. **Chunked streaming** for large files
3. **RequestAnimationFrame** for smooth animation
4. **Event delegation** could be added for better performance

### Memory:
- 16 decoded audio buffers in memory
- Each ~1-2MB depending on sound length
- Total ~16-32MB (reasonable for modern browsers)

## Next Steps / Enhancements

### For Your Assignment:

1. **Add Server Integration**
   - Load presets from REST API
   - Dynamic sound URLs from server
   - Preset selection dropdown

2. **Add More Controls**
   - Volume per pad
   - Pitch adjustment
   - Effects (reverb, delay)

3. **Save/Load**
   - Save trim positions
   - Save entire kit
   - Export feature

4. **Better MIDI**
   - Velocity sensitivity
   - MIDI learn for custom mapping
   - Multiple MIDI inputs

## Troubleshooting

### Sounds Won't Load?
- Check browser console for errors
- CORS issues? Some URLs may block cross-origin requests
- Try local sound files

### MIDI Not Working?
- Only works in Chrome/Edge (not Firefox/Safari yet)
- Check browser console for permissions
- Try refreshing after connecting device

### Progress Bars Stuck?
- Some servers don't send content-length header
- Sound still loads, just no progress percentage
- Check network tab in DevTools

## Resources

- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
- [Promise.allSettled](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled)
- [Fetch API with Streams](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams)

## Credits

Inspired by Exercise 5 examples and ChatGPT solutions.
Implements professional sampler with clean architecture.
Ready to be extended for your assignment!
