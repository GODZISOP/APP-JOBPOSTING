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
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Inject `let theme;` right after `let styles;`
  if (!content.includes('let theme;')) {
    content = content.replace('let styles;', 'let styles;\nlet theme;');
  }

  // 2. Fix the destructuring in the main components
  // It could be `const { theme } = useTheme();` or `const { theme, isDark, toggleTheme } = useTheme();`
  
  if (content.includes('const { theme } = useTheme();')) {
    content = content.replace(
      'const { theme } = useTheme();',
      'const { theme: _theme } = useTheme(); theme = _theme;'
    );
  } else if (content.includes('const { theme, isDark, toggleTheme } = useTheme();')) {
    content = content.replace(
      'const { theme, isDark, toggleTheme } = useTheme();',
      'const { theme: _theme, isDark, toggleTheme } = useTheme(); theme = _theme;'
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed theme references in ' + filePath);
});
