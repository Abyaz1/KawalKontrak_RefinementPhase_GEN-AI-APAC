"""Unit test untuk backend_python/cache.py (tanpa API key)."""

from backend_python import cache


def setup_function():
    cache.clear()


def test_roundtrip():
    cache.put("hash1", "id", {"risk_level": "HIGH"})
    assert cache.get("hash1", "id") == {"risk_level": "HIGH"}


def test_locale_is_part_of_key():
    cache.put("hash1", "id", {"lang": "id"})
    assert cache.get("hash1", "en") is None


def test_miss():
    assert cache.get("tidak-ada", "id") is None


def test_ttl_expiry(monkeypatch):
    cache.put("hash1", "id", {"x": 1})
    monkeypatch.setattr(cache, "_TTL_SECONDS", -1)
    assert cache.get("hash1", "id") is None


def test_lru_eviction(monkeypatch):
    monkeypatch.setattr(cache, "_MAX_ENTRIES", 3)
    for i in range(5):
        cache.put(f"hash{i}", "id", {"i": i})
    # Dua entri tertua harus tergusur
    assert cache.get("hash0", "id") is None
    assert cache.get("hash1", "id") is None
    assert cache.get("hash4", "id") == {"i": 4}
