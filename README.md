![Data Access Workgroups](./src/assets/dawg.png)

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Deploy to Production

```sh
git checkout prod
npm run build
gsutil -m rsync -r dist/ gs://moz-fx-data-prot-nonprod-c3a1-protodash/dawg/static/
```

### Use Production Assets in Dev Testing (`workgroup:mozilla-confidential` metadata)

```sh
git checkout prod # or cherry pick this commit into your branch temporarily
gsutil cp gs://moz-fx-data-prot-nonprod-c3a1-protodash/dawg/static/gcpv2_merged.json public/
gsutil cp gs://moz-fx-data-prot-nonprod-c3a1-protodash/dawg/static/gcpv1_enriched.json public/
npm run dev
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
