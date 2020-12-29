const fs = require('fs');
const path = require('path');
const hl = require('hashlink');
var readdir = require('recursive-readdir');
const NodeCache = require('node-cache');
const cache = new NodeCache();

let dupecount = 0;

module.exports = {

  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  directoryExists: (filePath) => {
    return fs.existsSync(filePath);
  },

  async getHashlink(filePath)  {
      const data = fs.readFileSync(filePath,'utf-8');
      let input = await JSON.parse(data);
      var fileSep = path.sep; 
      var fname = path.parse(filePath).base;
      const retval =  await hl.encode({data,fname});
      return retval;
  },

  async processDirFiles (path)   {
    readdir(path, function (err, files) {
      // `files` is an array of file paths
      files.forEach(function(item, index, array) {
        console.log("Processing file: "+ item)
        var fhl =  module.exports.getHashlink(item)
      });
    });
    return 'Done processing jsonld context files';
  }
};

module.exports.cache = cache;



