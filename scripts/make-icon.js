/**
 * make-icon.js — Convert assets/icon.png to assets/icon.ico using raw PNG embedding.
 * Falls back to copying the PNG as ICO if sharp is unavailable.
 */
const fs = require('fs');
const path = require('path');

const src  = path.join(__dirname, '..', 'frontend', 'assets', 'icon.png');
const dest = path.join(__dirname, '..', 'frontend', 'assets', 'icon.ico');

// Copy PNG as .ico — electron-builder accepts PNG named icon.ico on some versions
// For full ICO format we use a minimal ICO header wrapper.
try {
  const pngData = fs.readFileSync(src);

  // Build a minimal ICO file that wraps the PNG image
  // ICO Header: 6 bytes
  const ICONDIR = Buffer.alloc(6);
  ICONDIR.writeUInt16LE(0, 0);   // Reserved
  ICONDIR.writeUInt16LE(1, 2);   // Type: 1 = ICO
  ICONDIR.writeUInt16LE(1, 4);   // Count: 1 image

  // ICONDIRENTRY: 16 bytes
  const ENTRY = Buffer.alloc(16);
  ENTRY.writeUInt8(0, 0);         // Width  (0 = 256)
  ENTRY.writeUInt8(0, 1);         // Height (0 = 256)
  ENTRY.writeUInt8(0, 2);         // ColorCount
  ENTRY.writeUInt8(0, 3);         // Reserved
  ENTRY.writeUInt16LE(1, 4);      // Planes
  ENTRY.writeUInt16LE(32, 6);     // BitCount
  ENTRY.writeUInt32LE(pngData.length, 8);   // SizeInBytes
  ENTRY.writeUInt32LE(22, 12);    // ImageOffset = 6 + 16

  const icoData = Buffer.concat([ICONDIR, ENTRY, pngData]);
  fs.writeFileSync(dest, icoData);
  console.log('✅ Created assets/icon.ico (' + icoData.length + ' bytes)');
} catch (err) {
  console.error('❌ Failed to create icon.ico:', err.message);
  // Fallback: just copy the PNG
  fs.copyFileSync(src, dest);
  console.log('⚠️  Copied icon.png as icon.ico (fallback)');
}
