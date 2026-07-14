const fs = require('fs');
const content = fs.readFileSync('c:/HRM/Hrm1/frontend/admin/src/pages/admin/AdminDashboard.jsx', 'utf8');

// Simple regex to match <div and </div tags
const openDivs = content.match(/<div\b/g) || [];
const closeDivs = content.match(/<\/div>/g) || [];

console.log('Open divs:', openDivs.length);
console.log('Close divs:', closeDivs.length);

// Let's print each line with its open/close diff
let depth = 0;
const lines = content.split('\n');
lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  const lineOpen = (line.match(/<div\b/g) || []).length;
  const lineClose = (line.match(/<\/div>/g) || []).length;
  const prevDepth = depth;
  depth += lineOpen - lineClose;
  if (lineOpen > 0 || lineClose > 0) {
    console.log(`Line ${lineNum}: open=${lineOpen}, close=${lineClose}, depth: ${prevDepth} -> ${depth} | ${line.trim().substring(0, 50)}`);
  }
});
