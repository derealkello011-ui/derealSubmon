# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# DerealSubmon Project Handoff

## Purpose

DerealSubmon is a React Native mobile application for tracking recurring subscriptions. The current product direction includes:

- A home dashboard with a balance summary.
- Upcoming subscription renewals.
- A list of all subscriptions.
- Subscription expansion/details.
- Planned authentication and onboarding.
- Planned insights, settings, and subscription-management features.

The project is still an active prototype. Several screens and flows are scaffolded but not yet connected to real authentication, persistence, backend APIs, or production data.

## Repository and branch state

- Repository: `https://github.com/derealkello011-ui/derealSubmon`
- Active branch: `dev`
- Remote tracking branch: `origin/dev`
- Current branch is synchronized with `origin/dev`.
- The previous divergence was resolved by rebasing the local work onto the remote branch and pushing the rebased commit.
- This repository is configured with:

```bash
git config pull.rebase true
```

For future pulls, prefer:

```bash
git pull
```

If a rebase conflict occurs:

```bash
git status
# Resolve the conflicted files.
git add <resolved-files>
git rebase --continue
git push
```

Do not use `git reset --hard`, force-push, or discard work without explicit confirmation.

## Technology stack

### Runtime and framework

- Expo SDK `57.0.0`
- Expo package `~57.0.23`
- React `19.2.3`
- React Native `0.86.3`
- TypeScript `~6.0.3`
- Expo Router `~57.0.21`
- React Native Web `~0.21.0`
- Node currently used in the development environment: `v24.15.0`

Node 24 currently works for the validated commands, but Node 20 or Node 22 LTS is the safer long-term choice for React Native tooling if Metro becomes unstable.

### Styling and UI

- NativeWind `4.2.7`
- Tailwind CSS `3.4.19`
- `clsx`
- `@expo/vector-icons`
- `expo-image`
- Custom Plus Jakarta Sans static font files
- Theme constants in `src/constants/theme.ts`
- NativeWind classes and reusable component classes in `src/global.css`

### Utilities

- `dayjs` for date formatting.
- `Intl.NumberFormat` using the `en-GH` locale for currency formatting.

## Important project configuration

### `package.json`

Entry point:

```json
"main": "expo-router/entry"
```

Scripts:

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
```

The old `reset-project` script was removed because its referenced `scripts/reset-project.js` file had been deleted. Do not reintroduce a reset script unless it is intentionally implemented and documented.

### Expo configuration

`app.json` includes:

- Expo Router config plugin.
- `expo-font` config plugin.
- `expo-splash-screen` config plugin.
- Portrait orientation.
- Automatic light/dark UI mode.
- Typed routes.
- React Compiler.
- Static web output using Metro.
- App scheme: `derealsubmon`.

The Plus Jakarta Sans static files are registered for Android and iOS. The variable font files are intentionally not registered because Expo documentation warns that variable fonts are not consistently supported across native platforms.

The font files live under:

```text
assets/fonts/Plus_Jakarta_Sans/static/
```

### Root font loading

`src/app/_layout.tsx` loads these runtime aliases:

```text
sans-regular
sans-bold
sans-medium
sans-semibold
sans-extrabold
sans-light
sans-italic
```

The root layout prevents the splash screen from hiding before fonts are ready and hides it after either successful loading or a font error. This prevents the app from remaining indefinitely on the splash screen if a font fails.

### Babel and Metro

`babel.config.js` uses:

- `babel-preset-expo`
- NativeWind JSX transform

`metro.config.js` wraps Expo’s default Metro config with:

```js
withNativeWind(config, { input: "./src/global.css" });
```

Do not remove the NativeWind wrapper unless intentionally testing Metro isolation. NativeWind is required for the current class-based styling setup.

## Route structure

Expo Router uses `src/app` as the route root.

```text
src/app/_layout.tsx                 Root stack, font loading, splash handling
src/app/index.tsx                   Redirects to /(tabs)
src/app/onboarding.tsx              Placeholder onboarding screen

src/app/(auth)/_layout.tsx          Auth stack
src/app/(auth)/sign-in.tsx          Placeholder sign-in screen
src/app/(auth)/sign-up.tsx          Placeholder sign-up screen

src/app/(tabs)/_layout.tsx          Custom bottom tab navigator
src/app/(tabs)/index.tsx            Home dashboard
src/app/(tabs)/insights.tsx         Placeholder insights screen
src/app/(tabs)/subscribe.tsx        Placeholder subscription screen
src/app/(tabs)/settings.tsx         Placeholder settings screen
src/app/(tabs)/subscriptions/[id].tsx
                                     Subscription detail placeholder
```

The explicit `src/app/index.tsx` was added because sibling route groups such as `(auth)` and `(tabs)` do not provide a reliable product-level initial route by themselves. The current root behavior always redirects to tabs:

```tsx
<Redirect href="/(tabs)" />
```

When real authentication is introduced, replace this unconditional redirect with a deliberate state gate:

1. First launch and onboarding incomplete: onboarding.
2. Onboarding complete but unauthenticated: sign-in.
3. Authenticated: tabs.

Do not rely on filesystem ordering or platform behavior to choose between route groups.

## Source organization

### `src/constants`

- `data.ts`: static demo user, balance, upcoming subscriptions, and subscription records.
- `icons.ts`: typed image asset registry.
- `images.ts`: image asset registry for avatar and splash pattern.
- `theme.ts`: colors, spacing, and component sizing constants.

### `src/components`

- `ListHeading.tsx`: section heading and “View all” action.
- `SubscriptionCard.tsx`: expandable subscription card with price, billing, metadata, and detail rows.
- `UpcomingSubscriptionCard.tsx`: upcoming renewal card.

### `lib/utils.ts`

Exports:

- `formatCurrency(value, currency)`
  - Uses `en-GH`.
  - Uses exactly two decimal places.
  - Falls back to a safe text format if the value or currency is invalid.
- `formatSubscriptionDateTime(value?)`
  - Uses `dayjs`.
  - Returns `DD/MM/YYYY`.
  - Returns `"Not provided"` for missing or invalid values.
- `formatStatusLabel(value?)`
  - Capitalizes the first character.
  - Returns `"Unknown"` when absent.

## Home dashboard behavior

`src/app/(tabs)/index.tsx` currently:

- Loads static demo data.
- Shows the user avatar and name.
- Shows the formatted GHS balance.
- Shows the next renewal month/day.
- Renders horizontal upcoming subscription cards.
- Renders an expandable subscription list.
- Tracks the expanded subscription ID locally with React state.
- Uses `FlatList` for the main subscription list.
- Uses NativeWind component classes from `src/global.css`.

Current data is local only. No persistence or API integration exists.

## NativeWind and Tailwind rules

This project uses Tailwind CSS `3.4.19`, not Tailwind CSS 4.

The stylesheet must begin with the Tailwind 3 directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Custom colors, spacing, border radii, and font families belong in `tailwind.config.js`.

Do not use Tailwind 4-only constructs such as:

```css
@import "tailwindcss/theme.css";
@theme { ... }
```

Those constructs caused NativeWind’s Metro worker to fail silently during bundling.

Custom utility values used by `@apply` must be defined in `tailwind.config.js`. For example:

- `min-h-50` requires `spacing.50`.
- `rounded-bl-4xl` and `rounded-tr-4xl` require `borderRadius.4xl`.

An invalid `@apply` utility can make Metro appear stuck at 99.9% instead of presenting a clear CSS error.

## Known debugging history

### Android opened sign-in while iOS opened tabs

Cause: there was no explicit root route while `(auth)` and `(tabs)` existed as sibling route groups.

Fix: add `src/app/index.tsx` and redirect deliberately.

### Fonts were not visually applied

Cause: runtime font aliases were loaded but not defined in NativeWind/Tailwind configuration.

Fix: register aliases in `tailwind.config.js` and use classes such as:

```tsx
font - sans - bold;
font - sans - semibold;
```

### Metro stalled at 99.9%

Cause: invalid Tailwind utilities in `@apply`, especially `min-h-50` and custom `4xl` radii.

Fix: define those values in `tailwind.config.js`.

The failure was confirmed by running Tailwind directly and then confirmed fixed when:

- Tailwind generated CSS successfully.
- iOS export completed.
- Expo Doctor passed all checks.

### Git pull failed with divergent branches

Cause: local `dev` had one unpushed commit while `origin/dev` had three additional commits.

Fix:

```bash
git rebase origin/dev
git push origin dev
git config pull.rebase true
```

## Validation commands

Run these after code or configuration changes:

```bash
npx tsc --noEmit --pretty false
npm run lint
npx expo-doctor
git diff --check
npx expo config --type public
```

For a native bundle check:

```bash
npx expo export --platform ios --clear
npx expo export --platform android --clear
```

For web:

```bash
npx expo export --platform web --clear
```

Start development:

```bash
npx expo start --clear --lan
```

If the device cannot reach the machine over LAN:

```bash
npx expo start --clear --tunnel
```

If bundling appears stuck, test the CSS compiler directly:

```bash
npx tailwindcss \
  -i ./src/global.css \
  -o /tmp/tailwind-output.css \
  --config ./tailwind.config.js \
  --content './src/**/*.{js,jsx,ts,tsx}'
```

## Current limitations and next work

### Product functionality

- Authentication is not implemented.
- Onboarding is not implemented.
- There is no auth/session persistence.
- Subscription data is static demo data.
- There is no backend or database.
- Subscription creation/editing/deletion is not implemented.
- Cancellation UI is not implemented.
- Insights are not implemented.
- Settings are not implemented.
- Detail-route navigation is not fully wired from the list.
- No automated unit or component tests exist.

### Data correctness

The demo dates currently use March/April 2026 while the current project date is later in 2026. Some labels may therefore be stale or appear already expired. Replace demo data with intentionally relative fixtures or a real data source before building date-sensitive features.

Partial payment labels such as `"Visa ending in 8530"` are demo values. Replace them with obviously fake placeholders before production use and never store full payment credentials.

### Dependency audit

The production dependency audit previously reported 14 moderate transitive vulnerabilities involving Expo CLI/configuration packages, `query-string`, `decode-uri-component`, `uuid`, and `xcode`. There were no high or critical findings.

Do not run `npm audit fix --force` blindly. npm indicated that it could install breaking Expo versions. Use Expo-compatible upgrades and re-run Expo Doctor instead.

## Agent operating rules

Before changing this project:

1. Read `AGENTS.md`.
2. Follow the exact Expo SDK v57 documentation for Expo-related changes.
3. Check `git status` and preserve unrelated user changes.
4. Inspect the route/config context before editing.
5. Run the smallest relevant validation, then escalate to Expo Doctor or a bundle export.
6. Do not infer auth behavior from route-group ordering.
7. Do not mix Tailwind CSS 3 and Tailwind CSS 4 syntax.
8. Do not use destructive Git commands without explicit approval.
9. Do not commit secrets or real payment information.
10. Report unresolved environment failures separately from source-code failures.
