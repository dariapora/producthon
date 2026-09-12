import type { HartaEduAlert } from "@/lib/hartaedu";
import type { Ngo, School } from "@/lib/model";

export type SchoolEmailDraft = {
  to: string;
  subject: string;
  body: string;
  mailtoUrl: string;
};

export function getMockSchoolEmail(schoolId: string): string {
  return `contact+${schoolId}@scoala-demo.ro`;
}

export function buildNgoToSchoolEmailDraft(input: {
  ngo: Ngo;
  school: School;
  alerts: HartaEduAlert[];
}): SchoolEmailDraft {
  const { ngo, school, alerts } = input;
  const email = getMockSchoolEmail(school.id);
  const reportedNeeds = [...new Set(alerts.flatMap((alert) => alert.needs))];
  const needsParagraph =
    reportedNeeds.length > 0
      ? `Am identificat în HartaEdu următoarele nevoi raportate pentru școala dumneavoastră: ${reportedNeeds.join(", ")}.`
      : "Dorim să aflăm mai multe despre nevoile actuale ale școlii și despre o posibilă colaborare.";
  const subject = `Propunere de sprijin – ${ngo.name} și ${school.schoolName}`;
  const body = [
    "Bună ziua,",
    "",
    `Reprezint organizația ${ngo.name} din ${ngo.locality}, județul ${ngo.county}.`,
    "",
    needsParagraph,
    "",
    `Organizația noastră activează în domeniul: ${ngo.interventionType}. Am dori să discutăm direct cu echipa școlii despre modalități concrete de sprijin.`,
    "",
    "Vă rugăm să ne transmiteți când am putea avea o scurtă discuție.",
    "",
    "Cu stimă,",
    ngo.name,
  ].join("\n");

  return {
    to: email,
    subject,
    body,
    mailtoUrl: `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}
