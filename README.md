# oca-fhir-cli
Extensible CLI tool to convert FHIR R4 bundle in to OCA Schema base and core overlays (Character, Entry, Format, Information and Label overlays). This release contains an example module for CVC Immunization Bundle. i.e. The tool will convert a CVC Immunization Bundle (of type *collection*) with the following *resourceType* elements: *Patient, Practitioner, Immunization, ImmunizationRecommendation*. The generated OCA artifacts (schema base and overlays) may then be used in your application to create appropriate forms (for data capture), sub-set schemas can be used to create VC's (verifiable credentials) for decentralized data sharing, depending on the use case.

![oca-fhir-cli usage scenario](doc/images/FHIR-OCA-Processing-011221.png)

## Usage

### Pre-requisites
Nodejs v14.15.3 or later (very likely that this project will rely on nodejs v14 or later due to dependencies)


`$node fhir-oca-cli.js --profile cvc-immunization-bundle --input examples/patient-bundle-instance-example.json`

### Release notes
1. Generated label overlay jsonld should be treated as a representative instance document only: we expect this to be edited for appropriate use in web forms based on jurisdiction (e.g. language, FHIR profiles in use).
2. Blinding Identity attributes identified in schema base is not intended to be prescriptive. FHIR resource properties that map to Who, What, When, Where, Why are currently flagged.
2. Full validation of FHIR Profiles, Extensions and use of appropriate ValueSets prior to use of this cli tool is assumed. We recommend using FHIR Validator tool against the input FHIR R4 bundle, prior to processing using this cli tool to create corresponding OCA artifacts.

### To Do
- [ ] Add more example bundles for specific jurisdictional profiles (e.g. us-core-immunization)
- [ ] OCA FHIR Implementation Guide
- [ ] cli option to create (templates) for new profiles e.g. WHO Immunization profile etc.
- [ ] cli option to create VC (verifiable credentials) using OCA schema base or appropriate overlay (e.g. Subset)
- [ ] cli option to 'filter' input FHIR R4 Bundle entries prior to OCA artifact generation (customize *conformance-payload*) prior to OCA artifact generation

### FAQ
1. Is there a list of FHIR R4 resources that are supported within input Bundles?

   This release supports the following FHIR R4 resource types: *Bundle, Consent, Contract, ImagingStudy, Immunization, Patient, Practitioner*.
   Other resources to be supported: 
- ImmunizationEvaluation
- RelatedPerson
- PractitionerRole
- Group
- Organization
- Location

2. Is this cli tool extensible?
 Yes, the driver script (*oca-fhir-cli.js*) provides a mechanism to load js modules that implement extension functionality for specific applications such as Immunization Passport etc. Such extensions can be made available in the *lib* directory. The extension module should implement *verifyBundle* and *generateOCAArtifacts* functions to suit application needs.
