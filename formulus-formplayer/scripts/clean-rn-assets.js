const fs = require('fs');
const path = require('path');

// Android target directory
const androidTargetDir = path.join(__dirname, '..', '..', 'formulus', 'android', 'app', 'src', 'main', 'assets', 'formplayer_dist');

// iOS target directory
const iosTargetDir = path.join(__dirname, '..', '..', 'formulus', 'ios', 'formplayer_dist');

function cleanOrCreateDirectory(targetDir, name) {
  if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir);
    for (const file of files) {
      const filePath = path.join(targetDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
    console.log(`✓ Cleaned ${name} directory`);
  } else {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`✓ Created ${name} directory`);
  }
}

// Clean Android
cleanOrCreateDirectory(androidTargetDir, 'Android formplayer_dist');

// Clean iOS
cleanOrCreateDirectory(iosTargetDir, 'iOS formplayer_dist');

console.log('✅ Formplayer assets cleaned for both Android and iOS');
