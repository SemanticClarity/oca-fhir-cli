const fs = require('fs');
var hbs = require('./lib/hbs-utils.js');
var Handlebars = require("handlebars");
const fhirpath = require('fhirpath.js');

/*

var Fhir = require('fhir').Fhir;
var ParseConformance = require('fhir').ParseConformance;
var FhirVersions = require('fhir').Versions;
*/

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
    console.log(result.toString());
  
}

main();
