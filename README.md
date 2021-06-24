# oca-fhir-cli
Extensible CLI tool to convert FHIR R4 bundles into OCA Schema base and core overlays (Character, Entry, Format, Information and Label). 

**Caveats:** The following modules are provided strictly for demonstration purposes only, and not intended for production use. These modules have not been reviewed or approved by governing entities relevant to the standards below.

The current release contains the following example modules:
1. Good Health Pass Draft examples: The directory https://github.com/SemanticClarity/oca-fhir-cli/tree/master/examples/good-health-pass-draft contains examples of draft GHP Certificates, Credentials and Passes representing data mapping and descriptive property labels consistent with the current EU DCC requirements. These draft JSON-LD schemas do not contain property mappings for the proposed GHP entities 'BiometricMarker' and 'Recipient'. Updates will be provided as the data formats specifications for GHP artifacts are finalized.
2. Canadian Vaccine Catalog (CVC) Immunization Bundle: The tool will convert a [CVC Immunization](https://cvc.canimmunize.ca/en/home) Bundle of type *collection* with the following *resourceType* elements: *Patient, Practitioner, Immunization, ImmunizationRecommendation*. The generated OCA artifacts (schema base and overlays) may then be used in your application to create appropriate forms (for data capture), sub-set schemas can be used to create VC's (verifiable credentials) for decentralized data sharing, depending on the use case.
3. CDC Covid-19 Vaccination Reporting example (work in progress): Input file example is provided in csv format, [per CDC Covid-19 reporting specification](https://www.cdc.gov/vaccines/covid-19/reporting/requirements/index.html). The tool will covert this input file in to a FHIR R4 bundle internally. Currently, this input csv is mapped to a FHIR R4 Bundle with *Patient, Immunization*, resources. This mapping is customizable via the use of a *ConceptMap* (provided), but the recommended approach is to follow the community best practice of creating a FHIR Implementation Guide based.


![oca-fhir-cli usage scenario](doc/images/SemanticDataPipeline-FHIR.png)

## Usage

### Pre-requisites
Nodejs v14.15.3 or later (very likely that this project will rely on nodejs v14 or later due to dependencies)

`$node oca-fhir-cli.js --profile cvc2ghp --r4bundle .\examples\cvc-immunization-bundle\patient-bundle-instance-example.json`

`$node oca-fhir-cli.js --profile cvc-immunization-bundle --input examples/patient-bundle-instance-example.json`

`$node oca-fhir-cli.js --profile cdc-cvrs-v2.5 --csv .\examples\cdc-cvrs-v2.5\sample-data.csv`



### Release notes
1. CDC CVRS profile option is WIP. But you can browse the *examples/cdc-cvrs-2.5* directory to review input csv, FHIR R4 json bundle, ConceptMap and other conformance artifacts. Generated output files can be found under *oca-artifacts/cdc-cvrs-v2.5* directory. Basename of generated files are based on vax_event_id in input csv data. Files named *vc-.jsonld* are example vaccination certificate files based on W3C CCG candidate work item [vaccination vocabulary](https://w3c-ccg.github.io/vaccination-vocab/).
2. EU EHealth profile is not supported by this CLI at this time. Only the w3c ccg to FHIR R4 vocabulary mapping is supported via the JSONLD Context files (see item #3 below).
3. *[JSONLD FHIR Context files for Vaccination Certificates by Jurisdiction](data/r4/jsonld-context-files)* directory contains 2 context files that can be used to map the w3c ccg vaccination vocabulary to different jurisdictional requirements using HL7 FHIR R4 resource model. JSONLD Context file names are named after the same profiles used in this module (e.g. cdc-cvrs-v2.5, and eu-ehealth).
4. *[JSONLD Framing definition (CDC CVRS)example for R4 immunization bundles](data/jsonld-frames)* directory contains an example jsonld framing definition that can be used against the R4 JSONLD Bundle for *cdc-cvrs-v2.5* profile.
5. *[Generated output files for CDC CVRS profile](generated/cdc-cvrs-v2.5)* directory contains vaccintation certificate jsonld files per w3c ccg vocabulary, OCA base schema and JSONLD R4 FHIR Bundles for each record in the input csv file.
6. Generated OCA label overlay jsonld should be treated as a representative instance document only: we expect this to be edited for appropriate use in web forms based on jurisdiction (e.g. language, FHIR profiles in use).
7. OCA Blinding Identity Taxonomy attributes identified in schema base is not intended to be prescriptive. FHIR resource properties that map to Who, What, When, Where, Why are currently flagged.
8. Full validation of FHIR Profiles, Extensions and use of appropriate ValueSets prior to use of this cli tool is assumed. We recommend using FHIR Validator tool against the input FHIR R4 bundle, prior to processing using this cli tool to create corresponding OCA artifacts.


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
