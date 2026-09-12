/**
 * STRAT DEMO / OPȚIONAL — date de contact pentru ONG-uri.
 *
 * Registrul ONG folosit ca sursă NU conține email, telefon sau website.
 * Acest strat este separat de dataset și poate fi completat, în producție,
 * cu date verificate. Pentru demo, doar câteva organizații au date de contact.
 * Organizațiile care lipsesc de aici rămân fără email, iar butonul de contact
 * este dezactivat — nu se inventează adrese.
 */
export type NgoContactEnrichment = {
  /** id-ul intern al ONG-ului (slug din denumire) */
  ngoId: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  contactName: string | null;
  /** de unde provin datele de contact (afișat în interfață) */
  source: string;
  /** data ultimei verificări, format ISO */
  verifiedAt: string;
};

export const ngoContactEnrichment: Record<string, NgoContactEnrichment> = {
  "uniunea-pentru-educatie-digitala": {
    ngoId: "uniunea-pentru-educatie-digitala",
    email: "contact@edudigital-demo.ro",
    phone: "0232 000 103",
    website: "https://edudigital-demo.ro",
    contactName: "Birou programe educaționale",
    source: "Date demonstrative (demo)",
    verifiedAt: "2026-09-01",
  },
  "asociatia-zimbrul-educativ": {
    ngoId: "asociatia-zimbrul-educativ",
    email: "contact@zimbrul-demo.ro",
    phone: "0260 000 109",
    website: "https://zimbrul-demo.ro",
    contactName: null,
    source: "Date demonstrative (demo)",
    verifiedAt: "2026-09-01",
  },
  "asociatia-scoala-de-maine": {
    ngoId: "asociatia-scoala-de-maine",
    email: "contact@scoaladmaine-demo.ro",
    phone: "021 000 108",
    website: "https://scoaladmaine-demo.ro",
    contactName: "Coordonator parteneriate",
    source: "Date demonstrative (demo)",
    verifiedAt: "2026-09-01",
  },
};

export function getNgoContact(ngoId: string): NgoContactEnrichment | null {
  return ngoContactEnrichment[ngoId] ?? null;
}

/**
 * Adresă fictivă, stabilă, folosită exclusiv pentru demonstrarea fluxului de
 * contact. Sufixul numeric din id păstrează adresele distincte fără să pretindă
 * că sunt date reale ale organizațiilor din registru.
 */
export function getMockNgoEmail(ngoId: string): string {
  const rowId = ngoId.match(/-(\d+)$/)?.[1] ?? "general";
  return `contact+${rowId}@ong-demo.ro`;
}
