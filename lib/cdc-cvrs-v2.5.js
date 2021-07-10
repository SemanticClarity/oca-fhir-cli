const fs = require('fs');
var HBS = require("handlebars");
var Papa = require("papaparse");
const HLUtil = require('./hashlink-utils');
var bundleIDs = [];

var testConverter = {
    generateOCAArtifactsFromR4Bundle:  async function(cfg, profile, ...bundleids) {
             await module.exports.initHashlinkCache()
            .then(async (hlcache) => {
                //var context = "oca-"+profile;            
                    for(let loop=0; loop < bundleids.length; loop++)
                    {
                        console.log("#>"+bundleids[loop]);
                        var fhirbundlefile = fs.readFileSync(`generated/${profile}/${bundleids[loop]}.jsonld`);
                        var bundleobject = await JSON.parse(fhirbundlefile);
            //module.exports.verifyFHIRBundle(bundleobject);
                        let hl = await module.exports.generateSchemaBase(cfg,bundleids[loop],profile,bundleobject);
                        let context = `oca-${profile}-labeloverlay-${bundleids[loop]}`;
                        module.exports.generateOCALabelOverlay(bundleobject,profile,context,hl);
                        context = `oca-${profile}-entryoverlay-${bundleids[loop]}`;
                        module.exports.generateOCAEntryOverlay(bundleobject,profile, context,hl);
                        context = `oca-${profile}-formatoverlay-${bundleids[loop]}`;
                        module.exports.generateOCAFormatOverlay(bundleobject,profile,context,hl);
                        context = `oca-${profile}-informationoverlay-${bundleids[loop]}`;
                        module.exports.generateOCAInformationOverlay(bundleobject,profile,context,hl);
                        context = `oca-${profile}-characteroverlay-${bundleids[loop]}`;
                        module.exports.generateOCACharacterOverlay(bundleobject,profile,context,hl);
                    }
            })
            .catch((error) => {console.log(error);});
        
    },

    generateVaxCert: function(cdccvrsrecord, profile, context) {
        const w3cvchbs = fs.readFileSync(`templates/${profile}/${profile}-w3c-vc.hbs`, 'utf-8');
        const compiled_template = HBS.compile(w3cvchbs);
        var result = compiled_template(cdccvrsrecord,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "role": "TBD",
                "fhir-profile-ref": "us-core",
                "fhir-profile-uri": "http://hl7.org/fhir/us/core/StructureDefinition/",
                "oca-artifact-type": "w3c-vc",
                "dpv-purpose": "dpv:MedicalHealth"
            }
        });
        console.log('\tw3c-vc gen');
        fs.writeFileSync(`generated/${profile}/w3c-vc/${context}.json`, result);
    },

    generateFHIRBundles: function(cfg, profile, csvpath) {
        let bundlehbs = fs.readFileSync(`templates/${profile}/${profile}-R5jsonld-bundle.hbs`, 'utf-8');
        let compiled_template = HBS.compile(bundlehbs);
        const readstream = fs.createReadStream(csvpath);
        
        return new Promise(function(resolve, reject) {
            Papa.parse(readstream, {
                header: true,
                download: true,
                step: function(results) {
                  let bundlefile = `generated/${profile}/${results.data.vax_event_id}.jsonld`;
                  bundleIDs.push(results.data.vax_event_id);
                  
                  let r4bundle = compiled_template(results.data,{"data": cfg});
                  fs.writeFileSync(bundlefile, r4bundle);
                  let context = `${profile}-w3c-vc-${results.data.vax_event_id}`;
                  module.exports.generateVaxCert(results.data,profile,context);
                },
                complete: function() {
                  resolve(bundleIDs);
                }
              });

        });
    },

    generateSchemaBase: async function(configobj, ctx, profile, bundle) {

        let bundlehbs = fs.readFileSync(`templates/${profile}/${profile}-R5schemabase.hbs`, 'utf-8');
        let compiled_template = HBS.compile(bundlehbs);
        let result = compiled_template(bundle,{"data": configobj});
        var schemabasehl;
        let ocafile = `generated/${profile}/schema-base/oca-${profile}-schemabase-${ctx}.jsonld`;
        
        fs.writeFileSync(ocafile, result);
        schemabasehl = await HLUtil.getHashlink(ocafile);
        return new Promise(function(resolve, reject) {
            resolve(schemabasehl);
        });
    },

    generateOCALabelOverlay: function(cdccvrsrecord, profile, context, schemabase_hashlink) {
        const labelhbs = fs.readFileSync(`templates/${profile}/${profile}-labeloverlay.hbs`, 'utf-8');
        const compiled_template = HBS.compile(labelhbs);
        var result = compiled_template(cdccvrsrecord,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "role": "TBD",
                "fhir-profile-ref": "us-core",
                "fhir-profile-uri": "http://hl7.org/fhir/us/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/label/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        console.log('\tgenOCALabelOverlay');
        fs.writeFileSync(`generated/${profile}/label-overlay/${context}.jsonld`, result);
    },
    generateOCAFormatOverlay: function(cdccvrsrecord, profile, context, schemabase_hashlink) {
        const formathbs = fs.readFileSync(`templates/${profile}/${profile}-formatoverlay.hbs`, 'utf-8');
        const compiled_template = HBS.compile(formathbs);
        var result = compiled_template(cdccvrsrecord,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "fhir-profile-ref": "us-core",
                "fhir-profile-uri": "http://hl7.org/fhir/us/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/format/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        console.log('\tgenOCAFormatOverlay');
        fs.writeFileSync(`generated/${profile}/format-overlay/${context}.jsonld`, result);
      },
      
      generateOCAEntryOverlay: function (cdccvrsrecord, profile, context, schemabase_hashlink) {
        const entryhbs = fs.readFileSync(`templates/${profile}/${profile}-entryoverlay.hbs`, 'utf-8');
        const compiled_template = HBS.compile(entryhbs);
        var result = compiled_template(cdccvrsrecord,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "fhir-profile-ref": "us-core",
                "fhir-profile-uri": "http://hl7.org/fhir/us/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/entry/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        console.log('\tgenOCAEntryOverlay');
        fs.writeFileSync(`generated/${profile}/entry-overlay/${context}.jsonld`, result);
      },
      
      generateOCACharacterOverlay: function(cdccvrsrecord, profile, context, schemabase_hashlink) {
        const formathbs = fs.readFileSync(`templates/${profile}/${profile}-characteroverlay.hbs`, 'utf-8');
        const compiled_template = HBS.compile(formathbs);
        var result = compiled_template(cdccvrsrecord,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "role": "TBD",
                "fhir-profile-ref": "us-core",
                "fhir-profile-uri": "http://hl7.org/fhir/us/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/character_encoding/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        console.log('\tgenOCACharacterOverlay');
        fs.writeFileSync(`generated/${profile}/character-overlay/${context}.jsonld`, result);
      },
      
      generateOCAInformationOverlay: function(cdccvrsrecord, profile, context, schemabase_hashlink) {
        const informationhbs = fs.readFileSync(`templates/${profile}/${profile}-informationoverlay.hbs`, 'utf-8');
        const compiled_template = HBS.compile(informationhbs);
        var result = compiled_template(cdccvrsrecord,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "role": "TBD",
                "fhir-profile-ref": "us-core",
                "fhir-profile-uri": "http://hl7.org/fhir/us/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/information/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        console.log('\tgenOCAInformationOverlay');
        fs.writeFileSync(`generated/${profile}/information-overlay/${context}.jsonld`, result);
      },

    initHashlinkCache: async () => {
        let hlcache = await HLUtil.processDirFiles(`./data/oca-primitives/schema-base`);
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(hlcache);
          },0);
        });
      }

};

module.exports = testConverter;