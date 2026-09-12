/**
 * STRAT CONTEXTUAL HARTAEDU — separat de datele Evaluării Naționale.
 *
 * Aceste înregistrări răspund la întrebarea „Ce nevoi au fost raportate pentru
 * această școală?” și NU influențează în niciun fel scorul sau culoarea de risc
 * calculate din media Evaluării Naționale.
 *
 * Structura respectă forma unui export HartaEdu, astfel încât setul de mai jos
 * să poată fi înlocuit ulterior cu un CSV/API complet fără modificări în UI.
 */
export type HartaEduAlertRow = {
  judet: string;
  scoala: string;
  localitate: string;
  categorie: string;
  urgenta: string;
  elevi_impactati: number;
  nevoi: string[];
  sursa: string;
  url: string;
};

export const hartaEduAlerts: HartaEduAlertRow[] = [
  {
    judet: "Teleorman",
    scoala: "Școala Gimnazială Săceni",
    localitate: "Săceni",
    categorie: "Siguranță",
    urgenta: "Urgentă",
    elevi_impactati: 92,
    nevoi: [
      "reabilitare interioară",
      "mobilier școlar",
      "cabinet de informatică",
      "teren de sport",
      "sală de clasă",
      "bibliotecă",
    ],
    sursa: "HartaEdu",
    url: "https://hartaedu.ro/siguranta/scoala-gimnaziala-saceni-are-nevoie-de-sprijin/",
  },
  {
    judet: "Teleorman",
    scoala: "Școala Gimnazială Trivalea-Moșteni",
    localitate: "Trivalea-Moșteni",
    categorie: "Digitalizare",
    urgenta: "Foarte urgentă",
    elevi_impactati: 250,
    nevoi: ["laptopuri", "imprimante", "echipamente digitale"],
    sursa: "HartaEdu",
    url: "https://hartaedu.ro/digitalizare/necesar-scoala/",
  },
];
