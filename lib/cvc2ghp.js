const fs = require('fs');
const XLSX = require('xlsx');
var Handlebars = require("handlebars");
const hashlinkutil = require('./hashlink-utils');
const { OCAEntity, OCAattribute } = require('./ghp-datamodel');
var entities = [];
var dictionary = new Map();

var converter = {

    verifyFHIRBundle(bundle) {
        console.warn("FHIR Profile validation is not supported: Please ensure input FHIR Bundle is validated using FHIR validator");
    },

    loadOCASpec() {
        const _profile = 'cvc2ghp';
        const _config = require(`../config/${_profile}-config.js`);
    
        var ocaspecWorkbook = XLSX.readFileSync(_config.ocaspec.ca);
        if (ocaspecWorkbook == null) {
            throw new Error('Unable to proceed: No worksheet found in OCA spec workbook')
        } else {
            const sheetNames = ocaspecWorkbook.SheetNames;
            let sheetIndex = sheetNames.find(s => s === 'ca');
            if (sheetIndex === undefined) {
                sheetIndex = sheetNames.find(s => s === 'CA')
            } //add check for sheetname in lower case iso country codes e.g. ca
            else throw new Error('Unable to proceed: OCA spec worksheet named by iso country code (CA) does not exist');
        }
        var currentEntity;

        var worksheet = ocaspecWorkbook.Sheets['CA'];
        if (worksheet) {
            let records = XLSX.utils.sheet_to_json(worksheet, {header: 1});
            let index = 0;
            console.log('Iterating through oca xls');
            records.forEach( function(item) {
                index++;
                if (index > 4) {
  
                    let cname = item[0].trim();
                    if (dictionary.has(cname)) {
                        currentEntity = dictionary.get(cname);
                    } else {
                        console.log(cname + ' not in dict adding.');
                        if (item[2] != null) {
                            currentEntity = new OCAEntity(cname, item[1], item[2]);
                            dictionary.set(cname,currentEntity);
                        } else {
                            currentEntity = new OCAEntity(cname, item[1]);
                            dictionary.set(cname,currentEntity);
                        }
                        entities.push(currentEntity);
                    }  
                    var currentAttribute = new OCAattribute();

                    currentAttribute.setAttrName(item[3]);
                    currentAttribute.setAttrType(item[4]);
                    if (item[5] != null) {
                       currentAttribute.setBlinding(item[5]);
                    }
                    if (item[6] != null) {
                        currentAttribute.setFormat(item[6]);
                    }
                    currentAttribute.setLabel({ 'en-CA': item[7], 'fr-CA': item[8]});
                    currentAttribute.setCharEncoding(item[9]);
                    currentAttribute.setEntry({ 'en-CA': item[10], 'fr-CA': item[11]});
                    currentAttribute.setInfo({'en-CA': item[12], 'fr-CA': item[13]});
                    currentEntity.addAttribute(currentAttribute);
                }
                
                });
        } 
    },

    generateOCAArtifactsFromR4Bundle(cfg, bundlepath,profile) {
      
      console.log("Generating OCA artifacts from FHIR Bundle");
        module.exports.loadOCASpec();
        console.log("Dictionary size: "+ dictionary.size);
     /*    module.exports.initHashlinkCache()
        .then(async (hlcache) => {
          var context = "oca-"+profile;
          var fhirbundlefile = fs.readFileSync(bundlepath);
          var bundleobject = await JSON.parse(fhirbundlefile);
          module.exports.verifyFHIRBundle(bundleobject);
          let hl = await module.exports.generateSchemaBase(cfg,context,profile, bundleobject);
          module.exports.generateOCAEntryOverlay(bundleobject,context,hl);
          module.exports.generateOCAFormatOverlay(bundleobject,context,hl);
          module.exports.generateOCAInformationOverlay(bundleobject,context,hl);
          module.exports.generateOCACharacterOverlay(bundleobject,context,hl);
          module.exports.generateOCALabelOverlay(bundleobject,context,hl);
        })
        .catch((error) => {console.log(error)}); */
      }
};

module.exports =  converter ;



 

 
