/**
 * STRAT DEMO / GEOCODARE — NU face parte din datasetul Evaluării Naționale.
 *
 * Coordonate la nivel de localitate (aproximative, centrul localității), folosite
 * pentru a plasa școlile pe harta județului. Datasetul EN nu conține coordonate,
 * iar fișierele din src/data/raw rămân neschimbate.
 *
 * Cheia este numele localității normalizat (fără diacritice, litere mici).
 */
export type LatLng = { latitude: number; longitude: number };

const RAW: Record<string, LatLng> = {
  /* reședințe de județ */
  "Alba Iulia": { latitude: 46.0733, longitude: 23.5805 },
  Arad: { latitude: 46.1866, longitude: 21.3123 },
  Pitești: { latitude: 44.8565, longitude: 24.8692 },
  Bacău: { latitude: 46.567, longitude: 26.9146 },
  Oradea: { latitude: 47.0465, longitude: 21.9189 },
  Bistrița: { latitude: 47.1333, longitude: 24.5 },
  Botoșani: { latitude: 47.7486, longitude: 26.6694 },
  Brașov: { latitude: 45.6427, longitude: 25.5887 },
  Brăila: { latitude: 45.2692, longitude: 27.9575 },
  București: { latitude: 44.4268, longitude: 26.1025 },
  Buzău: { latitude: 45.15, longitude: 26.8333 },
  Călărași: { latitude: 44.2058, longitude: 27.3306 },
  Reșița: { latitude: 45.3008, longitude: 21.8892 },
  "Cluj-Napoca": { latitude: 46.7712, longitude: 23.6236 },
  Constanța: { latitude: 44.1733, longitude: 28.6383 },
  "Sfântu Gheorghe": { latitude: 45.8667, longitude: 25.7833 },
  Târgoviște: { latitude: 44.925, longitude: 25.4567 },
  Craiova: { latitude: 44.3302, longitude: 23.7949 },
  Galați: { latitude: 45.4353, longitude: 28.008 },
  Giurgiu: { latitude: 43.9037, longitude: 25.9699 },
  "Târgu Jiu": { latitude: 45.0367, longitude: 23.2747 },
  "Miercurea Ciuc": { latitude: 46.3594, longitude: 25.8017 },
  Deva: { latitude: 45.8758, longitude: 22.9114 },
  Iași: { latitude: 47.1585, longitude: 27.6014 },
  Slobozia: { latitude: 44.5639, longitude: 27.3661 },
  Buftea: { latitude: 44.5667, longitude: 25.95 },
  "Baia Mare": { latitude: 47.6567, longitude: 23.5722 },
  "Drobeta-Turnu Severin": { latitude: 44.6369, longitude: 22.6597 },
  "Târgu Mureș": { latitude: 46.5425, longitude: 24.5575 },
  "Piatra Neamț": { latitude: 46.9275, longitude: 26.3708 },
  Slatina: { latitude: 44.43, longitude: 24.37 },
  Ploiești: { latitude: 44.941, longitude: 26.0225 },
  Zalău: { latitude: 47.1911, longitude: 23.0572 },
  "Satu Mare": { latitude: 47.792, longitude: 22.8856 },
  Sibiu: { latitude: 45.7983, longitude: 24.1256 },
  Suceava: { latitude: 47.6514, longitude: 26.2556 },
  Alexandria: { latitude: 43.97, longitude: 25.3333 },
  Timișoara: { latitude: 45.7489, longitude: 21.2087 },
  Tulcea: { latitude: 45.1717, longitude: 28.7914 },
  "Râmnicu Vâlcea": { latitude: 45.1047, longitude: 24.375 },
  Vaslui: { latitude: 46.6407, longitude: 27.7276 },
  Focșani: { latitude: 45.696, longitude: 27.1864 },

  /* alte orașe folosite în dataset */
  Turda: { latitude: 46.5667, longitude: 23.7833 },
  Sebeș: { latitude: 45.9564, longitude: 23.5697 },
  Carei: { latitude: 47.6833, longitude: 22.4667 },
  "Negrești-Oaș": { latitude: 47.8722, longitude: 23.4222 },
  Jibou: { latitude: 47.2589, longitude: 23.2569 },
  Făgăraș: { latitude: 45.8447, longitude: 24.9731 },
  Bârlad: { latitude: 46.2281, longitude: 27.6669 },
  Huși: { latitude: 46.6753, longitude: 28.0594 },
  Lugoj: { latitude: 45.6886, longitude: 21.9033 },
  Băilești: { latitude: 44.0281, longitude: 23.3494 },
  "Podu Iloaiei": { latitude: 47.2167, longitude: 27.2667 },

  /* Teleorman — localități (demo detaliat) */
  "Roșiori de Vede": { latitude: 44.1119, longitude: 24.9903 },
  "Turnu Măgurele": { latitude: 43.75, longitude: 24.8667 },
  Zimnicea: { latitude: 43.6578, longitude: 25.3658 },
  Videle: { latitude: 44.2778, longitude: 25.5231 },
  Săceni: { latitude: 44.0333, longitude: 25.1 },
  "Trivalea-Moșteni": { latitude: 44.2, longitude: 25.2833 },
  "Trivalea Moșteni": { latitude: 44.2, longitude: 25.2833 },
  Moșteni: { latitude: 44.2, longitude: 25.2833 },
  Troianul: { latitude: 44.0167, longitude: 25.1667 },
  Vitănești: { latitude: 44.0, longitude: 25.35 },
  "Orbeasca de Jos": { latitude: 44.05, longitude: 25.25 },
  Gălăteni: { latitude: 44.0833, longitude: 25.2167 },
  "Uda, Clocociov": { latitude: 44.1167, longitude: 24.95 },
  Clocociov: { latitude: 44.1167, longitude: 24.95 },
  Vedea: { latitude: 43.8167, longitude: 25.0333 },
  Băbăița: { latitude: 44.1, longitude: 25.3 },
  Sârbeni: { latitude: 44.3333, longitude: 25.4 },
  Scrioaștea: { latitude: 44.15, longitude: 25.0333 },
  Talpa: { latitude: 44.2833, longitude: 25.3667 },
  Bragadiru: { latitude: 43.75, longitude: 25.4833 },
  Purani: { latitude: 44.2, longitude: 25.45 },
  Viișoara: { latitude: 43.8667, longitude: 24.95 },
  Frăsinet: { latitude: 44.1, longitude: 25.1 },
  "Drăgănești de Vede": { latitude: 44.15, longitude: 24.9333 },
  "Segarcea Vale": { latitude: 43.8, longitude: 24.7833 },
  Năsturelu: { latitude: 43.7, longitude: 25.4667 },
  Lunca: { latitude: 43.9, longitude: 24.8333 },
  Dobrotești: { latitude: 44.3167, longitude: 24.95 },
  Măldăeni: { latitude: 44.0833, longitude: 24.95 },
  Pietroșani: { latitude: 43.7, longitude: 25.3 },
  Lăceni: { latitude: 44.0333, longitude: 25.2 },
  Necșești: { latitude: 44.25, longitude: 25.2333 },
  Drăcșenei: { latitude: 44.15, longitude: 25.1667 },
  Siliștea: { latitude: 44.1833, longitude: 25.3333 },
  "Siliștea Gumești": { latitude: 44.2333, longitude: 25.05 },
  Balaci: { latitude: 44.3167, longitude: 24.9167 },
  Călmățuiu: { latitude: 43.9, longitude: 25.0 },
  Măgura: { latitude: 44.05, longitude: 25.2333 },
  Mavrodin: { latitude: 44.0333, longitude: 25.2833 },
  Țigănești: { latitude: 43.9, longitude: 25.3667 },
  Izvoarele: { latitude: 43.7833, longitude: 25.4 },
  Poeni: { latitude: 44.4, longitude: 25.4 },
  Conțești: { latitude: 44.0167, longitude: 25.4 },
  Sfințești: { latitude: 44.1, longitude: 24.8833 },
  Dracea: { latitude: 43.85, longitude: 25.05 },
  Salcia: { latitude: 43.8333, longitude: 25.1 },
  Smârdioasa: { latitude: 43.8167, longitude: 25.4667 },
  Crângu: { latitude: 43.8833, longitude: 25.0833 },
  Buzescu: { latitude: 43.9667, longitude: 25.25 },
  Bujoru: { latitude: 43.75, longitude: 25.4 },
  Olteni: { latitude: 44.2, longitude: 25.3667 },
  Vârtoape: { latitude: 44.1333, longitude: 24.9333 },
};

/** Normalizare pentru potrivirea numelor de localități. */
export function normalizeKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ăâîșşţț]/gi, (c) => ({ ă: "a", â: "a", î: "i", ș: "s", ş: "s", ţ: "t", ț: "t" })[c.toLowerCase()] ?? c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export const localityCoordinates: Record<string, LatLng> = Object.fromEntries(
  Object.entries(RAW).map(([name, coords]) => [normalizeKey(name), coords]),
);

export function getLocalityCoordinates(locality: string | null): LatLng | null {
  if (!locality) return null;
  return localityCoordinates[normalizeKey(locality)] ?? null;
}
