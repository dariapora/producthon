/** Model intern normalizat al aplicației. */

export type SchoolYear = 2025 | 2026;

export type School = {
  id: string;
  county: string;
  schoolName: string;
  enAverage: number;
  mathAverage: number;
  romanianAverage: number;
  graduates: number;
  /** din stratul demo de îmbogățire */
  locality: string | null;
  latitude: number | null;
  longitude: number | null;
  year: SchoolYear;
};

export type Ngo = {
  id: string;
  name: string;
  registrationNumber: string;
  locality: string;
  county: string;
  status: string;
  legalCategory: string;
  publicUtility: boolean;
  /** clasificare livrată împreună cu datasetul ONG */
  relevantCategories: string[];
  interventionType: string;
  relevanceReason: string;
  /** coordonate aproximative, când localitatea este cunoscută */
  latitude: number | null;
  longitude: number | null;
};

/** Agregat la nivel de județ, pentru un an. */
export type CountyStats = {
  county: string;
  year: SchoolYear;
  enAverage: number;
  mathAverage: number;
  romanianAverage: number;
  schoolCount: number;
  graduates: number;
};

/** Agregat național, pentru un an. */
export type NationalStats = {
  year: SchoolYear;
  enAverage: number;
  schoolCount: number;
  countyCount: number;
  graduates: number;
};

/** Structura de comparație folosită pe pagina de școală. */
export type SchoolComparison = {
  school: School;
  previousYear: School | null;
  county: CountyStats | null;
  national: NationalStats;
};
