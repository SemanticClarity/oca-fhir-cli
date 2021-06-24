const fs = require('fs');
const XLSX = require('xlsx');
var Handlebars = require("handlebars");
const hashlinkutil = require('./hashlink-utils');
const { OCAEntity, OCAattribute } = require('./ghp-datamodel');
const ocaRepoService = require('./ocarepo-service');
//move to config file, band-aid for now
const ocaRepoBaseUrl = 'https://repository.oca.argo.colossi.network/api/v3';
const ocaNamespace = 'hcf';
var entities = [];

const _profile = 'cvc2ghp';
var dictionary = new Map();

var converter = {
    

    verifyFHIRBundle(bundle) {
        console.warn("FHIR Profile validation is not supported: Please ensure input FHIR Bundle is validated using FHIR validator");
    },

    getDictionary() {
        return dictionary;
    },

    loadOCASpec() {
        
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
                        //console.log(cname + ' not in dict adding.');
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

    generateOCAArtifactsFromR4Bundle: async function(cfg, bundlepath,profile) {
      
        console.log("Generating OCA artifacts from FHIR Bundle");
        module.exports.loadOCASpec();
        
        var fhirbundlefile = fs.readFileSync(bundlepath);
        var bundleobject = await JSON.parse(fhirbundlefile)
        let hl = module.exports.generateVaxCredentialSchemaBase(bundleobject);
        //let hl = await module.exports.generateVaxCredentialSchemaBase(bundleobject);
        
      },

      generateVaxCredentialSchemaBase: async function() {
        let vaxcredentialHBS = fs.readFileSync(`templates/${_profile}/ghp-vaxcredential-schemabase.hbs`, 'utf-8');
        let compiled_template = Handlebars.compile(vaxcredentialHBS);
        let configObj = {
            "author": "OCA-FHIR-CLI, v0.1",
            "role": "Holder",
            "purpose": "Claim",
            "oca-base-schema-type": "spec/schema_base/1.0",
            "oca-entry-overlay-type": "spec/overlay/entry/1.0",
            "oca-format-overlay-type": "spec/overlay/format/1.0",
            "oca-information-overlay-type": "spec/overlay/information/1.0",
            "oca-character-overlay-type": "spec/overlay/character_encoding/1.0",
        };
        let schemaObject = dictionary.get('Vaccination Credential');
        //console.log(JSON.stringify(schemaObject));
        let result = compiled_template(schemaObject,{
                                                "data": configObj
                                              });
          
        let ocafile = `generated/${_profile}/schema-base/ghp-vaxcredential.jsonld`;
        var schemabasehl;
        fs.writeFileSync(ocafile, result);
        console.log('Uploading to OCA repo');
        let repo = new ocaRepoService.OCARepoService(ocaRepoBaseUrl,ocaNamespace);
        repo.uploadOCASchema(result);
        schemabasehl = await hashlinkutil.getHashlink(ocafile);
        console.log(`getHashlink-genSchemaBase(${ocafile}): ${schemabasehl}`);
        return schemabasehl;
      } 
};

module.exports =  converter, dictionary;



 

 
