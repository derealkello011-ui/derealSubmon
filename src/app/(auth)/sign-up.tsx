import { useAuth, useSignUp } from '@clerk/expo';
import { Redirect, Link, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import '@/global.css';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const { signUp, errors, fetchStatus } = useSignUp();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [code, setCode] = useState('');
  const [verificationStarted, setVerificationStarted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isSubmitting = fetchStatus === 'fetching';
  const emailError = useMemo(() => {
    if (!email.trim()) return 'Enter your email address.';
    if (!emailPattern.test(email.trim())) return 'Enter a valid email address.';
    return null;
  }, [email]);
  const passwordError = password && password.length < 8
    ? 'Use at least 8 characters.'
    : password && confirmation && password !== confirmation
      ? 'Passwords do not match.'
      : null;

  const handleCreateAccount = async () => {
    setFormError(null);
    if (emailError || !password || passwordError || !confirmation) {
      setFormError(emailError ?? passwordError ?? (!password ? 'Create a password.' : 'Confirm your password.'));
      return;
    }

    const { error } = await signUp.password({
      emailAddress: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    });

    if (error) {
      setFormError(error.longMessage ?? 'We could not create your account. Check your details and try again.');
      return;
    }

    if (signUp.status === 'complete') {
      const { error: finalizeError } = await signUp.finalize();
      if (finalizeError) {
        setFormError(finalizeError.longMessage ?? 'Your account could not be completed. Please try again.');
        return;
      }
      router.replace('/(tabs)');
      return;
    }

    const { error: verificationError } = await signUp.verifications.sendEmailCode();
    if (verificationError) {
      setFormError(verificationError.longMessage ?? 'We could not send your verification code.');
      return;
    }
    setVerificationStarted(true);
  };

  const handleVerifyEmail = async () => {
    setFormError(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setFormError('Enter the 6-digit code sent to your email.');
      return;
    }

    const { error } = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (error) {
      setFormError(error.longMessage ?? 'That code could not be verified. Check it and try again.');
      return;
    }

    const { error: finalizeError } = await signUp.finalize();
    if (finalizeError) {
      setFormError(finalizeError.longMessage ?? 'Your account could not be completed. Please try again.');
      return;
    }
    router.replace('/(tabs)');
  };

  if (!isLoaded) return <AuthLoading />;
  if (isSignedIn) return <Redirect href="/(tabs)" />;

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">d</Text>
              </View>
              <View>
                <Text className="auth-wordmark">DerealSubmon</Text>
                <Text className="auth-wordmark-sub">subscriptions, simplified</Text>
              </View>
            </View>
          </View>

          <View className="auth-copy">
            <Text className="auth-title">{verificationStarted ? 'Check your inbox' : 'Start with clarity'}</Text>
            <Text className="auth-subtitle auth-subtitle-left">
              {verificationStarted
                ? `Enter the verification code we sent to ${email.trim()}.`
                : 'Create your account and bring every recurring payment into one calm, clear view.'}
            </Text>
          </View>

          <View className="auth-card">
            {verificationStarted ? (
              <View className="auth-form">
                <AuthField
                  label="Verification code"
                  value={code}
                  onChangeText={setCode}
                  placeholder="000000"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoComplete="one-time-code"
                  error={errors.fields.code?.longMessage}
                />
                {formError && <Text className="auth-error">{formError}</Text>}
                <Pressable
                  className={`auth-button ${isSubmitting ? 'auth-button-disabled' : ''}`}
                  onPress={handleVerifyEmail}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">Verify email</Text>}
                </Pressable>
                <Pressable
                  className="auth-secondary-button"
                  onPress={() => {
                    setVerificationStarted(false);
                    setCode('');
                    setFormError(null);
                    void signUp.reset();
                  }}
                  disabled={isSubmitting}
                >
                  <Text className="auth-secondary-button-text">Use a different email</Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-name-row">
                  <AuthField label="First name" value={firstName} onChangeText={setFirstName} placeholder="Kelvin" autoCapitalize="words" />
                  <AuthField label="Last name" value={lastName} onChangeText={setLastName} placeholder="Doe" autoCapitalize="words" />
                </View>
                <AuthField
                  label="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.fields.emailAddress?.longMessage ?? (email && emailError ? emailError : undefined)}
                />
                <AuthField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  error={errors.fields.password?.longMessage ?? (passwordError || undefined)}
                  trailing={
                    <Pressable onPress={() => setShowPassword((visible) => !visible)} hitSlop={8}>
                      <Text className="auth-input-action">{showPassword ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  }
                />
                <AuthField
                  label="Confirm password"
                  value={confirmation}
                  onChangeText={setConfirmation}
                  placeholder="Repeat your password"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  error={confirmation && password !== confirmation ? 'Passwords do not match.' : undefined}
                />

                {formError && <Text className="auth-error">{formError}</Text>}
                <Text className="auth-helper">
                  We’ll use your email to verify your account and keep it secure.
                </Text>
                <Pressable
                  className={`auth-button ${isSubmitting ? 'auth-button-disabled' : ''}`}
                  onPress={handleCreateAccount}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">Create account</Text>}
                </Pressable>
                <View nativeID="clerk-captcha" />
              </View>
            )}
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">{verificationStarted ? 'Already verified?' : 'Already have an account?'}</Text>
            <Link href="/(auth)/sign-in" className="auth-link">Sign in</Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthLoading() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator color="#ea7a53" />
    </View>
  );
}

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  error?: string;
  trailing?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
  autoComplete?: React.ComponentProps<typeof TextInput>['autoComplete'];
};

function AuthField({ label, error, trailing, ...inputProps }: AuthFieldProps) {
  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <View className={`auth-input-wrap ${error ? 'auth-input-error' : ''}`}>
        <TextInput {...inputProps} className="auth-input auth-input-flex" placeholderTextColor="rgba(0, 0, 0, 0.4)" />
        {trailing}
      </View>
      {error && <Text className="auth-error">{error}</Text>}
    </View>
  );
}