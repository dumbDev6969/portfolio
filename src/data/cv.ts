import cvData from './cv.json';

type CVRecord = {
  file: string;
};

const DEFAULT_CV: CVRecord = {
  file: '/Cvs/joshua_cabuang_cv.pdf',
};

function isCVRecord(value: unknown): value is CVRecord {
  if (typeof value !== 'object' || value === null) return false;
  const cv = value as Record<string, unknown>;
  return typeof cv.file === 'string';
}

export const cv: CVRecord = isCVRecord(cvData) ? cvData : DEFAULT_CV;
