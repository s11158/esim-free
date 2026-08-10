# Builds public/data/catalog.csv from the eSIMerge wholesale catalog.
# Usage: python scripts/build_catalog.py  (reads key from ../esim-free-shop/.env)
import csv, json, os, subprocess, sys

ENV_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "esim-free-shop", ".env")
BASE = "https://portal.esimerge.com/api/public/v1"
SAR_TO_USD = 0.2667

def api_key():
    with open(ENV_PATH, encoding="utf-8") as f:
        for line in f:
            if line.startswith("ESIMERGE_LIVE_KEY="):
                return line.split("=", 1)[1].strip()
    sys.exit("ESIMERGE_LIVE_KEY not found")

def fetch(url, key):
    # urllib is blocked by the API's bot filter; curl passes.
    out = subprocess.run(
        ["curl", "-s", "-H", "Authorization: Bearer " + key, url],
        capture_output=True, timeout=120, check=True,
    ).stdout
    return json.loads(out)

def main():
    key = api_key()
    plans, offset = [], 0
    while True:
        page = fetch(f"{BASE}/catalog?limit=1000&offset={offset}", key).get("data", [])
        if not page:
            break
        plans.extend(page)
        if len(page) < 1000:
            break
        offset += 1000
    out = os.path.join(os.path.dirname(__file__), "..", "public", "data", "catalog.csv")
    n_min = n_sms = 0
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["id", "scope", "dest_code", "dest_name", "gb", "days",
                    "price_usd", "unlimited", "minutes", "sms", "coverage"])
        for p in plans:
            price = p.get("price_usd")
            if price is None:
                price = round(p["price_sar"] * SAR_TO_USD, 2)
            if not price or price <= 0:
                continue
            unlimited = p.get("type") == "unlimited"
            gb = round((p.get("data_mb") or 0) / 1024, 2)
            cov = "|".join(c["country_code"] for c in p.get("coverage") or [] if c.get("country_code"))
            if p.get("minutes"):
                n_min += 1
            if p.get("sms"):
                n_sms += 1
            w.writerow([
                p["id"], p["scope"], p.get("destination_code") or "",
                p.get("destination_name") or p.get("country_name") or "",
                gb, p.get("validity_days") or 0, price,
                "yes" if unlimited else "no",
                p.get("minutes") or "", p.get("sms") or "", cov,
            ])
    print(f"total {len(plans)} plans, with minutes {n_min}, with sms {n_sms}")
    print("written", os.path.abspath(out))

if __name__ == "__main__":
    main()
