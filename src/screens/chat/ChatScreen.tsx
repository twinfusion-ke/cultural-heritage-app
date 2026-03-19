/**
 * ChatScreen — In-app messaging with admin
 *
 * Users send messages, admin replies from WordPress.
 * Messages stored in MySQL, email notification to admin.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AppHeader from '../../components/AppHeader';
import { FadeIn } from '../../components/animated';
import { appApi } from '../../api/appApi';
import { useAuthStore } from '../../stores/authStore';
import { colors, textStyles, spacing } from '../../theme';

interface Message {
  id: number;
  message: string;
  reply: string | null;
  replied_by: string | null;
  replied_at: string | null;
  is_read: number;
  created_at: string;
}

export default function ChatScreen({ navigation }: any) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const queryClient = useQueryClient();
  const listRef = useRef<FlatList>(null);

  const { data: messages, isLoading, refetch } = useQuery<Message[]>({
    queryKey: ['chat', 'messages'],
    queryFn: () => appApi('chat_messages', { token: token || '' }),
    enabled: !!token,
    refetchInterval: 15000, // Poll every 15 seconds
  });

  // Mark as read when screen opens
  useEffect(() => {
    if (token) appApi('chat_read', { token }).catch(() => {});
  }, [token, messages]);

  async function handleSend() {
    if (!text.trim()) return;

    if (!token) {
      Alert.alert('Login Required', 'Please login to send messages.', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Auth') },
      ]);
      return;
    }

    setSending(true);
    try {
      await appApi('chat_send', { token, message: text.trim() });
      setText('');
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    } catch {
      Alert.alert('Error', 'Could not send message. Please try again.');
    } finally {
      setSending(false);
    }
  }

  function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  }

  // Not logged in
  if (!user) {
    return (
      <View style={styles.container}>
        <AppHeader backgroundColor={colors.hub.primary} />
        <View style={styles.loginPrompt}>
          <Ionicons name="chatbubbles-outline" size={56} color={colors.hub.border} />
          <Text style={[textStyles.h2, { color: colors.hub.text, marginTop: 16, textAlign: 'center' }]}>
            Login to Chat
          </Text>
          <Text style={styles.loginDesc}>
            Sign in to message our team directly. We typically reply within a few hours.
          </Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Auth')}>
            <Ionicons name="log-in-outline" size={18} color="#fff" />
            <Text style={styles.loginBtnText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const reversed = [...(messages || [])].reverse();

  return (
    <View style={styles.container}>
      <AppHeader backgroundColor={colors.hub.primary} />

      <View style={styles.titleBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.hub.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[textStyles.body, { fontFamily: 'Montserrat-SemiBold', color: colors.hub.text }]}>
            Messages
          </Text>
          <Text style={styles.onlineText}>Cultural Heritage Support</Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.shared.gold} />
          </View>
        ) : reversed.length === 0 ? (
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.hub.border} />
            <Text style={styles.emptyChatText}>Start a conversation</Text>
            <Text style={styles.emptyChatSub}>Send us a message and we'll reply as soon as possible.</Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={reversed}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => (
              <View>
                {/* User message */}
                <View style={styles.userMsgRow}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userMsgText}>{item.message}</Text>
                    <Text style={styles.userMsgTime}>{formatTime(item.created_at)}</Text>
                  </View>
                </View>

                {/* Admin reply */}
                {item.reply && (
                  <View style={styles.adminMsgRow}>
                    <View style={styles.adminAvatar}>
                      <Text style={styles.adminAvatarText}>CH</Text>
                    </View>
                    <View style={styles.adminBubble}>
                      <Text style={styles.adminMsgText}>{item.reply}</Text>
                      <Text style={styles.adminMsgTime}>
                        {item.replied_by || 'Support'} · {item.replied_at ? formatTime(item.replied_at) : ''}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.hub.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={sending || !text.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  titleBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.hub.border,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  onlineText: { fontFamily: 'Montserrat-Regular', fontSize: 12, color: colors.shared.success, marginTop: 1 },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.shared.success },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loginPrompt: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  loginDesc: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.hub.primary, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8, marginTop: 20 },
  loginBtnText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: '#fff' },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyChatText: { fontFamily: 'Montserrat-SemiBold', fontSize: 18, color: colors.hub.text, marginTop: 16 },
  emptyChatSub: { fontFamily: 'Montserrat-Regular', fontSize: 14, color: colors.hub.textMuted, textAlign: 'center', marginTop: 6 },
  messagesList: { padding: spacing.md, paddingBottom: 8 },
  userMsgRow: { alignItems: 'flex-end', marginBottom: 12 },
  userBubble: { backgroundColor: colors.hub.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderBottomRightRadius: 4, maxWidth: '80%' },
  userMsgText: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: '#fff', lineHeight: 22 },
  userMsgTime: { fontFamily: 'Montserrat-Regular', fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'right' },
  adminMsgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12, gap: 8 },
  adminAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.shared.gold, alignItems: 'center', justifyContent: 'center' },
  adminAvatarText: { fontFamily: 'Montserrat-Bold', fontSize: 10, color: colors.hub.primary },
  adminBubble: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, borderBottomLeftRadius: 4, maxWidth: '75%', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  adminMsgText: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: colors.hub.text, lineHeight: 22 },
  adminMsgTime: { fontFamily: 'Montserrat-Regular', fontSize: 10, color: colors.hub.textMuted, marginTop: 4 },
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    backgroundColor: '#fff', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hub.border,
  },
  input: {
    flex: 1, fontFamily: 'Montserrat-Regular', fontSize: 15, color: colors.hub.text,
    backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    maxHeight: 100,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.hub.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
