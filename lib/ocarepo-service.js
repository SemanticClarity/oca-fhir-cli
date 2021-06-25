const { throws } = require('assert');

class OCARepoService {
    constructor(baseUrl, namespace) {
        //this._apiServer = require('axios');
        this._apiServer = require('https');
        this._baseUrl = baseUrl;
        this._namespace = namespace;
        this._headers = {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
        };
    }
    
    uploadOCASchema(payload) {
        console.info('OCA Repo Service: POST to url: '+ `${this._baseUrl}/namespaces/${this._namespace}/schemas`);
        /* this._apiServer(
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
        ); */
        const data = JSON.stringify(payload);
        const options = {
            protocol: 'https:',
            hostname: 'repository.oca.argo.colossi.network',
            port: 443,
            path: `/api/v3/namespaces/${this._namespace}/schemas`,
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
                'Content-Length': data.length
            }
        };
        const req = this._apiServer.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`)
          
            res.on('data', d => {
              process.stdout.write(d)
            })
          })
          
          req.on('error', error => {
            console.error(error)
          })
          
          req.write(data)
          req.end()

    }
}

module.exports = { OCARepoService }

