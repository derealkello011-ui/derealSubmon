# Copilot instructions for DerealSubmon

## Start here

- Read `AGENTS.md` and `PROJECT_HANDOFF.md` before making substantive changes. They contain the repository’s current product status, Expo guidance, and route/auth gating expectations.
- Prefer the exact Expo SDK v57 docs for any Expo-specific change: https://docs.expo.dev/versions/v57.0.0/
- This repo is a prototype app, not a production backend system. Static demo data is intentionally used in many places; do not add real credentials or production persistence unless the task explicitly requires it.

## Build, test, and lint commands

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run start
npm run android
npm run ios
npm run web
```

Validate changes:

```bash
npx tsc --noEmit --pretty false
npm run lint
npx expo-doctor
git diff --check
npx expo config --type public
```

Bundle/export checks (use the narrowest relevant one when validating a change):

```bash
npx expo export --platform ios --clear
npx expo export --platform android --clear
npx expo export --platform web --clear
```

If Metro stalls during style processing, isolate the Tailwind compiler:

```bash
npx tailwindcss \
  -i ./src/global.css \
  -o /tmp/tailwind-output.css \
  --config ./tailwind.config.js \
  --content './src/**/*.{js,jsx,ts,tsx}'
```

There is no test script, Jest configuration, or unit-test runner in the repo right now. There is no single-test command to run. For local validation, use TypeScript + lint + the smallest relevant Expo export or config check instead.

## High-level architecture

- The app is an Expo Router project rooted at `src/app`.
- `src/app/_layout.tsx` owns the root stack, loads the custom Plus Jakarta Sans fonts, and keeps the splash screen visible until fonts/auth state are ready.
- `src/app/index.tsx` is the explicit product entry route and should not rely on route-group ordering. Today it redirects based on auth state; when onboarding/auth is implemented, keep that flow explicit instead of depending on file ordering.
- Route groups:
  - `(auth)` contains placeholder sign-in/sign-up screens.
  - `(tabs)` contains the custom tab bar and the home, insights, subscribe, settings, and hidden detail routes.
  - `src/app/(tabs)/_layout.tsx` customizes the bottom tab navigator and should remain consistent with the theme constants.
- Data flow is intentionally simple: static demo records in `src/constants/data.ts` drive most screens, and local UI state (for example, expanded subscription cards) is kept in screen components rather than persisted anywhere.
- Reusable UI sits in `src/components`; shared formatting utilities live in `lib/utils.ts`; static assets and theme values live in `src/constants`.
- The app uses NativeWind + Tailwind CSS 3.4, with `tailwind.config.js` extending theme tokens and font aliases. `metro.config.js` must continue wrapping Expo Metro with `withNativeWind(config, { input: './src/global.css' })`.

## Key conventions specific to this repo

- Use `@/*` for imports from `src`, and keep route layout/screen logic close to the route files that own it.
- Prefer file-based routing and do not assume sibling route groups are ordered to determine the app entry.
- Keep reusable visual patterns in `src/global.css` via `@layer components`, then apply them from React Native components.
- Tailwind must stay on the v3 syntax:
  - keep `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;`
  - do not introduce Tailwind 4 `@import` or `@theme` syntax
  - add custom spacing/radius/colors/font aliases in `tailwind.config.js` before using them in `@apply`
- Font aliases are defined in both the runtime `useFonts` map and `tailwind.config.js`; update both sides together when adding or renaming a font alias.
- Use the shared formatting helpers instead of duplicating date/currency/label logic: `formatCurrency`, `formatSubscriptionDateTime`, `formatStatusLabel`.
- Keep theme constants and Tailwind values synchronized when changing the design system; inline native styles for tab bars and other components should use `src/constants/theme.ts`.
- Treat payment method strings and other “demo” data as fake values. Do not add real credentials, full card numbers, or production data fixtures.
- Keep the splash/font failure behavior intact: the app should not remain stuck on the splash screen if fonts fail to load.
- Do not edit generated output under `dist/` by hand; it is excluded from linting and will be regenerated.
- `app.json` owns Expo app metadata, plugins, fonts, and static web output settings; leave these changes intentional and minimal.
- `babel.config.js` must retain both `babel-preset-expo` and the NativeWind JSX transform. Do not remove the NativeWind setup unless the task is explicitly about testing Metro isolation.
- Before making changes, check `git status` and preserve unrelated edits. Avoid destructive Git actions and do not force-push without permission.

## Important files and boundaries

- `src/constants/data.ts`: demo user, balance, and subscription fixtures.
- `src/constants/theme.ts`: theme constants for colors and component sizing.
- `src/components/*`: reusable cards and list headings.
- `lib/utils.ts`: central formatting utilities.
- `src/global.css`: Tailwind layers and shared component classes.
- `type.d.ts`: global typed demo data and interface contracts.
- `app.json`, `babel.config.js`, `metro.config.js`, `tailwind.config.js`: app/runtime config that should only change with clear product or framework intent.

## Documentation and repo references

- `README.md` is the basic Expo starter documentation and should not be treated as the product source of truth.
- `AGENTS.md` and `PROJECT_HANDOFF.md` contain the current project-specific decisions and debugging history that are more relevant than the template README.
- If the task is auth, onboarding, navigation, or styling, always check the route and config context first because this repo intentionally keeps these concerns centralized and explicit.
