"""Build the website's JSON data from the SokoData master CSV files.

Run from the website folder:   python scripts/build_data.py
It reads ../data/*.csv (the folder the daily agent fills) and writes data/*.json for the site.
"""
import csv, json, os, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(HERE)
SRC = os.path.join(os.path.dirname(SITE), "data")
OUT = os.path.join(SITE, "data")

def read(name):
    path = os.path.join(SRC, name)
    if not os.path.exists(path):
        return []
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def num(v):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None

def fnum(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None

crops = [{
    "week_start": r["week_start"], "week_end": r["week_end"], "region": r["region"],
    "crop": r["crop_sw"], "price": num(r["price_tzs_per_kg"]), "previous": num(r["previous_week"]),
    "change": fnum(r["change_pct"]), "flag": r.get("flag") == "review",
} for r in read("crop_prices_master.csv")]
crop_sources = {r["week_start"]: r["source_url"] for r in read("crop_prices_master.csv")}

live = [{
    "week_start": r["week_start"], "week_end": r["week_end"], "animal": r["animal_sw"],
    "market": r["market"], "district": r["district"], "low": num(r["low_tzs"]), "high": num(r["high_tzs"]),
    "weight": r["weight_kg"],
} for r in read("livestock_prices_master.csv")]
live_sources = {r["week_start"]: r["source_url"] for r in read("livestock_prices_master.csv")}

news = [{k: r.get(k, "") for k in ["published_date", "outlet", "title", "url", "commodity",
         "region_or_market", "figure", "unit", "period_referred", "original_source_named"]}
        for r in read("news_price_mentions.csv")]

meta = {
    "built": datetime.date.today().isoformat(),
    "crop_weeks": sorted({c["week_start"] for c in crops}),
    "livestock_weeks": sorted({l["week_start"] for l in live}),
    "crop_sources": crop_sources,
    "livestock_sources": live_sources,
    "rows": {"crops": len(crops), "livestock": len(live), "news": len(news)},
}

os.makedirs(OUT, exist_ok=True)
for name, obj in [("crops", crops), ("livestock", live), ("news", news), ("meta", meta)]:
    with open(os.path.join(OUT, name + ".json"), "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(",", ":"))
print("Built:", meta["rows"], "crop weeks:", len(meta["crop_weeks"]))
