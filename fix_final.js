const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'screens', 'JobsScreen.js');
let content = fs.readFileSync(filePath, 'utf8');

// Icons black
content = content.replace(
  '<Ionicons name="briefcase" size={15} color="#5C9E6A" />',
  '<Ionicons name="briefcase" size={15} color={theme.isDark ? "#111111" : "#5C9E6A"} />'
);
content = content.replace(
  '<Ionicons name="heart" size={15} color="#EF4444" />',
  '<Ionicons name="heart" size={15} color={theme.isDark ? "#111111" : "#EF4444"} />'
);
content = content.replace(
  '<Ionicons name="create" size={15} color="#D97706" />',
  '<Ionicons name="create" size={15} color={theme.isDark ? "#111111" : "#D97706"} />'
);
content = content.replace(
  '<Ionicons name="checkmark-circle" size={16} color="#15803D" />',
  '<Ionicons name="checkmark-circle" size={16} color={theme.isDark ? "#111111" : "#15803D"} />'
);
content = content.replace(
  "color: '#15803D', fontWeight: '800'",
  "color: theme.isDark ? '#111111' : '#15803D', fontWeight: '800'"
);

// Categories white text
content = content.replace(
  "color: '#334155'",
  "color: theme.isDark ? '#FFFFFF' : '#334155'"
);
content = content.replace(
  "categoryPillText: {\n      fontSize: 13,\n      fontWeight: '700',\n      color: theme.isDark ? '#FFFFFF' : '#334155',\n    },",
  "categoryPillText: {\n      fontSize: 13,\n      fontWeight: '700',\n      color: theme.isDark ? '#FFFFFF' : '#334155',\n    },"
); // Just making sure the above replace hit the right thing

// Interests and UI/UX transparent
content = content.replace(
  "backgroundColor: '#F3F4F6'",
  "backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6'"
);
// Make related tag borders visible/transparent based on theme
content = content.replace(
  "  relatedTag: {\n      paddingHorizontal: 16,\n      paddingVertical: 8,\n      borderRadius: 14,\n      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6',\n    },",
  "  relatedTag: {\n      paddingHorizontal: 16,\n      paddingVertical: 8,\n      borderRadius: 14,\n      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#F3F4F6',\n      borderWidth: 1,\n      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'transparent',\n    },"
);
// Make related tag text white/gray
content = content.replace(
  "relatedTagText: {\n      fontSize: 13,\n      color: '#6B7280',\n      fontWeight: '600',\n    },",
  "relatedTagText: {\n      fontSize: 13,\n      color: theme.isDark ? '#E2E8F0' : '#6B7280',\n      fontWeight: '600',\n    },"
);

// Increase glow (opacity 0.6, radius 24)
content = content.replace(
  "shadowOpacity: theme.isDark ? 0.3 : 0.08,\n      shadowRadius: 16,",
  "shadowOpacity: theme.isDark ? 0.8 : 0.08,\n      shadowRadius: 24,"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Final tweaks applied!');
