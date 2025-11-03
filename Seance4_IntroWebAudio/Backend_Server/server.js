const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.static('public')); // Serve static files from public folder

// Presets database (in a real app, this would be in a database)
const presets = [
    {
        id: "drums-basic",
        name: "Basic Drums",
        description: "Essential drum kit sounds",
        samples: [
            { 
                name: "Kick", 
                path: "sounds/kick.wav",
                url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav"
            },
            { 
                name: "Snare", 
                path: "sounds/snare.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3"
            },
            { 
                name: "Hi-Hat Closed", 
                path: "sounds/hihat-closed.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3"
            },
            { 
                name: "Hi-Hat Open", 
                path: "sounds/hihat-open.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3"
            }
        ]
    },
    {
        id: "drums-extended",
        name: "Extended Drums",
        description: "More drum sounds including toms",
        samples: [
            { 
                name: "Tom High", 
                path: "sounds/tom-high.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3"
            },
            { 
                name: "Tom Mid", 
                path: "sounds/tom-mid.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3"
            },
            { 
                name: "Tom Low", 
                path: "sounds/tom-low.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3"
            },
            { 
                name: "Crash", 
                path: "sounds/crash.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3"
            },
            { 
                name: "Ride", 
                path: "sounds/ride.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3"
            }
        ]
    },
    {
        id: "percussion",
        name: "Percussion Kit",
        description: "Various percussion sounds",
        samples: [
            { 
                name: "Kick", 
                path: "sounds/kick2.wav",
                url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav"
            },
            { 
                name: "Snare", 
                path: "sounds/snare2.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3"
            },
            { 
                name: "Shoot", 
                path: "sounds/shoot.mp3",
                url: "https://mainline.i3s.unice.fr/mooc/shoot2.mp3"
            }
        ]
    },
    {
        id: "complete-kit",
        name: "Complete Kit",
        description: "All available drum sounds",
        samples: [
            { 
                name: "Kick", 
                path: "sounds/kick.wav",
                url: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Hardstyle_kick.wav"
            },
            { 
                name: "Snare", 
                path: "sounds/snare.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c7/Redoblante_de_marcha.ogg/Redoblante_de_marcha.ogg.mp3"
            },
            { 
                name: "Hi-Hat Closed", 
                path: "sounds/hihat-closed.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c9/Hi-Hat_Cerrado.ogg/Hi-Hat_Cerrado.ogg.mp3"
            },
            { 
                name: "Hi-Hat Open", 
                path: "sounds/hihat-open.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/07/Hi-Hat_Abierto.ogg/Hi-Hat_Abierto.ogg.mp3"
            },
            { 
                name: "Tom High", 
                path: "sounds/tom-high.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3c/Tom_Agudo.ogg/Tom_Agudo.ogg.mp3"
            },
            { 
                name: "Tom Mid", 
                path: "sounds/tom-mid.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a4/Tom_Medio.ogg/Tom_Medio.ogg.mp3"
            },
            { 
                name: "Tom Low", 
                path: "sounds/tom-low.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/8d/Tom_Grave.ogg/Tom_Grave.ogg.mp3"
            },
            { 
                name: "Crash", 
                path: "sounds/crash.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Crash.ogg/Crash.ogg.mp3"
            },
            { 
                name: "Ride", 
                path: "sounds/ride.mp3",
                url: "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/Ride.ogg/Ride.ogg.mp3"
            }
        ]
    }
];

// ===== API Routes =====

// GET /api/presets - Get all presets
app.get('/api/presets', (req, res) => {
    console.log('GET /api/presets - Sending all presets');
    res.json(presets);
});

// GET /api/presets/:id - Get a specific preset by ID
app.get('/api/presets/:id', (req, res) => {
    const preset = presets.find(p => p.id === req.params.id);
    
    if (preset) {
        console.log(`GET /api/presets/${req.params.id} - Preset found`);
        res.json(preset);
    } else {
        console.log(`GET /api/presets/${req.params.id} - Preset not found`);
        res.status(404).json({ error: 'Preset not found' });
    }
});

// GET /api/presets/:id/samples - Get samples for a specific preset
app.get('/api/presets/:id/samples', (req, res) => {
    const preset = presets.find(p => p.id === req.params.id);
    
    if (preset) {
        console.log(`GET /api/presets/${req.params.id}/samples - Sending samples`);
        res.json(preset.samples);
    } else {
        console.log(`GET /api/presets/${req.params.id}/samples - Preset not found`);
        res.status(404).json({ error: 'Preset not found' });
    }
});

// Optional: Proxy endpoint to serve external sounds (avoids CORS issues)
// Note: The client should use the 'url' property from samples instead
// This is kept here as an example, but not required for Exercise 3
app.get('/sounds/:filename', async (req, res) => {
    const filename = req.params.filename;
    console.log(`GET /sounds/${filename} - Direct URL recommended instead of proxy`);
    
    // Find the sound URL from presets
    let soundUrl = null;
    for (const preset of presets) {
        const sample = preset.samples.find(s => s.path === `sounds/${filename}`);
        if (sample) {
            soundUrl = sample.url;
            break;
        }
    }
    
    if (!soundUrl) {
        return res.status(404).json({ 
            error: 'Sound file not found',
            hint: 'Use the "url" property from sample objects instead of proxying'
        });
    }
    
    // Redirect to the actual sound URL instead of proxying
    console.log(`Redirecting to: ${soundUrl}`);
    res.redirect(soundUrl);
});

// Root endpoint - API documentation
app.get('/api', (req, res) => {
    res.json({
        message: 'Sampler Backend API',
        version: '1.0.0',
        endpoints: {
            'GET /api/presets': 'Get all presets',
            'GET /api/presets/:id': 'Get a specific preset',
            'GET /api/presets/:id/samples': 'Get samples for a preset',
            'GET /sounds/:filename': 'Get a sound file (proxied)'
        },
        availablePresets: presets.map(p => ({ id: p.id, name: p.name }))
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start the server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🎵 Sampler Backend Server Started');
    console.log('='.repeat(50));
    console.log(`Server running on: http://localhost:${PORT}`);
    console.log(`API Documentation: http://localhost:${PORT}/api`);
    console.log(`Presets endpoint: http://localhost:${PORT}/api/presets`);
    console.log('='.repeat(50));
    console.log(`Available presets: ${presets.length}`);
    presets.forEach(preset => {
        console.log(`  - ${preset.name} (${preset.samples.length} samples)`);
    });
    console.log('='.repeat(50));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
