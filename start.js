const path = require('path');
const fs = require('fs');

console.log('=== DEBUGGING PATH ISSUES ===');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('__filename:', __filename);

// Check if dist directory exists
const distPath = path.join(process.cwd(), 'dist');
console.log('Checking dist directory:', distPath);
console.log('Dist directory exists:', fs.existsSync(distPath));

// Check if server.js exists
const serverPath = path.join(process.cwd(), 'dist', 'server.js');
console.log('Checking server.js:', serverPath);
console.log('Server.js exists:', fs.existsSync(serverPath));

// List files in current directory
console.log('\nFiles in current directory:');
try {
  const files = fs.readdirSync(process.cwd());
  console.log(files);
} catch (err) {
  console.log('Error reading current directory:', err);
}

// List files in dist directory
console.log('\nFiles in dist directory:');
try {
  const distFiles = fs.readdirSync(distPath);
  console.log(distFiles);
} catch (err) {
  console.log('Error reading dist directory:', err);
}

console.log('\n=== STARTING SERVER ===');

// Now require the actual server
try {
  require('./dist/server.js');
} catch (err) {
  console.error('Error starting server:', err);
  process.exit(1);
} 