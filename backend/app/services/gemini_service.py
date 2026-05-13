import os
from typing import Optional


SYSTEM_PROMPT = """Sen AI OrderOps sisteminin yapay zeka asistanısın.
Küçük bir organik ürünler e-ticaret işletmesinin operasyon asistanı olarak çalışıyorsun.

KURALLAR:
1. Sadece sana verilen veritabanı verilerini kullan. Asla tahmin etme veya uydurma.
2. Her zaman Türkçe yanıt ver.
3. Kısa, net ve profesyonel ol.
4. Emoji kullanabilirsin (ölçülü).
5. Eğer istenen veri mevcut değilse "Bu konuda bilgi bulunamadı." de.
6. Markdown formatı kullanabilirsin (**kalın**, madde listesi vb.)."""


def get_gemini_response(user_message: str, context_json: str) -> Optional[str]:
    """
    Call Gemini API with the user message and relevant DB context.
    Returns None if API key is missing or call fails — caller uses mock fallback.
    """
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        return None

    try:
        from google import genai  # new unified SDK

        client = genai.Client(api_key=api_key)

        full_prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"Veritabanı verileri (JSON):\n{context_json}\n\n"
            f"Kullanıcı sorusu: {user_message}\n\n"
            "Yanıt:"
        )

        response = client.models.generate_content(
            model="models/gemini-2.5-flash",
            contents=full_prompt,
        )
        return response.text

    except Exception:
        return None
