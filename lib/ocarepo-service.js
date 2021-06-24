const url = require('url');


class OCARepoService {
    constructor(baseUrl, namespace) {
        this._apiServer = require('axios');
        this._baseUrl = baseUrl;
        this._namespace = namespace;
        this._headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        };
    }
    
    uploadOCASchema(payload) {
        console.info('OCA Repo Service: POST to url: '+ `${this._baseUrl}/namespaces/${this._namespace}/schemas`);
        this._apiServer(
            {
                method: 'post',
                url: `${this._baseUrl}/namespaces/${this._namespace}/schemas`,
                headers: this._headers,
                data: payload
            }
        )
        .then(
            function(response) {
                console.log(response.data);
            }
        )
        .catch(
            function(error) {
                if (error.response) {
                    console.log(error.response.data);
                    console.log(error.response.status);
                    console.log(error.response.headers);
                } else {
                    console.log(error.message);
                    //console.log(error.request);
                }
            }
        );
    }
}

module.exports = { OCARepoService }

