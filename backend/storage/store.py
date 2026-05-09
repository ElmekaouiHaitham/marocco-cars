import json, os

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

def _path(filename):
    os.makedirs(DATA_DIR, exist_ok=True)
    return os.path.join(DATA_DIR, filename)

def load(filename):
    p = _path(filename)
    if not os.path.exists(p):
        return []
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)

def save(filename, data):
    with open(_path(filename), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def append(filename, item):
    existing = load(filename)
    existing.append(item)
    save(filename, existing)

def exists_id(filename, listing_id):
    return any(l.get("id") == listing_id for l in load(filename))
