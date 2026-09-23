# Pocket Translator - QVAC Android

A deliberately small Android app demonstrating **local QVAC inference**.

Type English text, choose Spanish or French, and translate it on the phone using QVAC's **Bergamot** translation engine. There is no cloud AI API in the app.

## Why this design

This project uses translation instead of a local LLM because it is a much smaller and simpler AI workload for a phone. The UI is one screen with just enough interaction to demonstrate a real app.

The project is built for a **physical Android device**. Current QVAC documentation says Android 12+ arm64 is supported, requires Expo, and QVAC does not currently run on Android emulators.

## QVAC requirements covered

- `@qvac/sdk` **0.19.1**
- `loadModel()`
- `translate()`
- `unloadModel()`
- `modelType: "nmt"`
- Bergamot engine
- No cloud inference

## Requirements

- Android 12+
- arm64 Android device
- Node.js compatible with current QVAC/Expo requirements
- npm
- Android development environment / ADB
- USB debugging enabled on the phone

## Install

```bash
npm install
npx expo prebuild
```

## Run on Android

Connect a physical Android phone with USB debugging enabled:

```bash
npx expo run:android --device
```

Or:

```bash
npm run android
```

The first model load downloads the selected translation model. After it is cached, translation is performed locally.

## Important

Do not use Expo Go for the final QVAC build. Use the native development build:

```bash
npx expo run:android --device
```

QVAC's current Expo documentation requires a physical device because its llama.cpp-based mobile path does not run on emulators.

## Project structure

```text
qvac-pocket-translator/
|---- App.tsx
|---- app.json
|---- package.json
|---- qvac.config.json
|---- tsconfig.json
`---- README.md
```

## Notes

The QVAC model is downloaded on first use. The repository itself does not contain model weights, so the GitHub repository stays small.

This project intentionally does not add a backend, account system, analytics, remote AI service, or unnecessary navigation.

