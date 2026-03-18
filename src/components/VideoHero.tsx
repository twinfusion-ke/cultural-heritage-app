/**
 * VideoHero — YouTube video background with overlay
 *
 * Uses WebView with full HTML wrapper for reliable Android playback.
 * Falls back to a static image if video fails.
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import WebView from 'react-native-webview';

interface VideoHeroProps {
  videoId: string;
  fallbackImage: string;
  height?: number;
  overlayColor?: string;
  children?: React.ReactNode;
}

const VIDEO_HTML = (videoId: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; overflow: hidden; }
    body { background: #000; }
    iframe { position: absolute; top: -60px; left: 0; width: 100vw; height: calc(100vh + 120px); border: none; }
  </style>
</head>
<body>
  <iframe
    src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1"
    allow="autoplay; encrypted-media"
    allowfullscreen
  ></iframe>
</body>
</html>
`;

export default function VideoHero({
  videoId,
  fallbackImage,
  height = 400,
  overlayColor = 'rgba(14,56,44,0.7)',
  children,
}: VideoHeroProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <View style={[styles.container, { height }]}>
      {!videoFailed ? (
        <WebView
          source={{ html: VIDEO_HTML(videoId) }}
          style={styles.video}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          scrollEnabled={false}
          nestedScrollEnabled={false}
          overScrollMode="never"
          onError={() => setVideoFailed(true)}
          onHttpError={() => setVideoFailed(true)}
        />
      ) : (
        <Image
          source={{ uri: fallbackImage }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          cachePolicy="disk"
        />
      )}
      <View style={[styles.overlay, { backgroundColor: overlayColor }]} pointerEvents="none" />
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden' },
  video: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject },
  content: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 36,
  },
});
