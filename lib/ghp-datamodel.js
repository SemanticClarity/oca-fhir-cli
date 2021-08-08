class OCAEntity {
    classname;
    description;
    classification;
    attributes = [];

    constructor(cname, desc, classification = '') {
        this.classname = cname;
        this.description = desc;
        this.classification = classification;
    }

    addAttribute(attr) {
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
    classification;
    type =  'Text';
    blinding;
    format = {};
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

    setClassification(code) {
        this.classification = code;
    }

    getClassification() {
        return this.classification;
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

    setFormat(locale,format) {
        this.format[locale] = format;
    }

    setLabel(locale, value) {
        this.label[locale] = value;
    }

    setEntry(locale, value) {
        this.entry[locale] = value;
    }

    setInfo(locale, value) {
        this.info[locale] = value;
    }

    setCharEncoding(enc) {
        this.charencoding = enc;
    }

    getJSON(locale) {
        return {};
    }

}

module.exports = { OCAEntity, OCAattribute };

