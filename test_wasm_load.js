const createCLD3Module = require('./cld3_wasm.js');

createCLD3Module().then(module => {
  console.log('Module loaded successfully!');
  console.log('Available methods:');
  const keys = Object.keys(module);
  keys.forEach(key => {
    if (typeof module[key] === 'function') {
      console.log(`  - ${key} (function)`);
    }
  });
  
  // Try to detect language
  if (module.detectLanguage) {
    const result = module.detectLanguage('Hello world');
    console.log('\nDetection test:');
    console.log('  Text: "Hello world"');
    console.log('  Language:', result);
  } else {
    console.log('\ndetectLanguage method not found');
  }
}).catch(err => {
  console.error('Error loading module:', err);
});
