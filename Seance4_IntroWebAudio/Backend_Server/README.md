# Sampler Backend Server

A Node.js/Express REST API server that provides drum kit presets for the Web Audio Sampler exercises.

## Features

- ✅ REST API for preset management
- ✅ CORS enabled for local development
- ✅ Multiple drum kit presets
- ✅ Sound file proxying (avoids CORS issues)
- ✅ Simple JSON responses
- ✅ Health check endpoint

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 3. Test the API

Open in browser: `http://localhost:3000/api/presets`

You should see JSON with all available presets.

## API Endpoints

### Get All Presets
```
GET http://localhost:3000/api/presets
```

**Response:**
```json
[
  {
    "id": "drums-basic",
    "name": "Basic Drums",
    "description": "Essential drum kit sounds",
    "samples": [
      {
        "name": "Kick",
        "path": "sounds/kick.wav",
        "url": "https://..."
      }
    ]
  }
]
```

### Get Specific Preset
```
GET http://localhost:3000/api/presets/:id
```

Example: `http://localhost:3000/api/presets/drums-basic`

### Get Preset Samples
```
GET http://localhost:3000/api/presets/:id/samples
```

Example: `http://localhost:3000/api/presets/drums-basic/samples`

### Get Sound File (Proxied)
```
GET http://localhost:3000/sounds/:filename
```

Example: `http://localhost:3000/sounds/kick.wav`

This endpoint proxies external sound URLs to avoid CORS issues.

### API Documentation
```
GET http://localhost:3000/api
```

Returns API information and available endpoints.

### Health Check
```
GET http://localhost:3000/health
```

Returns server status.

## Available Presets

### 1. Basic Drums (`drums-basic`)
- Kick
- Snare
- Hi-Hat Closed
- Hi-Hat Open

### 2. Extended Drums (`drums-extended`)
- Tom High
- Tom Mid
- Tom Low
- Crash
- Ride

### 3. Percussion Kit (`percussion`)
- Kick
- Snare
- Shoot (laser sound)

### 4. Complete Kit (`complete-kit`)
All 9 drum sounds combined

## Using with Exercise 3

### Method 1: Using External URLs (Recommended)

Your client code can use the `url` property from each sample:

```javascript
const response = await fetch('http://localhost:3000/api/presets');
const presets = await response.json();

const firstPreset = presets[0];
const soundURLs = firstPreset.samples.map(sample => sample.url);
// Load these URLs directly
```

### Method 2: Using Proxied Sounds

Use the server as a proxy to avoid CORS issues:

```javascript
const soundURLs = firstPreset.samples.map(sample => 
    `http://localhost:3000/${sample.path}`
);
```

## Response Format

Each preset has this structure:

```javascript
{
    id: "unique-id",           // Preset identifier
    name: "Display Name",      // Human-readable name
    description: "...",        // Description
    samples: [                 // Array of sound samples
        {
            name: "Sample Name",     // Display name for sound
            path: "sounds/file.wav", // Relative path (for proxy)
            url: "https://..."       // Direct external URL
        }
    ]
}
```

## Testing the Server

### Using Browser
1. Open: `http://localhost:3000/api/presets`
2. You should see JSON data

### Using curl
```bash
curl http://localhost:3000/api/presets
```

### Using Browser DevTools
1. Open your Exercise 3 solution
2. Press F12 → Network tab
3. Filter by "Fetch/XHR"
4. Select a preset
5. See the request/response data

## CORS Configuration

CORS is enabled for all origins to allow local development:

```javascript
app.use(cors());
```

For production, you should restrict this:

```javascript
app.use(cors({
    origin: 'https://yourdomain.com'
}));
```

## File Structure

```
Backend_Server/
├── server.js           # Main server file
├── package.json        # Dependencies
├── README.md          # This file
└── public/            # Static files (if needed)
    └── sounds/        # Sound files (optional)
```

## Dependencies

- **express**: Web framework
- **cors**: Cross-Origin Resource Sharing
- **node-fetch**: Fetch API for Node.js (for proxying)

## Development

### Adding New Presets

Edit `server.js` and add to the `presets` array:

```javascript
{
    id: "my-preset",
    name: "My Custom Preset",
    description: "Custom sounds",
    samples: [
        { 
            name: "Sound 1", 
            path: "sounds/sound1.wav",
            url: "https://example.com/sound1.wav"
        }
    ]
}
```

### Adding Local Sound Files

1. Place sound files in `public/sounds/`
2. Update the `path` in presets
3. Files will be served from `http://localhost:3000/sounds/filename`

## Troubleshooting

### Port 3000 already in use

Change the PORT in `server.js`:

```javascript
const PORT = 3001; // or any other port
```

### CORS errors

Make sure CORS is enabled in server.js (it should be by default).

### Can't fetch presets

1. Check server is running: `http://localhost:3000/health`
2. Check console for errors
3. Verify endpoint: `http://localhost:3000/api/presets`

### Sounds won't load

- Check the URLs in the presets are accessible
- Use the proxy endpoint: `/sounds/filename`
- Check browser console for errors

## Production Considerations

For production deployment:

1. **Use environment variables** for PORT and URLs
2. **Add authentication** if needed
3. **Rate limiting** to prevent abuse
4. **Logging** for debugging
5. **Database** instead of in-memory array
6. **HTTPS** for secure connections
7. **Restrict CORS** to specific domains

## Example Client Code

```javascript
// Fetch all presets
const response = await fetch('http://localhost:3000/api/presets');
const presets = await response.json();

// Populate dropdown
presets.forEach(preset => {
    const option = document.createElement('option');
    option.value = preset.id;
    option.textContent = preset.name;
    presetSelect.appendChild(option);
});

// Load a preset
async function loadPreset(presetId) {
    const response = await fetch(`http://localhost:3000/api/presets/${presetId}`);
    const preset = await response.json();
    
    // Get sound URLs
    const soundURLs = preset.samples.map(s => s.url);
    
    // Load sounds...
}
```

## License

ISC

## Support

For issues or questions, check:
- Server console output
- Browser DevTools console
- Network tab for failed requests
