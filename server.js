// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Load image file lists on startup
const folders = ['folder1', 'folder2'];
const imageData = {};

folders.forEach(folder => {
  const folderPath = path.join(__dirname, 'public/images', folder);
  imageData[folder] = fs.readdirSync(folderPath).filter(file => {
    return /\.(jpg|jpeg|png|gif)$/i.test(file);
  });
});

// API endpoint to get a random image
app.get('/api/get-random-image', (req, res) => {
  const folder = folders[Math.floor(Math.random() * folders.length)];
  const files = imageData[folder];
  const randomFile = files[Math.floor(Math.random() * files.length)];

  res.json({
    imageUrl: `/images/${folder}/${randomFile}`,
    actualFolder: folder
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
