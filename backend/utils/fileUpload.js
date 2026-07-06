const fs = require('fs');
const path = require('path');

/**
 * Save a Base64 image/document string as a physical file.
 * @param {string} base64Str - The Base64 string (including data URI prefix)
 * @param {string} subFolder - The subfolder name (e.g. 'profile', 'screenshots', 'documents')
 * @param {string} prefix - The filename prefix
 * @returns {string|null} The relative URL path of the saved file, or null if invalid
 */
const saveBase64Image = (base64Str, subFolder, prefix) => {
  try {
    if (!base64Str) return null;
    
    // If it's already a relative path, return it as is
    if (base64Str.startsWith('/uploads/')) {
      return base64Str;
    }
    
    if (!base64Str.startsWith('data:')) {
      return null;
    }
    
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    
    const mimeType = matches[1];
    const dataBuffer = Buffer.from(matches[2], 'base64');
    
    // Determine extension
    let ext = 'png';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('pdf')) ext = 'pdf';
    
    const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`;
    const destDir = path.join(__dirname, '../uploads', subFolder);
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    const filePath = path.join(destDir, filename);
    fs.writeFileSync(filePath, dataBuffer);
    
    return `/uploads/${subFolder}/${filename}`;
  } catch (err) {
    console.error('Error saving base64 image:', err);
    return null;
  }
};

module.exports = { saveBase64Image };
