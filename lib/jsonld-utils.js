
const nsPrefixes = Object.freeze(
    {
        FHIR: 'fhir:',
        OCA: 'oca:'
    }
);

module.exports = {
    trimNamespacePrefix: (resourcename) => {
        if (resourcename !== null) {
            if (typeof(resourcename === 'string') ||(resourcename instanceof String)) {
              if (resourcename.startsWith(nsPrefixes.FHIR,0)) {
                resourcename = resourcename.substr(5) ;
                //console.log("cache.get("(resourcename+") = "+ cache.get(resourcename));
              }
            }
        }
        return resourcename;
    }
};