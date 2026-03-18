/**
 * PostDetailScreen — Full blog post with comments
 *
 * AppHeader ribbon, full-page native scroll, hero image,
 * content rendered natively, comments section with anti-bot
 * math captcha. Tab bar stays visible.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/AppHeader';
import HtmlRenderer from '../../components/HtmlRenderer';
import { FadeIn } from '../../components/animated';
import { Divider } from '../../components';
import { appApi } from '../../api/appApi';
import { colors, textStyles, spacing } from '../../theme';
import { readingTime } from '../../utils/dates';

function wrapPostHtml(html: string): string {
  return `<!DOCTYPE html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Montserrat', sans-serif; font-size: 16px; line-height: 1.8; color: #333; padding: 0 24px 40px; background: #fff; }
      h2 { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; margin: 28px 0 12px; color: #0e382c; }
      h3 { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 500; margin: 20px 0 8px; color: #0e382c; }
      p { margin-bottom: 16px; }
      a { color: #C5A059; }
      strong { font-weight: 600; color: #1A1A1A; }
      blockquote { border-left: 3px solid #C5A059; padding: 12px 16px; margin: 16px 0; background: rgba(197,160,89,0.06); font-style: italic; }
      ul, ol { margin-bottom: 16px; padding-left: 20px; }
      li { margin-bottom: 8px; }
      img { max-width: 100%; height: auto; margin: 12px 0; border-radius: 4px; }
    </style>
  </head><body>${html}</body></html>`;
}

export default function PostDetailScreen({ route, navigation }: any) {
  const { title, content, imageUrl, date, category } = route.params;

  const formattedDate = date ? new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : '';
  const readTime = content ? readingTime(content) : 0;

  // Comments state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Anti-bot: math captcha
  const [captchaA] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 10) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  async function handleShare() {
    try {
      await Share.share({ message: `${title} — Cultural Heritage Centre` });
    } catch {}
  }

  async function handleSubmitComment() {
    if (!commentName.trim()) { Alert.alert('Required', 'Please enter your name.'); return; }
    if (!commentText.trim()) { Alert.alert('Required', 'Please enter your comment.'); return; }
    if (parseInt(captchaAnswer) !== captchaA + captchaB) {
      Alert.alert('Verification Failed', 'Please solve the math question correctly to prove you are not a bot.');
      return;
    }

    setSubmittingComment(true);
    try {
      await appApi('submit_form', {
        form_type: 'comment',
        name: commentName,
        email: commentEmail,
        comment: commentText,
        post_title: title,
        captcha_verified: 'true',
      });
      Alert.alert('Comment Submitted', 'Your comment has been submitted for review. It will appear once approved.');
      setCommentName('');
      setCommentEmail('');
      setCommentText('');
      setCaptchaAnswer('');
    } catch {
      Alert.alert('Error', 'Could not submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  }

  return (
    <View style={styles.container}>
      <AppHeader backgroundColor={colors.hub.primary} />

      {/* Sub Header */}
      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.shared.parchment} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Ionicons name="share-outline" size={20} color={colors.shared.gold} />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        {imageUrl && (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} contentFit="cover" cachePolicy="disk" transition={300} />
        )}

        {/* Meta */}
        <FadeIn delay={200} slideUp={15}>
          <View style={styles.meta}>
            {category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            )}
            {formattedDate ? (
              <Text style={styles.metaText}>{formattedDate} · {readTime} min read</Text>
            ) : null}
          </View>

          {/* Title */}
          <Text style={[textStyles.h1, styles.title]}>{title}</Text>
        </FadeIn>

        {/* Divider */}
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Divider color={colors.shared.gold} width={40} marginVertical={16} />
        </View>

        {/* Content */}
        {content ? (
          <HtmlRenderer html={wrapPostHtml(content)} style={styles.content} scrollEnabled={false} />
        ) : (
          <View style={styles.noContent}>
            <Ionicons name="document-text-outline" size={40} color={colors.hub.border} />
            <Text style={styles.noContentText}>Full article content not available.</Text>
          </View>
        )}

        {/* Share CTA */}
        <FadeIn delay={100} slideUp={15}>
          <View style={styles.shareCta}>
            <Text style={[textStyles.label, { color: colors.hub.textMuted, textAlign: 'center' }]}>ENJOYED THIS ARTICLE?</Text>
            <TouchableOpacity style={styles.shareCtaBtn} onPress={handleShare}>
              <Ionicons name="share-social-outline" size={18} color={colors.shared.gold} />
              <Text style={styles.shareCtaBtnText}>Share this Story</Text>
            </TouchableOpacity>
          </View>
        </FadeIn>

        {/* Comments Section */}
        <FadeIn delay={200} slideUp={20}>
          <View style={styles.commentsSection}>
            <Text style={[textStyles.label, styles.commentsSectionLabel]}>JOIN THE CONVERSATION</Text>
            <Text style={[textStyles.h2, { color: colors.hub.text, textAlign: 'center' }]}>Leave a Comment</Text>
            <Divider />

            {/* Comment Form */}
            <View style={styles.commentForm}>
              <TextInput
                style={styles.commentInput}
                placeholder="Your Name *"
                placeholderTextColor={colors.hub.textMuted}
                value={commentName}
                onChangeText={setCommentName}
              />
              <TextInput
                style={styles.commentInput}
                placeholder="Email (optional, not published)"
                placeholderTextColor={colors.hub.textMuted}
                value={commentEmail}
                onChangeText={setCommentEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.commentInput, styles.commentTextarea]}
                placeholder="Your comment... *"
                placeholderTextColor={colors.hub.textMuted}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                numberOfLines={4}
              />

              {/* Anti-bot Captcha */}
              <View style={styles.captchaRow}>
                <View style={styles.captchaBox}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.shared.gold} />
                  <Text style={styles.captchaLabel}>Verify: What is {captchaA} + {captchaB}?</Text>
                </View>
                <TextInput
                  style={styles.captchaInput}
                  placeholder="?"
                  placeholderTextColor={colors.hub.textMuted}
                  value={captchaAnswer}
                  onChangeText={setCaptchaAnswer}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>

              <TouchableOpacity
                style={styles.submitCommentBtn}
                onPress={handleSubmitComment}
                disabled={submittingComment}
                activeOpacity={0.8}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#fff" />
                    <Text style={styles.submitCommentText}>Post Comment</Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.moderationNote}>
                Comments are moderated. Your comment will appear after review.
              </Text>
            </View>
          </View>
        </FadeIn>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  subHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.hub.primary, paddingHorizontal: spacing.lg, paddingVertical: 10,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: colors.shared.parchment },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shareText: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: colors.shared.gold },
  scroll: { flex: 1 },
  heroImage: { width: '100%', height: 240 },
  meta: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg,
  },
  categoryBadge: { backgroundColor: colors.shared.gold, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  categoryText: { fontFamily: 'Montserrat-SemiBold', fontSize: 10, color: colors.hub.primary, textTransform: 'uppercase', letterSpacing: 1 },
  metaText: { fontFamily: 'Montserrat-Regular', fontSize: 13, color: colors.hub.textMuted },
  title: { color: colors.hub.text, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  content: { minHeight: 300, backgroundColor: '#fff' },
  noContent: { alignItems: 'center', paddingVertical: spacing['3xl'] },
  noContentText: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted, marginTop: 12 },

  shareCta: {
    alignItems: 'center', paddingVertical: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hub.border,
    marginHorizontal: spacing.lg,
  },
  shareCtaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, borderWidth: 1, borderColor: colors.shared.gold, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  shareCtaBtnText: { fontFamily: 'Montserrat-SemiBold', fontSize: 13, color: colors.shared.gold },

  commentsSection: {
    backgroundColor: colors.hub.background, paddingVertical: spacing.xl,
    marginTop: spacing.md,
  },
  commentsSectionLabel: { color: colors.hub.textMuted, textAlign: 'center', marginBottom: 4 },
  commentForm: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  commentInput: {
    fontFamily: 'Montserrat-Regular', fontSize: 15, color: colors.hub.text,
    borderWidth: 1, borderColor: colors.hub.border, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
    backgroundColor: colors.shared.white,
  },
  commentTextarea: { height: 100, textAlignVertical: 'top' },
  captchaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  captchaBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(197,160,89,0.08)', padding: 12, borderRadius: 8,
    borderWidth: 1, borderColor: 'rgba(197,160,89,0.2)',
  },
  captchaLabel: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: colors.hub.text },
  captchaInput: {
    width: 60, fontFamily: 'Montserrat-Bold', fontSize: 18, color: colors.hub.text,
    borderWidth: 2, borderColor: colors.shared.gold, borderRadius: 8,
    paddingVertical: 10, textAlign: 'center', backgroundColor: colors.shared.white,
  },
  submitCommentBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.hub.primary, paddingVertical: 16, borderRadius: 8,
  },
  submitCommentText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#fff', letterSpacing: 0.5, textTransform: 'uppercase' },
  moderationNote: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.hub.textMuted, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
});
