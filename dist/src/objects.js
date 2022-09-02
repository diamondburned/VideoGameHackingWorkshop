const objects = /* @__PURE__ */ new Map();
const NoTexture = {
  assets: "./public/assets/notexture.png"
};
async function LoadFromPublic() {
  const files = Deno.readDir("./public/assets/");
  for await (const file of files) {
    if (!file.isFile || !file.name.endsWith(".png")) {
      continue;
    }
    objects.set(trimExt(file.name), {
      assets: `/public/assets/${file.name}`
    });
  }
}
function trimExt(filename) {
  return filename.split(".").at(0) || "";
}
function Get(id) {
  const obj = objects.get(id);
  if (obj !== void 0) {
    return obj;
  }
  return NoTexture;
}
function Require(id) {
  const obj = Get(id);
  if (obj === NoTexture) {
    throw `object ${id} not found`;
  }
  return obj;
}
export {
  Get,
  LoadFromPublic,
  NoTexture,
  Require
};
