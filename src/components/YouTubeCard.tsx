/**
 * YouTubeCard — Inline YouTube video player card
 *
 * Renders a YouTube video in a styled card with play button overlay.
 * Tapping plays the video inline via WebView.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import WebView from 'react-native-webview';
import { colors, textStyles, spacing } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

interface YouTubeCardProps {
  videoId: string;
  title?: string;
  subtitle?: string;
  accentColor?: string;
}

export default function YouTubeCard({
  videoId,
  title,
  subtitle,
  accentColor = colors.shared.gold,
}: YouTubeCardProps) {
  const [playing, setPlaying] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <View style={styles.card}>
      {title && (
        <View style={styles.titleRow}>
          <Ionicons name="videocam" size={18} color={accentColor} />
          <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        </View>
      )}

      <View style={styles.videoContainer}>
        {playing ? (
          <WebView
            source={{ uri: `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1` }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            allowsFullscreenVideo
          />
        ) : (
          <TouchableOpacity style={styles.thumbnail} onPress={() => setPlaying(true)} activeOpacity={0.9}>
            <Image
              source={{ uri: thumbnailUrl }}
              style={StyleSheet.absoluteFillObject}
              contentFit="cover"
              cachePolicy="disk"
            />
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={32} color="#fff" style={{ marginLeft: 3 }} />
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    backgroundColor: colors.shared.white,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
  thumbnail: {
    flex: 1,
    position: 'relative',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(197,160,89,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 13,
    color: colors.hub.textMuted,
    paddingHorizontal: 16,
    paddingVertical: 12,
    lineHeight: 20,
  },
});
