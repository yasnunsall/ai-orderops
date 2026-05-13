import json
from typing import Dict, Any
from sqlalchemy.orm import Session

from ..models import Order, Product
from .intent_detector import detect_intent
from .gemini_service import get_gemini_response


STATUS_DISPLAY = {
    "teslim_edildi": "✅ Teslim Edildi",
    "kargoda": "🚚 Kargoda",
    "hazirlaniyor": "📦 Hazırlanıyor",
    "beklemede": "⏳ Beklemede",
}


def process_message(message: str, db: Session) -> Dict[str, Any]:
    """
    Main agent entry point.
    1. Detect intent
    2. Fetch relevant data from DB
    3. Try Gemini API; fall back to deterministic template response
    """
    intent_data = detect_intent(message)
    intent = intent_data["intent"]

    if intent == "order_status":
        return _handle_order_status(message, intent_data.get("order_id"), db)

    if intent == "stock_query":
        return _handle_stock_query(message, db)

    if intent == "delayed_shipping":
        return _handle_delayed_shipping(message, db)

    if intent == "daily_summary":
        return _handle_daily_summary(message, db)

    return _handle_general_help()


# ── Intent handlers ────────────────────────────────────────────────────────────

def _handle_order_status(message: str, order_id: str, db: Session) -> Dict[str, Any]:
    order = db.query(Order).filter(Order.order_id == order_id).first()

    if not order:
        return {
            "intent": "order_status",
            "message": (
                f"❌ {order_id} numaralı sipariş sistemde bulunamadı.\n"
                "Lütfen sipariş numaranızı kontrol edin."
            ),
            "data": {},
        }

    ctx = {
        "order_id": order.order_id,
        "customer_name": order.customer_name,
        "product_name": order.product_name,
        "quantity": order.quantity,
        "order_status": order.order_status,
        "cargo_company": order.cargo_company,
        "tracking_number": order.tracking_number,
        "tracking_status": order.tracking_status,
        "estimated_delivery_date": order.estimated_delivery_date,
        "delay_risk": order.delay_risk,
    }

    text = get_gemini_response(message, json.dumps(ctx, ensure_ascii=False))
    if not text:
        text = _mock_order_response(order)

    return {"intent": "order_status", "message": text, "data": ctx}


def _handle_stock_query(message: str, db: Session) -> Dict[str, Any]:
    products = db.query(Product).all()
    critical = [p for p in products if p.stock_quantity <= p.critical_stock_threshold]

    ctx = {
        "products": [
            {
                "name": p.product_name,
                "stock": p.stock_quantity,
                "threshold": p.critical_stock_threshold,
                "supplier": p.supplier_name,
                "daily_sales": p.average_daily_sales,
                "is_critical": p.stock_quantity <= p.critical_stock_threshold,
            }
            for p in products
        ],
        "critical_count": len(critical),
    }

    text = get_gemini_response(message, json.dumps(ctx, ensure_ascii=False))
    if not text:
        text = _mock_stock_response(products, critical)

    return {"intent": "stock_query", "message": text, "data": ctx}


def _handle_delayed_shipping(message: str, db: Session) -> Dict[str, Any]:
    delayed = db.query(Order).filter(Order.delay_risk == True).all()

    ctx = {
        "delayed_orders": [
            {
                "order_id": o.order_id,
                "customer": o.customer_name,
                "product": o.product_name,
                "cargo_company": o.cargo_company,
                "tracking_status": o.tracking_status,
                "estimated_delivery": o.estimated_delivery_date,
            }
            for o in delayed
        ]
    }

    text = get_gemini_response(message, json.dumps(ctx, ensure_ascii=False))
    if not text:
        text = _mock_delay_response(delayed)

    return {"intent": "delayed_shipping", "message": text, "data": ctx}


def _handle_daily_summary(message: str, db: Session) -> Dict[str, Any]:
    orders = db.query(Order).all()
    products = db.query(Product).all()

    preparing = [o for o in orders if o.order_status == "hazirlaniyor"]
    pending = [o for o in orders if o.order_status == "beklemede"]
    in_transit = [o for o in orders if o.order_status == "kargoda"]
    delivered = [o for o in orders if o.order_status == "teslim_edildi"]
    critical_products = [p for p in products if p.stock_quantity <= p.critical_stock_threshold]
    delayed = [o for o in orders if o.delay_risk]

    ctx = {
        "total_orders": len(orders),
        "preparing_orders": len(preparing),
        "pending_orders": len(pending),
        "in_transit": len(in_transit),
        "delivered": len(delivered),
        "critical_stock_count": len(critical_products),
        "delayed_shipments": len(delayed),
        "preparing_list": [
            {"order_id": o.order_id, "customer": o.customer_name, "product": o.product_name}
            for o in preparing
        ],
        "critical_products": [
            {"name": p.product_name, "stock": p.stock_quantity, "threshold": p.critical_stock_threshold}
            for p in critical_products
        ],
        "delayed_orders": [
            {"order_id": o.order_id, "customer": o.customer_name}
            for o in delayed
        ],
    }

    text = get_gemini_response(message, json.dumps(ctx, ensure_ascii=False))
    if not text:
        text = _mock_summary_response(ctx)

    return {"intent": "daily_summary", "message": text, "data": ctx}


def _handle_general_help() -> Dict[str, Any]:
    return {
        "intent": "general_help",
        "message": (
            "Merhaba! Ben **AI OrderOps** asistanınızım. 👋\n\n"
            "Size şu konularda yardımcı olabilirim:\n\n"
            "📦 **Sipariş Sorgulama** — \"128 numaralı siparişim nerede?\"\n"
            "📊 **Stok Durumu** — \"Stok durumu nedir?\"\n"
            "🚚 **Kargo Takibi** — \"Geciken kargolar var mı?\"\n"
            "📋 **Günlük Özet** — \"Bugün ne yapmam gerekiyor?\"\n\n"
            "Nasıl yardımcı olabilirim?"
        ),
        "data": {},
    }


# ── Mock (fallback) response templates ─────────────────────────────────────────

def _mock_order_response(order) -> str:
    status = STATUS_DISPLAY.get(order.order_status, order.order_status)
    lines = [
        f"**{order.order_id} Numaralı Sipariş Bilgisi**\n",
        f"👤 **Müşteri:** {order.customer_name}",
        f"🛍️ **Ürün:** {order.product_name} (x{order.quantity})",
        f"📌 **Durum:** {status}",
    ]
    if order.cargo_company:
        lines.append(f"🏢 **Kargo Firması:** {order.cargo_company}")
    if order.tracking_number:
        lines.append(f"🔢 **Takip No:** {order.tracking_number}")
    if order.tracking_status:
        lines.append(f"📍 **Takip Durumu:** {order.tracking_status}")
    if order.estimated_delivery_date:
        lines.append(f"📅 **Tahmini Teslimat:** {order.estimated_delivery_date}")
    if order.delay_risk:
        lines.append(
            "\n⚠️ **Gecikme Riski Tespit Edildi!**\n"
            "Kargo firmasıyla iletişime geçmeniz ve müşteriyi önceden bilgilendirmeniz önerilir."
        )
    return "\n".join(lines)


def _mock_stock_response(products, critical) -> str:
    if not critical:
        lines = ["✅ Tüm ürünler yeterli stok seviyesinde.\n"]
    else:
        lines = [f"⚠️ **{len(critical)} üründe kritik stok seviyesi tespit edildi:**\n"]
        for p in critical:
            days = (
                round(p.stock_quantity / p.average_daily_sales, 1)
                if p.average_daily_sales > 0
                else "?"
            )
            lines += [
                f"🔴 **{p.product_name}**",
                f"   • Mevcut Stok: {p.stock_quantity} adet  |  Kritik Eşik: {p.critical_stock_threshold} adet",
                f"   • Tahmini Tükenme: ~{days} gün",
                f"   • Tedarikçi: {p.supplier_name}\n",
            ]
        lines.append(
            "💡 **Öneri:** Yukarıdaki ürünler için tedarikçilerinize sipariş verin.\n"
        )

    lines.append(f"**Tüm Ürün Stok Durumu ({len(products)} ürün):**\n")
    for p in products:
        icon = "🔴" if p.stock_quantity <= p.critical_stock_threshold else "🟢"
        lines.append(f"{icon} {p.product_name}: **{p.stock_quantity}** adet")

    return "\n".join(lines)


def _mock_delay_response(delayed) -> str:
    if not delayed:
        return "✅ Şu anda gecikme riski taşıyan kargo bulunmamaktadır."

    lines = [f"⚠️ **{len(delayed)} siparişte gecikme riski tespit edildi:**\n"]
    for o in delayed:
        lines += [
            f"🚨 **Sipariş #{o.order_id}** — {o.customer_name}",
            f"   • Ürün: {o.product_name}",
            f"   • Kargo: {o.cargo_company or 'Belirtilmemiş'}",
            f"   • Takip Durumu: {o.tracking_status or 'Bilgi yok'}",
            f"   • Tahmini Teslimat: {o.estimated_delivery_date or 'Belirtilmemiş'}\n",
        ]
    lines.append(
        "💡 **Önerilen Aksiyonlar:**\n"
        "1. İlgili kargo firmasını arayın.\n"
        "2. Müşterileri proaktif olarak bilgilendirin.\n"
        "3. Gerekirse yeniden gönderim planlayın."
    )
    return "\n".join(lines)


def _mock_summary_response(data: dict) -> str:
    lines = [
        "📊 **Günlük Operasyon Özeti**\n",
        f"📦 Toplam Sipariş: **{data['total_orders']}**",
        f"✅ Teslim Edildi: **{data['delivered']}**",
        f"🚚 Kargoda: **{data['in_transit']}**",
        f"🔧 Hazırlanıyor: **{data['preparing_orders']}**",
        f"⏳ Beklemede: **{data['pending_orders']}**\n",
        "---\n",
        "**🎯 Bugünün Öncelikli Görevleri:**\n",
    ]

    task_num = 1
    if data["preparing_orders"]:
        lines.append(
            f"{task_num}. 📦 **{data['preparing_orders']} sipariş kargoya hazırlanıyor**"
        )
        for o in data["preparing_list"][:3]:
            lines.append(f"   • Sipariş #{o['order_id']}: {o['customer']} — {o['product']}")
        task_num += 1

    if data["critical_stock_count"]:
        lines.append(
            f"\n{task_num}. 🔴 **{data['critical_stock_count']} üründe kritik stok seviyesi**"
        )
        for p in data["critical_products"]:
            lines.append(
                f"   • {p['name']}: {p['stock']} adet (eşik: {p['threshold']})"
            )
        task_num += 1

    if data["delayed_shipments"]:
        lines.append(
            f"\n{task_num}. ⚠️ **{data['delayed_shipments']} gecikme riski var** — müşteri bilgilendirmesi gerekli"
        )
        for o in data["delayed_orders"]:
            lines.append(f"   • Sipariş #{o['order_id']}: {o['customer']}")
        task_num += 1

    if task_num == 1:
        lines.append("✅ Bugün için kritik bir görev bulunmamaktadır. İyi çalışmalar!")

    return "\n".join(lines)
