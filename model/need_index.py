"""
School need index for the grade 8 -> 9 cliff, from Evaluarea Nationala (EN) per-candidate data.

Input : one or more per-candidate CSVs (data.gov.ro "Rezultate la Evaluarea Nationala YYYY",
        or an export of evaluare.edu.ro county lists). Columns are auto-detected; override with --map.
Output: schools_need_index.csv  (one row per school, ranked)
        counties_summary.csv

Model (small-area estimation):
  Village schools have 10-20 candidates, so raw fail rates are noise.
  For each county we fit a Beta(a, b) prior to school fail rates (method of moments),
  then shrink each school:  rate* = (fails + a) / (n + a + b).
  Small schools pull toward their county; big schools keep their own signal.
  Pooling several years further stabilises it.
  need_per_year = rate* x average candidates per year  (expected students below 5 each year)
"""
import argparse, glob, re, sys, unicodedata
import numpy as np, pandas as pd
from scipy.stats import beta

FAIL_THRESHOLD = 5.0

def norm(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()

# candidate patterns per logical field (normalised header text)
PATTERNS = {
    "school":  [r"unitat", r"scoal", r"provenient", r"nume.*unit"],
    "county":  [r"^judet", r"judet"],
    "mediu":   [r"mediu"],
    "avg":     [r"^media$", r"media en", r"media evaluar", r"^medie", r"media"],
    "ro":      [r"romana.*final", r"lr.*final", r"romana"],
    "math":    [r"matematic.*final", r"ma.*final", r"matematic"],
    "year":    [r"^an$", r"anul"],
}

def detect(cols, overrides):
    found, ncols = {}, {c: norm(c) for c in cols}
    for field, pats in PATTERNS.items():
        if field in overrides:
            found[field] = overrides[field]; continue
        for p in pats:
            hit = [c for c, n in ncols.items() if re.search(p, n) and c not in found.values()]
            if hit:
                found[field] = hit[0]; break
    return found

def to_grade(x):
    """'7,45' -> 7.45 ; 'Absent'/'Eliminat'/'' -> NaN"""
    if pd.isna(x): return np.nan
    s = str(x).strip().replace(",", ".")
    try: return float(s)
    except ValueError: return np.nan

def load(paths, overrides):
    frames = []
    for p in paths:
        df = pd.read_csv(p, sep=None, engine="python", dtype=str, encoding_errors="replace")
        m = detect(df.columns, overrides)
        missing = [f for f in ("school", "county") if f not in m]
        if missing or not ({"avg"} <= m.keys() or {"ro", "math"} <= m.keys()):
            sys.exit(f"{p}: could not detect columns {missing or 'avg/ro+math'}. Headers: {list(df.columns)}. Use --map.")
        out = pd.DataFrame({"school": df[m["school"]].str.strip(),
                            "county": df[m["county"]].str.strip()})
        out["mediu"] = df[m["mediu"]].str.strip().str.lower() if "mediu" in m else np.nan
        ro = df[m["ro"]].map(to_grade) if "ro" in m else np.nan
        ma = df[m["math"]].map(to_grade) if "math" in m else np.nan
        avg = df[m["avg"]].map(to_grade) if "avg" in m else (ro + ma) / 2
        out["avg"], out["math"] = avg, ma
        yr = re.search(r"(20\d\d)", p)
        out["year"] = df[m["year"]] if "year" in m else (yr.group(1) if yr else "na")
        frames.append(out)
        print(f"loaded {p}: {len(out)} candidates, columns {m}")
    return pd.concat(frames, ignore_index=True)

def fit_beta(rates, weights):
    """Weighted method-of-moments Beta fit; falls back to a weak prior."""
    if len(rates) < 3: return 1.0, 1.0
    mu = np.average(rates, weights=weights)
    var = np.average((rates - mu) ** 2, weights=weights)
    mu = min(max(mu, 1e-3), 1 - 1e-3)
    if var <= 0 or var >= mu * (1 - mu): return mu * 2, (1 - mu) * 2
    k = mu * (1 - mu) / var - 1
    return mu * k, (1 - mu) * k

def build(c):
    c = c.copy()
    c["present"] = c["avg"].notna()
    c["fail"] = c["avg"] < FAIL_THRESHOLD
    c["math_fail"] = c["math"] < FAIL_THRESHOLD
    g = c.groupby(["county", "school"])
    s = g.agg(n_present=("present", "sum"), n_rows=("present", "size"),
              n_fail=("fail", "sum"), n_math_fail=("math_fail", "sum"),
              mean_avg=("avg", "mean"), years=("year", "nunique"),
              mediu=("mediu", "first")).reset_index()
    s["n_absent"] = s["n_rows"] - s["n_present"]
    s["raw_fail_rate"] = s["n_fail"] / s["n_present"].replace(0, np.nan)
    rows = []
    # prior per county x mediu when known, so a village school shrinks toward other village schools
    s["prior_group"] = s["county"] + "|" + s["mediu"].fillna("all").astype(str)
    for _, d in s.groupby("prior_group"):
        ok = d["n_present"] > 0
        a, b = fit_beta(d.loc[ok, "raw_fail_rate"].values, d.loc[ok, "n_present"].values)
        d = d.assign(prior_a=a, prior_b=b,
                     county_prior_rate=a / (a + b))
        d["fail_rate_shrunk"] = (d["n_fail"] + a) / (d["n_present"] + a + b)
        d["fail_rate_p90"] = beta.ppf(0.9, d["n_fail"] + a, d["n_present"] - d["n_fail"] + b)
        rows.append(d)
    s = pd.concat(rows)
    s["candidates_per_year"] = s["n_present"] / s["years"]
    s["need_per_year"] = s["fail_rate_shrunk"] * s["candidates_per_year"]
    s["absent_rate"] = s["n_absent"] / s["n_rows"]
    s = s.sort_values("need_per_year", ascending=False)
    s["rank_need"] = range(1, len(s) + 1)
    s["rank_rate"] = s["fail_rate_shrunk"].rank(ascending=False, method="min").astype(int)
    # placeholder for coverage join (PNRAS, Masa sanatoasa, World Vision, Teach for Romania...)
    s["coverage_programmes"] = ""
    return s

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv", nargs="+", help="per-candidate EN CSV files (globs ok)")
    ap.add_argument("--map", nargs="*", default=[], help="field=Header overrides, e.g. school='Unitatea de invatamant'")
    ap.add_argument("--rural-only", action="store_true")
    ap.add_argument("--out", default=".")
    a = ap.parse_args()
    paths = [p for g in a.csv for p in glob.glob(g)]
    overrides = dict(kv.split("=", 1) for kv in a.map)
    c = load(paths, overrides)
    s = build(c)
    if a.rural_only and s["mediu"].notna().any():
        s = s[s["mediu"].str.startswith("r", na=False)].copy()
        s["rank_need"] = range(1, len(s) + 1)
        s["rank_rate"] = s["fail_rate_shrunk"].rank(ascending=False, method="min").astype(int)
    cols = ["rank_need", "county", "school", "mediu", "years", "candidates_per_year", "n_fail", "raw_fail_rate",
            "fail_rate_shrunk", "fail_rate_p90", "county_prior_rate", "need_per_year", "absent_rate",
            "mean_avg", "rank_rate", "coverage_programmes"]
    s[cols].round(3).to_csv(f"{a.out}/schools_need_index.csv", index=False)
    cs = s.groupby("county").agg(schools=("school", "size"), need_per_year=("need_per_year", "sum"),
                                 prior_fail_rate=("county_prior_rate", "first")).sort_values("need_per_year", ascending=False)
    cs.round(3).to_csv(f"{a.out}/counties_summary.csv")
    print(s[cols].head(15).round(3).to_string(index=False))

if __name__ == "__main__":
    main()
