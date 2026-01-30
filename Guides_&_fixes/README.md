# CLD3 Language Detector - Node.js Server

A language detection application using CLD3 WebAssembly module running on a Node.js server.

## Features

- ✓ Language detection using CLD3 WebAssembly
- ✓ Express.js server with REST API
- ✓ Supports both server-side API and client-side WASM
- ✓ Beautiful UI with modern design
- ✓ Multi-language support (English, French, Spanish, German, Chinese, Japanese, Russian, Arabic, etc.)
- ✓ Health check endpoint

## Requirements

- Node.js (v14 or higher)
- npm

## Installation

1. Navigate to the project directory:
```bash
cd /Users/ardiansallauka/Desktop/Detect_Language
```

2. Install dependencies:
```bash
npm install
```

## Running the Server

Start the server with:
```bash
npm start
```

The server will start on `http://localhost:3000`

You should see output like:
```
╔════════════════════════════════════════╗
║   CLD3 Language Detector Server        ║
╠════════════════════════════════════════╣
║  Server running at http://localhost:3000 ║
║  API endpoint: POST /api/detect        ║
║  Health check: GET /api/health         ║
╚════════════════════════════════════════╝
```

## API Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{
  "status": "healthy",
  "wasmLoaded": true,
  "message": "CLD3 Language Detector is running"
}
```

### Detect Language
```
POST /api/detect
Content-Type: application/json

{
  "text": "Hello, how are you?"
}
```

Response:
```json
{
  "success": true,
  "language": "ENGLISH",
  "text": "Hello, how are you?"
}
```

Error Response:
```json
{
  "success": false,
  "error": "Text cannot be empty"
}
```

## Project Structure

```
Detect_Language/
├── server.js              # Main Node.js server file
├── package.json           # Project dependencies
├── index.html             # Frontend HTML/CSS/JS
├── cld3_wasm.js          # CLD3 WebAssembly JavaScript binding
├── cld3_wasm.wasm        # CLD3 WebAssembly binary
└── README.md             # This file
```

## How It Works

1. **Automatic Mode Selection**: The application automatically detects whether the server is available
   - If running with Node.js server: Uses the REST API endpoint
   - If running in browser directly: Falls back to client-side WebAssembly

2. **Server Mode**: 
   - Express.js serves the static files
   - WASM module is loaded once on server startup
   - Requests are processed on the server

3. **Browser Mode**:
   - Client-side WebAssembly module loads
   - Detection happens in the browser

## File Descriptions

### server.js
- Express.js application
- CORS middleware for cross-origin requests
- Static file serving
- REST API endpoints for language detection
- WASM module initialization and management

### index.html
- Responsive web UI
- JavaScript that works with both server API and client WASM
- Modern styling with gradient backgrounds
- Example language buttons
- Real-time language detection

### cld3_wasm.js
- Compiled WebAssembly module bindings
- Handles WASM instantiation
- Provides `detectLanguage()` function

### cld3_wasm.wasm
- Binary WebAssembly module
- Contains the actual CLD3 language detection logic

## Usage Examples

### Using the Web Interface
1. Open `http://localhost:3000` in your browser
2. Enter text in the textarea
3. Click "Detect Language" or press Ctrl+Enter
4. See the detected language

### Using the API
```bash
curl -X POST http://localhost:3000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"text": "Bonjour, comment allez-vous?"}'
```

## Supported Languages

CLD3 supports detection of 140+ languages, including:
- English, French, Spanish, German, Italian, Portuguese
- Chinese (Simplified & Traditional), Japanese, Korean
- Russian, Ukrainian, Polish, Czech
- Arabic, Hebrew, Persian, Urdu
- Hindi, Bengali, Tamil, Telugu
- And many more!

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, specify a different port:
```bash
PORT=3001 npm start
```

### WASM Module Not Found
Ensure `cld3_wasm.wasm` is in the same directory as `server.js`

### Module Load Error
Check that all files are properly downloaded and not corrupted:
- `cld3_wasm.js` (~1MB)
- `cld3_wasm.wasm` (~1.5MB)

## Performance

- **Server Mode**: Slightly faster for batch operations as WASM is loaded once
- **Browser Mode**: Instant for single requests without network latency
- Typical detection: < 1ms

## License

This project uses CLD3, which is available under the Apache License 2.0
