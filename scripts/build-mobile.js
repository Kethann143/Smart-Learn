const fs = require('fs');
const path = require('path');

const wwwPath = path.join(__dirname, '..', 'www');

// Create www directory if it doesn't exist
if (!fs.existsSync(wwwPath)) {
  fs.mkdirSync(wwwPath, { recursive: true });
}

// Copy files mapping source path to destination file name
const files = [
  { src: 'frontend/layouts/index.html', dest: 'index.html' },
  { src: 'frontend/themes/styles.css', dest: 'styles.css' },
  { src: 'frontend/screens/app.js', dest: 'app.js' },
  { src: 'frontend/utils/db.js', dest: 'db.js' },
  { src: 'frontend/utils/auth.js', dest: 'auth.js' },
  { src: 'frontend/utils/ai.js', dest: 'ai.js' },
  { src: 'frontend/utils/federated.js', dest: 'federated.js' },
  { src: 'frontend/assets/manifest.json', dest: 'manifest.json' },
  { src: 'frontend/utils/sw.js', dest: 'sw.js' }
];

files.forEach(file => {
  const src = path.join(__dirname, '..', file.src);
  const dest = path.join(wwwPath, file.dest);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file.dest} to www/`);
  } else {
    console.error(`Source file not found: ${src}`);
  }
});

// Copy assets directory contents (e.g. icon.ico, icon.png)
const srcAssets = path.join(__dirname, '..', 'frontend', 'assets');
const destAssets = path.join(wwwPath, 'assets');
if (!fs.existsSync(destAssets)) {
  fs.mkdirSync(destAssets, { recursive: true });
}
if (fs.existsSync(srcAssets)) {
  const assetFiles = fs.readdirSync(srcAssets);
  assetFiles.forEach(file => {
    // Skip manifest.json in assets copying to avoid duplicating it under www/assets/
    if (file !== 'manifest.json') {
      fs.copyFileSync(path.join(srcAssets, file), path.join(destAssets, file));
      console.log(`Copied asset ${file} to www/assets/`);
    }
  });
}
console.log('Mobile build complete: assets copied to www/');
