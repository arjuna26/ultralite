import requests
import time
import re
from bs4 import BeautifulSoup
from html import escape

URL = "https://gearatlas.com/compare-gear/sleeping_pad"

SLEEP_SECONDS = 30


def fetch_html(url):
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    return resp.text


def parse_weight_grams(td):
    """
    Extracts gram value from:
    '1843 gm 65.0 oz 4.06 lb'
    """
    text = td.get_text(" ", strip=True)
    match = re.search(r"(\d+)\s*gm", text)
    return int(match.group(1)) if match else None


def parse_r_value(td):
    """
    Extracts R-value text like:
    'R 3'
    """
    text = td.get_text(" ", strip=True)
    return text if text else None


def split_brand_model(name):
    """
    Assumes: Brand Model Name
    Brand = first word
    """
    parts = name.strip().split(" ", 1)
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], parts[1]


def sql_insert(item):
    def q(val):
        return "NULL" if val is None else f"'{escape(str(val))}'"

    return f"""
INSERT INTO gear_items (
    brand,
    model,
    category,
    subcategory,
    weight_grams,
    weight_source,
    image_url,
    source,
    source_url,
    last_verified_at
) VALUES (
    {q(item['brand'])},
    {q(item['model'])},
    'sleeping_pad',
    {q(item['r_value'])},
    {item['weight_grams'] if item['weight_grams'] is not None else 'NULL'},
    {'\'manufacturer\'' if item['weight_grams'] else 'NULL'},
    {q(item['image_url'])},
    'gearatlas',
    {q(item['source_url'])},
    NOW()
)
ON CONFLICT (brand, model) DO NOTHING;
""".strip()


def main():
    html = fetch_html(URL)
    soup = BeautifulSoup(html, "html.parser")

    table = soup.find("table", class_="items")
    tbody = table.find("tbody")
    rows = tbody.find_all("tr")

    for row in rows:
        cells = row.find_all("td")
        if len(cells) < 9:
            continue

        name_cell = cells[0]
        image_cell = cells[1]
        weight_cell = cells[4]
        r_value_cell = cells[5]

        raw_name = name_cell.find("span", class_="item_name").get_text(strip=True)
        brand, model = split_brand_model(raw_name)

        img = image_cell.find("img")
        image_url = img["src"] if img else None

        weight_grams = parse_weight_grams(weight_cell)
        r_value = parse_r_value(r_value_cell)

        item = {
            "brand": brand,
            "model": model,
            "weight_grams": weight_grams,
            "r_value": r_value,
            "image_url": image_url,
            "source_url": URL
        }

        print(sql_insert(item))
        print("-- ----------------------------------------")

    print(f"-- Sleeping {SLEEP_SECONDS}s to remain polite")
    time.sleep(SLEEP_SECONDS)


if __name__ == "__main__":
    main()

