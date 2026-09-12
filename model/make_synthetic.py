# Synthetic per-candidate EN files shaped like data.gov.ro exports, for testing only.
import numpy as np, pandas as pd
rng = np.random.default_rng(7)
counties = {"ARGES": 0.25, "VASLUI": 0.45, "CLUJ": 0.15}
for year in (2024, 2025):
    rows = []
    for cty, base in counties.items():
        for i in range(40):
            rural = i >= 12
            n = rng.integers(8, 25) if rural else rng.integers(60, 180)
            p = np.clip(rng.beta(2, 2 / base) * (1.6 if rural else 0.6), 0.01, 0.95)
            for k in range(n):
                absent = rng.random() < (0.06 if rural else 0.02)
                f = rng.random() < p
                ro, ma = ((rng.uniform(2, 4.9), rng.uniform(1, 4.9)) if f else (rng.uniform(5, 10), rng.uniform(4, 10)))
                fmt = lambda x: f"{x:.2f}".replace(".", ",")
                rows.append({"Cod unic candidat": f"{cty[:2]}{year}{i}{k}", "Judet": cty,
                             "Unitatea de invatamant": f"Scoala Gimnaziala {'Sat' if rural else 'Oras'} {cty.title()} {i}",
                             "Mediu": "Rural" if rural else "Urban",
                             "Limba romana nota finala": "Absent" if absent else fmt(ro),
                             "Matematica nota finala": "Absent" if absent else fmt(ma),
                             "Media": "" if absent else fmt((ro + ma) / 2)})
    pd.DataFrame(rows).to_csv(f"synthetic_en_{year}.csv", index=False)
print("ok")
