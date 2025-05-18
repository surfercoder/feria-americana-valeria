const fs = require('fs');
const path = require('path');
const heicConvert = require('heic-convert');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, 'public', 'images');

async function convertHeicToJpegAndWebp(filePath) {
  const inputBuffer = fs.readFileSync(filePath);
  // Convert HEIC to JPEG
  const jpegBuffer = await heicConvert({
    buffer: inputBuffer,
    format: 'JPEG',
    quality: 0.8 // slightly more compression
  });
  const jpegPath = filePath.replace(/\.heic$/i, '.jpeg');
  // Compress JPEG with sharp
  const compressedJpegBuffer = await sharp(jpegBuffer)
    .jpeg({ quality: 80 })
    .toBuffer();
  fs.writeFileSync(jpegPath, compressedJpegBuffer);
  console.log(`Converted & compressed: ${path.basename(filePath)} -> ${path.basename(jpegPath)}`);

  // Convert to WebP with sharp
  const webpPath = filePath.replace(/\.heic$/i, '.webp');
  const webpBuffer = await sharp(jpegBuffer)
    .webp({ quality: 80 })
    .toBuffer();
  fs.writeFileSync(webpPath, webpBuffer);
  console.log(`Created WebP: ${path.basename(filePath)} -> ${path.basename(webpPath)}`);
}

async function main() {
  const files = fs.readdirSync(imagesDir);
  const heicFiles = files.filter(f => f.match(/\.heic$/i));
  if (heicFiles.length === 0) {
    console.log('No HEIC files found.');
    return;
  }
  for (const file of heicFiles) {
    const filePath = path.join(imagesDir, file);
    try {
      await convertHeicToJpegAndWebp(filePath);
    } catch (err) {
      console.error(`Failed to convert ${file}:`, err);
    }
  }
  console.log('All conversions done.');
}

main();
