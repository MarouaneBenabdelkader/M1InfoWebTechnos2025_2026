# Exercise 3 Solution - Server Integration

## Overview

This exercise demonstrates loading sound presets from a REST API server, with automatic fallback when the server is unavailable.

## How It Works

### With Server (Ideal):
1. Fetches presets from `http://localhost:3000/api/presets`
2. Displays preset names in dropdown
3. Loads sounds from server when preset is selected

### Without Server (Fallback):
1. Automatically detects server is unavailable
2. Uses hardcoded fallback presets
3. Loads sounds directly from online URLs
4. Everything still works!

## Running the Example

### Option 1: Without Server (Easy)
Just open `index.html` in your browser. It will automatically use fallback presets.

### Option 2: With Server (Full Experience)

1. **Navigate to your Seance1 or Seance2 folder:**
   ```bash
   cd path/to/Seance1  # or Seance2
   ```

2. **Install dependencies (if not done already):**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm run start
   ```

4. **Verify server is running:**
   Open browser and visit: `http://localhost:3000/api/presets`
   
   You should see JSON data with presets.

5. **Open Exercise 3:**
   Open `Exercise3_Solution/index.html` in your browser

## Expected Server Response Format

Your server should return an array of preset objects:

```json
[
  {
    "id": "preset1",
    "name": "Drum Kit 1",
    "samples": [
      {"path": "sounds/kick.wav"},
      {"path": "sounds/snare.wav"},
      {"path": "sounds/hihat.wav"}
    ]
  },
  {
    "id": "preset2",
    "name": "Percussion",
    "samples": [
      {"path": "sounds/tom1.wav"},
      {"path": "sounds/tom2.wav"}
    ]
  }
]
```

### Supported Formats:

The code handles multiple formats:

**Option 1: Object with path**
```json
{"path": "sounds/kick.wav"}
```

**Option 2: Object with file**
```json
{"file": "sounds/kick.wav"}
```

**Option 3: Simple string**
```json
"sounds/kick.wav"
```

**Option 4: Full URLs (works in fallback mode)**
```json
{"path": "https://example.com/sound.wav"}
```

## Fallback Presets

When the server is not available, three fallback presets are used:

1. **Drum Kit 1** - 4 basic drum sounds
2. **Drum Kit 2** - 4 tom and cymbal sounds
3. **Percussion** - 3 miscellaneous sounds

All sounds are loaded from external URLs (Wikipedia and course server).

## Features

✅ Automatic server detection  
✅ Fallback mode when server unavailable  
✅ Preset dropdown menu  
✅ Waveform visualization  
✅ Trim bars for each sound  
✅ Per-sound state persistence  
✅ Error handling  

## User Interface

### Elements:

1. **Preset Dropdown** - Select which preset to load
2. **Sound Buttons** - Play individual sounds
3. **Waveform Canvas** - Visualize selected sound
4. **Trim Bars** - Adjust playback region

### Status Messages:

- **Orange warning**: Server not available, using fallback mode
- **"Loading sounds..."**: Currently downloading sounds
- **"Ready"**: Sound loaded and playable

## Controls

- **Select preset** from dropdown → Loads all sounds in that preset
- **Click sound button** → Plays sound and shows waveform
- **Drag trim bars** → Adjusts which portion of sound plays
- Trim positions are saved per-sound

## Troubleshooting

### "Server not available" message appears:

**This is normal!** The app will work fine with fallback presets. 

If you want to use your server:
1. Make sure server is running (`npm run start`)
2. Check it's on port 3000
3. Verify `/api/presets` endpoint exists
4. Refresh the page

### Sounds won't load:

- Check browser console (F12) for errors
- CORS issues? Server must allow cross-origin requests
- Network tab shows failed requests? Check URLs

### Dropdown is empty:

- Check browser console for errors
- Server response format might be different
- Try fallback mode (just works!)

## Code Structure

```
Exercise3_Solution/
├── index.html              # Main page
├── css/
│   └── styles.css         # Styling
└── js/
    ├── main.js            # Main logic with fallback
    ├── soundutils.js      # Sound loading/playback
    ├── waveformdrawer.js  # Waveform visualization
    ├── trimbarsdrawer.js  # Trim bar controls
    └── utils.js           # Helper functions
```

## Key Concepts

### 1. Fetch API with Error Handling
```javascript
try {
    const response = await fetch('http://localhost:3000/api/presets');
    // Use server data
} catch (error) {
    // Use fallback data
}
```

### 2. Dynamic URL Building
```javascript
// Checks if URL is already complete or needs server prefix
url = sample.path.startsWith('http') 
    ? sample.path 
    : `http://localhost:3000/${sample.path}`;
```

### 3. Promise.all for Parallel Loading
```javascript
const loadPromises = soundURLs.map(url => loadAndDecodeSound(url, ctx));
const decodedSounds = await Promise.all(loadPromises);
```

## Next Steps

For your assignment, you'll combine this with Exercise 5:
- Use Exercise 5's architecture (Engine + GUI)
- Add this exercise's server integration
- Create a complete professional sampler!

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome
- ✅ Firefox  
- ✅ Safari
- ✅ Edge

## Tips

1. **Development**: Use fallback mode for quick testing
2. **Production**: Set up proper server with CORS
3. **Testing**: Use browser DevTools Network tab to debug
4. **Enhancement**: Add loading indicators, error recovery

## Related Files

- See `SOLUTIONS_README.md` for overview
- See `Exercise5_Solution` for complete architecture
- See original `README.md` for assignment details
