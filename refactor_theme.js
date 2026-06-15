const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/screens/ProfileScreen.js',
  'src/screens/JobsScreen.js',
  'src/screens/PostJobScreen.js',
  'src/screens/LoginScreen.js',
  'src/screens/SignupScreen.js',
  'src/screens/GettingStartedScreen.js',
  'src/components/splashscreen/index.js'
];

targetFiles.forEach(fileRelPath => {
  const filePath = path.join(__dirname, 'frontend', fileRelPath);
  if (!fs.existsSync(filePath)) {
    console.log('Skipping ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add useTheme import if not exists
  if (!content.includes('useTheme')) {
    content = content.replace(
      "import { useAuth } from '../context/AuthContext';",
      "import { useAuth } from '../context/AuthContext';\nimport { useTheme } from '../context/ThemeContext';"
    );
    // Adjust path for splashscreen
    content = content.replace(
      "import { useAuth } from '../../context/AuthContext';",
      "import { useAuth } from '../../context/AuthContext';\nimport { useTheme } from '../../context/ThemeContext';"
    );
  }

  // 2. Inject `const { theme } = useTheme(); const styles = getStyles(theme);` into main components
  // We need to inject this inside the main exported component.
  // This is tricky using regex, so we'll just replace COLORS. with theme. globally,
  // EXCEPT for imports.
  
  content = content.replace(/COLORS\./g, 'theme.');
  
  // Fix imports that might have been broken by the above
  content = content.replace(/import \{ theme, FONTS \} from/g, "import { COLORS, FONTS } from");
  content = content.replace(/import \{ theme \} from/g, "import { COLORS } from");

  // 3. Convert const styles = StyleSheet.create({ to function getStyles(theme) { return StyleSheet.create({
  if (content.includes('const styles = StyleSheet.create({')) {
    content = content.replace(
      'const styles = StyleSheet.create({',
      'function getStyles(theme) { return StyleSheet.create({'
    );
    // We need to append `}` to the very end of the file or after the `});` of styles.
    // For simplicity, we can regex replace the last `});`
    const lastIndex = content.lastIndexOf('});');
    if (lastIndex !== -1) {
      content = content.substring(0, lastIndex) + '}); }' + content.substring(lastIndex + 3);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Refactored ' + filePath);
});
