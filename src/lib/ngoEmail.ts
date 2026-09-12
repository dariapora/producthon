/**
 * Construiește schița de email către ONG.
 * Aplicația NU trimite emailuri — doar deschide clientul implicit (mailto:).
 * Toate valorile sunt calculate din datasetul încărcat, nimic hard-codat.
 */
import type { CountyStats, NationalStats, School } from "@/lib/model";

export type EmailDraft = {
  to: string;
  subject: string;
  body: string;
  mailtoUrl: string;
};

function formatAverage(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

export function buildSchoolEmailDraft(input: {
  email: string;
  school: School;
  county: CountyStats | null;
  national: NationalStats;
}): EmailDraft {
  const { email, school, county, national } = input;
  const locality = school.locality ?? school.county;
  const countyText = county ? formatAverage(county.enAverage) : "indisponibilă";

  const subject = `Solicitare sprijin educațional – ${school.schoolName}`;
  const body = [
    "Bună ziua,",
    "",
    `Sunt directorul ${school.schoolName} din ${locality}, județul ${school.county}.`,
    "",
    "În urma rezultatelor la Evaluarea Națională 2026, dorim să identificăm soluții de sprijin pentru elevii noștri și suntem interesați de programele oferite de organizația dumneavoastră.",
    "",
    `Media școlii noastre la Evaluarea Națională 2026 este ${formatAverage(school.enAverage)}, comparativ cu media județeană de ${countyText} și media națională de ${formatAverage(national.enAverage)}.`,
    "",
    "Ne-ar ajuta să discutăm despre modalitățile prin care organizația dumneavoastră ar putea sprijini elevii și cadrele didactice ale școlii.",
    "",
    "Vă mulțumesc și aștept cu interes să discutăm.",
    "",
    "Cu stimă,",
    "",
    "Director",
    school.schoolName,
  ].join("\n");

  return { to: email, subject, body, mailtoUrl: buildMailto(email, subject, body) };
}

/** Variantă fără context de școală (director ajuns direct pe pagina ONG-ului). */
export function buildGenericEmailDraft(email: string, ngoName: string): EmailDraft {
  const subject = "Solicitare sprijin educațional";
  const body = [
    "Bună ziua,",
    "",
    `Sunt director de școală și am identificat organizația ${ngoName} ca posibil partener de sprijin educațional.`,
    "",
    "Ne-ar ajuta să discutăm despre modalitățile prin care organizația dumneavoastră ar putea sprijini elevii și cadrele didactice ale școlii.",
    "",
    "Vă mulțumesc și aștept cu interes să discutăm.",
    "",
    "Cu stimă,",
    "",
    "Director",
  ].join("\n");
  return { to: email, subject, body, mailtoUrl: buildMailto(email, subject, body) };
}

function buildMailto(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
