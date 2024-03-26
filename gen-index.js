const fs = require("fs");
const { blake3 } = require("hash-wasm");

async function genDirTree(dir, currentArr) {
    let files = fs.readdirSync(dir);
    for (const name of files) {
        let path = dir + "/" + name;
        console.log(path);
        let stats = fs.statSync(path);
        let entry;
        if (stats.isDirectory()) {
            entry = {
                type: "Directory",
                name,
                nodes: []
            };
            await genDirTree(path, entry.nodes);
        }
        else {
            entry = {
                type: "File",
                name,
                hash: await blake3(fs.readFileSync(path)),
                size: stats.size
            }
        }
        currentArr.push(entry);
    }
}

async function main() {
    let index = JSON.parse(fs.readFileSync("index_base.json", "utf8"));
    if (typeof index != "object") {
        console.log("Invalid index base file");
        process.exit(1);
    }

    index.dir_tree = [];
    await genDirTree("localized_data", index.dir_tree);

    fs.writeFileSync("index.json", JSON.stringify(index, null, 2), "utf8");
}

main();
