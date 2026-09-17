# NOTICE: Reusable Project-Building Knowledge

This file records lessons learned while building and debugging DerealSubmon. It is intended as starter context for future AI agents and developers working on Expo, React Native, NativeWind, TypeScript, and Git projects.

## Expo SDK discipline

- Always check the exact Expo SDK documentation version before changing Expo configuration or APIs.
- Expo SDK versions are coordinated package families. Avoid independently upgrading Expo packages unless the versions are known to be compatible.
- Use `npx expo-doctor` after dependency or native configuration changes.
- Use `npx expo config --type public` to verify that `app.json` resolves correctly.
- A successful JavaScript check does not prove that a native config plugin was applied; native plugin changes require a new native build.

## Expo Router discipline

- File-based routing does not replace product-level navigation state.
- Sibling route groups such as `(auth)` and `(tabs)` need an explicit root decision.
- Add a deliberate `src/app/index.tsx` or equivalent root gate.
- Do not rely on iOS and Android resolving ambiguous route trees identically.
- Authentication routing should be based on explicit session/onboarding state, not filename order.
- Use `expo-router` entry points rather than importing external React Navigation packages in SDK 56+ application code when Expo Router provides the equivalent.

## NativeWind and Tailwind compatibility

- Verify the installed Tailwind major version before writing stylesheet syntax.
- Tailwind CSS 3 uses:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- Tailwind CSS 4 uses different import/theme syntax. Do not mix the two systems.
- NativeWind’s Metro wrapper can hide Tailwind compilation errors behind a bundle progress bar that appears stuck at 99.9%.
- When Metro stalls during a NativeWind project:

1. Run the Tailwind CLI directly.
2. Look for invalid `@apply` utilities.
3. Check that every custom utility exists in `tailwind.config.js`.
4. Temporarily isolate Metro without NativeWind only as a diagnostic.
5. Restore the NativeWind wrapper after testing.

- Custom classes such as `min-h-50` and `rounded-4xl` are not automatically valid just because similar values exist elsewhere in a project. Define them explicitly.

## Fonts

- Loading a font with `useFonts` only makes an alias available at runtime; it does not automatically create a NativeWind class.
- If using `font-sans-bold`, define the corresponding family in Tailwind/NativeWind configuration.
- Static font files are safer across Android and iOS than variable font files.
- The `expo-font` config plugin embeds fonts in native builds, but a new development build is required after native font configuration changes.
- When using runtime fonts, coordinate splash-screen visibility with font loading.
- Always handle both font success and font failure so the splash screen cannot remain visible forever.

## TypeScript and React Native patterns

- Run TypeScript independently from ESLint. A clean lint result does not imply type correctness.
- Optional method references are a common bug:

```tsx
plan?.trim
```

is a function value, while:

```tsx
plan?.trim()
```

returns the intended string.

- Use platform types correctly. React Native icon colors may be `ColorValue`, not only `string`.
- Avoid duplicate global declarations in `.d.ts` files.
- Prefer explicit shared interfaces for component props and data models.
- Ensure every rendered expression is a React node, not a function accidentally passed into JSX.

## Splash-screen and startup behavior

- If startup depends on fonts or other async resources:

1. Prevent automatic splash hiding.
2. Wait for success or error.
3. Hide the splash screen in either case.
4. Render a controlled fallback or error state if necessary.

- Do not silently leave the app blank forever when an asset fails to load.

## Metro debugging

- `npx expo start` is a long-running process; a command timing out does not necessarily mean Metro failed.
- A progress bar stuck at 99.9% is not proof of a network issue.
- Separate these questions:

1. Did Metro start and bind to a port?
2. Does the bundle endpoint respond?
3. Can the device reach the host?
4. Does the app execute after downloading the bundle?

- Test with localhost when investigating bundler behavior.
- Test with LAN when investigating same-network device access.
- Test with tunnel when investigating router/firewall restrictions.
- If localhost bundle requests hang, LAN and tunnel will not solve the underlying compiler problem.
- Check the actual Metro event log and process state rather than relying only on the terminal progress display.

## Dependency and security hygiene

- Do not run `npm audit fix --force` automatically in an Expo project. It may downgrade or replace coordinated Expo packages and create a larger, less safe failure.
- Distinguish direct vulnerabilities from transitive development/build-tool vulnerabilities.
- Review the dependency tree with `npm ls --depth=0`.
- Keep secrets, tokens, passwords, full payment numbers, and production personal data out of demo fixtures and source control.
- Partial payment labels are still best treated as placeholders and clearly marked as fake.
- Do not add shell scripts that silently delete project files or reset branches.
- Remove stale scripts instead of leaving commands that point to deleted files.
- Never use `eval`, dynamic shell construction, or broad destructive commands in project automation.
- Surface failures explicitly. Avoid broad catches that return success-shaped fallback data.

## Git workflow

- Before pulling or pushing:

```bash
git status --short --branch
git branch -vv
git log --oneline --graph --decorate --all
```

- If local and remote branches diverge, decide explicitly between merge and rebase.
- For a clean, unpublished local commit, rebasing onto the remote branch is often preferable:

```bash
git fetch origin
git rebase origin/dev
git push origin dev
```

- Configure a repository-specific pull strategy once the team agrees:

```bash
git config pull.rebase true
```

- Never discard work with `git reset --hard` or force-push without explicit approval.
- After rebasing, the local commit hash changes. This is expected.

## Validation checklist

For ordinary source changes:

```bash
npx tsc --noEmit --pretty false
npm run lint
git diff --check
```

For Expo/config changes:

```bash
npx expo config --type public
npx expo-doctor
```

For NativeWind changes:

```bash
npx tailwindcss \
  -i ./src/global.css \
  -o /tmp/tailwind-output.css \
  --config ./tailwind.config.js \
  --content './src/**/*.{js,jsx,ts,tsx}'
```

For release-oriented confidence:

```bash
npx expo export --platform ios --clear
npx expo export --platform android --clear
npx expo export --platform web --clear
```

## General AI-agent behavior

- Inspect before editing.
- Preserve dirty worktrees.
- Make surgical changes tied to an observed failure.
- Do not claim a build passed when the process was stopped or timed out.
- Record environment limitations separately from code defects.
- Prefer repository conventions and existing helpers over duplicated new logic.
- Validate the exact requested behavior rather than a nearby proxy.
- When requirements are ambiguous and materially affect architecture, ask before choosing.
- Keep handoff documentation current after significant architectural or tooling changes.
