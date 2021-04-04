const Handlebars = require("handlebars");
const fs = require('fs');
const { format } = require("path");
const fhirpath = require('fhirpath.js');
var Fhir = require('fhir').Fhir;
var ParseConformance = require('fhir').ParseConformance;
var FhirVersions = require('fhir').Versions;
const HashlinkUtils = require('./hashlink-utils');
const nsHelper = require('./jsonld-utils');


var handlebars = {
    hasEntryOverlay: Handlebars.registerHelper('hasEntryOverlay', function(resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);
        return fs.existsSync(`./data/entryoverlay-partials/${retval}-entry.json`);
    }),
    
    hasFormatOverlay: Handlebars.registerHelper('hasFormatOverlay', function(resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);
        return fs.existsSync(`./data/formatoverlay-partials/${retval}-format.json`);
    }),
    
    hasCharacterOverlay: Handlebars.registerHelper('hasCharacterOverlay', function(resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);
        return fs.existsSync(`./data/characteroverlay-partials/${retval}-character.json`);
    }),
    
    hasInformationOverlay: Handlebars.registerHelper('hasInformationOverlay', function(resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);
        return fs.existsSync(`./data/informationoverlay-partials/${retval}-info.json`);
    }),

    hasLabelOverlay: Handlebars.registerHelper('hasLabelOverlay', function(resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);
        return fs.existsSync(`./data/labeloverlay-partials/${retval}-label.json`);
    }),
    
    hasBITdefined: Handlebars.registerHelper('hasBITdefined', function (resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);      
        return fs.existsSync(`./data/bit-partials/${retval}.json`);
      }),
    
    getBITProperties: Handlebars.registerHelper('getBITProperties' , function(resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);
        var jsonobj = fs.readFileSync(`./data/bit-partials/${retval}.json`);
        var bit_partial = JSON.parse(jsonobj);
        for(var i=0; i<bit_partial.pii_attributes.length; i++){
            bit_partial.pii_attributes[i] = new Handlebars.SafeString(`"${bit_partial.pii_attributes[i]}"`);
        }
        var list_with_quotes = bit_partial.pii_attributes.join(",");
        return list_with_quotes;
      }),
    
    getFormatOverlay: Handlebars.registerHelper('getFormatOverlay', function(resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);
        var jsonobj = fs.readFileSync(`./data/formatoverlay-partials/${retval}-format.json`);
        var formatpartial = JSON.parse(jsonobj); 
        return new Handlebars.SafeString(JSON.stringify(formatpartial, null, 2));
    }),

    getEntryOverlay: Handlebars.registerHelper('getEntryOverlay', function(resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);
        var jsonobj = fs.readFileSync(`./data/entryoverlay-partials/${retval}-entry.json`);
        var entrypartial = JSON.parse(jsonobj); 
        return new Handlebars.SafeString(JSON.stringify(entrypartial, null, 2));
    }),

    getEntryOverlay: Handlebars.registerHelper('getCharacterOverlay', function(resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);
        var jsonobj = fs.readFileSync(`./data/characteroverlay-partials/${retval}-character.json`);
        var characterpartial = JSON.parse(jsonobj); 
        return new Handlebars.SafeString(JSON.stringify(characterpartial, null, 2));
    }),

    getEntryOverlay: Handlebars.registerHelper('getInformationOverlay', function(resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);
        var jsonobj = fs.readFileSync(`./data/informationoverlay-partials/${retval}-info.json`);
        var infopartial = JSON.parse(jsonobj); 
        return new Handlebars.SafeString(JSON.stringify(infopartial, null, 2));
    }),

    getLabelOverlay: Handlebars.registerHelper('getLabelOverlay', function(resourcename) {
        let retval = nsHelper.trimNamespacePrefix(resourcename);
        var jsonobj = fs.readFileSync(`./data/labeloverlay-partials/${retval}-label.json`);
        var labelpartial = JSON.parse(jsonobj); 
        return new Handlebars.SafeString(JSON.stringify(labelpartial, null, 2));
    }),

    getConformancePayload: Handlebars.registerHelper('getConformancePayload', function(context) {
        return new Handlebars.SafeString(JSON.stringify(context));
    }),

    getHashlinkForPrimitive: Handlebars.registerHelper('getHashlinkForPrimitive', function(context) {
        console.log("getHashlinkForPrimitive: "+context);
        let hashlinkstr = HashlinkUtils.get(context);
        //console.log(`cache.get-Handlebars(${context}) = ${hashlinkstr}`);
        //if hashlinkstr == null, alert for unsupported fhir resource type
        return hashlinkstr;
    }),

    initPartials:  function() {
        let content = fs.readFileSync('templates/cdc-cvrs-v2.5/cdc-cvrs-v2.5-R4jsonld-bundle.hbs');
        Handlebars.registerPartial('cdc-cvrs-v2.5-R4jsonld-bundle-hbs', content.toString());
    }

};

module.exports = handlebars


