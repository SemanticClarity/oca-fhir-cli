const { throws } = require('assert');
var FormData = require('form-data');
var fs = require('fs');

class OCARepoService {
    constructor(baseUrl, namespace) {
        this._apiServer = require('axios');
        this._baseUrl = baseUrl;
        this._namespace = namespace;
        this._headers = {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'type': 'application/json'
        };
    }
    
    async uploadOCASchema(uploadFile) {
        const url = `${this._baseUrl}/namespaces/${this._namespace}/schemas`;
        const stream = fs.createReadStream(uploadFile);
        let formData = new FormData();
        formData.append('file', stream);
        const formHeaders = formData.getHeaders();
        
        await this._apiServer.post(url, formData, {headers: {... formHeaders} })
        .then(response => response)
        .catch(error => error)
    }
}


module.exports = { OCARepoService };

