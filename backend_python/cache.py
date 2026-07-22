"""
KawalKontrak.ai — Cache Hasil Analisis (In-Memory, TTL + LRU)
===============================================================

Kontrak yang sama (hash SHA-256 identik + locale sama) tidak perlu
dianalisis dua kali: hasilnya dikembalikan instan dari cache.

Manfaat:
  1. Hemat biaya — satu analisis = 5 panggilan Gemini; cache hit = 0 panggilan.
  2. Demo lebih mulus — contoh kontrak yang dicoba juri berulang kali
     langsung tampil tanpa menunggu pipeline.
  3. Privasi tetap terjaga — yang disimpan HANYA hash dan hasil analisis,
     bukan teks kontrak mentah.

Catatan: cache ini per-proses (hilang saat restart). Untuk multi-instance
Cloud Run, ganti dengan Redis/Memorystore — antarmukanya sudah dibuat
sederhana agar mudah ditukar.
"""

import time
from collections import OrderedDict
from typing import Any

_MAX_ENTRIES = 200
_TTL_SECONDS = 24 * 60 * 60  # 24 jam

# key: (contract_hash, locale) → (timestamp, result_dict)
_store: OrderedDict[tuple[str, str], tuple[float, dict[str, Any]]] = OrderedDict()


def get(contract_hash: str, locale: str) -> dict[str, Any] | None:
    """Ambil hasil dari cache. None jika tidak ada / kedaluwarsa."""
    key = (contract_hash, locale)
    entry = _store.get(key)
    if entry is None:
        return None

    timestamp, result = entry
    if time.time() - timestamp > _TTL_SECONDS:
        _store.pop(key, None)
        return None

    # LRU: pindahkan ke belakang (paling baru dipakai)
    _store.move_to_end(key)
    return result


def put(contract_hash: str, locale: str, result: dict[str, Any]) -> None:
    """Simpan hasil analisis yang sukses ke cache."""
    key = (contract_hash, locale)
    _store[key] = (time.time(), result)
    _store.move_to_end(key)

    # Evict entri paling lama jika melebihi kapasitas
    while len(_store) > _MAX_ENTRIES:
        _store.popitem(last=False)


def clear() -> None:
    """Kosongkan cache (dipakai oleh test)."""
    _store.clear()
