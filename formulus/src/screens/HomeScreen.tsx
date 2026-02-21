import React, { useEffect, useState, useRef } from 'react';
import {
  Alert,
  BackHandler,
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { unzip } from 'react-native-zip-archive';
import CustomAppWebView, {
  CustomAppWebViewHandle,
} from '../components/CustomAppWebView';
import { colors } from '../theme/colors';
import { appEvents, Listener } from '../webview/FormulusMessageHandlers';
import { useAppTheme } from '../contexts/AppThemeContext';
import { appVersionService } from '../services/AppVersionService';

/**
 * Path to the pre-bundled app zip embedded in the APK/IPA assets.
 * On Android: file:///android_asset/pre_bundle/bundle.zip
 * On iOS: MainBundlePath/pre_bundle/bundle.zip
 */
const getPreBundlePath = () => {
  if (Platform.OS === 'android') {
    // On Android we can't check existence in assets directly,
    // but we can try to copy it.
    return 'pre_bundle/bundle.zip';
  }
  return `${RNFS.MainBundlePath}/pre_bundle/bundle.zip`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(0);
  const customAppRef = useRef<CustomAppWebViewHandle>(null);
  const { reloadTheme } = useAppTheme();

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS !== 'android') {
        return;
      }

      const onBackPress = () => {
        if (customAppRef.current?.canGoBack?.()) {
          customAppRef.current.goBack();
          return true;
        }

        Alert.alert('Exit app?', 'Are you sure you want to exit RentFreely?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => BackHandler.exitApp(),
          },
        ]);
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, []),
  );

  /**
   * Install or upgrade the pre-bundled custom app from APK/IPA assets.
   *
   * Works on fresh install AND on APK upgrades:
   *  1. No app at all → extract pre-bundle.
   *  2. App exists but was installed from an older APK build → re-extract
   *     (the pre-bundle inside the new APK is newer).
   *
   * We track which APK build number last installed the pre-bundle in
   * AsyncStorage under `@pre_bundle_build`. If the current build number
   * is different, we re-extract.
   */
  const PREBUNDLE_BUILD_KEY = '@pre_bundle_build';

  const installPreBundleIfNeeded = async () => {
    const appDir = `${RNFS.DocumentDirectoryPath}/app`;
    const indexPath = `${appDir}/index.html`;
    const appExists = await RNFS.exists(indexPath);

    // Get current APK/IPA build number (e.g. "1", "2", ...)
    let currentBuild: string;
    try {
      currentBuild = await appVersionService.getBuildNumber();
    } catch {
      currentBuild = '0';
    }

    // Check which build number last installed the pre-bundle
    const lastBuild = await AsyncStorage.getItem(PREBUNDLE_BUILD_KEY);

    if (appExists && lastBuild === currentBuild) {
      // App exists and was installed from THIS build → nothing to do
      return;
    }

    const reason = !appExists
      ? 'No custom app found'
      : `APK upgraded (build ${lastBuild} → ${currentBuild})`;
    console.log(`[HomeScreen] ${reason} — installing pre-bundle`);

    try {
      if (Platform.OS === 'android') {
        const assetPath = getPreBundlePath();
        const tempZip = `${RNFS.CachesDirectoryPath}/pre_bundle.zip`;

        await RNFS.copyFileAssets(assetPath, tempZip);
        console.log('[HomeScreen] Copied pre-bundle to:', tempZip);

        // Remove old app dir first so there are no stale files
        if (appExists) {
          await RNFS.unlink(appDir);
          console.log('[HomeScreen] Removed old app directory');
        }

        await unzip(tempZip, RNFS.DocumentDirectoryPath);
        console.log('[HomeScreen] Extracted pre-bundle to Documents');

        if (await RNFS.exists(tempZip)) {
          await RNFS.unlink(tempZip);
        }
      } else {
        const bundlePath = getPreBundlePath();
        if (await RNFS.exists(bundlePath)) {
          const tempZip = `${RNFS.CachesDirectoryPath}/pre_bundle.zip`;
          await RNFS.copyFile(bundlePath, tempZip);

          if (appExists) {
            await RNFS.unlink(appDir);
          }

          await unzip(tempZip, RNFS.DocumentDirectoryPath);
          if (await RNFS.exists(tempZip)) {
            await RNFS.unlink(tempZip);
          }
        }
      }

      // Record that this build installed the pre-bundle
      await AsyncStorage.setItem(PREBUNDLE_BUILD_KEY, currentBuild);
      console.log(
        `[HomeScreen] Pre-bundle installed for build ${currentBuild}`,
      );
    } catch (err) {
      console.warn('[HomeScreen] Pre-bundle install failed:', err);
      // Non-fatal — the app will show the placeholder and the user
      // can trigger a sync to download the bundle from the server.
    }
  };

  const checkAndSetAppUri = async () => {
    try {
      // Try installing pre-bundle if first launch
      await installPreBundleIfNeeded();

      const filePath = `${RNFS.DocumentDirectoryPath}/app/index.html`;
      console.log('[HomeScreen] Checking for custom app at:', filePath);
      const fileExists = await RNFS.exists(filePath);
      console.log('[HomeScreen] Custom app exists:', fileExists);

      if (!fileExists) {
        let placeholderUri: string;
        if (Platform.OS === 'android') {
          placeholderUri = 'file:///android_asset/webview/placeholder_app.html';
        } else {
          // On iOS, assets linked via react-native.config.js are placed in the main bundle
          placeholderUri = `file://${RNFS.MainBundlePath}/placeholder_app.html`;
        }
        console.log('[HomeScreen] Using placeholder URI:', placeholderUri);
        setLocalUri(placeholderUri);
      } else {
        // (Re-)load the custom app's config so that all native UI elements
        // (tab bar, headers, modals) update to match the app's branding.
        // This triggers a context update → re-render across all consumers.
        await reloadTheme();

        const customAppUri = `file://${filePath}`;
        console.log('[HomeScreen] Using custom app URI:', customAppUri);
        setLocalUri(customAppUri);
      }
    } catch (err) {
      console.warn('[HomeScreen] Failed to setup app URI:', err);
    }
  };

  /**
   * After the initial setup, check whether the server has a newer app bundle.
   * If an update is found, download it silently in the background.
   * The `bundleUpdated` event listener (below) will reload the WebView
   * automatically once the download finishes.
   */
  const checkAndApplyBundleUpdate = async () => {
    try {
      const { SyncService } = await import('../services/SyncService');
      const svc = SyncService.getInstance();

      // If a sync is already running, wait for it first
      if (svc.getIsSyncing()) {
        await svc.waitForSyncComplete();
      }

      const hasUpdate = await svc.checkForUpdates();
      if (hasUpdate) {
        console.log('[HomeScreen] Server has a newer app bundle — downloading…');
        // Use the silent variant so we don't start a foreground service
        // (which can crash if notifee isn't fully configured on first launch).
        await svc.updateAppBundleSilently();
      }
    } catch (err) {
      // Non-fatal — the pre-bundled version continues to work
      console.warn('[HomeScreen] Background bundle update check failed:', err);
    }
  };

  useEffect(() => {
    Promise.resolve().then(async () => {
      await checkAndSetAppUri();
      // After UI is ready, check for a newer bundle from the server
      checkAndApplyBundleUpdate();
    });
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      Promise.resolve().then(() => {
        checkAndSetAppUri();
      });
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const onBundleUpdated: Listener = () => {
      checkAndSetAppUri();
      setWebViewKey(prev => prev + 1);
    };
    appEvents.addListener('bundleUpdated', onBundleUpdated);
    return () => appEvents.removeListener('bundleUpdated', onBundleUpdated);
  }, []);

  useEffect(() => {
    if (localUri) {
      // Defer to avoid synchronous setState in effect
      Promise.resolve().then(() => {
        setIsLoading(false);
      });
    }
  }, [localUri]);

  if (!localUri) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.semantic.info.medium} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={colors.semantic.info.medium}
          style={styles.loading}
        />
      ) : (
        <CustomAppWebView
          key={webViewKey}
          ref={customAppRef}
          appUrl={localUri}
          appName="custom_app"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
