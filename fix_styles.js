const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/screens/ProfileScreen.js',
  'src/screens/JobsScreen.js',
  'src/screens/PostJobScreen.js',
  'src/screens/LoginScreen.js',
  'src/screens/SignupScreen.js',
  'src/screens/GettingStartedScreen.js'
];

targetFiles.forEach(fileRelPath => {
  const filePath = path.join(__dirname, 'frontend', fileRelPath);
  if (!fs.existsSync(filePath)) {
    console.log('Skipping ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add `let styles;` at the top if not exists
  if (!content.includes('let styles;')) {
    content = content.replace(
      "import { useTheme } from '../context/ThemeContext';",
      "import { useTheme } from '../context/ThemeContext';\nlet styles;"
    );
  }

  // 2. Change `const styles = getStyles(theme);` to `styles = getStyles(theme);`
  content = content.replace(/const styles = getStyles\(theme\);/g, 'styles = getStyles(theme);');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed ' + filePath);
});
