
const fs = require('fs');
var path = require('path');
var os   = require('os');
var Handlebars = require("handlebars");

const fhirpath = require('fhirpath.js');
const hashlinkutil = require('./hashlink-utils');
var Fhir = require('fhir').Fhir;
var ParseConformance = require('fhir').ParseConformance;
var FhirVersions = require('fhir').Versions;

var cvcFhirOcaConverter = {

    verifyFHIRBundle: async(patientpassport) =>  {
      console.log(`verifyFHIRBundle (Incomplete): For full conformance validation, please use FHIR validator tool.`);

      /* var jsonobject = fs.readFileSync('examples/cvc-immunization-bundle/cvc-valuesets-fhir.json');
      var cvcValueSets = await JSON.parse(jsonobject.toString());
      var parser = new ParseConformance(false, FhirVersions.R4);
      parser.parseBundle(cvcValueSets);
      var fhir = new Fhir(parser);
      var results = fhir.validate(patientpassport, {errorOnUnexpected: false}); 
      console.log(results); */
    },

    processFHIRBundle: function(cvcbundlefile) {
        var cvcbundle = fs.readFileSync(cvcbundlefile,'utf-8');
        
    },

    generateOCAFormatOverlay: function(immnzpassportdoc, context, schemabase_hashlink) {
        const formathbs = fs.readFileSync('templates/cvc-immunization-bundle/cvc-immunization-bundle-formatoverlay.hbs', 'utf-8');
        const compiled_template = Handlebars.compile(formathbs);
        var result = compiled_template(immnzpassportdoc,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "fhir-profile-ref": "CA-Core",
                "fhir-profile-uri": "http://hl7.org/fhir/ca/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/format/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        fs.writeFileSync(`oca-artifacts/format-overlay/${context}-format.jsonld`, result);
      },
      
      generateOCAEntryOverlay: function (immnzpassportdoc, context, schemabase_hashlink) {
        const entryhbs = fs.readFileSync('templates/cvc-immunization-bundle/cvc-immunization-bundle-entryoverlay.hbs', 'utf-8');
        const compiled_template = Handlebars.compile(entryhbs);
        var result = compiled_template(immnzpassportdoc,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "fhir-profile-ref": "CA-Core",
                "fhir-profile-uri": "http://hl7.org/fhir/ca/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/entry/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        fs.writeFileSync(`oca-artifacts/entry-overlay/${context}-entry.jsonld`, result);
      },
      
      generateOCACharacterOverlay: function(immnzpassportdoc, context, schemabase_hashlink) {
        const formathbs = fs.readFileSync('templates/cvc-immunization-bundle/cvc-immunization-bundle-characteroverlay.hbs', 'utf-8');
        const compiled_template = Handlebars.compile(formathbs);
        var result = compiled_template(immnzpassportdoc,{
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
      
      generateOCAInformationOverlay: function(immnzpassportdoc, context, schemabase_hashlink) {
        const informationhbs = fs.readFileSync('templates/cvc-immunization-bundle/cvc-immunization-bundle-informationoverlay.hbs', 'utf-8');
        const compiled_template = Handlebars.compile(informationhbs);
        var result = compiled_template(immnzpassportdoc,{
            "data": {
                "author": "FHIR OCA WG",
                "umls-cui": "UMLS:C0008960",
                "role": "TBD",
                "fhir-profile-ref": "CA-Core",
                "fhir-profile-uri": "http://hl7.org/fhir/ca/core/StructureDefinition/",
                "oca-artifact-type": "spec/overlay/information/1.0",
                "dpv-purpose": "dpv:MedicalHealth",
                "schemabase-hashlink": schemabase_hashlink
            }
        
        });
        fs.writeFileSync(`oca-artifacts/information-overlay/${context}-information.jsonld`, result);
      },

      generateOCALabelOverlay: function(immnzpassportdoc, context, schemabase_hashlink) {
        const labelhbs = fs.readFileSync('templates/cvc-immunization-bundle/cvc-immunization-bundle-labeloverlay.hbs', 'utf-8');
        const compiled_template = Handlebars.compile(labelhbs);
        var result = compiled_template(immnzpassportdoc,{
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
      
      generateOCAArtifactsFromR4Bundle: async function(cfg, bundlepath,profile) {
      
        module.exports.initHashlinkCache()
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
        .catch((error) => {console.log(error);});
        
      },
      
      generateSchemaBase: async function(configobj, ctx, profile, bundle) {
        let bundlehbs = fs.readFileSync(`templates/${profile}/${profile}-schemabase.hbs`, 'utf-8');
        let compiled_template = Handlebars.compile(bundlehbs);
        let result = compiled_template(bundle,{"data": configobj});
          
        let ocafile = `oca-artifacts/schema-base/${ctx}.jsonld`;
        var schemabasehl;
        fs.writeFileSync(ocafile, result);
        schemabasehl = await hashlinkutil.getHashlink(ocafile);
        //console.log(`getHashlink-genSchemaBase(${ocafile}): ${schemabasehl}`);
        return schemabasehl;
      } 
};

module.exports = cvcFhirOcaConverter;