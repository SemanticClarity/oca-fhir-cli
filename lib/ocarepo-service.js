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
    
    async uploadOCASchema(stream) {
        const url = `${this._baseUrl}/namespaces/${this._namespace}/schemas`;
        //const stream = fs.createReadStream(uploadStream);
        let formData = new FormData();
        formData.append('file', stream);
        const formHeaders = formData.getHeaders();
        
        /* await this._apiServer.post(url, formData, {headers: {... formHeaders} })
        .then(response => {console.log(response); return (response);})
        .catch(error => {console.log(error); return (error);}); */
    
        const response = await this._apiServer.post(url, formData, {headers: {... formHeaders} });
        return (response);
        
    }

}


module.exports = { OCARepoService };

