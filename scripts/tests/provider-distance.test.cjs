const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

const sourcePath = path.resolve(path.dirname(module.filename), "../../utils/providerDistance.ts");
const compiled = ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});
const distanceModule = new Module(sourcePath, module);
distanceModule.filename = sourcePath;
distanceModule.paths = Module._nodeModulePaths(path.dirname(sourcePath));
distanceModule._compile(compiled.outputText, sourcePath);
const { getProviderDistanceKm, formatProviderDistance } = distanceModule.exports;

const origin = { latitude: 0, longitude: 0 };
const publicProvider = {
  latitude: 0.001,
  longitude: 0,
  show_location_on_map: true,
};

test("returns distance in kilometers for valid public coordinates", () => {
  const distance = getProviderDistanceKm(publicProvider, origin);
  assert.ok(distance > 0.1 && distance < 0.12);
});

test("supports zero coordinates and coincident locations", () => {
  assert.equal(getProviderDistanceKm({ ...origin, show_location_on_map: true }, origin), 0);
  assert.equal(formatProviderDistance(0), "Aprox. 0 m de voc\u00ea");
});

test("does not calculate without the user location or public provider location", () => {
  assert.equal(getProviderDistanceKm(publicProvider, null), null);
  assert.equal(getProviderDistanceKm({ ...publicProvider, show_location_on_map: false }, origin), null);
  assert.equal(getProviderDistanceKm({ ...publicProvider, show_location_on_map: undefined }, origin), null);
});

test("does not invent distances for missing or invalid coordinates", () => {
  for (const latitude of [null, undefined, NaN, Infinity, 91]) {
    assert.equal(getProviderDistanceKm({ ...publicProvider, latitude }, origin), null);
  }
  assert.equal(getProviderDistanceKm({ ...publicProvider, longitude: 181 }, origin), null);
  assert.equal(getProviderDistanceKm(publicProvider, { latitude: NaN, longitude: 0 }), null);
});

test("uses meters nearby and decimal-comma kilometers otherwise", () => {
  assert.equal(formatProviderDistance(0.35), "Aprox. 350 m de voc\u00ea");
  assert.equal(formatProviderDistance(2.3), "Aprox. 2,3 km de voc\u00ea");
});

test("does not display missing or invalid distance values", () => {
  for (const distance of [null, undefined, NaN, Infinity, -1]) {
    assert.equal(formatProviderDistance(distance), null);
  }
});
