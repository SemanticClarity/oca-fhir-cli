class OCAEntity {
    classname;
    description;
    classification;
    attributes = [];

    constructor(cname, desc, classification = '') {
        this.classname = cname;
        this.description = desc;
        this.classification = classification
    }

    addAttribute = function(attr) {
        this.attributes.push(attr);
    }

    getAttributes =  function() {
        let retval =  {};
        this.attributes.forEach((attr) => {
            retval[attr.getAttrName()] = attr.getAttrType();
        });
        return retval;
    }

    getJSON(locale) {
        return {
        '_classname': this.classname,
        '_description': this.description,
        '_classification': this.classification,
        '_attributes': this.getAttributes()
        };
    }
}

class OCAattribute {
    attrName;
    type =  'Text';
    blinding;
    format = undefined;
    label = {
            'en-CA': '',
            'fr-CA': ''
        };
    entry = {
            'en-CA': '',
            'fr-CA': ''
        };
    info = {
            'en-CA': '',
            'fr-CA': ''
    };

    charencoding = 'utf-8';

    constructor(values = []) {

    }

    getAttrName() {
        return this.attrName;
    }

    getAttrType() {
        return this.type;
    }

    setAttrName(name) {
        this.attrName = name;
    }
    
    setAttrType(type) {
        this.type = type;
    }

    setBlinding(blinding) {
        this.blinding = blinding;
    }

    setFormat(format) {
        this.format = format;
    }

    setLabel(obj) {
        this.label = obj;
    }

    setEntry(obj) {
        this.entry = obj;
    }

    setInfo(obj) {
        this.info = obj;
    }

    setCharEncoding(enc) {
        this.charencoding = enc;
    }

    getJSON(locale) {
        return {};
    }

}

module.exports = { OCAEntity, OCAattribute };

