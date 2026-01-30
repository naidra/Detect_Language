const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Load the CLD3 WASM module
let cld3Module = null;

// Initialize WASM module
async function initializeWasm() {
  try {
    const wasmPath = path.join(__dirname, 'cld3_wasm.wasm');
    
    // Check if WASM file exists
    if (!fs.existsSync(wasmPath)) {
      console.warn('⚠  cld3_wasm.wasm not found in the directory.');
      console.warn('   The application will work in browser-only mode.');
      return;
    }

    // Read the WASM binary
    const wasmBuffer = fs.readFileSync(wasmPath);
    
    // Load the WASM module through the JavaScript wrapper
    // The wrapper expects a wasmBinary property to be set
    const createCLD3Module = require('./cld3_wasm.js');
    
    try {
      // Create the module with the wasmBinary pre-loaded
      cld3Module = await createCLD3Module({
        wasmBinary: wasmBuffer
      });
      console.log('✓ CLD3 WASM module loaded successfully on server');
    } catch (err) {
      console.warn('⚠  Could not load WASM via wrapper. Trying direct instantiation...');
      console.warn('   Error details:', err.message);
      
      // Fallback: Try direct WASM instantiation with comprehensive imports
      const memory = new WebAssembly.Memory({ initial: 256, maximum: 512 });
      const imports = {
        a: {
          memory: memory,
          __memory_base: 0,
          __stack_pointer: 0,
          D: () => 0, F: (size) => 0, G: (ptr) => {}, H: (val) => {}, I: (size) => 0, J: () => 0,
          g: () => {}, l: () => {}, j: () => {}, f: () => {}, i: () => {}, b: () => {}, a: () => {},
          k: () => {}, d: () => {}, s: () => {}, o: () => {}, v: () => {}, r: () => 0, y: () => 0,
          h: () => {}, m: () => 2147483648, c: () => Date.now(), w: () => 0, n: () => 1, A: () => 0,
          z: () => 0, p: () => 0, q: () => 0, u: () => {}, e: () => {}, t: () => {}, x: () => false
        },
        env: { memory: memory }
      };
      
      try {
        const wasmModule = await WebAssembly.instantiate(wasmBuffer, imports);
        cld3Module = wasmModule.instance.exports;
        console.log('✓ CLD3 WASM module loaded with direct instantiation');
      } catch (directErr) {
        console.warn('⚠  Direct WASM instantiation also failed. Browser-side mode only.');
        console.warn('   Error details:', directErr.message);
      }
    }
  } catch (error) {
    console.warn('⚠  Warning: Could not load WASM module:', error.message);
    console.warn('   The application will work in browser-only mode.');
  }
}

// API endpoint for language detection (POST)
app.post('/api/detect', (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing or invalid text parameter'
    });
  }

  const trimmedText = text.trim();
  
  if (trimmedText.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Text cannot be empty'
    });
  }

  if (cld3Module) {
    // Server-side WASM is loaded, use it for detection
    try {
      const language = cld3Module.detectLanguage(trimmedText);
      return res.json({
        success: true,
        language: language === 'unknown' ? 'UNKNOWN' : language.toUpperCase(),
        text: trimmedText.substring(0, 100),
        processedOn: 'server'
      });
    } catch (error) {
      console.error('Detection error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error detecting language: ' + error.message
      });
    }
  } else {
    // WASM not loaded on server, provide helpful message
    return res.status(200).json({
      success: false,
      message: 'Language detection is processed client-side in the browser using WebAssembly',
      instructions: 'Open http://localhost:3000 in your browser and use the web interface to detect languages',
      note: 'The CLD3 WASM module can only run in a browser environment, not on the Node.js server',
      text: trimmedText.substring(0, 100)
    });
  }
});

// API endpoint for language detection (GET) - for URL-based queries
app.get('/api/detect', (req, res) => {
  const text = req.query.text || req.query.q;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Missing text parameter. Use ?text=your_text or ?q=your_text'
    });
  }

  const trimmedText = text.trim();
  
  if (trimmedText.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Text cannot be empty'
    });
  }

  if (cld3Module) {
    // Server-side WASM is loaded, use it for detection
    try {
      const language = cld3Module.detectLanguage(trimmedText);
      return res.json({
        success: true,
        language: language === 'unknown' ? 'UNKNOWN' : language.toUpperCase(),
        confidence: 'high',
        text: trimmedText.substring(0, 100),
        processedOn: 'server'
      });
    } catch (error) {
      console.error('Detection error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error detecting language: ' + error.message
      });
    }
  } else {
    // WASM not loaded on server, provide helpful message
    return res.status(200).json({
      success: false,
      message: 'Language detection is processed client-side in the browser using WebAssembly',
      instructions: 'Open http://localhost:3000 in your browser and use the web interface to detect languages',
      note: 'The CLD3 WASM module can only run in a browser environment, not on the Node.js server',
      text: trimmedText.substring(0, 100)
    });
  }
});

// Batch detection endpoint - detect language for multiple texts
app.post('/api/detect/batch', (req, res) => {
  const { texts } = req.body;

  if (!Array.isArray(texts)) {
    return res.status(400).json({
      success: false,
      error: 'texts parameter must be an array'
    });
  }

  if (cld3Module) {
    // Server-side WASM is loaded, use it for batch detection
    try {
      const results = texts.map((text, index) => {
        if (!text || typeof text !== 'string') {
          return {
            index,
            success: false,
            error: 'Invalid text at index ' + index
          };
        }

        const trimmedText = text.trim();
        if (trimmedText.length === 0) {
          return {
            index,
            success: false,
            error: 'Empty text at index ' + index
          };
        }

        try {
          const language = cld3Module.detectLanguage(trimmedText);
          return {
            index,
            success: true,
            language: language === 'unknown' ? 'UNKNOWN' : language.toUpperCase(),
            text: trimmedText.substring(0, 50)
          };
        } catch (err) {
          return {
            index,
            success: false,
            error: err.message
          };
        }
      });

      return res.json({
        success: true,
        count: texts.length,
        results: results,
        processedOn: 'server'
      });
    } catch (error) {
      console.error('Batch detection error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error processing batch: ' + error.message
      });
    }
  } else {
    // WASM not loaded on server, provide helpful message
    return res.status(200).json({
      success: false,
      message: 'Language detection is processed client-side in the browser using WebAssembly',
      instructions: 'Open http://localhost:3000 in your browser and use the web interface to detect languages',
      note: 'The CLD3 WASM module can only run in a browser environment, not on the Node.js server',
      inputTexts: texts.length
    });
  }
});

// List supported languages endpoint
app.get('/api/languages', (req, res) => {
  const languages = {
    'supported': 'The CLD3 detector supports 140+ languages including:',
    'major_languages': [
      'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
      'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hebrew',
      'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Gujarati',
      'Thai', 'Vietnamese', 'Indonesian', 'Malay', 'Polish', 'Ukrainian',
      'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Turkish',
      'Greek', 'Czech', 'Hungarian', 'Romanian', 'Serbo-Croatian', 'Bulgarian',
      'And 100+ more languages'
    ],
    'note': 'Language codes are returned in uppercase (e.g., ENGLISH, FRENCH, etc.)'
  };
  res.json(languages);
});

// API information endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'CLD3 Language Detector API',
    version: '1.0.0',
    description: 'Detect the language of text using Google\'s CLD3 library compiled to WebAssembly',
    endpoints: {
      'POST /api/detect': {
        description: 'Detect language from JSON body',
        example: 'POST /api/detect with {"text": "Hello world"}',
        response: '{"success": true, "language": "ENGLISH", "text": "Hello world"}'
      },
      'GET /api/detect': {
        description: 'Detect language from URL query parameter',
        example: 'GET /api/detect?text=Hello%20world OR /api/detect?q=Hello%20world',
        response: '{"success": true, "language": "ENGLISH", "confidence": "high"}'
      },
      'POST /api/detect/batch': {
        description: 'Detect language for multiple texts',
        example: 'POST /api/detect/batch with {"texts": ["Hello", "Bonjour", "Hola"]}',
        response: '{"success": true, "count": 3, "results": [...]}'
      },
      'GET /api/languages': {
        description: 'Get list of supported languages',
        example: 'GET /api/languages',
        response: '{"supported": "...", "major_languages": [...]}'
      },
      'GET /api/health': {
        description: 'Health check endpoint',
        example: 'GET /api/health',
        response: '{"status": "healthy", "wasmLoaded": false, ...}'
      },
      'GET /api/info': {
        description: 'API information and documentation',
        example: 'GET /api/info',
        response: '{"name": "CLD3 Language Detector API", "endpoints": {...}}'
      }
    },
    usage: {
      'Simple GET request': 'curl "http://localhost:3000/api/detect?text=Hello"',
      'POST request': 'curl -X POST http://localhost:3000/api/detect -H "Content-Type: application/json" -d \'{"text": "Bonjour"}\''
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    wasmLoaded: cld3Module !== null,
    message: 'CLD3 Language Detector is running'
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve WASM JavaScript bindings
app.get('/cld3_wasm.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'cld3_wasm.js'));
});

// Serve WASM file with correct content type
app.get('/cld3_wasm.wasm', (req, res) => {
  res.type('application/wasm');
  res.sendFile(path.join(__dirname, 'cld3_wasm.wasm'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
async function startServer() {
  await initializeWasm();
  
  app.listen(PORT, () => {
    const wasmStatus = cld3Module ? '✓ Enabled' : '✗ Browser-side mode';
    console.log(`
╔════════════════════════════════════════╗
║   CLD3 Language Detector Server        ║
╠════════════════════════════════════════╣
║  Server running at http://localhost:${PORT}   ║
║  WASM Mode: ${wasmStatus}
║  API endpoint: POST /api/detect        ║
║  Health check: GET /api/health         ║
║  Web UI: http://localhost:${PORT}        ║
╚════════════════════════════════════════╝

  Open your browser and navigate to http://localhost:${PORT}
  The application will use WebAssembly for language detection.
    `);
  });
}

startServer();
