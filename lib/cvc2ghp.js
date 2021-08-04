const fs = require('fs');
const localeHelper = require('locale-code');
const path = require('path');
const XLSX = require('xlsx');
var Handlebars = require("handlebars");
const { JSONPath } = require('jsonpath-plus');
const hashlinkutil = require('./hashlink-utils');
const { OCAEntity, OCAattribute } = require('./ghp-datamodel');

var entities = [];

const _profile = 'cvc2ghp';
var attrDictionary = new Map();
var entityDictionary = new Map();

var converter = {
    

    verifyFHIRBundle(bundle) {
        console.warn("FHIR Profile validation is not supported: Please ensure input FHIR Bundle is validated using FHIR validator");
    },

    getDictionary() {
        return entityDictionary;
    },

    loadOCASpec() {
        const _config = require(`../config/${_profile}-config.js`);
        var ocaspecWorkbook = XLSX.readFileSync(path.resolve(__dirname,_config.ocaspec));
        if (ocaspecWorkbook == null) {
            throw new Error('Unable to proceed: No worksheet found in OCA spec workbook');
        } else {
            const sheetNames = ocaspecWorkbook.SheetNames;
            sheetNames.forEach(function(localename) {
                //Skip sheets that do not follow language-countrycode naming convention, except for sheet named Main
                if (!(localeHelper.validateCountryCode(localename)) && !(localeHelper.validateLanguageCode(localename))) {
                    if (localename === 'Main') {
                        let records = XLSX.utils.sheet_to_json(ocaspecWorkbook.Sheets[localename],{header: 1});
                        let index= 0;
                        
                        records.forEach(function(item) {                            
                            if (index > 2) {
                                var currentAttribute = new OCAattribute();
                                let attrClassification = item[0];
                                if (attrClassification) currentAttribute.setClassification(attrClassification);
                                let attrName = item[1];
                                if (!attrName) {
                                    console.warn(`Warning: Fix missing attribute Name in Main worksheet, line ${index}`);
                                }
                                currentAttribute.setAttrName(attrName);
                                if (!attrDictionary.has(attrName)) {
                                    
                                    attrDictionary.set(attrName, {
                                        "attrObject": currentAttribute,
                                        "firstDefinedLocation": index
                                    });
                                }
                                else {
                                    console.warn(`Warning: Attribute ${attrName} in line ${index} already defined earlier, at line ${attrDictionary.get(attrName).firstDefinedLocation}`);
                                }
    
                                let attrType = item[2];
                                if (!attrType) attrType = 'Text'
                                currentAttribute.setAttrType(attrType);
    
                                let attrBlinding = item[3];
                                if (!attrBlinding) attrBlinding = 'N';
                                currentAttribute.setBlinding(attrBlinding);
    
                                let attrChar = item[4];
                                if (!attrChar) attrChar = 'utf-8';
                                currentAttribute.setCharEncoding(localename,attrChar);
    
                                let attrFormat = item[5];
                                if (attrFormat) currentAttribute.setFormat(attrFormat);
                            }
                            index++;
                        });
                    } else {
                        throw new Error(`Error: OCA spec worksheet ${localename} is not a valid local iso <lang>-<country code>`);
                    }
                    
                    //return;
                } else {
                    //console.log(`Processing ${localeHelper.getLanguageName(localename)} / ${localeHelper.getCountryName(localename)}`);
                    //console.log(`Sheet to json: ${ocaspecWorkbook}.Sheets.${localename}`);
                    let records = XLSX.utils.sheet_to_json(ocaspecWorkbook.Sheets[localename],{header: 1});
                    let index = 0;
                    records.forEach(function (item) {
                        //console.log(`${localename} : ${JSON.stringify(item,0,4)}`);
                        let formName, formDescription, attrName, labelOverlay, entryOverlay, infoOverlay, currentEntity, currentAttr;
                        if (index > 2) {
                            if (!item[0]) return;

                            formName = item[0].trim();
                            formDescription = item[1];
                            attrName = item[2];
                            labelOverlay = item[3];
                            entryOverlay = item[4];
                            infoOverlay = item[5];
                                
                            if (entityDictionary.has(formName)) {
                                currentEntity = entityDictionary.get(formName);
                            }
                            else {
                                currentEntity = new OCAEntity(formName,formDescription);
                            }
                            entityDictionary.set(formName, currentEntity);
                            if (attrDictionary.has(attrName)) {
                                currentAttr = (attrDictionary.get(attrName))['attrObject'];
                                currentAttr.setLabel(localename,labelOverlay);
                                currentAttr.setEntry(localename, entryOverlay);
                                currentAttr.setInfo(localename, infoOverlay);
                                currentEntity.addAttribute(currentAttr);
                            }
                            else {
                                    throw new Error(`Error: Attribute ${attrName} must be first defined in Main worksheet`);
                            }
                            
                            entities.push(currentEntity);
                        }
                        index++;
                    });
                }
    
            });
        }
    },
    
    generateOCAArtifactsFromR4Bundle: async function(cfg = null,bundlepath,profile = null) {
      
        console.log("Generating OCA artifacts from FHIR Bundle");
        console.log("    -Loading OCA spec");
        await module.exports.loadOCASpec();
        
        var fhirbundlefile = fs.readFileSync(bundlepath);
        var bundleobject = await JSON.parse(fhirbundlefile);
        var ocaArtifacts = [];
        console.log('    -Generating Vaccination Credentials schema base and instance');
        ocaArtifacts = await module.exports.generateVaxCredentialSchemaBase(bundleobject);
        let result = await module.exports.generateSchemaBaseInstance(bundleobject);
        Array.prototype.push(ocaArtifacts,{
                'type': 'oca-instance',
                'oca-instance': result
            });
        return ocaArtifacts;
      },

      generateSchemaBaseInstance(fhirbundle) {
        let instanceHBS = fs.readFileSync(`templates/${_profile}/ghp-vaxcredential-instance.hbs`, 'utf-8');
        let compiled_template = Handlebars.compile(instanceHBS);
        
        const targetDisease = JSONPath({path:'$.entry[3].recommendation[0].targetDisease.coding[0].code', 
                                                                        json: fhirbundle});
        const vaxCode = JSONPath({
            path: '$.entry[0].vaccineCode.coding[0].code',
            json: fhirbundle
        });                                                
        const vaxDesc = JSONPath({
            path: '$.entry[0].vaccineCode.coding[0].display',
            json: fhirbundle
        });

        const dateOfVax = JSONPath({path:'$.entry[0].occurrenceDateTime', json: fhirbundle});


        let configObj = {
            "name": "cvc-imm-instance1",
            "author": "OCA-FHIR-CLI, v0.1",
            "role": "Holder",
            "purpose": "Claim",
            "oca-base-schema-type": "spec/schema_base/1.0",
            "disease" : targetDisease[0],
            "vaccineDescription": vaxDesc[0],
            "vaccinationType": "900000000000207008",
            "cvxCode": vaxCode[0],
            "dateOfVaccination": dateOfVax[0]
        };
        let result = compiled_template(fhirbundle, {
                                "data": configObj
                                    });
        let ocafile = `generated/${_profile}/ghp-vaxcredential-instance.json`;
        fs.writeFileSync(ocafile, result);
        return(result);
      },

      generateVaxCredentialSchemaBase: async function() {
        let ocaArtifacts = [];
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
            "locale" : "en-CA"
        };
        let schemaObject = entityDictionary.get('Vaccination Credential');
        //console.log(JSON.stringify(schemaObject,0,4));
        let result = compiled_template(schemaObject,{
                                                "data": configObj
                                              });
          
        let ocafile = `generated/${_profile}/schema-base/ghp-vaxcredential.json`;
        var schemabasehl;
        fs.writeFileSync(ocafile, result);
        schemabasehl = await hashlinkutil.getHashlink(ocafile);
        /* let repo = new ocaRepoService.OCARepoService(ocaRepoBaseUrl,ocaNamespace);
        repo.uploadOCASchema(result); */
        
        //console.log(`getHashlink-genSchemaBase(${ocafile}): ${schemabasehl}`);
        configObj.schema_base = schemabasehl;
        ocaArtifacts.push({ 'type': 'oca-base-schema-type', 
                            'hashlink': schemabasehl,
                            'oca-base-schema-type': result
                        });
     
        //Information overlay
        configObj.locale = 'en-CA';
        result = module.exports.generateInfoOverlay(schemaObject, configObj);
        // repo.uploadOCASchema(result);
        ocaArtifacts.push({ 'type': 'oca-information-overlay-type', 
                            'oca-information-overlay-type': result,
                            'locale': configObj.locale
                        });
        configObj.locale = 'fr-CA';
        result = module.exports.generateInfoOverlay(schemaObject, configObj);
        // repo.uploadOCASchema(result);
        ocaArtifacts.push({ 'type': 'oca-information-overlay-type', 
                            'oca-information-overlay-type': result,
                            'locale': configObj.locale
                        });
        //Upload to repo

        //Entry overlay
        configObj.locale = 'en-CA';
        result = module.exports.generateEntryOverlay(schemaObject, configObj);
        // repo.uploadOCASchema(result);
        ocaArtifacts.push({ 'type': 'oca-entry-overlay-type', 
                            'oca-entry-overlay-type': result,
                            'locale': configObj.locale
        });
        configObj.locale = 'fr-CA';
        result = module.exports.generateEntryOverlay(schemaObject, configObj);
        // repo.uploadOCASchema(result);
        ocaArtifacts.push({ 'type': 'oca-entry-overlay-type', 
        'oca-entry-overlay-type': result,
        'locale': configObj.locale
        });
        //Label overlay
        configObj.locale = 'en-CA';
        result = module.exports.generateLabelOverlay(schemaObject, configObj);
        // repo.uploadOCASchema(result);
        ocaArtifacts.push({ 'type': 'oca-label-overlay-type', 
                            'oca-label-overlay-type': result,
                            'locale': configObj.locale
                        });
        configObj.locale = 'fr-CA';
        result = module.exports.generateLabelOverlay(schemaObject, configObj);
        // repo.uploadOCASchema(result);
        ocaArtifacts.push({ 'type': 'oca-label-overlay-type', 
                            'oca-label-overlay-type': result,
                            'locale': configObj.locale
        });

           //Format overlay
        configObj.locale = 'en-CA';
        result = module.exports.generateFormatOverlay(schemaObject, configObj);
        // repo.uploadOCASchema(result);
        ocaArtifacts.push({ 'type': 'oca-format-overlay-type', 
                            'oca-format-overlay-type': result,
                            'locale': configObj.locale
        });
        configObj.locale = 'fr-CA';
        result = module.exports.generateFormatOverlay(schemaObject, configObj);
        // repo.uploadOCASchema(result);
        ocaArtifacts.push({ 'type': 'oca-format-overlay-type', 
                            'oca-format-overlay-type': result,
                            'locale': configObj.locale
        });
        //CharEnc overlay
        configObj.locale = 'en-CA';
        result = module.exports.generateCharEncOverlay(schemaObject, configObj);
        // repo.uploadOCASchema(result);
        ocaArtifacts.push({ 'type': 'oca-character-overlay-type',
                            'oca-character-overlay-type': result,
                            'locale': configObj.locale
        });
        configObj.locale = 'fr-CA';
        result = module.exports.generateCharEncOverlay(schemaObject, configObj);
        // repo.uploadOCASchema(result);
        ocaArtifacts.push({ 'type': 'oca-character-overlay-type',
                            'oca-character-overlay-type': result,
                            'locale': configObj.locale
        });
        return ocaArtifacts;
      },

      generateInfoOverlay(schemaObject, configObject) {
        let infohbs = fs.readFileSync(`templates/${_profile}/ghp-vaxcredential-infooverlay.hbs`, 'utf-8');
        let compiled_template = Handlebars.compile(infohbs);
        let result = compiled_template(schemaObject, {
                                        "data": configObject
                                    });
        let ocafile = `generated/${_profile}/information-overlay/ghp-vaxcredential-infooverlay-${configObject.locale}.json`;
        fs.writeFileSync(ocafile, result);
        return result;
      },
      generateEntryOverlay(schemaObject, configObject) {
          let entryhbs = fs.readFileSync(`templates/${_profile}/ghp-vaxcredential-entryoverlay.hbs`, 'utf-8');
          let compiled_template = Handlebars.compile(entryhbs);
          let result = compiled_template(schemaObject, {
              "data": configObject
          });
          let ocafile = `generated/${_profile}/entry-overlay/ghp-vaxcredential-entryoverlay-${configObject.locale}.json`;
          fs.writeFileSync(ocafile, result);
          return result;
      },
      generateLabelOverlay(schemaObject, configObject) {
        let labelhbs = fs.readFileSync(`templates/${_profile}/ghp-vaxcredential-labeloverlay.hbs`, 'utf-8');
        let compiled_template = Handlebars.compile(labelhbs);
        let result = compiled_template(schemaObject, {
            "data": configObject
        });
        let ocafile = `generated/${_profile}/label-overlay/ghp-vaxcredential-labeloverlay-${configObject.locale}.json`;
        fs.writeFileSync(ocafile, result);
        return result;
    },
    generateFormatOverlay(schemaObject, configObject) {
        let formathbs = fs.readFileSync(`templates/${_profile}/ghp-vaxcredential-formatoverlay.hbs`, 'utf-8');
        let compiled_template = Handlebars.compile(formathbs);
        let result = compiled_template(schemaObject, {
            "data": configObject
        });
        let ocafile = `generated/${_profile}/format-overlay/ghp-vaxcredential-formatoverlay-${configObject.locale}.json`;
        fs.writeFileSync(ocafile, result);
        return result;
    },
    generateCharEncOverlay(schemaObject, configObject) {
        let charenchbs = fs.readFileSync(`templates/${_profile}/ghp-vaxcredential-characterencoverlay.hbs`, 'utf-8');
        let compiled_template = Handlebars.compile(charenchbs);
        let result = compiled_template(schemaObject, {
            "data": configObject
        });
        let ocafile = `generated/${_profile}/characterenc-overlay/ghp-vaxcredential-characterencoverlay-${configObject.locale}.json`;
        fs.writeFileSync(ocafile, result);
        return result;
    }

};

module.exports =  converter, entityDictionary;



 

 
