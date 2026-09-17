# Copilot instructions for DerealSubmon

## Project overview

DerealSubmon is an Expo SDK 57 / React Native 0.86 mobile app for tracking recurring subscriptions. It is currently a UI prototype: subscription data is static, authentication and onboarding are placeholders, and there is no persistence, backend, or database.

The app uses:

- Expo Router with `src/app` as the route root and typed routes enabled.
- React 19, TypeScript in strict mode, and the `@/*` alias for `src/*`.
- NativeWind 4 with Tailwind CSS 3.4; styling is primarily through `className`.
- Plus Jakarta Sans static font files loaded in the root layout.
- `dayjs` for dates and `Intl.NumberFormat("en-GH")` for GHS currency formatting.
- Clerk Expo and SecureStore dependencies reserved for the planned authentication flow.

Read `AGENTS.md` before making changes. For Expo-related work, use the exact Expo SDK v57 documentation at <https://docs.expo.dev/versions/v57.0.0/>. `PROJECT_HANDOFF.md` contains the fuller product and debugging history.

## Build, run, lint, and validation commands

Install dependencies:

```bash
npm install
```

Start development:

```bash
npm run start
npm run android
npm run ios
npm run web
```

Useful validation commands:

```bash
npx tsc --noEmit --pretty false
npm run lint
npx expo-doctor
git diff --check
npx expo config --type public
```

Create production-style bundles:

```bash
npx expo export --platform ios --clear
npx expo export --platform android --clear
npx expo export --platform web --clear
```

If Metro appears stuck while processing styles, isolate the Tailwind compiler:

```bash
npx tailwindcss \
  -i ./src/global.css \
  -o /tmp/tailwind-output.css \
  --config ./tailwind.config.js \
  --content './src/**/*.{js,jsx,ts,tsx}'
```

There is no test script, Jest configuration, or automated test suite currently. Consequently, there is no single-test command; validate focused changes with TypeScript, lint, and the narrowest applicable Expo export.

## Architecture and route flow

`src/app/_layout.tsx` is the root stack. It loads the registered static fonts, keeps the splash screen visible until fonts load or fail, then renders the router stack.

`src/app/index.tsx` is the explicit product entry route and currently redirects to `/(tabs)`. Do not rely on the ordering of sibling route groups. When authentication is implemented, replace this unconditional redirect with an explicit state gate:

1. Incomplete onboarding -> `/onboarding`
2. Complete onboarding and unauthenticated -> `/(auth)/sign-in`
3. Authenticated -> `/(tabs)`

The `(auth)` group currently contains placeholder sign-in and sign-up screens. The `(tabs)` group contains the custom bottom tab layout plus home, insights, subscribe, settings, and the hidden detail route `subscriptions/[id]`.

The home screen (`src/app/(tabs)/index.tsx`) composes the dashboard from static constants in `src/constants/data.ts`. It formats the balance, renders horizontal upcoming-renewal cards, and renders an expandable `FlatList` of subscription cards. Expansion is local React state keyed by subscription ID; no data is persisted.

Reusable UI lives in `src/components`. Shared display formatting belongs in `lib/utils.ts`. Static asset registries and demo data belong in `src/constants` (`icons.ts`, `images.ts`, `data.ts`, and `theme.ts`).

## Repository-specific conventions

- Use Expo Router file-based routes under `src/app`; keep route layouts and screen options close to their route group.
- Prefer the existing `@/*` alias for imports from `src`; use relative imports only where the surrounding file already follows that pattern.
- Keep reusable visual patterns in `src/global.css` as `@layer components` classes, then use those classes from React Native components.
- This repository uses Tailwind CSS 3 syntax:
  - Keep `@tailwind base`, `@tailwind components`, and `@tailwind utilities`.
  - Do not introduce Tailwind 4 `@import` or `@theme` syntax.
  - Add custom spacing, radii, colors, or font aliases to `tailwind.config.js` before using them in `@apply`.
  - `metro.config.js` must continue wrapping Expo Metro with `withNativeWind(config, { input: "./src/global.css" })`.
- Font aliases such as `font-sans-bold` are defined both in the root `useFonts` map and in `tailwind.config.js`; update both sides when adding an alias.
- Use the shared theme constants in `src/constants/theme.ts` for inline native styles such as the custom tab bar. Keep Tailwind color values and theme constants synchronized when changing the design system.
- Use `formatCurrency`, `formatSubscriptionDateTime`, and `formatStatusLabel` instead of duplicating formatting logic. Currency formatting is intentionally `en-GH` with two decimal places; invalid values have a safe fallback.
- The app uses static demo records with ISO date strings and typed global data shapes from `type.d.ts`. Treat payment-method strings as fake demo data and never add real credentials.
- Keep the existing splash/font failure behavior: the splash screen must not remain indefinitely if font loading fails.
- Avoid broad error swallowing or silent success fallbacks. Preserve the repository’s explicit safe formatting fallbacks and surface new failures consistently.
- The current demo dates may be stale relative to the current date. Date-sensitive features should use deliberate relative fixtures or real data rather than assuming the demo dates are current.

## Configuration and change boundaries

- `app.json` owns Expo plugins, app scheme, fonts, splash screen, typed routes, React Compiler, and static Metro web output.
- `babel.config.js` must retain both `babel-preset-expo` with `jsxImportSource: "nativewind"` and `nativewind/babel`.
- `eslint.config.js` extends the Expo flat config and ignores `dist/*`.
- `dist/` is generated output and is excluded from linting; do not hand-edit it.
- The old `reset-project` script was removed because its implementation no longer exists. Do not restore it unless the script is implemented and documented.
- Check `git status` before editing and preserve unrelated user changes. Do not use destructive Git commands or force-push without explicit approval.
