
var assert = require('assert');
const { expect } = require('chai');

const fs = require('fs-extra');
const path = require('path');
const { OCARepoService } = require('../lib/ocarepo-service');

const ocaRepoBaseUrl = 'https://repository.oca.argo.colossi.network/api/v3';
const ocaNamespace = 'OCA-CLI-TEST';
describe('oca-fhir-cli: OCA Repository Char Enc overlay upload test', function () {
    it('Testcase should return DRI of the en-CA OCA Char Enc overlay posted to OCA repository', async function () {
        let fileToUpload = path.resolve(__dirname,'../generated/cvc2ghp/characterenc-overlay/ghp-vaxcredential-characterencoverlay-fr-CA.json');
        console.info("Running ghp char enc test case");
        let resp = await runTestCase(fileToUpload);
        console.log(resp.data.DRI);
        return expect(resp.data.success).to.equal(true);
    });
});



//this is the oca base schema instance generated from the previous oca cli step (FHIR bundle to OCA artifacts)



async function runTestCase(uploadFile)  {
    let repo = new OCARepoService(ocaRepoBaseUrl,ocaNamespace);
    let stream = fs.createReadStream(uploadFile);
    let response = await repo.uploadOCASchema(stream);
    return response;
}



