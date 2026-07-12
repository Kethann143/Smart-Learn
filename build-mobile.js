const fs = require('fs');
const path = require('path');

const wwwPath = path.join(__dirname, 'www');

// Create www directory if it doesn't exist
if (!fs.existsSync(wwwPath)) {
  fs.mkdirSync(wwwPath, { recursive: true });
}

// Copy files
const files = [
  'index.html',
  'styles.css',
  'app.js',
  'db.js',
  'auth.js',
  'ai.js',
  'federated.js',
  'manifest.json'
];

files.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(wwwPath, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to www/`);
  }
});

// Copy assets directory
const srcAssets = path.join(__dirname, 'assets');
const destAssets = path.join(wwwPath, 'assets');
if (!fs.existsSync(destAssets)) {
  fs.mkdirSync(destAssets, { recursive: true });
}
if (fs.existsSync(srcAssets)) {
  const assetFiles = fs.readdirSync(srcAssets);
  assetFiles.forEach(file => {
    fs.copyFileSync(path.join(srcAssets, file), path.join(destAssets, file));
    console.log(`Copied asset ${file} to www/assets/`);
  });
}
console.log('Mobile build complete: assets copied to www/');
