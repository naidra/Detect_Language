#!/bin/bash

# CLD3 Detector - Diagnostic Test Script
# This script verifies that all components are working correctly

set -e

echo "╔════════════════════════════════════════════╗"
echo "║  CLD3 Language Detector - Diagnostic Test  ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS=0
PASSED=0
FAILED=0

test_result() {
    TESTS=$((TESTS + 1))
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $1"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC}: $1"
        FAILED=$((FAILED + 1))
    fi
}

# Test 1: Check if files exist
echo "1️⃣  Checking project files..."
echo ""

test -f "index.html" && echo -e "${GREEN}✓${NC} index.html found" || echo -e "${RED}✗${NC} index.html NOT found"
test -f "server.js" && echo -e "${GREEN}✓${NC} server.js found" || echo -e "${RED}✗${NC} server.js NOT found"
test -f "cld3_wasm.js" && echo -e "${GREEN}✓${NC} cld3_wasm.js found" || echo -e "${RED}✗${NC} cld3_wasm.js NOT found"
test -f "cld3_wasm.wasm" && echo -e "${GREEN}✓${NC} cld3_wasm.wasm found" || echo -e "${RED}✗${NC} cld3_wasm.wasm NOT found"
test -f "package.json" && echo -e "${GREEN}✓${NC} package.json found" || echo -e "${RED}✗${NC} package.json NOT found"
test -d "node_modules" && echo -e "${GREEN}✓${NC} node_modules found" || echo -e "${RED}✗${NC} node_modules NOT found"

echo ""

# Test 2: Check file sizes
echo "2️⃣  Checking file sizes..."
echo ""

if [ -f "cld3_wasm.wasm" ]; then
    SIZE=$(du -h "cld3_wasm.wasm" | cut -f1)
    echo "cld3_wasm.wasm: $SIZE (expected: ~861 KB)"
fi

if [ -f "cld3_wasm.js" ]; then
    SIZE=$(du -h "cld3_wasm.js" | cut -f1)
    echo "cld3_wasm.js: $SIZE (expected: ~33 KB)"
fi

if [ -f "index.html" ]; then
    SIZE=$(du -h "index.html" | cut -f1)
    echo "index.html: $SIZE"
fi

echo ""

# Test 3: Check Node.js installation
echo "3️⃣  Checking Node.js and npm..."
echo ""

which node > /dev/null 2>&1
test_result "Node.js is installed"

NODE_VERSION=$(node --version 2>/dev/null)
echo "Node.js version: $NODE_VERSION"

which npm > /dev/null 2>&1
test_result "npm is installed"

NPM_VERSION=$(npm --version 2>/dev/null)
echo "npm version: $NPM_VERSION"

echo ""

# Test 4: Check if Express is installed
echo "4️⃣  Checking npm dependencies..."
echo ""

test -d "node_modules/express" && echo -e "${GREEN}✓${NC} Express.js installed" || echo -e "${RED}✗${NC} Express.js NOT installed"
test -d "node_modules/cors" && echo -e "${GREEN}✓${NC} CORS middleware installed" || echo -e "${RED}✗${NC} CORS middleware NOT installed"

echo ""

# Test 5: Check if server can start (without actually running it)
echo "5️⃣  Checking server.js syntax..."
echo ""

node -c server.js > /dev/null 2>&1
test_result "server.js has valid JavaScript syntax"

echo ""

# Test 6: Check HTML file syntax
echo "6️⃣  Checking index.html..."
echo ""

grep -q "cld3_wasm.js" index.html > /dev/null 2>&1
test_result "index.html references cld3_wasm.js"

grep -q "detectLanguage" index.html > /dev/null 2>&1
test_result "index.html has detectLanguage function"

grep -q "createCLD3Module" index.html > /dev/null 2>&1
test_result "index.html loads WASM module"

echo ""

# Test 7: Check package.json
echo "7️⃣  Checking package.json..."
echo ""

grep -q '"express"' package.json > /dev/null 2>&1
test_result "package.json has Express dependency"

grep -q '"cors"' package.json > /dev/null 2>&1
test_result "package.json has CORS dependency"

grep -q '"scripts"' package.json > /dev/null 2>&1
test_result "package.json has scripts section"

echo ""

# Test 8: Port check
echo "8️⃣  Checking port availability..."
echo ""

if command -v lsof &> /dev/null; then
    if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${GREEN}✓${NC} Port 3000 is available"
    else
        echo -e "${YELLOW}⚠${NC} Port 3000 is already in use"
    fi
else
    echo "⚠  lsof not available (can't check port)"
fi

echo ""

# Summary
echo "════════════════════════════════════════════"
echo ""
echo "📊 Test Summary:"
echo "Total tests: $TESTS"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! You're ready to run the server.${NC}"
    echo ""
    echo "To start the server, run:"
    echo "  npm start"
    echo ""
    echo "Then open your browser to: http://localhost:3000"
else
    echo -e "${RED}✗ Some checks failed. Please review the output above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  1. Ensure all files are in the correct directory"
    echo "  2. Run 'npm install' to install dependencies"
    echo "  3. Check that Node.js is properly installed"
fi

echo ""
