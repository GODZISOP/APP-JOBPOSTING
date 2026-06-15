const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'screens', 'JobsScreen.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace cleanJobRow background
content = content.replace(
  "cleanJobRow: {\n      backgroundColor: '#FFFFFF',",
  "cleanJobRow: {\n      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',"
);

// Replace upwork backgrounds
content = content.replace(
  "upworkHeaderContainer: {\n      backgroundColor: '#FFFFFF',",
  "upworkHeaderContainer: {\n      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',"
);

content = content.replace(
  "upworkSectionCard: {\n      backgroundColor: '#FFFFFF',",
  "upworkSectionCard: {\n      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',"
);

content = content.replace(
  "upworkClientSection: {\n      backgroundColor: '#FFFFFF',",
  "upworkClientSection: {\n      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',"
);

// Replace modal Content
content = content.replace(
  "modalContent: {\n      backgroundColor: '#FFFFFF',",
  "modalContent: {\n      backgroundColor: theme.isDark ? theme.bgPrimary : '#FFFFFF',"
);

// Replace dropdownListContainer
content = content.replace(
  "dropdownListContainer: {\n      backgroundColor: '#FFFFFF',",
  "dropdownListContainer: {\n      backgroundColor: theme.isDark ? theme.bgPrimary : '#FFFFFF',"
);

// Replace filter modal Content
content = content.replace(
  "filterModalContent: {\n      backgroundColor: '#FFFFFF',",
  "filterModalContent: {\n      backgroundColor: theme.isDark ? theme.bgPrimary : '#FFFFFF',"
);

// Fix remaining F8FAFC, F1F5F9 backgrounds used for inner cards/chips
content = content.replace(
  /backgroundColor: '#F8FAFC'/g,
  "backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC'"
);

content = content.replace(
  /backgroundColor: '#F1F5F9'/g,
  "backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9'"
);

// Fix border colors from E2E8F0 to transparent/faded
content = content.replace(
  /borderColor: '#E2E8F0'/g,
  "borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0'"
);

// Fix text colors from #0F172A to theme.textPrimary
content = content.replace(
  /color: '#0F172A'/g,
  "color: theme.textPrimary"
);

// Fix text colors from #475569 to theme.textSecondary
content = content.replace(
  /color: '#475569'/g,
  "color: theme.textSecondary"
);

// Other UI elements with #FFFFFF background that need to be transparent or match theme
content = content.replace(
  /backgroundColor: '#FFFFFF'/g,
  "backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF'"
);

// Fix appApplyBtn which should be accentYellow but might have been replaced to #FFFFFF or something
// Wait, appApplyBtn was #E8F542 originally, refactor_theme changed COLORS.accentYellow to theme.accentYellow, so it's fine.

fs.writeFileSync(filePath, content, 'utf8');
console.log('Restored dark mode UI transparent cards!');
