import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

export const initializeSentry = () => {
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: __DEV__ ? 1 : 0.1,
    enableNative: true,
  });
};

export { Sentry };
