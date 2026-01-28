import {
  existsSync,
  readdirSync,
  statSync,
  rmSync,
  unlinkSync,
  mkdirSync,
} from 'fs';
import { join } from 'path';

// Android target directory
const androidTargetDir = join(
  __dirname,
  '..',
  '..',
  'formulus',
  'android',
  'app',
  'src',
  'main',
  'assets',
  'formplayer_dist',
);

// iOS target directory
const iosTargetDir = join(
  __dirname,
  '..',
  '..',
  'formulus',
  'ios',
  'formplayer_dist',
);

function cleanOrCreateDirectory(targetDir, name) {
  if (existsSync(targetDir)) {
    const files = readdirSync(targetDir);
    for (const file of files) {
      const filePath = join(targetDir, file);
      const stat = statSync(filePath);
      if (stat.isDirectory()) {
        rmSync(filePath, { recursive: true, force: true });
      } else {
        unlinkSync(filePath);
      }
    }
    console.log(`✓ Cleaned ${name} directory`);
  } else {
    mkdirSync(targetDir, { recursive: true });
    console.log(`✓ Created ${name} directory`);
  }
}

// Clean Android
cleanOrCreateDirectory(androidTargetDir, 'Android formplayer_dist');

// Clean iOS
cleanOrCreateDirectory(iosTargetDir, 'iOS formplayer_dist');

console.log('✅ Formplayer assets cleaned for both Android and iOS');
