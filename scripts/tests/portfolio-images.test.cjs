const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const ts = require("typescript");

function compile(relativePath) {
  const filename = path.resolve(__dirname, "../..", relativePath);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  return { filename, code: output.outputText };
}

const helper = compile("utils/portfolioImages.ts");
const helperModule = new Module(helper.filename, module);
helperModule.filename = helper.filename;
helperModule.paths = Module._nodeModulePaths(path.dirname(helper.filename));
helperModule._compile(helper.code, helper.filename);
const {
  MAX_PORTFOLIO_IMAGES,
  appendPortfolioImages,
  getPortfolioImageChanges,
  getPortfolioImageUris,
} = helperModule.exports;

test("uses every gallery image in its existing order", () => {
  assert.deepEqual(getPortfolioImageUris({
    image: "legacy.jpg",
    images: [
      { id: 4, image: "first.jpg", position: 0 },
      { id: 8, image: "second.jpg", position: 1 },
    ],
  }), ["first.jpg", "second.jpg"]);
});

test("keeps legacy single-image posts visible and handles empty posts", () => {
  assert.deepEqual(getPortfolioImageUris({ image: "legacy.jpg" }), ["legacy.jpg"]);
  assert.deepEqual(getPortfolioImageUris({ image: null, images: [] }), []);
});

test("adding photos preserves existing IDs, order, and browser file objects", () => {
  const current = [{ id: 3, uri: "existing.jpg" }];
  const file = { name: "new.jpg" };
  const added = { uri: "blob:new", file };
  const images = appendPortfolioImages(current, [added]);
  assert.deepEqual(images, [...current, added]);
  assert.equal(images[1].file, file);
  assert.equal(current.length, 1);
});

test("selection does not duplicate a photo or exceed ten photos", () => {
  const current = [{ id: 3, uri: "existing.jpg" }];
  const selected = [{ uri: "existing.jpg" }, { uri: "new.jpg" }, { uri: "new.jpg" }];
  assert.deepEqual(appendPortfolioImages(current, selected), [...current, { uri: "new.jpg" }]);
  const many = Array.from({ length: 20 }, (_, index) => ({ uri: `${index}.jpg` }));
  assert.equal(appendPortfolioImages(current, many).length, MAX_PORTFOLIO_IMAGES);
});

test("separates retained IDs from new uploads instead of reuploading remote photos", () => {
  const newImage = { uri: "file:new.jpg" };
  assert.deepEqual(getPortfolioImageChanges([
    { id: 9, uri: "https://example.test/nine.jpg" },
    { id: 2, uri: "https://example.test/two.jpg" },
    newImage,
  ]), { retainedImageIds: [9, 2], newImages: [newImage] });
});

test("removal omits the photo ID and removing everything sends an empty retention list", () => {
  const images = [{ id: 1, uri: "one.jpg" }, { id: 2, uri: "two.jpg" }];
  assert.deepEqual(getPortfolioImageChanges(images.filter((image) => image.id !== 1)), {
    retainedImageIds: [2], newImages: [],
  });
  assert.deepEqual(getPortfolioImageChanges([]), { retainedImageIds: [], newImages: [] });
});

function createServiceHarness() {
  const requests = [];
  const openedFiles = [];
  class TestFormData {
    fields = [];
    append(...args) { this.fields.push(args); }
  }
  class LocalFile {
    constructor(uri) {
      openedFiles.push(uri);
      this.uri = uri;
      this.name = "local.jpg";
    }
  }
  const compiled = compile("services/portfolio.service.ts");
  const serviceModule = { exports: {} };
  const response = { id: 1, provider: 2, title: "Title", description: "Description", image: "/one.jpg", images: [{ id: 7, image: "/one.jpg", position: 0 }], created_at: "2026-10-15" };
  const imports = {
    "@/utils/authStorage": { getRequiredAccessToken: async () => "token" },
    "@/utils/portfolioImages": helperModule.exports,
    "expo-file-system": { File: LocalFile },
    "./mediaUrl": { normalizeRemoteImageUrl: (uri) => uri ? `https://api.test${uri}` : null },
    "./api": {
      apiUpload: async (...args) => { requests.push(args); return response; },
      api: async () => [response],
      apiDelete: async () => {},
    },
  };
  vm.runInNewContext(compiled.code, {
    exports: serviceModule.exports,
    module: serviceModule,
    FormData: TestFormData,
    require: (name) => {
      assert.ok(name in imports, `Unexpected import: ${name}`);
      return imports[name];
    },
  }, { filename: compiled.filename });
  return { service: serviceModule.exports, requests, openedFiles };
}

test("creation repeats uploaded_images and includes the empty JSON retention list", async () => {
  const { service, requests, openedFiles } = createServiceHarness();
  const browserFile = { name: "browser.png" };
  const item = await service.createPortfolioItem(2, {
    title: " Title ", description: " Description ",
    images: [{ uri: "file:local.jpg" }, { uri: "blob:browser", file: browserFile }],
  });
  const [endpoint, data, options] = requests[0];
  assert.equal(endpoint, "/providers/2/portfolios/");
  assert.equal(options.accessToken, "token");
  assert.deepEqual(data.fields.filter(([key]) => key === "retained_image_ids"), [["retained_image_ids", "[]"]]);
  const files = data.fields.filter(([key]) => key === "uploaded_images");
  assert.equal(files.length, 2);
  assert.equal(files[1][1], browserFile);
  assert.deepEqual(openedFiles, ["file:local.jpg"]);
  assert.equal(item.images[0].image, "https://api.test/one.jpg");
  assert.equal(data.fields[0][1], "Title");
});

test("editing retained photos sends IDs and never opens remote URLs as files", async () => {
  const { service, requests, openedFiles } = createServiceHarness();
  await service.updatePortfolioItem(2, 1, {
    title: "Title", description: "Description",
    images: [{ id: 7, uri: "https://api.test/one.jpg" }],
  });
  const [, data, options] = requests[0];
  assert.equal(options.method, "PATCH");
  assert.equal(data.fields.find(([key]) => key === "retained_image_ids")[1], "[7]");
  assert.equal(data.fields.filter(([key]) => key === "uploaded_images").length, 0);
  assert.deepEqual(openedFiles, []);
});

test("service rejects too many photos before making an upload request", async () => {
  const { service, requests } = createServiceHarness();
  await assert.rejects(service.createPortfolioItem(2, {
    title: "Title", description: "Description",
    images: Array.from({ length: MAX_PORTFOLIO_IMAGES + 1 }, (_, index) => ({ uri: `${index}.jpg` })),
  }), /10/);
  assert.equal(requests.length, 0);
});
