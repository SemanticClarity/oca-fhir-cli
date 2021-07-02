
const fs = require('fs');
var path = require('path');
var os   = require('os');
var Handlebars = require("handlebars");
const hbs = require('./lib/hbs-utils');
const ghphbs = require('./lib/ghp-hbsutils');
//const fhirpath = require('fhirpath.js');
const hashlinkutil = require('./lib/hashlink-utils');
const ConfigStore = require('configstore');
const pkg = require('./package.json');
const { exit } = require('process');

var required_profiles = {};



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
  */
  var argv = require('yargs/yargs')(process.argv.slice(2)).argv;

  var configFilePath;
  if (argv.config) {
    configFilePath = argv.config;
    if (!fs.existsSync(configFilePath)) {
      console.log("Exiting: Config file not accessible: "+ configFilePath);
      exit(4);
    }
    
  } else {
    console.log('Loading default config file');
    configFilePath = './config/oca-fhir-cli.json';
  }

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
  var converter = loadProfile(profile_name);

  var fhirbundle, csvfile;
  if (argv.r4bundle) {
    fhirbundle = argv.r4bundle;
    if (!fs.existsSync(fhirbundle)) {
      console.log("Exiting: Input FHIR Bundle does not exist["+fhirbundle+"]");
      exit(2);
    }
    if (converter != null) {
      console.log(`Profile ${profile_name} loaded`)
      converter.verifyFHIRBundle(fhirbundle);
      converter.generateOCAArtifactsFromR4Bundle(config, fhirbundle, profile_name);
    }
  } else if (argv.csv) {
    csvfile = argv.csv;
    if (!fs.existsSync(csvfile)) {
      console.log("Exiting: Input CSV file does not exist["+csvfile+"]");
      exit(2);
    }
    converter.generateFHIRBundles(config,profile_name,csvfile)
    .then( (fhirbundles) => {
       //console.log("1.Received FHIRBundles: "+fhirbundles);
       return converter.generateOCAArtifactsFromR4Bundle(config, profile_name, ...fhirbundles);
      }
    );
  }
}

main();
