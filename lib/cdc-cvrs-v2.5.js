const fs = require('fs');
var HBS = require("handlebars");
var Papa = require("papaparse");
var HBSUtils = require('./hbs-utils');
//const HLUtil = require('./hashlink-utils');

var cdcFhirOcaConverter = {
  generateOCAArtifactsFromR4Bundle: async function(cfg, bundlepath, profile) {
    /*
        module.exports.initHashlinkCache()
        .then(async (hlcache) => {
<<<<<<< Updated upstream
          
          module.exports.generateFHIRBundle(cfg, profile, csvpath);
        */
          var context = "oca-"+profile;
=======
          var context = "oca-"+profile;
          //module.exports.generateFHIRBundle(cfg, profile, csvpath);
          
>>>>>>> Stashed changes
          var fhirbundlefile = fs.readFileSync(bundlepath);
          var bundleobject = await JSON.parse(fhirbundlefile);
          //module.exports.verifyFHIRBundle(bundleobject);
          let hl = await module.exports.generateSchemaBase(cfg,context,profile, bundleobject);
          /*
          module.exports.generateOCAEntryOverlay(bundleobject,context,hl);
          module.exports.generateOCAFormatOverlay(bundleobject,context,hl);
          module.exports.generateOCAInformationOverlay(bundleobject,context,hl);
          module.exports.generateOCACharacterOverlay(bundleobject,context,hl);
          module.exports.generateOCALabelOverlay(bundleobject,context,hl); 
        })
        .catch((error) => {console.log(error)});
        */
    },

    generateFHIRBundle: function(cfg, profile, csvpath) {
      HBSUtils.initPartials();
      let bundlehbs = fs.readFileSync(`templates/${profile}/${profile}-R4jsonld-bundle.hbs`, 'utf-8');
      let compiled_template = HBS.compile(bundlehbs);
      const readstream = fs.createReadStream(csvpath);

      let w3cvchbs = fs.readFileSync(`templates/${profile}/${profile}-w3c-vc.hbs`, 'utf-8');
      let compiled_vctemplate = HBS.compile(w3cvchbs);

      Papa.parse(readstream, {
        header: true,
        download: true,
        step: function(row) {
          let vax_event_id = `${row.data['vax_event_id']}`;
          let bundlefile = `oca-artifacts/${profile}/${vax_event_id}.jsonld`;
          console.log(bundlefile);
          let r4bundle = compiled_template(row.data,{"data": cfg});
          //console.log(r4bundle);
          fs.writeFileSync(bundlefile, r4bundle);
          

          let w3cvcfile = `oca-artifacts/${profile}/vc-${row.data['vax_event_id']}.jsonld`;
          console.log(w3cvcfile);
          let vcjsonld = compiled_vctemplate(row.data,{"data": cfg});
          fs.writeFileSync(w3cvcfile, vcjsonld);

          module.exports.generateOCAArtifactsFromR4Bundle(cfg, bundlefile, profile, vax_event_id);
        },
        complete: function(row) {
        }
     }); 
    },

    generateSchemaBase: async function(configobj, ctx, profile, bundle, event_id) {
        let bundlehbs = fs.readFileSync(`templates/${profile}/${profile}-R4jsonld-schemabase.hbs`, 'utf-8');
        let compiled_template = HBS.compile(bundlehbs);
        let result = compiled_template(bundle,{"data": configobj});
          
        let ocafile = `oca-artifacts/${profile}/schema-base/${ctx}-R4jsonld-bundle.jsonld`;
        var schemabasehl;
        fs.writeFileSync(ocafile, result);
        //schemabasehl = await hashlinkutil.getHashlink(ocafile);
        //console.log(`getHashlink-genSchemaBase(${ocafile}): ${schemabasehl}`);
        return schemabasehl;
      },

    generateOCAFormatOverlay: function(cdccvrsrecord, context, schemabase_hashlink) {
        const formathbs = fs.readFileSync(`templates/${profile}/${profile}-formatoverlay.hbs`, 'utf-8');
        const compiled_template = Handlebars.compile(formathbs);
        var result = compiled_template(cdccvrsrecord,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "fhir-profile-ref": "us-core",
                "fhir-profile-uri": "http://hl7.org/fhir/ca/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/format/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        fs.writeFileSync(`oca-artifacts/format-overlay/${context}-format.jsonld`, result);
      },
      
      generateOCAEntryOverlay: function (cdccvrsrecord, context, schemabase_hashlink) {
        const entryhbs = fs.readFileSync(`templates/${profile}/${profile}-entryoverlay.hbs`, 'utf-8');
        const compiled_template = Handlebars.compile(entryhbs);
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
        fs.writeFileSync(`oca-artifacts/entry-overlay/${context}-entry.jsonld`, result);
      },
      
      generateOCACharacterOverlay: function(cdccvrsrecord, context, schemabase_hashlink) {
        const formathbs = fs.readFileSync(`templates/${profile}/${profile}-characteroverlay.hbs`, 'utf-8');
        const compiled_template = Handlebars.compile(formathbs);
        var result = compiled_template(cdccvrsrecord,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "role": "TBD",
                "fhir-profile-ref": "CA-Core",
                "fhir-profile-uri": "http://hl7.org/fhir/ca/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/character_encoding/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        fs.writeFileSync(`oca-artifacts/character-overlay/${context}-character.jsonld`, result);
      },
      
      generateOCAInformationOverlay: function(cdccvrsrecord, context, schemabase_hashlink) {
        const informationhbs = fs.readFileSync(`templates/${profile}/${profile}-informationoverlay.hbs`, 'utf-8');
        const compiled_template = Handlebars.compile(informationhbs);
        var result = compiled_template(cdccvrsrecord,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "role": "TBD",
                "fhir-profile-ref": "us-core",
                "fhir-profile-uri": "http://hl7.org/fhir/ca/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/information/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        fs.writeFileSync(`oca-artifacts/information-overlay/${context}-information.jsonld`, result);
      },

      generateOCALabelOverlay: function(cdccvrsrecord, context, schemabase_hashlink) {
        const labelhbs = fs.readFileSync(`templates/${profile}/${profile}-labeloverlay.hbs`, 'utf-8');
        const compiled_template = Handlebars.compile(labelhbs);
        var result = compiled_template(cdccvrsrecord,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "role": "TBD",
                "fhir-profile-ref": "CA-Core",
                "fhir-profile-uri": "http://hl7.org/fhir/ca/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/label/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        fs.writeFileSync(`oca-artifacts/label-overlay/${context}-label.jsonld`, result);
      },
      
      initHashlinkCache: async() => {
        let hlcache = await hashlinkutil.processDirFiles(`./data/oca-primitives/schema-base`);
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(hlcache);
          },0);
        });
      },

};

module.exports = cdcFhirOcaConverter