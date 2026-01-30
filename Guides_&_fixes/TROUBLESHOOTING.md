# Troubleshooting Guide - WASM Module Loading

## Common Issues and Solutions

### Issue: "WASM module not loaded" Error

This error occurs when the client-side WebAssembly module fails to load in the browser.

#### Solution 1: Ensure Files Are Present
```bash
ls -la cld3_wasm.wasm cld3_wasm.js
```

Both files should exist and have content:
- `cld3_wasm.wasm` - Should be ~861 KB
- `cld3_wasm.js` - Should be ~33 KB

#### Solution 2: Check Browser Console
1. Open your browser's Developer Tools (F12 or Cmd+Option+I)
2. Go to the **Console** tab
3. Look for error messages related to:
   - WASM module loading
   - Network requests failing
   - File not found errors

#### Solution 3: Clear Browser Cache
The browser might be caching an old version:
```bash
# Hard refresh in browser:
# Chrome/Firefox: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
# Safari: Cmd+Option+R
```

#### Solution 4: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Reload the page
3. Look for these files and their status:
   - `cld3_wasm.js` - Should be `200 OK`
   - `cld3_wasm.wasm` - Should be `200 OK`
4. If either shows error (404, 500, etc.), the file isn't being served correctly

#### Solution 5: Verify Server is Running
```bash
curl -I http://localhost:3000/cld3_wasm.wasm
```

You should see:
```
HTTP/1.1 200 OK
Content-Type: application/wasm
```

### Issue: Server Running But WASM Still Not Loading

**Cause:** The WASM module may need time to initialize.

**Solution:** The updated code includes better waiting logic:

1. It waits up to 10 seconds for `createCLD3Module` to be available
2. It provides status updates in the UI
3. It has better error messages

### Issue: Both Server API and WASM Failing

**Solution:** Check both endpoints:

```bash
# Check server health
curl http://localhost:3000/api/health

# Check WASM file is served
curl -I http://localhost:3000/cld3_wasm.wasm

# Check the main page loads
curl http://localhost:3000 | head -20
```

## Debugging Steps

### Step 1: Start Fresh
```bash
# Clear browser cache/storage
# Restart the server
npm start

# Clear browser data for localhost
# Then refresh the page
```

### Step 2: Check Console Output
Open browser console (F12) and look for:
```
✓ WASM module loaded successfully
✓ Using server API for language detection
✗ Failed to instantiate WASM module
```

### Step 3: Verify File Serving
The server should serve these files:
```
GET /                    → index.html
GET /cld3_wasm.js        → JavaScript bindings
GET /cld3_wasm.wasm      → Binary WASM module (Content-Type: application/wasm)
```

### Step 4: Test API Directly
```bash
curl -X POST http://localhost:3000/api/detect \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world"}'
```

Expected response:
```json
{
  "success": true,
  "language": "ENGLISH",
  "text": "Hello world"
}
```

Or error (WASM not loaded on server):
```json
{
  "success": false,
  "error": "WASM module not loaded..."
}
```

## Understanding the Dual-Mode System

The application works in two modes:

### Browser Mode (Primary)
- Uses client-side WebAssembly
- `createCLD3Module()` loads the WASM
- Fully offline capable
- No server required

### Server Mode (Optional)
- Uses Express.js API
- Server-side processing
- More reliable but requires running server

## Network Issues That Could Prevent WASM Loading

1. **CORS Issues** - Usually not a problem for same-origin requests
2. **Content-Type** - WASM file must be served with `application/wasm`
3. **File Size** - WASM file is 861 KB, ensure no upload limits
4. **Network Timeout** - If server is slow, increase wait time

## Browser Compatibility

The WASM module requires:
- Chrome/Edge 57+
- Firefox 52+
- Safari 11.1+
- Node.js with WebAssembly support

Check if your browser supports WebAssembly:
```javascript
console.log(typeof WebAssembly !== 'undefined' ? 'Supported' : 'Not supported');
```

## Recommended Debugging Workflow

1. **Check Files Exist**
   ```bash
   ls -lh cld3_wasm.*
   ```

2. **Start Server**
   ```bash
   npm start
   ```

3. **Open Browser Console** (F12)

4. **Reload Page** (Cmd+R or Ctrl+R)

5. **Look for Status Messages**
   - Should see "Ready!" message in status box
   - Or error message in red box

6. **Check Console Logs** (F12 → Console tab)
   - Look for ✓ or ✗ messages
   - Check for any JavaScript errors

7. **Test Detection**
   - Type some text
   - Click "Detect Language"
   - Should see result or specific error

## Getting More Detailed Logs

Add this to the browser console to see detailed initialization info:
```javascript
console.log('Module loaded:', cld3Module);
console.log('Module type:', typeof cld3Module);
console.log('Has detectLanguage:', cld3Module?.detectLanguage ? 'Yes' : 'No');
console.log('Initialization status:', {
    isInitialized: window.isInitialized,
    useServerAPI: window.useServerAPI,
    hasModule: window.cld3Module !== null
});
```

## Still Having Issues?

1. **Ensure all files are in the correct directory:**
   ```
   /Users/ardiansallauka/Desktop/Detect_Language/
   ├── server.js
   ├── index.html
   ├── cld3_wasm.js
   └── cld3_wasm.wasm
   ```

2. **Verify server can access the files:**
   ```bash
   cd /Users/ardiansallauka/Desktop/Detect_Language
   npm start
   ```

3. **Check that no firewall blocks localhost:3000**

4. **Try a different port:**
   ```bash
   PORT=3001 npm start
   ```

5. **Try a different browser** to rule out browser-specific issues

## Checking Server Logs

The server logs provide valuable information:
```
⚠  Could not instantiate WASM directly. Trying browser-side loading...
```

This is normal - it means the WASM will be loaded in the browser instead of server.

The important message is:
```
✓ CLD3 Language Detector Server is running
```

## Success Indicators

When working correctly, you should see:

In Browser Console:
```
✓ WASM module loaded successfully
✓ Ready! (Browser mode) Enter text to detect language.
```

In Status Box on Page:
```
✓ Ready! Enter text to detect language.
```

In Page Title Area:
```
🌍 Language Detector
Powered by CLD3 compiled to WebAssembly
```

---

If you're still experiencing issues, please:
1. Note the exact error message
2. Take a screenshot of the browser console
3. Report the server startup output
