fhirpath = require('fhirpath');
const fhirpath_r4_model = require('fhirpath/fhir-context/r4');
var fs = require('fs');

var cvcFhirOcaConverter = {
    verifyCVCBundle: function() {

    },
    processCVCBundle: function(cvcbundlefile) {
        var cvcbundle = fs.readFileSync(cvcbundlefile,'utf-8');
        
    }
};

module.exports = cvcFhirOcaConverter