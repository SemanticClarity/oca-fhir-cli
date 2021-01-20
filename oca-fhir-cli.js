
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
//const {cvcFhirOcaConverter} = require('./lib/cvc-immunization-passport');

var required_profiles = {};

/*

var Fhir = require('fhir').Fhir;
var ParseConformance = require('fhir').ParseConformance;
var FhirVersions = require('fhir').Versions;
*/


function loadProfile(key) {
  if (!required_profiles[key]) {
    try {
      let defaultlib = './lib/';
      required_profiles[key] = require(defaultlib+key);
    }
    catch(error) {
      console.error(`Unable to load module for profile (${key}): ${error}`);
      exit
    }
    
  }
  return required_profiles[key];
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
  var converter = loadProfile(profile_name);

  if (converter != null) {
    console.log(`Profile ${profile_name} loaded!`)

    converter.verifyCVCBundle();
    converter.generateOCAArtifacts(config, fhirbundle, profile_name);
  }
}

main();
