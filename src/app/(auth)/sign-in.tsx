import { useAuth, useSignIn } from '@clerk/expo';
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

export default function SignInScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth({ treatPendingAsSignedOut: false });
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isSubmitting = fetchStatus === 'fetching';
  const emailError = useMemo(() => {
    if (!email.trim()) return 'Enter your email address.';
    if (!emailPattern.test(email.trim())) return 'Enter a valid email address.';
    return null;
  }, [email]);

  const handleSubmit = async () => {
    setFormError(null);
    if (emailError || !password) {
      setFormError(emailError ?? 'Enter your password.');
      return;
    }

    const { error } = await signIn.password({
      identifier: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      setFormError(error.longMessage ?? 'We could not sign you in. Check your details and try again.');
      return;
    }

    if (signIn.status === 'complete') {
      const { error: finalizeError } = await signIn.finalize();
      if (finalizeError) {
        setFormError(finalizeError.longMessage ?? 'Your sign-in could not be completed. Please try again.');
        return;
      }
      router.replace('/(tabs)');
      return;
    }

    if (
      signIn.status === 'needs_second_factor' ||
      signIn.status === 'needs_client_trust'
    ) {
      const emailCodeFactor = signIn.supportedSecondFactors?.find(
        (factor) => factor.strategy === 'email_code',
      );

      if (!emailCodeFactor) {
        setFormError(
          signIn.status === 'needs_second_factor'
            ? 'This account requires a second factor that is not configured for email verification. Use the configured authenticator or backup code, or enable email verification in Clerk.'
            : 'This device needs verification, but Clerk has no email verification method available for this account.',
        );
        return;
      }

      const { error: mfaError } = await signIn.mfa.sendEmailCode();
      if (mfaError) {
        setFormError(mfaError.longMessage ?? 'Your account requires additional verification that is not available right now.');
        return;
      }
      setVerificationRequired(true);
      return;
    }

    setFormError(
      `Sign-in could not continue because Clerk returned "${signIn.status ?? 'an incomplete status'}". Check the account requirements in the Clerk Dashboard.`,
    );
  };

  const handleVerifyMfa = async () => {
    setFormError(null);
    if (!/^\d{6}$/.test(verificationCode.trim())) {
      setFormError('Enter the 6-digit verification code.');
      return;
    }

    const { error } = await signIn.mfa.verifyEmailCode({ code: verificationCode.trim() });
    if (error) {
      setFormError(error.longMessage ?? 'That code could not be verified. Check it and try again.');
      return;
    }

    const { error: finalizeError } = await signIn.finalize();
    if (finalizeError) {
      setFormError(finalizeError.longMessage ?? 'Your sign-in could not be completed. Please try again.');
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
          <AuthBrand />
          <View className="auth-copy">
            <Text className="auth-title">{verificationRequired ? 'One more step' : 'Welcome back'}</Text>
            <Text className="auth-subtitle auth-subtitle-left">
              {verificationRequired
                ? 'We sent a verification code to your email to keep your account secure.'
                : 'Sign in to keep your subscriptions organized and your next renewal in view.'}
            </Text>
          </View>

          <View className="auth-card">
            {verificationRequired ? (
              <View className="auth-form">
                <AuthField
                  label="Verification code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  placeholder="000000"
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  autoComplete="one-time-code"
                  error={errors.fields.code?.longMessage}
                />
                {formError && <Text className="auth-error">{formError}</Text>}
                <Pressable
                  className={`auth-button ${isSubmitting ? 'auth-button-disabled' : ''}`}
                  onPress={handleVerifyMfa}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <ActivityIndicator color="#081126" /> : <Text className="auth-button-text">Verify and continue</Text>}
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <AuthField
                  label="Email address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.fields.identifier?.longMessage ?? (email && emailError ? emailError : undefined)}
                />
                <AuthField
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  error={errors.fields.password?.longMessage}
                  trailing={
                    <Pressable onPress={() => setShowPassword((visible) => !visible)} hitSlop={8}>
                      <Text className="auth-input-action">{showPassword ? 'Hide' : 'Show'}</Text>
                    </Pressable>
                  }
                />

                {(formError || errors.global?.[0]?.longMessage) && (
                  <Text className="auth-error">{formError ?? errors.global?.[0]?.longMessage}</Text>
                )}

                <Pressable
                  className={`auth-button ${isSubmitting ? 'auth-button-disabled' : ''}`}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>
              </View>
            )}
          </View>

          <View className="auth-link-row">
            <Text className="auth-link-copy">New to DerealSubmon?</Text>
            <Link href="/(auth)/sign-up" className="auth-link">Create an account</Link>
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

function AuthBrand() {
  return (
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