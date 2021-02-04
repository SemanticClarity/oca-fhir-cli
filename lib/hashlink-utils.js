const fs = require('fs');
const path = require('path');
const hl = require('hashlink');
var readdir = require('recursive-readdir');
const NodeCache = require('node-cache');
const cache = new NodeCache();


module.exports = {

  get: (key) => {
    return cache.get(key);
  },

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
      if (!cache.has(fname)) {
        cache.set(fname,retval);
        //console.log(`\tcache.set-getHashlink(${fname}, ${retval})`);
      }
      //update cache here
      return retval;
  },

  async processDirFiles(dirpath)  {
    let files = fs.readdirSync(dirpath);
    //Fix: problem here is this block below needs to be sync as well
    files.forEach(async (item) => {
      var filename = path.parse(item).base;
      await module.exports.getHashlink(dirpath + '/' + item)
        .then((value) => {
          let key = filename.replace(/\.[^/.]+$/, "");
          //console.log(`cache.set in processDirFiles(${key},${value})`);
          cache.set(key, value);
        });
    });
    
    
    return cache;
  }
}




