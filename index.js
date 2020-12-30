const fs = require('fs');
var hbs = require('./lib/hbs-utils.js');
var Handlebars = require("handlebars");
const fhirpath = require('fhirpath.js');
const hashlinkutil = require('./lib/hashlink-utils');

/*

var Fhir = require('fhir').Fhir;
var ParseConformance = require('fhir').ParseConformance;
var FhirVersions = require('fhir').Versions;
*/
function generateOCAFormatOverlay(immnzpassportdoc, context, schemabase_hashlink) {
  const formathbs = fs.readFileSync('templates/oca-overlays/oca-fhir-format-overlay.hbs', 'utf-8');
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
}

function generateOCAEntryOverlay(immnzpassportdoc, context, schemabase_hashlink) {
  const entryhbs = fs.readFileSync('templates/cvc-immunization-passport/cvc-immunization-passport-entryoverlay.hbs', 'utf-8');
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
}

function generateOCACharacterOverlay(immnzpassportdoc, context, schemabase_hashlink) {
  const formathbs = fs.readFileSync('templates/cvc-immunization-passport/cvc-immunization-passport-characteroverlay.hbs', 'utf-8');
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
}

function generateOCAInformationOverlay(immnzpassportdoc, context, schemabase_hashlink) {
  const informationhbs = fs.readFileSync('templates/cvc-immunization-passport/cvc-immunization-passport-informationoverlay.hbs', 'utf-8');
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
}

const main = async()=> {
  /*
  var cvcimmunizationdoc = fs.readFileSync('examples/cvc-immunizationpassport/patient-bundle-instance-example.json');
  var patientpassport = await JSON.parse(cvcimmunizationdoc);
  if (fhirpath.evaluate(patientpassport, 'Bundle.where(type = \'collection\')')) {
    var retval = fhirpath.evaluate(patientpassport, 'Bundle.entry.resourceType');
    for (var loop = 0; loop < retval.length; loop++) {
      console.log("retval["+loop+"]: "+ retval[loop]);
    }
  }
  

  var jsonobject = fs.readFileSync('examples/cvc-immunizationpassport/cvc-valuesets-fhir.json');
  var cvcValueSets = await JSON.parse(jsonobject.toString());
  var parser = new ParseConformance(false, FhirVersions.R4);
  parser.parseBundle(cvcValueSets);
  var fhir = new Fhir(parser);
  var results = fhir.validate(patientpassport, {errorOnUnexpected: false}); 
  console.log(results);
  */
  var cvcimmunizationdoc = fs.readFileSync('examples/cvc-immunizationpassport/patient-bundle-instance-example.json');
  var patientpassport = await JSON.parse(cvcimmunizationdoc);
  if (fhirpath.evaluate(patientpassport, 'Bundle.where(type = \'collection\')')) {
    var retval = fhirpath.evaluate(patientpassport, 'Bundle.entry.resourceType');
    for (var loop = 0; loop < retval.length; loop++) {
      console.log("retval["+loop+"]: "+ retval[loop]);
    }
  }
  const bundlehbs = fs.readFileSync('templates/cvc-immunization-passport/cvc-immunization-passport-schemabase.hbs', 'utf-8');
  const compiled_template = Handlebars.compile(bundlehbs);
  var result = compiled_template(patientpassport,{
    "data": {
        "author": "FHIR OCA WG",
        "umls-cui": "UMLS:C0008960",
        "role": "TBD",
        "fhir-profile-ref": "CA-Core",
        "fhir-profile-uri": "http://hl7.org/fhir/ca/core/StructureDefinition/",
        "oca-artifact-type": "spec/schema_base/1.0",
        "dpv-purpose": "dpv:MedicalHealth"
    }
    });
    
    var context = 'oca-cvc-immunization-passport';
    fs.writeFileSync(`oca-artifacts/schema-base/${context}.jsonld`, result);
    var hashlinkstr;
    hashlinkstr = await hashlinkutil.getHashlink(`oca-artifacts/schema-base/${context}.jsonld`);
    generateOCAEntryOverlay(patientpassport,context,hashlinkstr);
  
}

main();
