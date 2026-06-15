const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/screens/JobsScreen.js');
let content = fs.readFileSync(filePath, 'utf-8');

// Find the target marker
const marker = `  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.isDark ? '#E2E8F0' : '#0A2417',
  },`;

const markerIndex = content.lastIndexOf(marker);
if (markerIndex === -1) {
  // Try with different line endings
  const markerLF = marker.replace(/\r\n/g, '\n');
  const contentLF = content.replace(/\r\n/g, '\n');
  const lfIndex = contentLF.lastIndexOf(markerLF);
  if (lfIndex !== -1) {
    console.log('Found with LF line endings!');
    const slicedLF = contentLF.slice(0, lfIndex + markerLF.length);
    const finalContent = slicedLF + '\n});\n}';
    fs.writeFileSync(filePath, finalContent, 'utf-8');
    console.log('File successfully repaired.');
  } else {
    console.error('Target marker not found in file!');
  }
} else {
  console.log('Found with native line endings!');
  const sliced = content.slice(0, markerIndex + marker.length);
  const finalContent = sliced + '\r\n});\r\n}';
  fs.writeFileSync(filePath, finalContent, 'utf-8');
  console.log('File successfully repaired.');
}
