// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Load image file lists on startup
const folders = ['LinkedIn', 'Pornstar'];
const imageData = {};

folders.forEach(folder => {
  const folderPath = path.join(__dirname, 'public/images', folder);
  try {
    imageData[folder] = fs.readdirSync(folderPath).filter(file => {
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
    });
    console.log(`Loaded ${imageData[folder].length} images from ${folder} folder`);
  } catch (err) {
    console.error(`Error reading ${folder} folder:`, err);
    imageData[folder] = [];
  }
});

// Verify we have images to serve
const totalImages = Object.values(imageData).reduce((sum, files) => sum + files.length, 0);
console.log(`Total images available: ${totalImages}`);

if (totalImages === 0) {
  console.warn('Warning: No images found! Make sure images exist in public/images/LinkedIn and public/images/Pornstar folders');
}

// API endpoint to get a random image
app.get('/api/get-random-image', (req, res) => {
  // Filter out folders with no images
  const availableFolders = folders.filter(folder => imageData[folder].length > 0);
  
  if (availableFolders.length === 0) {
    return res.status(500).json({ error: 'No images available' });
  }
  
  const folder = availableFolders[Math.floor(Math.random() * availableFolders.length)];
  const files = imageData[folder];
  const randomFile = files[Math.floor(Math.random() * files.length)];
  
  res.json({
    imageUrl: `/images/${folder}/${randomFile}`,
    actualFolder: folder.toLowerCase() // Convert to lowercase for consistency
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    totalImages: totalImages,
    folders: Object.keys(imageData).map(folder => ({
      name: folder,
      imageCount: imageData[folder].length
    }))
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});