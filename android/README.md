# Mesa Chess for Android

This folder contains a native Android WebView wrapper for the Mesa Chess browser app.

## Build

Requirements: JDK 17, Android SDK platform 35, Android Build Tools 35.0.0, and Gradle 8.9.

From this folder:

```bash
gradle --no-daemon :app:assembleDebug
```

APK output:

```
app/build/outputs/apk/debug/app-debug.apk
```

The GitHub Actions workflow at `.github/workflows/build-android-apk.yml` builds the debug APK on pushes to the Mesa Chess feature branch and pull requests targeting `master`. Download the **Mesa-Chess-APK** artifact from the workflow run.

The app bundles the web interface locally. Internet access is used to load the chess.js rules engine and hosted fonts.
