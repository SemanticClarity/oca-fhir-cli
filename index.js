
const fs = require('fs');
var path = require('path');
var os   = require('os');
var Handlebars = require("handlebars");
const hbs = require('./lib/hbs-utils');
const fhirpath = require('fhirpath.js');
const hashlinkutil = require('./lib/hashlink-utils');
const ConfigStore = require('configstore');
const pkg = require('./package.json');
const { exit } = require('process');
const { profile } = require('console');

/*

var Fhir = require('fhir').Fhir;
var ParseConformance = require('fhir').ParseConformance;
var FhirVersions = require('fhir').Versions;
*/
function generateOCAFormatOverlay(immnzpassportdoc, context, schemabase_hashlink) {
  const formathbs = fs.readFileSync('templates/cvc-immunization-passport/cvc-immunization-passport-formatoverlay.hbs', 'utf-8');
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

async function initHashlinkCache() {
  let hlcache = await hashlinkutil.processDirFiles(`./data/oca-primitives/schema-base`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(hlcache);
    },0);
  });
}

async function generateOCAArtifacts(cfg, bundlepath,profile) {

  initHashlinkCache()
  .then(async (hlcache) => {
    var context = "oca-"+profile;
    var fhirbundlefile = fs.readFileSync(bundlepath);
    var bundleobject = await JSON.parse(fhirbundlefile);
    let hl = await generateSchemaBase(cfg,context,profile, bundleobject);
    generateOCAEntryOverlay(bundleobject,context,hl);
    generateOCAFormatOverlay(bundleobject,context,hl);
    generateOCAInformationOverlay(bundleobject,context,hl);
    generateOCACharacterOverlay(bundleobject,context,hl);
  })
  .catch((error) => {console.log(error)});
  
}

async function generateSchemaBase(configobj, ctx, profile, bundle) {
  let bundlehbs = fs.readFileSync(`templates/${profile}/${profile}-schemabase.hbs`, 'utf-8');
  let compiled_template = Handlebars.compile(bundlehbs);
  let result = compiled_template(bundle,{"data": configobj});
    
  let ocafile = `oca-artifacts/schema-base/${ctx}.jsonld`;
  var schemabasehl;
  fs.writeFileSync(ocafile, result);
  schemabasehl = await hashlinkutil.getHashlink(ocafile);
  console.log(`getHashlink-genSchemaBase(${ocafile}): ${schemabasehl}`);
  return schemabasehl;
} 

const main = async() => {
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
  var argv = require('yargs/yargs')(process.argv.slice(2)).argv;
  let configFilePath = './config/oca-fhir-cli.json';
  let configStr = fs.readFileSync(configFilePath);
  var config =  await JSON.parse(configStr);
  
  //console.log(config);

  var profile_name;
  if (argv.profile) {
    profile_name = argv.profile;
    if (!fs.existsSync(`templates/${profile_name}`)) {
      console.log("Exiting: Unsupported profile: "+ profile_name);
      exit(1);
    }
    
  }  else {
    console.log("Exiting: Please provide profile name using --profile option");
    exit(1);
  }

  var fhirbundle;
  if (argv.input) {
    fhirbundle = argv.input;
    if (!fs.existsSync(fhirbundle)) {
      console.log("Exiting: Input FHIR Bundle does not exist["+fhirbundle+"]");
      exit(2);
    }
  } else {
    console.log("Exiting: Please provide fhir bundle input file using --input option");
    exit(3);
  }

  generateOCAArtifacts(config, fhirbundle, profile_name);

}

main();
