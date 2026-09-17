import { useAuth, useSessionList, useUser } from '@clerk/expo';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import images from '@/constants/images';
import '@/global.css';

type ModalName = 'profile' | 'password' | 'accounts' | 'about' | null;

const formatDate = (value: Date | null | undefined) =>
  value
    ? value.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Not available';

export default function SettingsScreen() {
  const { isLoaded: authLoaded, isSignedIn, signOut } = useAuth({
    treatPendingAsSignedOut: false,
  });
  const { isLoaded: userLoaded, user } = useUser();
  const { isLoaded: sessionsLoaded, sessions, setActive } = useSessionList();
  const [modal, setModal] = useState<ModalName>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const displayName = useMemo(
    () =>
      user?.fullName?.trim() ||
      user?.firstName?.trim() ||
      user?.username?.trim() ||
      user?.primaryEmailAddress?.emailAddress ||
      'Your account',
    [user],
  );

  useEffect(() => {
    if (authLoaded && userLoaded && !isSignedIn) {
      router.replace('/(auth)/sign-in');
    }
  }, [authLoaded, isSignedIn, userLoaded]);

  if (!authLoaded || !userLoaded || !sessionsLoaded) {
    return (
      <SafeAreaView className="settings-safe-area">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ea7a53" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn || !user) {
    return null;
  }

  const closeModal = () => {
    setModal(null);
    setFeedback(null);
  };

  const chooseProfileImage = async () => {
    setFeedback(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFeedback('Photo access is needed to choose a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    setIsBusy(true);
    try {
      await user.setProfileImage({ file: result.assets[0].uri });
      setFeedback('Profile picture updated.');
    } catch {
      setFeedback('We could not update your profile picture. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Log out?', 'You can sign back in whenever you are ready.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          setIsBusy(true);
          try {
            await signOut();
            router.replace('/(auth)/sign-in');
          } catch {
            setFeedback('We could not log you out. Please try again.');
          } finally {
            setIsBusy(false);
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This permanently removes your Clerk account and cannot be undone.',
      [
        { text: 'Keep account', style: 'cancel' },
        {
          text: 'Delete permanently',
          style: 'destructive',
          onPress: async () => {
            setIsBusy(true);
            try {
              await user.delete();
              router.replace('/(auth)/sign-in');
            } catch {
              setFeedback('We could not delete your account. Please try again.');
            } finally {
              setIsBusy(false);
            }
          },
        },
      ],
    );
  };

  const handleSwitchAccount = async (sessionId: string) => {
    if (!setActive || sessionId === sessions?.find((session) => session.status === 'active')?.id) {
      closeModal();
      return;
    }

    setIsBusy(true);
    try {
      await setActive({ session: sessionId });
      closeModal();
    } catch {
      setFeedback('We could not switch accounts. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleUseAnotherAccount = async () => {
    setIsBusy(true);
    try {
      await signOut();
      closeModal();
      router.replace('/(auth)/sign-in');
    } catch {
      setFeedback('We could not switch accounts. Please try again.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <SafeAreaView className="settings-safe-area">
      <ScrollView
        className="flex-1"
        contentContainerClassName="settings-content"
        showsVerticalScrollIndicator={false}
      >
        <View className="settings-header">
          <View>
            <Text className="settings-kicker">ACCOUNT</Text>
            <Text className="settings-title">Settings</Text>
          </View>
          <View className="settings-header-mark">
            <Ionicons name="settings-outline" size={22} color="#ea7a53" />
          </View>
        </View>

        <View className="settings-profile-card">
          <Image
            source={user.imageUrl ? { uri: user.imageUrl } : images.avatar}
            className="settings-avatar"
          />
          <View className="settings-profile-copy">
            <Text className="settings-profile-name" numberOfLines={1}>{displayName}</Text>
            <Text className="settings-profile-email" numberOfLines={1}>
              {user.primaryEmailAddress?.emailAddress ?? 'No primary email'}
            </Text>
          </View>
          <Pressable className="settings-edit-button" onPress={() => setModal('profile')}>
            <Ionicons name="pencil-outline" size={17} color="#081126" />
          </Pressable>
        </View>

        <SettingsSection title="Your account">
          <SettingsRow
            icon="person-outline"
            title="Profile details"
            subtitle="Name and profile picture"
            onPress={() => setModal('profile')}
          />
          <SettingsRow
            icon="key-outline"
            title="Change password"
            subtitle={user.passwordEnabled ? 'Update your account password' : 'No password is set'}
            onPress={() => setModal('password')}
          />
          <SettingsRow
            icon="finger-print-outline"
            title="Account ID"
            subtitle={user.id}
            onPress={() => Alert.alert('Account ID', user.id)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Account details">
          <InfoRow label="Joined" value={formatDate(user.createdAt)} />
          <InfoRow label="Last sign in" value={formatDate(user.lastSignInAt)} />
          <InfoRow label="Email addresses" value={`${user.emailAddresses.length} connected`} />
          <InfoRow label="Security" value={user.twoFactorEnabled ? 'Two-step verification on' : 'Password protected'} isLast />
        </SettingsSection>

        <SettingsSection title="Access">
          <SettingsRow
            icon="swap-horizontal-outline"
            title="Change account"
            subtitle={`${sessions.length} active account${sessions.length === 1 ? '' : 's'}`}
            onPress={() => setModal('accounts')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow
            icon="information-circle-outline"
            title="About DerealSubmon"
            subtitle={`Version ${Constants.expoConfig?.version ?? '1.0.0'}`}
            onPress={() => setModal('about')}
            isLast
          />
        </SettingsSection>

        {feedback && <Text className="settings-feedback">{feedback}</Text>}

        <Pressable className="settings-logout-button" onPress={handleSignOut} disabled={isBusy}>
          <Ionicons name="log-out-outline" size={19} color="#081126" />
          <Text className="settings-logout-text">Log out</Text>
        </Pressable>
        <Pressable className="settings-delete-button" onPress={handleDeleteAccount} disabled={isBusy}>
          <Text className="settings-delete-text">Delete account</Text>
        </Pressable>
        <Text className="settings-footer">Your account is secured by Clerk.</Text>
      </ScrollView>

      <ProfileModal
        visible={modal === 'profile'}
        user={user}
        displayName={displayName}
        feedback={feedback}
        isBusy={isBusy}
        onClose={closeModal}
        onChooseImage={chooseProfileImage}
        onSave={async (firstName, lastName) => {
          setFeedback(null);
          if (!firstName.trim() && !lastName.trim()) {
            setFeedback('Enter at least a first or last name.');
            return;
          }
          setIsBusy(true);
          try {
            await user.update({
              firstName: firstName.trim() || undefined,
              lastName: lastName.trim() || undefined,
            });
            setFeedback('Profile details updated.');
          } catch {
            setFeedback('We could not update your profile details. Please try again.');
          } finally {
            setIsBusy(false);
          }
        }}
      />
      <PasswordModal
        visible={modal === 'password'}
        isBusy={isBusy}
        feedback={feedback}
        passwordEnabled={user.passwordEnabled}
        onClose={closeModal}
        onSave={async (currentPassword, newPassword, confirmation) => {
          setFeedback(null);
          if (user.passwordEnabled && !currentPassword) {
            setFeedback('Enter your current password.');
            return;
          }
          if (newPassword.length < 8) {
            setFeedback('Your new password must be at least 8 characters.');
            return;
          }
          if (newPassword !== confirmation) {
            setFeedback('New password and confirmation do not match.');
            return;
          }
          setIsBusy(true);
          try {
            await user.updatePassword({
              currentPassword: user.passwordEnabled ? currentPassword : undefined,
              newPassword,
              signOutOfOtherSessions: false,
            });
            setFeedback('Password updated successfully.');
          } catch {
            setFeedback('We could not update your password. Check your current password and try again.');
          } finally {
            setIsBusy(false);
          }
        }}
      />
      <AccountsModal
        visible={modal === 'accounts'}
        sessions={sessions}
        currentSessionId={sessions.find((session) => session.status === 'active')?.id}
        isBusy={isBusy}
        onClose={closeModal}
        onSwitch={handleSwitchAccount}
        onUseAnotherAccount={handleUseAnotherAccount}
      />
      <AppInfoModal visible={modal === 'about'} onClose={closeModal} />
    </SafeAreaView>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="settings-section">
      <Text className="settings-section-title">{title}</Text>
      <View className="settings-section-card">{children}</View>
    </View>
  );
}

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable className={`settings-row ${isLast ? '' : 'settings-row-border'}`} onPress={onPress}>
      <View className="settings-row-icon"><Ionicons name={icon} size={20} color="#ea7a53" /></View>
      <View className="settings-row-copy">
        <Text className="settings-row-title">{title}</Text>
        <Text className="settings-row-subtitle" numberOfLines={1}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(0,0,0,0.35)" />
    </Pressable>
  );
}

function InfoRow({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  return (
    <View className={`settings-info-row ${isLast ? '' : 'settings-row-border'}`}>
      <Text className="settings-info-label">{label}</Text>
      <Text className="settings-info-value" numberOfLines={1}>{value}</Text>
    </View>
  );
}

function ModalShell({
  visible,
  title,
  subtitle,
  children,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="modal-overlay">
        <View className="settings-modal">
          <View className="settings-modal-header">
            <View>
              <Text className="settings-modal-title">{title}</Text>
              {subtitle && <Text className="settings-modal-subtitle">{subtitle}</Text>}
            </View>
            <Pressable className="modal-close" onPress={onClose}>
              <Text className="modal-close-text">×</Text>
            </Pressable>
          </View>
          <ScrollView contentContainerClassName="settings-modal-body" keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ProfileModal({
  visible,
  user,
  displayName,
  feedback,
  isBusy,
  onClose,
  onChooseImage,
  onSave,
}: {
  visible: boolean;
  user: NonNullable<ReturnType<typeof useUser>['user']>;
  displayName: string;
  feedback: string | null;
  isBusy: boolean;
  onClose: () => void;
  onChooseImage: () => Promise<void>;
  onSave: (firstName: string, lastName: string) => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(user.firstName ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');

  return (
    <ModalShell visible={visible} title="Profile details" subtitle="Keep your account identity up to date." onClose={onClose}>
      <View className="settings-modal-avatar-wrap">
        <Image source={{ uri: user.imageUrl }} className="settings-modal-avatar" />
        <Pressable className="settings-photo-button" onPress={onChooseImage} disabled={isBusy}>
          <Ionicons name="camera-outline" size={16} color="#081126" />
          <Text className="settings-photo-text">Change picture</Text>
        </Pressable>
      </View>
      <SettingsInput label="First name" value={firstName} onChangeText={setFirstName} placeholder={displayName} />
      <SettingsInput label="Last name" value={lastName} onChangeText={setLastName} placeholder="Optional" />
      {feedback && <Text className="settings-feedback">{feedback}</Text>}
      <PrimaryButton title="Save profile" loading={isBusy} onPress={() => void onSave(firstName, lastName)} />
    </ModalShell>
  );
}

function PasswordModal({
  visible,
  isBusy,
  feedback,
  passwordEnabled,
  onClose,
  onSave,
}: {
  visible: boolean;
  isBusy: boolean;
  feedback: string | null;
  passwordEnabled: boolean;
  onClose: () => void;
  onSave: (current: string, next: string, confirmation: string) => Promise<void>;
}) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmation, setConfirmation] = useState('');

  return (
    <ModalShell visible={visible} title="Change password" subtitle="Use a strong password you do not reuse elsewhere." onClose={onClose}>
      {passwordEnabled && <SettingsInput label="Current password" value={current} onChangeText={setCurrent} placeholder="Current password" secureTextEntry />}
      <SettingsInput label="New password" value={next} onChangeText={setNext} placeholder="At least 8 characters" secureTextEntry />
      <SettingsInput label="Confirm new password" value={confirmation} onChangeText={setConfirmation} placeholder="Repeat your new password" secureTextEntry />
      {feedback && <Text className="settings-feedback">{feedback}</Text>}
      <PrimaryButton title="Update password" loading={isBusy} onPress={() => void onSave(current, next, confirmation)} />
    </ModalShell>
  );
}

function AccountsModal({
  visible,
  sessions,
  currentSessionId,
  isBusy,
  onClose,
  onSwitch,
  onUseAnotherAccount,
}: {
  visible: boolean;
  sessions: NonNullable<ReturnType<typeof useSessionList>['sessions']>;
  currentSessionId?: string;
  isBusy: boolean;
  onClose: () => void;
  onSwitch: (sessionId: string) => Promise<void>;
  onUseAnotherAccount: () => Promise<void>;
}) {
  return (
    <ModalShell visible={visible} title="Change account" subtitle="Switch between signed-in Clerk accounts on this device." onClose={onClose}>
      {sessions.length === 1 && <Text className="settings-helper">Only this account is signed in on the device.</Text>}
      {sessions.map((session) => {
        const sessionUser = session.user;
        const name = sessionUser?.fullName || sessionUser?.primaryEmailAddress?.emailAddress || session.id;
        return (
          <Pressable
            key={session.id}
            className={`account-switch-row ${session.id === currentSessionId ? 'account-switch-row-active' : ''}`}
            onPress={() => void onSwitch(session.id)}
            disabled={isBusy}
          >
            <View className="account-switch-copy">
              <Text className="account-switch-name">{name}</Text>
              <Text className="account-switch-meta">{session.id === currentSessionId ? 'Current account' : 'Tap to switch'}</Text>
            </View>
            {session.id === currentSessionId && <Ionicons name="checkmark-circle" size={22} color="#ea7a53" />}
          </Pressable>
        );
      })}
      <Pressable className="auth-secondary-button" onPress={() => void onUseAnotherAccount()} disabled={isBusy}>
        {isBusy ? <ActivityIndicator color="#ea7a53" /> : <Text className="auth-secondary-button-text">Sign in with another account</Text>}
      </Pressable>
    </ModalShell>
  );
}

function AppInfoModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <ModalShell visible={visible} title="About DerealSubmon" subtitle="A calmer way to stay ahead of recurring payments." onClose={onClose}>
      <View className="about-mark"><Text className="auth-logo-mark-text">d</Text></View>
      <Text className="about-title">DerealSubmon</Text>
      <Text className="about-copy">
        Track subscriptions, understand upcoming renewals, and keep your financial commitments visible without the noise.
      </Text>
      <InfoRow label="Version" value={Constants.expoConfig?.version ?? '1.0.0'} isLast />
      <Text className="settings-footer">Authentication and account security are provided by Clerk.</Text>
    </ModalShell>
  );
}

function SettingsInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
}) {
  return (
    <View className="settings-input-field">
      <Text className="settings-input-label">{label}</Text>
      <TextInput
        className="settings-input"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(0, 0, 0, 0.4)"
        secureTextEntry={secureTextEntry}
        autoCapitalize={secureTextEntry ? 'none' : 'words'}
      />
    </View>
  );
}

function PrimaryButton({ title, loading, onPress }: { title: string; loading: boolean; onPress: () => void }) {
  return (
    <Pressable className={`auth-button ${loading ? 'auth-button-disabled' : ''}`} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">{title}</Text>}
    </Pressable>
  );
}
