const fs = require('fs');

function updateFile(version) {
  fs.appendFile('../.release_wc.txt', `-Request release ${version} \r\n`);
}

if (require.main === module) {
  var version = process.argv.slice(2);
  main(version);
}
