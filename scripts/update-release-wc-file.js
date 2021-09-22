const fs = require("fs");
const path = require("path");

function updateFile(version) {
  const now = new Date();

  fs.appendFileSync(
    path.join(__dirname, "..", ".release_wc.txt"),
    `- [${now.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}] Request release ${version[0]} by ${version[1]} \r\n`
  );
}

if (require.main === module) {
  var version = process.argv.slice(2);
  updateFile(version);
}
