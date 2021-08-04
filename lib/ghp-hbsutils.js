const Handlebars = require("handlebars");
const fs = require('fs');
const symtable = require('./cvc2ghp');

var ghphandlebars = {
    getAttributesSection: Handlebars.registerHelper('getAttributesSection', function(classname) {
        let dictionary = symtable.getDictionary();
        //console.log(`ghp-bhsutils::getAttributesSection(${classname})`);
        var schemaObj = dictionary.get(classname);
        let retval = {};
        for(var i=0; i<schemaObj.attributes.length; i++){
            retval[schemaObj.attributes[i].attrName] = schemaObj.attributes[i].type;
        }
        return JSON.stringify(retval);
    }),

    getGHPLabelOverlay: Handlebars.registerHelper('getGHPLabelOverlay', function(classname, locale) {
        let dictionary = symtable.getDictionary();
        var schemaObj = dictionary.get(classname);
        let retval = {};
        for(var i=0; i<schemaObj.attributes.length; i++){
            retval[schemaObj.attributes[i].attrName] = schemaObj.attributes[i].label[locale];
        }
        return JSON.stringify(retval);
    }),

    getGHPInfoOverlay: Handlebars.registerHelper('getGHPInfoOverlay', function(classname,locale) {
        let dictionary = symtable.getDictionary();
        var schemaObj = dictionary.get(classname);
        let retval = {};
        for(var i=0; i<schemaObj.attributes.length; i++){
            retval[schemaObj.attributes[i].attrName] = schemaObj.attributes[i].info[locale];
        }
        return JSON.stringify(retval);
    }),

    getGHPEntryOverlay: Handlebars.registerHelper('getGHPEntryOverlay', function(classname,locale){
        let dictionary = symtable.getDictionary();
        var schemaObj = dictionary.get(classname);
        let retval = {};
        for(var i=0; i<schemaObj.attributes.length; i++){
            retval[schemaObj.attributes[i].attrName] = schemaObj.attributes[i].entry[locale];
        }
        return JSON.stringify(retval);
    }),
    getGHPFormatOverlay: Handlebars.registerHelper('getGHPFormatOverlay', function(classname,locale){
        let dictionary = symtable.getDictionary();
        var schemaObj = dictionary.get(classname);
        let retval = {};
        for(var i=0; i<schemaObj.attributes.length; i++){
            let f = schemaObj.attributes[i].format;
            if (f) {
                retval[schemaObj.attributes[i].attrName] = f;
            }
        }
        return JSON.stringify(retval);
    }),
    getGHPCharEncOverlay: Handlebars.registerHelper('getGHPCharEncOverlay', function(classname,locale){
        let dictionary = symtable.getDictionary();
        var schemaObj = dictionary.get(classname);
        //console.log(`getGHPCharEncOverlay:: ${JSON.stringify(schemaObj)}`);
        let retval = {};
        for(var i=0; i<schemaObj.attributes.length; i++){
            let cenc = schemaObj.attributes[i].charencoding;
            if (cenc) {
                retval[schemaObj.attributes[i].attrName] = cenc;
            }
        }
        return JSON.stringify(retval);
    }),
    getAttributesFromBundle: Handlebars.registerHelper('getAttributesFromBundle', function(root) {

    })
    
};

module.exports = ghphandlebars;