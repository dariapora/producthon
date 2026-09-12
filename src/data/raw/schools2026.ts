/**
 * SURSA DE ADEVĂR — dataset importat „schools_2026".
 * Coloanele păstrează exact denumirile din fișierul sursă.
 * NU adăugați aici câmpuri inventate (localitate, coordonate etc.).
 */
export type RawSchoolRow = {
  Judet: string;
  "nume scoala": string;
  "medie en": number;
  "medie mate": number;
  "medie romana": number;
  "nr absolventi": number;
};

export const schools2026: RawSchoolRow[] = [
  { Judet: "Cluj", "nume scoala": "Liceul Teoretic „George Coșbuc”", "medie en": 6.42, "medie mate": 7.02, "medie romana": 5.96, "nr absolventi": 214 },
  { Judet: "Cluj", "nume scoala": "Școala Gimnazială „Ion Creangă”", "medie en": 7.31, "medie mate": 7.48, "medie romana": 7.14, "nr absolventi": 168 },
  { Judet: "Cluj", "nume scoala": "Școala Gimnazială Nr. 12 Turda", "medie en": 4.86, "medie mate": 4.41, "medie romana": 5.31, "nr absolventi": 96 },
  { Judet: "Cluj", "nume scoala": "Colegiul Național „Emil Racoviță”", "medie en": 8.12, "medie mate": 8.34, "medie romana": 7.9, "nr absolventi": 132 },

  { Judet: "Iași", "nume scoala": "Școala Gimnazială „Alexandru cel Bun”", "medie en": 5.74, "medie mate": 5.32, "medie romana": 6.16, "nr absolventi": 188 },
  { Judet: "Iași", "nume scoala": "Colegiul Național Iași", "medie en": 8.46, "medie mate": 8.72, "medie romana": 8.2, "nr absolventi": 154 },
  { Judet: "Iași", "nume scoala": "Școala Gimnazială Podu Iloaiei", "medie en": 4.52, "medie mate": 4.08, "medie romana": 4.96, "nr absolventi": 74 },

  { Judet: "Satu Mare", "nume scoala": "Școala Gimnazială „Mihai Eminescu”", "medie en": 4.72, "medie mate": 4.18, "medie romana": 5.26, "nr absolventi": 122 },
  { Judet: "Satu Mare", "nume scoala": "Școala Gimnazială Carei", "medie en": 5.08, "medie mate": 4.64, "medie romana": 5.52, "nr absolventi": 88 },
  { Judet: "Satu Mare", "nume scoala": "Școala Gimnazială Negrești-Oaș", "medie en": 4.31, "medie mate": 3.92, "medie romana": 4.7, "nr absolventi": 61 },

  { Judet: "Sălaj", "nume scoala": "Școala Gimnazială „Simion Bărnuțiu”", "medie en": 4.88, "medie mate": 4.4, "medie romana": 5.36, "nr absolventi": 104 },
  { Judet: "Sălaj", "nume scoala": "Școala Gimnazială Jibou", "medie en": 5.42, "medie mate": 5.06, "medie romana": 5.78, "nr absolventi": 79 },

  { Judet: "Brașov", "nume scoala": "Colegiul Național „Andrei Șaguna”", "medie en": 8.68, "medie mate": 8.9, "medie romana": 8.46, "nr absolventi": 176 },
  { Judet: "Brașov", "nume scoala": "Școala Gimnazială Nr. 5 Brașov", "medie en": 7.21, "medie mate": 7.04, "medie romana": 7.38, "nr absolventi": 143 },
  { Judet: "Brașov", "nume scoala": "Școala Gimnazială Făgăraș", "medie en": 6.34, "medie mate": 6.02, "medie romana": 6.66, "nr absolventi": 97 },

  { Judet: "Vaslui", "nume scoala": "Școala Gimnazială „Mihail Sadoveanu”", "medie en": 4.18, "medie mate": 3.74, "medie romana": 4.62, "nr absolventi": 133 },
  { Judet: "Vaslui", "nume scoala": "Școala Gimnazială Bârlad Nr. 3", "medie en": 5.06, "medie mate": 4.72, "medie romana": 5.4, "nr absolventi": 111 },
  { Judet: "Vaslui", "nume scoala": "Școala Gimnazială Huși", "medie en": 4.64, "medie mate": 4.2, "medie romana": 5.08, "nr absolventi": 86 },

  { Judet: "Timiș", "nume scoala": "Liceul Teoretic „Nikolaus Lenau”", "medie en": 8.02, "medie mate": 8.18, "medie romana": 7.86, "nr absolventi": 162 },
  { Judet: "Timiș", "nume scoala": "Școala Gimnazială Lugoj Nr. 2", "medie en": 6.12, "medie mate": 5.8, "medie romana": 6.44, "nr absolventi": 118 },

  { Judet: "București", "nume scoala": "Colegiul Național „Sfântul Sava”", "medie en": 9.02, "medie mate": 9.24, "medie romana": 8.8, "nr absolventi": 198 },
  { Judet: "București", "nume scoala": "Școala Gimnazială Nr. 195", "medie en": 6.88, "medie mate": 6.7, "medie romana": 7.06, "nr absolventi": 204 },
  { Judet: "București", "nume scoala": "Școala Gimnazială Nr. 88", "medie en": 5.96, "medie mate": 5.64, "medie romana": 6.28, "nr absolventi": 176 },

  { Judet: "Dolj", "nume scoala": "Colegiul Național „Carol I”", "medie en": 7.94, "medie mate": 8.1, "medie romana": 7.78, "nr absolventi": 149 },
  { Judet: "Dolj", "nume scoala": "Școala Gimnazială Băilești", "medie en": 4.96, "medie mate": 4.52, "medie romana": 5.4, "nr absolventi": 92 },
];
