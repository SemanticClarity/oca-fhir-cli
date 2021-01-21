# oca-fhir-cli
Extensible CLI tool to convert FHIR R4 bundle in to OCA Schema base and core overlays (Character, Entry, Format and Information overlays). This release contains an example module for CVC Immunization Bundle. i.e. The tool will convert a CVC Immunization Bundle (of type *collection*) with the following *resourceType* elements: *Patient, Practitioner, Immunization, ImmunizationRecommendation*. The generated OCA artifacts (schema base and overlays) may then be used in your application to create appropriate forms (for data capture), sub-set schemas can be used to create VC's (verifiable credentials) for decentralized data sharing, depending on the use case.

## Usage

### Pre-requisites
Nodejs v14.15.3 or later (very likely that this project will rely on nodejs v14 or later due to dependencies)


`$node fhir-oca-cli.js --profile cvc-immunization-bundle --input examples/patient-bundle-instance-example.json`

### To Do
- [ ] Add more example bundles for specific jurisdictional profiles (e.g. us-core-immunization)
- [ ] OCA FHIR Implementation Guide
- [ ] cli option to create (templates) for new profiles e.g. WHO Immunization profile etc.
- [ ] cli option to create VC (verifiable credentials) using OCA schema base or appropriate overlay (e.g. Subset)
- [ ] cli option to 'filter' input FHIR R4 Bundle entries prior to OCA artifact generation (customize *conformance-payload*) prior to OCA artifact generation

### FAQ
1. What FHIR R4 resources are supported within input Bundles?

   This release supports the following FHIR R4 resource types: *Bundle, Consent, Contract, ImagingStudy, Immunization, Patient, Practitioner*
