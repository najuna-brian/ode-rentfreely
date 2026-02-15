import { getDefaultConfig, mergeConfig } from '@react-native/metro-config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Monorepo root (parent of formulus) so Metro can resolve @ode/tokens and @ode/components */
const monorepoRoot = path.resolve(__dirname, '..');

/**
 * Force a single React/react-native instance so hooks work (avoids "Invalid hook call" / "useState of null").
 * Without this, @ode/components would use its own node_modules/react and we'd have two React copies.
 */
const projectRoot = __dirname;

/**
 * Force react and react-native to always resolve from the app's node_modules
 * (avoids incomplete copy in packages/components). react-native-svg only uses
 * extraNodeModules so Metro resolves its real entry (lib/commonjs/index.js).
 */
const forcedModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};
const extraModules = {
  ...forcedModules,
  'react-native-svg': path.resolve(
    projectRoot,
    'node_modules/react-native-svg',
  ),
};

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    unstable_enableSymlinks: true,
    unstable_enablePackageExports: true,
    extraNodeModules: extraModules,
    resolveRequest(context, moduleName, platform) {
      if (forcedModules[moduleName]) {
        return {
          type: 'sourceFile',
          filePath: path.join(forcedModules[moduleName], 'index.js'),
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

export default mergeConfig(getDefaultConfig(__dirname), config);
