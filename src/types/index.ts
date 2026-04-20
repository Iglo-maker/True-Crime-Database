export interface Case {
  id: string;
  title: string;
  date: string;
  status: 'solved' | 'unsolved';
  type: CaseType;
  description: string;
  countryCode: string;
  countryName: string;
  stateCode: string;
  stateName: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
}

export type CaseType =
  | 'Mord'
  | 'Raub'
  | 'Überfall'
  | 'Sexualdelikt'
  | 'Entführung'
  | 'Betrug'
  | 'Brandstiftung'
  | 'Sonstiges';

export const CASE_TYPES: CaseType[] = [
  'Mord',
  'Raub',
  'Überfall',
  'Sexualdelikt',
  'Entführung',
  'Betrug',
  'Brandstiftung',
  'Sonstiges',
];

export interface GeoFeature {
  type: 'Feature';
  properties: {
    name: string;
    iso_a2?: string;
    admin?: string;
    name_en?: string;
    [key: string]: unknown;
  };
  geometry: GeoJSON.Geometry;
}
