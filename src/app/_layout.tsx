import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  SourceCodePro_400Regular,
  useFonts,
} from '@expo-google-fonts/source-code-pro';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useColorScheme as nativewindUseColorScheme } from 'nativewind';

import {
  Stack,
  useRootNavigationState,
  useSegments,
  router,
  SplashScreen as ExpoSplashScreen,
} from 'expo-router';
import { RootSiblingParent } from 'react-native-root-siblings';

import {
  ThemeProvider,
  DarkTheme,
  DefaultTheme,
} from '@react-navigation/native';

//OneSignal
// import OneSignal from 'react-native-onesignal';

//SEGMENT - ANALYTICS
import { AnalyticsProvider } from '@segment/analytics-react-native';
import { segmentClient } from '_config/segment';

import { I18nextProvider } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { SplashScreen } from '_components/LottieSplashModal';
import i18n from 'src/locales/i18n';
import { useAuth } from 'src/store/authStore/auth.store';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

const FONT_LOAD_DELAY = 2000;
const SCREEN_TRANSITION_DELAY = 150;

function useProtectedRoute() {
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  const user = useAuth(({ user }) => user);

  const navigationKey = React.useMemo(() => {
    return rootNavigationState?.key;
  }, [rootNavigationState]);

  useLayoutEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!navigationKey) {
      return;
    }

    if (!user && !inAuthGroup) {
      router.replace('/sign-in');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, segments, navigationKey]);
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    SpaceMono: SourceCodePro_400Regular,
  });

  const [appState, setAppState] = useState({
    fontsLoaded: false,
    isDelayOver: false,
    screenReady: false,
  });

  //TODO: set OneSignal HERE
  //One Signal Notifications
  // useEffect(() => {

  //   // Initialize OneSignal
  //   OneSignal.setAppId(''); //TODO: set app id
  //   OneSignal.setNotificationOpenedHandler((notification) => {
  //     console.log('OneSignal: notification opened:', notification);
  //     //Logic to handle notifications goes here
  //   });
  //   OneSignal.promptForPushNotificationsWithUserResponse((response) => {
  //     console.log('OneSignal: User accepted notifications:', response);
  //     //Logic to handle notifications goes here
  //   });
  // }, []);

  useEffect(() => {
    if (loaded) {
      ExpoSplashScreen.hideAsync();
      setAppState((prev) => ({ ...prev, fontsLoaded: true }));
    }
    if (error) {
      throw error;
    }
  }, [loaded, error]);

  useEffect(() => {
    if (appState.fontsLoaded) {
      const timer = setTimeout(() => {
        setAppState((prev) => ({ ...prev, isDelayOver: true }));
      }, FONT_LOAD_DELAY);

      return () => clearTimeout(timer);
    }
  }, [appState.fontsLoaded]);

  useEffect(() => {
    if (appState.isDelayOver) {
      setTimeout(() => {
        setAppState((prev) => ({ ...prev, screenReady: true }));
      }, SCREEN_TRANSITION_DELAY);
    }
  }, [appState.isDelayOver]);

  useProtectedRoute();

  if (!loaded || !appState.isDelayOver) {
    return <SplashScreen animationFadeOut={appState.isDelayOver} />;
  }

  if (appState.screenReady) {
    return <RootLayoutNav />;
  }
}

function RootLayoutNav() {
  const { colorScheme } = nativewindUseColorScheme();

  return (
    <AnalyticsProvider client={segmentClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootSiblingParent>
          <I18nextProvider i18n={i18n}>
            <Stack>
              <Stack.Screen name="(root)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
            <StatusBar style={colorScheme ?? 'light'} />
          </I18nextProvider>
        </RootSiblingParent>
      </ThemeProvider>
    </AnalyticsProvider>
  );
}
