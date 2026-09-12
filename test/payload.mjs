// Invariants of the baked payload that LOOKING AT THE PAGE CANNOT CATCH.
//
// The page renders identically whether contact addresses are in it or not — the sidecar supplies
// them at runtime either way. So a bake that reintroduced the email column would leak 5,015 mostly
// personal addresses onto a public branch and every visual check would pass. That is the regression
// this file exists for; the rest are alignment checks of the same silent kind.
import { readFileSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

// fileURLToPath, not URL.pathname: the project lives under "civic producthon" and .pathname hands
// back the space percent-encoded, so every read fails on a path that looks correct in the error.
const rel = p => fileURLToPath(new URL(p, import.meta.url));

const APP = rel('../app/index.html');
const src = readFileSync(APP, 'utf8');
const DATA = JSON.parse(src.match(/\/\*DATA:START\*\/\s*const DATA=([\s\S]*?);\s*\/\*DATA:END\*\//)[1]);
const F = {}; DATA.fields.forEach((n, i) => F[n] = i);

let bad = 0;
const ok = (cond, label, detail = '') => {
  console.log(`${cond ? ' ok  ' : 'FAIL '}${label}${detail ? '  ' + detail : ''}`);
  if (!cond) bad++;
};

// --- no contact addresses reach the page -------------------------------------
const mails = src.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
ok(mails.length === 0, 'no email address anywhere in app/index.html', `found ${mails.length}`);
ok(DATA.rows.every(r => !r[F.email]), 'email field blank on every row',
   `${DATA.rows.filter(r => r[F.email]).length} rows carry one`);
ok(DATA.rows.every(r => typeof r[F.inbox] === 'number'), 'inbox is an opaque integer id, not an address');
ok(existsSync(rel('../.gitignore')) && readFileSync(rel('../.gitignore'), 'utf8').includes('contacts.js'),
   'app/contacts.js is gitignored');
// Deliberately NOT a bare try/catch returning ''. A swallowed git failure makes this check report
// "not tracked" for the same reason it would report it on a clean repo — it passes when it cannot
// run at all, which is the one behaviour a safety check must never have. Found by mutation-testing
// this file outside a git tree, where it happily passed.
let tracked = null;
try { tracked = execFileSync('git', ['ls-files', 'app/contacts.js'],
  { cwd: rel('..'), stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { tracked = null; }
ok(tracked === '', 'app/contacts.js is not tracked by git',
   tracked === null ? 'COULD NOT CHECK — git did not run' : tracked);

// --- positional payload alignment --------------------------------------------
// FIELDS names the columns; the rows are bare arrays. A FIELDS list one entry short does not throw,
// it shifts every field after the gap — the page then reads `flags` out of `inboxN` and the only
// symptom is a count quietly changing. This happened while adding geo_source.
ok(DATA.rows.every(r => r.length === DATA.fields.length),
   'every row has exactly as many values as DATA.fields names',
   `fields ${DATA.fields.length}, first row ${DATA.rows[0].length}`);

// --- position provenance ------------------------------------------------------
const geo = {}; DATA.rows.forEach(r => geo[r[F.geo]] = (geo[r[F.geo]] || 0) + 1);
ok(DATA.rows.every(r => [0, 1, 2].includes(r[F.geo] | 0)), 'geo is one of 0 / 1 / 2');
ok(DATA.rows.every(r => (r[F.geo] === 0) === (r[F.lat] == null)),
   'geo=0 exactly when there is no position, and never otherwise');
console.log(`      positions: ${geo[1] || 0} the school's own · ${geo[2] || 0} commune-level · ${geo[0] || 0} none`);

console.log(bad ? `\n${bad} payload invariant(s) FAILED` : '\npayload invariants hold');
process.exit(bad ? 1 : 0);
