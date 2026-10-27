const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");
const configureApp = require("../../app.config.js");
const baseConfig = require("../../app.json").expo;

function loadSource(relativePath, mocks = {}) {
  const filename = path.resolve(path.dirname(module.filename), "../..", relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  });
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded.require = (name) => name in mocks ? mocks[name] : module.require(name);
  loaded._compile(compiled.outputText, filename);
  return loaded.exports;
}

test("Android APK does not enable embedded maps when no native key is configured", () => {
  const saved = process.env.GOOGLE_MAPS_API_KEY;
  delete process.env.GOOGLE_MAPS_API_KEY;
  try {
    const config = configureApp({ config: baseConfig });
    assert.equal(config.extra.googleMapsAndroidEnabled, false);
    assert.equal(config.extra.eas.projectId, baseConfig.extra.eas.projectId);
    assert.deepEqual(config.plugins, baseConfig.plugins);
    assert.deepEqual(config.android, baseConfig.android);
  } finally {
    if (saved === undefined) delete process.env.GOOGLE_MAPS_API_KEY;
    else process.env.GOOGLE_MAPS_API_KEY = saved;
  }
});

test("configured key is passed to native config and enables the runtime guard", () => {
  const saved = process.env.GOOGLE_MAPS_API_KEY;
  process.env.GOOGLE_MAPS_API_KEY = "test-key";
  try {
    const config = configureApp({ config: baseConfig });
    assert.equal(config.android.config.googleMaps.apiKey, "test-key");
    assert.equal(config.extra.googleMapsAndroidEnabled, true);
    assert.equal(config.android.package, baseConfig.android.package);
  } finally {
    if (saved === undefined) delete process.env.GOOGLE_MAPS_API_KEY;
    else process.env.GOOGLE_MAPS_API_KEY = saved;
  }
});

function mapsPolicy(platform, environment, enabled) {
  return loadSource("utils/nativeMaps.ts", {
    "react-native": { Platform: { OS: platform } },
    "expo-constants": {
      __esModule: true,
      default: { executionEnvironment: environment, expoConfig: { extra: { googleMapsAndroidEnabled: enabled } } },
      ExecutionEnvironment: { StoreClient: "storeClient" },
    },
  }).canRenderNativeMap;
}

test("standalone Android needs the native key while Expo Go and Apple Maps remain usable", () => {
  assert.equal(mapsPolicy("android", "standalone", false)(), false);
  assert.equal(mapsPolicy("android", "bare", undefined)(), false);
  assert.equal(mapsPolicy("android", "standalone", true)(), true);
  assert.equal(mapsPolicy("android", "storeClient", false)(), true);
  assert.equal(mapsPolicy("ios", "standalone", false)(), true);
  assert.equal(mapsPolicy("web", "storeClient", true)(), false);
});

const NativeMap = "NativeMap";
const Marker = "Marker";
const { hasValidCoordinates } = loadSource("utils/providerDistance.ts");

function renderMap(enabled, overrides = {}) {
  const { ProviderLocationMap } = loadSource("components/molecules/ProviderLocationMap.tsx", {
    "react-native": { View: "View", StyleSheet: { create: (styles) => styles } },
    "react-native-maps": { __esModule: true, default: NativeMap, Marker },
    "@expo/vector-icons": { Ionicons: "Icon" },
    "@/components/atoms/AppText": { AppText: "AppText" },
    "@/theme": { colors: { text: {}, background: {} }, radius: {} },
    "@/utils/nativeMaps": { canRenderNativeMap: () => enabled },
    "@/utils/providerDistance": { hasValidCoordinates },
  });
  return ProviderLocationMap({ latitude: -6.109167, longitude: -38.204444, title: "Lucas Teste", description: "Pau dos Ferros", ...overrides });
}

function containsType(element, type) {
  if (!element || typeof element !== "object") return false;
  if (element.type === type) return true;
  const children = element.props?.children;
  return (Array.isArray(children) ? children : [children]).some((child) => containsType(child, type));
}

test("opening a located provider without a maps key never creates a native map view", () => {
  const tree = renderMap(false);
  assert.ok(tree);
  assert.equal(containsType(tree, NativeMap), false);
  assert.equal(containsType(tree, "AppText"), true);
  assert.equal(containsType(renderMap(true), NativeMap), true);
});

test("invalid coordinates never reach the native map", () => {
  for (const latitude of [null, undefined, NaN, Infinity, 91]) {
    assert.equal(renderMap(true, { latitude }), null);
  }
  assert.equal(renderMap(true, { longitude: -181 }), null);
});
