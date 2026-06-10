module.exports = function (api) {
  api.cache(true);
  
  // Custom Babel plugin to automatically disable font scaling globally for all Text & TextInput components
  const disableFontScalingPlugin = function({ types: t }) {
    return {
      visitor: {
        JSXOpeningElement(path) {
          const nameNode = path.node.name;
          let name = '';
          
          if (t.isJSXIdentifier(nameNode)) {
            name = nameNode.name;
          } else if (t.isJSXMemberExpression(nameNode)) {
            name = nameNode.property.name; // handles Animated.Text
          }
          
          if (name === 'Text' || name === 'TextInput') {
            const hasAllowFontScaling = path.node.attributes.some(
              attr => t.isJSXAttribute(attr) && attr.name.name === 'allowFontScaling'
            );
            
            if (!hasAllowFontScaling) {
              path.node.attributes.push(
                t.jsxAttribute(
                  t.jsxIdentifier('allowFontScaling'),
                  t.jsxExpressionContainer(t.booleanLiteral(false))
                )
              );
            }
          }
        }
      }
    };
  };

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      disableFontScalingPlugin
    ],
  };
};
