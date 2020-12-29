const fs = require('fs');
const fhirpath = require('fhirpath');
var Fhir = require('fhir').Fhir;
var ParseConformance = require('fhir').ParseConformance;
var FhirVersions = require('fhir').Versions;

const main = async()=> {
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
  
}

main();
