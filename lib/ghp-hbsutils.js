const Handlebars = require("handlebars");
const fs = require('fs');
const symtable = require('./cvc2ghp');

var ghphandlebars = {
    getAttributesSection: Handlebars.registerHelper('getAttributesSection', function(classname) {
        let dictionary = symtable.getDictionary();
        var schemaObj = dictionary.get(classname);
        let retval = {};
        for(var i=0; i<schemaObj.attributes.length; i++){
            retval[schemaObj.attributes[i].attrName] = schemaObj.attributes[i].type;
            //console.log("retval["+i+"] = "+ retval[i]);
        }
        return JSON.stringify(retval);
    }),

    getGHPLabelOverlay: Handlebars.registerHelper('getGHPLabelOverlay', function(classname, locale) {
        let dictionary = symtable.getDictionary();
        var schemaObj = dictionary.get(classname);
        let retval = {};
        for(var i=0; i<schemaObj.attributes.length; i++){
            retval[schemaObj.attributes[i].attrName] = schemaObj.attributes[i].label[locale];
            //console.log("retval["+i+"] = "+ retval[i]);
        }
        return JSON.stringify(retval);
    })
    
};

module.exports = ghphandlebars