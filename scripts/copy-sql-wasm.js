const fs = require("fs");
const path = require("path");

const sourceWasm = path.join(
  __dirname,
  "../node_modules/sql.js/dist/sql-wasm.wasm"
);
const targetWasm = path.join(__dirname, "../dist/sql-wasm.wasm");

fs.copyFileSync(sourceWasm, targetWasm);
