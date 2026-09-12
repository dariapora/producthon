import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function parseCsv(source) {
  const input = source.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("CSV invalid: ghilimele neînchise");
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...values] = rows;
  if (!headers) return [];
  return values
    .filter((cells) => cells.some((cell) => cell.trim().length > 0))
    .map((cells, rowIndex) => {
      if (cells.length !== headers.length) {
        throw new Error(
          `CSV invalid la rândul ${rowIndex + 2}: ${cells.length} coloane în loc de ${headers.length}`,
        );
      }
      return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    });
}

function assertColumns(rows, columns, fileName) {
  const row = rows[0];
  if (!row) throw new Error(`${fileName} nu conține date`);
  for (const column of columns) {
    if (!(column in row)) throw new Error(`${fileName}: lipsește coloana „${column}”`);
  }
}

function number(value, label) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed))
    throw new Error(`Valoare numerică invalidă pentru ${label}: ${value}`);
  return parsed;
}

function line(value) {
  return `  ${JSON.stringify(value)},`;
}

const schoolColumns = [
  "An",
  "Judet",
  "Scoala",
  "Medie_Generala",
  "Medie_Romana",
  "Medie_Matematica",
  "Numar_Elevi",
];
const ngoColumns = [
  "Nr. Crt.",
  "Numar Registru",
  "Categorie Personalitate Juridica",
  "Denumire ONG",
  "Status",
  "Localitate",
  "Judet",
  "Are Utilitate Publica",
  "Categorii relevante",
  "Motiv relevanță",
  "Tip intervenție",
];

const schoolFileName = "rezultate_en_25_26.csv";
const schoolRows = parseCsv(await readFile(resolve(root, `data/${schoolFileName}`), "utf8"));
assertColumns(schoolRows, schoolColumns, schoolFileName);
const schools = schoolRows.map((row, index) => ({
  An: number(row.An, `an, rând ${index + 2}`),
  Judet: row.Judet.trim(),
  Scoala: row.Scoala.trim(),
  Medie_Generala: number(row.Medie_Generala, `media generală, rând ${index + 2}`),
  Medie_Romana: number(row.Medie_Romana, `media română, rând ${index + 2}`),
  Medie_Matematica: number(row.Medie_Matematica, `media matematică, rând ${index + 2}`),
  Numar_Elevi: number(row.Numar_Elevi, `număr elevi, rând ${index + 2}`),
}));

for (const school of schools) {
  if (school.An !== 2025 && school.An !== 2026) {
    throw new Error(`${schoolFileName}: an nesuportat „${school.An}”`);
  }
}

const schoolOutput = `/** Generat automat din data/${schoolFileName}. Rulează \`npm run data:import\` după actualizarea CSV-ului. */
export type ImportedSchoolRow = {
  An: 2025 | 2026;
  Judet: string;
  Scoala: string;
  Medie_Generala: number;
  Medie_Romana: number;
  Medie_Matematica: number;
  Numar_Elevi: number;
};

export const schoolsImported: ImportedSchoolRow[] = [
${schools.map(line).join("\n")}
];
`;

const ngoRows = parseCsv(await readFile(resolve(root, "data/ong-uri.csv"), "utf8"));
assertColumns(ngoRows, ngoColumns, "ong-uri.csv");
const ngos = ngoRows.map((row, index) => ({
  "Nr. Crt.": number(row["Nr. Crt."], `număr curent ONG, rând ${index + 2}`),
  "Numar Registru": row["Numar Registru"].trim(),
  "Categorie Personalitate Juridica": row["Categorie Personalitate Juridica"].trim(),
  "Denumire ONG": row["Denumire ONG"].trim(),
  Status: row.Status.trim(),
  Localitate: row.Localitate.trim(),
  Judet: row.Judet.trim(),
  "Are Utilitate Publica": row["Are Utilitate Publica"].trim(),
  "Categorii relevante": row["Categorii relevante"].trim(),
  "Motiv relevanță": row["Motiv relevanță"].trim(),
  "Tip intervenție": row["Tip intervenție"].trim(),
}));

const ngoOutput = `/** Generat automat din data/ong-uri.csv. Păstrează doar câmpurile folosite în produs. */
export type ImportedNgoRow = {
  "Nr. Crt.": number;
  "Numar Registru": string;
  "Categorie Personalitate Juridica": string;
  "Denumire ONG": string;
  Status: string;
  Localitate: string;
  Judet: string;
  "Are Utilitate Publica": string;
  "Categorii relevante": string;
  "Motiv relevanță": string;
  "Tip intervenție": string;
};

export const ngosImported: ImportedNgoRow[] = [
${ngos.map(line).join("\n")}
];
`;

await Promise.all([
  writeFile(resolve(root, "src/data/raw/schools2026Imported.ts"), schoolOutput),
  writeFile(resolve(root, "src/data/raw/ngosImported.ts"), ngoOutput),
]);

const schoolCounts = Object.groupBy(schools, (school) => school.An);
console.log(
  `Import finalizat: ${schoolCounts[2025]?.length ?? 0} școli din 2025, ${schoolCounts[2026]?.length ?? 0} școli din 2026 și ${ngos.length} ONG-uri.`,
);
