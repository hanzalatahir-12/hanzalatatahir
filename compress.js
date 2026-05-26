const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'img');

async function optimizeImages() {
  const files = fs.readdirSync(imgDir);
  
  for (const file of files) {
    if (file.endsWith('.png')) {
      const filePath = path.join(imgDir, file);
      const tempPath = path.join(imgDir, `temp_${file}`);
      
      console.log(`Optimizing ${file}...`);
      
      try {
        await sharp(filePath)
          .png({ quality: 80, compressionLevel: 9, adaptiveFiltering: true })
          .toFile(tempPath);
          
        fs.renameSync(tempPath, filePath);
        console.log(`Successfully optimized: ${file}`);
      } catch (err) {
        console.error(`Error optimizing ${file}:`, err);
      }
    }
  }
}

optimizeImages();
