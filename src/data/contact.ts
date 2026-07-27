import contactData from './contact.json';

type ContactRecord = {
  email: string;
  linkedin: string;
  github: string;
};

function isContactRecord(value: unknown): value is ContactRecord {
  if (typeof value !== 'object' || value === null) return false;
  const contact = value as Record<string, unknown>;
  return (
    typeof contact.email === 'string' &&
    typeof contact.linkedin === 'string' &&
    typeof contact.github === 'string'
  );
}

const DEFAULT_CONTACT: ContactRecord = {
  email: 'joshuacabuang0@gmail.com',
  linkedin: 'https://www.linkedin.com/in/joshuacabuang/',
  github: 'https://github.com/joshuacabuang',
};

export const contact: ContactRecord = isContactRecord(contactData) ? contactData : DEFAULT_CONTACT;
export const SITE_OWNER_NAME = 'Joshua Cabuang';
