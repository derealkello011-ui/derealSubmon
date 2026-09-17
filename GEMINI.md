# Gemini Instructional Context - DerealSubmon

Welcome to the **DerealSubmon** codebase! This file serves as a comprehensive, high-context instructional blueprint for all future development, refactoring, and automated agents. It defines the workspace's architecture, technologies, styles, and core constraints.

---

## 1. Project Overview

**DerealSubmon** is a React Native mobile application built on the Expo SDK designed to help users track and manage their recurring subscriptions in a central location.

### Core Features (Active Prototype)
- **Home Dashboard:** High-level balance overview (using GHS currency formatting), next renewal month/day summary, and user avatar display.
- **Upcoming Renewals:** Horizontal carousel showcasing upcoming subscription renewals.
- **Subscription List:** Expandable subscription details showcasing price, billing periods, categories, payment methods, start dates, renewal dates, and status.
- **Authentication & Onboarding:** Scaffolded routes for authentication (Clerk) and onboarding.
- **State:** Currently utilizing static mock/demo data loaded from `src/constants/data.ts`. No persistent local store or API integration is active yet.

### Technology Stack
- **Runtime & Framework:** Expo SDK `57.0.0` (Expo package `~57.0.23`), React `19.2.3`, React Native `0.86.3`
- **Routing:** Expo Router `~57.0.21` (file-based navigation with `src/app` root and typed routes enabled)
- **Authentication:** Clerk Expo SDK (`@clerk/expo` `^4.6.8`)
- **Analytics:** PostHog React Native SDK (`posthog-react-native` `^4.74.0`)
- **Styling & UI:** NativeWind `4.2.7`, Tailwind CSS `3.4.19`, `clsx`, `@expo/vector-icons`
- **Fonts:** Custom Plus Jakarta Sans static fonts loaded dynamically at runtime.
- **Utilities:** `dayjs` for date/time formatting, `Intl.NumberFormat` with `en-GH` locale.

---

## 2. Directory & Route Structure

The repository organizes source files under `src/` and assets under `assets/`.

```text
/
├── assets/                     # Static media and assets
│   ├── fonts/                  # Custom static Plus Jakarta Sans TTF files
│   ├── icons/                  # High-quality icon assets for subscriptions (Figma, Spotify, ChatGPT, etc.)
│   └── images/                 # App icons, splash patterns, and default avatars
├── src/
│   ├── global.css              # NativeWind global utility classes and tailwind declarations
│   ├── app/                    # Expo Router file-based routing root
│   │   ├── _layout.tsx         # Root stack layout, font loading, and splash/loading gate
│   │   ├── index.tsx           # Entry route. Performs an unconditional redirect to /(tabs)
│   │   ├── onboarding.tsx      # Placeholder onboarding route
│   │   ├── (auth)/             # Sibling route group for authentication
│   │   │   ├── _layout.tsx     # Auth stack navigator
│   │   │   ├── sign-in.tsx     # Placeholder sign-in page
│   │   │   └── sign-up.tsx     # Placeholder sign-up page
│   │   └── (tabs)/             # Main tab navigation group
│   │       ├── _layout.tsx     # Bottom-tabs navigator with custom options
│   │       ├── index.tsx       # Home dashboard (main UI, subscription feed)
│   │       ├── insights.tsx    # Placeholder insights dashboard
│   │       ├── subscribe.tsx   # Placeholder subscription management interface
│   │       ├── settings.tsx    # Placeholder settings/profile panel
│   │       └── subscriptions/
│   │           └── [id].tsx    # Subscription detail sub-route (under development)
│   ├── components/             # Reusable UI components
│   │   ├── ListHeading.tsx     # Standard list section heading with a trailing action button
│   │   ├── SubscriptionCard.tsx # Expandable subscription details/pricing container
│   │   └── UpcomingSubscriptionCard.tsx # Compact upcoming renewal card
│   └── constants/              # Asset registries, styles, and data structures
│       ├── data.ts             # Static mock subscriptions and demo balance data
│       ├── icons.ts            # Typed image asset map for native imports
│       ├── images.ts           # App image assets
│       └── theme.ts            # Component sizes, margin patterns, and raw color metrics
└── lib/
    └── utils.ts                # Date formatting (dayjs), capitalization, and currency formatters (en-GH)
```

---

## 3. Building, Running, and Validation

Use the following commands to orchestrate your development environment.

### Development & Execution
- **Install Dependencies:** `npm install`
- **Start Expo Bundler (Clear Cache & LAN):** `npx expo start --clear --lan`
- **Start Expo Bundler (Tunnel for remote devices):** `npx expo start --clear --tunnel`
- **Start on Android:** `npm run android`
- **Start on iOS:** `npm run ios`
- **Start on Web:** `npm run web`

### Verification & Linting
Run these commands sequentially to validate compile-time security and formatting before submitting pull requests:
- **TypeScript Typechecking:** `npx tsc --noEmit --pretty false`
- **ESLint & Static Code Analysis:** `npm run lint` (or `npx expo lint`)
- **Expo Configuration Health Check:** `npx expo-doctor`
- **Check Git Line Endings & Formatting:** `git diff --check`
- **Validate Public Expo Config:** `npx expo config --type public`

### Native Bundle Export Verification
Before publishing, compile-test native bundle builds to make sure the bundling process completes without blocking:
- **Build-test iOS Export:** `npx expo export --platform ios --clear`
- **Build-test Android Export:** `npx expo export --platform android --clear`
- **Build-test Web Export:** `npx expo export --platform web --clear`

---

## 4. Development Conventions & Rules

### Routing Strategy
- **Root Redirect Gate:** Sibling route groups like `(auth)` and `(tabs)` do not guarantee order-of-initialization or native landing pages. Therefore, `src/app/index.tsx` is implemented as an explicit router gate:
  ```tsx
  <Redirect href="/(tabs)" />
  ```
- **Real Auth Integration Strategy:** When integrating real authentication (via Clerk), this unconditional redirect must be replaced with a programmatic routing gate:
  1. If first-launch is active and onboarding is incomplete: Redirect to `/onboarding`.
  2. If onboarding is complete but user is unauthenticated: Redirect to `/(auth)/sign-in`.
  3. If user is authenticated: Redirect to `/(tabs)`.
- Never rely on default filesystem ordering to choose between sibling route groups.

### Styling & Tailwind CSS Conventions
- **Tailwind v3 Only:** This workspace uses Tailwind CSS `3.4.19`. **Do not use Tailwind v4 constructs** (like `@theme { ... }` or `@import "tailwindcss/theme.css"`). Using Tailwind v4 syntax will cause NativeWind's Metro worker to fail silently.
- **Custom Utilities:** Custom colors, margins, spacing, and font-families belong inside `tailwind.config.js`.
- **Preventing Metro Stalls (99.9%):** Applying arbitrary Tailwind classes inside `@apply` directives that are not mapped in `tailwind.config.js` (e.g., `min-h-50` or custom `4xl` radii) can cause Metro to hang indefinitely at 99.9%. Always ensure custom classes are explicitly extended inside `tailwind.config.js` and successfully compiler-tested using:
  ```bash
  npx tailwindcss -i ./src/global.css -o /tmp/tailwind-output.css --config ./tailwind.config.js --content './src/**/*.{js,jsx,ts,tsx}'
  ```

### Custom Typography Loading
- **Font Registering:** Only the static files of the **Plus Jakarta Sans** font under `assets/fonts/Plus_Jakarta_Sans/static/` are used. Variable fonts are intentionally ignored due to cross-platform compatibility warnings in Expo.
- **Font Aliases:** Custom font classes are registered in `tailwind.config.js` and referenced as:
  - `font-sans-light`
  - `font-sans-regular`
  - `font-sans-medium`
  - `font-sans-semibold`
  - `font-sans-bold`
  - `font-sans-extrabold`
  - `font-sans-italic`
- **Asset Loading Gate:** The `src/app/_layout.tsx` file controls asset rendering. It guarantees that the splash screen remains visible via `SplashScreen.preventAutoHideAsync()` until both the fonts and Clerk's auth state are fully initialized:
  ```tsx
  useEffect(() => {
    if (fontsReady && authLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [authLoaded, fontsReady]);
  ```

### Data Formatting Constraints
- All currency calculations must be passed through the `formatCurrency` helper in `lib/utils.ts`. It formats values to exactly **two decimal places** under the `en-GH` locale.
- Date fields should utilize `dayjs` and the `formatSubscriptionDateTime` helper, resolving to a standard `DD/MM/YYYY` format, and fall back to `"Not provided"` if invalid or absent.

---

## 5. Known Gaps & Next Steps

This project is in active development and features several incomplete paths:
1. **No Storage Persistence:** Subscriptions and user profiles are lost on reload. A persistence layer (e.g., `expo-secure-store`, SQLite, or custom backend synchronization) is required.
2. **Missing CRUD Features:** Subscription addition, cancellation UI, item edits, and deletions are currently non-functional.
3. **Mock Data Realignment:** The demo subscription dates in `src/constants/data.ts` currently point to old dates (March/April 2026), which might cause renewal calculations to show expired flags depending on the current actual date.
4. **No Automated Testing:** No unit, integration, or E2E tests are configured. When implementing testing, configure Jest using Expo's guidelines.
