import { OutputAsset, OutputChunk, rollup, RollupOptions, RollupOutput } from "rollup";
import { ChromeExtensionManifest } from "../src/manifest.v2";
import { byFileName, requireExtFile } from "../__fixtures__/utils";

let outputPromise: Promise<RollupOutput>;
beforeAll(async () => {
  const config = requireExtFile<RollupOptions>(__filename, "rollup.config.js");
  outputPromise = rollup(config).then((bundle) => bundle.generate(config.output as any));
  return outputPromise;
}, 15000);

test("Handles config with input array", async () => {
  const { output } = await outputPromise;

  const manifestAsset = output.find(byFileName("manifest.json")) as OutputAsset;
  const manifestSource = manifestAsset.source as string;
  const manifest = JSON.parse(manifestSource) as ChromeExtensionManifest;

  expect(manifest).toBeDefined();
  expect(manifest.background).toBeDefined();
  expect(manifest.background?.scripts).toContainEqual(expect.stringMatching(/background.+?\.js$/));
  expect(manifestSource).not.toMatch(/index.+?\.html$/);
  expect(manifestSource).not.toMatch(/index.+?\.js$/);

  const indexHtmlAsset = output.find(byFileName("index.html")) as OutputAsset;
  const indexHtmlSource = indexHtmlAsset.source as string;
  expect(indexHtmlSource).toMatch("<title>Index Array</title>");
  expect(indexHtmlSource).toMatch('src="index.js"');

  const indexJsChunk = output.find(byFileName("index.js")) as OutputChunk;
  const indexJsSource = indexJsChunk.code;
  expect(indexJsSource).toMatch("console.log('index.js')");

  const backgroundJsChunk = output.find(byFileName("background.js")) as OutputChunk;
  const backgroundJsSource = backgroundJsChunk.code;
  expect(backgroundJsSource).toMatch("console.log('background.js')");
  expect(backgroundJsSource).toMatch("chrome.runtime.getURL('index.html')");
});
