import { existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the directory paths
const scriptsDir = __dirname;
const formplayerDir = join(scriptsDir, '..');
const formulusDir = join(formplayerDir, '..', 'formulus');

// Source and destination paths
const source = join(
  formulusDir,
  'src',
  'webview',
  'FormulusInterfaceDefinition.ts',
);
const dest = join(
  formplayerDir,
  'src',
  'types',
  'FormulusInterfaceDefinition.ts',
);

try {
  // Check if source file exists
  if (!existsSync(source)) {
    console.error(`Error: Source file not found at ${source}`);
    process.exit(1);
  }

  // Ensure destination directory exists
  const destDir = dirname(dest);
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  // Copy the file
  copyFileSync(source, dest);
  console.log(
    `✓ Successfully synced FormulusInterfaceDefinition.ts from formulus to formulus-formplayer`,
  );
} catch (error) {
  console.error(`Error syncing FormulusInterfaceDefinition.ts:`, error.message);
  process.exit(1);
}
