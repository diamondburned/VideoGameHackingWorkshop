import { BlockType } from "./types.ts";
import * as validator from "/src/types_validator.ts";
import * as objects from "/src/objects.ts";
const LF = "\n".charCodeAt(0);
const SPACE = " ".charCodeAt(0);
async function ParseFiles(textFile, metadataFile) {
  const text = await Deno.readFile(textFile);
  const metadata = await Deno.readFile(metadataFile);
  return Parse(text, metadata);
}
function Parse(text, rawMetadata) {
  const metadata = validator.ValidateMapMetadata(JSON.parse(rawMetadata.toString()));
  const rawMap = [];
  while (text.length > 0) {
    let next = text.indexOf(LF);
    if (!next)
      next = text.length;
    rawMap.push(text.subarray(0, next));
    text = text.subarray(next, text.length);
  }
  const data = new Data(rawMap, metadata);
  return data;
}
class Data {
  constructor(raw, metadata) {
    let width = 0;
    for (const line of raw) {
      width = Math.max(width, line.length);
    }
    for (let i = 0; i < raw.length; i++) {
      const missing = raw[i].length - width;
      if (missing > 0) {
        raw[i] = append(raw[i], bytes(" ".repeat(missing)));
      }
    }
    const missingLines = [];
    while (raw.length < metadata.height) {
      const array = new Uint8Array(width);
      array.fill(SPACE);
      missingLines.push(array);
    }
    if (missingLines.length > 0) {
      raw = [...missingLines, ...raw];
    }
    this.raw = raw;
    this.metadata = metadata;
    this.width = width;
  }
  block(block, type = BlockType.Block) {
    let objectID;
    switch (type) {
      case BlockType.Block:
        objectID = this.metadata.blocks.get(block);
        break;
      case BlockType.EntityBlock:
        objectID = this.metadata.entities.get(block);
        break;
      default:
        throw `unknown block type ${type}`;
    }
    if (!objectID)
      return objects.NoTexture;
    return objects.Get(objectID);
  }
  at(x, y, type = BlockType.Block) {
    const block = String.fromCharCode(this.raw[y][x]);
    return this.block(block, type);
  }
  attribute(key) {
    return this.metadata.attributes.get(key);
  }
}
function append(a, b) {
  const c = new Uint8Array(a.length + b.length);
  c.set(a, 0);
  c.set(b, a.length);
  return c;
}
const utf8Encoder = new TextEncoder();
function bytes(str) {
  return utf8Encoder.encode(str);
}
export {
  Data,
  Parse,
  ParseFiles
};
