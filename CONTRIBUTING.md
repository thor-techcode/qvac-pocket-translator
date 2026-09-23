# Contributing

## Local development

1. Install dependencies:

   npm install

2. Generate the native Android project if needed:

   npx expo prebuild

3. Connect a physical Android device and run:

   npm run android

4. Verify that translation works for both Spanish and French.

## QVAC

The app uses QVAC SDK 0.19.1 for on-device translation through loadModel() and 	ranslate().

Pull requests should preserve the on-device inference design and should not add a cloud AI backend.
