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

Google ADK Integration:
  - kawal_kontrak/ — ADK agent directory (entry point untuk adk api_server)
  - kawal_kontrak/agent.py — root_agent definition
  - kawal_kontrak/tools.py — pipeline sebagai ADK FunctionTool
"""
