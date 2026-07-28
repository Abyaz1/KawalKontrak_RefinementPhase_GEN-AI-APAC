"""
KawalKontrak.ai — GenAI Client Factory
========================================

Modul ini bertanggung jawab membuat instance `genai.Client` yang
sesuai dengan konfigurasi environment, baik menggunakan mode 
Vertex AI maupun Gemini Developer API.
"""

import logging
from google import genai
from backend_python import config

logger = logging.getLogger(__name__)

# Cache instance client agar tidak dibuat berulang kali dalam satu lifecycle
_client_instance: genai.Client | None = None

def get_client() -> genai.Client:
    """
    Mengembalikan instance genai.Client yang sudah dikonfigurasi.
    Akan me-reuse instance yang sudah dibuat sebelumnya (Singleton).
    """
    global _client_instance
    if _client_instance is not None:
        return _client_instance

    if config.USE_VERTEXAI:
        logger.info(f"Menginisialisasi GenAI Client menggunakan Vertex AI (Project: {config.GCP_PROJECT}, Location: {config.GCP_LOCATION})")
        _client_instance = genai.Client(
            vertexai=True,
            project=config.GCP_PROJECT,
            location=config.GCP_LOCATION,
        )
    else:
        logger.info("Menginisialisasi GenAI Client menggunakan Gemini Developer API (API Key)")
        _client_instance = genai.Client(api_key=config.GEMINI_API_KEY)
        
    return _client_instance
