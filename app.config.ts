import type { ExpoConfig } from 'expo/config';

const applicationId = process.env.BLACKSPOT_APPLICATION_ID ?? 'com.blackspotyou.app';
const googleMapsAndroidKey = process.env.GOOGLE_MAPS_ANDROID_KEY ?? process.env.EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_KEY ?? '';

export default (): ExpoConfig => ({
  name: 'BLACKSPOT YOU',
  slug: 'blackspot-you',
  owner: 'blinkydating',
  version: '1.0.0',
  icon: './assets/icon.png',
  orientation: 'portrait',
  scheme: 'blackspotyou',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: applicationId,
    supportsTablet: false,
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'BLACKSPOT YOU utilise votre position uniquement pour afficher les lieux à proximité.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: applicationId,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#6D28D9',
    },
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
  },
  plugins: [
    'expo-router',
    [
      'expo-secure-store',
      {
        configureAndroidBackup: true,
        faceIDPermission: 'Autoriser BLACKSPOT YOU à sécuriser votre session.',
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Autoriser BLACKSPOT YOU à afficher les lieux proches de vous.',
        isIosBackgroundLocationEnabled: false,
        isAndroidBackgroundLocationEnabled: false,
        isAndroidForegroundServiceEnabled: false,
      },
    ],
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: googleMapsAndroidKey,
      },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? 'fbd1b684-c8fe-49be-adfa-790e87d521e3',
    },
  },
});
