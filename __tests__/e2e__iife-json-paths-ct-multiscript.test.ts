import { byFileName, requireExtFile } from "../__fixtures__/utils";
import { rollup, RollupOutput, OutputAsset } from "rollup";
import { ChromeExtensionManifest } from "../src/manifest.v2";
import { RollupOptions } from "rollup";
import { OutputChunk } from "rollup";

const config = requireExtFile<RollupOptions>(__filename, "rollup.config.js");

let outputPromise: Promise<RollupOutput>;
beforeAll(async () => {
  outputPromise = rollup(config).then((bundle) => bundle.generate(config.output as any));
  return outputPromise;
}, 15000);

test("bundles multiple content scripts as iife", async () => {
  const { output } = await outputPromise;

  const content1Js = output.find(byFileName("content1.js")) as OutputChunk;
  const content2Js = output.find(byFileName("content2.js")) as OutputChunk;
  const manifestJson = output.find(byFileName("manifest.json")) as OutputAsset;

  expect(content1Js).toBeDefined();
  expect(content1Js).toMatchObject({
    code: expect.any(String),
    fileName: "content1.js",
    type: "chunk",
  });

  expect(content2Js).toBeDefined();
  expect(content2Js).toMatchObject({
    code: expect.any(String),
    fileName: "content2.js",
    type: "chunk",
  });

  expect(manifestJson).toBeDefined();
  expect(manifestJson).toMatchObject({
    source: expect.any(String),
    fileName: "manifest.json",
    type: "asset",
  });

  expect(output.length).toBe(3);

  const manifest = JSON.parse(manifestJson.source as string) as ChromeExtensionManifest;

  expect(manifest.background).toBeUndefined();
  expect(manifest.content_scripts?.[0]).toMatchObject({
    js: ["content1.js", "content2.js"],
  });
  expect(manifest.web_accessible_resources).toBeUndefined();

  // TODO: test that contentJs.code is an iife
});
