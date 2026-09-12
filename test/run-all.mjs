// Regression suite for app/index.html. Run after any change to the app or the payload:
//   cd test && npm i && node run-all.mjs
// Needs playwright (dev-only; not a runtime dependency of the app).
import { execFileSync } from 'child_process';
const suites=[
  ['role switch + cold-load contract','roles.mjs'],
  ['themes + overflow (light / dark / 400px)','batch.mjs'],
  ['county label halo (dark mode depends on it)','labels.mjs'],
  ['pin drag + keyboard nudge','drag.mjs'],
  ['zoom gating (plain wheel must scroll the page)','zoom2.mjs'],
  ['FLIP reorder on the weight slider','motion2.mjs'],
  ['Need means: view preserved, encoding follows','metric.mjs'],
  ['table fits its box','cols.mjs'],
  ['payload invariants (no addresses, field alignment, position provenance)','payload.mjs'],
  ['benchmark stays candidate-weighted (6.69, not 5.96)','bench.mjs'],
];
let bad=0;
for(const [name,f] of suites){
  process.stdout.write(`\n### ${name}\n`);
  try{ process.stdout.write(execFileSync('node',[f],{encoding:'utf8'})); }
  catch(e){ bad++; process.stdout.write('FAILED\n'+(e.stdout||'')+(e.stderr||'')); }
}
console.log(bad?`\n${bad} suite(s) failed`:'\nall suites ran');
