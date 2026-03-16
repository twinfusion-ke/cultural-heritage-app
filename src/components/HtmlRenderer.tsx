/**
 * HtmlRenderer — Cross-platform HTML content renderer
 *
 * Uses WebView on native (Android/iOS), iframe srcdoc on web.
 */

import React from 'react';
import { Platform, StyleSheet } from 'react-native';

interface HtmlRendererProps {
  html: string;
  style?: any;
  scrollEnabled?: boolean;
}

export default function HtmlRenderer({ html, style, scrollEnabled = true }: HtmlRendererProps) {
  if (Platform.OS === 'web') {
    return (
      <iframe
        srcDoc={html}
        style={{
          flex: 1,
          border: 'none',
          width: '100%',
          minHeight: 400,
          ...(style || {}),
        }}
      />
    );
  }

  // Native: use WebView
  const WebView = require('react-native-webview').default;
  return (
    <WebView
      source={{ html }}
      style={[{ flex: 1, backgroundColor: '#FAFAF8' }, style]}
      originWhitelist={['*']}
      scrollEnabled={scrollEnabled}
      showsVerticalScrollIndicator={false}
    />
  );
}
