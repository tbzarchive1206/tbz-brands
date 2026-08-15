import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { ROOT_FOLDER_ID, ROOT_TITLE, summarizeRaw, topLevelFolders } from "../scripts/archive-tools.mjs";

const raw = JSON.parse(await fs.readFile(new URL("../app/data/archive.generated.json", import.meta.url), "utf8"));

test("snapshot contains a complete internally consistent Drive tree", () => {
  assert.equal(raw.sourceFolderId, ROOT_FOLDER_ID);
  const summary = summarizeRaw(raw);
  assert.equal(summary.nodes, summary.folders + summary.files);
  assert.equal(new Set(raw.nodes.map((node) => node.id)).size, summary.nodes);
  assert.ok(summary.topFolders > 0);
  assert.ok(summary.files > 0);
  assert.ok(raw.nodes.every((node) => Array.isArray(node.path) && node.path[0] === ROOT_TITLE));
});

test("top-level brand folders remain data-driven", () => {
  const top = topLevelFolders(raw);
  assert.ok(top.some((folder) => folder.name === "ERIC x ALMOST BLUE"));
  assert.equal(top.length, new Set(top.map((folder) => folder.id)).size);
});

test("snapshot contains image and video media", () => {
  assert.ok(raw.nodes.some((node) => node.mimeType.startsWith("image/")));
  assert.ok(raw.nodes.some((node) => node.mimeType.startsWith("video/")));
});
