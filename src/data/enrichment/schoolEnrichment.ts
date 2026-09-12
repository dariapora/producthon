/**
 * STRAT DEMO / MOCK — NU face parte din datasetul original.
 *
 * Datasetul „schools_2026/2025" nu conține localitatea și coordonatele școlii.
 * Aceste valori sunt adăugate aici exclusiv pentru demo și pot fi înlocuite
 * ulterior cu date reale, fără a modifica fișierele din src/data/raw.
 */
export type SchoolEnrichment = {
  locality: string;
  latitude: number;
  longitude: number;
};

/** Cheie: numele școlii exact cum apare în dataset. */
export const schoolEnrichment: Record<string, SchoolEnrichment> = {
  "Liceul Teoretic „George Coșbuc”": { locality: "Cluj-Napoca", latitude: 46.7712, longitude: 23.6236 },
  "Școala Gimnazială „Ion Creangă”": { locality: "Cluj-Napoca", latitude: 46.7825, longitude: 23.5901 },
  "Școala Gimnazială Nr. 12 Turda": { locality: "Turda", latitude: 46.5667, longitude: 23.7833 },
  "Colegiul Național „Emil Racoviță”": { locality: "Cluj-Napoca", latitude: 46.7651, longitude: 23.5815 },
  "Școala Gimnazială „Alexandru cel Bun”": { locality: "Iași", latitude: 47.1585, longitude: 27.6014 },
  "Colegiul Național Iași": { locality: "Iași", latitude: 47.1728, longitude: 27.5721 },
  "Școala Gimnazială Podu Iloaiei": { locality: "Podu Iloaiei", latitude: 47.2167, longitude: 27.2667 },
  "Școala Gimnazială „Mihai Eminescu”": { locality: "Satu Mare", latitude: 47.792, longitude: 22.8856 },
  "Școala Gimnazială Carei": { locality: "Carei", latitude: 47.6833, longitude: 22.4667 },
  "Școala Gimnazială Negrești-Oaș": { locality: "Negrești-Oaș", latitude: 47.8722, longitude: 23.4222 },
  "Școala Gimnazială „Simion Bărnuțiu”": { locality: "Zalău", latitude: 47.1911, longitude: 23.0572 },
  "Școala Gimnazială Jibou": { locality: "Jibou", latitude: 47.2589, longitude: 23.2569 },
  "Colegiul Național „Andrei Șaguna”": { locality: "Brașov", latitude: 45.6427, longitude: 25.5887 },
  "Școala Gimnazială Nr. 5 Brașov": { locality: "Brașov", latitude: 45.6579, longitude: 25.6012 },
  "Școala Gimnazială Făgăraș": { locality: "Făgăraș", latitude: 45.8447, longitude: 24.9731 },
  "Școala Gimnazială „Mihail Sadoveanu”": { locality: "Vaslui", latitude: 46.6407, longitude: 27.7276 },
  "Școala Gimnazială Bârlad Nr. 3": { locality: "Bârlad", latitude: 46.2281, longitude: 27.6669 },
  "Școala Gimnazială Huși": { locality: "Huși", latitude: 46.6753, longitude: 28.0594 },
  "Liceul Teoretic „Nikolaus Lenau”": { locality: "Timișoara", latitude: 45.7489, longitude: 21.2087 },
  "Școala Gimnazială Lugoj Nr. 2": { locality: "Lugoj", latitude: 45.6886, longitude: 21.9033 },
  "Colegiul Național „Sfântul Sava”": { locality: "București", latitude: 44.4396, longitude: 26.0963 },
  "Școala Gimnazială Nr. 195": { locality: "București", latitude: 44.4075, longitude: 26.1225 },
  "Școala Gimnazială Nr. 88": { locality: "București", latitude: 44.4529, longitude: 26.0428 },
  "Colegiul Național „Carol I”": { locality: "Craiova", latitude: 44.3302, longitude: 23.7949 },
  "Școala Gimnazială Băilești": { locality: "Băilești", latitude: 44.0281, longitude: 23.3494 },
};
