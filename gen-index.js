const fs = require("fs");
const { blake3 } = require("hash-wasm");

async function walkDir(dir, callback) {
    let files = fs.readdirSync(dir);
    for (const name of files) {
        let path = dir + "/" + name;
        let stats = fs.statSync(path);
        if (stats.isDirectory()) {
            await callback({path, stats});
            await walkDir(path, callback);
        }
        else {
            await callback({path, stats});
        }
    }
};

const LOCALIZED_DATA_DIR = "localized_data";
async function main() {
    let index = JSON.parse(fs.readFileSync("index_base.json", "utf8"));
    if (typeof index != "object") {
        console.log("Invalid index base file");
        process.exit(1);
    }

    let files = [];
    await walkDir(LOCALIZED_DATA_DIR, async entry => {
        let { path, stats } = entry;
        if (stats.isDirectory()) return;
        let relPath = path.slice(LOCALIZED_DATA_DIR.length + 1);
        console.log(relPath);
        files.push({
            path: relPath,
            hash: await blake3(fs.readFileSync(path)),
            size: stats.size
        })
    });
    index.files = files;

    fs.writeFileSync("index.json", JSON.stringify(index, null, 2), "utf8");
}

main();
