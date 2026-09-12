/**
 * STRAT DEMO / MOCK — NU face parte din datasetul original al ONG-urilor.
 *
 * Registrul ONG nu conține coordonate, email, telefon sau website.
 * Valorile de mai jos sunt fictive și servesc doar pentru demonstrație.
 */
export type NgoEnrichment = {
  latitude: number;
  longitude: number;
  email: string;
  website: string;
  phone: string;
};

/** Cheie: CUI-ul ONG-ului din dataset. */
export const ngoEnrichment: Record<string, NgoEnrichment> = {
  "28114512": { latitude: 46.7712, longitude: 23.6236, email: "contact@liman-demo.ro", website: "https://liman-demo.ro", phone: "0264 000 101" },
  "33214980": { latitude: 46.5667, longitude: 23.7833, email: "contact@dezvoltare-demo.ro", website: "https://dezvoltare-demo.ro", phone: "0264 000 102" },
  "38812104": { latitude: 47.1585, longitude: 27.6014, email: "contact@edudigital-demo.ro", website: "https://edudigital-demo.ro", phone: "0232 000 103" },
  "36210447": { latitude: 47.792, longitude: 22.8856, email: "contact@pascupas-demo.ro", website: "https://pascupas-demo.ro", phone: "0261 000 104" },
  "25114003": { latitude: 46.6407, longitude: 27.7276, email: "contact@citeste-demo.ro", website: "https://citeste-demo.ro", phone: "0235 000 105" },
  "43119872": { latitude: 46.2281, longitude: 27.6669, email: "contact@punte-demo.ro", website: "https://punte-demo.ro", phone: "0235 000 106" },
  "31447209": { latitude: 45.7489, longitude: 21.2087, email: "contact@invatam-demo.ro", website: "https://invatam-demo.ro", phone: "0256 000 107" },
  "37801266": { latitude: 44.4396, longitude: 26.0963, email: "contact@scoaladmaine-demo.ro", website: "https://scoaladmaine-demo.ro", phone: "021 000 108" },
  "35002114": { latitude: 47.1911, longitude: 23.0572, email: "contact@zimbrul-demo.ro", website: "https://zimbrul-demo.ro", phone: "0260 000 109" },
  "30114588": { latitude: 44.3302, longitude: 23.7949, email: "contact@oltenia-demo.ro", website: "https://oltenia-demo.ro", phone: "0251 000 110" },
  "40551239": { latitude: 45.6427, longitude: 25.5887, email: "contact@brasovedu-demo.ro", website: "https://brasovedu-demo.ro", phone: "0268 000 111" },
  "27118440": { latitude: 47.8722, longitude: 23.4222, email: "contact@oasul-demo.ro", website: "https://oasul-demo.ro", phone: "0261 000 112" },
};
