# Running Formulus on a Physical Android Device (USB)

This guide explains how to run the Formulus app on your **Samsung A14** (or any Android device) connected via USB to your Windows PC, so you can view the app on the phone and see changes live with Fast Refresh.

Based on [React Native: Running On Device](https://reactnative.dev/docs/running-on-device).

---

## Prerequisites

- **Node.js** ≥ 20 (see `formulus/package.json` engines)
- **Android development environment**: Android SDK, and `adb` (Android Debug Bridge) in your PATH  
  - Install via [Android Studio](https://developer.android.com/studio) or [SDK command-line tools](https://developer.android.com/studio#command-tools)  
  - `adb` is included in Android SDK **Platform-Tools**
- **Java 17** (required by the Formulus Android build; see repo CI)

---

## 1. Enable USB debugging on your Samsung A14

1. Open **Settings** → **About phone** → **Software information**.
2. Tap **Build number** **7 times** until you see “Developer mode has been enabled”.
3. Go back to **Settings** → **Developer options**.
4. Turn on **USB debugging**.

---

## 2. Connect the phone and verify ADB

1. Connect the phone to your PC with a **USB cable** (use a data-capable cable).
2. On the phone, if prompted “Allow USB debugging?”, tap **Allow** (and optionally “Always allow from this computer”).
3. In a terminal on your PC, run:

   ```powershell
   adb devices
   ```

   You should see your device with status **`device`** (not `unauthorized` or `offline`).  
   If you see **`unauthorized`**, unlock the phone, tap Allow on the prompt, and run `adb devices` again.

   **Use only one Android device/emulator at a time** when running the app.

---

## 3. Prepare the project (first time or after pulling changes)

From the **repository root** (`ode`):

**3.1 Build Formplayer assets** (required for forms in the app):

```powershell
cd formulus-formplayer
npm ci
npm run build:rn
cd ..
```

This builds the formplayer UI and copies it to `formulus/android/app/src/main/assets/formplayer_dist/`.

**3.2 Install Formulus dependencies and generate scripts** (from repo root):

```powershell
cd formulus
npm ci
npm run generate
cd ..
```

---

## 4. Run Formulus on the device

### Option A: One command (recommended)

From the **formulus** directory, run:

```powershell
cd formulus
.\run-on-device.ps1
```

This script will: check for a device, set up `adb reverse`, start Metro in a new window (if not already running), uninstall any existing app, then build and install the debug app and launch it. **Keep the Metro window open** while you use the app.

### Option B: Manual steps

**4.1 Set up Metro (JavaScript bundler)**  

In one terminal, from the **formulus** directory:

```powershell
cd formulus
npm start
```

Leave this running.

**4.2 Connect the device to the dev server (recommended for USB)**  

In a **second** terminal:

```powershell
adb reverse tcp:8081 tcp:8081
```

This forwards port 8081 from the phone to your PC so the app can load the JS bundle from Metro.  
If you have multiple devices, use: `adb -s <device_id> reverse tcp:8081 tcp:8081` (get `<device_id>` from `adb devices`).

**4.3 Build and run the app on the phone**  

From the **formulus** directory (in the second terminal or a third one):

```powershell
cd formulus
npm run android
```

The first build can take several minutes. When it finishes, the app will install and launch on your Samsung A14.

---

## 5. Development workflow (viewing changes on the phone)

- **Fast Refresh**: With Metro running and `adb reverse` in place, most JS/TS/React changes will reload automatically on the device.
- **Full reload**: On the device, open the **React Native Dev Menu** (e.g. shake the device, or run `adb shell input keyevent 82`), then choose **Reload**.
- **Dev Menu (Windows)**: You can also trigger the dev menu from the PC with **Ctrl + M** when the app is in the foreground (if using an emulator or supported setup).

After editing code, save your files; the app on the phone should update so you can “view how it looks and make changes while viewing directly on the phone.”

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| `adb devices` shows `unauthorized` | Unlock phone, accept “Allow USB debugging” on the device, run `adb devices` again. |
| “bridge configuration isn’t available” or app can’t reach Metro | Run `adb reverse tcp:8081 tcp:8081` and restart the app (or run `npm run android` again). |
| No device in `adb devices` | Try another USB cable/port; ensure USB debugging is on; install/update [USB drivers](https://developer.android.com/studio/run/oem-usb) if needed (Samsung: often [Samsung USB Driver](https://developer.samsung.com/android-usb-driver)). |
| Build errors about `formplayer_dist` or missing assets | From repo root run `cd formulus-formplayer && npm run build:rn && cd ..`, then `cd formulus && npm run android`. |
| Java version errors | Use Java 17 (e.g. set `JAVA_HOME` to a JDK 17 install). |
| **Install fails** (`InstallException` / `ShellCommandUnresponsiveException`) | Build succeeded but install to device timed out. **Keep the phone unlocked and screen on** during install. Retry: `cd formulus && npx react-native run-android --no-packager`, or install the APK manually: `adb install -r android\app\build\outputs\apk\debug\formulus-v1.0-1-debug-*.apk` then open the app on the phone. |

For more general React Native issues, see [React Native – Troubleshooting](https://reactnative.dev/docs/troubleshooting).
