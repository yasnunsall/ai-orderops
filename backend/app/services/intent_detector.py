import re
from typing import Optional, Dict, Any

ORDER_KEYWORDS = [
    "sipariş", "siparişim", "kargom", "paket", "paketim",
    "nerede", "ne zaman", "geldi mi", "gelecek mi", "teslim",
    "takip", "durumu nedir", "bilgi ver",
]
STOCK_KEYWORDS = [
    "stok", "stokta", "envanter", "tükendi", "depo",
    "mevcut miktar", "kaç adet", "ürün sayısı",
]
DELAY_KEYWORDS = [
    "gecik", "gecikmeli", "gelmedi", "neden gelmedi",
    "ulaşmadı", "kargo sorunu", "geç kalıyor",
    "gecikiyor", "gecikti",
]
SUMMARY_KEYWORDS = [
    "bugün", "yapmam", "gerekiyor", "yapmalıyım", "özet",
    "günlük", "ne yapayım", "durum raporu", "rapor", "öncelik",
    "sabah", "işler", "görevler",
]


def extract_order_number(message: str) -> Optional[str]:
    """Extract a 2–6 digit order number from user message."""
    patterns = [
        r"(?:sipariş|order|no|numaralı|#)\s*[:#]?\s*(\d{2,6})",
        r"\b(\d{3,6})\b",
    ]
    for pattern in patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def detect_intent(message: str) -> Dict[str, Any]:
    """
    Classify user message into one of five intents:
      order_status | stock_query | delayed_shipping | daily_summary | general_help
    Returns dict with 'intent' and optional 'order_id'.
    """
    message_lower = message.lower()
    order_number = extract_order_number(message)

    # Explicit order query with order number
    if order_number and any(kw in message_lower for kw in ORDER_KEYWORDS):
        return {"intent": "order_status", "order_id": order_number}

    # Bare number + implicit order context words
    if order_number and any(
        kw in message_lower for kw in ["nerede", "ne oldu", "durumu", "takip", "geldi", "ne zaman"]
    ):
        return {"intent": "order_status", "order_id": order_number}

    # Check delay before stock — delay queries often contain generic words
    if any(kw in message_lower for kw in DELAY_KEYWORDS):
        return {"intent": "delayed_shipping", "order_id": None}

    if any(kw in message_lower for kw in STOCK_KEYWORDS):
        return {"intent": "stock_query", "order_id": None}

    if any(kw in message_lower for kw in SUMMARY_KEYWORDS):
        return {"intent": "daily_summary", "order_id": None}

    # Fallback: if message contains only a number, treat as order query
    if order_number:
        return {"intent": "order_status", "order_id": order_number}

    return {"intent": "general_help", "order_id": None}
