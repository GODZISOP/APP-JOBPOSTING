const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend', 'src', 'screens', 'JobsScreen.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix heroGradientCard
content = content.replace(
  "    heroGradientCard: {\n      backgroundColor: '#1A1A1A',\n      borderRadius: 24,\n      padding: 20,\n      marginBottom: 24,\n      shadowColor: '#1A1A1A',\n      shadowOffset: { width: 0, height: 8 },\n      shadowOpacity: 0.15,\n      shadowRadius: 16,\n      elevation: 0,\n    },",
  "    heroGradientCard: {\n      backgroundColor: theme.isDark ? '#111111' : theme.bgPrimary,\n      borderRadius: 24,\n      padding: 20,\n      marginBottom: 24,\n      shadowColor: theme.isDark ? '#FF8C00' : theme.shadow,\n      shadowOffset: { width: 0, height: 8 },\n      shadowOpacity: theme.isDark ? 0.3 : 0.08,\n      shadowRadius: 16,\n      elevation: 0,\n    },"
);

// Fix statCardItem (undo my previous bad fix and apply the correct one)
content = content.replace(
  "    statCardItem: {\n      flex: 1,\n      width: 0,\n      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',\n      borderWidth: 2,\n      borderColor: '#E5E7EB',",
  "    statCardItem: {\n      flex: 1,\n      width: 0,\n      backgroundColor: theme.isDark ? '#FF8C00' : theme.bgCard,\n      borderWidth: 1,\n      borderColor: theme.isDark ? '#FF8C00' : theme.borderLight,"
);
// In case the old replace didn't work exactly, just replace it from the start of statCardItem: {
content = content.replace(
  /statCardItem: \{\s*flex: 1,\s*width: 0,\s*backgroundColor: [^,]+,\s*borderWidth: 2,\s*borderColor: '#E5E7EB',/g,
  "statCardItem: {\n      flex: 1,\n      width: 0,\n      backgroundColor: theme.isDark ? '#FF8C00' : theme.bgCard,\n      borderWidth: 1,\n      borderColor: theme.isDark ? '#FF8C00' : theme.borderLight,"
);

// Fix text colors inside the orange cards so they are readable
content = content.replace(
  "    statCountVal: {\n      fontSize: 20,\n      fontWeight: '800',\n      color: theme.textPrimary,\n    },",
  "    statCountVal: {\n      fontSize: 20,\n      fontWeight: '800',\n      color: theme.isDark ? '#111111' : theme.textPrimary,\n    },"
);
// If my previous script didn't touch it because it was #1A1A1A:
content = content.replace(
  "    statCountVal: {\n      fontSize: 20,\n      fontWeight: '800',\n      color: '#1A1A1A',\n    },",
  "    statCountVal: {\n      fontSize: 20,\n      fontWeight: '800',\n      color: theme.isDark ? '#111111' : theme.textPrimary,\n    },"
);

content = content.replace(
  "    statLabelText: {\n      fontSize: 10,\n      fontWeight: '800',\n      textTransform: 'uppercase',\n      color: '#64748B',\n    },",
  "    statLabelText: {\n      fontSize: 10,\n      fontWeight: '800',\n      textTransform: 'uppercase',\n      color: theme.isDark ? '#111111' : theme.textSecondary,\n    },"
);

// Fix statIconBadge
content = content.replace(
  "    statIconBadge: {\n      width: 28,\n      height: 28,\n      borderRadius: 10,\n      backgroundColor: '#E6F4EA',\n      alignItems: 'center',\n      justifyContent: 'center',\n    },",
  "    statIconBadge: {\n      width: 28,\n      height: 28,\n      borderRadius: 10,\n      backgroundColor: 'rgba(255, 255, 255, 0.2)',\n      alignItems: 'center',\n      justifyContent: 'center',\n    },"
);

// Fix warning styles
content = content.replace(
  "    warningContainer: {\n      flexDirection: 'row',\n      alignItems: 'center',\n      justifyContent: 'space-between',\n      backgroundColor: '#FEF2F2',\n      borderWidth: 1,\n      borderColor: '#FEE2E2',",
  "    warningContainer: {\n      flexDirection: 'row',\n      alignItems: 'center',\n      justifyContent: 'space-between',\n      backgroundColor: theme.isDark ? 'rgba(239, 68, 68, 0.05)' : '#FEF2F2',\n      borderWidth: 1,\n      borderColor: theme.isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEE2E2',"
);

// We should also replace the background color inside JSX for the second stat icon badge if any
content = content.replace(
  "backgroundColor: '#FEE2E2'",
  "backgroundColor: 'rgba(255, 255, 255, 0.2)'"
);

// One more place: the third stat box icon badge
content = content.replace(
  "backgroundColor: '#E0F2FE'",
  "backgroundColor: 'rgba(255, 255, 255, 0.2)'"
);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Restored glowing orange stats cards!');
