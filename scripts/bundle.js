import * as esbuild from "https://deno.land/x/esbuild@v0.15.6/mod.js";

async function main() {
    if (Deno.args.length > 0) {
        bundle(Deno.args.length);
        return;
    }

    let denoConfigFile;
    try {
        const f = await Deno.readFile("deno.json");
        denoConfigFile = (new TextDecoder()).decode(f);
    } catch (_) {
        throw "missing $1 or ./deno.json";
    }

    const denoConfig = JSON.parse(denoConfigFile);
    if (!denoConfig.sharedSources) {
        throw "deno.json missing .sharedSources";
    }

    bundle(denoConfig.sharedSources);
}

async function bundle(files) {
    await Deno.mkdir("./dist", { recursive: true });
    await Deno.stat("./dist/public").catch(() => Deno.symlink("../public", "./dist/public"));

    const result = await esbuild.build({
        format: "esm",
        outdir: "./dist/src",
        entryPoints: files,
    });

    for (const error of result.errors) {
        console.error(error);
    }
}

await main();
