"""
KawalKontrak.ai — Agents Package
=================================
Paket ini berisi semua agen AI yang membentuk pipeline analisis kontrak.

Urutan pipeline (sequential):
    extractor → legal_matcher → risk_grader → verifier → negotiator

Setiap agen:
  - Menerima input spesifik dari agen sebelumnya.
  - Memanggil Gemini API dengan Pydantic Structured Output.
  - Mengembalikan output yang sudah tervalidasi.
"""
