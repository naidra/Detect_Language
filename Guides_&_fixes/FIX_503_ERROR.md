# Fix: 503 Service Unavailable Error

## Problem
Getting error: `POST http://localhost:3000/api/detect 503 (Service Unavailable)`
And: `WASM module not loaded. Please ensure cld3_wasm.wasm is available.`

## Root Cause
The application was trying to use the server API for language detection, but the server-side WASM module cannot be loaded in Node.js (it has special imports that require a browser environment). The server correctly returned a 503 error when the WASM module wasn't loaded.

## Solution Implemented

### Priority Change
The application now uses **Client-Side WASM First** approach:

1. **Primary (Preferred):** Client-side WebAssembly
   - Always try to load WASM in the browser first
   - Fastest and most reliable
   - Works offline
   - No server dependency

2. **Fallback:** Server API
   - Only used if client-side WASM fails
   - Requires server with working WASM
   - Good for batch processing

### Changes Made to index.html

#### 1. Server Availability Check
Now checks if WASM is actually loaded on server:
```javascript
async function checkServerAvailability() {
    const response = await fetch('/api/health');
    const data = await response.json();
    // Only use API if WASM is loaded on server
    if (data.wasmLoaded === true) {
        useServerAPI = true;
    }
}
```

#### 2. Initialization Sequence
- Step 1: Load client-side WASM
- Step 2: If that fails, check if server has WASM
- Step 3: If both fail, show error

#### 3. Detection Logic
Prefers client-side WASM even if server is available:
```javascript
if (useServerAPI && cld3Module) {
    // Use client-side WASM if available
    language = cld3Module.detectLanguage(text);
} else if (useServerAPI) {
    // Use server API only if WASM not in browser
    const response = await fetch('/api/detect', ...);
} else {
    // Use client-side WASM
    language = cld3Module.detectLanguage(text);
}
```

## How It Works Now

### Startup Sequence
```
Page loads
  ↓
Load cld3_wasm.js script
  ↓
Initialize → Load client-side WASM
  ↓
WASM loads successfully?
  ├─ YES → Show "✓ Ready! (Browser mode)"
  └─ NO → Check server health
       ↓
       Server has WASM?
       ├─ YES → Show "✓ Ready! (Server mode)"
       └─ NO → Show error
```

### Detection Flow
```
User clicks "Detect Language"
  ↓
Is client-side WASM loaded?
  ├─ YES → Use it (instant, no network)
  └─ NO → Is server API available?
       ├─ YES → Use server API
       └─ NO → Error
```

## Benefits of This Approach

✅ **Reliability:** Doesn't depend on server-side WASM (which can't load in Node.js)
✅ **Performance:** Uses fastest available method (client-side WASM)
✅ **Offline:** Works without any server once WASM is loaded
✅ **Simplicity:** No complex server-side WASM instantiation needed
✅ **Compatibility:** Works with any Express configuration

## What to Expect Now

When you open http://localhost:3000:

### Status Message
You should see:
```
✓ Ready! (Browser mode) Enter text to detect language.
```

### Detection
Click "Detect Language" and it will:
1. Use client-side WASM (instant)
2. Show the detected language

### Console Logs
You'll see:
```
✓ WASM module loaded successfully
✓ Ready! (Browser mode) Enter text to detect language.
Using client-side WASM for detection
```

## Testing the Fix

### Test 1: Basic Detection
1. Open http://localhost:3000
2. Type "Hello, how are you?"
3. Click "Detect Language"
4. Should show: "ENGLISH"

### Test 2: Multiple Languages
```
Text: "Bonjour"          → Result: "FRENCH"
Text: "Hola"             → Result: "SPANISH"
Text: "你好"             → Result: "CHINESE"
Text: "こんにちは"       → Result: "JAPANESE"
Text: "Привет"           → Result: "RUSSIAN"
```

### Test 3: Browser Console
Open DevTools (F12) and check console:
```
✓ WASM module loaded successfully
Using client-side WASM for detection
```

## Why Server API Returns 503

The server tries to load WASM with Node.js WebAssembly API, but the cld3_wasm.js module is designed for browsers and has imports that don't work in Node.js:

```javascript
// This fails in Node.js because of special imports
WebAssembly.instantiate(wasmBuffer, imports);
// Error: Import #0 module="a": module is not an object
```

This is **expected behavior** and not a problem because:
- Client-side WASM works perfectly in browsers
- The application intelligently falls back to it
- No server-side WASM processing is needed

## Summary

| Issue | Status | Solution |
|-------|--------|----------|
| 503 Service Unavailable | ✅ Fixed | Use client-side WASM first |
| WASM not loading | ✅ Fixed | Improved polling and timeouts |
| Wrong error message | ✅ Fixed | Better error handling |
| Slow detection | ✅ Improved | Prioritizes client-side WASM |

## Next Steps

1. **Refresh your browser** (Cmd+R or Ctrl+R)
2. **Clear cache** if needed (Cmd+Shift+R or Ctrl+Shift+R)
3. **Test language detection**
4. **Check browser console** for status messages

The application should now work smoothly without any 503 errors!
