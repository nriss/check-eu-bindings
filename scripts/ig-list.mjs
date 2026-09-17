// Liste des IG FHIR HL7 Europe couverts par le site (dernière version publiée de chacun).
// `fallbackTgzUrl` : utilisé si le package n'est pas (ou plus) trouvable sur le registre FHIR
// (packages.fhir.org / packages2.fhir.org) — le script télécharge alors directement ce package.tgz.
export const IG_LIST = [
  {
    id: 'extensions',
    displayName: 'HL7 Europe Extensions',
    packageName: 'hl7.fhir.eu.extensions',
    packageVersion: '1.3.1',
    publicationUrl: 'https://hl7.eu/fhir/extensions/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/extensions/package.tgz'
  },
  {
    id: 'base',
    displayName: 'Base and Core Profiles',
    packageName: 'hl7.fhir.eu.base',
    packageVersion: '2.0.0',
    publicationUrl: 'https://hl7.eu/fhir/base/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/base/package.tgz'
  },
  {
    id: 'laboratory',
    displayName: 'Laboratory Report',
    packageName: 'hl7.fhir.eu.laboratory',
    packageVersion: '2.0.0',
    publicationUrl: 'https://hl7.eu/fhir/laboratory/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/laboratory/package.tgz'
  },
  {
    id: 'mpd',
    displayName: 'Medication Prescription and Dispense',
    packageName: 'hl7.fhir.eu.mpd',
    packageVersion: '1.0.0',
    publicationUrl: 'https://hl7.eu/fhir/mpd/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/mpd/package.tgz'
  },
  {
    id: 'health-data-api',
    displayName: 'EU Health Data API',
    packageName: 'hl7.fhir.eu.health-data-api',
    packageVersion: '1.0.0-ballot',
    publicationUrl: 'https://hl7.eu/fhir/health-data-api/1.0.0-ballot/en/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/health-data-api/1.0.0-ballot/package.tgz'
  },
  {
    id: 'imaging',
    displayName: 'Imaging Report',
    packageName: 'hl7.fhir.eu.imaging',
    packageVersion: '1.0.0-ballot',
    publicationUrl: 'https://hl7.eu/fhir/imaging/1.0.0-ballot/en/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/imaging/1.0.0-ballot/package.tgz'
  },
  {
    id: 'cancer-common',
    displayName: 'HL7 Europe Common Cancer Model',
    packageName: 'hl7.fhir.eu.cancer-common',
    packageVersion: '1.0.0-ballot',
    publicationUrl: 'https://hl7.eu/fhir/cancer-common/1.0.0-ballot/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/cancer-common/1.0.0-ballot/package.tgz'
  },
  {
    id: 'hdr',
    displayName: 'Hospital Discharge Report',
    packageName: 'hl7.fhir.eu.hdr',
    packageVersion: '0.1.0-ballot',
    publicationUrl: 'https://hl7.eu/fhir/hdr/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/hdr/package.tgz'
  },
  {
    id: 'eps',
    displayName: 'European Patient Summary',
    packageName: 'hl7.fhir.eu.eps',
    packageVersion: '1.0.0-ballot',
    publicationUrl: 'https://hl7.eu/fhir/eps/1.0.0-ballot/',
    fallbackTgzUrl: 'https://hl7.eu/fhir/eps/1.0.0-ballot/package.tgz'
  }
];
