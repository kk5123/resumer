import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_ENV = process.env.APP_ENV ?? 'development';

const ADMOB_APP_ID_IOS =
  APP_ENV === 'preview' || APP_ENV === 'production'
    ? process.env.ADMOB_APP_ID_IOS
    : undefined;

const ADMOB_APP_ID_ANDROID =
  APP_ENV === 'preview' || APP_ENV === 'production'
    ? process.env.ADMOB_APP_ID_ANDROID
    : undefined;

const plugins: ExpoConfig['plugins'] = [
  '@react-native-community/datetimepicker',
  'expo-notifications',
];

if (APP_ENV === 'preview' || APP_ENV === 'production') {
  plugins.push([
    'react-native-google-mobile-ads',
    {
      iosAppId: ADMOB_APP_ID_IOS,
      androidAppId: ADMOB_APP_ID_ANDROID,
    },
  ]);
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: '中断メモ',
  slug: 'pause-memo',
  version: '0.1.0',
  description: '作業を中断した瞬間を素早く記録し、次に再開するときの迷いを減らすためのメモアプリです。中断理由や次にやるべきことをその場で残すことで、作業の文脈を失わずに復帰できます。タスク管理ではなく、中断という一瞬にフォーカスしたシンプルな設計が特徴です。',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  splash: {
    image: './assets/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    bundleIdentifier: 'dev.kk5123.pause-memo',
    buildNumber: '1',
    supportsTablet: true,
    infoPlist: {
      NSUserNotificationsUsageDescription: '作業再開のリマインダーを設定するために通知権限が必要です。',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'dev.kk5123.pause_memo',
    versionCode: 1,
    permissions: [
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.SCHEDULE_EXACT_ALARM',
    ],
    adaptiveIcon: {
      foregroundImage: './assets/icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/icon.png',
  },
  plugins,
  extra: {
    appNameEn: 'Pause Memo',
    eas: {
      projectId: "e8f8af05-2e4b-4b70-8301-aadc743e86ee"
    }
  },
});
