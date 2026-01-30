# Quick Start Guide

## Prerequisites
- Node.js v14 or higher
- npm (comes with Node.js)

## Installation & Running

### Option 1: Using the Startup Scripts (Recommended)

**On macOS/Linux:**
```bash
bash start-server.sh
```

**On Windows:**
```cmd
start-server.bat
```

### Option 2: Manual Running

```bash
# Install dependencies (first time only)
npm install

# Start the server
npm start
```

## Access the Application

Once the server is running, open your browser and go to:
```
http://localhost:3000
```

You should see the CLD3 Language Detector interface.

## Features

✅ **Language Detection** - Detect language from any text input  
✅ **Multiple Languages** - Supports 140+ languages  
✅ **Web Interface** - Beautiful and responsive UI  
✅ **Example Buttons** - Quick test with pre-written examples  
✅ **Real-time Results** - Instant language detection  

## How to Use

1. Open http://localhost:3000 in your browser
2. Enter text in the textarea (or use example buttons)
3. Click "Detect Language" or press Ctrl+Enter
4. See the detected language displayed

## API Usage (Optional)

The application also provides a REST API:

```bash
curl -X POST http://localhost:3000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, how are you?"}'
```

Response:
```json
{
  "success": true,
  "language": "ENGLISH",
  "text": "Hello, how are you?"
}
```

## Changing the Port

If port 3000 is already in use, specify a different port:

```bash
PORT=3001 npm start
```

Then access at: http://localhost:3001

## Troubleshooting

### Issue: "Port 3000 is already in use"
**Solution:** Use a different port with `PORT=3001 npm start`

### Issue: "cld3_wasm.wasm not found"
**Solution:** Ensure the `cld3_wasm.wasm` file is in the same directory as `server.js`

### Issue: "Command not found: node"
**Solution:** Install Node.js from https://nodejs.org/

## Project Structure

```
Detect_Language/
├── server.js              # Main Node.js/Express server
├── package.json           # Project metadata and dependencies
├── index.html             # Web interface
├── cld3_wasm.js          # WebAssembly JavaScript bindings
├── cld3_wasm.wasm        # WebAssembly binary module
├── start-server.sh        # macOS/Linux startup script
├── start-server.bat       # Windows startup script
├── README.md              # Full documentation
├── QUICK_START.md         # This file
└── node_modules/          # Installed dependencies

```

## Support

For more information, see [README.md](README.md)

## License

This project uses CLD3 under the Apache License 2.0
