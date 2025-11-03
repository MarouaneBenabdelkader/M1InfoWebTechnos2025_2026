# Exercise 4 - Understanding WAM (Web Audio Modules)

## Overview

Exercise 4 is about **studying Example4** to understand how Web Audio Modules (WAM) work.

## What is a WAM?

**WAM = Web Audio Module** - Think of it as "VST for the Web"

- VST plugins are used in desktop audio software (like Ableton, FL Studio)
- WAM plugins are used in web applications
- Both provide reusable, self-contained audio processing units

## Example4 Analysis

### What Example4 Shows:

1. **Loading a WAM Plugin** (the Sampler plugin)
2. **The plugin acts like any AudioNode** in the Web Audio API
3. **The plugin has its own GUI** (user interface)
4. **The plugin has internal complexity** (multiple audio nodes, effects, etc.)

### Key Files:

#### `index.html`

- Loads the main.js (for simple sound playback)
- Loads wamhost.js (for the WAM plugin)
- Contains two containers:
  - `buttonsContainer` - for simple sound buttons
  - `wamsampler-container` - for the WAM plugin GUI

#### `wamhost.js` - The Plugin Host

This is the key file to understand. It does 4 things:

```javascript
// 1. Initialize the WAM Host
const { default: initializeWamHost } = await import("...");
const [hostGroupId] = await initializeWamHost(audioContext);

// 2. Import the WAM Plugin
const { default: WAM } = await import('https://.../WamSampler/src/index.js');

// 3. Create an instance of the plugin
const instance = await WAM.createInstance(hostGroupId, audioContext);

// 4a. Connect the plugin's audioNode to the audio graph
instance.audioNode.connect(audioContext.destination);

// 4b. Create and mount the plugin's GUI
const pluginDomNode = await instance.createGui();
mount.appendChild(pluginDomNode);
```

### The Design Pattern: **COMPOSITE PATTERN**

The answer to the question "What is this design pattern?" is:

**COMPOSITE PATTERN** (also known as **FAÇADE PATTERN** in this context)

#### How it works:

```
Simple AudioNode:
  [OscillatorNode] ---> [destination]

WAM Plugin (Composite):
  [WAM Sampler AudioNode]
      |
      |-- Internally composed of:
      |   - BufferSourceNodes
      |   - GainNodes
      |   - FilterNodes
      |   - EffectNodes
      |   - etc...
      |
      +---> [destination]
```

#### Key Insight:

- **From the outside**: The WAM plugin looks like a single AudioNode
- **From the inside**: It's actually a complex graph of multiple nodes
- **Benefit**: Users don't need to know the internal complexity

This is like:

- A car has an "accelerator pedal" (simple interface)
- Behind it: engine, transmission, fuel injection, etc. (complex internals)

### What the Plugin Provides:

1. **Audio Processing** (`instance.audioNode`)

   - Acts like any Web Audio AudioNode
   - Can be connected to the audio graph
   - Internally manages complex audio processing
2. **User Interface** (`instance.createGui()`)

   - Returns a DOM element
   - Contains controls (sliders, buttons, dropdowns)
   - Separated from the audio processing logic
3. **State Management**

   - Presets
   - Parameter values
   - MIDI mappings

### Key Observations:

1. **Separation of Concerns**

   - GUI is separate from audio engine
   - You can use the audio engine without the GUI (headless mode)
   - You can replace the GUI with your own
2. **Interoperability**

   - WAM plugins follow a standard
   - Any WAM host can load any WAM plugin
   - Like VST plugins in desktop audio software
3. **Web Standards**

   - Uses ES6 modules (`import/export`)
   - Uses Web Audio API
   - Uses Web Components for GUI

## Your Assignment (from README)

Create your own sampler inspired by this, with:

1. **SamplerEngine class** (the audio processing)

   - Should work without a GUI
   - Should be testable independently
2. **SamplerGUI class** (the user interface)

   - Should communicate with the engine
   - Should be optional
3. **Integration**

   - Waveform visualizer
   - Trim bars
   - Server-side preset loading

## Questions to Think About:

1. **Why separate GUI from Engine?**

   - Testability (test audio without GUI)
   - Reusability (different GUIs for same engine)
   - Performance (run engine in Web Worker)
2. **Why use the Composite pattern?**

   - Simplicity for users
   - Encapsulation of complexity
   - Standardized interface
3. **How does this relate to Object-Oriented Programming?**

   - Encapsulation (hide internal complexity)
   - Abstraction (simple interface)
   - Composition (building complex objects from simple ones)
