import { useThemeColors } from '@/hooks/use-theme-colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BlockReportModalProps = {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  onBlocked?: () => void;
  onReported?: () => void;
};

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'fake_account', label: 'Fake Account' },
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'scam', label: 'Scam' },
  { value: 'other', label: 'Other' },
] as const;

export function BlockReportModal({
  visible,
  onClose,
  userId,
  userName,
  onBlocked,
  onReported,
}: BlockReportModalProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'block' | 'report'>('block');
  const [reportReason, setReportReason] = useState<string>('');
  const [reportDescription, setReportDescription] = useState('');
  const [blocking, setBlocking] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (!visible) {
      setActiveTab('block');
      setReportReason('');
      setReportDescription('');
      setIsBlocked(false);
    } else {
      checkBlockStatus();
    }
  }, [visible, userId]);

  const checkBlockStatus = async () => {
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) return;

    const { data } = await supabase
      .from('blocked_users')
      .select('id')
      .eq('blocker_id', currentUserId)
      .eq('blocked_id', userId)
      .single();

    setIsBlocked(!!data);
  };

  const handleBlock = async () => {
    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) {
      Alert.alert('Error', 'You must be logged in to block users');
      return;
    }

    if (currentUserId === userId) {
      Alert.alert('Error', 'You cannot block yourself');
      return;
    }

    try {
      setBlocking(true);

      if (isBlocked) {
        // Unblock
        const { error } = await supabase
          .from('blocked_users')
          .delete()
          .eq('blocker_id', currentUserId)
          .eq('blocked_id', userId);

        if (error) throw error;

        Alert.alert('Success', 'User unblocked successfully');
        setIsBlocked(false);
        onBlocked?.();
      } else {
        // Block
        const { error } = await supabase
          .from('blocked_users')
          .insert({
            blocker_id: currentUserId,
            blocked_id: userId,
          });

        if (error) {
          if (error.code === '23505') {
            Alert.alert('Already Blocked', 'This user is already blocked');
          } else {
            throw error;
          }
        } else {
          Alert.alert('User Blocked', 'This user has been blocked. You will not see their content or receive messages from them.');
          setIsBlocked(true);
          onBlocked?.();
        }
      }
    } catch (error: any) {
      console.error('Error blocking/unblocking user:', error);
      Alert.alert('Error', `Failed to ${isBlocked ? 'unblock' : 'block'} user: ${error.message || 'Unknown error'}`);
    } finally {
      setBlocking(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason) {
      Alert.alert('Reason Required', 'Please select a reason for reporting');
      return;
    }

    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    if (!currentUserId) {
      Alert.alert('Error', 'You must be logged in to report users');
      return;
    }

    if (currentUserId === userId) {
      Alert.alert('Error', 'You cannot report yourself');
      return;
    }

    try {
      setReporting(true);

      const { error } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: currentUserId,
          reported_id: userId,
          reason: reportReason,
          description: reportDescription.trim() || null,
        });

      if (error) throw error;

      Alert.alert(
        'Report Submitted',
        'Thank you for your report. Our team will review it and take appropriate action.',
        [{ text: 'OK', onPress: onClose }]
      );
      onReported?.();
      onClose();
    } catch (error: any) {
      console.error('Error reporting user:', error);
      Alert.alert('Error', `Failed to submit report: ${error.message || 'Unknown error'}`);
    } finally {
      setReporting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: colors.cardBackground,
            borderRadius: 24,
            width: '100%',
            maxWidth: 500,
            maxHeight: '80%',
            padding: 24,
          }}
        >
          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: colors.textColor, fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
              {userName || 'User'} Actions
            </Text>
            <Text style={{ color: colors.secondaryTextColor, fontSize: 16 }}>
              Block or report this user
            </Text>
          </View>

          {/* Tabs */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: colors.iconBackground,
              borderRadius: 12,
              padding: 4,
              marginBottom: 24,
            }}
          >
            <Pressable
              onPress={() => setActiveTab('block')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: activeTab === 'block' ? colors.cardBackground : 'transparent',
              }}
            >
              <Text
                style={{
                  color: activeTab === 'block' ? colors.textColor : colors.secondaryTextColor,
                  fontSize: 16,
                  fontWeight: activeTab === 'block' ? '600' : '400',
                  textAlign: 'center',
                }}
              >
                Block
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('report')}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: activeTab === 'report' ? colors.cardBackground : 'transparent',
              }}
            >
              <Text
                style={{
                  color: activeTab === 'report' ? colors.textColor : colors.secondaryTextColor,
                  fontSize: 16,
                  fontWeight: activeTab === 'report' ? '600' : '400',
                  textAlign: 'center',
                }}
              >
                Report
              </Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {activeTab === 'block' ? (
              <View>
                <View style={{ marginBottom: 24 }}>
                  <Ionicons
                    name={isBlocked ? 'ban' : 'ban-outline'}
                    size={48}
                    color={isBlocked ? '#EF4444' : colors.secondaryTextColor}
                    style={{ alignSelf: 'center', marginBottom: 16 }}
                  />
                  <Text style={{ color: colors.textColor, fontSize: 16, textAlign: 'center', marginBottom: 8 }}>
                    {isBlocked ? 'This user is currently blocked' : 'Block this user?'}
                  </Text>
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 14, textAlign: 'center' }}>
                    {isBlocked
                      ? 'You will not see their content or receive messages from them. You can unblock them at any time.'
                      : 'Blocked users will not be able to see your content or send you messages. You can unblock them later.'}
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <View style={{ marginBottom: 24 }}>
                  <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                    Reason for Reporting *
                  </Text>
                  <View style={{ gap: 8 }}>
                    {REPORT_REASONS.map((reason) => (
                      <Pressable
                        key={reason.value}
                        onPress={() => setReportReason(reason.value)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 12,
                          borderRadius: 12,
                          backgroundColor: reportReason === reason.value ? '#EF4444' + '20' : colors.iconBackground,
                          borderWidth: 1,
                          borderColor: reportReason === reason.value ? '#EF4444' : colors.borderColor,
                        }}
                      >
                        <Ionicons
                          name={reportReason === reason.value ? 'radio-button-on' : 'radio-button-off'}
                          size={20}
                          color={reportReason === reason.value ? '#EF4444' : colors.secondaryTextColor}
                          style={{ marginRight: 12 }}
                        />
                        <Text
                          style={{
                            color: reportReason === reason.value ? colors.textColor : colors.secondaryTextColor,
                            fontSize: 16,
                            fontWeight: reportReason === reason.value ? '600' : '400',
                          }}
                        >
                          {reason.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={{ marginBottom: 24 }}>
                  <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                    Additional Details (Optional)
                  </Text>
                  <TextInput
                    placeholder="Provide more information about the issue..."
                    placeholderTextColor={colors.secondaryTextColor}
                    value={reportDescription}
                    onChangeText={setReportDescription}
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                    style={{
                      backgroundColor: colors.iconBackground,
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: colors.textColor,
                      minHeight: 100,
                      textAlignVertical: 'top',
                      borderWidth: 1,
                      borderColor: colors.borderColor,
                    }}
                  />
                  <Text style={{ color: colors.secondaryTextColor, fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                    {reportDescription.length}/500
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <Pressable
              onPress={onClose}
              disabled={blocking || reporting}
              style={{
                flex: 1,
                backgroundColor: colors.iconBackground,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                opacity: blocking || reporting ? 0.5 : 1,
              }}
            >
              <Text style={{ color: colors.textColor, fontSize: 16, fontWeight: '600' }}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={activeTab === 'block' ? handleBlock : handleReport}
              disabled={blocking || reporting || (activeTab === 'report' && !reportReason)}
              style={{ flex: 1 }}
            >
              {({ pressed }) => (
                <LinearGradient
                  colors={activeTab === 'block' && isBlocked ? ['#10B981', '#10B981'] : ['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 12,
                    paddingVertical: 14,
                    alignItems: 'center',
                    opacity: blocking || reporting || (activeTab === 'report' && !reportReason) ? 0.5 : pressed ? 0.8 : 1,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                    {blocking
                      ? isBlocked
                        ? 'Unblocking...'
                        : 'Blocking...'
                      : reporting
                      ? 'Reporting...'
                      : activeTab === 'block'
                      ? isBlocked
                        ? 'Unblock User'
                        : 'Block User'
                      : 'Submit Report'}
                  </Text>
                </LinearGradient>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

